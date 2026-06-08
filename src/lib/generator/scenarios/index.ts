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

import type { Scenario } from '../../../types';
import type { GeneratedContext } from '../types';
import { generateFirstTimeBuyerScenarios } from './templates/first-time-buyer';
import { generateSelfEmployedScenarios } from './templates/self-employed';
import { generateRefinancingScenarios } from './templates/refinancing';
import { generateInvestmentPropertyScenarios } from './templates/investment-property';
import { generateCreditChallengeScenarios } from './templates/credit-challenge';

export function generateScenarios(ctx: GeneratedContext, rng: () => number): Scenario[] {
  switch (ctx.category) {
    case 'First-Time Buyer':
      return generateFirstTimeBuyerScenarios(ctx, rng);
    case 'Self-Employed':
      return generateSelfEmployedScenarios(ctx, rng);
    case 'Refinancing':
      return generateRefinancingScenarios(ctx, rng);
    case 'Investment Property':
      return generateInvestmentPropertyScenarios(ctx, rng);
    case 'Credit Challenge':
      return generateCreditChallengeScenarios(ctx, rng);
    default:
      return generateFirstTimeBuyerScenarios(ctx, rng);
  }
}
