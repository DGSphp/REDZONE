import { SignJWT, jwtVerify } from 'jose';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { getUserById } from './db';

// Lazy accessor — env is only available during request handling on Cloudflare Workers
function getKey() {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
        throw new Error('JWT_SECRET environment variable is not set.');
    }
    return new TextEncoder().encode(secret);
}

/**
 * Password Logic
 */
export async function hashPassword(password) {
    return await bcrypt.hash(password, 12);
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
        .sign(getKey());
}

export async function decrypt(input) {
    const { payload } = await jwtVerify(input, getKey(), {
        algorithms: ['HS256'],
    });
    return payload;
}

/**
 * Session Helpers
 */
export async function login(user) {
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
    const session = await encrypt({ userId: user.id, email: user.email, name: user.name, role: user.role, expires });

    (await cookies()).set('session', session, { expires, httpOnly: true, secure: true, sameSite: 'lax', path: '/' });
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

/**
 * CSRF Protection — verifies Origin header matches expected host.
 * Returns null if OK, or a NextResponse error if CSRF check fails.
 */
export function checkCsrf(request) {
    const origin = request.headers.get('origin');
    // Allow requests with no Origin (same-origin non-browser clients, Telegram webhooks)
    if (!origin) return null;
    try {
        const originUrl = new URL(origin);
        // Validate against known allowed origins
        const allowedHosts = ['redzonecouple.site', 'www.redzonecouple.site'];
        // Allow localhost only in development
        if (process.env.NODE_ENV === 'development' && (originUrl.hostname === 'localhost' || originUrl.hostname === '127.0.0.1')) return null;
        if (allowedHosts.includes(originUrl.host)) return null;
    } catch (e) {
        // Invalid origin URL
    }
    return NextResponse.json({ error: 'CSRF validation failed' }, { status: 403 });
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
