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

import { useEffect, useState } from 'react';
import { ArrowLeft, Play, Loader2, AlertTriangle } from 'lucide-react';
import { GlassCard } from '../components/ui/GlassCard';
import { ClientBrief } from '../components/simulation/ClientBrief';
import { ScenarioStep } from '../components/simulation/ScenarioStep';
import { SimulationComplete } from '../components/simulation/SimulationComplete';
import { useNavigation } from '../context/NavigationContext';
import { useAuth } from '../context/AuthContext';
import { useSimulation } from '../hooks/useSimulation';

export function SimulationPage() {
  const { current, navigate, goBack } = useNavigation();
  const { profile } = useAuth();
  const caseStudyId = current.params.caseStudyId;

  const {
    phase,
    caseStudy,
    session,
    currentIndex,
    decisions,
    lastChosenOptionId,
    loading,
    error,
    loadCaseStudy,
    startSession,
    proceedToScenarios,
    submitDecision,
    nextScenario,
    reset,
  } = useSimulation();

  const [agentName, setAgentName] = useState(profile?.full_name || '');

  useEffect(() => {
    if (caseStudyId) {
      loadCaseStudy(caseStudyId);
    }
  }, [caseStudyId, loadCaseStudy]);

  if (!caseStudyId) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-32 text-center">
        <AlertTriangle className="w-10 h-10 text-amber-500 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-slate-900 mb-2">
          No Case Study Selected
        </h2>
        <p className="text-slate-500 mb-6">
          Please select a case study from the library to begin.
        </p>
        <button onClick={() => navigate('library')} className="btn-primary">
          Go to Library
        </button>
      </div>
    );
  }

  if (loading && !caseStudy) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="w-6 h-6 text-cyan-700 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-32 text-center">
        <AlertTriangle className="w-10 h-10 text-rose-500 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-slate-900 mb-2">Error</h2>
        <p className="text-slate-500 mb-6">{error}</p>
        <button onClick={goBack} className="btn-primary">
          Go Back
        </button>
      </div>
    );
  }

  if (!caseStudy) return null;

  const diffBadge: Record<string, string> = {
    beginner: 'badge-beginner',
    intermediate: 'badge-intermediate',
    advanced: 'badge-advanced',
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {phase !== 'complete' && (
        <button
          onClick={goBack}
          className="btn-ghost mb-6 -ml-2"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
      )}

      {phase === 'start' && (
        <div className="max-w-2xl mx-auto text-center animate-fade-in">
          <GlassCard className="mb-8">
            <span className={diffBadge[caseStudy.difficulty]}>
              {caseStudy.difficulty}
            </span>
            <h2 className="text-2xl font-bold text-slate-900 mt-4 mb-2">
              {caseStudy.title}
            </h2>
            <p className="text-slate-500 text-sm leading-relaxed mb-6">
              {caseStudy.description}
            </p>

            <div className="grid grid-cols-3 gap-4 mb-6 p-4 rounded-xl bg-slate-50/60">
              <div>
                <div className="text-lg font-bold text-slate-900">
                  {caseStudy.scenarios.length}
                </div>
                <div className="text-xs text-slate-500">Scenarios</div>
              </div>
              <div>
                <div className="text-lg font-bold text-slate-900">
                  {caseStudy.scenarios.reduce((s, sc) => s + sc.points, 0)}
                </div>
                <div className="text-xs text-slate-500">Total Points</div>
              </div>
              <div>
                <div className="text-lg font-bold text-slate-900">
                  ~{Math.ceil(caseStudy.scenarios.length * 2.5)} min
                </div>
                <div className="text-xs text-slate-500">Est. Duration</div>
              </div>
            </div>

            <div className="max-w-sm mx-auto">
              <label className="block text-xs font-medium text-slate-500 mb-1.5 text-left">
                Your Name
              </label>
              <input
                type="text"
                value={agentName}
                onChange={(e) => setAgentName(e.target.value)}
                className="input-field mb-4"
                placeholder="Enter your name to begin"
              />

              <button
                onClick={() => startSession(agentName)}
                disabled={!agentName.trim() || loading}
                className="btn-primary w-full text-base py-3"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Play className="w-4 h-4" />
                )}
                Start Simulation
              </button>
            </div>
          </GlassCard>
        </div>
      )}

      {phase === 'brief' && (
        <ClientBrief caseStudy={caseStudy} onContinue={proceedToScenarios} />
      )}

      {(phase === 'scenario' || phase === 'feedback') && (
        <ScenarioStep
          key={`${currentIndex}-${phase}`}
          scenario={caseStudy.scenarios[currentIndex]}
          index={currentIndex}
          total={caseStudy.scenarios.length}
          feedbackMode={phase === 'feedback'}
          chosenOptionId={lastChosenOptionId}
          onSubmit={submitDecision}
          onNext={nextScenario}
          loading={loading}
        />
      )}

      {phase === 'complete' && session && (
        <SimulationComplete
          caseStudy={caseStudy}
          session={session}
          decisions={decisions}
          onViewDashboard={() => navigate('dashboard')}
          onRetry={() => {
            reset();
            loadCaseStudy(caseStudyId);
          }}
          onLibrary={() => navigate('library')}
        />
      )}
    </div>
  );
}
