import mysql from 'mysql2/promise';
import path from 'path';
import fs from 'fs';

// db.js - Handles MySQL database connection
// In Docker/local, we use DATABASE_URL
let poolConfig = {};

if (process.env.INSTANCE_CONNECTION_NAME) {
  // Connect via Google Cloud SQL Unix socket
  poolConfig = {
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || 'redzone',
    socketPath: `/cloudsql/${process.env.INSTANCE_CONNECTION_NAME}`
  };
} else {
  // Connect via standard URI (local / Docker)
  poolConfig = {
    uri: process.env.DATABASE_URL || 'mysql://root:secret@localhost:3306/redzone_db'
  };
}

const pool = mysql.createPool(poolConfig);

// Initialize Database
const initDb = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS user_settings (
        id INT AUTO_INCREMENT PRIMARY KEY,
        userId INT UNIQUE NOT NULL,
        partnerName VARCHAR(255),
        partnerEmail VARCHAR(255),
        lastPeriodStart VARCHAR(255),
        cycleLength INT DEFAULT 28,
        periodDuration INT DEFAULT 5,
        FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS password_resets (
        id INT AUTO_INCREMENT PRIMARY KEY,
        userId INT NOT NULL,
        token VARCHAR(255) UNIQUE NOT NULL,
        expiresAt TIMESTAMP NOT NULL,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
      )
    `);
    console.log('Database initialized successfully');
  } catch (err) {
    console.error('Failed to initialize database:', err);
  }
};

// Call initialization (in production this might be handled by migrations)
export const dbInitialized = initDb();

/**
 * User Auth Functions
 */
export const getUserByEmail = async (email) => {
  await dbInitialized;
  const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
  return rows[0];
};

export const getUserById = async (id) => {
  await dbInitialized;
  const [rows] = await pool.query('SELECT * FROM users WHERE id = ?', [id]);
  return rows[0];
};

export const createUser = async (name, email, password) => {
  await dbInitialized;
  const [result] = await pool.query(
    'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
    [name, email, password]
  );
  return result.insertId;
};

export const updateUserPassword = async (userId, password) => {
  await dbInitialized;
  await pool.query('UPDATE users SET password = ? WHERE id = ?', [password, userId]);
};

/**
 * Password Reset Functions
 */
export const createPasswordReset = async (userId, token, expiresAt) => {
  await dbInitialized;
  await pool.query(
    'INSERT INTO password_resets (userId, token, expiresAt) VALUES (?, ?, ?)',
    [userId, token, expiresAt]
  );
};

export const getPasswordResetByToken = async (token) => {
  await dbInitialized;
  const [rows] = await pool.query(
    'SELECT * FROM password_resets WHERE token = ? AND expiresAt > CURRENT_TIMESTAMP',
    [token]
  );
  return rows[0];
};

export const deletePasswordReset = async (token) => {
  await dbInitialized;
  await pool.query('DELETE FROM password_resets WHERE token = ?', [token]);
};

/**
 * Settings Functions
 */
export const getSettings = async (userId) => {
  await dbInitialized;
  if (!userId) {
    const [rows] = await pool.query('SELECT * FROM user_settings WHERE userId = 1');
    return rows[0];
  }
  const [rows] = await pool.query('SELECT * FROM user_settings WHERE userId = ?', [userId]);
  return rows[0];
};

export const getAllUserSettings = async () => {
  await dbInitialized;
  const [rows] = await pool.query('SELECT * FROM user_settings');
  return rows;
};

export const saveSettings = async (userId, settings) => {
  await dbInitialized;
  const { partnerName, partnerEmail, lastPeriodStart, cycleLength, periodDuration } = settings;
  const existing = await getSettings(userId);
  // ... rest of function using pool.query

  if (existing) {
    await pool.query(`
      UPDATE user_settings 
      SET partnerName = ?, partnerEmail = ?, lastPeriodStart = ?, cycleLength = ?, periodDuration = ?
      WHERE userId = ?
    `, [partnerName, partnerEmail, lastPeriodStart, cycleLength, periodDuration, userId]);
  } else {
    await pool.query(`
      INSERT INTO user_settings (userId, partnerName, partnerEmail, lastPeriodStart, cycleLength, periodDuration)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [userId, partnerName, partnerEmail, lastPeriodStart, cycleLength, periodDuration]);
  }
};

export default pool;
