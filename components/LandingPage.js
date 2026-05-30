'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function LandingPage() {
    const [modalMode, setModalMode] = useState(null); // 'login' | 'signup' | 'forgot-password' | null
    const [successMessage, setSuccessMessage] = useState('');
    const [formData, setFormData] = useState({ name: '', email: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    // Lock body scroll when modal is open
    useEffect(() => {
        if (modalMode) {
            document.body.style.overflow = 'hidden';
            return () => { document.body.style.overflow = ''; };
        }
    }, [modalMode]);

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

    const blogPosts = [
        {
            title: "Period Tracker for Boyfriends: Why Men Are Tracking Their Partner's Cycle",
            slug: "period-tracker-for-boyfriends",
            date: "March 28, 2026",
            excerpt: "Learn why partners are tracking cycles together and how it transforms communication, intimacy, and support in relationships.",
            category: "Couples",
        },
        {
            title: "How to Support Your Partner During PMS: A Practical Guide",
            slug: "how-to-support-partner-during-pms",
            date: "March 25, 2026",
            excerpt: "Master practical, science-backed strategies to support your partner through each phase of her cycle.",
            category: "Support",
        },
        {
            title: "Cycle Tracking for Couples: How Sharing Period Data Strengthens Relationships",
            slug: "cycle-tracking-for-couples",
            date: "March 22, 2026",
            excerpt: "Explore how shared cycle awareness leads to better planning, less conflict, and deeper connection.",
            category: "Relationships",
        },
    ];

    return (
        <main style={{ position: 'relative' }}>
            {/* ── Nav ── */}
            <nav style={{
                position: 'sticky',
                top: 0,
                zIndex: 50,
                background: 'rgba(15,23,42,0.85)',
                backdropFilter: 'blur(12px)',
                borderBottom: '1px solid rgba(255,255,255,0.07)',
                padding: '0 2rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                height: '56px',
            }}>
                <span style={{ fontWeight: 800, fontSize: '1.1rem', color: '#e2e8f0', letterSpacing: '-0.03em' }}>
                    Red Zone
                </span>
                <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', fontSize: '0.9rem' }}>
                    <a href="#features" style={{ color: '#94a3b8', textDecoration: 'none' }}>Features</a>
                    <a href="#pricing" style={{ color: '#94a3b8', textDecoration: 'none' }}>Pricing</a>
                    <Link href="/blog" style={{ color: '#94a3b8', textDecoration: 'none' }}>Blog</Link>
                    <Link href="/about" style={{ color: '#94a3b8', textDecoration: 'none' }}>About</Link>
                    <button onClick={() => openModal('login')} style={{ background: 'none', border: '1px solid rgba(255,255,255,0.15)', color: '#e2e8f0', borderRadius: '8px', padding: '0.4rem 1rem', cursor: 'pointer', fontSize: '0.875rem' }}>
                        Log In
                    </button>
                </div>
            </nav>

            {/* ── Hero ── */}
            <section style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '85vh',
                textAlign: 'center',
                padding: '4rem 2rem 3rem',
            }}>
                <div style={{ maxWidth: '760px', margin: '0 auto' }}>
                    <h1 className="responsive-h1" style={{ fontSize: 'clamp(2.5rem, 7vw, 4rem)', marginBottom: '1.5rem', lineHeight: 1.1, background: 'linear-gradient(135deg, #e2e8f0 0%, #cbd5e1 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                        Red Zone — The Period Tracker for Couples
                    </h1>

                    <p style={{ fontSize: 'clamp(1rem, 3vw, 1.25rem)', color: '#94a3b8', lineHeight: 1.7, marginBottom: '2.5rem', fontWeight: 300 }}>
                        Know what phase she's in. Know how to help. Stop guessing and start supporting — together.
                    </p>

                    <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                        <button onClick={() => openModal('signup')} className="btn" style={{ padding: '1rem 2.5rem', fontSize: '1.125rem', boxShadow: '0 4px 14px 0 rgba(139, 92, 246, 0.39)' }}>
                            Get Started Free
                        </button>
                        <button onClick={() => openModal('login')} className="btn" style={{ padding: '1rem 2.5rem', fontSize: '1.125rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#e2e8f0' }}>
                            Log In
                        </button>
                    </div>
                </div>
            </section>

            {/* ── How It Works ── */}
            <section id="features" style={{ maxWidth: '900px', margin: '0 auto', padding: '4rem 2rem' }}>
                <h2 style={{ textAlign: 'center', fontSize: '2rem', marginBottom: '0.75rem' }}>How It Works</h2>
                <p style={{ textAlign: 'center', color: '#94a3b8', marginBottom: '3rem', fontSize: '1.05rem' }}>Three simple steps to become a more supportive partner.</p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}>
                    {[
                        { step: '1', title: 'Sign Up', desc: 'Create your account and enter the cycle start date and length. Takes two minutes.' },
                        { step: '2', title: 'Connect', desc: 'Link your Telegram account to the bot and get instant access to phase and mood data.' },
                        { step: '3', title: 'Stay in Sync', desc: 'Receive daily briefings and alerts so you always know the current phase and how to help.' },
                    ].map(({ step, title, desc }) => (
                        <div key={step} className="glass-panel" style={{ padding: '1.75rem', textAlign: 'center' }}>
                            <div style={{ width: '2.5rem', height: '2.5rem', borderRadius: '50%', background: 'linear-gradient(135deg, #8b5cf6, #6d28d9)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem', fontWeight: 800, fontSize: '1rem', color: '#fff' }}>{step}</div>
                            <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>{title}</h3>
                            <p style={{ color: '#94a3b8', fontSize: '0.9rem', lineHeight: 1.6, margin: 0 }}>{desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* ── Features ── */}
            <section style={{ maxWidth: '900px', margin: '0 auto', padding: '2rem 2rem 4rem' }}>
                <h2 style={{ textAlign: 'center', fontSize: '2rem', marginBottom: '0.75rem' }}>Everything You Need</h2>
                <p style={{ textAlign: 'center', color: '#94a3b8', marginBottom: '3rem', fontSize: '1.05rem' }}>Built for the partner who wants to actually help.</p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem' }}>
                    {[
                        { icon: '📅', title: 'Cycle Calendar', desc: 'Visual calendar showing menstrual phase, ovulation window, and PMS zone.' },
                        { icon: '🤖', title: 'Telegram Bot', desc: 'Ask the bot for instant status updates — phase, mood, and advice on demand.' },
                        { icon: '🔴', title: 'Context Zone Alerts', desc: 'Get notified before difficult days so you can show up prepared.' },
                        { icon: '📊', title: 'Daily Status (Member)', desc: 'Receive a daily morning briefing: phase, mood forecast, and today\'s advice.' },
                        { icon: '🍼', title: 'Baby Making Reminder (Member)', desc: 'Timed alert the day before peak fertility window to help you prepare.' },
                        { icon: '📧', title: 'Partner Email Notifications (Member)', desc: 'Automated emails so your partner knows you\'re paying attention.' },
                    ].map(({ icon, title, desc }) => (
                        <div key={title} className="glass-panel" style={{ padding: '1.5rem' }}>
                            <div style={{ fontSize: '1.75rem', marginBottom: '0.75rem' }}>{icon}</div>
                            <h3 style={{ fontSize: '1rem', marginBottom: '0.4rem' }}>{title}</h3>
                            <p style={{ color: '#94a3b8', fontSize: '0.875rem', lineHeight: 1.6, margin: 0 }}>{desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* ── Why Couples Love It ── */}
            <section style={{ maxWidth: '900px', margin: '0 auto', padding: '2rem 2rem 4rem' }}>
                <h2 style={{ textAlign: 'center', fontSize: '2rem', marginBottom: '3rem' }}>Why Couples Love Red Zone</h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem' }}>
                    {[
                        { quote: '"We fight way less now. I actually understand what\'s happening."' },
                        { quote: '"The daily Telegram message is the first thing I read every morning."' },
                        { quote: '"She felt seen for the first time. That\'s priceless."' },
                    ].map(({ quote }, i) => (
                        <div key={i} className="glass-panel" style={{ padding: '1.5rem' }}>
                            <p style={{ color: '#cbd5e1', fontSize: '0.95rem', lineHeight: 1.7, margin: 0, fontStyle: 'italic' }}>{quote}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* ── Pricing ── */}
            <section id="pricing" style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem 2rem 4rem' }}>
                <h2 style={{ textAlign: 'center', fontSize: '2rem', marginBottom: '2rem' }}>Simple Pricing</h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
                    {/* Free */}
                    <div className="glass-panel" style={{ padding: '1.5rem', textAlign: 'left' }}>
                        <div style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.25rem' }}>Free</div>
                        <div style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '1rem' }}>$0<span style={{ fontSize: '0.875rem', fontWeight: 400, color: '#94a3b8' }}>/month</span></div>
                        <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: '1rem', lineHeight: 1.6 }}>
                            Everything you need to start understanding her cycle. Dashboard, calendar, Telegram bot — free forever.
                        </p>
                        <div style={{ fontSize: '0.85rem', color: '#cbd5e1', lineHeight: 2 }}>
                            <div>&#x2713; Dashboard &amp; cycle calendar</div>
                            <div>&#x2713; Current phase &amp; daily advice</div>
                            <div>&#x2713; Telegram bot (status on demand)</div>
                            <div>&#x2713; Context Zone alerts (Telegram)</div>
                        </div>
                        <button onClick={() => openModal('signup')} className="btn" style={{ width: '100%', marginTop: '1.25rem', padding: '0.75rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#e2e8f0' }}>
                            Get Started Free
                        </button>
                    </div>
                    {/* Member */}
                    <div className="glass-panel" style={{ padding: '1.5rem', textAlign: 'left', border: '1px solid rgba(139, 92, 246, 0.35)', boxShadow: '0 0 30px rgba(139, 92, 246, 0.1)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                            <span style={{ fontSize: '1.25rem', fontWeight: 700 }}>Member</span>
                            <span style={{ fontSize: '0.65rem', fontWeight: 700, background: 'linear-gradient(135deg, #8b5cf6, #6d28d9)', padding: '0.15rem 0.5rem', borderRadius: '999px', color: '#fff', letterSpacing: '0.05em', textTransform: 'uppercase' }}>Popular</span>
                        </div>
                        <div style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '1rem' }}>$0.49<span style={{ fontSize: '0.875rem', fontWeight: 400, color: '#94a3b8' }}>/month</span></div>
                        <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: '1rem', lineHeight: 1.6 }}>
                            Full automation. Daily briefings, fertility reminders, and email notifications — for less than a coffee a month.
                        </p>
                        <div style={{ fontSize: '0.85rem', color: '#cbd5e1', lineHeight: 2 }}>
                            <div>&#x2713; Everything in Free</div>
                            <div style={{ color: '#a78bfa' }}>&#x2B50; Daily Telegram morning briefing</div>
                            <div style={{ color: '#a78bfa' }}>&#x2B50; Baby making fertility reminder</div>
                            <div style={{ color: '#a78bfa' }}>&#x2B50; Partner email notifications</div>
                        </div>
                        <a href="https://ko-fi.com/denissalmon/tiers" target="_blank" rel="noopener noreferrer" className="btn" style={{ display: 'block', width: '100%', marginTop: '1.25rem', padding: '0.75rem', background: 'linear-gradient(135deg, #8b5cf6, #6d28d9)', border: '1px solid rgba(139, 92, 246, 0.4)', textDecoration: 'none', textAlign: 'center', boxSizing: 'border-box' }}>
                            Join on Ko-fi — $0.49/mo
                        </a>
                    </div>
                </div>
            </section>

            {/* ── FAQ ── */}
            <section style={{ maxWidth: '700px', margin: '0 auto', padding: '2rem 2rem 4rem' }}>
                <h2 style={{ textAlign: 'center', fontSize: '2rem', marginBottom: '2.5rem' }}>Common Questions</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    {[
                        { q: 'Does my partner need to sign up?', a: 'No. One partner creates the account and enters the cycle data. The other stays informed through Telegram and email.' },
                        { q: 'How accurate is the cycle tracking?', a: 'Red Zone uses the standard cycle model (phase lengths, ovulation day) based on the dates you provide. The more consistently you update it, the more accurate it gets.' },
                        { q: 'Is my data private?', a: 'Yes. Your data is stored securely and never shared with third parties. Only you and your partner have access.' },
                        { q: 'How do I cancel my membership?', a: 'Memberships are managed through Ko-fi. You can cancel at any time from your Ko-fi account and your membership stays active until the billing period ends.' },
                        { q: 'What is the Context Zone?', a: 'The Context Zone refers to the late luteal phase (days before her period) when hormonal drops cause the most noticeable mood and physical changes. Red Zone highlights these days so you can prepare.' },
                    ].map(({ q, a }) => (
                        <div key={q} className="glass-panel" style={{ padding: '1.25rem 1.5rem' }}>
                            <p style={{ fontWeight: 700, marginBottom: '0.5rem', margin: '0 0 0.5rem', fontSize: '0.95rem' }}>{q}</p>
                            <p style={{ color: '#94a3b8', margin: 0, fontSize: '0.875rem', lineHeight: 1.7 }}>{a}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* ── Blog ── */}
            <section style={{ maxWidth: '900px', margin: '0 auto', padding: '2rem 2rem 4rem' }}>
                <h2 style={{ textAlign: 'center', fontSize: '2rem', marginBottom: '0.75rem' }}>From the Blog</h2>
                <p style={{ textAlign: 'center', color: '#94a3b8', marginBottom: '2.5rem', fontSize: '1.05rem' }}>Guides and insights for partners who want to do better.</p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
                    {blogPosts.map((post) => (
                        <Link key={post.slug} href={`/blog/${post.slug}`} style={{ textDecoration: 'none', display: 'flex' }}>
                            <article className="glass-panel" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', flex: 1, cursor: 'pointer' }}>
                                <span style={{ fontSize: '0.7rem', color: '#fbbf24', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{post.category}</span>
                                <span style={{ color: '#64748b', fontSize: '0.75rem', marginTop: '0.2rem', marginBottom: '0.6rem' }}>{post.date}</span>
                                <p style={{ fontWeight: 700, fontSize: '0.9rem', lineHeight: 1.4, margin: '0 0 0.5rem', color: '#e2e8f0' }}>{post.title}</p>
                                <p style={{ color: '#94a3b8', fontSize: '0.8rem', lineHeight: 1.6, margin: 0, flex: 1 }}>{post.excerpt}</p>
                                <span style={{ fontSize: '0.8rem', color: 'var(--primary)', marginTop: '0.75rem', fontWeight: 600 }}>Read More →</span>
                            </article>
                        </Link>
                    ))}
                </div>
                <div style={{ textAlign: 'center' }}>
                    <Link href="/blog" style={{ color: '#c4b5fd', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 600 }}>View all articles →</Link>
                </div>
            </section>

            {/* ── Footer ── */}
            <footer style={{
                borderTop: '1px solid rgba(255,255,255,0.07)',
                padding: '2rem',
                display: 'flex',
                flexWrap: 'wrap',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: '1rem',
                fontSize: '0.8rem',
                color: '#64748b',
                maxWidth: '900px',
                margin: '0 auto',
            }}>
                <span>© 2026 Red Zone. All rights reserved.</span>
                <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
                    <Link href="/blog" style={{ color: '#64748b', textDecoration: 'none' }}>Blog</Link>
                    <Link href="/about" style={{ color: '#64748b', textDecoration: 'none' }}>About</Link>
                    <a href="https://ko-fi.com/denissalmon/tiers" target="_blank" rel="noopener noreferrer" style={{ color: '#64748b', textDecoration: 'none' }}>Membership</a>
                    <button
                        onClick={() => openModal('login')}
                        style={{ color: '#64748b', cursor: 'pointer', background: 'none', border: 'none', padding: 0, font: 'inherit' }}
                    >
                        Log In
                    </button>
                </div>
            </footer>

            {/* ── Auth Modal ── */}
            {modalMode && (
                <div
                    role="dialog"
                    aria-modal="true"
                    aria-label={modalMode === 'login' ? 'Sign in' : modalMode === 'signup' ? 'Create account' : 'Reset password'}
                    onClick={(e) => { if (e.target === e.currentTarget) closeModal(); }}
                    onKeyDown={(e) => { if (e.key === 'Escape') closeModal(); }}
                    style={{
                        position: 'fixed',
                        top: 0, left: 0, right: 0, bottom: 0,
                        background: 'rgba(15, 23, 42, 0.85)',
                        backdropFilter: 'blur(8px)',
                        zIndex: 100,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '1rem',
                        overflow: 'auto',
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

                            {(modalMode === 'login' || modalMode === 'signup') && (
                                <div style={fieldStyle}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                        <label style={{...labelStyle, marginBottom: 0}} htmlFor="password">Password</label>
                                        {modalMode === 'login' && (
                                            <button
                                                type="button"
                                                onClick={() => openModal('forgot-password')}
                                                style={{ fontSize: '0.78rem', color: '#c4b5fd', cursor: 'pointer', alignSelf: 'center', background: 'none', border: 'none', padding: 0, font: 'inherit' }}
                                            >
                                                Forgot password?
                                            </button>
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
                                <>Don't have an account?{' '}<button type="button" onClick={() => openModal('signup')} style={{ color: '#c4b5fd', cursor: 'pointer', fontWeight: 600, background: 'none', border: 'none', padding: 0, font: 'inherit' }}>Sign Up</button></>
                            ) : modalMode === 'signup' ? (
                                <>Already have an account?{' '}<button type="button" onClick={() => openModal('login')} style={{ color: '#c4b5fd', cursor: 'pointer', fontWeight: 600, background: 'none', border: 'none', padding: 0, font: 'inherit' }}>Log In</button></>
                            ) : (
                                <>Back to{' '}<button type="button" onClick={() => openModal('login')} style={{ color: '#c4b5fd', cursor: 'pointer', fontWeight: 600, background: 'none', border: 'none', padding: 0, font: 'inherit' }}>Log In</button></>
                            )}
                        </p>
                    </div>
                </div>
            )}
        </main>
    );
}
