'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/**
 * AutoRefresh Component
 * 
 * This component monitors the time and triggers a page refresh when the date changes (at midnight).
 */
export default function AutoRefresh() {
    const router = useRouter();

    useEffect(() => {
        // Function to calculate time until next midnight
        const getTimeUntilMidnight = () => {
            const now = new Date();
            const midnight = new Date(now);
            midnight.setHours(24, 0, 0, 0);
            return midnight.getTime() - now.getTime();
        };

        const scheduleRefresh = () => {
            const timeToMidnight = getTimeUntilMidnight();

            // Safety cap: if for some reason it's negative or too small, wait 10 seconds
            const delay = Math.max(timeToMidnight, 10000);

            const timer = setTimeout(() => {
                router.refresh();
                // Reschedule for next day
                scheduleRefresh();
            }, delay);

            return timer;
        };

        const timer = scheduleRefresh();

        // Clean up timer on unmount
        return () => clearTimeout(timer);
    }, [router]);

    return null;
}
