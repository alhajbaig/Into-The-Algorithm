-- Into The Algorithm - Supabase Database Schema

-- 1. Create Profiles Table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT,
  role TEXT DEFAULT 'ML Engineer',
  avatar_url TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for Profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public profiles are viewable by everyone." ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile." ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile." ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- 2. Create Progress Table
CREATE TABLE IF NOT EXISTS public.progress (
  user_id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  cleared_levels INT[] DEFAULT '{}',
  total_stars INT DEFAULT 0,
  coins INT DEFAULT 0,
  badges TEXT[] DEFAULT '{}',
  streak INT DEFAULT 0,
  best_streak INT DEFAULT 0,
  raw_data JSONB DEFAULT '{}'::jsonb,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for Progress
ALTER TABLE public.progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own progress." ON public.progress FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can upsert own progress." ON public.progress FOR ALL USING (auth.uid() = user_id);

-- 3. Create Learning History Table
CREATE TABLE IF NOT EXISTS public.learning_history (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE,
  topic TEXT NOT NULL,
  mode TEXT NOT NULL,
  xp_earned INT DEFAULT 50,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for Learning History
ALTER TABLE public.learning_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own history." ON public.learning_history FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own history." ON public.learning_history FOR INSERT WITH CHECK (auth.uid() = user_id);
