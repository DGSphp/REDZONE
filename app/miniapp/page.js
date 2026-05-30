'use client';

import { useState, useEffect } from 'react';

/**
 * Rolling calendar grid: 5 days back + today + 25 days forward (matches webapp)
 */
function getCalendarData(prediction) {
  const toDateStr = (d) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };

  const addDaysLocal = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };

  const inRange = (dateStr, startStr, endStr) => {
    if (!startStr || !endStr) return false;
    return dateStr >= startStr && dateStr <= endStr;
  };

  const today = new Date();
  today.setHours(12, 0, 0, 0);
  const todayStr = toDateStr(today);

  const rangeStart = addDaysLocal(today, -5);
  const rangeEnd = addDaysLocal(today, 25);

  const startPadding = rangeStart.getDay();
  const days = [];

  for (let i = 0; i < startPadding; i++) {
    days.push({ day: null });
  }

  for (let offset = -5; offset <= 25; offset++) {
    const dateObj = addDaysLocal(today, offset);
    const dateStr = toDateStr(dateObj);

    let type = '';
    if (inRange(dateStr, prediction.nextPeriodStart, prediction.nextPeriodEnd) || inRange(dateStr, prediction.lastPeriodStart, prediction.currentPeriodEnd)) {
      type = 'phase-period';
    } else if (inRange(dateStr, prediction.contextZoneStart, prediction.contextZoneEnd)) {
      type = 'phase-context';
    } else if (dateStr === prediction.ovulationDate) {
      type = 'phase-ovulation';
    } else if (inRange(dateStr, prediction.lutealPhaseStart, prediction.lutealPhaseEnd)) {
      type = 'phase-luteal';
    }

    let moodPercentage = 0;
    const checkMoodIntensity = (startStr) => {
      if (!startStr) return 0;
      const s = new Date(startStr + 'T12:00:00');
      if (dateStr === toDateStr(s)) return 90;
      if (dateStr === toDateStr(addDaysLocal(s, 1))) return 50;
      if (dateStr === toDateStr(addDaysLocal(s, 2))) return 20;
      return 0;
    };
    moodPercentage = checkMoodIntensity(prediction.currentBadMoodStart) || checkMoodIntensity(prediction.nextBadMoodStart);

    const dayNum = dateObj.getDate();
    const showMonth = dayNum === 1 || offset === -5;
    const label = showMonth
      ? dateObj.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
      : String(dayNum);

    days.push({
      day: dayNum,
      label,
      date: dateStr,
      type,
      moodPercentage,
      isToday: dateStr === todayStr,
      isPast: offset < 0,
    });
  }

  const title = `${rangeStart.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} — ${rangeEnd.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}`;

  return { title, days };
}

