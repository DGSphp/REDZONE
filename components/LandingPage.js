'use client';

import { useState } from 'react';

export default function LandingPage() {
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

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        const endpoint =
            modalMode === 'login' ? '/api/auth/login' :
            modalMode === 'signup' ? '/api/auth/signup' :
            '/api/auth/forgot-password';

        try {
            const res = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            const data = await res.json();

            if (res.ok) {
                if (modalMode === 'signup') {
                    window.location.href = '/settings';
                } else if (modalMode === 'login') {
                    window.location.href = '/';
                } else if (modalMode === 'forgot-password') {
                    setSuccessMessage(data.message || 'Check your email for a reset link.');
                    setFormData({ name: '', email: '', password: '' });
                }
            } else {
                setError(data.error || `${modalMode === 'login' ? 'Login' : 'Signup'} failed. Please try again.`);
            }
        } catch (err) {
            setError('A network error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const inputStyle = {
        width: '100%',
        padding: '0.85rem 1rem',
        background: 'rgba(255,255,255,0.06)',
        border: '1px solid rgba(255,255,255,0.12)',
        borderRadius: '10px',
        color: '#e2e8f0',
        fontSize: '1rem',
        outline: 'none',
        boxSizing: 'border-box',
        transition: 'border-color 0.2s',
    };

    const labelStyle = {
        display: 'block',
        marginBottom: '0.5rem',
        fontSize: '0.875rem',
        color: '#94a3b8',
        fontWeight: 500,
    };

    const fieldStyle = { marginBottom: '1.25rem' };

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
                    background: 'rgba(15, 23, 42, 0.85)',
                    backdropFilter: 'blur(8px)',
                    zIndex: 100,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '1rem',
                }}>
                    <div className="glass-panel" style={{ width: '100%', maxWidth: '450px', position: 'relative' }}>
                        <button
                            onClick={closeModal}
                            style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', color: '#94a3b8', fontSize: '1.5rem', cursor: 'pointer', zIndex: 10 }}
                            aria-label="Close"
                        >×</button>

                        <h2 style={{ textAlign: 'center', marginBottom: '0.5rem', fontSize: '1.75rem' }}>
                            {modalMode === 'login' ? 'Welcome Back' : modalMode === 'signup' ? 'Create Account' : 'Reset Password'}
                        </h2>
                        <p style={{ textAlign: 'center', color: '#94a3b8', marginBottom: '2rem', fontSize: '0.9rem' }}>
                            {modalMode === 'login' ? 'Sign in with your email and password' :
                             modalMode === 'signup' ? 'Fill in your details to get started' :
                             'Enter your email to receive a reset link'}
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
                            {/* Signup: Full Name */}
                            {modalMode === 'signup' && (
                                <div style={fieldStyle}>
                                    <label style={labelStyle} htmlFor="name">Full Name</label>
                                    <input
                                        id="name"
                                        name="name"
                                        type="text"
                                        style={inputStyle}
                                        value={formData.name}
                                        onChange={handleChange}
                                        required
                                        placeholder="Jane Doe"
                                        autoComplete="name"
                                    />
                                </div>
                            )}

                            {/* Login, Signup & Forgot Password: Email */}
                            <div style={fieldStyle}>
                                <label style={labelStyle} htmlFor="email">Email Address</label>
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    style={inputStyle}
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                    placeholder="name@example.com"
                                    autoComplete="email"
                                />
                            </div>

                            {/* Login & Signup: Password */}
                            {(modalMode === 'login' || modalMode === 'signup') && (
                                <div style={fieldStyle}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                        <label style={{...labelStyle, marginBottom: 0}} htmlFor="password">Password</label>
                                        {modalMode === 'login' && (
                                            <span
                                                onClick={() => openModal('forgot-password')}
                                                style={{ fontSize: '0.78rem', color: '#c4b5fd', cursor: 'pointer', alignSelf: 'center' }}
                                            >
                                                Forgot password?
                                            </span>
                                        )}
                                    </div>
                                    <input
                                        id="password"
                                        name="password"
                                        type="password"
                                        style={inputStyle}
                                        value={formData.password}
                                        onChange={handleChange}
                                        required
                                        minLength={8}
                                        placeholder="••••••••"
                                        autoComplete={modalMode === 'login' ? 'current-password' : 'new-password'}
                                    />
                                    {modalMode === 'signup' && (
                                        <p style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.4rem' }}>Minimum 8 characters</p>
                                    )}
                                </div>
                            )}

                            <button
                                type="submit"
                                className="btn"
                                style={{ width: '100%', padding: '1rem', fontSize: '1rem', marginTop: '0.5rem' }}
                                disabled={loading}
                            >
                                {loading ? 'Please wait...' :
                                 modalMode === 'login' ? 'Sign In' :
                                 modalMode === 'signup' ? 'Create Account' :
                                 'Send Reset Link'}
                            </button>
                        </form>

                        <p style={{ marginTop: '1.75rem', textAlign: 'center', fontSize: '0.875rem', color: '#64748b' }}>
                            {modalMode === 'login' ? (
                                <>Don't have an account?{' '}<span onClick={() => openModal('signup')} style={{ color: '#c4b5fd', cursor: 'pointer', fontWeight: 600 }}>Sign Up</span></>
                            ) : modalMode === 'signup' ? (
                                <>Already have an account?{' '}<span onClick={() => openModal('login')} style={{ color: '#c4b5fd', cursor: 'pointer', fontWeight: 600 }}>Log In</span></>
                            ) : (
                                <>Back to{' '}<span onClick={() => openModal('login')} style={{ color: '#c4b5fd', cursor: 'pointer', fontWeight: 600 }}>Log In</span></>
                            )}
                        </p>
                    </div>
                </div>
            )}
        </main>
    );
}
