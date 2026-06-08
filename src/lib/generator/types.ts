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

import type { ClientProfile, PropertyDetails, FinancialDetails, Scenario } from '../../types';

export type Category = 'First-Time Buyer' | 'Self-Employed' | 'Refinancing' | 'Investment Property' | 'Credit Challenge';
export type Difficulty = 'beginner' | 'intermediate' | 'advanced';

export interface ComputedMortgageValues {
  mortgageAmount: number;
  ltvPercent: number;
  downPaymentPercent: number;
  isHighRatio: boolean;
  cmhcPremiumPercent: number;
  cmhcPremiumAmount: number;
  insuredMortgage: number;
  monthlyGrossIncome: number;
  contractRate: number;
  stressTestRate: number;
  monthlyMortgagePayment: number;
  stressedMortgagePayment: number;
  propertyTax: number;
  heatingCost: number;
  condoFees: number;
  gdsPercent: number;
  tdsPercent: number;
  totalMonthlyDebtPayments: number;
  minimumDownPayment: number;
  bocQualifyingRate: number;
}

export interface GeneratedContext {
  difficulty: Difficulty;
  category: Category;
  client: ClientProfile;
  property: PropertyDetails;
  financials: FinancialDetails;
  computed: ComputedMortgageValues;
}

export interface ScenarioTemplate {
  id: string;
  categories: Category[];
  generate: (ctx: GeneratedContext, rng: () => number) => Scenario;
}
