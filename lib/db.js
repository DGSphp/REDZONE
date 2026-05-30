// lib/db.js - D1 Database adapter for Cloudflare Workers
import { getCloudflareContext } from '@opennextjs/cloudflare';

function getDB() {
  const { env } = getCloudflareContext();
  return env.DB;
}

// Format Date as SQLite-compatible datetime string (YYYY-MM-DD HH:MM:SS)
function toSqliteDatetime(date) {
  return date.toISOString().replace('T', ' ').replace(/\.\d{3}Z$/, '');
}

// Initialize Database — creates tables if they don't exist
export const initDb = async () => {
  const db = getDB();
  // Always run CREATE TABLE IF NOT EXISTS to pick up new tables
  await db.exec("CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, email TEXT UNIQUE NOT NULL COLLATE NOCASE, password TEXT NOT NULL, role TEXT DEFAULT 'user', createdAt TEXT DEFAULT (datetime('now')))");
  await db.exec("CREATE TABLE IF NOT EXISTS user_settings (id INTEGER PRIMARY KEY AUTOINCREMENT, userId INTEGER UNIQUE NOT NULL, partnerName TEXT, partnerEmail TEXT, lastPeriodStart TEXT, cycleLength INTEGER DEFAULT 28, periodDuration INTEGER DEFAULT 5, telegramChatId TEXT, dailyStatusHour INTEGER DEFAULT NULL, birthday TEXT DEFAULT NULL, anniversary TEXT DEFAULT NULL, babyMakingReminder INTEGER DEFAULT 0, timezone TEXT DEFAULT NULL, periodDelay INTEGER DEFAULT 0, FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE)");
  await db.exec("CREATE TABLE IF NOT EXISTS password_resets (id INTEGER PRIMARY KEY AUTOINCREMENT, userId INTEGER NOT NULL, token TEXT UNIQUE NOT NULL, expiresAt TEXT NOT NULL, createdAt TEXT DEFAULT (datetime('now')), FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE)");
  await db.exec("CREATE TABLE IF NOT EXISTS telegram_connect_tokens (id INTEGER PRIMARY KEY AUTOINCREMENT, userId INTEGER NOT NULL, token TEXT UNIQUE NOT NULL, expiresAt TEXT NOT NULL, createdAt TEXT DEFAULT (datetime('now')), FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE)");
  await db.exec("CREATE TABLE IF NOT EXISTS rate_limits (id INTEGER PRIMARY KEY AUTOINCREMENT, key TEXT NOT NULL, createdAt TEXT DEFAULT (datetime('now')))");
  await db.exec("CREATE TABLE IF NOT EXISTS subscriptions (id INTEGER PRIMARY KEY AUTOINCREMENT, userId INTEGER UNIQUE NOT NULL, stripeCustomerId TEXT, stripeSubscriptionId TEXT, status TEXT DEFAULT 'inactive', plan TEXT DEFAULT 'free', currentPeriodEnd TEXT, cancelAtPeriodEnd INTEGER DEFAULT 0, createdAt TEXT DEFAULT (datetime('now')), updatedAt TEXT DEFAULT (datetime('now')), FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE)");
  await db.exec("CREATE TABLE IF NOT EXISTS cycle_history (id INTEGER PRIMARY KEY AUTOINCREMENT, userId INTEGER NOT NULL, periodStart TEXT NOT NULL, delayDays INTEGER DEFAULT 0, cycleLength INTEGER, createdAt TEXT DEFAULT (datetime('now')), FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE)");
  // Indexes for foreign keys
  await db.exec("CREATE INDEX IF NOT EXISTS idx_password_resets_userId ON password_resets (userId)");
  await db.exec("CREATE INDEX IF NOT EXISTS idx_telegram_connect_tokens_userId ON telegram_connect_tokens (userId)");
  await db.exec("CREATE INDEX IF NOT EXISTS idx_cycle_history_userId_periodStart ON cycle_history (userId, periodStart)");
  // Add periodDelay column if missing (migration for existing DBs)
  try { await db.exec("ALTER TABLE user_settings ADD COLUMN periodDelay INTEGER DEFAULT 0"); } catch(e) { if (!String(e).includes('duplicate column')) console.error('Migration error (periodDelay):', e); }
  // Track last context zone we notified about + last daily status date to prevent duplicates
  try { await db.exec("ALTER TABLE user_settings ADD COLUMN lastNotifiedContextZone TEXT DEFAULT NULL"); } catch(e) { if (!String(e).includes('duplicate column')) console.error('Migration error (lastNotifiedContextZone):', e); }
  try { await db.exec("ALTER TABLE user_settings ADD COLUMN lastDailyStatusDate TEXT DEFAULT NULL"); } catch(e) { if (!String(e).includes('duplicate column')) console.error('Migration error (lastDailyStatusDate):', e); }
};

