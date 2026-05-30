import { NextResponse } from 'next/server';
import { getCurrentUser, checkCsrf } from '@/lib/auth';
import { getCloudflareContext } from '@opennextjs/cloudflare';

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { env } = getCloudflareContext();
    const db = env.DB;

    // Gather system stats
    const [
      userCount,
      settingsCount,
      connectedTelegram,
      dailyStatusActive,
      resetTokens,
      rateLimitEntries,
      connectTokens,
    ] = await Promise.all([
      db.prepare('SELECT COUNT(*) as count FROM users').first(),
      db.prepare('SELECT COUNT(*) as count FROM user_settings').first(),
      db.prepare('SELECT COUNT(*) as count FROM user_settings WHERE telegramChatId IS NOT NULL').first(),
      db.prepare('SELECT COUNT(*) as count FROM user_settings WHERE dailyStatusHour IS NOT NULL').first(),
      db.prepare('SELECT COUNT(*) as count FROM password_resets').first(),
      db.prepare('SELECT COUNT(*) as count FROM rate_limits').first(),
      db.prepare('SELECT COUNT(*) as count FROM telegram_connect_tokens').first(),
    ]);

    // Check env vars (only report if set, never expose values)
    // Use process.env which works for both Wrangler secrets and [vars]
    const envStatus = {
      JWT_SECRET: !!(process.env.JWT_SECRET || env.JWT_SECRET),
      CRON_SECRET: !!(process.env.CRON_SECRET || env.CRON_SECRET),
      TELEGRAM_BOT_TOKEN: !!(process.env.TELEGRAM_BOT_TOKEN || env.TELEGRAM_BOT_TOKEN),
      TELEGRAM_BOT_USERNAME: !!(process.env.TELEGRAM_BOT_USERNAME || env.TELEGRAM_BOT_USERNAME),
      TELEGRAM_WEBHOOK_SECRET: !!(process.env.TELEGRAM_WEBHOOK_SECRET || env.TELEGRAM_WEBHOOK_SECRET),
      RESEND_API_KEY: !!(process.env.RESEND_API_KEY || env.RESEND_API_KEY),
      RESEND_FROM_EMAIL: !!(process.env.RESEND_FROM_EMAIL || env.RESEND_FROM_EMAIL),
      NEXT_PUBLIC_BASE_URL: !!(process.env.NEXT_PUBLIC_BASE_URL || env.NEXT_PUBLIC_BASE_URL),
    };

    // DB table sizes
    const tables = await db.prepare(
      "SELECT name FROM sqlite_master WHERE type='table' ORDER BY name"
    ).all();

    return NextResponse.json({
      database: {
        users: userCount?.count || 0,
        settings: settingsCount?.count || 0,
        telegramConnected: connectedTelegram?.count || 0,
        dailyStatusActive: dailyStatusActive?.count || 0,
        pendingResetTokens: resetTokens?.count || 0,
        rateLimitEntries: rateLimitEntries?.count || 0,
        pendingConnectTokens: connectTokens?.count || 0,
        tables: tables.results?.map(t => t.name) || [],
      },
      env: envStatus,
    });
  } catch (error) {
    console.error('Admin system error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * POST: maintenance actions
 * Actions: cleanup_rate_limits, cleanup_expired_tokens, cleanup_connect_tokens
 */
export async function POST(request) {
  try {
    const csrfError = checkCsrf(request);
    if (csrfError) return csrfError;

    const user = await getCurrentUser();
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { action } = await request.json();
    const { env } = getCloudflareContext();
    const db = env.DB;

    switch (action) {
      case 'cleanup_rate_limits': {
        const result = await db.prepare('DELETE FROM rate_limits').run();
        return NextResponse.json({ message: `Cleared ${result.meta.changes} rate limit entries` });
      }
      case 'cleanup_expired_tokens': {
        const result = await db.prepare(
          "DELETE FROM password_resets WHERE expiresAt < datetime('now')"
        ).run();
        return NextResponse.json({ message: `Cleared ${result.meta.changes} expired reset tokens` });
      }
      case 'cleanup_connect_tokens': {
        const result = await db.prepare(
          "DELETE FROM telegram_connect_tokens WHERE expiresAt < datetime('now')"
        ).run();
        return NextResponse.json({ message: `Cleared ${result.meta.changes} expired connect tokens` });
      }
      case 'cleanup_all': {
        const [r1, r2, r3] = await Promise.all([
          db.prepare('DELETE FROM rate_limits').run(),
          db.prepare("DELETE FROM password_resets WHERE expiresAt < datetime('now')").run(),
          db.prepare("DELETE FROM telegram_connect_tokens WHERE expiresAt < datetime('now')").run(),
        ]);
        const total = r1.meta.changes + r2.meta.changes + r3.meta.changes;
        return NextResponse.json({ message: `Cleanup complete. Removed ${total} stale entries.` });
      }
      default:
        return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Admin maintenance error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
