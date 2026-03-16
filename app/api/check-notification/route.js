import { NextResponse } from 'next/server';
import { getAllUserSettings } from '@/lib/db';
import { getCurrentPhase } from '@/lib/cycle-engine';
import { sendNotification } from '@/lib/mailer';

export async function POST(request) {
    try {
        const allSettings = getAllUserSettings();
        const { searchParams } = new URL(request.url);
        const isTest = searchParams.get('test') === 'true';

        if (!allSettings || allSettings.length === 0) {
            return NextResponse.json({ message: 'No settings found' });
        }

        let sentCount = 0;

        for (const settings of allSettings) {
            const { isContextZone, phase } = getCurrentPhase(
                settings.lastPeriodStart,
                settings.cycleLength,
                settings.periodDuration
            );

            // Simple logic: Send email if in Context Zone (conceptually you'd track if sent today already)
            // For this prototype, we'll just check if we are in the zone.

            if (isContextZone || isTest) {
                const subject = isTest ? 'TEST: Partnership Harmony Notification' : 'Partnership Harmony: Context Zone Active';
                const html = isTest ?
                    `<h1>Test Notification</h1><p>This is a test email from Partnership Harmony. Current phase: ${phase}</p>` :
                    `
        <h1>Context Zone Alert</h1>
        <p>Your partner is currently in the <strong>Context Zone</strong> (${phase}).</p>
        <p><strong>Advice:</strong> Be extra supportive. Offer snacks, avoid heavy debates, and be patient.</p>
        <p>Supportive actions: Offer a heating pad, handle a chore, or just listen.</p>
        `;

                await sendNotification(
                    settings.partnerEmail,
                    subject,
                    html
                );
                sentCount++;
            }
        }

        return NextResponse.json({ sent: sentCount > 0, count: sentCount, reason: isTest ? 'Test Triggered' : 'Processed all users' });

    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Failed to process notification' }, { status: 500 });
    }
}
