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

import { ExternalLink } from 'lucide-react';

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-slate-200/40 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded bg-cyan-700 flex items-center justify-center">
              <svg viewBox="0 0 20 20" className="w-3 h-3 text-white" fill="currentColor">
                <path d="M10 2 L2 8.5 L2 18 L8 18 L8 13 L12 13 L12 18 L18 18 L18 8.5 Z" />
              </svg>
            </div>
            <span className="text-xs text-slate-500">
              {year} Mortgages with Steve. All rights reserved.
            </span>
          </div>

          <a
            href="https://www.mortgageswithsteve.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-cyan-700 transition-colors"
          >
            mortgageswithsteve.com
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>
    </footer>
  );
}
