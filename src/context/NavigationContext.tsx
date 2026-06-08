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

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import type { Page, NavigationState } from '../types';

interface NavigationContextType {
  current: NavigationState;
  navigate: (page: Page, params?: Record<string, string>) => void;
  goBack: () => void;
}

const NavigationContext = createContext<NavigationContextType | null>(null);

export function NavigationProvider({ children }: { children: ReactNode }) {
  const [history, setHistory] = useState<NavigationState[]>([
    { page: 'home', params: {} },
  ]);

  const current = history[history.length - 1];

  const navigate = useCallback((page: Page, params: Record<string, string> = {}) => {
    setHistory((prev) => [...prev, { page, params }]);
  }, []);

  const goBack = useCallback(() => {
    setHistory((prev) => (prev.length > 1 ? prev.slice(0, -1) : prev));
  }, []);

  return (
    <NavigationContext.Provider value={{ current, navigate, goBack }}>
      {children}
    </NavigationContext.Provider>
  );
}

export function useNavigation() {
  const ctx = useContext(NavigationContext);
  if (!ctx) throw new Error('useNavigation must be used within NavigationProvider');
  return ctx;
}
