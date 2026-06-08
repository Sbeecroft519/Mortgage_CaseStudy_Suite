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

import {
  User,
  Briefcase,
  CreditCard,
  MapPin,
  Building,
  DollarSign,
  ArrowRight,
  Heart,
  Users,
} from 'lucide-react';
import { GlassCard } from '../ui/GlassCard';
import type { CaseStudy } from '../../types';

interface ClientBriefProps {
  caseStudy: CaseStudy;
  onContinue: () => void;
}

function formatCurrency(n: number) {
  return new Intl.NumberFormat('en-CA', {
    style: 'currency',
    currency: 'CAD',
    maximumFractionDigits: 0,
  }).format(n);
}

export function ClientBrief({ caseStudy, onContinue }: ClientBriefProps) {
  const { client_profile: client, property_details: property, financial_details: financial } =
    caseStudy;

  return (
    <div className="max-w-4xl mx-auto animate-slide-up">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Client Brief</h2>
        <p className="text-slate-500">
          Review the client's information before proceeding to the decision scenarios
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <GlassCard>
          <h3 className="text-sm font-semibold text-slate-700 mb-4 flex items-center gap-2">
            <User className="w-4 h-4 text-cyan-700" />
            Client Profile
          </h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-500">Name</span>
              <span className="font-medium text-slate-800">{client.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Age</span>
              <span className="font-medium text-slate-800">{client.age}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 flex items-center gap-1">
                <Briefcase className="w-3 h-3" /> Employment
              </span>
              <span className="font-medium text-slate-800">
                {client.employment_type}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Employer</span>
              <span className="font-medium text-slate-800 text-right max-w-[60%]">
                {client.employer}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 flex items-center gap-1">
                <DollarSign className="w-3 h-3" /> Income
              </span>
              <span className="font-medium text-slate-800">
                {formatCurrency(client.annual_income)}/yr
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 flex items-center gap-1">
                <CreditCard className="w-3 h-3" /> Credit Score
              </span>
              <span className="font-medium text-slate-800">
                {client.credit_score}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 flex items-center gap-1">
                <Heart className="w-3 h-3" /> Status
              </span>
              <span className="font-medium text-slate-800">
                {client.marital_status}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 flex items-center gap-1">
                <Users className="w-3 h-3" /> Dependents
              </span>
              <span className="font-medium text-slate-800">
                {client.dependents}
              </span>
            </div>
          </div>
        </GlassCard>

        <GlassCard>
          <h3 className="text-sm font-semibold text-slate-700 mb-4 flex items-center gap-2">
            <Building className="w-4 h-4 text-cyan-700" />
            Property Details
          </h3>
          <div className="space-y-3 text-sm mb-6">
            <div className="flex justify-between">
              <span className="text-slate-500">Type</span>
              <span className="font-medium text-slate-800">{property.type}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 flex items-center gap-1">
                <MapPin className="w-3 h-3" /> Location
              </span>
              <span className="font-medium text-slate-800">
                {property.location}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Purchase Price</span>
              <span className="font-semibold text-slate-900">
                {formatCurrency(property.purchase_price)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Intended Use</span>
              <span className="font-medium text-slate-800">
                {property.intended_use}
              </span>
            </div>
          </div>

          <h3 className="text-sm font-semibold text-slate-700 mb-4 flex items-center gap-2 pt-4 border-t border-slate-100/60">
            <DollarSign className="w-4 h-4 text-cyan-700" />
            Financial Summary
          </h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-500">Down Payment</span>
              <span className="font-medium text-slate-800">
                {formatCurrency(financial.down_payment)}
                {property.purchase_price > 0 && (
                  <span className="text-slate-400 ml-1">
                    ({((financial.down_payment / property.purchase_price) * 100).toFixed(1)}%)
                  </span>
                )}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Monthly Expenses</span>
              <span className="font-medium text-slate-800">
                {formatCurrency(financial.monthly_expenses)}
              </span>
            </div>
          </div>
        </GlassCard>
      </div>

      {financial.existing_debts.length > 0 && (
        <GlassCard className="mb-6">
          <h3 className="text-sm font-semibold text-slate-700 mb-3">
            Existing Debts
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-slate-500">
                  <th className="pb-2 font-medium">Type</th>
                  <th className="pb-2 font-medium text-right">Balance</th>
                  <th className="pb-2 font-medium text-right">Monthly</th>
                </tr>
              </thead>
              <tbody>
                {financial.existing_debts.map((d, i) => (
                  <tr key={i} className="border-t border-slate-50">
                    <td className="py-2 text-slate-700">{d.type}</td>
                    <td className="py-2 text-right text-slate-700">
                      {formatCurrency(d.balance)}
                    </td>
                    <td className="py-2 text-right text-slate-700">
                      {formatCurrency(d.monthly_payment)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </GlassCard>
      )}

      {financial.assets.length > 0 && (
        <GlassCard className="mb-8">
          <h3 className="text-sm font-semibold text-slate-700 mb-3">Assets</h3>
          <div className="grid sm:grid-cols-2 gap-2">
            {financial.assets.map((a, i) => (
              <div
                key={i}
                className="flex justify-between items-center py-2 px-3 rounded-lg bg-white/40 text-sm"
              >
                <span className="text-slate-600">{a.type}</span>
                <span className="font-medium text-slate-800">
                  {formatCurrency(a.value)}
                </span>
              </div>
            ))}
          </div>
        </GlassCard>
      )}

      <div className="text-center">
        <button onClick={onContinue} className="btn-primary text-base px-8 py-3">
          Begin Scenarios
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
