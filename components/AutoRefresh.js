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
        let currentTimer = null;
        let mounted = true;
        let lastDate = new Date().toDateString();

        const getTimeUntilMidnight = () => {
            const now = new Date();
            const midnight = new Date(now);
            midnight.setHours(24, 0, 0, 0);
            return midnight.getTime() - now.getTime();
        };

        const scheduleRefresh = () => {
            const timeToMidnight = getTimeUntilMidnight();
            const delay = Math.max(timeToMidnight, 10000);

            currentTimer = setTimeout(() => {
                if (!mounted) return;
                if (document.visibilityState === 'visible') {
                    router.refresh();
                    lastDate = new Date().toDateString();
                }
                scheduleRefresh();
            }, delay);
        };

        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible' && new Date().toDateString() !== lastDate) {
                router.refresh();
                lastDate = new Date().toDateString();
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        scheduleRefresh();

        return () => {
            mounted = false;
            clearTimeout(currentTimer);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, [router]);

    return null;
}
