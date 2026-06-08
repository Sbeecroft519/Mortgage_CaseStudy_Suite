/*
  # Mortgage Training Platform - Initial Schema

  1. New Tables
    - `case_studies` - Mortgage case study definitions with client profiles,
      property details, financial information, and interactive decision scenarios
      - `id` (uuid, primary key)
      - `title` (text) - Case study title
      - `description` (text) - Brief description of the scenario
      - `difficulty` (text) - beginner, intermediate, or advanced
      - `category` (text) - Mortgage scenario category
      - `client_profile` (jsonb) - Client demographic and employment data
      - `property_details` (jsonb) - Property type, location, price
      - `financial_details` (jsonb) - Down payment, debts, assets
      - `scenarios` (jsonb) - Array of interactive decision-point scenarios
      - `published` (boolean) - Whether available to agents for simulation
      - `created_at` / `updated_at` (timestamptz)

    - `simulation_sessions` - Tracks each agent's practice session
      - `id` (uuid, primary key)
      - `agent_name` (text) - Name of the practicing agent
      - `case_study_id` (uuid, FK) - Which case study was simulated
      - `status` (text) - in_progress or completed
      - `total_score` (integer) - Points earned in this session
      - `max_possible_score` (integer) - Maximum achievable points
      - `started_at` / `completed_at` (timestamptz)

    - `simulation_decisions` - Individual decisions made during a session
      - `id` (uuid, primary key)
      - `session_id` (uuid, FK) - Parent simulation session
      - `scenario_index` (integer) - Which scenario step (0-based)
      - `option_chosen` (text) - The option ID the agent selected
      - `is_correct` (boolean) - Whether the choice was correct
      - `points_earned` (integer) - Points awarded for this decision
      - `created_at` (timestamptz)

  2. Security
    - RLS enabled on all three tables
    - Case studies: public read for published, validated inserts
    - Sessions: linked to published case studies, status-gated updates
    - Decisions: linked to active sessions only
    - Admin functions (SECURITY DEFINER) for managing unpublished content

  3. Indexes
    - Optimized lookups on published, difficulty, foreign keys, agent_name

  4. Functions
    - `get_all_case_studies()` - Admin read bypassing RLS
    - `update_case_study()` - Admin update bypassing RLS
    - `update_updated_at()` - Trigger to auto-set updated_at
*/

-- Case Studies table
CREATE TABLE IF NOT EXISTS case_studies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL DEFAULT '',
  difficulty text NOT NULL DEFAULT 'beginner'
    CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
  category text NOT NULL DEFAULT 'general',
  client_profile jsonb NOT NULL DEFAULT '{}',
  property_details jsonb NOT NULL DEFAULT '{}',
  financial_details jsonb NOT NULL DEFAULT '{}',
  scenarios jsonb NOT NULL DEFAULT '[]',
  published boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE case_studies ENABLE ROW LEVEL SECURITY;

-- Simulation Sessions table
CREATE TABLE IF NOT EXISTS simulation_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_name text NOT NULL DEFAULT '',
  case_study_id uuid NOT NULL REFERENCES case_studies(id),
  status text NOT NULL DEFAULT 'in_progress'
    CHECK (status IN ('in_progress', 'completed')),
  total_score integer NOT NULL DEFAULT 0,
  max_possible_score integer NOT NULL DEFAULT 0,
  started_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz
);

ALTER TABLE simulation_sessions ENABLE ROW LEVEL SECURITY;

-- Simulation Decisions table
CREATE TABLE IF NOT EXISTS simulation_decisions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL REFERENCES simulation_sessions(id) ON DELETE CASCADE,
  scenario_index integer NOT NULL DEFAULT 0,
  option_chosen text NOT NULL DEFAULT '',
  is_correct boolean NOT NULL DEFAULT false,
  points_earned integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE simulation_decisions ENABLE ROW LEVEL SECURITY;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_case_studies_published ON case_studies(published);
CREATE INDEX IF NOT EXISTS idx_case_studies_difficulty ON case_studies(difficulty);
CREATE INDEX IF NOT EXISTS idx_sessions_case_study ON simulation_sessions(case_study_id);
CREATE INDEX IF NOT EXISTS idx_sessions_agent ON simulation_sessions(agent_name);
CREATE INDEX IF NOT EXISTS idx_decisions_session ON simulation_decisions(session_id);

