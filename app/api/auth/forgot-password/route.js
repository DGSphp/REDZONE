import { NextResponse } from 'next/server';
import { getUserByEmail, createPasswordReset } from '@/lib/db';
import { sendNotification } from '@/lib/mailer';
import crypto from 'crypto';

export async function POST(req) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const user = await getUserByEmail(email);

    if (!user) {
      // For security, don't reveal if user exists or not
      return NextResponse.json({ message: 'If an account exists with this email, a reset link has been sent.' });
    }

    // Generate token
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 3600000); // 1 hour from now

    try {
      await createPasswordReset(user.id, token, expiresAt);
    } catch (dbError) {
      console.error('Database error in forgot-password:', dbError);
      return NextResponse.json({ error: 'Database error occurred' }, { status: 500 });
    }

    // Send email
    const resetUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/reset-password?token=${token}`;
    
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
      // We still return success to the user for security, but we log the actual error
      // Actually, if it's an internal error, we should probably tell them something went wrong with the service
      return NextResponse.json({ error: 'Failed to send recovery email. Please try again later.' }, { status: 500 });
    }

    return NextResponse.json({ message: 'If an account exists with this email, a reset link has been sent.' });
  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json({ error: `Internal server error: ${error.message}` }, { status: 500 });
  }
}
