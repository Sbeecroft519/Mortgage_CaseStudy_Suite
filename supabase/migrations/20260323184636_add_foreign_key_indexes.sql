/*
  # Add indexes on unindexed foreign keys

  1. New Indexes
    - `idx_simulation_decisions_session_id` on `simulation_decisions(session_id)`
    - `idx_simulation_sessions_case_study_id` on `simulation_sessions(case_study_id)`
    - `idx_simulation_sessions_user_id` on `simulation_sessions(user_id)`

  2. Rationale
    - Foreign keys without covering indexes cause full table scans on JOIN and CASCADE operations
    - Adding these indexes improves query performance for session lookups, cascade deletes, and RLS policy evaluation
*/

CREATE INDEX IF NOT EXISTS idx_simulation_decisions_session_id
  ON public.simulation_decisions (session_id);

CREATE INDEX IF NOT EXISTS idx_simulation_sessions_case_study_id
  ON public.simulation_sessions (case_study_id);

CREATE INDEX IF NOT EXISTS idx_simulation_sessions_user_id
  ON public.simulation_sessions (user_id);
