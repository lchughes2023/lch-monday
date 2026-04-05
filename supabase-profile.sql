-- Run this in your Supabase SQL editor

CREATE TABLE IF NOT EXISTS profiles (
  user_id     uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name text,
  updated_at  timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'users manage own profile'
  ) THEN
    CREATE POLICY "users manage own profile" ON profiles
      FOR ALL USING (auth.uid() = user_id);
  END IF;
END $$;