export default function MiniApp() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      try {
        const tg = window.Telegram?.WebApp;
        if (!tg) {
          setError('Please open this page from Telegram.');
          setLoading(false);
          return;
        }

        tg.ready();
        tg.expand();

        const initData = tg.initData;
        if (!initData) {
          setError('No Telegram auth data found. Please open this from the bot.');
          setLoading(false);
          return;
        }

        const res = await fetch('/api/telegram/auth', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ initData }),
        });

        const result = await res.json();

        if (!res.ok) {
          setError(result.message || result.error || 'Authentication failed');
          setLoading(false);
          return;
        }

        setData(result);
      } catch (err) {
        setError('Failed to load. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    init();
  }, []);

  if (loading) {
    return (
      <main className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <div style={{ textAlign: 'center' }}>
          <div className="loading-spinner" style={{ margin: '0 auto 1rem' }}></div>
          <p style={{ opacity: 0.6 }}>Loading your dashboard...</p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', textAlign: 'center', padding: '2rem' }}>
        <div>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>😔</div>
          <h2 style={{ marginBottom: '0.5rem' }}>Oops</h2>
          <p style={{ color: '#94a3b8' }}>{error}</p>
        </div>
      </main>
    );
  }

  const { user, cycle, prediction } = data;
  const calendar = getCalendarData(prediction);

  // Mood status text
  const toDateStr = (d) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };
  const addDaysLocal = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };
  const checkMoodIntensity = (startStr) => {
    if (!startStr) return 0;
    const today = new Date(); today.setHours(12, 0, 0, 0);
    const todayStr = toDateStr(today);
    const s = new Date(startStr + 'T12:00:00');
    if (todayStr === toDateStr(s)) return 90;
    if (todayStr === toDateStr(addDaysLocal(s, 1))) return 50;
    if (todayStr === toDateStr(addDaysLocal(s, 2))) return 20;
    return 0;
  };
  const todayMoodPercentage = checkMoodIntensity(prediction.currentBadMoodStart) || checkMoodIntensity(prediction.nextBadMoodStart);

  let moodStatusText = 'Stable';
  if (todayMoodPercentage >= 90) moodStatusText = 'Critical (Day 1)';
  else if (todayMoodPercentage >= 50) moodStatusText = 'High Caution (Day 2)';
  else if (todayMoodPercentage >= 20) moodStatusText = 'Residual (Day 3)';

  return (
    <main className="container miniapp-safe-area">
      {/* Header */}
      <header style={{ textAlign: 'center', marginBottom: '1.5rem', paddingTop: '1rem' }}>
        <h3 style={{ margin: 0 }}>Red Zone</h3>
        <p style={{ margin: 0, fontSize: '0.75rem', opacity: 0.6 }}>
          {user.partnerName}&apos;s mood status
        </p>
      </header>

      {/* Main Status Card */}
      <section className="glass-panel" style={{ padding: '2.5rem', marginBottom: '2rem', textAlign: 'center' }}>
        <div style={{
          display: 'inline-block',
          padding: '0.25rem 0.75rem',
          borderRadius: '999px',
          background: cycle.isContextZone ? 'rgba(239, 68, 68, 0.2)' : 'rgba(139, 92, 246, 0.2)',
          color: cycle.isContextZone ? '#fca5a5' : '#c4b5fd',
          fontSize: '0.875rem',
          marginBottom: '1rem',
          fontWeight: 600,
        }}>
          Current Status
        </div>

        <h1 className="responsive-h1" style={{ fontSize: '3rem', margin: '0 0 1rem 0', lineHeight: 1.1 }}>
          {cycle.phase} {cycle.isBadMood && <span style={{ color: '#ef4444' }}>⚠</span>}
        </h1>

        <p style={{ fontSize: 'min(1.25rem, 4vw)', color: '#e2e8f0', lineHeight: 1.6, maxWidth: '600px', margin: '0 auto' }}>
          {cycle.advice}
        </p>
      </section>

      {/* Today's Status */}
      <section className="glass-panel" style={{ padding: '2rem', marginBottom: '2rem' }}>
        <div className="stack-mobile" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '2rem' }}>
          <div style={{ textAlign: 'center', flex: '1' }}>
            <h4 style={{ margin: '0 0 0.5rem 0', color: '#c4b5fd', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Cycle Day</h4>
            <p style={{ margin: 0, fontSize: '2.5rem', fontWeight: 800, lineHeight: 1 }}>{cycle.dayOfCycle}</p>
          </div>

          <div className="hide-mobile" style={{ height: '40px', width: '1px', background: 'rgba(255,255,255,0.1)' }}></div>

          <div style={{ flex: '2', textAlign: 'center' }}>
            <h4 style={{ margin: '0 0 0.5rem 0', color: '#fca5a5', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Mood Status</h4>
            <div style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '0.5rem' }}>
              {moodStatusText} {todayMoodPercentage > 0 && <span style={{ color: '#ef4444' }}>⚠</span>}
            </div>
            {todayMoodPercentage > 0 && (
              <div style={{ height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', overflow: 'hidden', maxWidth: '300px', margin: '0 auto' }}>
                <div style={{ width: `${todayMoodPercentage}%`, height: '100%', background: todayMoodPercentage > 50 ? '#ef4444' : '#f59e0b', transition: 'width 0.5s ease' }}></div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Forecast Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        <section className="glass-panel" style={{ padding: '1.5rem', textAlign: 'center' }}>
          <h4 style={{ margin: '0 0 0.5rem 0', color: '#94a3b8', fontSize: '0.875rem' }}>Next Period</h4>
          <p style={{ margin: 0, fontSize: '1.125rem', fontWeight: 600 }}>
            {new Date(prediction.nextPeriodStart + 'T12:00:00').toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
          </p>
        </section>

        <section className="glass-panel" style={{ padding: '1.5rem', textAlign: 'center' }}>
          <h4 style={{ margin: '0 0 0.5rem 0', color: '#fca5a5', fontSize: '0.875rem' }}>Next Context Zone</h4>
          <p style={{ margin: 0, fontSize: '1.125rem', fontWeight: 600 }}>
            {new Date(prediction.contextZoneStart + 'T12:00:00').toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
          </p>
        </section>

        <section className="glass-panel" style={{ padding: '1.5rem', textAlign: 'center' }}>
          <h4 style={{ margin: '0 0 0.5rem 0', color: '#34d399', fontSize: '0.875rem' }}>Next Ovulation</h4>
          <p style={{ margin: 0, fontSize: '1.125rem', fontWeight: 600 }}>
            {new Date(prediction.ovulationDate + 'T12:00:00').toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
          </p>
        </section>
      </div>

      {/* Calendar View */}
      <section className="glass-panel" style={{ padding: '2rem' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '0.25rem' }}>Calendar</h2>
        <p style={{ textAlign: 'center', fontSize: '0.8rem', color: '#64748b', marginBottom: '1.5rem' }}>{calendar.title}</p>

        <div className="calendar-grid">
          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, idx) => (
            <div key={idx} className="calendar-day-header">{d}</div>
          ))}

          {calendar.days.map((d, i) => (
            <div
              key={d.date || `pad-${i}`}
              className={`calendar-day ${d.type} ${d.isToday ? 'today' : ''}`}
              style={d.isPast ? { opacity: 0.45 } : undefined}
            >
              {d.label || d.day}

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

        <div style={{ marginTop: '1.5rem', display: 'flex', gap: '1rem', justifyContent: 'center', fontSize: '0.875rem', color: '#cbd5e1', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ width: 12, height: 12, borderRadius: '50%', display: 'block', background: 'rgba(239, 68, 68, 0.4)', border: '1px solid rgba(239, 68, 68, 0.3)', boxShadow: '0 0 10px rgba(248, 113, 113, 0.5)' }}></span> Period
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ width: 12, height: 12, borderRadius: '50%', display: 'block', background: 'rgba(139, 92, 246, 0.2)', border: '1px solid rgba(139, 92, 246, 0.3)' }}></span> Luteal
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
