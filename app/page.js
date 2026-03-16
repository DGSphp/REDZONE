import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getSettings } from '@/lib/db';
import { getCurrentPhase } from '@/lib/cycle-engine';
import AutoRefresh from '@/components/AutoRefresh';
import LandingPage from '@/components/LandingPage';
import { getCurrentUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

/**
 * Helper to generate calendar days for the current month view
 */
function getCalendarData(currentDate, prediction) {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);

  const startOffset = firstDayOfMonth.getDay(); // 0 is Sunday
  const totalDays = lastDayOfMonth.getDate();

  const days = [];

  // Padding for start of month
  for (let i = 0; i < startOffset; i++) {
    days.push({ day: null });
  }

  // Actual days
  for (let i = 1; i <= totalDays; i++) {
    const dateObj = new Date(year, month, i); // Local time
    const dateStr = dateObj.toISOString().split('T')[0];

    // Check Status
    // Note: This is a simplified check. In a real app we'd convert prediction strings to dates properly 
    // to handle overlapping months better, but substring compare works for exact matches or range checks if formatted correctly.
    // Ideally we re-run logic or pre-calculate ranges.

    let type = '';

    // Convert to timestamps for easier range checking
    const time = dateObj.getTime();

    // Helper to check range
    const inRange = (startStr, endStr) => {
      const start = new Date(startStr); start.setHours(0, 0, 0, 0);
      const end = new Date(endStr); end.setHours(0, 0, 0, 0);
      return time >= start.getTime() && time <= end.getTime();
    };

    if (inRange(prediction.nextPeriodStart, prediction.nextPeriodEnd) || inRange(prediction.lastPeriodStart, prediction.currentPeriodEnd)) {
      type = 'phase-period';
    } else if (inRange(prediction.contextZoneStart, prediction.contextZoneEnd)) {
      type = 'phase-context';
    } else if (dateStr === prediction.ovulationDate || inRange(prediction.ovulationDate, prediction.ovulationDate)) {
      // Just highlight the specific ovulation day for simplicity
      type = 'phase-ovulation';
    }

    // Mood Intensity Calculation
    let moodPercentage = 0;

    // Helper for adding days locally
    const addDaysLocal = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };

    // Check if the current date matches one of the bad mood days relative to a start date
    const checkMoodIntensity = (startStr) => {
      if (!startStr) return 0;
      const start = new Date(startStr); start.setHours(0, 0, 0, 0);

      // Day 1 (Start of bad mood window) -> 90%
      if (time === start.getTime()) return 90;
      // Day 2 -> 50%
      if (time === addDaysLocal(start, 1).getTime()) return 50;
      // Day 3 -> 20%
      if (time === addDaysLocal(start, 2).getTime()) return 20;

      return 0;
    };

    moodPercentage = checkMoodIntensity(prediction.currentBadMoodStart) || checkMoodIntensity(prediction.nextBadMoodStart);

    days.push({
      day: i,
      date: dateStr,
      type,
      moodPercentage,
      isToday: dateStr === prediction.currentDate
    });
  }

  return {
    monthName: firstDayOfMonth.toLocaleString('default', { month: 'long', year: 'numeric' }),
    days
  };
}

