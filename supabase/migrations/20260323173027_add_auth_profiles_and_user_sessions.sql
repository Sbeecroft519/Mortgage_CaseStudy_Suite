/*
  # Add User Authentication and Profiles

  1. New Tables
    - `profiles` - User profile data linked to Supabase auth.users
      - `id` (uuid, primary key, FK to auth.users)
      - `email` (text) - User email from Google OAuth
      - `full_name` (text) - Display name from Google profile
      - `avatar_url` (text) - Google profile picture URL
      - `role` (text) - agent or admin
      - `created_at` / `updated_at` (timestamptz)

  2. Modified Tables
    - `simulation_sessions` - Added `user_id` column linking sessions to auth users

  3. Security
    - RLS enabled on profiles table
    - Users can only read and update their own profile
    - Simulation session policies updated: authenticated users own their sessions
    - Simulation decision policies updated: scoped to session owner
    - Case study read policy added for authenticated users
    - Case study create policy updated for authenticated users

  4. Functions
    - `handle_new_user()` - Trigger function to auto-create profile on signup
    - `get_user_dashboard_stats(uid)` - Returns dashboard stats for a specific user

  5. Important Notes
    - Existing anonymous session data will not be visible under new policies
    - All new sessions are tied to the authenticated user
    - Google OAuth profile data (name, avatar) are captured automatically
*/

-- Profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL DEFAULT '',
  full_name text NOT NULL DEFAULT '',
  avatar_url text NOT NULL DEFAULT '',
  role text NOT NULL DEFAULT 'agent' CHECK (role IN ('agent', 'admin')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.email, ''),
    COALESCE(
      NEW.raw_user_meta_data->>'full_name',
      NEW.raw_user_meta_data->>'name',
      ''
    ),
    COALESCE(
      NEW.raw_user_meta_data->>'avatar_url',
      NEW.raw_user_meta_data->>'picture',
      ''
    )
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- Add user_id column to simulation_sessions
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'simulation_sessions' AND column_name = 'user_id'
  ) THEN
    ALTER TABLE simulation_sessions ADD COLUMN user_id uuid REFERENCES auth.users(id);
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_sessions_user ON simulation_sessions(user_id);

-- Replace simulation_sessions anon policies with authenticated policies
DROP POLICY IF EXISTS "Read sessions for published case studies" ON simulation_sessions;
DROP POLICY IF EXISTS "Create sessions for published case studies" ON simulation_sessions;
DROP POLICY IF EXISTS "Update only in-progress sessions" ON simulation_sessions;

CREATE POLICY "Authenticated users read own sessions"
  ON simulation_sessions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Authenticated users create own sessions"
  ON simulation_sessions FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id
    AND agent_name != ''
    AND EXISTS (
      SELECT 1 FROM case_studies
      WHERE case_studies.id = case_study_id
      AND case_studies.published = true
    )
  );

CREATE POLICY "Authenticated users update own in-progress sessions"
  ON simulation_sessions FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id AND status = 'in_progress')
  WITH CHECK (auth.uid() = user_id);

-- Replace simulation_decisions anon policies with authenticated policies
DROP POLICY IF EXISTS "Read decisions for accessible sessions" ON simulation_decisions;
DROP POLICY IF EXISTS "Create decisions for active sessions" ON simulation_decisions;

CREATE POLICY "Authenticated users read own decisions"
  ON simulation_decisions FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM simulation_sessions
      WHERE simulation_sessions.id = simulation_decisions.session_id
      AND simulation_sessions.user_id = auth.uid()
    )
  );

CREATE POLICY "Authenticated users create decisions for own sessions"
  ON simulation_decisions FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM simulation_sessions
      WHERE simulation_sessions.id = session_id
      AND simulation_sessions.user_id = auth.uid()
      AND simulation_sessions.status = 'in_progress'
    )
  );

-- Add authenticated policies for case_studies (keep anon for backward compat)
CREATE POLICY "Authenticated users read published case studies"
  ON case_studies FOR SELECT
  TO authenticated
  USING (published = true);

-- Replace anon INSERT policy with authenticated one
DROP POLICY IF EXISTS "Create case studies with valid data" ON case_studies;

CREATE POLICY "Authenticated users create case studies"
  ON case_studies FOR INSERT
  TO authenticated
  WITH CHECK (
    title != ''
    AND difficulty IN ('beginner', 'intermediate', 'advanced')
  );

-- User-specific dashboard stats function
CREATE OR REPLACE FUNCTION get_user_dashboard_stats(uid uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result jsonb;
BEGIN
  SELECT jsonb_build_object(
    'total_sessions', (
      SELECT count(*) FROM simulation_sessions WHERE user_id = uid
    ),
    'completed_sessions', (
      SELECT count(*) FROM simulation_sessions
      WHERE user_id = uid AND status = 'completed'
    ),
    'avg_score_pct', (
      SELECT COALESCE(
        round(avg(total_score::numeric / NULLIF(max_possible_score, 0) * 100), 1),
        0
      )
      FROM simulation_sessions
      WHERE user_id = uid AND status = 'completed' AND max_possible_score > 0
    ),
    'best_score_pct', (
      SELECT COALESCE(
        round(max(total_score::numeric / NULLIF(max_possible_score, 0) * 100), 1),
        0
      )
      FROM simulation_sessions
      WHERE user_id = uid AND status = 'completed' AND max_possible_score > 0
    ),
    'by_difficulty', (
      SELECT COALESCE(jsonb_agg(row_to_json(d)), '[]'::jsonb)
      FROM (
        SELECT
          cs.difficulty,
          count(ss.id) as sessions,
          COALESCE(round(avg(ss.total_score::numeric / NULLIF(ss.max_possible_score, 0) * 100), 1), 0) as avg_score
        FROM simulation_sessions ss
        JOIN case_studies cs ON cs.id = ss.case_study_id
        WHERE ss.user_id = uid AND ss.status = 'completed'
        GROUP BY cs.difficulty
      ) d
    ),
    'recent_sessions', (
      SELECT COALESCE(jsonb_agg(row_to_json(r)), '[]'::jsonb)
      FROM (
        SELECT
          ss.id,
          ss.agent_name,
          cs.title as case_study_title,
          cs.difficulty,
          ss.total_score,
          ss.max_possible_score,
          ss.completed_at
        FROM simulation_sessions ss
        JOIN case_studies cs ON cs.id = ss.case_study_id
        WHERE ss.user_id = uid AND ss.status = 'completed'
        ORDER BY ss.completed_at DESC
        LIMIT 20
      ) r
    )
  ) INTO result;

  RETURN result;
END;
$$;

-- Function to promote a user to admin (run manually)
CREATE OR REPLACE FUNCTION promote_to_admin(user_email text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE profiles SET role = 'admin'
  WHERE email = user_email;
END;
$$;