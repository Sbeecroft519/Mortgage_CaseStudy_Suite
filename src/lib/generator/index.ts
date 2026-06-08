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

import type { CaseStudy } from '../../types';
import type { Category, Difficulty, ComputedMortgageValues } from './types';
import { createRng, randFloat, randInt } from './random';
import { generateProfile } from './profiles';
import { generateProperty } from './properties';
import { generateFinancials } from './financials';
import { generateScenarios } from './scenarios';
import * as m from './mortgage-math';

function computeMortgageValues(
  client: { annual_income: number },
  property: { purchase_price: number; type: string },
  financials: { down_payment: number; existing_debts: { monthly_payment: number }[] },
  rng: () => number
): ComputedMortgageValues {
  const mortgageAmount = property.purchase_price - financials.down_payment;
  const ltvPercent = m.calcLtv(mortgageAmount, property.purchase_price);
  const downPaymentPercent = (financials.down_payment / property.purchase_price) * 100;
  const isHighRatio = ltvPercent > 80;
  const cmhcPremiumPercent = m.getCmhcPremiumPercent(ltvPercent);
  const cmhcPremiumAmount = Math.round(mortgageAmount * cmhcPremiumPercent / 100);
  const insuredMortgage = mortgageAmount + cmhcPremiumAmount;

  const contractRate = randFloat(rng, 4.5, 6.5);
  const stressTestRate = m.getStressTestRate(contractRate);

  const propertyTax = Math.round(property.purchase_price * 0.01 / 12);
  const heatingCost = property.type === 'Condominium' ? 50 : 100;
  const condoFees = property.type === 'Condominium' ? randInt(rng, 300, 600) : 0;

  const monthlyGrossIncome = client.annual_income / 12;
  const principal = isHighRatio ? insuredMortgage : mortgageAmount;
  const monthlyMortgagePayment = Math.round(m.calcMonthlyPayment(principal, contractRate, 25));
  const stressedMortgagePayment = Math.round(m.calcMonthlyPayment(principal, stressTestRate, 25));

  const totalMonthlyDebtPayments = financials.existing_debts.reduce((s, d) => s + d.monthly_payment, 0);

  const gdsPercent = m.calcGds(stressedMortgagePayment, propertyTax, heatingCost, condoFees, monthlyGrossIncome);
  const tdsPercent = m.calcTds(stressedMortgagePayment, propertyTax, heatingCost, condoFees, totalMonthlyDebtPayments, monthlyGrossIncome);

  return {
    mortgageAmount,
    ltvPercent,
    downPaymentPercent,
    isHighRatio,
    cmhcPremiumPercent,
    cmhcPremiumAmount,
    insuredMortgage,
    monthlyGrossIncome,
    contractRate,
    stressTestRate,
    monthlyMortgagePayment,
    stressedMortgagePayment,
    propertyTax,
    heatingCost,
    condoFees,
    gdsPercent,
    tdsPercent,
    totalMonthlyDebtPayments,
    minimumDownPayment: m.getMinimumDownPayment(property.purchase_price),
    bocQualifyingRate: m.BOC_QUALIFYING_RATE,
  };
}

const CATEGORY_PREFIX: Record<Category, string> = {
  'First-Time Buyer': 'First-Time Homebuyer',
  'Self-Employed': 'Self-Employed Borrower',
  'Refinancing': 'Refinancing Strategy',
  'Investment Property': 'Investment Property',
  'Credit Challenge': 'Credit Challenge',
};

const CATEGORY_DESC: Record<Category, (name: string, propType: string, location: string) => string> = {
  'First-Time Buyer': (name, propType, loc) =>
    `A first-time buyer purchasing a ${propType.toLowerCase()} in ${loc}. Navigate CMHC insurance, stress test qualification, debt service ratios, and product recommendations.`,
  'Self-Employed': (name, propType, loc) =>
    `A self-employed borrower purchasing a ${propType.toLowerCase()} in ${loc}. Handle income verification, documentation challenges, lender selection, and conditions management.`,
  'Refinancing': (name, propType, loc) =>
    `A homeowner looking to access equity from their ${propType.toLowerCase()} in ${loc}. Compare refinance options, calculate penalties, analyze debt consolidation, and recommend terms.`,
  'Investment Property': (name, propType, loc) =>
    `An investor purchasing a ${propType.toLowerCase()} in ${loc} as a rental. Navigate down payment rules, rental income qualification, cash flow analysis, and tax considerations.`,
  'Credit Challenge': (name, propType, loc) =>
    `A credit-challenged borrower pursuing a ${propType.toLowerCase()} in ${loc}. Assess credit issues, explore alternative lenders, manage debt service, and plan credit repair.`,
};

export function generateCaseStudy(
  difficulty: Difficulty,
  category: Category
): Omit<CaseStudy, 'id' | 'created_at' | 'updated_at'> {
  const rng = createRng();

  const client = generateProfile(category, difficulty, rng);
  const property = generateProperty(category, difficulty, client, rng);
  const financials = generateFinancials(category, difficulty, client, property, rng);
  const computed = computeMortgageValues(client, property, financials, rng);

  const ctx = { difficulty, category, client, property, financials, computed };
  const scenarios = generateScenarios(ctx, rng);

  const title = `${CATEGORY_PREFIX[category]}: ${client.name}`;
  const description = CATEGORY_DESC[category](client.name, property.type, property.location);

  return {
    title,
    description,
    difficulty,
    category,
    published: true,
    client_profile: client,
    property_details: property,
    financial_details: financials,
    scenarios,
  };
}
