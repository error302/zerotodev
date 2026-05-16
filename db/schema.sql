-- PostgreSQL Schema for ZeroToDev

-- Enable uuid-ossp extension if not available (gen_random_uuid is built-in for modern pg)
-- CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users (replaces Supabase Auth)
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Profiles
CREATE TABLE IF NOT EXISTS profiles (
    id UUID REFERENCES users(id) ON DELETE CASCADE PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    avatar_url TEXT,
    xp_total INTEGER DEFAULT 0,
    current_phase INTEGER DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Lessons
CREATE TABLE IF NOT EXISTS lessons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    phase INTEGER NOT NULL,
    order_index INTEGER NOT NULL,
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    content_mdx TEXT NOT NULL,
    xp_reward INTEGER DEFAULT 100
);

-- Exercises
CREATE TABLE IF NOT EXISTS exercises (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lesson_id UUID REFERENCES lessons(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    instructions TEXT NOT NULL,
    starter_code TEXT,
    language TEXT DEFAULT 'python',
    xp_reward INTEGER DEFAULT 50
);

-- Hints
CREATE TABLE IF NOT EXISTS hints (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    exercise_id UUID REFERENCES exercises(id) ON DELETE CASCADE,
    level INTEGER CHECK (level IN (1, 2, 3)),
    content TEXT NOT NULL,
    xp_cost INTEGER DEFAULT 10
);

-- Test Cases
CREATE TABLE IF NOT EXISTS test_cases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    exercise_id UUID REFERENCES exercises(id) ON DELETE CASCADE,
    input TEXT,
    expected_output TEXT NOT NULL,
    feedback_on_fail TEXT,
    is_hidden BOOLEAN DEFAULT FALSE
);

-- User Progress
CREATE TABLE IF NOT EXISTS user_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    lesson_id UUID REFERENCES lessons(id) ON DELETE CASCADE,
    completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    xp_earned INTEGER DEFAULT 0,
    UNIQUE(user_id, lesson_id)
);

-- User Exercise Attempts
CREATE TABLE IF NOT EXISTS user_exercise_attempts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    exercise_id UUID REFERENCES exercises(id) ON DELETE CASCADE,
    passed BOOLEAN DEFAULT FALSE,
    hints_used INTEGER DEFAULT 0,
    attempts INTEGER DEFAULT 0,
    last_attempt_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, exercise_id)
);

-- Hacking Labs (CTF)
CREATE TABLE IF NOT EXISTS hacking_labs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    phase INTEGER NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    difficulty TEXT,
    xp_reward INTEGER DEFAULT 500,
    expected_flag TEXT NOT NULL,
    download_url TEXT
);

-- Lab Sessions (CTF Submissions)
CREATE TABLE IF NOT EXISTS lab_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    lab_id UUID REFERENCES hacking_labs(id) ON DELETE CASCADE,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    submitted_flag TEXT,
    UNIQUE(user_id, lab_id)
);
