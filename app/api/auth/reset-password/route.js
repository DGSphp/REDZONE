import { NextResponse } from 'next/server';
import { getPasswordResetByToken, updateUserPassword, deletePasswordReset } from '@/lib/db';
import { hashPassword } from '@/lib/auth';

export async function POST(req) {
  try {
    const { token, password } = await req.json();

    if (!token || !password) {
      return NextResponse.json({ error: 'Token and password are required' }, { status: 400 });
    }

    if (password.length < 8) {
        return NextResponse.json({ error: 'Password must be at least 8 characters long' }, { status: 400 });
    }

    const resetRequest = await getPasswordResetByToken(token);

    if (!resetRequest) {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 400 });
    }

    const hashedPassword = await hashPassword(password);
    await updateUserPassword(resetRequest.userId, hashedPassword);
    await deletePasswordReset(token);

    return NextResponse.json({ message: 'Password has been reset successfully' });
  } catch (error) {
    console.error('Reset password error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
