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

import { useState, useEffect, useRef } from 'react';
import {
  BookOpen,
  BarChart3,
  PlusCircle,
  Home,
  Menu,
  X,
  LogOut,
  ChevronDown,
} from 'lucide-react';
import { useNavigation } from '../../context/NavigationContext';
import { useAuth } from '../../context/AuthContext';
import type { Page } from '../../types';

const navItems: { page: Page; label: string; icon: typeof Home }[] = [
  { page: 'home', label: 'Home', icon: Home },
  { page: 'library', label: 'Case Studies', icon: BookOpen },
  { page: 'generator', label: 'Generator', icon: PlusCircle },
  { page: 'dashboard', label: 'Dashboard', icon: BarChart3 },
];

export function Header() {
  const { current, navigate } = useNavigation();
  const { profile, signOut } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const handleNav = (page: Page) => {
    navigate(page);
    setMobileOpen(false);
  };

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(e.target as Node)
      ) {
        setUserMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const initials = (profile?.full_name || 'U')
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <header className="glass-strong sticky top-0 z-50 border-b border-white/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <button
            onClick={() => handleNav('home')}
            className="flex items-center gap-2.5 group"
          >
            <div className="w-8 h-8 rounded-lg bg-cyan-700 flex items-center justify-center shadow-sm">
              <svg viewBox="0 0 20 20" className="w-4 h-4 text-white" fill="currentColor">
                <path d="M10 2 L2 8.5 L2 18 L8 18 L8 13 L12 13 L12 18 L18 18 L18 8.5 Z" />
              </svg>
            </div>
            <div className="flex flex-col leading-none">
              <span className="font-display font-bold text-sm text-slate-900 group-hover:text-cyan-700 transition-colors">
                Mortgages with Steve
              </span>
              <span className="text-[10px] text-slate-400 font-medium tracking-wide">
                AGENT TRAINING
              </span>
            </div>
          </button>

          <nav className="hidden md:flex items-center gap-1">
            {navItems.map(({ page, label, icon: Icon }) => (
              <button
                key={page}
                onClick={() => handleNav(page)}
                className={`
                  flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200
                  ${
                    current.page === page
                      ? 'bg-cyan-700/10 text-cyan-800 shadow-sm shadow-cyan-700/5'
                      : 'text-slate-500 hover:text-slate-800 hover:bg-white/50'
                  }
                `}
              >
                <Icon className="w-4 h-4" />
                {label}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <div className="hidden md:block relative" ref={userMenuRef}>
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl hover:bg-white/50 transition-colors"
              >
                <div className="w-7 h-7 rounded-full bg-cyan-100 flex items-center justify-center text-xs font-semibold text-cyan-700">
                  {initials}
                </div>
                <span className="text-sm font-medium text-slate-700 max-w-[140px] truncate">
                  {profile?.full_name || 'User'}
                </span>
                <ChevronDown
                  className={`w-3.5 h-3.5 text-slate-400 transition-transform ${
                    userMenuOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {userMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-56 glass-strong rounded-xl overflow-hidden shadow-xl shadow-black/10 animate-fade-in">
                  <div className="px-4 py-3 border-b border-slate-100/60">
                    <p className="text-sm font-medium text-slate-900 truncate">
                      {profile?.full_name}
                    </p>
                    <p className="text-xs text-slate-400 truncate">
                      {profile?.email}
                    </p>
                    {profile?.role === 'admin' && (
                      <span className="inline-block mt-1.5 px-2 py-0.5 rounded-md bg-cyan-100/80 text-cyan-700 text-[10px] font-semibold uppercase tracking-wide">
                        Admin
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => {
                      signOut();
                      setUserMenuOpen(false);
                    }}
                    className="flex items-center gap-2.5 w-full px-4 py-3 text-sm text-slate-600 hover:bg-slate-50/60 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign out
                  </button>
                </div>
              )}
            </div>

            <button
              className="md:hidden p-2 rounded-xl text-slate-500 hover:bg-white/50 transition-colors"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden border-t border-white/20 animate-slide-down">
          <div className="px-4 py-3 space-y-1">
            {navItems.map(({ page, label, icon: Icon }) => (
              <button
                key={page}
                onClick={() => handleNav(page)}
                className={`
                  flex items-center gap-3 w-full px-4 py-2.5 rounded-xl text-sm font-medium transition-colors
                  ${
                    current.page === page
                      ? 'bg-cyan-700/10 text-cyan-800'
                      : 'text-slate-600 hover:bg-white/50'
                  }
                `}
              >
                <Icon className="w-4 h-4" />
                {label}
              </button>
            ))}

            <div className="border-t border-slate-100/60 pt-3 mt-3">
              <div className="flex items-center gap-3 px-4 py-2">
                <div className="w-8 h-8 rounded-full bg-cyan-100 flex items-center justify-center text-xs font-semibold text-cyan-700">
                  {initials}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-slate-900 truncate">
                    {profile?.full_name}
                  </p>
                  <p className="text-xs text-slate-400 truncate">
                    {profile?.email}
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  signOut();
                  setMobileOpen(false);
                }}
                className="flex items-center gap-3 w-full px-4 py-2.5 rounded-xl text-sm font-medium text-slate-600 hover:bg-white/50 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Sign out
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
