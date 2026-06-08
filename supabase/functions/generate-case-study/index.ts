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

import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers":
    "Content-Type, Authorization, X-Client-Info, Apikey",
};

const CLIENT_ANGLES = [
  "a newcomer to Canada within the last 3 years navigating unfamiliar lending requirements",
  "a recently divorced individual rebuilding finances after a marital property settlement",
  "a gig economy worker juggling multiple income streams from platforms like Uber, Fiverr, and freelance consulting",
  "a young professional burdened with significant student loan debt from a professional degree",
  "a couple where one partner has poor credit due to a past consumer proposal",
  "a client relocating from another province for a corporate transfer",
  "a single parent supporting two dependents on one income with limited savings",
  "a retiree downsizing from a large family home to a condo using mostly equity",
  "a seasonal worker (fishing, tourism, or agriculture) with highly variable annual income",
  "a professional athlete or entertainer with a high but irregular and short career-span income",
  "a client purchasing in a rural or remote community with limited comparable sales data",
  "a multi-generational family pooling resources across three generations for a shared home",
  "a teacher or nurse with a stable public-sector salary but modest income relative to market prices",
  "a tech worker receiving a large portion of compensation as stock options and RSUs",
  "a small business owner who incorporated within the last 18 months",
  "a couple where one partner is a non-permanent resident on a work permit",
  "a returning expat who has been living abroad for 5+ years with no recent Canadian credit history",
  "a client who previously went through a foreclosure and is re-entering the housing market",
  "a young couple using the First Home Savings Account (FHSA) and Home Buyers' Plan (HBP) simultaneously",
  "a construction worker earning good income but paid largely in cash with complex documentation",
  "a freelance artist or musician with highly unpredictable project-based income",
  "a military member being posted to a new base and navigating DND relocation policies",
  "a client looking to purchase a property with a secondary suite to offset mortgage costs",
  "a senior citizen using reverse mortgage equity to help adult children with their down payment",
  "a real estate investor expanding from one rental property to a multi-unit portfolio",
];

const FOCUS_AREAS = [
  "prepayment privileges and penalty calculations (IRD vs 3-month interest)",
  "portable vs non-portable mortgage implications during a move",
  "co-signer and guarantor requirements and their impact on the guarantor's borrowing capacity",
  "bridge financing mechanics during a simultaneous buy-sell transaction",
  "private mortgage insurance alternatives and B-lender fee structures",
  "municipal zoning restrictions affecting property use or secondary suites",
  "title search complications, liens, easements, and encumbrances",
  "construction draw mortgage or renovation financing (Purchase Plus Improvements)",
  "rate hold and rate lock strategies in a volatile interest rate environment",
  "CMHC vs Sagen vs Canada Guaranty insurance premium tier differences",
  "understanding the B-20 stress test and how it limits purchasing power",
  "GDS/TDS ratio calculations with complex income and debt scenarios",
  "the difference between collateral and conventional charge mortgages",
  "land transfer tax calculations including first-time buyer rebates by province",
  "mortgage life insurance vs independent term life insurance for coverage",
  "the impact of property type (condo vs freehold) on qualification and insurance",
  "assignment sales and their unique mortgage qualification challenges",
  "VTB (vendor take-back) mortgage structuring and legal considerations",
  "the regulatory differences between OSFI-regulated (federally regulated) and provincially regulated lenders",
  "understanding mortgage commitment letters, conditions, and fulfillment timelines",
  "the Home Buyers' Plan (HBP) withdrawal rules, repayment schedule, and tax implications",
  "net worth programs and equity lending for high-net-worth clients with non-traditional income",
  "inter alia (blanket) mortgages across multiple properties",
  "discharge and switch/transfer processes and associated legal fees",
  "newcomer mortgage programs offered by major Canadian banks",
];

const TEACHING_THEMES = [
  "Help the trainee understand exactly WHEN to refer a client to a specialist (lawyer, accountant, financial planner, appraiser) vs handling it themselves.",
  "Emphasize how to communicate complex mortgage math to a client in plain language without losing accuracy.",
  "Focus on identifying red flags in applications that could indicate fraud, misrepresentation, or undisclosed liabilities.",
  "Teach the trainee how to compare multiple product options objectively and present a recommendation that prioritizes the client's long-term interest.",
  "Emphasize ethical obligations: suitability of the mortgage product, full disclosure of fees, and avoiding conflicts of interest.",
  "Show how small differences in assumptions (amortization, rate, prepayment) compound into major financial impacts over time.",
  "Highlight common mistakes new mortgage agents make and how to avoid them.",
  "Teach how to handle difficult client conversations: delivering bad news, managing expectations, and suggesting alternatives when a deal falls through.",
];

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function pickN<T>(arr: T[], n: number): T[] {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, n);
}

