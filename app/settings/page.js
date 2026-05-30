'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Settings() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [userId, setUserId] = useState(null);
    const [telegramBotUsername, setTelegramBotUsername] = useState('');
    const [telegramChatId, setTelegramChatId] = useState('');
    const [telegramConnectToken, setTelegramConnectToken] = useState('');
    const [isMember, setIsMember] = useState(false);
    const [membershipExpires, setMembershipExpires] = useState(null);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({
        partnerName: '',
        partnerEmail: '',
        lastPeriodStart: '',
        cycleLength: 28,
        periodDuration: 5,
        birthday: '',
        anniversary: '',
        babyMakingReminder: false,
        timezone: ''
    });

    useEffect(() => {
        const detectedTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        fetch('/api/settings')
            .then(res => {
                if (res.status === 401) { router.push('/'); return null; }
                return res.json();
            })
            .then(data => {
                if (!data) return;
                if (data && !data.error) {
                    setUserId(data.userId);
                    setTelegramBotUsername(data.telegramBotUsername || '');
                    setTelegramChatId(data.telegramChatId || '');
                    setTelegramConnectToken(data.telegramConnectToken || '');
                    setIsMember(!!data.isMember);
                    setMembershipExpires(data.membershipExpires || null);
                    setFormData({
                        partnerName: data.partnerName || '',
                        partnerEmail: data.partnerEmail || '',
                        lastPeriodStart: data.lastPeriodStart || '',
                        cycleLength: data.cycleLength || 28,
                        periodDuration: data.periodDuration || 5,
                        birthday: data.birthday || '',
                        anniversary: data.anniversary || '',
                        babyMakingReminder: !!data.babyMakingReminder,
                        timezone: data.timezone || detectedTimezone
                    });
                }
                setLoading(false);
            })
            .catch(err => {
                console.error("Failed to load settings:", err);
                alert("Error loading settings. Check console for details.");
                setLoading(false);
            });
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (saving) return;
        setSaving(true);
        try {
            const res = await fetch('/api/settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (res.ok) {
                router.push('/');
            } else {
                const data = await res.json();
                alert(data.error || 'Failed to save settings. Please try again.');
            }
        } catch (err) {
            alert('A network error occurred. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    const handleDisconnectTelegram = async () => {
        try {
            const res = await fetch('/api/settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ disconnectTelegram: true })
            });
            if (res.ok) {
                setTelegramChatId('');
            }
        } catch (err) {
            alert('Failed to disconnect Telegram.');
        }
    };

    if (loading) return <div className="container">Loading...</div>;

    return (
        <main className="container">
            <a href="/" style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                color: '#94a3b8',
                textDecoration: 'none',
                fontSize: '0.9rem',
                marginBottom: '1rem',
                padding: '0.5rem 0',
            }}>
                &#x2190; Back to Dashboard
            </a>
            <div className="glass-panel" style={{ padding: '2rem' }}>
                <h1 style={{ marginBottom: '1.5rem', textAlign: 'center' }}>Partner Calibration</h1>
                <p style={{ marginBottom: '2rem', textAlign: 'center', color: '#94a3b8' }}>
                    Enter the baseline data to start the cycle prediction engine.
                </p>

                <form onSubmit={handleSubmit}>
                    <label style={{ display: 'block', marginBottom: '0.5rem' }}>Partner&apos;s Name</label>
                    <input
                        type="text"
                        className="input"
                        value={formData.partnerName}
                        onChange={e => setFormData({ ...formData, partnerName: e.target.value })}
                        required
                    />

                    <label style={{ display: 'block', marginBottom: '0.5rem' }}>Notification Email</label>
                    <input
                        type="email"
                        className="input"
                        value={formData.partnerEmail}
                        onChange={e => setFormData({ ...formData, partnerEmail: e.target.value })}
                        required
                    />

                    <label style={{ display: 'block', marginBottom: '0.5rem' }}>Last Period Start Date</label>
                    <input
                        type="date"
                        className="input"
                        value={formData.lastPeriodStart}
                        onChange={e => setFormData({ ...formData, lastPeriodStart: e.target.value })}
                        required
                    />

                    <div className="stack-mobile" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem' }}>Cycle Length (Days)</label>
                            <input
                                type="number"
                                className="input"
                                value={formData.cycleLength}
                                onChange={e => { const v = parseInt(e.target.value, 10); setFormData({ ...formData, cycleLength: isNaN(v) ? '' : v }); }}
                                min={20}
                                max={60}
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem' }}>Period Duration (Days)</label>
                            <input
                                type="number"
                                className="input"
                                value={formData.periodDuration}
                                onChange={e => { const v = parseInt(e.target.value, 10); setFormData({ ...formData, periodDuration: isNaN(v) ? '' : v }); }}
                                min={1}
                                max={15}
                            />
                        </div>
                    </div>

                    <div style={{ marginTop: '1rem', padding: '1rem', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px' }}>
                        <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.875rem' }}>Timezone (auto-detected)</label>
                        <div style={{ fontSize: '0.95rem', fontWeight: 600, color: '#c4b5fd' }}>{formData.timezone || 'Not detected'}</div>
                    </div>

                    <hr style={{ border: 'none', borderTop: '1px solid rgba(255,255,255,0.08)', margin: '1.5rem 0' }} />
                    <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>Reminders</h3>

                    <div className="stack-mobile" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem' }}>Partner&apos;s Birthday</label>
                            <input
                                type="date"
                                className="input"
                                value={formData.birthday}
                                onChange={e => setFormData({ ...formData, birthday: e.target.value })}
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem' }}>Anniversary</label>
                            <input
                                type="date"
                                className="input"
                                value={formData.anniversary}
                                onChange={e => setFormData({ ...formData, anniversary: e.target.value })}
                            />
                        </div>
                    </div>

                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '1rem',
                        marginTop: '1rem',
                        padding: '1.25rem',
                        background: formData.babyMakingReminder ? 'rgba(139, 92, 246, 0.12)' : 'rgba(255,255,255,0.03)',
                        border: `1px solid ${formData.babyMakingReminder ? 'rgba(139, 92, 246, 0.25)' : 'rgba(255,255,255,0.08)'}`,
                        borderRadius: '12px',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                    }}
                    onClick={() => setFormData({ ...formData, babyMakingReminder: !formData.babyMakingReminder })}
                    >
                        <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: 600, fontSize: '0.95rem', marginBottom: '0.25rem' }}>Baby Making Reminder</div>
                            <div style={{ fontSize: '0.8rem', color: '#94a3b8', lineHeight: 1.4 }}>
                                Get a reminder the day before the ovulation window to prepare mentally and physically.
                            </div>
                        </div>
                        <div
                            onClick={e => e.stopPropagation()}
                            style={{
                                position: 'relative',
                                width: '48px',
                                minWidth: '48px',
                                height: '26px',
                                borderRadius: '13px',
                                background: formData.babyMakingReminder ? '#8b5cf6' : 'rgba(255,255,255,0.1)',
                                border: `1px solid ${formData.babyMakingReminder ? '#a78bfa' : 'rgba(255,255,255,0.15)'}`,
                                cursor: 'pointer',
                                transition: 'all 0.3s ease',
                                boxShadow: formData.babyMakingReminder ? '0 0 12px rgba(139, 92, 246, 0.4)' : 'none',
                            }}
                            role="switch"
                            aria-checked={formData.babyMakingReminder}
                            tabIndex={0}
                            onKeyDown={e => { if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); setFormData({ ...formData, babyMakingReminder: !formData.babyMakingReminder }); }}}
                        >
                            <div style={{
                                position: 'absolute',
                                top: '2px',
                                left: formData.babyMakingReminder ? '23px' : '2px',
                                width: '20px',
                                height: '20px',
                                borderRadius: '50%',
                                background: formData.babyMakingReminder ? '#fff' : '#64748b',
                                transition: 'all 0.3s ease',
                                boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
                            }} />
                        </div>
                    </div>

                    <button type="submit" className="btn" disabled={saving} style={{ width: '100%', marginTop: '1.5rem', opacity: saving ? 0.6 : 1 }}>
                        {saving ? 'Saving...' : 'Initialize System'}
                    </button>
                </form>
            </div>

            {/* Membership */}
            <div className="glass-panel" style={{ padding: '2rem', marginTop: '1.5rem' }}>
                <h2 style={{ marginBottom: '0.5rem', fontSize: '1.25rem' }}>Membership</h2>
                {isMember ? (
                    <div>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.75rem',
                            padding: '1rem',
                            background: 'rgba(139, 92, 246, 0.1)',
                            border: '1px solid rgba(139, 92, 246, 0.25)',
                            borderRadius: '12px',
                            marginBottom: '1rem'
                        }}>
                            <span style={{ fontSize: '1.25rem' }}>&#x2B50;</span>
                            <div>
                                <div style={{ fontWeight: 600, color: '#a78bfa' }}>Active Member</div>
                                <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                                    Renews by {membershipExpires ? new Date(membershipExpires).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : '—'}
                                </div>
                            </div>
                        </div>
                        <div style={{ fontSize: '0.85rem', color: '#cbd5e1', lineHeight: 1.8 }}>
                            <div>&#x2713; Daily Telegram status updates</div>
                            <div>&#x2713; Baby making reminder</div>
                            <div>&#x2713; Partner email notifications</div>
                        </div>
                    </div>
                ) : (
                    <div>
                        <p style={{ color: '#94a3b8', fontSize: '0.875rem', marginBottom: '1rem' }}>
                            Unlock premium features with a Ko-fi membership.
                        </p>
                        <div style={{ fontSize: '0.85rem', color: '#cbd5e1', lineHeight: 1.8, marginBottom: '1.25rem' }}>
                            <div>&#x2B50; Daily Telegram status updates</div>
                            <div>&#x2B50; Baby making reminder</div>
                            <div>&#x2B50; Partner email notifications</div>
                        </div>
                        <a
                            href="https://ko-fi.com/denissalmon/tiers"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn"
                            style={{
                                display: 'inline-block',
                                padding: '0.75rem 1.5rem',
                                fontSize: '0.95rem',
                                textDecoration: 'none',
                                textAlign: 'center',
                                background: 'linear-gradient(135deg, #8b5cf6, #6d28d9)',
                                border: '1px solid rgba(139, 92, 246, 0.4)',
                            }}
                        >
                            Become a Member on Ko-fi
                        </a>
                        <p style={{ color: '#64748b', fontSize: '0.75rem', marginTop: '0.75rem' }}>
                            Use the same email you registered with on RedZone.
                        </p>
                    </div>
                )}
            </div>

            {/* Test Notification */}
            <div className="glass-panel" style={{ padding: '2rem', marginTop: '1.5rem' }}>
                <h2 style={{ marginBottom: '0.5rem', fontSize: '1.25rem' }}>Test Notifications</h2>
                <p style={{ color: '#94a3b8', fontSize: '0.875rem', marginBottom: '1rem' }}>
                    Send a test notification to verify email and Telegram are working.
                </p>
                <button
                    type="button"
                    onClick={async () => {
                        try {
                            const res = await fetch('/api/check-notification?test=true', { method: 'POST' });
                            const data = await res.json();
                            if (data.sent) {
                                alert('Test notification sent! Check your email and/or Telegram.');
                            } else {
                                alert(data.error || data.message || 'No notification sent. Make sure settings are saved first.');
                            }
                        } catch (err) {
                            alert('Failed to send test notification.');
                        }
                    }}
                    className="btn"
                    style={{ padding: '0.75rem 1.5rem', fontSize: '0.95rem' }}
                >
                    Send Test Notification
                </button>
            </div>

            {/* Telegram Notifications */}
            <div className="glass-panel" style={{ padding: '2rem', marginTop: '1.5rem' }}>
                <h2 style={{ marginBottom: '0.5rem', fontSize: '1.25rem' }}>Telegram Notifications</h2>
                <p style={{ color: '#94a3b8', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
                    Receive Context Zone alerts directly on Telegram.
                </p>

                {telegramChatId ? (
                    <div>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.75rem',
                            padding: '1rem',
                            background: 'rgba(52, 211, 153, 0.1)',
                            border: '1px solid rgba(52, 211, 153, 0.2)',
                            borderRadius: '12px',
                            marginBottom: '1rem'
                        }}>
                            <span style={{ fontSize: '1.25rem' }}>&#x2705;</span>
                            <div>
                                <div style={{ fontWeight: 600, color: '#34d399' }}>Connected</div>
                                <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Telegram notifications are active</div>
                            </div>
                        </div>
                        <button
                            onClick={handleDisconnectTelegram}
                            style={{
                                background: 'rgba(248, 113, 113, 0.1)',
                                border: '1px solid rgba(248, 113, 113, 0.2)',
                                color: '#f87171',
                                padding: '0.6rem 1.25rem',
                                borderRadius: '10px',
                                cursor: 'pointer',
                                fontSize: '0.85rem',
                                fontWeight: 600,
                            }}
                        >
                            Disconnect Telegram
                        </button>
                    </div>
                ) : telegramBotUsername ? (
                    <div>
                        <p style={{ color: '#cbd5e1', fontSize: '0.9rem', marginBottom: '1rem' }}>
                            Click the button below to open Telegram and connect your account:
                        </p>
                        <a
                            href={`https://t.me/${telegramBotUsername}?start=${telegramConnectToken}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn"
                            style={{
                                display: 'inline-block',
                                padding: '0.75rem 1.5rem',
                                fontSize: '0.95rem',
                                textDecoration: 'none',
                                textAlign: 'center',
                            }}
                        >
                            Connect Telegram
                        </a>
                        <p style={{ color: '#64748b', fontSize: '0.75rem', marginTop: '0.75rem' }}>
                            After connecting, refresh this page to see the updated status.
                        </p>
                    </div>
                ) : (
                    <p style={{ color: '#64748b', fontSize: '0.875rem' }}>
                        Telegram bot is not configured. Ask your admin to set TELEGRAM_BOT_USERNAME.
                    </p>
                )}
            </div>
        </main>
    );
}
