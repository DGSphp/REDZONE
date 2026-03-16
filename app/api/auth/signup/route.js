import { NextResponse } from 'next/server';
import { createUser, getUserByEmail } from '@/lib/db';
import { hashPassword, login } from '@/lib/auth';

export async function POST(request) {
    try {
        const { name, email, password } = await request.json();

        if (!name || !email || !password) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const existingUser = await getUserByEmail(email);
        if (existingUser) {
            return NextResponse.json({ error: 'User already exists' }, { status: 400 });
        }

        const hashedPassword = await hashPassword(password);
        const userId = await createUser(name, email, hashedPassword);

        const user = { id: userId, name, email };
        await login(user);

        return NextResponse.json({ message: 'User created successfully', userId });
    } catch (error) {
        console.error('Signup error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