// Ensure DB is initialized before queries
let _initPromise = null;
async function ensureInit() {
  if (!_initPromise) {
    _initPromise = initDb().catch(err => {
      console.error('Failed to initialize database:', err);
      // Reset synchronously BEFORE the microtask resolves, so no concurrent
      // caller can capture a stale rejected promise reference.
      _initPromise = null;
      throw err;
    });
  }
  try {
    await _initPromise;
  } catch (err) {
    // If we awaited a promise that was already rejected (concurrent caller),
    // clear it so the next call retries fresh.
    _initPromise = null;
    throw err;
  }
}

/**
 * User Auth Functions
 */
export const getUserByEmail = async (email) => {
  await ensureInit();
  const db = getDB();
  return db.prepare('SELECT * FROM users WHERE email = ?').bind(email).first();
};

export const getUserById = async (id) => {
  await ensureInit();
  const db = getDB();
  return db.prepare('SELECT * FROM users WHERE id = ?').bind(id).first();
};

export const createUser = async (name, email, password) => {
  await ensureInit();
  const db = getDB();
  const result = await db.prepare(
    'INSERT INTO users (name, email, password) VALUES (?, ?, ?)'
  ).bind(name, email, password).run();
  return result.meta.last_row_id;
};

export const updateUserPassword = async (userId, password) => {
  await ensureInit();
  const db = getDB();
  await db.prepare('UPDATE users SET password = ? WHERE id = ?').bind(password, userId).run();
};

export const updateUserRole = async (userId, role) => {
  await ensureInit();
  const db = getDB();
  await db.prepare('UPDATE users SET role = ? WHERE id = ?').bind(role, userId).run();
};

export const getAllUsers = async () => {
  await ensureInit();
  const db = getDB();
  const { results } = await db.prepare(
    "SELECT u.id, u.name, u.email, u.role, u.createdAt, CASE WHEN s.status = 'active' AND s.currentPeriodEnd > datetime('now') THEN 1 ELSE 0 END as isMember, CASE WHEN us.telegramChatId IS NOT NULL AND us.telegramChatId != '' THEN 1 ELSE 0 END as hasTelegram FROM users u LEFT JOIN subscriptions s ON u.id = s.userId LEFT JOIN user_settings us ON u.id = us.userId"
  ).all();
  return results;
};

export const deleteUser = async (userId) => {
  await ensureInit();
  const db = getDB();
  await db.batch([
    db.prepare('DELETE FROM subscriptions WHERE userId = ?').bind(userId),
    db.prepare('DELETE FROM cycle_history WHERE userId = ?').bind(userId),
    db.prepare('DELETE FROM user_settings WHERE userId = ?').bind(userId),
    db.prepare('DELETE FROM password_resets WHERE userId = ?').bind(userId),
    db.prepare('DELETE FROM telegram_connect_tokens WHERE userId = ?').bind(userId),
    db.prepare('DELETE FROM users WHERE id = ?').bind(userId),
  ]);
};

/**
 * Password Reset Functions
 */
export const createPasswordReset = async (userId, token, expiresAt) => {
  await ensureInit();
  const db = getDB();
  await db.prepare(
    'INSERT INTO password_resets (userId, token, expiresAt) VALUES (?, ?, ?)'
  ).bind(userId, token, expiresAt).run();
};

export const getPasswordResetByToken = async (token) => {
  await ensureInit();
  const db = getDB();
  return db.prepare(
    "SELECT * FROM password_resets WHERE token = ? AND expiresAt > datetime('now')"
  ).bind(token).first();
};

export const deletePasswordReset = async (token) => {
  await ensureInit();
  const db = getDB();
  await db.prepare('DELETE FROM password_resets WHERE token = ?').bind(token).run();
};

// Atomically consume a reset token: delete and return in one statement to prevent TOCTOU
export const deletePasswordResetAndReturn = async (token) => {
  await ensureInit();
  const db = getDB();
  const row = await db.prepare(
    "DELETE FROM password_resets WHERE token = ? AND expiresAt > datetime('now') RETURNING *"
  ).bind(token).first();
  return row || null;
};

