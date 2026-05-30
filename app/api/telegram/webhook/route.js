import { NextResponse } from 'next/server';
import { getUserById, getSettings, updateTelegramChatId, getSettingsByTelegramChatId, updateDailyStatusHour, updatePeriodDelay, updateLastPeriodStart, getTelegramConnectToken, deleteTelegramConnectToken, isPremium, checkAndRecordRateLimit } from '@/lib/db';
import { sendTelegramMessage, sendInvoice, answerPreCheckoutQuery, answerCallbackQuery, editMessageText, escapeHtml } from '@/lib/telegram';
import { getCurrentPhase } from '@/lib/cycle-engine';

export async function POST(request) {
  try {
    // Verify webhook secret token — fail closed
    const webhookSecret = process.env.TELEGRAM_WEBHOOK_SECRET;
    if (!webhookSecret) {
      console.error('TELEGRAM_WEBHOOK_SECRET not configured');
      return NextResponse.json({ error: 'Webhook not configured' }, { status: 500 });
    }
    const secretToken = request.headers.get('x-telegram-bot-api-secret-token') || '';
    const a = new TextEncoder().encode(secretToken);
    const b = new TextEncoder().encode(webhookSecret);
    if (a.byteLength !== b.byteLength || !crypto.subtle.timingSafeEqual(a, b)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const update = await request.json();

    // Handle pre_checkout_query — must respond within 10 seconds
    if (update.pre_checkout_query) {
      await answerPreCheckoutQuery(update.pre_checkout_query.id, true);
      return NextResponse.json({ ok: true });
    }

    // Handle callback_query (inline button presses)
    if (update.callback_query) {
      const cb = update.callback_query;
      const cbChatId = cb.message?.chat?.id;
      const cbMessageId = cb.message?.message_id;
      const cbData = cb.data;

      // Donate buttons
      const VALID_DONATE_AMOUNTS = [1, 5, 10, 25, 50, 100];
      if (cbData?.startsWith('donate_') && cbChatId) {
        const amount = parseInt(cbData.split('_')[1], 10);
        if (VALID_DONATE_AMOUNTS.includes(amount)) {
          await sendInvoice(cbChatId, {
            title: `Donate ${amount} Star${amount > 1 ? 's' : ''}`,
            description: 'Support Red Zone development. Your donation helps us keep building tools that strengthen partnerships.',
            payload: `donation_${amount}_${Date.now()}`,
            amount,
          });
        }
        await answerCallbackQuery(cb.id);
        return NextResponse.json({ ok: true });
      }

      // Period Started button
      if (cbData === 'started_today' && cbChatId) {
        const settings = await getSettingsByTelegramChatId(String(cbChatId));
        if (settings) {
          const userTz = settings.timezone || 'UTC';
          const dateStr = new Date().toLocaleDateString('en-CA', { timeZone: userTz });
          await updateLastPeriodStart(settings.userId, dateStr);
          const { phase, prediction } = getCurrentPhase(dateStr, settings.cycleLength, settings.periodDuration, userTz, 0);
          const formattedDate = new Date(dateStr + 'T12:00:00Z').toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

          // Update the original message to show confirmation
          await editMessageText(cbChatId, cbMessageId,
            '🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴\n\n' +
            `✅ <b>Period started: ${formattedDate}</b>\n\n` +
            '━━━━━━━━━━━━━━━━━━━━\n\n' +
            `Current phase: <b>${phase}</b>\n` +
            `📅 Next period: <b>${prediction.nextPeriodStart}</b>\n` +
            `🟡 Next context zone: <b>${prediction.contextZoneStart}</b>\n` +
            `🟢 Next ovulation: <b>${prediction.ovulationDate}</b>\n\n` +
            '<i>Calendar and delay have been reset.</i>',
            { reply_markup: { inline_keyboard: [[{ text: '↩️ Undo', callback_data: `undo_started_${settings.lastPeriodStart}_${settings.periodDelay || 0}` }]] } }
          );
          await answerCallbackQuery(cb.id, 'Period start recorded!');
        } else {
          await answerCallbackQuery(cb.id, 'Account not connected. Use /start first.', true);
        }
        return NextResponse.json({ ok: true });
      }

      // Delayed +1 button
      if (cbData === 'delayed_plus1' && cbChatId) {
        const settings = await getSettingsByTelegramChatId(String(cbChatId));
        if (settings) {
          const newDelay = (settings.periodDelay || 0) + 1;
          await updatePeriodDelay(settings.userId, newDelay);
          const { prediction } = getCurrentPhase(settings.lastPeriodStart, settings.cycleLength, settings.periodDuration, settings.timezone || null, newDelay);

          let replyText;
          if (newDelay > 4) {
            replyText =
              '🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴\n\n' +
              `⚠️ <b>Significant Delay: ${newDelay} days</b>\n\n` +
              '━━━━━━━━━━━━━━━━━━━━\n' +
              '🤰 <b>RECOMMENDATION</b>\n' +
              '━━━━━━━━━━━━━━━━━━━━\n\n' +
              `${escapeHtml(settings.partnerName) || 'Your partner'}'s period is <b>${newDelay} days</b> late.\n\n` +
              '🧪 <b>Consider taking a pregnancy test</b>\n\n' +
              `📅 New expected date: <b>${prediction.nextPeriodStart}</b>`;
          } else {
            replyText =
              '🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡\n\n' +
              `⏳ <b>Period delayed: +${newDelay} day${newDelay > 1 ? 's' : ''}</b>\n\n` +
              '━━━━━━━━━━━━━━━━━━━━\n\n' +
              `${escapeHtml(settings.partnerName) || 'Your partner'}'s period pushed by <b>${newDelay} day${newDelay > 1 ? 's' : ''}</b>.\n` +
              `📅 New expected date: <b>${prediction.nextPeriodStart}</b>`;
          }

          await editMessageText(cbChatId, cbMessageId, replyText, {
            reply_markup: {
              inline_keyboard: [
                [
                  { text: '🔴 Period Started', callback_data: 'started_today' },
                  { text: `⏳ Delay Again (+${newDelay + 1})`, callback_data: 'delayed_plus1' },
                ],
                [
                  { text: '↩️ Reset Delay', callback_data: 'delayed_reset' },
                ],
              ],
            },
          });
          await answerCallbackQuery(cb.id, `Delayed +${newDelay} day${newDelay > 1 ? 's' : ''}`);
        } else {
          await answerCallbackQuery(cb.id, 'Account not connected.', true);
        }
        return NextResponse.json({ ok: true });
      }

      // Reset delay button
      if (cbData === 'delayed_reset' && cbChatId) {
        const settings = await getSettingsByTelegramChatId(String(cbChatId));
        if (settings) {
          await updatePeriodDelay(settings.userId, 0);
          const { prediction } = getCurrentPhase(settings.lastPeriodStart, settings.cycleLength, settings.periodDuration, settings.timezone || null, 0);
          await editMessageText(cbChatId, cbMessageId,
            '✅ <b>Delay cleared</b>\n\n' +
            `Period predictions reset to normal.\nNext period expected: <b>${prediction.nextPeriodStart}</b>`,
            { reply_markup: { inline_keyboard: [] } }
          );
          await answerCallbackQuery(cb.id, 'Delay reset!');
        }
        return NextResponse.json({ ok: true });
      }

      // Undo started button
      if (cbData?.startsWith('undo_started_') && cbChatId) {
        const parts = cbData.split('_');
        const prevDate = parts[2]; // previous lastPeriodStart
        const prevDelay = Math.max(0, Math.min(parseInt(parts[3]) || 0, 60));
        // Validate date format to prevent injection from tampered callback_data
        if (!/^\d{4}-\d{2}-\d{2}$/.test(prevDate) || isNaN(new Date(prevDate + 'T12:00:00Z').getTime())) {
          await answerCallbackQuery(cb.id, 'Invalid date data.', true);
          return NextResponse.json({ ok: true });
        }
        const settings = await getSettingsByTelegramChatId(String(cbChatId));
        if (settings && prevDate) {
          await updateLastPeriodStart(settings.userId, prevDate);
          if (prevDelay > 0) await updatePeriodDelay(settings.userId, prevDelay);
          const { phase, prediction } = getCurrentPhase(prevDate, settings.cycleLength, settings.periodDuration, settings.timezone || null, prevDelay);
          await editMessageText(cbChatId, cbMessageId,
            `↩️ <b>Undone</b> — restored previous period start.\n\n` +
            `Current phase: <b>${phase}</b>\n` +
            `📅 Next period: <b>${prediction.nextPeriodStart}</b>`,
            {
              reply_markup: {
                inline_keyboard: [
                  [
                    { text: '🔴 Period Started', callback_data: 'started_today' },
                    { text: '⏳ Delayed', callback_data: 'delayed_plus1' },
                  ],
                ],
              },
            }
          );
          await answerCallbackQuery(cb.id, 'Undone!');
        }
        return NextResponse.json({ ok: true });
      }

      // Full status button
      if (cbData === 'full_status' && cbChatId) {
        const settings = await getSettingsByTelegramChatId(String(cbChatId));
        if (settings) {
          const userTz = settings.timezone || 'UTC';
          const { phase, isContextZone, isBadMood, advice, prediction } = getCurrentPhase(
            settings.lastPeriodStart, settings.cycleLength, settings.periodDuration, userTz, settings.periodDelay || 0
          );
          const todayStr = new Date().toLocaleDateString('en-CA', { timeZone: userTz });
          const todayMs = new Date(todayStr + 'T12:00:00Z').getTime();
          const startMs = new Date(prediction.lastPeriodStart + 'T12:00:00Z').getTime();
          const diffDays = Math.round((todayMs - startMs) / (1000 * 60 * 60 * 24)) + 1;
          const dayOfCycle = ((diffDays - 1) % settings.cycleLength) + 1;

          let statusEmoji = '🟢';
          if (isContextZone) statusEmoji = '🔴';
          else if (isBadMood) statusEmoji = '🟠';

          const fullStatus =
            `${statusEmoji} <b>${phase}</b>${isBadMood ? ' ⚠️' : ''}\n\n` +
            `📊 <b>Cycle Day:</b> ${dayOfCycle} of ${settings.cycleLength}\n` +
            `${settings.periodDelay ? `⏳ <b>Delay:</b> +${settings.periodDelay} days\n` : ''}` +
            `📅 <b>Next Period:</b> ${prediction.nextPeriodStart}\n` +
            `🟡 <b>Context Zone:</b> ${prediction.contextZoneStart}\n` +
            `🟢 <b>Ovulation:</b> ${prediction.ovulationDate}\n\n` +
            `💡 ${escapeHtml(advice)}`;

          await sendTelegramMessage(cbChatId, fullStatus);
          await answerCallbackQuery(cb.id);
        }
        return NextResponse.json({ ok: true });
      }

      // Fallback — acknowledge unknown callback
      await answerCallbackQuery(cb.id);
      return NextResponse.json({ ok: true });
    }

    // Handle successful payment
    const message = update.message;
    if (message?.successful_payment) {
      const payment = message.successful_payment;
      const chatId = message.chat.id;
      await sendTelegramMessage(
        chatId,
        `🌟 <b>Thank you for your generous donation!</b>\n\n` +
        `You donated <b>${payment.total_amount} Star${payment.total_amount > 1 ? 's' : ''}</b>.\n\n` +
        `Your support keeps Red Zone running and helps us build better tools for partners everywhere. We truly appreciate it! 💛`
      );
      return NextResponse.json({ ok: true });
    }

    if (!message || !message.text) {
      return NextResponse.json({ ok: true });
    }

    const chatId = message.chat.id;
    const text = message.text.trim().toLowerCase();

    // Handle /start <connectToken> command (but not /started)
    if (text === '/start' || text.startsWith('/start ')) {
      const parts = message.text.trim().split(' ');
      const connectToken = parts[1] || null;

      if (!connectToken) {
        await sendTelegramMessage(chatId, 'Welcome to Partnership Harmony! To connect your account, use the link from your Settings page.');
        return NextResponse.json({ ok: true });
      }

      // Look up the connect token (cryptographically random, short-lived)
      const tokenRecord = await getTelegramConnectToken(connectToken);
      if (!tokenRecord) {
        await sendTelegramMessage(chatId, 'This link has expired or is invalid. Please get a new connect link from your Settings page.');
        return NextResponse.json({ ok: true });
      }

      // Consume the token immediately to prevent race condition reuse
      await deleteTelegramConnectToken(connectToken);

      const userId = tokenRecord.userId;
      const user = await getUserById(userId);
      if (!user) {
        await sendTelegramMessage(chatId, 'Account not found. Please try again from your Settings page.');
        return NextResponse.json({ ok: true });
      }
      await updateTelegramChatId(userId, String(chatId));

      // Fetch settings for welcome message
      const settings = await getSettings(userId);

      const partnerName = escapeHtml(settings?.partnerName) || 'Not set';
      const lastPeriod = settings?.lastPeriodStart
        ? new Date(settings.lastPeriodStart).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
        : 'Not set';
      const cycleLen = settings?.cycleLength || 28;
      const periodLen = settings?.periodDuration || 5;

      const welcome =
        `🎉 <b>Welcome to Partnership Harmony!</b>\n\n` +
        `Account connected for <b>${user.name}</b>\n\n` +
        `━━━━━━━━━━━━━━━━━━\n` +
        `👤 <b>Partner:</b> ${partnerName}\n` +
        `📅 <b>Last Period:</b> ${lastPeriod}\n` +
        `🔄 <b>Cycle Length:</b> ${cycleLen} days\n` +
        `⏱ <b>Period Duration:</b> ${periodLen} days\n` +
        `━━━━━━━━━━━━━━━━━━\n\n` +
        `📖 <b>User Manual</b>\n\n` +
        `<b>Commands:</b>\n` +
        `• <b>today's status</b> — Current phase, cycle day & advice\n` +
        `• <b>/status</b> — Same as above\n` +
        `• <b>/delayed</b> — Report or check period delay\n` +
        `• <b>/daily HH:MM</b> — Get daily updates at your preferred time\n` +
        `• <b>/daily off</b> — Stop daily updates\n` +
        `• <b>/daily</b> — Check your current schedule\n\n` +
        `<b>What you'll receive:</b>\n` +
        `🔴 <b>Context Zone Alerts</b> — Automatic notifications when your partner enters the luteal phase. Be extra supportive!\n` +
        `🟠 <b>Bad Mood Warnings</b> — Heads up for the days around period start\n` +
        `🟢 <b>All Clear</b> — Calm phases, great for active plans\n\n` +
        `<b>Phase Guide:</b>\n` +
        `• <b>Menstruation</b> — Comfort is key. Heating pads, chocolate, and rest.\n` +
        `• <b>Follicular Phase</b> — Things are calm. Great time for active dates.\n` +
        `• <b>Ovulation Window</b> — Energy is high. Good for planning & socializing.\n` +
        `• <b>Luteal Phase (Context Zone)</b> — ⚠️ Be patient, avoid heavy debates, offer snacks.\n\n` +
        `💡 <i>Tip: Set up daily updates with /daily 09:00 (your local time) to stay ahead of the curve!</i>`;

      const miniAppUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'https://redzonecouple.site'}/miniapp`;

      await sendTelegramMessage(chatId, welcome, {
        reply_markup: {
          inline_keyboard: [[
            { text: '📊 Open Dashboard', web_app: { url: miniAppUrl } }
          ]]
        }
      });

      return NextResponse.json({ ok: true });
    }

    // Handle "today's status" command
    if (text === "today's status" || text === 'todays status' || text === '/status') {
      const settings = await getSettingsByTelegramChatId(String(chatId));

      if (!settings) {
        await sendTelegramMessage(chatId, 'Your account is not connected yet. Use the link from your Settings page to connect.');
        return NextResponse.json({ ok: true });
      }

      const userTimezone = settings.timezone || null;
      const { phase, isContextZone, isBadMood, advice, prediction } = getCurrentPhase(
        settings.lastPeriodStart,
        settings.cycleLength,
        settings.periodDuration,
        userTimezone,
        settings.periodDelay || 0
      );

      // Calculate day of cycle using prediction's resolved start date
      const todayMs = new Date(prediction.currentDate + 'T12:00:00Z').getTime();
      const startMs = new Date(prediction.lastPeriodStart + 'T12:00:00Z').getTime();
      const diffDays = Math.round((todayMs - startMs) / (1000 * 60 * 60 * 24)) + 1;
      const dayOfCycle = ((diffDays - 1) % settings.cycleLength) + 1;

      let statusEmoji = '🟢';
      if (isContextZone) statusEmoji = '🔴';
      else if (isBadMood) statusEmoji = '🟠';

      const reply =
        `${statusEmoji} <b>Today's Status</b>\n\n` +
        `<b>Phase:</b> ${phase}${isBadMood ? ' 😈' : ''}\n` +
        `<b>Cycle Day:</b> ${dayOfCycle} of ${settings.cycleLength}\n\n` +
        `<b>Advice:</b>\n${escapeHtml(advice)}`;

      await sendTelegramMessage(chatId, reply);
      return NextResponse.json({ ok: true });
    }

    // Handle /daily command — subscribe to daily status at a preferred time
    if (text.startsWith('/daily')) {
      const settings = await getSettingsByTelegramChatId(String(chatId));

      if (!settings) {
        await sendTelegramMessage(chatId, 'Your account is not connected yet. Use the link from your Settings page to connect.');
        return NextResponse.json({ ok: true });
      }

      let userTz = 'UTC';
      if (settings.timezone) {
        try { Intl.DateTimeFormat(undefined, { timeZone: settings.timezone }); userTz = settings.timezone; }
        catch { /* invalid timezone, fall back to UTC */ }
      }

      // Helper: convert UTC hour back to local hour for display
      function utcHourToLocal(utcHour, tz) {
        try {
          // Create a date at that UTC hour
          const d = new Date(Date.UTC(2026, 0, 1, utcHour, 0, 0));
          const localStr = new Intl.DateTimeFormat('en-GB', { timeZone: tz, hour: '2-digit', minute: '2-digit', hour12: false }).format(d);
          return localStr;
        } catch { return `${String(utcHour).padStart(2, '0')}:00 UTC`; }
      }

      // Helper: convert local hour to UTC hour
      function localHourToUtc(localHour, tz) {
        try {
          // Find UTC hour that corresponds to localHour in tz
          // Create a reference date and check what UTC hour maps to the desired local hour
          const refDate = new Date(Date.UTC(2026, 0, 1, 0, 0, 0));
          for (let utcH = 0; utcH < 24; utcH++) {
            const d = new Date(Date.UTC(2026, 0, 1, utcH, 0, 0));
            const parts = new Intl.DateTimeFormat('en-GB', { timeZone: tz, hour: 'numeric', hour12: false }).formatToParts(d);
            const hourPart = parts.find(p => p.type === 'hour');
            if (!hourPart) return localHour;
            const h = parseInt(hourPart.value, 10);
            if (h === localHour) return utcH;
          }
          return localHour; // fallback
        } catch { return localHour; }
      }

      const arg = message.text.trim().split(/\s+/)[1]?.toLowerCase();

      // /daily off — unsubscribe
      if (arg === 'off' || arg === 'stop') {
        await updateDailyStatusHour(settings.userId, null);
        await sendTelegramMessage(chatId, '🔕 Daily status updates disabled.');
        return NextResponse.json({ ok: true });
      }

      // /daily (no arg) — show current setting
      if (!arg) {
        if (settings.dailyStatusHour !== null && settings.dailyStatusHour !== undefined) {
          const localTime = utcHourToLocal(settings.dailyStatusHour, userTz);
          await sendTelegramMessage(
            chatId,
            `🔔 Daily status is active at <b>${localTime}</b> (${userTz}).\n\nUse <b>/daily HH:MM</b> to change or <b>/daily off</b> to disable.`
          );
        } else {
          await sendTelegramMessage(
            chatId,
            `🔕 Daily status is not active.\n\nUse <b>/daily HH:MM</b> to set a time (your timezone: ${userTz}).\nExample: <b>/daily 09:00</b>`
          );
        }
        return NextResponse.json({ ok: true });
      }

      // /daily HH:MM or /daily H — parse hour
      const timeMatch = arg.match(/^(\d{1,2})(?::(\d{2}))?$/);
      if (!timeMatch) {
        await sendTelegramMessage(
          chatId,
          '❌ Invalid time format.\n\nUse <b>/daily HH:MM</b> (24h format).\nExamples: <b>/daily 09:00</b>, <b>/daily 18:00</b>'
        );
        return NextResponse.json({ ok: true });
      }

      // Membership gate: daily status is a member feature
      const hasMembership = await isPremium(settings.userId);
      if (!hasMembership) {
        await sendTelegramMessage(
          chatId,
          '⭐ <b>Member Feature</b>\n\nDaily status updates are available for members.\n\nBecome a member at:\nhttps://ko-fi.com/denissalmon/tiers\n\n<i>Use the same email you registered with on RedZone.</i>'
        );
        return NextResponse.json({ ok: true });
      }

      const localHour = parseInt(timeMatch[1], 10);
      if (localHour < 0 || localHour > 23) {
        await sendTelegramMessage(chatId, '❌ Hour must be between 0 and 23.');
        return NextResponse.json({ ok: true });
      }

      const utcHour = localHourToUtc(localHour, userTz);
      await updateDailyStatusHour(settings.userId, utcHour);
      const formatted = `${String(localHour).padStart(2, '0')}:00`;
      await sendTelegramMessage(
        chatId,
        `🔔 Daily status enabled! You'll receive an update every day at <b>${formatted}</b> (${userTz}).\n\nUse <b>/daily off</b> to disable.`
      );
      return NextResponse.json({ ok: true });
    }

    // Handle /started command — mark period start date
    if (text.startsWith('/started')) {
      // Rate limit: 10 /started commands per chat per hour
      const allowed = await checkAndRecordRateLimit(`tg:started:${chatId}`, 10, 3600);
      if (!allowed) {
        await sendTelegramMessage(chatId, '⏳ Too many updates. Please wait before trying again.');
        return NextResponse.json({ ok: true });
      }

      const settings = await getSettingsByTelegramChatId(String(chatId));

      if (!settings) {
        await sendTelegramMessage(chatId, 'Your account is not connected yet. Use the link from your Settings page to connect.');
        return NextResponse.json({ ok: true });
      }

      const arg = message.text.trim().split(/\s+/)[1];
      let dateStr;

      if (!arg || arg === 'today') {
        // /started or /started today — use today's date in user's timezone
        const userTz = settings.timezone || 'UTC';
        const now = new Date();
        dateStr = now.toLocaleDateString('en-CA', { timeZone: userTz }); // YYYY-MM-DD
      } else if (arg === 'yesterday') {
        const userTz = settings.timezone || 'UTC';
        const now = new Date();
        now.setDate(now.getDate() - 1);
        dateStr = now.toLocaleDateString('en-CA', { timeZone: userTz });
      } else {
        // /started 2026-03-25 — explicit date
        if (!/^\d{4}-\d{2}-\d{2}$/.test(arg) || isNaN(new Date(arg + 'T12:00:00Z').getTime())) {
          await sendTelegramMessage(
            chatId,
            '❌ Invalid date format.\n\nUsage:\n• <b>/started</b> — period started today\n• <b>/started yesterday</b> — started yesterday\n• <b>/started 2026-03-25</b> — specific date (YYYY-MM-DD)'
          );
          return NextResponse.json({ ok: true });
        }
        dateStr = arg;
      }

      await updateLastPeriodStart(settings.userId, dateStr);

      // Get updated prediction
      const { phase, prediction } = getCurrentPhase(
        dateStr,
        settings.cycleLength,
        settings.periodDuration,
        settings.timezone || null,
        0
      );

      const formattedDate = new Date(dateStr + 'T12:00:00Z').toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

      await sendTelegramMessage(
        chatId,
        '🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴\n\n' +
        `✅ <b>Period started: ${formattedDate}</b>\n\n` +
        '━━━━━━━━━━━━━━━━━━━━\n\n' +
        `Current phase: <b>${phase}</b>\n` +
        `📅 Next period: <b>${prediction.nextPeriodStart}</b>\n` +
        `🟡 Next context zone: <b>${prediction.contextZoneStart}</b>\n` +
        `🟢 Next ovulation: <b>${prediction.ovulationDate}</b>\n\n` +
        '<i>Calendar and delay have been reset.</i>'
      );
      return NextResponse.json({ ok: true });
    }

    // Handle /delayed command — report period delay
    if (text.startsWith('/delayed')) {
      const settings = await getSettingsByTelegramChatId(String(chatId));

      if (!settings) {
        await sendTelegramMessage(chatId, 'Your account is not connected yet. Use the link from your Settings page to connect.');
        return NextResponse.json({ ok: true });
      }

      const currentDelay = settings.periodDelay || 0;
      const arg = message.text.trim().split(/\s+/)[1];

      let delayDays;

      if (arg === 'reset' || arg === '0') {
        // /delayed reset — clear delay
        delayDays = 0;
      } else if (arg) {
        // /delayed 3 — set exact delay
        delayDays = parseInt(arg, 10);
      } else {
        // /delayed (no arg) — add +1 day to current delay ("not today" button)
        delayDays = currentDelay + 1;
      }

      if (isNaN(delayDays) || delayDays < 0 || delayDays > 60) {
        await sendTelegramMessage(
          chatId,
          '❌ Invalid input.\n\nUsage:\n• <b>/delayed</b> — push period start by 1 more day\n• <b>/delayed 3</b> — set delay to 3 days\n• <b>/delayed reset</b> — clear delay'
        );
        return NextResponse.json({ ok: true });
      }

      // Save delay to DB so it affects calendar predictions
      await updatePeriodDelay(settings.userId, delayDays);

      // Get updated prediction with the new delay
      const { prediction } = getCurrentPhase(
        settings.lastPeriodStart,
        settings.cycleLength,
        settings.periodDuration,
        settings.timezone || null,
        delayDays
      );

      if (delayDays === 0) {
        await sendTelegramMessage(
          chatId,
          '✅ <b>Delay cleared</b>\n\n' +
          `Period predictions reset to normal.\nNext period expected: <b>${prediction.nextPeriodStart}</b>`
        );
        return NextResponse.json({ ok: true });
      }

      let reply;

      if (delayDays > 4) {
        reply =
          '🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴\n\n' +
          `⚠️ <b>Significant Delay: ${delayDays} days</b>\n\n` +
          '━━━━━━━━━━━━━━━━━━━━\n' +
          '🤰 <b>RECOMMENDATION</b>\n' +
          '━━━━━━━━━━━━━━━━━━━━\n\n' +
          `${escapeHtml(settings.partnerName) || 'Your partner'}'s period is <b>${delayDays} days</b> past the expected date.\n\n` +
          'A delay of more than 4 days can have several causes:\n\n' +
          '  🧪  <b>Take a pregnancy test</b> — This is the most important step\n' +
          '  😰  Stress can delay cycles by days or weeks\n' +
          '  🏋️  Intense exercise or weight changes\n' +
          '  💊  Medication or hormonal changes\n' +
          '  🤒  Recent illness\n\n' +
          '━━━━━━━━━━━━━━━━━━━━\n' +
          '💡 <b>What to do:</b>\n' +
          '━━━━━━━━━━━━━━━━━━━━\n\n' +
          '  1️⃣  Get a home pregnancy test (best with morning urine)\n' +
          '  2️⃣  Stay calm — delays happen for many reasons\n' +
          '  3️⃣  If negative, retest in 3 days if period hasn\'t started\n' +
          '  4️⃣  See a doctor if delay exceeds 10 days\n\n' +
          `📅 New expected date: <b>${prediction.nextPeriodStart}</b>\n\n` +
          '<i>Use /delayed again to add another day, or /delayed reset to clear.</i>';
      } else {
        reply =
          '🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡\n\n' +
          `⏳ <b>Period delayed: +${delayDays} day${delayDays > 1 ? 's' : ''}</b>\n\n` +
          '━━━━━━━━━━━━━━━━━━━━\n\n' +
          `${escapeHtml(settings.partnerName) || 'Your partner'}'s period pushed by <b>${delayDays} day${delayDays > 1 ? 's' : ''}</b>.\n` +
          `📅 New expected date: <b>${prediction.nextPeriodStart}</b>\n\n` +
          'Tap <b>/delayed</b> again tomorrow if it still hasn\'t started.\n' +
          'Use <b>/delayed reset</b> when the period arrives.\n\n' +
          '<i>Calendar predictions have been updated.</i>';
      }

      await sendTelegramMessage(chatId, reply);
      return NextResponse.json({ ok: true });
    }

    // Handle /donate command
    if (text.startsWith('/donate')) {
      const arg = message.text.trim().split(/\s+/)[1];
      const amount = arg ? parseInt(arg, 10) : 0;

      const VALID_AMOUNTS = [1, 5, 10, 25, 50, 100];
      if (!amount || isNaN(amount) || !VALID_AMOUNTS.includes(amount)) {
        await sendTelegramMessage(
          chatId,
          '⭐ <b>Support Red Zone</b>\n\n' +
          'Choose how many Stars to donate:\n\n',
          {
            reply_markup: {
              inline_keyboard: [
                [
                  { text: '⭐ 1 Star', callback_data: 'donate_1' },
                  { text: '⭐ 5 Stars', callback_data: 'donate_5' },
                  { text: '⭐ 10 Stars', callback_data: 'donate_10' },
                ],
                [
                  { text: '⭐ 25 Stars', callback_data: 'donate_25' },
                  { text: '⭐ 50 Stars', callback_data: 'donate_50' },
                  { text: '⭐ 100 Stars', callback_data: 'donate_100' },
                ],
              ]
            }
          }
        );
        return NextResponse.json({ ok: true });
      }

      await sendInvoice(chatId, {
        title: `Donate ${amount} Star${amount > 1 ? 's' : ''}`,
        description: 'Support Red Zone development. Your donation helps us keep building tools that strengthen partnerships.',
        payload: `donation_${amount}_${Date.now()}`,
        amount,
      });
      return NextResponse.json({ ok: true });
    }

    // Handle /share command — generate shareable cycle phase message
    if (text === '/share') {
      const settings = await getSettingsByTelegramChatId(String(chatId));

      if (!settings) {
        await sendTelegramMessage(chatId, 'Your account is not connected yet. Use the link from your Settings page to connect.');
        return NextResponse.json({ ok: true });
      }

      const userTimezone = settings.timezone || null;
      const { phase } = getCurrentPhase(
        settings.lastPeriodStart,
        settings.cycleLength,
        settings.periodDuration,
        userTimezone,
        settings.periodDelay || 0
      );

      // Generate phase-specific share message
      let shareMessage;
      switch (phase) {
        case 'Menstruation':
          shareMessage = "Hey! My period started — heating pads and chocolate would be amazing right now 💛\n\nContext: I'm in the Menstruation phase right now.";
          break;
        case 'Luteal Phase':
          shareMessage = "Hey! I might be extra sensitive this week — extra patience appreciated 💛\n\nContext: I'm in the Luteal phase (Context Zone) right now.";
          break;
        case 'Ovulation Window':
          shareMessage = "Hey! I'm feeling great this week — perfect time for a date night! 💜\n\nContext: I'm in the Ovulation Window right now.";
          break;
        case 'Follicular Phase':
        default:
          shareMessage = "Hey! Things are smooth sailing this week — great time to make plans together! 💚\n\nContext: I'm in the Follicular Phase right now.";
          break;
      }

      // Add footer
      shareMessage += `\n\n<i>Sent via Red Zone — redzonecouple.site</i>`;

      await sendTelegramMessage(
        chatId,
        `💌 <b>Share Your Phase</b>\n\nHere's a pre-formatted message you can forward to your partner:\n\n` +
        `━━━━━━━━━━━━━━━━━━━━\n\n` +
        shareMessage +
        `\n\n━━━━━━━━━━━━━━━━━━━━\n\n` +
        `Just forward this message to your partner! 💌`
      );
      return NextResponse.json({ ok: true });
    }

    // Handle unknown commands
    const miniAppUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'https://redzonecouple.site'}/miniapp`;

    await sendTelegramMessage(
      chatId,
      "Red Zone Bot\n\nAvailable commands:\n• <b>today's status</b> — Get current phase & advice\n• <b>/status</b> — Same as above\n• <b>/delayed</b> — Report or check period delay\n• <b>/daily HH:MM</b> — Subscribe to daily status at your local time\n• <b>/daily off</b> — Unsubscribe from daily status\n• <b>/donate</b> — Support Red Zone with Telegram Stars ⭐\n\nOr tap the button below to open the full dashboard:",
      {
        reply_markup: {
          inline_keyboard: [[
            { text: '📊 Open Dashboard', web_app: { url: miniAppUrl } }
          ]]
        }
      }
    );

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Telegram webhook error:', error);
    return NextResponse.json({ ok: true });
  }
}
