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

import { useEffect, useState } from 'react';
import {
  BookOpen,
  Filter,
  Play,
  Users,
  MapPin,
  DollarSign,
  Loader2,
  Database,
} from 'lucide-react';
import { GlassCard } from '../components/ui/GlassCard';
import { useNavigation } from '../context/NavigationContext';
import { useCaseStudies } from '../hooks/useCaseStudies';
import { seedCaseStudies } from '../data/seedCaseStudies';
import type { CaseStudy } from '../types';

const difficultyLabel: Record<string, string> = {
  beginner: 'badge-beginner',
  intermediate: 'badge-intermediate',
  advanced: 'badge-advanced',
};

const categories = [
  'All',
  'First-Time Buyer',
  'Self-Employed',
  'Refinancing',
  'Investment Property',
];

const difficulties = ['All', 'beginner', 'intermediate', 'advanced'];

function formatCurrency(n: number) {
  return new Intl.NumberFormat('en-CA', {
    style: 'currency',
    currency: 'CAD',
    maximumFractionDigits: 0,
  }).format(n);
}

export function LibraryPage() {
  const { navigate } = useNavigation();
  const { caseStudies, loading, fetchPublished, seedCaseStudies: seed } =
    useCaseStudies();
  const [category, setCategory] = useState('All');
  const [difficulty, setDifficulty] = useState('All');
  const [seeding, setSeeding] = useState(false);

  useEffect(() => {
    fetchPublished();
  }, [fetchPublished]);

  const filtered = caseStudies.filter((cs: CaseStudy) => {
    if (category !== 'All' && cs.category !== category) return false;
    if (difficulty !== 'All' && cs.difficulty !== difficulty) return false;
    return true;
  });

  const handleSeed = async () => {
    setSeeding(true);
    await seed(seedCaseStudies);
    await fetchPublished();
    setSeeding(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
            <BookOpen className="w-6 h-6 text-cyan-700" />
            Case Study Library
          </h1>
          <p className="text-slate-500 mt-1">
            Select a scenario to begin your interactive simulation
          </p>
        </div>
      </div>

      <GlassCard className="mb-8">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-xs font-medium text-slate-500 mb-1.5">
              <Filter className="w-3 h-3 inline mr-1" />
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="select-field"
            >
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <div className="flex-1">
            <label className="block text-xs font-medium text-slate-500 mb-1.5">
              Difficulty
            </label>
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
              className="select-field"
            >
              {difficulties.map((d) => (
                <option key={d} value={d}>
                  {d === 'All' ? 'All' : d.charAt(0).toUpperCase() + d.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>
      </GlassCard>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 text-cyan-700 animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <GlassCard className="text-center py-16">
          <Database className="w-10 h-10 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-700 mb-2">
            {caseStudies.length === 0
              ? 'No Case Studies Yet'
              : 'No Matches Found'}
          </h3>
          <p className="text-slate-500 text-sm mb-6 max-w-md mx-auto">
            {caseStudies.length === 0
              ? 'Load the sample Canadian mortgage case studies to get started with training.'
              : 'Try adjusting your filters to find more case studies.'}
          </p>
          {caseStudies.length === 0 && (
            <button
              onClick={handleSeed}
              disabled={seeding}
              className="btn-primary"
            >
              {seeding ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Database className="w-4 h-4" />
              )}
              {seeding ? 'Loading...' : 'Load Sample Case Studies'}
            </button>
          )}
        </GlassCard>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {filtered.map((cs: CaseStudy) => (
            <GlassCard key={cs.id} hover className="flex flex-col">
              <div className="flex items-start justify-between gap-4 mb-3">
                <h3 className="text-lg font-semibold text-slate-900 leading-snug">
                  {cs.title}
                </h3>
                <span className={difficultyLabel[cs.difficulty]}>
                  {cs.difficulty}
                </span>
              </div>

              <p className="text-sm text-slate-500 leading-relaxed mb-4 flex-1">
                {cs.description}
              </p>

              <div className="grid grid-cols-3 gap-3 mb-4 text-xs text-slate-500">
                <div className="flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-slate-400" />
                  {cs.client_profile.name}
                </div>
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  {cs.property_details.location}
                </div>
                <div className="flex items-center gap-1.5">
                  <DollarSign className="w-3.5 h-3.5 text-slate-400" />
                  {formatCurrency(cs.property_details.purchase_price)}
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-slate-100/60">
                <span className="text-xs text-slate-400">
                  {cs.scenarios.length} scenarios &middot;{' '}
                  {cs.scenarios.reduce((s, sc) => s + sc.points, 0)} pts
                </span>
                <button
                  onClick={() =>
                    navigate('simulation', { caseStudyId: cs.id })
                  }
                  className="btn-primary py-2 px-4 text-xs"
                >
                  <Play className="w-3.5 h-3.5" />
                  Start Simulation
                </button>
              </div>
            </GlassCard>
          ))}
        </div>
      )}
    </div>
  );
}
