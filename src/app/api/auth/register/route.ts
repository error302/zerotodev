import { NextResponse } from 'next/server';
import { query } from '@/utils/db';
import { hashPassword } from '@/utils/auth';

export async function POST(request: Request) {
  try {
    const { email, password, username } = await request.json();

    if (!email || !password || !username) {
      return NextResponse.json(
        { error: 'Email, password, and username are required' },
        { status: 400 }
      );
    }

    const hashedPassword = await hashPassword(password);

    // Insert into users
    const userResult = await query(
      `INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING id`,
      [email, hashedPassword]
    );
    const userId = userResult.rows[0].id;

    // Insert into profiles
    await query(
      `INSERT INTO profiles (id, username) VALUES ($1, $2)`,
      [userId, username]
    );

    return NextResponse.json({ success: true, message: 'User registered successfully' });
  } catch (error: any) {
    console.error('Registration error:', error);
    if (error.code === '23505') { // Postgres unique violation
      return NextResponse.json({ error: 'Email or username already exists' }, { status: 409 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
