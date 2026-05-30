import { NextResponse } from 'next/server';
import { createUser, getUserByEmail, checkAndRecordRateLimit } from '@/lib/db';
import { hashPassword, login, checkCsrf } from '@/lib/auth';

export async function POST(request) {
    try {
        const csrfError = checkCsrf(request);
        if (csrfError) return csrfError;

        const { name, email, password } = await request.json();

        if (!name || !email || !password) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        if (typeof name !== 'string' || typeof email !== 'string' || typeof password !== 'string') {
            return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
        }

        if (name.length > 100 || email.length > 254 || password.length > 128) {
            return NextResponse.json({ error: 'Input too long' }, { status: 400 });
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            return NextResponse.json({ error: 'Invalid email format' }, { status: 400 });
        }

        if (password.length < 8) {
            return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 });
        }

        // Rate limit: 5 signups per IP per hour
        const ip = request.headers.get('cf-connecting-ip') || 'unknown';
        const rateLimitKey = `signup:${ip}`;
        const allowed = await checkAndRecordRateLimit(rateLimitKey, 5, 3600);
        if (!allowed) {
            return NextResponse.json({ error: 'Too many signup attempts. Please try again later.' }, { status: 429 });
        }

        const normalizedEmail = email.toLowerCase().trim();
        const existingUser = await getUserByEmail(normalizedEmail);
        if (existingUser) {
            return NextResponse.json({ error: 'Unable to create account. Please try a different email or log in.' }, { status: 400 });
        }

        const hashedPassword = await hashPassword(password);
        const userId = await createUser(name.trim(), normalizedEmail, hashedPassword);

        const user = { id: userId, name, email, role: 'user' };
        await login(user);

        return NextResponse.json({ message: 'User created successfully', userId });
    } catch (error) {
        console.error('Signup error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
