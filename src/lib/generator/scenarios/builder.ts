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

import type { Scenario, ScenarioOption, Source } from '../../../types';
import { shuffle, pickN } from '../random';

export function opt(id: string, text: string, isCorrect: boolean, feedback: string): ScenarioOption {
  return { id, text, is_correct: isCorrect, feedback };
}

export function fmt(n: number): string {
  return '$' + n.toLocaleString('en-CA');
}

export function pct(n: number, decimals = 2): string {
  return n.toFixed(decimals) + '%';
}

export interface WrongOption {
  text: string;
  feedback: string;
}

export interface ScenarioVariant {
  title: string;
  description: string;
  context: string;
  correct: { text: string; feedback: string };
  wrongs: WrongOption[];
  points: number;
  explanation: string;
  sources?: Source[];
}

export function buildScenario(
  title: string,
  description: string,
  context: string,
  correct: { text: string; feedback: string },
  wrongs: { text: string; feedback: string }[],
  points: number,
  explanation: string,
  rng: () => number,
  sources?: Source[]
): Scenario {
  const allOptions = [
    { text: correct.text, feedback: correct.feedback, isCorrect: true },
    ...wrongs.map((w) => ({ text: w.text, feedback: w.feedback, isCorrect: false })),
  ];

  const shuffled = shuffle(rng, allOptions);
  const ids = ['a', 'b', 'c', 'd'];
  const options: ScenarioOption[] = shuffled.map((o, i) =>
    opt(ids[i], o.text, o.isCorrect, o.feedback)
  );

  return { title, description, context, options, points, explanation, ...(sources ? { sources } : {}) };
}

export function buildFromVariant(v: ScenarioVariant, rng: () => number): Scenario {
  const selectedWrongs = v.wrongs.length <= 3
    ? v.wrongs
    : pickN(rng, v.wrongs, 3);
  return buildScenario(
    v.title, v.description, v.context, v.correct, selectedWrongs,
    v.points, v.explanation, rng, v.sources
  );
}

export function selectAndBuild(
  variantFactories: (() => ScenarioVariant)[],
  count: number,
  rng: () => number
): Scenario[] {
  const selected = pickN(rng, variantFactories, count);
  const scenarios = selected.map((factory) => buildFromVariant(factory(), rng));
  return shuffle(rng, scenarios);
}