const SYSTEM_PROMPT = `You are an expert Canadian mortgage training content creator with 20+ years of experience as a mortgage broker, trainer, and FSRA-licensed instructor. Your job is to generate highly realistic, educational mortgage case studies that train new mortgage agents in Canada.

CRITICAL REQUIREMENTS:
1. Every case study must feel like a REAL client walking into a brokerage -- messy, nuanced, human. Never create a "textbook-clean" scenario.
2. Financial numbers MUST be mathematically consistent and realistic for the specified Canadian city and current market conditions.
3. Each scenario (question) must test a DIFFERENT competency -- never repeat similar knowledge areas.
4. Wrong answers must be PLAUSIBLE mistakes a new agent might actually make, not obviously absurd options.
5. Correct answers must include specific calculations, dollar amounts, percentages, and regulatory references.
6. Feedback must teach, not just say "this is wrong." Every wrong answer's feedback should explain the specific misconception.

DIFFICULTY CALIBRATION:
- beginner: Client situations are relatively straightforward. Questions test fundamental knowledge (stress test basics, CMHC insurance thresholds, standard GDS/TDS, basic documentation). One or two minor complications.
- intermediate: Client has 2-3 complicating factors. Questions require applying multiple rules simultaneously. Some scenarios have no single "perfect" answer -- the correct one is the BEST approach. Requires understanding of lender-specific policies.
- advanced: Client has significant complications that interact with each other. Questions require synthesizing regulatory knowledge, lender appetite, risk assessment, and client counseling. Some scenarios involve ethical judgment calls or creative structuring.

OUTPUT FORMAT -- Return ONLY a valid JSON object with this exact structure (no markdown, no code fences, no explanation):
{
  "title": "string - descriptive title including client's name",
  "description": "string - 2-3 sentence overview mentioning the key challenge and what the agent will learn",
  "difficulty": "beginner | intermediate | advanced",
  "category": "string",
  "published": true,
  "client_profile": {
    "name": "string - realistic Canadian name reflecting Canada's diversity",
    "age": number,
    "employment_type": "Full-time Employee | Part-time Employee | Self-Employed | Contract | Retired",
    "employer": "string - realistic Canadian employer or business name",
    "annual_income": number,
    "credit_score": number (300-900, realistic for the situation),
    "marital_status": "Single | Married | Common-Law | Divorced | Widowed",
    "dependents": number
  },
  "property_details": {
    "type": "Condominium | Townhouse | Semi-Detached | Detached House | Duplex (Up/Down) | Triplex",
    "location": "string - specific Canadian neighbourhood or area, City, Province abbreviation",
    "purchase_price": number,
    "intended_use": "Primary Residence | Investment / Rental | Vacation Property"
  },
  "financial_details": {
    "down_payment": number,
    "existing_debts": [{"type": "string", "balance": number, "monthly_payment": number}],
    "assets": [{"type": "string", "value": number}],
    "monthly_expenses": number
  },
  "scenarios": [
    {
      "title": "string - concise topic name",
      "description": "string - the specific question or decision the agent must make",
      "context": "string - 3-5 sentences of background with SPECIFIC numbers, rates, dates, and relevant details",
      "options": [
        {"id": "a", "text": "string - concise but complete answer option", "is_correct": boolean, "feedback": "string - 2-3 sentences explaining why this is correct/incorrect with specific numbers"},
        {"id": "b", ...},
        {"id": "c", ...},
        {"id": "d", ...}
      ],
      "points": 20,
      "explanation": "string - comprehensive 3-5 sentence explanation of the correct approach, the underlying principle, and how to apply it",
      "sources": [
        {"title": "string - Canadian regulatory source name", "url": "string - real URL to CMHC, OSFI, FSRA, FCAC, CRA, Bank of Canada, or provincial regulator"}
      ]
    }
  ]
}

SOURCES: Each scenario MUST include 1-3 sources from official Canadian regulatory bodies. Use REAL URLs only.`;

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Missing authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { difficulty, category } = await req.json();

    if (!difficulty || !category) {
      return new Response(
        JSON.stringify({ error: "difficulty and category are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const openaiKey = Deno.env.get("OPENAI_API_KEY");
    if (!openaiKey) {
      return new Response(
        JSON.stringify({ error: "OpenAI API key not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const angle = pick(CLIENT_ANGLES);
    const focuses = pickN(FOCUS_AREAS, 2);
    const theme = pick(TEACHING_THEMES);

    const canadianCities: Record<string, string[]> = {
      beginner: [
        "Ottawa, ON", "Halifax, NS", "Winnipeg, MB", "Saskatoon, SK",
        "London, ON", "Kingston, ON", "Regina, SK", "Fredericton, NB",
      ],
      intermediate: [
        "Toronto, ON", "Vancouver, BC", "Calgary, AB", "Montreal, QC",
        "Victoria, BC", "Kelowna, BC", "Hamilton, ON", "Kitchener, ON",
      ],
      advanced: [
        "Downtown Toronto, ON", "West Vancouver, BC", "Mississauga, ON",
        "North Vancouver, BC", "Richmond Hill, ON", "Oakville, ON",
        "Whistler, BC", "Canmore, AB",
      ],
    };
    const city = pick(canadianCities[difficulty] || canadianCities.intermediate);

    const userPrompt = `Generate a ${difficulty}-level Canadian mortgage case study in the "${category}" category.

CLIENT ANGLE: The client should be ${angle}.
LOCATION: Set the property in or near ${city} with market-appropriate pricing.
SCENARIO FOCUS: At least one scenario must cover ${focuses[0]}, and at least one must touch on ${focuses[1]}.
TEACHING THEME: ${theme}

IMPORTANT: Generate exactly 5 scenarios. Each scenario must test a DISTINCTLY different competency. Make the case study feel like a real client meeting -- include realistic complications, emotions, and time pressures that mortgage agents face in practice.

Make the client's name, background story, and financial situation completely unique. Never reuse common textbook examples. The client should feel like a real person with a real life.`;

    const openaiRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${openaiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.9,
        max_tokens: 5000,
      }),
    });

    if (!openaiRes.ok) {
      const errBody = await openaiRes.text();
      return new Response(
        JSON.stringify({ error: "AI generation failed", details: errBody }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const openaiData = await openaiRes.json();
    const content = openaiData.choices?.[0]?.message?.content;

    if (!content) {
      return new Response(
        JSON.stringify({ error: "No content returned from AI" }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let caseStudy;
    try {
      const cleaned = content.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();
      caseStudy = JSON.parse(cleaned);
    } catch {
      return new Response(
        JSON.stringify({ error: "Failed to parse AI response", raw: content }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!caseStudy.scenarios || !Array.isArray(caseStudy.scenarios) || caseStudy.scenarios.length < 3) {
      return new Response(
        JSON.stringify({ error: "AI generated an invalid case study structure" }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    for (const scenario of caseStudy.scenarios) {
      if (!scenario.options || scenario.options.length !== 4) continue;
      const correctCount = scenario.options.filter((o: { is_correct: boolean }) => o.is_correct).length;
      if (correctCount !== 1) {
        scenario.options.forEach((o: { is_correct: boolean }, i: number) => {
          o.is_correct = i === 0;
        });
      }
      scenario.points = scenario.points || 20;
    }

    caseStudy.difficulty = difficulty;
    caseStudy.category = category;
    caseStudy.published = true;

    const adminClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const insertPayload = {
      title: caseStudy.title,
      description: caseStudy.description,
      difficulty: caseStudy.difficulty,
      category: caseStudy.category,
      client_profile: caseStudy.client_profile,
      property_details: caseStudy.property_details,
      financial_details: caseStudy.financial_details,
      scenarios: caseStudy.scenarios,
      published: true,
    };

    const { data: saved, error: insertError } = await adminClient
      .from("case_studies")
      .insert(insertPayload)
      .select()
      .maybeSingle();

    if (insertError) {
      return new Response(
        JSON.stringify({ error: "Failed to save case study", details: insertError.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(JSON.stringify(saved), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(
      JSON.stringify({ error: "Internal server error", details: String(err) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
