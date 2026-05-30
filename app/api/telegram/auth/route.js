import { NextResponse } from 'next/server';
import { verifyInitData } from '@/lib/telegram-auth';
import { getSettingsByTelegramChatId } from '@/lib/db';
import { getCurrentPhase } from '@/lib/cycle-engine';

export async function POST(request) {
  try {
    const { initData } = await request.json();

    const telegramUser = await verifyInitData(initData);
    if (!telegramUser) {
      return NextResponse.json({ error: 'Invalid or expired Telegram data' }, { status: 401 });
    }

    // Look up user settings by their Telegram ID (stored as telegramChatId)
    const settings = await getSettingsByTelegramChatId(String(telegramUser.id));
    if (!settings) {
      return NextResponse.json({
        error: 'not_connected',
        message: 'Your Telegram account is not connected to any Partnership Harmony account. Use the /start link from your Settings page first.'
      }, { status: 404 });
    }

    const userTimezone = settings.timezone || null;

    // Calculate cycle data
    const { phase, isContextZone, isBadMood, advice, prediction } = getCurrentPhase(
      settings.lastPeriodStart,
      settings.cycleLength,
      settings.periodDuration,
      userTimezone,
      settings.periodDelay || 0
    );

    // Calculate day of cycle using string dates from prediction
    const todayMs = new Date(prediction.currentDate + 'T12:00:00Z').getTime();
    const startMs = new Date(prediction.lastPeriodStart + 'T12:00:00Z').getTime();
    const diffDays = Math.round((todayMs - startMs) / (1000 * 60 * 60 * 24)) + 1;
    const dayOfCycle = ((diffDays - 1) % settings.cycleLength) + 1;

    return NextResponse.json({
      user: {
        telegramName: telegramUser.first_name,
        partnerName: settings.partnerName,
      },
      cycle: {
        phase,
        isContextZone,
        isBadMood,
        advice,
        dayOfCycle,
        cycleLength: settings.cycleLength,
        periodDuration: settings.periodDuration,
      },
      prediction,
    });
  } catch (error) {
    console.error('Telegram auth error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