export const deletePasswordResetsByUserId = async (userId) => {
  await ensureInit();
  const db = getDB();
  await db.prepare('DELETE FROM password_resets WHERE userId = ?').bind(userId).run();
};

/**
 * Settings Functions
 */
export const getSettings = async (userId) => {
  await ensureInit();
  if (!userId) return null;
  const db = getDB();
  return db.prepare('SELECT * FROM user_settings WHERE userId = ?').bind(userId).first();
};

export const getAllUserSettings = async () => {
  await ensureInit();
  const db = getDB();
  const { results } = await db.prepare('SELECT * FROM user_settings').all();
  return results;
};

export const saveSettings = async (userId, settings) => {
  await ensureInit();
  const db = getDB();
  const { partnerName, partnerEmail, lastPeriodStart, cycleLength, periodDuration, telegramChatId, birthday, anniversary, babyMakingReminder, timezone } = settings;
  const existing = await getSettings(userId);

  if (existing) {
    // Log to cycle history if lastPeriodStart changed
    if (lastPeriodStart && lastPeriodStart !== existing.lastPeriodStart) {
      let actualCycleLength = null;
      if (existing.lastPeriodStart) {
        const prev = new Date(existing.lastPeriodStart + 'T12:00:00Z').getTime();
        const curr = new Date(lastPeriodStart + 'T12:00:00Z').getTime();
        actualCycleLength = Math.round((curr - prev) / (1000 * 60 * 60 * 24));
        if (actualCycleLength <= 0) actualCycleLength = null;
      }
      await db.prepare(
        'INSERT INTO cycle_history (userId, periodStart, delayDays, cycleLength) VALUES (?, ?, ?, ?)'
      ).bind(userId, lastPeriodStart, existing.periodDelay || 0, actualCycleLength).run();
    }
    // Only reset periodDelay if lastPeriodStart actually changed
    const resetDelay = lastPeriodStart !== existing.lastPeriodStart ? 0 : existing.periodDelay;
    await db.prepare(`
      UPDATE user_settings
      SET partnerName = ?, partnerEmail = ?, lastPeriodStart = ?, cycleLength = ?, periodDuration = ?, telegramChatId = ?,
          birthday = ?, anniversary = ?, babyMakingReminder = ?, timezone = ?, periodDelay = ?
      WHERE userId = ?
    `).bind(
      partnerName, partnerEmail, lastPeriodStart, cycleLength, periodDuration,
      telegramChatId !== undefined ? telegramChatId : existing.telegramChatId,
      birthday !== undefined ? birthday : existing.birthday,
      anniversary !== undefined ? anniversary : existing.anniversary,
      babyMakingReminder !== undefined ? babyMakingReminder : existing.babyMakingReminder,
      timezone !== undefined ? timezone : existing.timezone,
      resetDelay,
      userId
    ).run();
  } else {
    await db.prepare(`
      INSERT INTO user_settings (userId, partnerName, partnerEmail, lastPeriodStart, cycleLength, periodDuration, telegramChatId, birthday, anniversary, babyMakingReminder, timezone)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(userId) DO UPDATE SET
        partnerName = excluded.partnerName, partnerEmail = excluded.partnerEmail,
        lastPeriodStart = excluded.lastPeriodStart, cycleLength = excluded.cycleLength,
        periodDuration = excluded.periodDuration,
        telegramChatId = COALESCE(excluded.telegramChatId, telegramChatId),
        birthday = COALESCE(excluded.birthday, birthday),
        anniversary = COALESCE(excluded.anniversary, anniversary),
        babyMakingReminder = excluded.babyMakingReminder,
        timezone = COALESCE(excluded.timezone, timezone)
    `).bind(userId, partnerName, partnerEmail, lastPeriodStart, cycleLength, periodDuration, telegramChatId || null, birthday || null, anniversary || null, babyMakingReminder || 0, timezone || null).run();
  }
};

export const getSettingsByTelegramChatId = async (chatId) => {
  await ensureInit();
  const db = getDB();
  return db.prepare('SELECT * FROM user_settings WHERE telegramChatId = ?').bind(chatId).first();
};

export const clearTelegramChatId = async (chatId) => {
  await ensureInit();
  const db = getDB();
  await db.prepare('UPDATE user_settings SET telegramChatId = NULL WHERE telegramChatId = ?').bind(chatId).run();
};

