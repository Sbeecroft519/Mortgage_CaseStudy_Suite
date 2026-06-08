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

import { useState } from 'react';
import { Sparkles, Loader2, ArrowRight, AlertCircle, Cpu, Zap } from 'lucide-react';
import { GlassCard } from '../ui/GlassCard';
import { useCaseStudies } from '../../hooks/useCaseStudies';
import { useNavigation } from '../../context/NavigationContext';

const categories = [
  'First-Time Buyer',
  'Self-Employed',
  'Refinancing',
  'Investment Property',
  'Credit Challenge',
];

const difficulties: { value: 'beginner' | 'intermediate' | 'advanced'; label: string; desc: string }[] = [
  { value: 'beginner', label: 'Beginner', desc: 'Straightforward scenarios with clear-cut decisions' },
  { value: 'intermediate', label: 'Intermediate', desc: 'Nuanced situations requiring deeper analysis' },
  { value: 'advanced', label: 'Advanced', desc: 'Complex cases with multiple variables and trade-offs' },
];

const AI_LOADING_MESSAGES = [
  'Building a realistic client profile...',
  'Crafting a unique financial scenario...',
  'Generating challenging questions...',
  'Writing detailed feedback for each answer...',
  'Adding Canadian regulatory references...',
  'Finalizing the case study...',
];

export function AIGenerator() {
  const [difficulty, setDifficulty] = useState<'beginner' | 'intermediate' | 'advanced'>('intermediate');
  const [category, setCategory] = useState('First-Time Buyer');
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadingMsgIndex, setLoadingMsgIndex] = useState(0);
  const [generationMethod, setGenerationMethod] = useState<'ai' | 'fallback' | null>(null);
  const { generateWithAI, generationStatus } = useCaseStudies();
  const { navigate } = useNavigation();

  const handleGenerate = async () => {
    setGenerating(true);
    setError(null);
    setGenerationMethod(null);
    setLoadingMsgIndex(0);

    const interval = setInterval(() => {
      setLoadingMsgIndex((prev) =>
        prev < AI_LOADING_MESSAGES.length - 1 ? prev + 1 : prev
      );
    }, 3000);

    const result = await generateWithAI(difficulty, category);

    clearInterval(interval);

    if (result) {
      setGenerationMethod(result.method);
      navigate('simulation', { caseStudyId: result.caseStudy.id });
    } else {
      setError('Failed to generate case study. Please try again.');
    }

    setGenerating(false);
  };

  const displayMessage = generationStatus || AI_LOADING_MESSAGES[loadingMsgIndex];

  return (
    <GlassCard className="relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-600/[0.03] via-transparent to-cyan-500/[0.03] pointer-events-none" />

      <div className="relative">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-600 to-cyan-500 flex items-center justify-center shadow-md shadow-cyan-600/15">
            <Sparkles className="w-4.5 h-4.5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-slate-900">AI Case Study Generator</h2>
            <p className="text-xs text-slate-500">Each case study is uniquely created by AI -- no two are alike</p>
          </div>
        </div>

        <div className="mt-6 space-y-5">
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-2.5">Difficulty</label>
            <div className="grid grid-cols-3 gap-2.5">
              {difficulties.map((d) => (
                <button
                  key={d.value}
                  onClick={() => setDifficulty(d.value)}
                  disabled={generating}
                  className={`
                    relative px-3.5 py-3 rounded-xl text-left transition-all duration-200 border
                    ${difficulty === d.value
                      ? 'border-cyan-300/80 bg-cyan-50/60 shadow-sm shadow-cyan-600/5'
                      : 'border-slate-200/60 bg-white/40 hover:border-slate-300/60 hover:bg-white/60'
                    }
                  `}
                >
                  <span className={`block text-sm font-medium ${difficulty === d.value ? 'text-cyan-700' : 'text-slate-700'}`}>
                    {d.label}
                  </span>
                  <span className="block text-[11px] text-slate-400 mt-0.5 leading-tight">
                    {d.desc}
                  </span>
                  {difficulty === d.value && (
                    <div className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-cyan-600" />
                  )}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-500 mb-2.5">Category</label>
            <div className="flex flex-wrap gap-2">
              {categories.map((c) => (
                <button
                  key={c}
                  onClick={() => setCategory(c)}
                  disabled={generating}
                  className={`
                    px-3.5 py-2 rounded-xl text-sm font-medium transition-all duration-200 border
                    ${category === c
                      ? 'border-cyan-300/80 bg-cyan-50/60 text-cyan-700 shadow-sm shadow-cyan-600/5'
                      : 'border-slate-200/60 bg-white/40 text-slate-600 hover:border-slate-300/60 hover:bg-white/60'
                    }
                  `}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <div className="flex items-start gap-2.5 px-4 py-3 rounded-xl bg-red-50 border border-red-100">
              <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {generating && (
            <div className="px-4 py-4 rounded-xl bg-gradient-to-r from-slate-50 to-cyan-50/50 border border-cyan-100/60">
              <div className="flex items-center gap-3 mb-3">
                <div className="relative">
                  <Cpu className="w-5 h-5 text-cyan-600" />
                  <div className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-cyan-500 animate-ping" />
                </div>
                <span className="text-sm font-medium text-slate-700">
                  {displayMessage}
                </span>
              </div>
              <div className="w-full bg-slate-200/60 rounded-full h-1.5 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-cyan-600 to-teal-500 rounded-full transition-all duration-1000 ease-out"
                  style={{ width: `${Math.min(15 + (loadingMsgIndex / (AI_LOADING_MESSAGES.length - 1)) * 80, 95)}%` }}
                />
              </div>
              <p className="text-[11px] text-slate-400 mt-2">
                AI is generating a completely unique case study. This typically takes 10-15 seconds.
              </p>
            </div>
          )}

          {generationMethod === 'fallback' && !generating && (
            <div className="flex items-start gap-2.5 px-4 py-3 rounded-xl bg-amber-50 border border-amber-100">
              <Zap className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
              <p className="text-sm text-amber-700">
                AI was temporarily unavailable. Generated using the built-in scenario engine instead.
              </p>
            </div>
          )}

          <button
            onClick={handleGenerate}
            disabled={generating}
            className="w-full flex items-center justify-center gap-2.5 px-5 py-3.5 bg-gradient-to-r from-cyan-700 to-teal-600 rounded-xl text-sm font-medium text-white shadow-md shadow-cyan-700/20 hover:shadow-lg hover:shadow-cyan-700/25 hover:from-cyan-800 hover:to-teal-700 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:shadow-md"
          >
            {generating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Generating with AI...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Generate Case Study</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </GlassCard>
  );
}
