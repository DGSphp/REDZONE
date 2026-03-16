import { NextResponse } from 'next/server';
import { getSettings, saveSettings } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

export async function GET() {
    try {
        const user = await getCurrentUser();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const settings = await getSettings(user.id);
        if (!settings) {
            // Return default structure if no settings exist
            return NextResponse.json({
                partnerName: '',
                partnerEmail: '',
                lastPeriodStart: '',
                cycleLength: 28,
                periodDuration: 5
            });
        }
        return NextResponse.json(settings);
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        const user = await getCurrentUser();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { partnerName, partnerEmail, lastPeriodStart, cycleLength, periodDuration } = body;

        // Basic validation
        if (!partnerName || !lastPeriodStart) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        await saveSettings(user.id, {
            partnerName,
            partnerEmail,
            lastPeriodStart,
            cycleLength: parseInt(cycleLength) || 28,
            periodDuration: parseInt(periodDuration) || 5
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Failed to save settings' }, { status: 500 });
    }
}
