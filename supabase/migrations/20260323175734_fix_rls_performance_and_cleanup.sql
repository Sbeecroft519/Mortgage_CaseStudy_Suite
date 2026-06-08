/*
  # Fix RLS Performance, Remove Unused Indexes, Fix Mutable Search Path

  1. RLS Policy Updates (Performance)
    - Replace `auth.uid()` with `(select auth.uid())` in all policies
    - This prevents re-evaluation of the auth function for each row
    - Affected tables: profiles, simulation_sessions, simulation_decisions

  2. Dropped Unused Indexes
    - `idx_case_studies_published` on case_studies
    - `idx_case_studies_difficulty` on case_studies
    - `idx_sessions_case_study` on simulation_sessions
    - `idx_sessions_agent` on simulation_sessions
    - `idx_decisions_session` on simulation_decisions
    - `idx_sessions_user` on simulation_sessions

  3. Function Fix
    - `update_updated_at()` - Added immutable search_path to prevent mutable search_path vulnerability
*/

-- ============================================================
-- 1. Fix RLS policies on profiles table
-- ============================================================

DROP POLICY IF EXISTS "Users can read own profile" ON profiles;
CREATE POLICY "Users can read own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = id);

DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = id)
  WITH CHECK ((select auth.uid()) = id);

-- ============================================================
-- 2. Fix RLS policies on simulation_sessions table
-- ============================================================

DROP POLICY IF EXISTS "Authenticated users read own sessions" ON simulation_sessions;
CREATE POLICY "Authenticated users read own sessions"
  ON simulation_sessions FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Authenticated users create own sessions" ON simulation_sessions;
CREATE POLICY "Authenticated users create own sessions"
  ON simulation_sessions FOR INSERT
  TO authenticated
  WITH CHECK (
    (select auth.uid()) = user_id
    AND agent_name != ''
    AND EXISTS (
      SELECT 1 FROM case_studies
      WHERE case_studies.id = case_study_id
      AND case_studies.published = true
    )
  );

DROP POLICY IF EXISTS "Authenticated users update own in-progress sessions" ON simulation_sessions;
CREATE POLICY "Authenticated users update own in-progress sessions"
  ON simulation_sessions FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = user_id AND status = 'in_progress')
  WITH CHECK ((select auth.uid()) = user_id);

-- ============================================================
-- 3. Fix RLS policies on simulation_decisions table
-- ============================================================

DROP POLICY IF EXISTS "Authenticated users read own decisions" ON simulation_decisions;
CREATE POLICY "Authenticated users read own decisions"
  ON simulation_decisions FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM simulation_sessions
      WHERE simulation_sessions.id = simulation_decisions.session_id
      AND simulation_sessions.user_id = (select auth.uid())
    )
  );

DROP POLICY IF EXISTS "Authenticated users create decisions for own sessions" ON simulation_decisions;
CREATE POLICY "Authenticated users create decisions for own sessions"
  ON simulation_decisions FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM simulation_sessions
      WHERE simulation_sessions.id = session_id
      AND simulation_sessions.user_id = (select auth.uid())
      AND simulation_sessions.status = 'in_progress'
    )
  );

-- ============================================================
-- 4. Drop unused indexes
-- ============================================================

DROP INDEX IF EXISTS idx_case_studies_published;
DROP INDEX IF EXISTS idx_case_studies_difficulty;
DROP INDEX IF EXISTS idx_sessions_case_study;
DROP INDEX IF EXISTS idx_sessions_agent;
DROP INDEX IF EXISTS idx_decisions_session;
DROP INDEX IF EXISTS idx_sessions_user;

-- ============================================================
-- 5. Fix mutable search_path on update_updated_at function
-- ============================================================

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;