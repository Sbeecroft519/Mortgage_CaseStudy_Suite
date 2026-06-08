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

import {
  Trophy,
  CheckCircle2,
  XCircle,
  BarChart3,
  RotateCcw,
  BookOpen,
} from 'lucide-react';
import { GlassCard } from '../ui/GlassCard';
import type { CaseStudy, SimulationSession, SimulationDecision } from '../../types';

interface SimulationCompleteProps {
  caseStudy: CaseStudy;
  session: SimulationSession;
  decisions: SimulationDecision[];
  onViewDashboard: () => void;
  onRetry: () => void;
  onLibrary: () => void;
}

export function SimulationComplete({
  caseStudy,
  session,
  decisions,
  onViewDashboard,
  onRetry,
  onLibrary,
}: SimulationCompleteProps) {
  const pct =
    session.max_possible_score > 0
      ? Math.round((session.total_score / session.max_possible_score) * 100)
      : 0;

  const correctCount = decisions.filter((d) => d.is_correct).length;
  const totalCount = decisions.length;

  const grade =
    pct >= 90
      ? { label: 'Excellent', color: 'text-emerald-600', bg: 'bg-emerald-100/80' }
      : pct >= 70
        ? { label: 'Good', color: 'text-cyan-700', bg: 'bg-cyan-100/80' }
        : pct >= 50
          ? { label: 'Fair', color: 'text-amber-600', bg: 'bg-amber-100/80' }
          : { label: 'Needs Work', color: 'text-rose-600', bg: 'bg-rose-100/80' };

  return (
    <div className="max-w-2xl mx-auto animate-slide-up">
      <div className="text-center mb-8">
        <div
          className={`w-20 h-20 rounded-2xl ${grade.bg} flex items-center justify-center mx-auto mb-4`}
        >
          <Trophy className={`w-10 h-10 ${grade.color}`} />
        </div>
        <h2 className="text-3xl font-bold text-slate-900 mb-1">
          Simulation Complete
        </h2>
        <p className="text-slate-500">{caseStudy.title}</p>
      </div>

      <GlassCard className="mb-6">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className={`text-3xl font-bold ${grade.color}`}>{pct}%</div>
            <div className="text-xs text-slate-500 mt-1">Score</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-slate-900">
              {correctCount}/{totalCount}
            </div>
            <div className="text-xs text-slate-500 mt-1">Correct</div>
          </div>
          <div>
            <div className={`text-lg font-semibold ${grade.color} ${grade.bg} inline-block px-3 py-1 rounded-lg`}>
              {grade.label}
            </div>
            <div className="text-xs text-slate-500 mt-1">Grade</div>
          </div>
        </div>

        <div className="mt-6 h-3 bg-slate-100 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-1000 ${
              pct >= 70 ? 'bg-emerald-500' : pct >= 50 ? 'bg-amber-500' : 'bg-rose-500'
            }`}
            style={{ width: `${pct}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-slate-400 mt-1">
          <span>0</span>
          <span>
            {session.total_score} / {session.max_possible_score} points
          </span>
        </div>
      </GlassCard>

      <GlassCard className="mb-8">
        <h3 className="text-sm font-semibold text-slate-700 mb-4">
          Scenario Breakdown
        </h3>
        <div className="space-y-2">
          {caseStudy.scenarios.map((scenario, i) => {
            const decision = decisions[i];
            const correct = decision?.is_correct ?? false;
            return (
              <div
                key={i}
                className={`flex items-center justify-between p-3 rounded-xl border ${
                  correct
                    ? 'border-emerald-200/40 bg-emerald-50/20'
                    : 'border-rose-200/40 bg-rose-50/20'
                }`}
              >
                <div className="flex items-center gap-3">
                  {correct ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <XCircle className="w-4 h-4 text-rose-500" />
                  )}
                  <span className="text-sm text-slate-700">{scenario.title}</span>
                </div>
                <span
                  className={`text-sm font-medium ${
                    correct ? 'text-emerald-600' : 'text-rose-500'
                  }`}
                >
                  {decision?.points_earned ?? 0}/{scenario.points}
                </span>
              </div>
            );
          })}
        </div>
      </GlassCard>

      <div className="flex flex-wrap justify-center gap-3">
        <button onClick={onRetry} className="btn-secondary">
          <RotateCcw className="w-4 h-4" /> Try Again
        </button>
        <button onClick={onLibrary} className="btn-secondary">
          <BookOpen className="w-4 h-4" /> More Cases
        </button>
        <button onClick={onViewDashboard} className="btn-primary">
          <BarChart3 className="w-4 h-4" /> View Dashboard
        </button>
      </div>
    </div>
  );
}
