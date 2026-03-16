'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LandingPage() {
    const router = useRouter();
    const [modalMode, setModalMode] = useState(null); // 'login' | 'signup' | 'forgot-password' | null
    const [successMessage, setSuccessMessage] = useState('');
    const [formData, setFormData] = useState({ name: '', email: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const openModal = (mode) => {
        setModalMode(mode);
        setFormData({ name: '', email: '', password: '' });
        setError('');
        setSuccessMessage('');
    };

    const closeModal = () => {
        setModalMode(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        const endpoint = modalMode === 'login' ? '/api/auth/login' : 
                         modalMode === 'signup' ? '/api/auth/signup' : 
                         '/api/auth/forgot-password';

        if (modalMode === 'forgot-password' && !formData.email) {
            setError('Please enter your email address');
            setLoading(false);
            return;
        }

        try {
            const res = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            const data = await res.json();

            if (res.ok) {
                if (modalMode === 'signup') {
                    // Force a hard navigation to settings after signup so the layout re-fetches user state
                    window.location.href = '/settings';
                } else if (modalMode === 'login') {
                    // Force a hard navigation to home after login to reload user context
                    window.location.href = '/';
                } else if (modalMode === 'forgot-password') {
                    setSuccessMessage(data.message || 'Check your email for a reset link.');
                    setFormData({ ...formData, email: '' });
                }
            } else {
                setError(data.error || `${modalMode === 'login' ? 'Login' : 'Signup'} failed`);
            }
        } catch (err) {
            setError('An internal error occurred');
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="container" style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '100vh',
            textAlign: 'center',
            position: 'relative'
        }}>
            <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem' }}>
                <h1 className="responsive-h1" style={{ fontSize: '4rem', marginBottom: '1.5rem', lineHeight: 1.1, background: 'linear-gradient(135deg, #e2e8f0 0%, #cbd5e1 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                    Synchronize<br />Your Support.
                </h1>

                <p style={{ fontSize: 'min(1.5rem, 5vw)', color: '#94a3b8', lineHeight: 1.6, marginBottom: '3rem', fontWeight: 300 }}>
                    A shared perspective on the cycle. Understand ovulation, track moods, and navigate life's rhythms together with empathy and precision.
                </p>

                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                    <button onClick={() => openModal('signup')} className="btn" style={{ padding: '1rem 2.5rem', fontSize: '1.125rem', boxShadow: '0 4px 14px 0 rgba(139, 92, 246, 0.39)' }}>
                        Get Started
                    </button>
                    <button onClick={() => openModal('login')} className="btn" style={{ padding: '1rem 2.5rem', fontSize: '1.125rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#e2e8f0' }}>
                        Log In
                    </button>
                </div>
            </div>

            {/* Auth Modal Overlay */}
            {modalMode && (
                <div style={{
                    position: 'fixed',
                    top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(15, 23, 42, 0.8)',
                    backdropFilter: 'blur(8px)',
                    zIndex: 100,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '1rem',
                    animation: 'fadeIn 0.2s ease-out'
                }}>
                    <div className="glass-panel" style={{ width: '100%', maxWidth: '450px', position: 'relative', animation: 'slideUp 0.3s ease-out' }}>
                        <button
                            onClick={closeModal}
                            style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', color: '#94a3b8', fontSize: '1.5rem', cursor: 'pointer', opacity: 0.7, zIndex: 10 }}
                            aria-label="Close"
                        >×</button>

                        <h2 style={{ textAlign: 'center', marginBottom: '0.5rem', fontSize: '2rem' }}>
                            {modalMode === 'login' ? 'Welcome Back' : modalMode === 'signup' ? 'Create Account' : 'Reset Password'}
                        </h2>
                        <p style={{ textAlign: 'center', color: '#94a3b8', marginBottom: '2rem' }}>
                            {modalMode === 'login' ? 'Sign in to your account' : modalMode === 'signup' ? 'Start your journey with Partnership Harmony' : 'Enter your email to receive a reset link'}
                        </p>

                        {error && (
                            <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#fca5a5', padding: '0.75rem', borderRadius: '8px', marginBottom: '1.5rem', textAlign: 'center', fontSize: '0.875rem', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                                {error}
                            </div>
                        )}

                        {successMessage && (
                            <div style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#6ee7b7', padding: '0.75rem', borderRadius: '8px', marginBottom: '1.5rem', textAlign: 'center', fontSize: '0.875rem', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                                {successMessage}
                            </div>
                        )}

                        <form onSubmit={handleSubmit}>
                            {modalMode === 'signup' && (
                                <div style={{ marginBottom: '1.5rem' }}>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Full Name</label>
                                    <input
                                        type="text"
                                        className="input"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        required
                                        placeholder="John Doe"
                                    />
                                </div>
                            )}

                            {(modalMode === 'login' || modalMode === 'signup') && (
                             <div style={{ marginBottom: '2rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                    <label style={{ fontSize: '0.875rem' }}>Password</label>
                                    {modalMode === 'login' && (
                                        <span 
                                            onClick={() => setModalMode('forgot-password')} 
                                            style={{ fontSize: '0.75rem', color: '#c4b5fd', cursor: 'pointer', opacity: 0.8 }}
                                        >
                                            Forgot?
                                        </span>
                                    )}
                                </div>
                                <input
                                    type="password"
                                    className="input"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    required
                                    placeholder="••••••••"
                                />
                            </div>
                            )}

                            {modalMode === 'forgot-password' && (
                                <div style={{ marginBottom: '2rem' }}>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Email Address</label>
                                    <input
                                        type="email"
                                        className="input"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        required
                                        placeholder="name@example.com"
                                    />
                                </div>
                            )}

                            <button type="submit" className="btn" style={{ width: '100%', padding: '1rem', fontSize: '1rem' }} disabled={loading}>
                                {loading ? 'Please wait...' : (modalMode === 'login' ? 'Sign In' : modalMode === 'signup' ? 'Sign Up' : 'Send Link')}
                            </button>
                        </form>

                         <p style={{ marginTop: '2rem', textAlign: 'center', fontSize: '0.875rem', color: '#94a3b8' }}>
                            {modalMode === 'login' ? (
                                <>Don't have an account? <span onClick={() => openModal('signup')} style={{ color: '#c4b5fd', cursor: 'pointer', fontWeight: 600 }}>Sign Up</span></>
                            ) : modalMode === 'signup' ? (
                                <>Already have an account? <span onClick={() => openModal('login')} style={{ color: '#c4b5fd', cursor: 'pointer', fontWeight: 600 }}>Log In</span></>
                            ) : (
                                <>Back to <span onClick={() => openModal('login')} style={{ color: '#c4b5fd', cursor: 'pointer', fontWeight: 600 }}>Log In</span></>
                            )}
                        </p>
                    </div>
                </div>
            )}
            <style jsx>{`
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes slideUp {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </main>
    );
}
