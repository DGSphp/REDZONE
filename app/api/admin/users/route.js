import { NextResponse } from 'next/server';
import { getAllUsers, deleteUser, getUserById } from '@/lib/db';
import { getCurrentUser, checkCsrf } from '@/lib/auth';

/**
 * ADMIN: Get all users
 */
export async function GET() {
  try {
    const currentUser = await getCurrentUser();
    
    if (!currentUser || currentUser.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized: Admin access required' }, { status: 403 });
    }

    const users = await getAllUsers();
    return NextResponse.json(users);
  } catch (error) {
    console.error('List users error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * ADMIN: Delete a user
 */
export async function DELETE(req) {
  try {
    const csrfError = checkCsrf(req);
    if (csrfError) return csrfError;

    const currentUser = await getCurrentUser();
    
    if (!currentUser || currentUser.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized: Admin access required' }, { status: 403 });
    }

    const { userId } = await req.json();

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    // Prevent admin from deleting themselves (optional but recommended)
    if (userId === currentUser.id) {
      return NextResponse.json({ error: 'Cannot delete your own admin account' }, { status: 400 });
    }

    const targetUser = await getUserById(userId);
    if (!targetUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    await deleteUser(userId);

    return NextResponse.json({ message: `User ${targetUser.email} deleted successfully` });
  } catch (error) {
    console.error('Delete user error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * ADMIN: Update user role
 */
export async function PATCH(req) {
  try {
    const csrfError = checkCsrf(req);
    if (csrfError) return csrfError;

    const currentUser = await getCurrentUser();
    
    if (!currentUser || currentUser.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized: Admin access required' }, { status: 403 });
    }

    const { userId, role, newPassword, setMember } = await req.json();

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const targetUser = await getUserById(userId);
    if (!targetUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const { updateUserRole, updateUserPassword } = await import('@/lib/db');
    
    if (role) {
      const validRoles = ['user', 'admin'];
      if (!validRoles.includes(role)) {
        return NextResponse.json({ error: 'Invalid role. Must be "user" or "admin".' }, { status: 400 });
      }
      await updateUserRole(userId, role);
      console.log(`ADMIN AUDIT: User ${currentUser.id} (${currentUser.email}) changed role of user ${userId} (${targetUser.email}) to ${role}`);
    }

    if (newPassword) {
      if (typeof newPassword !== 'string' || newPassword.length < 8 || newPassword.length > 128) {
        return NextResponse.json({ error: 'Password must be between 8 and 128 characters' }, { status: 400 });
      }
      const { hashPassword } = await import('@/lib/auth');
      const hashedPassword = await hashPassword(newPassword);
      await updateUserPassword(userId, hashedPassword);
      console.log(`ADMIN AUDIT: User ${currentUser.id} (${currentUser.email}) reset password for user ${userId} (${targetUser.email})`);
    }

    if (setMember !== undefined) {
      const { activateMembership, getSettings } = await import('@/lib/db');
      if (setMember) {
        await activateMembership(userId, 'admin-grant', targetUser.email);
        // Notify user via Telegram if connected
        try {
          const settings = await getSettings(userId);
          if (settings?.telegramChatId) {
            const { sendTelegramMessage } = await import('@/lib/telegram');
            await sendTelegramMessage(
              settings.telegramChatId,
              '🎉 <b>Membership Activated!</b>\n\n' +
              'Your RedZone membership is now active. You now have access to:\n\n' +
              '⭐ Daily Telegram status updates\n' +
              '⭐ Baby making reminder\n' +
              '⭐ Partner email notifications\n\n' +
              'Use <b>/daily HH:MM</b> to set up your daily status updates.'
            );
          }
          if (settings?.partnerEmail) {
            const { sendNotification } = await import('@/lib/mailer');
            const { buildNotificationEmail } = await import('@/lib/email-template');
            const html = buildNotificationEmail({ partnerName: settings.partnerName || 'Your partner', phase: 'Membership Activated', advice: 'Your membership is now active. Enjoy all premium features!', isTest: true });
            await sendNotification(settings.partnerEmail, 'RedZone Membership Activated', html);
          }
        } catch (notifyErr) {
          console.error('Failed to send membership notification:', notifyErr);
        }
      } else {
        const { deactivateMembership } = await import('@/lib/db');
        await deactivateMembership(userId);
      }
    }

    return NextResponse.json({ message: `User ${targetUser.email} updated successfully` });
  } catch (error) {
    console.error('Update user role error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
