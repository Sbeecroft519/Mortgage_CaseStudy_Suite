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

import type { ClientProfile } from '../../types';
import type { Category, Difficulty } from './types';
import { pick, weightedPick, randInt } from './random';

const FIRST_NAMES = [
  'Sarah', 'Marcus', 'Priya', 'Jean-Pierre', 'Aiko', 'David', 'Fatima', 'Robert',
  'Lisa', 'Wei', 'Anya', 'Mohammed', 'Claire', 'Raj', 'Emma', 'Carlos',
  'Natasha', 'James', 'Yuki', 'Hassan', 'Sophie', 'Michael', 'Elena', 'Thomas',
  'Mei', 'Alexander', 'Ingrid', 'Kofi', 'Nadia', 'Patrick', 'Amara', 'Derek',
  'Olga', 'Samuel', 'Leila', 'Andre', 'Chloe', 'Victor', 'Isabelle', 'Omar',
  'Grace', 'Daniel', 'Simone', 'Ryan', 'Aisha', 'Kevin', 'Maya', 'Jonathan',
];

const LAST_NAMES = [
  'Chen', 'Thompson', 'Patel', 'Tremblay', 'Nakamura', "O'Brien", 'Singh', 'Park',
  'Nguyen', 'Leblanc', 'Kim', 'Stewart', 'Ahmed', 'Rodriguez', 'Morrison', 'Sharma',
  'Lavoie', 'Tanaka', 'Williams', 'Gagnon', 'Santos', 'MacLeod', 'Hassan', 'Berg',
  'Roy', 'Chang', 'Campbell', 'Okafor', 'Pelletier', 'Jensen', 'Kaur', 'Fischer',
  'Bouchard', 'Wong', 'MacDonald', 'Kovalenko', 'Martin', 'Lee', 'Fraser', 'Ali',
  'Bergeron', 'Zhao', 'Johnston', 'Ivanov', 'Cote', 'Yamamoto', 'Murphy', 'Dubois',
];

const EMPLOYERS_SALARIED = [
  'Rogers Communications', 'Shopify Inc.', 'BC Health Authority', 'TD Bank',
  'Manulife Financial', 'Government of Canada', 'Ontario Public Service',
  'TELUS Corporation', 'Air Canada', 'Deloitte Canada', 'CGI Group',
  'Sun Life Financial', 'Loblaw Companies', 'Scotiabank', 'Hydro-Quebec',
  'University of Toronto', 'CIBC', 'Bombardier Inc.', 'Canadian Tire Corp.',
  'Bell Canada', 'Province of BC', 'City of Calgary', 'RBC', 'Enbridge Inc.',
];

interface CategoryProfileConfig {
  ageRange: [number, number];
  incomeRange: [number, number];
  creditRange: [number, number];
  employmentWeights: { value: string; weight: number }[];
  maritalWeights: { value: string; weight: number }[];
  dependentsRange: [number, number];
}

const CATEGORY_CONFIG: Record<Category, CategoryProfileConfig> = {
  'First-Time Buyer': {
    ageRange: [24, 38],
    incomeRange: [55000, 120000],
    creditRange: [680, 800],
    employmentWeights: [
      { value: 'Full-time Employee', weight: 70 },
      { value: 'Contract', weight: 20 },
      { value: 'Part-time Employee', weight: 10 },
    ],
    maritalWeights: [
      { value: 'Single', weight: 45 },
      { value: 'Married', weight: 30 },
      { value: 'Common-Law', weight: 25 },
    ],
    dependentsRange: [0, 1],
  },
  'Self-Employed': {
    ageRange: [30, 55],
    incomeRange: [80000, 200000],
    creditRange: [640, 780],
    employmentWeights: [{ value: 'Self-Employed', weight: 100 }],
    maritalWeights: [
      { value: 'Married', weight: 50 },
      { value: 'Common-Law', weight: 20 },
      { value: 'Single', weight: 20 },
      { value: 'Divorced', weight: 10 },
    ],
    dependentsRange: [0, 3],
  },
  'Refinancing': {
    ageRange: [35, 60],
    incomeRange: [70000, 160000],
    creditRange: [680, 780],
    employmentWeights: [
      { value: 'Full-time Employee', weight: 80 },
      { value: 'Self-Employed', weight: 20 },
    ],
    maritalWeights: [
      { value: 'Married', weight: 55 },
      { value: 'Divorced', weight: 20 },
      { value: 'Single', weight: 15 },
      { value: 'Widowed', weight: 10 },
    ],
    dependentsRange: [0, 3],
  },
  'Investment Property': {
    ageRange: [32, 55],
    incomeRange: [130000, 280000],
    creditRange: [720, 820],
    employmentWeights: [
      { value: 'Full-time Employee', weight: 60 },
      { value: 'Self-Employed', weight: 40 },
    ],
    maritalWeights: [
      { value: 'Married', weight: 65 },
      { value: 'Common-Law', weight: 20 },
      { value: 'Single', weight: 15 },
    ],
    dependentsRange: [0, 2],
  },
  'Credit Challenge': {
    ageRange: [25, 50],
    incomeRange: [45000, 100000],
    creditRange: [520, 650],
    employmentWeights: [
      { value: 'Full-time Employee', weight: 50 },
      { value: 'Contract', weight: 25 },
      { value: 'Self-Employed', weight: 15 },
      { value: 'Part-time Employee', weight: 10 },
    ],
    maritalWeights: [
      { value: 'Single', weight: 30 },
      { value: 'Divorced', weight: 30 },
      { value: 'Married', weight: 25 },
      { value: 'Common-Law', weight: 15 },
    ],
    dependentsRange: [0, 3],
  },
};

function roundIncome(val: number, difficulty: Difficulty): number {
  return difficulty === 'beginner'
    ? Math.round(val / 5000) * 5000
    : Math.round(val / 1000) * 1000;
}

export function generateProfile(
  category: Category,
  difficulty: Difficulty,
  rng: () => number
): ClientProfile {
  const cfg = CATEGORY_CONFIG[category];
  const firstName = pick(rng, FIRST_NAMES);
  const lastName = pick(rng, LAST_NAMES);
  const employmentType = weightedPick(rng, cfg.employmentWeights);

  let employer: string;
  if (employmentType === 'Self-Employed') {
    const bizTypes = ['Consulting Ltd.', 'Services Inc.', 'Contracting Ltd.', 'Solutions Inc.', '& Associates'];
    employer = `${lastName} ${pick(rng, bizTypes)} (Owner)`;
  } else {
    employer = pick(rng, EMPLOYERS_SALARIED);
  }

  const rawIncome = randInt(rng, cfg.incomeRange[0], cfg.incomeRange[1]);

  return {
    name: `${firstName} ${lastName}`,
    age: randInt(rng, cfg.ageRange[0], cfg.ageRange[1]),
    employment_type: employmentType,
    employer,
    annual_income: roundIncome(rawIncome, difficulty),
    credit_score: randInt(rng, cfg.creditRange[0], cfg.creditRange[1]),
    marital_status: weightedPick(rng, cfg.maritalWeights),
    dependents: randInt(rng, cfg.dependentsRange[0], cfg.dependentsRange[1]),
  };
}
