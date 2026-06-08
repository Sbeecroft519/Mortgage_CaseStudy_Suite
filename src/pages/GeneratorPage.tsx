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

import { useState } from 'react';
import {
  PlusCircle,
  ChevronRight,
  ChevronLeft,
  Save,
  Loader2,
  User,
  Building,
  Wallet,
  ListChecks,
  FileText,
  Check,
} from 'lucide-react';
import { GlassCard } from '../components/ui/GlassCard';
import { ScenarioBuilder } from '../components/generator/ScenarioBuilder';
import { AIGenerator } from '../components/generator/AIGenerator';
import { useCaseStudies } from '../hooks/useCaseStudies';
import { useNavigation } from '../context/NavigationContext';
import type { CaseStudy, Scenario } from '../types';

type FormData = Omit<CaseStudy, 'id' | 'created_at' | 'updated_at'>;

const initialForm: FormData = {
  title: '',
  description: '',
  difficulty: 'beginner',
  category: 'First-Time Buyer',
  published: false,
  client_profile: {
    name: '',
    age: 30,
    employment_type: 'Full-time Employee',
    employer: '',
    annual_income: 0,
    credit_score: 700,
    marital_status: 'Single',
    dependents: 0,
  },
  property_details: {
    type: 'Condominium',
    location: '',
    purchase_price: 0,
    intended_use: 'Primary Residence',
  },
  financial_details: {
    down_payment: 0,
    existing_debts: [],
    assets: [],
    monthly_expenses: 0,
  },
  scenarios: [],
};

const steps = [
  { label: 'Basics', icon: FileText },
  { label: 'Client', icon: User },
  { label: 'Property', icon: Building },
  { label: 'Financial', icon: Wallet },
  { label: 'Scenarios', icon: ListChecks },
];

const categories = [
  'First-Time Buyer',
  'Self-Employed',
  'Refinancing',
  'Investment Property',
  'Credit Challenge',
];

