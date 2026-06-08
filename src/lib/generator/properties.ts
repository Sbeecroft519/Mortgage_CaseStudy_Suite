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

import type { ClientProfile, PropertyDetails } from '../../types';
import type { Category, Difficulty } from './types';
import { pick, weightedPick, randInt, roundToNearest } from './random';

interface MarketData {
  location: string;
  condoRange: [number, number];
  townhouseRange: [number, number];
  detachedRange: [number, number];
  duplexRange: [number, number];
}

const MARKETS: MarketData[] = [
  { location: 'Toronto, ON', condoRange: [400000, 750000], townhouseRange: [600000, 900000], detachedRange: [850000, 1400000], duplexRange: [800000, 1200000] },
  { location: 'Vancouver, BC', condoRange: [450000, 800000], townhouseRange: [650000, 950000], detachedRange: [900000, 1500000], duplexRange: [850000, 1300000] },
  { location: 'Ottawa, ON', condoRange: [280000, 450000], townhouseRange: [380000, 550000], detachedRange: [500000, 800000], duplexRange: [500000, 750000] },
  { location: 'Calgary, AB', condoRange: [200000, 350000], townhouseRange: [300000, 450000], detachedRange: [400000, 650000], duplexRange: [400000, 600000] },
  { location: 'Montreal, QC', condoRange: [250000, 450000], townhouseRange: [350000, 550000], detachedRange: [450000, 700000], duplexRange: [450000, 650000] },
  { location: 'Halifax, NS', condoRange: [220000, 380000], townhouseRange: [300000, 450000], detachedRange: [380000, 600000], duplexRange: [380000, 560000] },
  { location: 'Winnipeg, MB', condoRange: [180000, 300000], townhouseRange: [250000, 380000], detachedRange: [300000, 500000], duplexRange: [300000, 480000] },
  { location: 'Edmonton, AB', condoRange: [190000, 320000], townhouseRange: [280000, 420000], detachedRange: [380000, 580000], duplexRange: [370000, 540000] },
  { location: 'Victoria, BC', condoRange: [350000, 600000], townhouseRange: [500000, 750000], detachedRange: [700000, 1100000], duplexRange: [650000, 950000] },
  { location: 'Kelowna, BC', condoRange: [300000, 500000], townhouseRange: [450000, 650000], detachedRange: [600000, 950000], duplexRange: [550000, 850000] },
];

type PropType = 'Condominium' | 'Townhouse' | 'Semi-Detached' | 'Detached House' | 'Duplex (Up/Down)';

const CATEGORY_PROPERTY: Record<Category, {
  typeWeights: { value: PropType; weight: number }[];
  intendedUse: string;
}> = {
  'First-Time Buyer': {
    typeWeights: [
      { value: 'Condominium', weight: 45 },
      { value: 'Townhouse', weight: 30 },
      { value: 'Semi-Detached', weight: 15 },
      { value: 'Detached House', weight: 10 },
    ],
    intendedUse: 'Primary Residence',
  },
  'Self-Employed': {
    typeWeights: [
      { value: 'Detached House', weight: 40 },
      { value: 'Townhouse', weight: 25 },
      { value: 'Semi-Detached', weight: 20 },
      { value: 'Condominium', weight: 15 },
    ],
    intendedUse: 'Primary Residence',
  },
  'Refinancing': {
    typeWeights: [
      { value: 'Detached House', weight: 50 },
      { value: 'Semi-Detached', weight: 20 },
      { value: 'Townhouse', weight: 20 },
      { value: 'Condominium', weight: 10 },
    ],
    intendedUse: 'Primary Residence',
  },
  'Investment Property': {
    typeWeights: [
      { value: 'Duplex (Up/Down)', weight: 35 },
      { value: 'Condominium', weight: 30 },
      { value: 'Detached House', weight: 20 },
      { value: 'Townhouse', weight: 15 },
    ],
    intendedUse: 'Investment / Rental',
  },
  'Credit Challenge': {
    typeWeights: [
      { value: 'Condominium', weight: 40 },
      { value: 'Townhouse', weight: 30 },
      { value: 'Semi-Detached', weight: 20 },
      { value: 'Detached House', weight: 10 },
    ],
    intendedUse: 'Primary Residence',
  },
};

function getPriceRange(market: MarketData, propType: PropType): [number, number] {
  switch (propType) {
    case 'Condominium': return market.condoRange;
    case 'Townhouse': return market.townhouseRange;
    case 'Semi-Detached': return market.townhouseRange;
    case 'Detached House': return market.detachedRange;
    case 'Duplex (Up/Down)': return market.duplexRange;
    default: return market.condoRange;
  }
}

export function generateProperty(
  category: Category,
  _difficulty: Difficulty,
  client: ClientProfile,
  rng: () => number
): PropertyDetails {
  const cfg = CATEGORY_PROPERTY[category];
  const propType = weightedPick(rng, cfg.typeWeights);
  const market = pick(rng, MARKETS);
  const [minPrice, maxPrice] = getPriceRange(market, propType);

  const affordabilityMax = category === 'Investment Property'
    ? client.annual_income * 7
    : client.annual_income * 5.5;

  const priceMax = Math.min(maxPrice, affordabilityMax);
  const priceBound = Math.max(minPrice, priceMax);
  const rawPrice = randInt(rng, minPrice, priceBound);
  const purchasePrice = roundToNearest(rawPrice, 5000);

  return {
    type: propType,
    location: market.location,
    purchase_price: Math.max(purchasePrice, roundToNearest(minPrice, 5000)),
    intended_use: cfg.intendedUse,
  };
}