export const updateTelegramChatId = async (userId, telegramChatId) => {
  await ensureInit();
  const db = getDB();
  // Atomic: clear any existing user of this chatId, then assign to new user
  await db.batch([
    db.prepare('UPDATE user_settings SET telegramChatId = NULL WHERE telegramChatId = ?').bind(telegramChatId),
    db.prepare('UPDATE user_settings SET telegramChatId = ? WHERE userId = ?').bind(telegramChatId, userId),
  ]);
};

export const updateDailyStatusHour = async (userId, hour) => {
  await ensureInit();
  const db = getDB();
  await db.prepare('UPDATE user_settings SET dailyStatusHour = ? WHERE userId = ?').bind(hour, userId).run();
};

export const updateLastNotifiedContextZone = async (userId, contextZoneStart) => {
  await ensureInit();
  const db = getDB();
  await db.prepare('UPDATE user_settings SET lastNotifiedContextZone = ? WHERE userId = ?').bind(contextZoneStart, userId).run();
};

export const updateLastDailyStatusDate = async (userId, dateStr) => {
  await ensureInit();
  const db = getDB();
  await db.prepare('UPDATE user_settings SET lastDailyStatusDate = ? WHERE userId = ?').bind(dateStr, userId).run();
};

export const getUsersForDailyStatus = async (hour) => {
  await ensureInit();
  const db = getDB();
  const { results } = await db.prepare(
    'SELECT * FROM user_settings WHERE dailyStatusHour = ? AND telegramChatId IS NOT NULL'
  ).bind(hour).all();
  return results;
};

export const updatePeriodDelay = async (userId, days) => {
  await ensureInit();
  const db = getDB();
  await db.prepare('UPDATE user_settings SET periodDelay = ? WHERE userId = ?').bind(days, userId).run();
};

export const updateLastPeriodStart = async (userId, dateStr) => {
  await ensureInit();
  const db = getDB();
  // Get previous settings to calculate actual cycle length
  const settings = await getSettings(userId);
  const prevStart = settings?.lastPeriodStart;
  let actualCycleLength = null;
  if (prevStart && prevStart !== dateStr) {
    const prev = new Date(prevStart + 'T12:00:00Z').getTime();
    const curr = new Date(dateStr + 'T12:00:00Z').getTime();
    actualCycleLength = Math.round((curr - prev) / (1000 * 60 * 60 * 24));
    if (actualCycleLength <= 0) actualCycleLength = null;
  }
  const delayDays = settings?.periodDelay || 0;
  // Log to cycle history
  await db.prepare(
    'INSERT INTO cycle_history (userId, periodStart, delayDays, cycleLength) VALUES (?, ?, ?, ?)'
  ).bind(userId, dateStr, delayDays, actualCycleLength).run();
  // Update settings
  await db.prepare('UPDATE user_settings SET lastPeriodStart = ?, periodDelay = 0 WHERE userId = ?').bind(dateStr, userId).run();
};

export const getCycleHistory = async (userId, year) => {
  await ensureInit();
  const db = getDB();
  const startDate = `${year}-01-01`;
  const endDate = `${year}-12-31`;
  const result = await db.prepare(
    'SELECT * FROM cycle_history WHERE userId = ? AND periodStart >= ? AND periodStart <= ? ORDER BY periodStart ASC'
  ).bind(userId, startDate, endDate).all();
  return result.results || [];
};

/**
 * Telegram Connect Token Functions
 */
export const createTelegramConnectToken = async (userId) => {
  await ensureInit();
  const db = getDB();
  // Generate crypto-random token
  const bytes = new Uint8Array(24);
  crypto.getRandomValues(bytes);
  const token = Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
  const expiresAt = toSqliteDatetime(new Date(Date.now() + 60 * 60 * 1000)); // 1 hour
  // Delete any existing tokens for this user
  await db.prepare('DELETE FROM telegram_connect_tokens WHERE userId = ?').bind(userId).run();
  await db.prepare(
    'INSERT INTO telegram_connect_tokens (userId, token, expiresAt) VALUES (?, ?, ?)'
  ).bind(userId, token, expiresAt).run();
  return token;
};

export const getTelegramConnectToken = async (token) => {
  await ensureInit();
  const db = getDB();
  return db.prepare(
    "SELECT * FROM telegram_connect_tokens WHERE token = ? AND expiresAt > datetime('now')"
  ).bind(token).first();
};

