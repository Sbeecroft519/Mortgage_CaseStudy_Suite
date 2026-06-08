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
  BookOpen,
  BarChart3,
  PlusCircle,
  ArrowRight,
  Target,
  Brain,
  TrendingUp,
} from 'lucide-react';
import { GlassCard } from '../components/ui/GlassCard';
import { useNavigation } from '../context/NavigationContext';
import { useAuth } from '../context/AuthContext';
import { useDashboard } from '../hooks/useDashboard';

const features = [
  {
    icon: BookOpen,
    title: 'Case Study Library',
    description:
      'Browse realistic Canadian mortgage scenarios covering first-time buyers, self-employed borrowers, refinancing, and investment properties.',
    page: 'library' as const,
    color: 'cyan',
  },
  {
    icon: PlusCircle,
    title: 'Case Study Generator',
    description:
      'Create custom training scenarios with client profiles, property details, and interactive decision points.',
    page: 'generator' as const,
    color: 'emerald',
  },
  {
    icon: BarChart3,
    title: 'Performance Dashboard',
    description:
      'Track your progress across simulations, identify knowledge gaps, and measure improvement over time.',
    page: 'dashboard' as const,
    color: 'teal',
  },
];

const colorMap: Record<string, string> = {
  cyan: 'bg-cyan-100/80 text-cyan-700',
  emerald: 'bg-emerald-100/80 text-emerald-600',
  teal: 'bg-teal-100/80 text-teal-600',
};

export function HomePage() {
  const { navigate } = useNavigation();
  const { profile } = useAuth();
  const { stats, fetchStats } = useDashboard();
  const firstName = profile?.full_name?.split(' ')[0] || '';

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return (
    <div className="animate-fade-in">
      <section className="relative py-16 md:py-24 text-center">
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute -top-40 -right-32 w-96 h-96 bg-cyan-200/20 rounded-full blur-3xl" />
          <div className="absolute top-1/2 -left-32 w-80 h-80 bg-teal-200/15 rounded-full blur-3xl" />
        </div>

        <div className="max-w-3xl mx-auto px-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-100/60 text-cyan-800 text-sm font-medium mb-6 border border-cyan-200/40">
            <Target className="w-3.5 h-3.5" />
            Mortgages with Steve
          </div>

          <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 tracking-tight leading-tight mb-6">
            {firstName ? `Welcome, ${firstName}` : 'Agent Training'}
            <span className="text-gradient"> {firstName ? '' : 'Platform'}</span>
          </h1>

          <p className="text-lg md:text-xl text-slate-500 leading-relaxed max-w-2xl mx-auto mb-10">
            Interactive simulations built on realistic Canadian mortgage scenarios.
            Practice decision-making, receive instant feedback, and track your
            progress.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={() => navigate('library')}
              className="btn-primary text-base px-7 py-3"
            >
              Start Practicing
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => navigate('dashboard')}
              className="btn-secondary text-base px-7 py-3"
            >
              View Dashboard
            </button>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="grid md:grid-cols-3 gap-6">
          {features.map((feature) => (
            <GlassCard
              key={feature.page}
              hover
              onClick={() => navigate(feature.page)}
              className="group"
            >
              <div
                className={`w-11 h-11 rounded-xl ${colorMap[feature.color]} flex items-center justify-center mb-4`}
              >
                <feature.icon className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                {feature.title}
              </h3>
              <p className="text-sm text-slate-500 leading-relaxed mb-4">
                {feature.description}
              </p>
              <span className="inline-flex items-center gap-1.5 text-sm font-medium text-cyan-700 group-hover:gap-2.5 transition-all">
                Open <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </GlassCard>
          ))}
        </div>
      </section>

      {stats.completed_sessions > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-semibold text-slate-900">
              Your Training Progress
            </h2>
          </div>
          <div className="grid sm:grid-cols-3 gap-4">
            <GlassCard className="text-center">
              <Brain className="w-6 h-6 text-cyan-600 mx-auto mb-2" />
              <div className="text-3xl font-bold text-slate-900">
                {stats.completed_sessions}
              </div>
              <div className="text-sm text-slate-500">Completed Sessions</div>
            </GlassCard>
            <GlassCard className="text-center">
              <Target className="w-6 h-6 text-emerald-500 mx-auto mb-2" />
              <div className="text-3xl font-bold text-slate-900">
                {stats.avg_score_pct}%
              </div>
              <div className="text-sm text-slate-500">Average Score</div>
            </GlassCard>
            <GlassCard className="text-center">
              <TrendingUp className="w-6 h-6 text-teal-500 mx-auto mb-2" />
              <div className="text-3xl font-bold text-slate-900">
                {stats.best_score_pct}%
              </div>
              <div className="text-sm text-slate-500">Best Score</div>
            </GlassCard>
          </div>
        </section>
      )}
    </div>
  );
}