export function GeneratorPage() {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormData>(initialForm);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const { create } = useCaseStudies();
  const { navigate } = useNavigation();

  const updateClient = (field: string, value: unknown) =>
    setForm((f) => ({
      ...f,
      client_profile: { ...f.client_profile, [field]: value },
    }));

  const updateProperty = (field: string, value: unknown) =>
    setForm((f) => ({
      ...f,
      property_details: { ...f.property_details, [field]: value },
    }));

  const updateFinancial = (field: string, value: unknown) =>
    setForm((f) => ({
      ...f,
      financial_details: { ...f.financial_details, [field]: value },
    }));

  const handleSave = async (publish: boolean) => {
    setSaving(true);
    const result = await create({ ...form, published: publish });
    setSaving(false);
    if (result) {
      setSaved(true);
      setTimeout(() => navigate('library'), 1500);
    }
  };

  if (saved) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-32 text-center animate-fade-in">
        <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-6">
          <Check className="w-8 h-8 text-emerald-600" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">
          Case Study Created
        </h2>
        <p className="text-slate-500">Redirecting to the library...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
          <PlusCircle className="w-6 h-6 text-cyan-700" />
          Case Study Generator
        </h1>
        <p className="text-slate-500 mt-1">
          Create a new mortgage training scenario
        </p>
      </div>

      <AIGenerator />

      <div className="relative flex items-center gap-4 my-10">
        <div className="flex-1 border-t border-slate-200/60" />
        <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">or create manually</span>
        <div className="flex-1 border-t border-slate-200/60" />
      </div>

      <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-2">
        {steps.map((s, i) => (
          <button
            key={s.label}
            onClick={() => setStep(i)}
            className={`
              flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all
              ${step === i
                ? 'bg-cyan-700 text-white shadow-md shadow-cyan-700/20'
                : step > i
                  ? 'bg-emerald-100/60 text-emerald-700'
                  : 'bg-white/50 text-slate-500 hover:bg-white/70'
              }
            `}
          >
            <s.icon className="w-4 h-4" />
            {s.label}
          </button>
        ))}
      </div>

      <GlassCard>
        {step === 0 && (
          <div className="space-y-4 animate-fade-in">
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">
                Title
              </label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                className="input-field"
                placeholder="e.g., First-Time Homebuyer: Jane Doe"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">
                Description
              </label>
              <textarea
                value={form.description}
                onChange={(e) =>
                  setForm((f) => ({ ...f, description: e.target.value }))
                }
                className="input-field min-h-[80px]"
                rows={3}
                placeholder="Brief overview of the scenario and learning objectives"
              />
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">
                  Difficulty
                </label>
                <select
                  value={form.difficulty}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      difficulty: e.target.value as FormData['difficulty'],
                    }))
                  }
                  className="select-field"
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">
                  Category
                </label>
                <select
                  value={form.category}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, category: e.target.value }))
                  }
                  className="select-field"
                >
                  {categories.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-4 animate-fade-in">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">
                  Client Name
                </label>
                <input
                  type="text"
                  value={form.client_profile.name}
                  onChange={(e) => updateClient('name', e.target.value)}
                  className="input-field"
                  placeholder="Full name"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">
                  Age
                </label>
                <input
                  type="number"
                  value={form.client_profile.age}
                  onChange={(e) => updateClient('age', Number(e.target.value))}
                  className="input-field"
                  min={18}
                  max={99}
                />
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">
                  Employment Type
                </label>
                <select
                  value={form.client_profile.employment_type}
                  onChange={(e) =>
                    updateClient('employment_type', e.target.value)
                  }
                  className="select-field"
                >
                  <option>Full-time Employee</option>
                  <option>Part-time Employee</option>
                  <option>Self-Employed</option>
                  <option>Contract</option>
                  <option>Retired</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">
                  Employer
                </label>
                <input
                  type="text"
                  value={form.client_profile.employer}
                  onChange={(e) => updateClient('employer', e.target.value)}
                  className="input-field"
                  placeholder="Company name"
                />
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">
                  Annual Income ($)
                </label>
                <input
                  type="number"
                  value={form.client_profile.annual_income || ''}
                  onChange={(e) =>
                    updateClient('annual_income', Number(e.target.value))
                  }
                  className="input-field"
                  min={0}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">
                  Credit Score
                </label>
                <input
                  type="number"
                  value={form.client_profile.credit_score || ''}
                  onChange={(e) =>
                    updateClient('credit_score', Number(e.target.value))
                  }
                  className="input-field"
                  min={300}
                  max={900}
                />
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">
                  Marital Status
                </label>
                <select
                  value={form.client_profile.marital_status}
                  onChange={(e) =>
                    updateClient('marital_status', e.target.value)
                  }
                  className="select-field"
                >
                  <option>Single</option>
                  <option>Married</option>
                  <option>Common-Law</option>
                  <option>Divorced</option>
                  <option>Widowed</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">
                  Dependents
                </label>
                <input
                  type="number"
                  value={form.client_profile.dependents}
                  onChange={(e) =>
                    updateClient('dependents', Number(e.target.value))
                  }
                  className="input-field"
                  min={0}
                />
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4 animate-fade-in">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">
                  Property Type
                </label>
                <select
                  value={form.property_details.type}
                  onChange={(e) => updateProperty('type', e.target.value)}
                  className="select-field"
                >
                  <option>Condominium</option>
                  <option>Townhouse</option>
                  <option>Semi-Detached</option>
                  <option>Detached House</option>
                  <option>Duplex (Up/Down)</option>
                  <option>Triplex</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">
                  Location
                </label>
                <input
                  type="text"
                  value={form.property_details.location}
                  onChange={(e) => updateProperty('location', e.target.value)}
                  className="input-field"
                  placeholder="City, Province"
                />
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">
                  Purchase Price ($)
                </label>
                <input
                  type="number"
                  value={form.property_details.purchase_price || ''}
                  onChange={(e) =>
                    updateProperty('purchase_price', Number(e.target.value))
                  }
                  className="input-field"
                  min={0}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">
                  Intended Use
                </label>
                <select
                  value={form.property_details.intended_use}
                  onChange={(e) =>
                    updateProperty('intended_use', e.target.value)
                  }
                  className="select-field"
                >
                  <option>Primary Residence</option>
                  <option>Investment / Rental</option>
                  <option>Vacation Property</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4 animate-fade-in">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">
                  Down Payment ($)
                </label>
                <input
                  type="number"
                  value={form.financial_details.down_payment || ''}
                  onChange={(e) =>
                    updateFinancial('down_payment', Number(e.target.value))
                  }
                  className="input-field"
                  min={0}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">
                  Monthly Expenses ($)
                </label>
                <input
                  type="number"
                  value={form.financial_details.monthly_expenses || ''}
                  onChange={(e) =>
                    updateFinancial('monthly_expenses', Number(e.target.value))
                  }
                  className="input-field"
                  min={0}
                />
              </div>
            </div>
            <p className="text-xs text-slate-400">
              Debts and assets can be added after creation via the edit flow.
            </p>
          </div>
        )}

        {step === 4 && (
          <div className="animate-fade-in">
            <ScenarioBuilder
              scenarios={form.scenarios}
              onChange={(s: Scenario[]) =>
                setForm((f) => ({ ...f, scenarios: s }))
              }
            />
          </div>
        )}

        <div className="flex items-center justify-between mt-8 pt-6 border-t border-slate-100/60">
          <button
            onClick={() => setStep((s) => Math.max(0, s - 1))}
            disabled={step === 0}
            className="btn-ghost"
          >
            <ChevronLeft className="w-4 h-4" /> Back
          </button>

          {step < steps.length - 1 ? (
            <button
              onClick={() => setStep((s) => s + 1)}
              className="btn-primary"
            >
              Next <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <div className="flex gap-3">
              <button
                onClick={() => handleSave(false)}
                disabled={saving || !form.title}
                className="btn-secondary"
              >
                {saving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                Save Draft
              </button>
              <button
                onClick={() => handleSave(true)}
                disabled={saving || !form.title || form.scenarios.length === 0}
                className="btn-primary"
              >
                {saving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Check className="w-4 h-4" />
                )}
                Publish
              </button>
            </div>
          )}
        </div>
      </GlassCard>
    </div>
  );
}