export const deleteTelegramConnectToken = async (token) => {
  await ensureInit();
  const db = getDB();
  await db.prepare('DELETE FROM telegram_connect_tokens WHERE token = ?').bind(token).run();
};

/**
 * Membership Functions (Ko-fi subscriptions)
 * Repurposes the subscriptions table: stripeCustomerId → kofi tx id, stripeSubscriptionId → kofi email
 */
export const getSubscription = async (userId) => {
  await ensureInit();
  const db = getDB();
  return db.prepare('SELECT * FROM subscriptions WHERE userId = ?').bind(userId).first();
};

export const isPremium = async (userId) => {
  await ensureInit();
  const db = getDB();
  const row = await db.prepare(
    "SELECT id FROM subscriptions WHERE userId = ? AND status = 'active' AND currentPeriodEnd > datetime('now')"
  ).bind(userId).first();
  return !!row;
};

export const activateMembership = async (userId, kofiTransactionId, kofiEmail) => {
  await ensureInit();
  const db = getDB();
  const periodEnd = toSqliteDatetime(new Date(Date.now() + 35 * 24 * 60 * 60 * 1000));
  const now = toSqliteDatetime(new Date());
  const existing = await db.prepare('SELECT id FROM subscriptions WHERE userId = ?').bind(userId).first();
  if (existing) {
    await db.prepare(
      "UPDATE subscriptions SET status = 'active', plan = 'member', stripeCustomerId = ?, stripeSubscriptionId = ?, currentPeriodEnd = ?, updatedAt = ? WHERE userId = ?"
    ).bind(kofiTransactionId, kofiEmail, periodEnd, now, userId).run();
  } else {
    await db.prepare(
      "INSERT INTO subscriptions (userId, stripeCustomerId, stripeSubscriptionId, status, plan, currentPeriodEnd, createdAt, updatedAt) VALUES (?, ?, ?, 'active', 'member', ?, ?, ?)"
    ).bind(userId, kofiTransactionId, kofiEmail, periodEnd, now, now).run();
  }
};

export const deactivateMembership = async (userId) => {
  await ensureInit();
  const db = getDB();
  await db.prepare(
    "UPDATE subscriptions SET status = 'inactive', currentPeriodEnd = datetime('now', '-1 day'), updatedAt = datetime('now') WHERE userId = ?"
  ).bind(userId).run();
};

/**
 * Rate Limiting Functions (KV-like using D1)
 */
/**
 * Atomic rate limiter: records the attempt AND checks the limit in one batch.
 * Returns true if the request is allowed (under limit), false if rate-limited.
 */
export const checkAndRecordRateLimit = async (key, maxAttempts, windowSeconds) => {
  await ensureInit();
  const db = getDB();
  const windowStart = toSqliteDatetime(new Date(Date.now() - windowSeconds * 1000));
  // Record attempt first, then count — atomic via batch
  await db.batch([
    db.prepare("DELETE FROM rate_limits WHERE createdAt < ?").bind(windowStart),
    db.prepare("INSERT INTO rate_limits (key, createdAt) VALUES (?, datetime('now'))").bind(key),
  ]);
  const result = await db.prepare(
    "SELECT COUNT(*) as count FROM rate_limits WHERE key = ? AND createdAt > ?"
  ).bind(key, windowStart).first();
  // count includes the just-inserted attempt, so use <= to allow exactly maxAttempts
  return (result?.count || 0) <= maxAttempts;
};

// Keep backwards-compatible aliases
export const checkRateLimit = async (key, maxAttempts, windowSeconds) => {
  await ensureInit();
  const db = getDB();
  const windowStart = toSqliteDatetime(new Date(Date.now() - windowSeconds * 1000));
  await db.prepare("DELETE FROM rate_limits WHERE createdAt < ?").bind(windowStart).run();
  const result = await db.prepare(
    "SELECT COUNT(*) as count FROM rate_limits WHERE key = ? AND createdAt > ?"
  ).bind(key, windowStart).first();
  return (result?.count || 0) < maxAttempts;
};

export const recordRateLimitAttempt = async (key) => {
  await ensureInit();
  const db = getDB();
  await db.prepare(
    "INSERT INTO rate_limits (key, createdAt) VALUES (?, datetime('now'))"
  ).bind(key).run();
};

export default { getDB };