export default async function Home() {
  const user = await getCurrentUser();

  if (!user) {
    return <LandingPage />;
  }

  const settings = await getSettings(user.id);

  if (!settings) {
    redirect('/settings');
  }

  const { phase, isContextZone, isBadMood, advice, prediction } = getCurrentPhase(
    settings.lastPeriodStart,
    settings.cycleLength,
    settings.periodDuration
  );

  // ... (rest of the logic remains same, but using user-specific settings)
  // Calculate Day of Cycle
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const start = new Date(settings.lastPeriodStart);
  start.setHours(0, 0, 0, 0);
  const diffTime = Math.abs(today - start);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  const dayOfCycle = diffDays % settings.cycleLength || settings.cycleLength;

  // Mood Calculation for Today
  const checkMoodIntensity = (startStr) => {
    const t = today.getTime();
    if (!startStr) return 0;
    const start = new Date(startStr); start.setHours(0, 0, 0, 0);

    const addDaysLocal = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };

    // Day 1 (Start of bad mood window) -> 90%
    if (t === start.getTime()) return 90;
    // Day 2 -> 50%
    if (t === addDaysLocal(start, 1).getTime()) return 50;
    // Day 3 -> 20%
    if (t === addDaysLocal(start, 2).getTime()) return 20;

    return 0;
  };
  const todayMoodPercentage = checkMoodIntensity(prediction.currentBadMoodStart) || checkMoodIntensity(prediction.nextBadMoodStart);

  let moodStatusText = "Stable";
  if (todayMoodPercentage >= 90) moodStatusText = "Critical (Day 1)";
  else if (todayMoodPercentage >= 50) moodStatusText = "High Caution (Day 2)";
  else if (todayMoodPercentage >= 20) moodStatusText = "Residual (Day 3)";

  const calendar = getCalendarData(new Date(), prediction);

  return (
    <main className="container">
      <AutoRefresh />
      <header className="stack-mobile" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', gap: '1rem' }}>
        <div>
          <h3 style={{ margin: 0 }}>Partnership Harmony</h3>
          <p style={{ margin: 0, fontSize: '0.75rem', opacity: 0.6 }}>Welcome, {user.name}</p>
        </div>
        <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
          <Link href="/settings" style={{ fontSize: '0.875rem', opacity: 0.7, textDecoration: 'none' }}>Settings</Link>
          <form action="/api/auth/logout" method="POST">
            <button type="submit" style={{ background: 'none', border: 'none', color: '#fca5a5', fontSize: '0.875rem', cursor: 'pointer', opacity: 0.7 }}>Logout</button>
          </form>
        </div>
      </header>

      {/* Main Status Card */}
      <section className="glass-panel" style={{ padding: '2.5rem', marginBottom: '2rem', textAlign: 'center' }}>
        <div style={{
          display: 'inline-block',
          padding: '0.25rem 0.75rem',
          borderRadius: '999px',
          background: isContextZone ? 'rgba(239, 68, 68, 0.2)' : 'rgba(139, 92, 246, 0.2)',
          color: isContextZone ? '#fca5a5' : '#c4b5fd',
          fontSize: '0.875rem',
          marginBottom: '1rem',
          fontWeight: 600
        }}>
          Current Status
        </div>

        <h1 className="responsive-h1" style={{ fontSize: '3rem', margin: '0 0 1rem 0', lineHeight: 1.1 }}>
          {phase} {isBadMood && <span title="Bad Mood Indicator">😈</span>}
        </h1>

        <p style={{ fontSize: 'min(1.25rem, 4vw)', color: '#e2e8f0', lineHeight: 1.6, maxWidth: '600px', margin: '0 auto' }}>
          {advice}
        </p>
      </section>

      {/* Next Cycle Forecast */}
      {/* Today's Status (Full Width) */}
      <section className="glass-panel" style={{ padding: '2rem', marginBottom: '2rem' }}>
        <div className="stack-mobile" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '2rem' }}>
          <div style={{ textAlign: 'center', flex: '1' }}>
            <h4 style={{ margin: '0 0 0.5rem 0', color: '#c4b5fd', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Cycle Day</h4>
            <p style={{ margin: 0, fontSize: '2.5rem', fontWeight: 800, lineHeight: 1 }}>{dayOfCycle}</p>
          </div>

          <div className="hide-mobile" style={{ height: '40px', width: '1px', background: 'rgba(255,255,255,0.1)' }}></div>

          <div style={{ flex: '2', textAlign: 'center' }}>
            <h4 style={{ margin: '0 0 0.5rem 0', color: '#fca5a5', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Mood Status</h4>
            <div style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '0.5rem' }}>
              {moodStatusText} {todayMoodPercentage > 0 && '😈'}
            </div>
            {todayMoodPercentage > 0 && (
              <div style={{ height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', overflow: 'hidden', maxWidth: '300px', margin: '0 auto' }}>
                <div style={{ width: `${todayMoodPercentage}%`, height: '100%', background: todayMoodPercentage > 50 ? '#ef4444' : '#f59e0b', transition: 'width 0.5s ease' }}></div>
              </div>
            )}
          </div>
        </div>
      </section>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        <section className="glass-panel" style={{ padding: '1.5rem', textAlign: 'center' }}>
          <h4 style={{ margin: '0 0 0.5rem 0', color: '#94a3b8', fontSize: '0.875rem' }}>Next Period</h4>
          <p style={{ margin: 0, fontSize: '1.125rem', fontWeight: 600 }}>
            {new Date(prediction.nextPeriodStart).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
          </p>
        </section>

        <section className="glass-panel" style={{ padding: '1.5rem', textAlign: 'center' }}>
          <h4 style={{ margin: '0 0 0.5rem 0', color: '#fca5a5', fontSize: '0.875rem' }}>Next Context Zone</h4>
          <p style={{ margin: 0, fontSize: '1.125rem', fontWeight: 600 }}>
            {new Date(prediction.contextZoneStart).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
          </p>
        </section>

        <section className="glass-panel" style={{ padding: '1.5rem', textAlign: 'center' }}>
          <h4 style={{ margin: '0 0 0.5rem 0', color: '#34d399', fontSize: '0.875rem' }}>Next Ovulation</h4>
          <p style={{ margin: 0, fontSize: '1.125rem', fontWeight: 600 }}>
            {new Date(prediction.ovulationDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
          </p>
        </section>
      </div>

      {/* Calendar View */}
      <section className="glass-panel" style={{ padding: '2rem' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '1.5rem' }}>{calendar.monthName}</h2>

        <div className="calendar-grid">
          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, idx) => (
            <div key={idx} className="calendar-day-header">{d}</div>
          ))}

          {calendar.days.map((d, i) => (
            <div
              key={i}
              className={`calendar-day ${d.type} ${d.isToday ? 'today' : ''}`}
            >
              {d.day}

              {/* Mood Chart Indicator */}
              {d.moodPercentage > 0 && (
                <div style={{
                  position: 'absolute',
                  bottom: '6px',
                  left: '6px',
                  right: '6px',
                  height: '4px',
                  background: 'rgba(255,255,255,0.1)',
                  borderRadius: '2px',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    width: `${d.moodPercentage}%`,
                    height: '100%',
                    background: d.moodPercentage > 50 ? '#ef4444' : '#f59e0b',
                    boxShadow: '0 0 5px rgba(239, 68, 68, 0.5)',
                    borderRadius: '2px'
                  }}></div>
                </div>
              )}
            </div>
          ))}
        </div>

        <div style={{ marginTop: '1.5rem', display: 'flex', gap: '1rem', justifyContent: 'center', fontSize: '0.875rem', color: '#cbd5e1' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ width: 12, height: 12, borderRadius: '50%', display: 'block', background: 'rgba(239, 68, 68, 0.4)', border: '1px solid rgba(239, 68, 68, 0.3)', boxShadow: '0 0 10px rgba(248, 113, 113, 0.5)' }}></span> Period
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ width: 12, height: 12, borderRadius: '50%', display: 'block', background: 'rgba(245, 158, 11, 0.2)', border: '1px solid rgba(245, 158, 11, 0.3)' }}></span> Context Zone
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ width: 12, height: 12, borderRadius: '50%', display: 'block', background: 'rgba(16, 185, 129, 0.2)', border: '1px solid #34d399' }}></span> Ovulation
          </div>
        </div>
      </section>
    </main>
  );
}
