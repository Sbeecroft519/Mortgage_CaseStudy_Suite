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
import { Loader2, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { GlassCard } from '../components/ui/GlassCard';
import { useAuth } from '../context/AuthContext';

type Mode = 'sign_in' | 'sign_up';

export function LoginPage() {
  const { signIn, signUp, loading } = useAuth();
  const [mode, setMode] = useState<Mode>('sign_in');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    if (mode === 'sign_up') {
      if (password.length < 6) {
        setError('Password must be at least 6 characters');
        setSubmitting(false);
        return;
      }
      if (!fullName.trim()) {
        setError('Please enter your full name');
        setSubmitting(false);
        return;
      }
      const result = await signUp(email, password, fullName.trim());
      if (result.error) {
        setError(result.error);
      }
    } else {
      const result = await signIn(email, password);
      if (result.error) {
        setError(result.error);
      }
    }

    setSubmitting(false);
  };

  const switchMode = () => {
    setMode(mode === 'sign_in' ? 'sign_up' : 'sign_in');
    setError(null);
  };

  const isLoading = loading || submitting;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 relative">
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-32 w-[500px] h-[500px] bg-cyan-200/15 rounded-full blur-3xl" />
        <div className="absolute top-1/3 -left-32 w-[400px] h-[400px] bg-teal-200/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-32 right-1/4 w-[400px] h-[400px] bg-sky-200/10 rounded-full blur-3xl" />
      </div>

      <div className="max-w-sm w-full animate-fade-in">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-cyan-700 flex items-center justify-center mx-auto mb-5 shadow-lg shadow-cyan-700/20">
            <svg viewBox="0 0 32 32" className="w-8 h-8 text-white" fill="currentColor">
              <path d="M16 4 L4 13 L4 28 L13 28 L13 21 L19 21 L19 28 L28 28 L28 13 Z" />
            </svg>
          </div>
          <h1 className="font-display text-2xl font-bold text-slate-900">Mortgages with Steve</h1>
          <p className="text-sm text-slate-500 mt-1.5">
            Agent Training Platform
          </p>
        </div>

        <GlassCard className="text-center">
          <h2 className="text-lg font-semibold text-slate-900 mb-1.5">
            {mode === 'sign_in' ? 'Welcome back' : 'Create your account'}
          </h2>
          <p className="text-sm text-slate-500 mb-6">
            {mode === 'sign_in'
              ? 'Sign in to continue your training'
              : 'Join the training platform'}
          </p>

          <form onSubmit={handleSubmit} className="space-y-4 text-left">
            {mode === 'sign_up' && (
              <div>
                <label
                  htmlFor="fullName"
                  className="block text-sm font-medium text-slate-700 mb-1.5"
                >
                  Full name
                </label>
                <input
                  id="fullName"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Jane Smith"
                  required
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200/80 bg-white text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-500 transition-all"
                />
              </div>
            )}

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-slate-700 mb-1.5"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200/80 bg-white text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-500 transition-all"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-slate-700 mb-1.5"
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={mode === 'sign_up' ? 'Min. 6 characters' : 'Enter your password'}
                  required
                  className="w-full px-4 py-2.5 pr-11 rounded-xl border border-slate-200/80 bg-white text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-500 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {error && (
              <div className="px-4 py-3 rounded-xl bg-red-50 border border-red-100 text-sm text-red-600">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 px-5 py-3 bg-cyan-700 rounded-xl text-sm font-medium text-white shadow-sm hover:bg-cyan-800 hover:shadow-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  {mode === 'sign_in' ? 'Sign in' : 'Create account'}
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <p className="text-sm text-slate-500 mt-5">
            {mode === 'sign_in' ? (
              <>
                Don't have an account?{' '}
                <button
                  onClick={switchMode}
                  className="text-cyan-700 font-medium hover:text-cyan-800 transition-colors"
                >
                  Sign up
                </button>
              </>
            ) : (
              <>
                Already have an account?{' '}
                <button
                  onClick={switchMode}
                  className="text-cyan-700 font-medium hover:text-cyan-800 transition-colors"
                >
                  Sign in
                </button>
              </>
            )}
          </p>
        </GlassCard>

        <p className="text-center text-xs text-slate-400 mt-6">
          <a
            href="https://www.mortgageswithsteve.com"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-cyan-700 transition-colors"
          >
            mortgageswithsteve.com
          </a>
        </p>
      </div>
    </div>
  );
}
