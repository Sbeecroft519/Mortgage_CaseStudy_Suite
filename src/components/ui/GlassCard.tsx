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

import type { ReactNode, MouseEvent } from 'react';

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  accent?: boolean;
  onClick?: (e: MouseEvent) => void;
  padding?: boolean;
}

export function GlassCard({
  children,
  className = '',
  hover = false,
  accent = false,
  onClick,
  padding = true,
}: GlassCardProps) {
  return (
    <div
      className={`
        ${accent ? 'glass-accent' : 'glass'} rounded-2xl
        ${hover ? 'glass-hover cursor-pointer' : ''}
        ${padding ? 'p-6' : ''}
        ${className}
      `}
      onClick={onClick}
    >
      {children}
    </div>
  );
}
