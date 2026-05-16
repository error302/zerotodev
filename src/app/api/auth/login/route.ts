import { NextResponse } from 'next/server';
import { query } from '@/utils/db';
import { verifyPassword, encrypt } from '@/utils/auth';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    const userResult = await query(`SELECT * FROM users WHERE email = $1`, [email]);
    if (userResult.rowCount === 0) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const user = userResult.rows[0];
    const isValid = await verifyPassword(password, user.password_hash);

    if (!isValid) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    // Create session
    const sessionToken = await encrypt({ userId: user.id, email: user.email });

    // Set cookie
    (await cookies()).set('session', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 // 1 day
    });

    return NextResponse.json({ success: true, message: 'Logged in successfully' });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
