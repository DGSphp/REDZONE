'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Settings() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({
        partnerName: '',
        partnerEmail: '',
        lastPeriodStart: '',
        cycleLength: 28,
        periodDuration: 5
    });

    useEffect(() => {
        fetch('/api/settings')
            .then(res => res.json())
            .then(data => {
                if (data && !data.error) {
                    setFormData({
                        partnerName: data.partnerName || '',
                        partnerEmail: data.partnerEmail || '',
                        lastPeriodStart: data.lastPeriodStart || '',
                        cycleLength: data.cycleLength || 28,
                        periodDuration: data.periodDuration || 5
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
        const res = await fetch('/api/settings', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });

        if (res.ok) {
            router.push('/');
        }
    };

    if (loading) return <div className="container">Loading...</div>;

    return (
        <main className="container">
            <div className="glass-panel" style={{ padding: '2rem' }}>
                <h1 style={{ marginBottom: '1.5rem', textAlign: 'center' }}>Project Calibration</h1>
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
                                onChange={e => setFormData({ ...formData, cycleLength: e.target.value })}
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem' }}>Period Duration (Days)</label>
                            <input
                                type="number"
                                className="input"
                                value={formData.periodDuration}
                                onChange={e => setFormData({ ...formData, periodDuration: e.target.value })}
                            />
                        </div>
                    </div>

                    <button type="submit" className="btn" style={{ width: '100%', marginTop: '1rem' }}>
                        Initialize System
                    </button>
                </form>
            </div>
        </main>
    );
}
