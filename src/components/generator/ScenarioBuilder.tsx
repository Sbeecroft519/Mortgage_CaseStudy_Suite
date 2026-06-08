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

import { ChevronDown, ChevronUp, Plus, Trash2, CheckCircle } from 'lucide-react';
import { useState } from 'react';
import type { Scenario, ScenarioOption } from '../../types';

interface ScenarioBuilderProps {
  scenarios: Scenario[];
  onChange: (scenarios: Scenario[]) => void;
}

const emptyOption: ScenarioOption = {
  id: '',
  text: '',
  is_correct: false,
  feedback: '',
};

const emptyScenario: Scenario = {
  title: '',
  description: '',
  context: '',
  options: [
    { ...emptyOption, id: 'a' },
    { ...emptyOption, id: 'b' },
    { ...emptyOption, id: 'c' },
    { ...emptyOption, id: 'd' },
  ],
  points: 20,
  explanation: '',
};

export function ScenarioBuilder({ scenarios, onChange }: ScenarioBuilderProps) {
  const [expanded, setExpanded] = useState<number | null>(
    scenarios.length > 0 ? 0 : null
  );

  const addScenario = () => {
    onChange([...scenarios, { ...emptyScenario }]);
    setExpanded(scenarios.length);
  };

  const removeScenario = (idx: number) => {
    onChange(scenarios.filter((_, i) => i !== idx));
    setExpanded(null);
  };

  const updateScenario = (idx: number, field: keyof Scenario, value: unknown) => {
    const updated = [...scenarios];
    updated[idx] = { ...updated[idx], [field]: value };
    onChange(updated);
  };

  const updateOption = (
    sIdx: number,
    oIdx: number,
    field: keyof ScenarioOption,
    value: unknown
  ) => {
    const updated = [...scenarios];
    const opts = [...updated[sIdx].options];
    opts[oIdx] = { ...opts[oIdx], [field]: value };

    if (field === 'is_correct' && value === true) {
      opts.forEach((o, i) => {
        if (i !== oIdx) o.is_correct = false;
      });
    }

    updated[sIdx] = { ...updated[sIdx], options: opts };
    onChange(updated);
  };

  const addOption = (sIdx: number) => {
    const updated = [...scenarios];
    const nextId = String.fromCharCode(97 + updated[sIdx].options.length);
    updated[sIdx] = {
      ...updated[sIdx],
      options: [...updated[sIdx].options, { ...emptyOption, id: nextId }],
    };
    onChange(updated);
  };

  const removeOption = (sIdx: number, oIdx: number) => {
    const updated = [...scenarios];
    updated[sIdx] = {
      ...updated[sIdx],
      options: updated[sIdx].options.filter((_, i) => i !== oIdx),
    };
    onChange(updated);
  };

  return (
    <div className="space-y-3">
      {scenarios.map((scenario, sIdx) => (
        <div
          key={sIdx}
          className="border border-slate-200/60 rounded-xl bg-white/40 overflow-hidden"
        >
          <button
            type="button"
            onClick={() => setExpanded(expanded === sIdx ? null : sIdx)}
            className="w-full flex items-center justify-between p-4 hover:bg-white/30 transition-colors"
          >
            <div className="flex items-center gap-3 text-left">
              <span className="w-7 h-7 rounded-lg bg-cyan-100/80 text-cyan-700 text-xs font-semibold flex items-center justify-center">
                {sIdx + 1}
              </span>
              <span className="text-sm font-medium text-slate-800">
                {scenario.title || 'Untitled Scenario'}
              </span>
              <span className="text-xs text-slate-400">
                {scenario.points} pts
              </span>
            </div>
            {expanded === sIdx ? (
              <ChevronUp className="w-4 h-4 text-slate-400" />
            ) : (
              <ChevronDown className="w-4 h-4 text-slate-400" />
            )}
          </button>

          {expanded === sIdx && (
            <div className="px-4 pb-4 space-y-4 border-t border-slate-100/60 pt-4 animate-fade-in">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">
                    Title
                  </label>
                  <input
                    type="text"
                    value={scenario.title}
                    onChange={(e) =>
                      updateScenario(sIdx, 'title', e.target.value)
                    }
                    className="input-field"
                    placeholder="Scenario title"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">
                    Points
                  </label>
                  <input
                    type="number"
                    value={scenario.points}
                    onChange={(e) =>
                      updateScenario(sIdx, 'points', Number(e.target.value))
                    }
                    className="input-field"
                    min={0}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">
                  Description
                </label>
                <textarea
                  value={scenario.description}
                  onChange={(e) =>
                    updateScenario(sIdx, 'description', e.target.value)
                  }
                  className="input-field min-h-[60px]"
                  rows={2}
                  placeholder="What question or decision does the agent face?"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">
                  Context
                </label>
                <textarea
                  value={scenario.context}
                  onChange={(e) =>
                    updateScenario(sIdx, 'context', e.target.value)
                  }
                  className="input-field min-h-[60px]"
                  rows={2}
                  placeholder="Background information for this decision point"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">
                  Explanation (shown after answering)
                </label>
                <textarea
                  value={scenario.explanation}
                  onChange={(e) =>
                    updateScenario(sIdx, 'explanation', e.target.value)
                  }
                  className="input-field min-h-[60px]"
                  rows={2}
                  placeholder="Detailed explanation of the correct approach"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-medium text-slate-500">
                    Answer Options
                  </label>
                  <button
                    type="button"
                    onClick={() => addOption(sIdx)}
                    className="btn-ghost text-xs py-1 px-2"
                  >
                    <Plus className="w-3 h-3" /> Add Option
                  </button>
                </div>
                <div className="space-y-3">
                  {scenario.options.map((opt, oIdx) => (
                    <div
                      key={oIdx}
                      className={`p-3 rounded-lg border transition-colors ${
                        opt.is_correct
                          ? 'border-emerald-300/60 bg-emerald-50/30'
                          : 'border-slate-200/60 bg-white/30'
                      }`}
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <span className="w-6 h-6 rounded-md bg-slate-100 text-slate-600 text-xs font-medium flex items-center justify-center uppercase">
                          {opt.id}
                        </span>
                        <input
                          type="text"
                          value={opt.text}
                          onChange={(e) =>
                            updateOption(sIdx, oIdx, 'text', e.target.value)
                          }
                          className="input-field flex-1"
                          placeholder="Option text"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            updateOption(
                              sIdx,
                              oIdx,
                              'is_correct',
                              !opt.is_correct
                            )
                          }
                          className={`p-1.5 rounded-lg transition-colors ${
                            opt.is_correct
                              ? 'text-emerald-600 bg-emerald-100/60'
                              : 'text-slate-400 hover:text-emerald-500 hover:bg-emerald-50/50'
                          }`}
                          title={
                            opt.is_correct ? 'Correct answer' : 'Mark as correct'
                          }
                        >
                          <CheckCircle className="w-4 h-4" />
                        </button>
                        {scenario.options.length > 2 && (
                          <button
                            type="button"
                            onClick={() => removeOption(sIdx, oIdx)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50/50 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                      <textarea
                        value={opt.feedback}
                        onChange={(e) =>
                          updateOption(sIdx, oIdx, 'feedback', e.target.value)
                        }
                        className="input-field text-xs min-h-[40px]"
                        rows={1}
                        placeholder="Feedback shown when this option is selected"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={() => removeScenario(sIdx)}
                  className="btn-ghost text-xs text-rose-500 hover:text-rose-600 hover:bg-rose-50/50"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Remove Scenario
                </button>
              </div>
            </div>
          )}
        </div>
      ))}

      <button type="button" onClick={addScenario} className="btn-secondary w-full">
        <Plus className="w-4 h-4" /> Add Scenario
      </button>
    </div>
  );
}
