import { NextResponse } from 'next/server';
import { updateUserPassword, getUserById, deletePasswordResetsByUserId, checkAndRecordRateLimit } from '@/lib/db';
import { getSession, hashPassword, comparePassword, checkCsrf } from '@/lib/auth';

export async function POST(req) {
  try {
    const csrfError = checkCsrf(req);
    if (csrfError) return csrfError;

    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const rateLimitKey = `change-password:${session.userId}`;
    const allowed = await checkAndRecordRateLimit(rateLimitKey, 5, 900);
    if (!allowed) {
      return NextResponse.json({ error: 'Too many attempts. Please try again in 15 minutes.' }, { status: 429 });
    }

    const { oldPassword, newPassword } = await req.json();

    if (!oldPassword || !newPassword) {
      return NextResponse.json({ error: 'Old and new passwords are required' }, { status: 400 });
    }

    if (newPassword.length < 8) {
      return NextResponse.json({ error: 'New password must be at least 8 characters long' }, { status: 400 });
    }

    const user = await getUserById(session.userId);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const isMatch = await comparePassword(oldPassword, user.password);
    if (!isMatch) {
      return NextResponse.json({ error: 'Incorrect old password' }, { status: 400 });
    }

    const hashedNewPassword = await hashPassword(newPassword);
    await updateUserPassword(session.userId, hashedNewPassword);

    // Invalidate all password reset tokens for this user
    await deletePasswordResetsByUserId(session.userId);

    return NextResponse.json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
