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
import {
  HelpCircle,
  CheckCircle2,
  XCircle,
  ArrowRight,
  Lightbulb,
  Loader2,
  ExternalLink,
  BookOpen,
} from 'lucide-react';
import { GlassCard } from '../ui/GlassCard';
import type { Scenario, ScenarioOption } from '../../types';

interface ScenarioStepProps {
  scenario: Scenario;
  index: number;
  total: number;
  feedbackMode: boolean;
  chosenOptionId: string | null;
  onSubmit: (optionId: string) => void;
  onNext: () => void;
  loading: boolean;
}

export function ScenarioStep({
  scenario,
  index,
  total,
  feedbackMode,
  chosenOptionId,
  onSubmit,
  onNext,
  loading,
}: ScenarioStepProps) {
  const [selected, setSelected] = useState<string | null>(null);

  const chosenOption = feedbackMode
    ? scenario.options.find((o) => o.id === chosenOptionId)
    : null;
  const isCorrect = chosenOption?.is_correct ?? false;

  return (
    <div className="max-w-3xl mx-auto animate-slide-up">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-cyan-700 flex items-center justify-center">
            <HelpCircle className="w-4 h-4 text-white" />
          </div>
          <div>
            <div className="text-xs text-slate-500">
              Scenario {index + 1} of {total}
            </div>
            <h3 className="text-lg font-semibold text-slate-900">
              {scenario.title}
            </h3>
          </div>
        </div>
        <span className="text-sm font-medium text-cyan-700 bg-cyan-50/60 px-3 py-1 rounded-lg">
          {scenario.points} pts
        </span>
      </div>

      <div className="h-1.5 bg-slate-100 rounded-full mb-6 overflow-hidden">
        <div
          className="h-full bg-cyan-600 rounded-full transition-all duration-500"
          style={{ width: `${((index + (feedbackMode ? 1 : 0)) / total) * 100}%` }}
        />
      </div>

      <GlassCard className="mb-6">
        <p className="text-sm text-slate-600 leading-relaxed">
          {scenario.description}
        </p>
        {scenario.context && (
          <div className="mt-4 p-4 rounded-xl bg-slate-50/60 border border-slate-100/60">
            <p className="text-sm text-slate-500 leading-relaxed">
              {scenario.context}
            </p>
          </div>
        )}
      </GlassCard>

      {!feedbackMode ? (
        <>
          <div className="space-y-3 mb-6">
            {scenario.options.map((opt: ScenarioOption) => (
              <button
                key={opt.id}
                onClick={() => setSelected(opt.id)}
                className={`
                  w-full text-left p-4 rounded-xl border transition-all duration-200
                  ${selected === opt.id
                    ? 'border-cyan-400/60 bg-cyan-50/40 shadow-sm shadow-cyan-500/5'
                    : 'border-slate-200/60 bg-white/40 hover:border-slate-300/60 hover:bg-white/60'
                  }
                `}
              >
                <div className="flex items-start gap-3">
                  <span
                    className={`
                      w-7 h-7 rounded-lg text-xs font-semibold flex items-center justify-center flex-shrink-0 mt-0.5 uppercase
                      ${selected === opt.id
                        ? 'bg-cyan-700 text-white'
                        : 'bg-slate-100 text-slate-600'
                      }
                    `}
                  >
                    {opt.id}
                  </span>
                  <span className="text-sm text-slate-700 leading-relaxed">
                    {opt.text}
                  </span>
                </div>
              </button>
            ))}
          </div>

          <div className="text-center">
            <button
              onClick={() => selected && onSubmit(selected)}
              disabled={!selected || loading}
              className="btn-primary text-base px-8 py-3"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                'Submit Answer'
              )}
            </button>
          </div>
        </>
      ) : (
        <div className="animate-fade-in">
          <GlassCard
            className={`mb-6 ${
              isCorrect
                ? 'border-emerald-300/40 bg-emerald-50/30'
                : 'border-rose-300/40 bg-rose-50/30'
            }`}
          >
            <div className="flex items-start gap-3 mb-3">
              {isCorrect ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
              ) : (
                <XCircle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
              )}
              <div>
                <div
                  className={`text-sm font-semibold ${
                    isCorrect ? 'text-emerald-700' : 'text-rose-700'
                  }`}
                >
                  {isCorrect ? 'Correct!' : 'Incorrect'}
                  <span className="ml-2 font-normal text-slate-500">
                    {isCorrect ? `+${scenario.points} points` : '+0 points'}
                  </span>
                </div>
                <p className="text-sm text-slate-600 mt-2 leading-relaxed">
                  {chosenOption?.feedback}
                </p>
              </div>
            </div>
          </GlassCard>

          <div className="space-y-2 mb-6">
            {scenario.options.map((opt: ScenarioOption) => (
              <div
                key={opt.id}
                className={`
                  p-3 rounded-xl border text-sm
                  ${opt.is_correct
                    ? 'border-emerald-300/40 bg-emerald-50/20'
                    : opt.id === chosenOptionId && !opt.is_correct
                      ? 'border-rose-300/40 bg-rose-50/20'
                      : 'border-slate-100/60 bg-white/20 opacity-60'
                  }
                `}
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`
                      w-6 h-6 rounded-md text-xs font-semibold flex items-center justify-center uppercase
                      ${opt.is_correct
                        ? 'bg-emerald-600 text-white'
                        : opt.id === chosenOptionId
                          ? 'bg-rose-500 text-white'
                          : 'bg-slate-100 text-slate-500'
                      }
                    `}
                  >
                    {opt.id}
                  </span>
                  <span className="text-slate-700 flex-1">{opt.text}</span>
                  {opt.is_correct && (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  )}
                </div>
              </div>
            ))}
          </div>

          <GlassCard accent className="mb-6">
            <div className="flex items-start gap-3">
              <Lightbulb className="w-5 h-5 text-cyan-700 flex-shrink-0 mt-0.5" />
              <div>
                <div className="text-sm font-semibold text-cyan-800 mb-1">
                  Key Takeaway
                </div>
                <p className="text-sm text-slate-600 leading-relaxed">
                  {scenario.explanation}
                </p>
              </div>
            </div>
          </GlassCard>

          {scenario.sources && scenario.sources.length > 0 && (
            <div className="mb-8 p-4 rounded-xl bg-slate-50/60 border border-slate-200/40">
              <div className="flex items-center gap-2 mb-3">
                <BookOpen className="w-4 h-4 text-slate-500" />
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  Learn More
                </span>
              </div>
              <div className="space-y-2">
                {scenario.sources.map((source, i) => (
                  <a
                    key={i}
                    href={source.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-cyan-700 hover:text-cyan-800 transition-colors group"
                  >
                    <ExternalLink className="w-3.5 h-3.5 flex-shrink-0 opacity-60 group-hover:opacity-100 transition-opacity" />
                    <span className="underline decoration-cyan-300/50 underline-offset-2 group-hover:decoration-cyan-700/80">
                      {source.title}
                    </span>
                  </a>
                ))}
              </div>
            </div>
          )}

          <div className="text-center">
            <button onClick={onNext} className="btn-primary text-base px-8 py-3">
              {index < total - 1 ? 'Next Scenario' : 'View Results'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
