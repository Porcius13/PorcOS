import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { password } = await request.json();
    
    // In production, user will set APP_PASSWORD in Vercel. For dev, fallback to standard or handle missing.
    const correctPassword = process.env.APP_PASSWORD;

    if (!correctPassword) {
       console.error("APP_PASSWORD environment variable is not set!");
       return NextResponse.json({ success: false, error: 'Sistem hatası: Şifre tanımlanmamış.' }, { status: 500 });
    }

    if (password === correctPassword) {
      const cookieStore = await cookies();
      cookieStore.set('auth-token', 'authenticated', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 60 * 60 * 24 * 30, // 30 days
        path: '/',
      });

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ success: false, error: 'Hatalı şifre' }, { status: 401 });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Sunucu hatası' }, { status: 500 });
  }
}
