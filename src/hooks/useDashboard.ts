// Copyright 2026 Stephen Beecroft | Thinkbot Marketing
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import { useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { DashboardStats } from '../types';

const emptyStats: DashboardStats = {
  total_sessions: 0,
  completed_sessions: 0,
  avg_score_pct: 0,
  best_score_pct: 0,
  by_difficulty: [],
  recent_sessions: [],
};

export function useDashboard() {
  const [stats, setStats] = useState<DashboardStats>(emptyStats);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    setError(null);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setLoading(false);
      return;
    }

    const { data, error: err } = await supabase.rpc(
      'get_user_dashboard_stats',
      { uid: user.id }
    );

    if (err) {
      setError(err.message);
      setLoading(false);
      return;
    }

    setStats((data as DashboardStats) || emptyStats);
    setLoading(false);
  }, []);

  return { stats, loading, error, fetchStats };
}
