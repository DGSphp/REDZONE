import { NextResponse } from 'next/server';
import { logout } from '@/lib/auth';

export async function POST(request) {
    await logout();
    return new Response(null, {
        status: 302,
        headers: { Location: '/' }
    });
}
