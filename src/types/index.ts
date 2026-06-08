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

export interface ClientProfile {
  name: string;
  age: number;
  employment_type: string;
  employer: string;
  annual_income: number;
  credit_score: number;
  marital_status: string;
  dependents: number;
}

export interface PropertyDetails {
  type: string;
  location: string;
  purchase_price: number;
  intended_use: string;
}

export interface DebtItem {
  type: string;
  balance: number;
  monthly_payment: number;
}

export interface AssetItem {
  type: string;
  value: number;
}

export interface FinancialDetails {
  down_payment: number;
  existing_debts: DebtItem[];
  assets: AssetItem[];
  monthly_expenses: number;
}

export interface Source {
  title: string;
  url: string;
}

export interface ScenarioOption {
  id: string;
  text: string;
  is_correct: boolean;
  feedback: string;
}

export interface Scenario {
  title: string;
  description: string;
  context: string;
  options: ScenarioOption[];
  points: number;
  explanation: string;
  sources?: Source[];
}

export interface CaseStudy {
  id: string;
  title: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  category: string;
  client_profile: ClientProfile;
  property_details: PropertyDetails;
  financial_details: FinancialDetails;
  scenarios: Scenario[];
  published: boolean;
  created_at: string;
  updated_at: string;
}

export interface SimulationSession {
  id: string;
  agent_name: string;
  case_study_id: string;
  user_id: string | null;
  status: 'in_progress' | 'completed';
  total_score: number;
  max_possible_score: number;
  started_at: string;
  completed_at: string | null;
}

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  avatar_url: string;
  role: 'agent' | 'admin';
  created_at: string;
  updated_at: string;
}

export interface SimulationDecision {
  id: string;
  session_id: string;
  scenario_index: number;
  option_chosen: string;
  is_correct: boolean;
  points_earned: number;
  created_at: string;
}

export interface DashboardStats {
  total_sessions: number;
  completed_sessions: number;
  avg_score_pct: number;
  best_score_pct: number;
  by_difficulty: {
    difficulty: string;
    sessions: number;
    avg_score: number;
  }[];
  recent_sessions: {
    id: string;
    agent_name: string;
    case_study_title: string;
    difficulty: string;
    total_score: number;
    max_possible_score: number;
    completed_at: string;
  }[];
}

export type Page = 'home' | 'library' | 'generator' | 'simulation' | 'dashboard';

export interface NavigationState {
  page: Page;
  params: Record<string, string>;
}
