import { NextResponse } from 'next/server';
import { getUserByEmail, checkAndRecordRateLimit } from '@/lib/db';
import { comparePassword, login, checkCsrf } from '@/lib/auth';

export async function POST(request) {
    try {
        const csrfError = checkCsrf(request);
        if (csrfError) return csrfError;

        const { email, password } = await request.json();

        if (!email || !password) {
            return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
        }

        if (typeof email !== 'string' || typeof password !== 'string' || email.length > 254 || password.length > 128) {
            return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            return NextResponse.json({ error: 'Invalid email format' }, { status: 400 });
        }

        // Rate limit: 10 attempts per email per 15 minutes
        const rateLimitKey = `login:${email.toLowerCase().trim()}`;
        const allowed = await checkAndRecordRateLimit(rateLimitKey, 10, 900);
        if (!allowed) {
            return NextResponse.json({ error: 'Too many login attempts. Please try again in 15 minutes.' }, { status: 429 });
        }

        const user = await getUserByEmail(email.toLowerCase().trim());
        if (!user) {
            return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
        }

        const isMatch = await comparePassword(password, user.password);
        if (!isMatch) {
            return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
        }

        await login(user);

        return NextResponse.json({ message: 'Logged in successfully' });
    } catch (error) {
        console.error('Login error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
