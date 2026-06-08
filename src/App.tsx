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

import { Loader2 } from 'lucide-react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NavigationProvider, useNavigation } from './context/NavigationContext';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { LoginPage } from './pages/LoginPage';
import { HomePage } from './pages/HomePage';
import { LibraryPage } from './pages/LibraryPage';
import { GeneratorPage } from './pages/GeneratorPage';
import { SimulationPage } from './pages/SimulationPage';
import { DashboardPage } from './pages/DashboardPage';

function PageRouter() {
  const { current } = useNavigation();

  switch (current.page) {
    case 'home':
      return <HomePage />;
    case 'library':
      return <LibraryPage />;
    case 'generator':
      return <GeneratorPage />;
    case 'simulation':
      return <SimulationPage />;
    case 'dashboard':
      return <DashboardPage />;
    default:
      return <HomePage />;
  }
}

function AuthenticatedApp() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-6 h-6 text-cyan-700 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <LoginPage />;
  }

  return (
    <NavigationProvider>
      <div className="min-h-screen flex flex-col relative">
        <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-32 w-[500px] h-[500px] bg-cyan-200/15 rounded-full blur-3xl" />
          <div className="absolute top-1/3 -left-32 w-[400px] h-[400px] bg-teal-200/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-32 right-1/4 w-[400px] h-[400px] bg-sky-200/10 rounded-full blur-3xl" />
        </div>
        <Header />
        <main className="flex-1">
          <PageRouter />
        </main>
        <Footer />
      </div>
    </NavigationProvider>
  );
}

function App() {
  return (
    <AuthProvider>
      <AuthenticatedApp />
    </AuthProvider>
  );
}

export default App;
