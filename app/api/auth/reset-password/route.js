import { NextResponse } from 'next/server';
import { deletePasswordResetAndReturn, updateUserPassword, checkAndRecordRateLimit } from '@/lib/db';
import { hashPassword, checkCsrf } from '@/lib/auth';

export async function POST(req) {
  try {
    const csrfError = checkCsrf(req);
    if (csrfError) return csrfError;

    const { token, password } = await req.json();

    if (!token || !password) {
      return NextResponse.json({ error: 'Token and password are required' }, { status: 400 });
    }

    if (typeof token !== 'string' || typeof password !== 'string' || token.length > 200 || password.length > 128) {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
    }

    // Rate limit by token prefix to prevent brute-force
    const tokenPrefix = token.slice(0, 8);
    const allowed = await checkAndRecordRateLimit(`reset-pwd:${tokenPrefix}`, 5, 900);
    if (!allowed) {
      return NextResponse.json({ error: 'Too many attempts. Please try again later.' }, { status: 429 });
    }

    if (password.length < 8) {
      return NextResponse.json({ error: 'Password must be at least 8 characters long' }, { status: 400 });
    }

    // Atomically consume the token: delete first, then check if anything was deleted.
    // This prevents TOCTOU race where two concurrent requests both read the same valid token.
    const resetRequest = await deletePasswordResetAndReturn(token);
    if (!resetRequest) {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 400 });
    }

    // Now update the password
    const hashedPassword = await hashPassword(password);
    await updateUserPassword(resetRequest.userId, hashedPassword);

    return NextResponse.json({ message: 'Password has been reset successfully' });
  } catch (error) {
    console.error('Reset password error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
