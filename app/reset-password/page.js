'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

function ResetPasswordForm() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const token = searchParams.get('token');
    
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!token) {
            setError('Missing reset token. Please check your link.');
        }
    }, [token]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            setLoading(false);
            return;
        }

        if (password.length < 8) {
            setError('Password must be at least 8 characters long');
            setLoading(false);
            return;
        }

        try {
            const res = await fetch('/api/auth/reset-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token, password }),
            });

            const data = await res.json();

            if (res.ok) {
                setSuccess(true);
                setTimeout(() => {
                    router.push('/');
                }, 3000);
            } else {
                setError(data.error || 'Failed to reset password');
            }
        } catch (err) {
            setError('An internal error occurred');
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="glass-panel" style={{ maxWidth: '450px', width: '100%', padding: '2.5rem', textAlign: 'center' }}>
                <h2 style={{ marginBottom: '1rem', color: '#6ee7b7' }}>Success!</h2>
                <p style={{ color: '#94a3b8', marginBottom: '1.5rem' }}>Your password has been reset successfully. Redirecting you to login...</p>
                <div className="btn" onClick={() => router.push('/')} style={{ cursor: 'pointer' }}>Go to Login</div>
            </div>
        );
    }

    return (
        <div className="glass-panel" style={{ maxWidth: '450px', width: '100%', padding: '2.5rem' }}>
            <h2 style={{ textAlign: 'center', marginBottom: '0.5rem', fontSize: '2rem' }}>New Password</h2>
            <p style={{ textAlign: 'center', color: '#94a3b8', marginBottom: '2rem' }}>Enter a new strong password for your account</p>

            {error && (
                <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#fca5a5', padding: '0.75rem', borderRadius: '8px', marginBottom: '1.5rem', textAlign: 'center', fontSize: '0.875rem', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: '1.5rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>New Password</label>
                    <input
                        type="password"
                        className="input"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        placeholder="••••••••"
                        minLength={8}
                    />
                </div>

                <div style={{ marginBottom: '2rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Confirm New Password</label>
                    <input
                        type="password"
                        className="input"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        placeholder="••••••••"
                        minLength={8}
                    />
                </div>

                <button type="submit" className="btn" style={{ width: '100%', padding: '1rem', fontSize: '1rem' }} disabled={loading || !token}>
                    {loading ? 'Resetting...' : 'Update Password'}
                </button>
            </form>
        </div>
    );
}

export default function ResetPasswordPage() {
    return (
        <main className="container" style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '100vh',
            padding: '1rem'
        }}>
            <Suspense fallback={<div className="glass-panel">Loading...</div>}>
                <ResetPasswordForm />
            </Suspense>
        </main>
    );
}
