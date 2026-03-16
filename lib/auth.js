import { SignJWT, jwtVerify } from 'jose';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';
import { getUserById } from './db';

const SECRET_KEY = process.env.JWT_SECRET || 'partnership-harmony-secret-key-change-this';
const key = new TextEncoder().encode(SECRET_KEY);

/**
 * Password Logic
 */
export async function hashPassword(password) {
    return await bcrypt.hash(password, 10);
}

export async function comparePassword(password, hash) {
    return await bcrypt.compare(password, hash);
}

/**
 * JWT Logic
 */
export async function encrypt(payload) {
    return await new SignJWT(payload)
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime('24h')
        .sign(key);
}

export async function decrypt(input) {
    const { payload } = await jwtVerify(input, key, {
        algorithms: ['HS256'],
    });
    return payload;
}

/**
 * Session Helpers
 */
export async function login(user) {
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
    const session = await encrypt({ userId: user.id, email: user.email, name: user.name, expires });

    (await cookies()).set('session', session, { expires, httpOnly: true, secure: process.env.NODE_ENV === 'production' });
}

export async function logout() {
    (await cookies()).set('session', '', { expires: new Date(0) });
}

export async function getSession() {
    const session = (await cookies()).get('session')?.value;
    if (!session) return null;
    try {
        return await decrypt(session);
    } catch (e) {
        return null;
    }
}

export async function getCurrentUser() {
    const session = await getSession();
    if (!session) return null;

    const user = await getUserById(session.userId);
    if (!user) return null;

    // Don't return the password
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
}
