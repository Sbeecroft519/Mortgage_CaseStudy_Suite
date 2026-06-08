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

import type { ClientProfile, PropertyDetails, FinancialDetails, DebtItem, AssetItem } from '../../types';
import type { Category, Difficulty } from './types';
import { pick, randInt, roundToNearest } from './random';
import { getMinimumDownPayment } from './mortgage-math';

const DEBT_POOLS: Record<Category, { type: string; balanceRange: [number, number]; termMonths: number }[]> = {
  'First-Time Buyer': [
    { type: 'Student Loan', balanceRange: [5000, 30000], termMonths: 120 },
    { type: 'Car Loan', balanceRange: [5000, 25000], termMonths: 60 },
    { type: 'Credit Card', balanceRange: [2000, 8000], termMonths: 36 },
  ],
  'Self-Employed': [
    { type: 'Business Line of Credit', balanceRange: [10000, 50000], termMonths: 60 },
    { type: 'Vehicle Lease', balanceRange: [10000, 30000], termMonths: 48 },
    { type: 'Credit Card', balanceRange: [3000, 12000], termMonths: 36 },
  ],
  'Refinancing': [
    { type: 'Existing Mortgage', balanceRange: [200000, 400000], termMonths: 300 },
    { type: 'Credit Card', balanceRange: [5000, 25000], termMonths: 36 },
    { type: 'Car Loan', balanceRange: [8000, 20000], termMonths: 60 },
  ],
  'Investment Property': [
    { type: 'Primary Residence Mortgage', balanceRange: [250000, 500000], termMonths: 300 },
    { type: 'Vehicle Loan', balanceRange: [10000, 30000], termMonths: 60 },
  ],
  'Credit Challenge': [
    { type: 'Credit Card', balanceRange: [8000, 25000], termMonths: 36 },
    { type: 'Car Loan', balanceRange: [5000, 20000], termMonths: 60 },
    { type: 'Personal Loan', balanceRange: [5000, 15000], termMonths: 48 },
    { type: 'Collections Account', balanceRange: [1000, 5000], termMonths: 24 },
  ],
};

const ASSET_POOLS: Record<Category, string[]> = {
  'First-Time Buyer': ['Savings Account', 'TFSA', 'RRSP'],
  'Self-Employed': ['Business Account', 'Personal Savings', 'RRSP', 'TFSA'],
  'Refinancing': ['Home Equity', 'RRSP', 'Pension (estimated)', 'Savings'],
  'Investment Property': ['Primary Home Equity', 'Investment Accounts', 'Savings', 'RRSP (combined)'],
  'Credit Challenge': ['Savings Account', 'TFSA'],
};

function genDebts(category: Category, difficulty: Difficulty, rng: () => number): DebtItem[] {
  const pool = DEBT_POOLS[category];
  const count = difficulty === 'beginner' ? randInt(rng, 1, 2) : randInt(rng, 2, Math.min(pool.length, 3));
  const selected = pool.slice(0, count);

  return selected.map((d) => {
    const balance = roundToNearest(randInt(rng, d.balanceRange[0], d.balanceRange[1]), 500);
    const monthly = Math.round(balance / d.termMonths / 5) * 5;
    return { type: d.type, balance, monthly_payment: Math.max(monthly, 50) };
  });
}

function genAssets(
  category: Category,
  downPayment: number,
  rng: () => number
): AssetItem[] {
  const types = ASSET_POOLS[category];
  const totalNeeded = downPayment * 1.3;
  const assets: AssetItem[] = [];
  let remaining = totalNeeded;

  for (let i = 0; i < types.length; i++) {
    const isLast = i === types.length - 1;
    const share = isLast ? remaining : remaining * (0.3 + rng() * 0.4);
    const value = roundToNearest(Math.max(share, 2000), 1000);
    assets.push({ type: types[i], value });
    remaining -= value;
    if (remaining <= 0 && !isLast) break;
  }

  return assets;
}

export function generateFinancials(
  category: Category,
  difficulty: Difficulty,
  client: ClientProfile,
  property: PropertyDetails,
  rng: () => number
): FinancialDetails {
  const price = property.purchase_price;
  const minDown = getMinimumDownPayment(price);

  let downPaymentPercent: number;
  if (category === 'Refinancing') {
    downPaymentPercent = 0;
  } else if (category === 'Investment Property') {
    downPaymentPercent = randInt(rng, 20, 25);
  } else if (category === 'Credit Challenge') {
    downPaymentPercent = randInt(rng, 5, 12);
  } else if (category === 'First-Time Buyer') {
    downPaymentPercent = randInt(rng, 5, 15);
  } else {
    downPaymentPercent = randInt(rng, 10, 25);
  }

  let downPayment = roundToNearest(price * downPaymentPercent / 100, 5000);
  downPayment = Math.max(downPayment, roundToNearest(minDown, 1000));

  if (category === 'Refinancing') {
    downPayment = 0;
  }

  const debts = genDebts(category, difficulty, rng);
  const assets = genAssets(category, Math.max(downPayment, 20000), rng);

  const baseExpense = 1500 + client.dependents * 500;
  const monthlyExpenses = roundToNearest(
    randInt(rng, baseExpense, baseExpense + 1000),
    100
  );

  return {
    down_payment: downPayment,
    existing_debts: debts,
    assets,
    monthly_expenses: monthlyExpenses,
  };
}
