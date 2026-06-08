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

import { useEffect } from 'react';
import {
  BarChart3,
  Target,
  Award,
  TrendingUp,
  Clock,
  CheckCircle2,
  Loader2,
  Activity,
} from 'lucide-react';
import { GlassCard } from '../components/ui/GlassCard';
import { useDashboard } from '../hooks/useDashboard';

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-CA', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

const diffBadge: Record<string, string> = {
  beginner: 'badge-beginner',
  intermediate: 'badge-intermediate',
  advanced: 'badge-advanced',
};

export function DashboardPage() {
  const { stats, loading, fetchStats } = useDashboard();

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="w-6 h-6 text-cyan-700 animate-spin" />
      </div>
    );
  }

  const completionRate =
    stats.total_sessions > 0
      ? Math.round((stats.completed_sessions / stats.total_sessions) * 100)
      : 0;

  const statCards = [
    {
      label: 'Total Sessions',
      value: stats.total_sessions,
      icon: Activity,
      color: 'text-cyan-700 bg-cyan-100/80',
    },
    {
      label: 'Completed',
      value: stats.completed_sessions,
      icon: CheckCircle2,
      color: 'text-emerald-600 bg-emerald-100/80',
    },
    {
      label: 'Average Score',
      value: `${stats.avg_score_pct}%`,
      icon: Target,
      color: 'text-cyan-600 bg-cyan-100/80',
    },
    {
      label: 'Best Score',
      value: `${stats.best_score_pct}%`,
      icon: Award,
      color: 'text-amber-600 bg-amber-100/80',
    },
    {
      label: 'Completion Rate',
      value: `${completionRate}%`,
      icon: TrendingUp,
      color: 'text-cyan-700 bg-cyan-100/80',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
          <BarChart3 className="w-6 h-6 text-cyan-700" />
          Performance Dashboard
        </h1>
        <p className="text-slate-500 mt-1">
          Track your training progress and identify areas for improvement
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        {statCards.map((card) => (
          <GlassCard key={card.label} className="text-center p-5">
            <div
              className={`w-9 h-9 rounded-lg ${card.color} flex items-center justify-center mx-auto mb-3`}
            >
              <card.icon className="w-4.5 h-4.5" />
            </div>
            <div className="text-2xl font-bold text-slate-900">{card.value}</div>
            <div className="text-xs text-slate-500 mt-0.5">{card.label}</div>
          </GlassCard>
        ))}
      </div>

      {stats.by_difficulty.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">
            Performance by Difficulty
          </h2>
          <div className="grid sm:grid-cols-3 gap-4">
            {stats.by_difficulty.map((d) => (
              <GlassCard key={d.difficulty}>
                <div className="flex items-center justify-between mb-3">
                  <span className={diffBadge[d.difficulty] || 'badge'}>
                    {d.difficulty}
                  </span>
                  <span className="text-xs text-slate-400">
                    {d.sessions} session{d.sessions !== 1 ? 's' : ''}
                  </span>
                </div>
                <div className="flex items-end gap-2">
                  <span className="text-3xl font-bold text-slate-900">
                    {d.avg_score}%
                  </span>
                  <span className="text-sm text-slate-500 mb-1">avg score</span>
                </div>
                <div className="mt-3 h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-cyan-600 rounded-full transition-all duration-700"
                    style={{ width: `${d.avg_score}%` }}
                  />
                </div>
              </GlassCard>
            ))}
          </div>
        </div>
      )}

      <div>
        <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
          <Clock className="w-5 h-5 text-slate-400" />
          Recent Sessions
        </h2>

        {stats.recent_sessions.length === 0 ? (
          <GlassCard className="text-center py-12">
            <p className="text-slate-500">
              No completed sessions yet. Start a simulation to see your results
              here.
            </p>
          </GlassCard>
        ) : (
          <GlassCard padding={false}>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100/60">
                    <th className="text-left p-4 font-medium text-slate-500">
                      Agent
                    </th>
                    <th className="text-left p-4 font-medium text-slate-500">
                      Case Study
                    </th>
                    <th className="text-left p-4 font-medium text-slate-500">
                      Difficulty
                    </th>
                    <th className="text-left p-4 font-medium text-slate-500">
                      Score
                    </th>
                    <th className="text-left p-4 font-medium text-slate-500">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {stats.recent_sessions.map((s) => {
                    const pct =
                      s.max_possible_score > 0
                        ? Math.round(
                            (s.total_score / s.max_possible_score) * 100
                          )
                        : 0;
                    return (
                      <tr
                        key={s.id}
                        className="border-b border-slate-50/60 last:border-0 hover:bg-white/40 transition-colors"
                      >
                        <td className="p-4 font-medium text-slate-800">
                          {s.agent_name}
                        </td>
                        <td className="p-4 text-slate-600">
                          {s.case_study_title}
                        </td>
                        <td className="p-4">
                          <span className={diffBadge[s.difficulty] || 'badge'}>
                            {s.difficulty}
                          </span>
                        </td>
                        <td className="p-4">
                          <span
                            className={`font-semibold ${
                              pct >= 80
                                ? 'text-emerald-600'
                                : pct >= 60
                                  ? 'text-amber-600'
                                  : 'text-rose-600'
                            }`}
                          >
                            {s.total_score}/{s.max_possible_score} ({pct}%)
                          </span>
                        </td>
                        <td className="p-4 text-slate-400">
                          {formatDate(s.completed_at)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </GlassCard>
        )}
      </div>
    </div>
  );
}
