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

import { useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { CaseStudy, SimulationSession, SimulationDecision } from '../types';

export type SimPhase = 'start' | 'brief' | 'scenario' | 'feedback' | 'complete';

interface SimulationState {
  phase: SimPhase;
  session: SimulationSession | null;
  caseStudy: CaseStudy | null;
  currentIndex: number;
  decisions: SimulationDecision[];
  lastChosenOptionId: string | null;
}

const initialState: SimulationState = {
  phase: 'start',
  session: null,
  caseStudy: null,
  currentIndex: 0,
  decisions: [],
  lastChosenOptionId: null,
};

export function useSimulation() {
  const [state, setState] = useState<SimulationState>(initialState);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadCaseStudy = useCallback(async (id: string) => {
    setLoading(true);
    const { data, error: err } = await supabase
      .from('case_studies')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (err || !data) {
      setError(err?.message || 'Case study not found');
      setLoading(false);
      return;
    }

    setState({
      ...initialState,
      caseStudy: data as CaseStudy,
    });
    setLoading(false);
  }, []);

  const startSession = useCallback(
    async (agentName: string) => {
      if (!state.caseStudy) return;
      setLoading(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setError('You must be signed in to start a simulation');
        setLoading(false);
        return;
      }

      const maxScore = state.caseStudy.scenarios.reduce(
        (sum, s) => sum + s.points,
        0
      );

      const { data, error: err } = await supabase
        .from('simulation_sessions')
        .insert({
          agent_name: agentName,
          case_study_id: state.caseStudy.id,
          max_possible_score: maxScore,
          user_id: user.id,
        })
        .select()
        .maybeSingle();

      if (err || !data) {
        setError(err?.message || 'Failed to create session');
        setLoading(false);
        return;
      }

      setState((prev) => ({
        ...prev,
        session: data as SimulationSession,
        phase: 'brief',
      }));
      setLoading(false);
    },
    [state.caseStudy]
  );

  const proceedToScenarios = useCallback(() => {
    setState((prev) => ({ ...prev, phase: 'scenario' }));
  }, []);

  const submitDecision = useCallback(
    async (optionId: string) => {
      if (!state.session || !state.caseStudy) return;
      setLoading(true);

      const scenario = state.caseStudy.scenarios[state.currentIndex];
      const option = scenario.options.find((o) => o.id === optionId);
      if (!option) return;

      const isCorrect = option.is_correct;
      const pointsEarned = isCorrect ? scenario.points : 0;

      const { data, error: err } = await supabase
        .from('simulation_decisions')
        .insert({
          session_id: state.session.id,
          scenario_index: state.currentIndex,
          option_chosen: optionId,
          is_correct: isCorrect,
          points_earned: pointsEarned,
        })
        .select()
        .maybeSingle();

      if (err) {
        setError(err.message);
        setLoading(false);
        return;
      }

      const newTotalScore = state.session.total_score + pointsEarned;

      await supabase
        .from('simulation_sessions')
        .update({ total_score: newTotalScore })
        .eq('id', state.session.id);

      setState((prev) => ({
        ...prev,
        phase: 'feedback',
        lastChosenOptionId: optionId,
        decisions: [...prev.decisions, data as SimulationDecision],
        session: prev.session
          ? { ...prev.session, total_score: newTotalScore }
          : null,
      }));
      setLoading(false);
    },
    [state.session, state.caseStudy, state.currentIndex]
  );

  const nextScenario = useCallback(async () => {
    if (!state.caseStudy || !state.session) return;

    const isLast =
      state.currentIndex >= state.caseStudy.scenarios.length - 1;

    if (isLast) {
      await supabase
        .from('simulation_sessions')
        .update({ status: 'completed', completed_at: new Date().toISOString() })
        .eq('id', state.session.id);

      setState((prev) => ({
        ...prev,
        phase: 'complete',
        session: prev.session
          ? { ...prev.session, status: 'completed' }
          : null,
      }));
    } else {
      setState((prev) => ({
        ...prev,
        phase: 'scenario',
        currentIndex: prev.currentIndex + 1,
        lastChosenOptionId: null,
      }));
    }
  }, [state.caseStudy, state.session, state.currentIndex]);

  const reset = useCallback(() => {
    setState(initialState);
    setError(null);
  }, []);

  return {
    ...state,
    loading,
    error,
    loadCaseStudy,
    startSession,
    proceedToScenarios,
    submitDecision,
    nextScenario,
    reset,
  };
}
