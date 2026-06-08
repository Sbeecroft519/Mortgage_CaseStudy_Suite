# Mortgage Case-Study Suite

An interactive training platform for Canadian mortgage agents. Practice realistic client scenarios, make decisions under pressure, and receive instant feedback grounded in Canadian mortgage regulations.

## Features

- **AI-Powered Case Study Generator** -- Generates unique, realistic mortgage scenarios on demand using OpenAI. Each case study features a distinct client profile, property, financial situation, and set of decision-point questions. The combinatorial prompt system draws from 25+ client archetypes, 25+ regulatory focus areas, and 8 teaching themes to produce virtually unlimited variety.

- **Case Study Library** -- Browse and launch pre-built and AI-generated case studies organized by difficulty (beginner, intermediate, advanced) and category (first-time buyer, self-employed, refinancing, investment property, credit challenge).

- **Interactive Simulations** -- Step through each scenario, choose from multiple-choice options, and receive detailed feedback explaining why each answer is correct or incorrect, with references to Canadian regulatory sources (CMHC, OSFI, FSRA, FCAC, CRA).

- **Performance Dashboard** -- Track completed sessions, average and best scores, and performance breakdowns by difficulty level.

- **Built-in Fallback Generator** -- A template-based local generator provides instant case studies if the AI service is temporarily unavailable, so training is never interrupted.

## Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS, Vite
- **Backend**: Supabase (PostgreSQL, Auth, Edge Functions)
- **AI**: OpenAI GPT-4o-mini via Supabase Edge Function
- **Icons**: Lucide React

## Getting Started

### Prerequisites

- Node.js 18+
- A Supabase project with the required tables (see `supabase/migrations/`)
- An OpenAI API key configured as a Supabase Edge Function secret

### Installation

```bash
git clone <repository-url>
cd mortgage-training-simulator
npm install
```

### Environment Variables

Create a `.env` file in the project root:

```
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

The Edge Function requires these secrets configured in your Supabase project:

- `OPENAI_API_KEY` -- Your OpenAI API key for AI case study generation

### Database Setup

Apply all migrations in order from `supabase/migrations/`. These create the `case_studies`, `simulation_sessions`, `simulation_decisions`, and `profiles` tables with appropriate Row Level Security policies.

### Development

```bash
npm run dev
```

### Build

```bash
npm run build
```

## Project Structure

```
src/
  components/       UI components organized by feature
    generator/      AI generator and scenario builder
    layout/         Header, footer
    simulation/     Client brief, scenario steps, completion screen
    ui/             Reusable UI primitives
  context/          React contexts (auth, navigation)
  data/             Seed data
  hooks/            Custom React hooks
  lib/
    generator/      Local template-based case study generator
      scenarios/    Scenario templates by category
    supabase.ts     Supabase client singleton
  pages/            Page-level components
  types/            TypeScript type definitions
supabase/
  functions/        Supabase Edge Functions
    generate-case-study/  AI-powered case study generation
  migrations/       Database migration files
```

## License

Copyright 2026 Stephen Beecroft | Thinkbot Marketing

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

See [LICENSE](LICENSE) for the full license text and [NOTICE](NOTICE) for third-party attributions.
