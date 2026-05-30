import { NextResponse } from 'next/server';
import { getSettings, saveSettings, createTelegramConnectToken, isPremium, getSubscription } from '@/lib/db';
import { getCurrentUser, checkCsrf } from '@/lib/auth';

export async function GET() {
    try {
        const user = await getCurrentUser();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const settings = await getSettings(user.id);
        const telegramBotUsername = process.env.TELEGRAM_BOT_USERNAME || '';

        // Generate a connect token for Telegram linking (replaces exposing userId)
        let telegramConnectToken = null;
        if (telegramBotUsername && (!settings || !settings.telegramChatId)) {
            telegramConnectToken = await createTelegramConnectToken(user.id);
        }

        const membershipActive = await isPremium(user.id);
        const subscription = await getSubscription(user.id);

        if (!settings) {
            return NextResponse.json({
                userId: user.id,
                partnerName: '',
                partnerEmail: '',
                lastPeriodStart: '',
                cycleLength: 28,
                periodDuration: 5,
                telegramChatId: '',
                telegramBotUsername,
                telegramConnectToken,
                birthday: '',
                anniversary: '',
                babyMakingReminder: false,
                timezone: '',
                isMember: membershipActive,
                membershipExpires: subscription?.currentPeriodEnd || null,
            });
        }
        return NextResponse.json({
            ...settings,
            userId: user.id,
            telegramBotUsername,
            telegramConnectToken,
            isMember: membershipActive,
            membershipExpires: subscription?.currentPeriodEnd || null,
        });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        const csrfError = checkCsrf(request);
        if (csrfError) return csrfError;

        const user = await getCurrentUser();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { partnerName, partnerEmail, lastPeriodStart, cycleLength, periodDuration, birthday, anniversary, babyMakingReminder, timezone } = body;
        // telegramChatId is intentionally NOT read from body — it can only be set via the secure /start token flow

        // Handle Telegram disconnect request (before other validation)
        if (body.disconnectTelegram) {
            const { clearTelegramChatId } = await import('@/lib/db');
            const settings = await getSettings(user.id);
            if (settings?.telegramChatId) {
                await clearTelegramChatId(settings.telegramChatId);
            }
            return NextResponse.json({ success: true, disconnected: true });
        }

        // Length validation
        if ((partnerName && partnerName.length > 100) || (partnerEmail && partnerEmail.length > 254) || (timezone && timezone.length > 100)) {
            return NextResponse.json({ error: 'Input too long' }, { status: 400 });
        }

        // Basic validation
        if (!partnerName || !lastPeriodStart) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Validate date format
        if (!/^\d{4}-\d{2}-\d{2}$/.test(lastPeriodStart) || isNaN(new Date(lastPeriodStart + 'T12:00:00Z').getTime())) {
            return NextResponse.json({ error: 'Invalid date format for last period start (YYYY-MM-DD)' }, { status: 400 });
        }

        // Validate optional dates
        if (birthday && (!/^\d{4}-\d{2}-\d{2}$/.test(birthday) || isNaN(new Date(birthday + 'T12:00:00Z').getTime()))) {
            return NextResponse.json({ error: 'Invalid birthday format (YYYY-MM-DD)' }, { status: 400 });
        }
        if (anniversary && (!/^\d{4}-\d{2}-\d{2}$/.test(anniversary) || isNaN(new Date(anniversary + 'T12:00:00Z').getTime()))) {
            return NextResponse.json({ error: 'Invalid anniversary format (YYYY-MM-DD)' }, { status: 400 });
        }

        // Validate partner email if provided
        if (partnerEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(partnerEmail)) {
            return NextResponse.json({ error: 'Invalid partner email address' }, { status: 400 });
        }

        // Validate numeric bounds
        const parsedCycleLength = parseInt(cycleLength, 10);
        const parsedPeriodDuration = parseInt(periodDuration, 10);
        const validCycleLength = !isNaN(parsedCycleLength) && parsedCycleLength >= 20 && parsedCycleLength <= 60 ? parsedCycleLength : 28;
        const validPeriodDuration = !isNaN(parsedPeriodDuration) && parsedPeriodDuration >= 1 && parsedPeriodDuration <= 15 ? parsedPeriodDuration : 5;

        // Validate timezone if provided
        if (timezone) {
            try {
                Intl.DateTimeFormat(undefined, { timeZone: timezone });
            } catch {
                return NextResponse.json({ error: 'Invalid timezone' }, { status: 400 });
            }
        }

        await saveSettings(user.id, {
            partnerName,
            partnerEmail,
            lastPeriodStart,
            cycleLength: validCycleLength,
            periodDuration: validPeriodDuration,
            birthday: birthday || null,
            anniversary: anniversary || null,
            babyMakingReminder: babyMakingReminder ? 1 : 0,
            timezone: timezone || null,
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Failed to save settings' }, { status: 500 });
    }
}
