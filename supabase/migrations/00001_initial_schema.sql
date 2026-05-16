-- Profiles
CREATE TABLE profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    avatar_url TEXT,
    xp_total INTEGER DEFAULT 0,
    current_phase INTEGER DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Lessons
CREATE TABLE lessons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    phase INTEGER NOT NULL,
    order_index INTEGER NOT NULL,
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    content_mdx TEXT NOT NULL,
    xp_reward INTEGER DEFAULT 100
);

-- Exercises
CREATE TABLE exercises (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lesson_id UUID REFERENCES lessons(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    instructions TEXT NOT NULL,
    starter_code TEXT,
    language TEXT DEFAULT 'python',
    xp_reward INTEGER DEFAULT 50
);

-- Hints
CREATE TABLE hints (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    exercise_id UUID REFERENCES exercises(id) ON DELETE CASCADE,
    level INTEGER CHECK (level IN (1, 2, 3)),
    content TEXT NOT NULL,
    xp_cost INTEGER DEFAULT 10
);

-- Test Cases
CREATE TABLE test_cases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    exercise_id UUID REFERENCES exercises(id) ON DELETE CASCADE,
    input TEXT,
    expected_output TEXT NOT NULL,
    feedback_on_fail TEXT,
    is_hidden BOOLEAN DEFAULT FALSE
);

-- User Progress
CREATE TABLE user_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    lesson_id UUID REFERENCES lessons(id) ON DELETE CASCADE,
    completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    xp_earned INTEGER DEFAULT 0,
    UNIQUE(user_id, lesson_id)
);

-- User Exercise Attempts
CREATE TABLE user_exercise_attempts (
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
CREATE TABLE hacking_labs (
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
CREATE TABLE lab_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    lab_id UUID REFERENCES hacking_labs(id) ON DELETE CASCADE,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    submitted_flag TEXT,
    UNIQUE(user_id, lab_id)
);

-- RLS Setup (Allow all authenticated users full access to everything)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow authenticated full access" ON profiles FOR ALL TO authenticated USING (true) WITH CHECK (true);

ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow authenticated full access" ON lessons FOR ALL TO authenticated USING (true) WITH CHECK (true);

ALTER TABLE exercises ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow authenticated full access" ON exercises FOR ALL TO authenticated USING (true) WITH CHECK (true);

ALTER TABLE hints ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow authenticated full access" ON hints FOR ALL TO authenticated USING (true) WITH CHECK (true);

ALTER TABLE test_cases ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow authenticated full access" ON test_cases FOR ALL TO authenticated USING (true) WITH CHECK (true);

ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow authenticated full access" ON user_progress FOR ALL TO authenticated USING (true) WITH CHECK (true);

ALTER TABLE user_exercise_attempts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow authenticated full access" ON user_exercise_attempts FOR ALL TO authenticated USING (true) WITH CHECK (true);

ALTER TABLE hacking_labs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow authenticated full access" ON hacking_labs FOR ALL TO authenticated USING (true) WITH CHECK (true);

ALTER TABLE lab_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow authenticated full access" ON lab_sessions FOR ALL TO authenticated USING (true) WITH CHECK (true);
