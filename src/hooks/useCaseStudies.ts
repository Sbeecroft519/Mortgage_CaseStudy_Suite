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
import type { CaseStudy } from '../types';
import { generateCaseStudy } from '../lib/generator';
import type { Category, Difficulty } from '../lib/generator/types';

export type GenerationMethod = 'ai' | 'fallback';

export interface GenerateResult {
  caseStudy: CaseStudy;
  method: GenerationMethod;
}

export function useCaseStudies() {
  const [caseStudies, setCaseStudies] = useState<CaseStudy[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generationStatus, setGenerationStatus] = useState<string>('');

  const fetchPublished = useCallback(async () => {
    setLoading(true);
    setError(null);
    const { data, error: err } = await supabase
      .from('case_studies')
      .select('*')
      .order('created_at', { ascending: false });

    if (err) {
      setError(err.message);
    } else {
      setCaseStudies((data as CaseStudy[]) || []);
    }
    setLoading(false);
  }, []);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    const { data, error: err } = await supabase.rpc('get_all_case_studies');

    if (err) {
      setError(err.message);
    } else {
      setCaseStudies((data as CaseStudy[]) || []);
    }
    setLoading(false);
  }, []);

  const create = useCallback(
    async (
      caseStudy: Omit<CaseStudy, 'id' | 'created_at' | 'updated_at'>
    ): Promise<CaseStudy | null> => {
      const { data, error: err } = await supabase
        .from('case_studies')
        .insert(caseStudy)
        .select()
        .maybeSingle();

      if (err) {
        setError(err.message);
        return null;
      }
      return data as CaseStudy;
    },
    []
  );

  const update = useCallback(
    async (
      id: string,
      updates: Partial<CaseStudy>
    ): Promise<CaseStudy | null> => {
      const { data, error: err } = await supabase.rpc('update_case_study', {
        study_id: id,
        data: updates,
      });

      if (err) {
        setError(err.message);
        return null;
      }
      const rows = data as CaseStudy[];
      return rows?.[0] || null;
    },
    []
  );

  const generateWithAI = useCallback(
    async (
      difficulty: Difficulty,
      category: string
    ): Promise<GenerateResult | null> => {
      setLoading(true);
      setError(null);
      setGenerationStatus('Connecting to AI...');

      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          setError('You must be signed in to generate case studies.');
          setLoading(false);
          setGenerationStatus('');
          return null;
        }

        setGenerationStatus('AI is crafting a unique scenario...');

        const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-case-study`;
        const res = await fetch(apiUrl, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
            'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
          },
          body: JSON.stringify({ difficulty, category }),
        });

        if (res.ok) {
          const saved = await res.json();
          setGenerationStatus('');
          setLoading(false);
          return { caseStudy: saved as CaseStudy, method: 'ai' };
        }

        const errBody = await res.json().catch(() => ({ error: 'Unknown error' }));
        console.warn('AI generation failed, falling back to local generator:', errBody);
      } catch (err) {
        console.warn('AI generation network error, falling back to local generator:', err);
      }

      setGenerationStatus('Using built-in generator...');

      try {
        const caseStudyData = generateCaseStudy(difficulty, category as Category);
        const result = await create(caseStudyData);
        setGenerationStatus('');
        setLoading(false);
        if (result) {
          return { caseStudy: result, method: 'fallback' };
        }
        return null;
      } catch (err) {
        setError(String(err));
        setGenerationStatus('');
        setLoading(false);
        return null;
      }
    },
    [create]
  );

  const seedCaseStudies = useCallback(
    async (studies: Omit<CaseStudy, 'id' | 'created_at' | 'updated_at'>[]) => {
      setLoading(true);
      setError(null);
      const { error: err } = await supabase.from('case_studies').insert(studies);
      if (err) {
        setError(err.message);
      }
      setLoading(false);
    },
    []
  );

  return {
    caseStudies,
    loading,
    error,
    generationStatus,
    fetchPublished,
    fetchAll,
    create,
    update,
    generateWithAI,
    seedCaseStudies,
  };
}
