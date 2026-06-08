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

export const BOC_QUALIFYING_RATE = 5.25;

export const CMHC_TIERS = [
  { maxLtv: 80, premium: 0 },
  { maxLtv: 85, premium: 2.80 },
  { maxLtv: 90, premium: 3.10 },
  { maxLtv: 95, premium: 4.00 },
];

export const GDS_LIMIT = 39;
export const TDS_LIMIT = 44;
export const MAX_REFINANCE_LTV = 80;

export function getCmhcPremiumPercent(ltvPercent: number): number {
  if (ltvPercent <= 80) return 0;
  if (ltvPercent <= 85) return 2.80;
  if (ltvPercent <= 90) return 3.10;
  return 4.00;
}

export function getMinimumDownPayment(purchasePrice: number): number {
  if (purchasePrice >= 1_000_000) {
    return purchasePrice * 0.20;
  }
  const first500k = Math.min(purchasePrice, 500_000) * 0.05;
  const remainder = Math.max(0, purchasePrice - 500_000) * 0.10;
  return first500k + remainder;
}

export function effectiveMonthlyRate(annualRate: number): number {
  const semiAnnualRate = annualRate / 100 / 2;
  return Math.pow(1 + semiAnnualRate, 1 / 6) - 1;
}

export function calcMonthlyPayment(principal: number, annualRate: number, amortYears: number): number {
  const r = effectiveMonthlyRate(annualRate);
  const n = amortYears * 12;
  if (r === 0) return principal / n;
  return principal * (r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
}

export function getStressTestRate(contractRate: number, bocRate = BOC_QUALIFYING_RATE): number {
  return Math.max(bocRate, contractRate + 2.0);
}

export function calcGds(
  mortgagePayment: number,
  propertyTax: number,
  heating: number,
  condoFees: number,
  monthlyGross: number
): number {
  return ((mortgagePayment + propertyTax + heating + condoFees * 0.5) / monthlyGross) * 100;
}

export function calcTds(
  mortgagePayment: number,
  propertyTax: number,
  heating: number,
  condoFees: number,
  otherDebts: number,
  monthlyGross: number
): number {
  return ((mortgagePayment + propertyTax + heating + condoFees * 0.5 + otherDebts) / monthlyGross) * 100;
}

export function calcLtv(mortgageAmount: number, propertyValue: number): number {
  return (mortgageAmount / propertyValue) * 100;
}

export function calcIrdPenalty(
  balance: number,
  contractRate: number,
  currentPostedRate: number,
  remainingMonths: number
): number {
  const diff = (contractRate - currentPostedRate) / 100;
  return Math.max(0, balance * diff * (remainingMonths / 12));
}

export function calcThreeMonthInterest(balance: number, annualRate: number): number {
  return balance * (annualRate / 100) * (3 / 12);
}