-- Auto-update trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER case_studies_updated_at
  BEFORE UPDATE ON case_studies
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- RLS Policies: case_studies
CREATE POLICY "Agents can read published case studies"
  ON case_studies FOR SELECT
  TO anon
  USING (published = true);

CREATE POLICY "Create case studies with valid data"
  ON case_studies FOR INSERT
  TO anon
  WITH CHECK (
    title != ''
    AND difficulty IN ('beginner', 'intermediate', 'advanced')
  );

-- RLS Policies: simulation_sessions
CREATE POLICY "Read sessions for published case studies"
  ON simulation_sessions FOR SELECT
  TO anon
  USING (
    EXISTS (
      SELECT 1 FROM case_studies
      WHERE case_studies.id = simulation_sessions.case_study_id
      AND case_studies.published = true
    )
  );

CREATE POLICY "Create sessions for published case studies"
  ON simulation_sessions FOR INSERT
  TO anon
  WITH CHECK (
    agent_name != ''
    AND EXISTS (
      SELECT 1 FROM case_studies
      WHERE case_studies.id = case_study_id
      AND case_studies.published = true
    )
  );

CREATE POLICY "Update only in-progress sessions"
  ON simulation_sessions FOR UPDATE
  TO anon
  USING (status = 'in_progress')
  WITH CHECK (status IN ('in_progress', 'completed'));

-- RLS Policies: simulation_decisions
CREATE POLICY "Read decisions for accessible sessions"
  ON simulation_decisions FOR SELECT
  TO anon
  USING (
    EXISTS (
      SELECT 1 FROM simulation_sessions
      WHERE simulation_sessions.id = simulation_decisions.session_id
    )
  );

CREATE POLICY "Create decisions for active sessions"
  ON simulation_decisions FOR INSERT
  TO anon
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM simulation_sessions
      WHERE simulation_sessions.id = session_id
      AND simulation_sessions.status = 'in_progress'
    )
  );

-- Admin function: get all case studies (including unpublished)
CREATE OR REPLACE FUNCTION get_all_case_studies()
RETURNS SETOF case_studies
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT * FROM case_studies ORDER BY created_at DESC;
$$;

-- Admin function: update any case study by ID
CREATE OR REPLACE FUNCTION update_case_study(study_id uuid, data jsonb)
RETURNS SETOF case_studies
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  UPDATE case_studies SET
    title = COALESCE(data->>'title', title),
    description = COALESCE(data->>'description', description),
    difficulty = COALESCE(data->>'difficulty', difficulty),
    category = COALESCE(data->>'category', category),
    client_profile = COALESCE(data->'client_profile', client_profile),
    property_details = COALESCE(data->'property_details', property_details),
    financial_details = COALESCE(data->'financial_details', financial_details),
    scenarios = COALESCE(data->'scenarios', scenarios),
    published = COALESCE((data->>'published')::boolean, published),
    updated_at = now()
  WHERE id = study_id
  RETURNING *;
END;
$$;

-- Dashboard function: get aggregate stats
CREATE OR REPLACE FUNCTION get_dashboard_stats()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result jsonb;
BEGIN
  SELECT jsonb_build_object(
    'total_sessions', (SELECT count(*) FROM simulation_sessions),
    'completed_sessions', (SELECT count(*) FROM simulation_sessions WHERE status = 'completed'),
    'avg_score_pct', (
      SELECT COALESCE(
        round(avg(total_score::numeric / NULLIF(max_possible_score, 0) * 100), 1),
        0
      )
      FROM simulation_sessions
      WHERE status = 'completed' AND max_possible_score > 0
    ),
    'best_score_pct', (
      SELECT COALESCE(
        round(max(total_score::numeric / NULLIF(max_possible_score, 0) * 100), 1),
        0
      )
      FROM simulation_sessions
      WHERE status = 'completed' AND max_possible_score > 0
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
        WHERE ss.status = 'completed'
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
        WHERE ss.status = 'completed'
        ORDER BY ss.completed_at DESC
        LIMIT 20
      ) r
    )
  ) INTO result;

  RETURN result;
END;
$$;