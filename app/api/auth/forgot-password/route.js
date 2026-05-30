import { NextResponse } from 'next/server';
import { getUserByEmail, createPasswordReset, checkAndRecordRateLimit } from '@/lib/db';
import { sendNotification } from '@/lib/mailer';
import { checkCsrf } from '@/lib/auth';

export async function POST(req) {
  try {
    const csrfError = checkCsrf(req);
    if (csrfError) return csrfError;

    const { email } = await req.json();

    if (!email || typeof email !== 'string' || email.length > 254) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 });
    }

    // Rate limit: 3 reset requests per email per hour
    const rateLimitKey = `reset:${email.toLowerCase().trim()}`;
    const allowed = await checkAndRecordRateLimit(rateLimitKey, 3, 3600);
    if (!allowed) {
      return NextResponse.json({ message: 'If an account exists with this email, a reset link has been sent.' });
    }

    const user = await getUserByEmail(email);

    if (!user) {
      // For security, don't reveal if user exists or not
      return NextResponse.json({ message: 'If an account exists with this email, a reset link has been sent.' });
    }

    // Generate token using Web Crypto API
    const bytes = new Uint8Array(32);
    crypto.getRandomValues(bytes);
    const token = Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
    const expiresAt = new Date(Date.now() + 3600000).toISOString().replace('T', ' ').replace(/\.\d{3}Z$/, ''); // 1 hour, SQLite format

    try {
      await createPasswordReset(user.id, token, expiresAt);
    } catch (dbError) {
      console.error('Database error in forgot-password:', dbError);
      return NextResponse.json({ error: 'Database error occurred' }, { status: 500 });
    }

    // Send email
    const resetUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'https://redzonecouple.site'}/reset-password?token=${token}`;
    
    try {
      await sendNotification(
        email,
        'Password Reset Request',
        `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
          <h2>Password Reset Request</h2>
          <p>You requested a password reset for your Partnership Harmony account.</p>
          <p>Click the button below to reset your password. This link will expire in 1 hour.</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" style="background-color: #8b5cf6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">Reset Password</a>
          </div>
          <p>If you didn't request this, you can safely ignore this email.</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
          <p style="font-size: 12px; color: #999;">If the button doesn't work, copy and paste this link: ${resetUrl}</p>
        </div>
        `
      );
    } catch (mailError) {
      console.error('Email error in forgot-password:', mailError);
      // Return same generic message to avoid leaking whether the email exists
      return NextResponse.json({ message: 'If an account exists with this email, a reset link has been sent.' });
    }

    return NextResponse.json({ message: 'If an account exists with this email, a reset link has been sent.' });
  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json({ error: 'Internal server error. Please try again later.' }, { status: 500 });
  }
}
