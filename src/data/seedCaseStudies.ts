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

import type { CaseStudy } from '../types';

type SeedStudy = Omit<CaseStudy, 'id' | 'created_at' | 'updated_at'>;

export const seedCaseStudies: SeedStudy[] = [
  {
    title: "First-Time Homebuyer: Sarah Chen",
    description:
      "A young professional purchasing her first condo in Toronto. Navigate CMHC insurance requirements, stress test qualification, debt service ratios, and product recommendations.",
    difficulty: 'beginner',
    category: 'First-Time Buyer',
    published: true,
    client_profile: {
      name: "Sarah Chen",
      age: 28,
      employment_type: "Full-time Employee",
      employer: "TechNorth Solutions Inc.",
      annual_income: 85000,
      credit_score: 740,
      marital_status: "Single",
      dependents: 0,
    },
    property_details: {
      type: "Condominium",
      location: "Toronto, ON",
      purchase_price: 550000,
      intended_use: "Primary Residence",
    },
    financial_details: {
      down_payment: 40000,
      existing_debts: [
        { type: "Student Loan", balance: 12000, monthly_payment: 250 },
        { type: "Car Loan", balance: 8000, monthly_payment: 350 },
      ],
      assets: [
        { type: "Savings Account", value: 52000 },
        { type: "TFSA", value: 15000 },
        { type: "RRSP", value: 8000 },
      ],
      monthly_expenses: 1800,
    },
    scenarios: [
      {
        title: "Initial Client Consultation",
        description:
          "Sarah has reached out about purchasing her first home. What should be your priority?",
        context:
          "Sarah is excited but nervous about buying her first home. She has been saving for 3 years and found a condo listed at $550,000.",
        options: [
          {
            id: "a",
            text: "Start the pre-approval process immediately to lock in a rate",
            is_correct: false,
            feedback:
              "Jumping straight to pre-approval without understanding the full picture could lead to unsuitable product recommendations. Always start with a thorough needs assessment.",
          },
          {
            id: "b",
            text: "Review her complete financial picture, homebuying goals, and timeline before discussing products",
            is_correct: true,
            feedback:
              "A comprehensive needs assessment is essential. Understanding goals, risk tolerance, timeline, and financial situation allows you to provide the most suitable advice.",
          },
          {
            id: "c",
            text: "Recommend the maximum property price she qualifies for",
            is_correct: false,
            feedback:
              "The maximum qualification amount may not be what the client should borrow. Always consider comfort level, lifestyle, and long-term goals.",
          },
          {
            id: "d",
            text: "Advise her to wait until she has a 20% down payment",
            is_correct: false,
            feedback:
              "This blanket advice ignores market conditions, timeline, and the fact that building equity sooner can offset insurance costs. Each situation requires individual analysis.",
          },
        ],
        points: 20,
        explanation:
          "The initial consultation sets the foundation for the client relationship. A thorough needs assessment ensures you understand goals, finances, risk tolerance, and timeline before recommending products.",
      },
      {
        title: "Mortgage Insurance Assessment",
        description:
          "With $40,000 down on $550,000 (7.27%), what insurance implications apply?",
        context:
          "Sarah's down payment represents 7.27% of the purchase price. She asks about additional costs to expect.",
        options: [
          {
            id: "a",
            text: "No insurance is needed since her credit score exceeds 700",
            is_correct: false,
            feedback:
              "Credit score doesn't determine whether mortgage insurance is required. CMHC insurance is mandatory for all mortgages with less than 20% down payment.",
          },
          {
            id: "b",
            text: "CMHC insurance is required at 4.00% premium ($20,400), added to the mortgage balance",
            is_correct: true,
            feedback:
              "With 7.27% down (between 5-9.99%), the CMHC premium is 4.00%. On a $510,000 mortgage, that is $20,400, making the insured amount $530,400.",
          },
          {
            id: "c",
            text: "She cannot purchase at this price with only 7.27% down",
            is_correct: false,
            feedback:
              "Minimum down payment: 5% on first $500K + 10% on remainder. Sarah needs $25,000 + $5,000 = $30,000 minimum. Her $40,000 exceeds this.",
          },
          {
            id: "d",
            text: "Insurance only applies to investment properties",
            is_correct: false,
            feedback:
              "Mortgage default insurance is required for all high-ratio mortgages (under 20% down) on owner-occupied properties. CMHC does NOT insure investment properties under 20% down.",
          },
        ],
        points: 20,
        explanation:
          "CMHC insurance tiers: 5-9.99% down = 4.00%, 10-14.99% = 3.10%, 15-19.99% = 2.80%. The premium is added to the mortgage and amortized over the loan's life.",
      },
      {
        title: "Stress Test Qualification",
        description:
          "The lender offers 5.24% fixed. How does the stress test apply?",
        context:
          "The lender has offered a 5-year fixed rate of 5.24%. You need to explain the stress test to Sarah.",
        options: [
          {
            id: "a",
            text: "She qualifies at the 5.24% contract rate as a first-time buyer",
            is_correct: false,
            feedback:
              "First-time buyer status does not exempt anyone from the stress test. All borrowers must qualify at the stress test rate.",
          },
          {
            id: "b",
            text: "She must qualify at the higher of the BoC qualifying rate (5.25%) or contract rate + 2% (7.24%)",
            is_correct: true,
            feedback:
              "The stress test uses the higher of the BoC qualifying rate or contract rate + 2%. Since 7.24% > 5.25%, Sarah must qualify at 7.24%.",
          },
          {
            id: "c",
            text: "The stress test only applies to variable rate mortgages",
            is_correct: false,
            feedback:
              "Since the B-20 guidelines update, the stress test applies to ALL mortgage applications at federally regulated lenders, including fixed rates.",
          },
          {
            id: "d",
            text: "She qualifies at prime rate plus 1%",
            is_correct: false,
            feedback:
              "The qualifying rate is the higher of the BoC rate or contract + 2%. Prime rate is not used in the stress test calculation.",
          },
        ],
        points: 20,
        explanation:
          "The B-20 stress test requires borrowers at federally regulated lenders to qualify at the higher of the BoC qualifying rate or their contract rate + 2%, ensuring they can handle potential rate increases.",
      },
      {
        title: "Debt Service Ratio Analysis",
        description:
          "Assess Sarah's GDS and TDS ratios with the following numbers.",
        context:
          "Monthly gross income: $7,083. Stressed mortgage payment: $3,150. Property tax: $350. Condo fees: $450 (50% = $225 for qualification). Heating: $75. Student loan: $250. Car loan: $350.",
        options: [
          {
            id: "a",
            text: "GDS 33%, TDS 40% -- both within limits, proceed as-is",
            is_correct: false,
            feedback:
              "These numbers don't match the provided data. Always verify: GDS = (3150+350+225+75)/7083 = 53.7%.",
          },
          {
            id: "b",
            text: "GDS 53.7%, TDS 62.2% -- ratios are fine for insured mortgages",
            is_correct: false,
            feedback:
              "The math is correct but the assessment is wrong. Standard CMHC limits are GDS 39% and TDS 44%. These ratios significantly exceed guidelines.",
          },
          {
            id: "c",
            text: "GDS 53.7%, TDS 62.2% -- exceeds 39%/44% guidelines. Recommend reducing price, increasing down payment, or eliminating debts",
            is_correct: true,
            feedback:
              "GDS = (3150+350+225+75)/7083 = 53.7% (exceeds 39%). TDS = (3150+350+225+75+250+350)/7083 = 62.2% (exceeds 44%). Proactive strategies must be discussed.",
          },
          {
            id: "d",
            text: "Ratios don't matter with a credit score above 700",
            is_correct: false,
            feedback:
              "Debt service ratios are a fundamental qualification requirement regardless of credit score. CMHC has firm guidelines of 39% GDS and 44% TDS.",
          },
        ],
        points: 20,
        explanation:
          "GDS = Housing costs / Gross income (max 39%). TDS = (Housing + all debts) / Gross income (max 44%). When ratios exceed limits, explore reducing price, larger down payment, paying off debts, or adding a co-borrower.",
      },
      {
        title: "Product Recommendation",
        description:
          "After adjusting to $475,000, recommend a mortgage product for Sarah.",
        context:
          "Purchase price adjusted to $475,000 to meet ratio guidelines. Sarah has moderate risk tolerance, values stability, and plans to stay at least 5 years.",
        options: [
          {
            id: "a",
            text: "5-year variable rate for the lowest initial payments",
            is_correct: false,
            feedback:
              "Variable rates carry risk. For a first-time buyer with a tight budget and moderate risk tolerance, payment fluctuations could cause financial stress.",
          },
          {
            id: "b",
            text: "5-year fixed rate for payment certainty during her initial homeownership period",
            is_correct: true,
            feedback:
              "A 5-year fixed matches Sarah's profile: moderate risk tolerance, tight budget needing predictable payments, and plans to stay 5+ years.",
          },
          {
            id: "c",
            text: "1-year fixed rate to reassess market conditions soon",
            is_correct: false,
            feedback:
              "A 1-year term creates renewal uncertainty within 12 months. For a first-time buyer planning to stay 5+ years, this adds unnecessary stress and rate risk.",
          },
          {
            id: "d",
            text: "10-year fixed rate for maximum long-term protection",
            is_correct: false,
            feedback:
              "A 10-year fixed comes with a significantly higher rate and steep penalties. Since Sarah plans to stay only 5+ years, a 5-year term better balances protection with flexibility.",
          },
        ],
        points: 20,
        explanation:
          "Product recommendations should align with client risk tolerance, finances, and plans. For first-time buyers with moderate risk tolerance and tight budgets, a 5-year fixed provides the stability needed during early homeownership.",
      },
    ],
  },
  {
    title: "Self-Employed Borrower: Marcus Johnson",
    description:
      "A self-employed contractor purchasing a detached home in Ottawa. Handle income verification, documentation challenges, lender selection, and conditions management.",
    difficulty: 'intermediate',
    category: 'Self-Employed',
    published: true,
    client_profile: {
      name: "Marcus Johnson",
      age: 42,
      employment_type: "Self-Employed",
      employer: "Johnson Contracting Ltd. (Owner)",
      annual_income: 120000,
      credit_score: 680,
      marital_status: "Married",
      dependents: 2,
    },
    property_details: {
      type: "Detached House",
      location: "Ottawa, ON",
      purchase_price: 650000,
      intended_use: "Primary Residence",
    },
    financial_details: {
      down_payment: 130000,
      existing_debts: [
        { type: "Business Line of Credit", balance: 25000, monthly_payment: 400 },
        { type: "Vehicle Lease", balance: 18000, monthly_payment: 550 },
      ],
      assets: [
        { type: "Business Account", value: 85000 },
        { type: "Personal Savings", value: 155000 },
        { type: "RRSP", value: 62000 },
        { type: "TFSA", value: 34000 },
      ],
      monthly_expenses: 3200,
    },
    scenarios: [
      {
        title: "Income Verification Approach",
        description: "How should you verify Marcus's self-employed income?",
        context:
          "Marcus has been self-employed for 7 years running a successful contracting business. He declares $120,000 in annual income but his business writes off significant expenses.",
        options: [
          {
            id: "a",
            text: "Accept his stated income without documentation",
            is_correct: false,
            feedback:
              "Stated income programs are largely unavailable in Canada. All lenders require documentation to verify self-employed income.",
          },
          {
            id: "b",
            text: "Request 2 years of T1 Generals, NOAs, and business financial statements",
            is_correct: true,
            feedback:
              "Standard self-employed documentation includes 2 years of T1 Generals with all schedules, Notices of Assessment, and business financial statements to verify income consistency.",
          },
          {
            id: "c",
            text: "Only need his most recent pay stub",
            is_correct: false,
            feedback:
              "Self-employed individuals don't receive traditional pay stubs. Income verification requires tax returns and business financials.",
          },
          {
            id: "d",
            text: "Use bank statements only, skip tax documents",
            is_correct: false,
            feedback:
              "While bank statements support the application, tax documents (T1 Generals, NOAs) are the primary income verification for self-employed borrowers at A-lenders.",
          },
        ],
        points: 20,
        explanation:
          "Self-employed income verification requires T1 General tax returns (2 years), Notices of Assessment, business financial statements, and often Articles of Incorporation. The declared income on tax returns is typically used for qualification.",
      },
      {
        title: "Income Variance Analysis",
        description:
          "Marcus's declared income dropped 15% last year. How do you handle this?",
        context:
          "Year 1: $140,000 declared. Year 2: $119,000 declared. Marcus explains the drop was due to a slow quarter when a major project was delayed.",
        options: [
          {
            id: "a",
            text: "Use only the higher year's income for qualification",
            is_correct: false,
            feedback:
              "Lenders typically average self-employed income over 2 years or use the lower figure. Cherry-picking the higher year misrepresents the borrower's income.",
          },
          {
            id: "b",
            text: "Average the two years ($129,500) and document the variance with a letter of explanation",
            is_correct: true,
            feedback:
              "Averaging 2 years is standard practice. A letter explaining the variance (delayed project) with supporting evidence strengthens the application and satisfies underwriter questions.",
          },
          {
            id: "c",
            text: "Decline the application due to income instability",
            is_correct: false,
            feedback:
              "A 15% variance with a reasonable explanation is not uncommon for self-employed borrowers. Many lenders accommodate this with proper documentation.",
          },
          {
            id: "d",
            text: "Suggest he amend his tax returns to show higher income",
            is_correct: false,
            feedback:
              "Suggesting a client amend tax returns to inflate income is unethical and potentially illegal. This violates mortgage agent professional standards.",
          },
        ],
        points: 20,
        explanation:
          "For self-employed borrowers, lenders typically average 2 years of income. Income variances should be explained with supporting documentation. A 15% fluctuation with a reasonable explanation is generally acceptable.",
      },
      {
        title: "Lender Selection Strategy",
        description:
          "Which lender category best suits Marcus's profile?",
        context:
          "Marcus has 20% down payment, 680 credit score, 7 years self-employed, averaged income of $129,500, and some income variance between years.",
        options: [
          {
            id: "a",
            text: "Big 5 bank -- they offer the best rates for everyone",
            is_correct: false,
            feedback:
              "While Big 5 banks offer competitive rates, their self-employed underwriting can be rigid. Marcus's income variance and credit score may face more scrutiny.",
          },
          {
            id: "b",
            text: "Monoline lender experienced with self-employed borrowers for flexible underwriting and competitive rates",
            is_correct: true,
            feedback:
              "Monoline lenders often have more flexible underwriting for self-employed borrowers while offering competitive rates. They understand business income nuances better.",
          },
          {
            id: "c",
            text: "Private lender for guaranteed quick approval",
            is_correct: false,
            feedback:
              "Private lending should be a last resort due to significantly higher rates and fees. Marcus's profile is strong enough for an A-lender or monoline.",
          },
          {
            id: "d",
            text: "Only credit unions handle self-employed borrowers",
            is_correct: false,
            feedback:
              "Credit unions are one option but not the only one. Multiple lender types serve self-employed borrowers. Limiting to one category may miss better options.",
          },
        ],
        points: 20,
        explanation:
          "Lender selection for self-employed borrowers should consider underwriting flexibility, experience with business income, and rates. Monoline lenders and some credit unions often provide the best combination for these borrowers.",
      },
      {
        title: "Down Payment Verification",
        description: "Marcus has 20% down ($130,000). What verification is required?",
        context:
          "Marcus's down payment comes from his personal savings and business account. He has more than enough funds but needs to document the source.",
        options: [
          {
            id: "a",
            text: "No verification needed with 20% down",
            is_correct: false,
            feedback:
              "Anti-money laundering regulations require verification of down payment source regardless of the amount. All down payments must be documented.",
          },
          {
            id: "b",
            text: "90-day bank history showing source and accumulation of funds, plus proof funds are not borrowed",
            is_correct: true,
            feedback:
              "Lenders require 90 days of bank statements showing the accumulation and source of down payment funds. For self-employed, business-to-personal transfers must be clearly documented.",
          },
          {
            id: "c",
            text: "Only a current balance statement is sufficient",
            is_correct: false,
            feedback:
              "A current balance alone doesn't prove the source of funds. Lenders need to see the history of how funds accumulated to comply with anti-money laundering rules.",
          },
          {
            id: "d",
            text: "A signed letter from Marcus confirming the funds are his own",
            is_correct: false,
            feedback:
              "A self-declaration is insufficient. Bank statements and transaction history are required documentation to verify the source and legitimacy of down payment funds.",
          },
        ],
        points: 20,
        explanation:
          "Down payment verification requires 90-day bank statements showing fund accumulation and source. For self-employed borrowers, transfers between business and personal accounts must be clearly documented and explained.",
      },
      {
        title: "Conditions Management",
        description:
          "The lender approves with conditions. What's your approach?",
        context:
          "Approval comes with conditions: updated business financials, confirmation of no new debts, property appraisal, and title insurance. The closing date is in 30 days.",
        options: [
          {
            id: "a",
            text: "Send all documents at once right at the deadline",
            is_correct: false,
            feedback:
              "Waiting until the deadline risks missing closing if issues arise. Conditions should be addressed promptly and systematically.",
          },
          {
            id: "b",
            text: "Address conditions promptly and systematically, communicate progress with both lender and client throughout",
            is_correct: true,
            feedback:
              "Proactive conditions management is critical. Address each condition as quickly as possible, keep all parties informed, and escalate any issues early to protect the closing date.",
          },
          {
            id: "c",
            text: "Let Marcus handle the conditions directly with the lender",
            is_correct: false,
            feedback:
              "The mortgage agent should manage conditions on behalf of the client. Letting the client deal directly with the lender can lead to miscommunication and delays.",
          },
          {
            id: "d",
            text: "Only address conditions the lender specifically follows up on",
            is_correct: false,
            feedback:
              "ALL conditions must be satisfied before closing regardless of follow-ups. Ignoring conditions until prompted risks delays and could jeopardize the deal.",
          },
        ],
        points: 20,
        explanation:
          "Effective conditions management means addressing all requirements promptly, maintaining clear communication with lender and client, tracking progress systematically, and escalating potential issues well before deadlines.",
      },
    ],
  },
  {
    title: "Refinancing Strategy: Robert Thompson",
    description:
      "A government employee looking to access home equity for renovations. Compare refinance vs HELOC, calculate penalties, analyze debt consolidation, and recommend terms.",
    difficulty: 'intermediate',
    category: 'Refinancing',
    published: true,
    client_profile: {
      name: "Robert Thompson",
      age: 52,
      employment_type: "Full-time Employee",
      employer: "Government of Canada",
      annual_income: 95000,
      credit_score: 720,
      marital_status: "Married",
      dependents: 1,
    },
    property_details: {
      type: "Detached House",
      location: "Halifax, NS",
      purchase_price: 480000,
      intended_use: "Primary Residence",
    },
    financial_details: {
      down_payment: 0,
      existing_debts: [
        { type: "Existing Mortgage", balance: 280000, monthly_payment: 1650 },
        { type: "Credit Card", balance: 15000, monthly_payment: 450 },
        { type: "Car Loan", balance: 12000, monthly_payment: 380 },
      ],
      assets: [
        { type: "Home Equity", value: 200000 },
        { type: "RRSP", value: 145000 },
        { type: "Pension (estimated)", value: 350000 },
        { type: "Savings", value: 28000 },
      ],
      monthly_expenses: 2800,
    },
    scenarios: [
      {
        title: "Needs Assessment: Equity Access Options",
        description:
          "Robert wants $80,000 for renovations. What do you assess first?",
        context:
          "Robert wants to renovate his kitchen and bathrooms ($80,000 estimated). He is 3 years into a 5-year fixed mortgage at 3.50%. His home is worth $480,000 with $280,000 owing.",
        options: [
          {
            id: "a",
            text: "Recommend a cash-out refinance immediately",
            is_correct: false,
            feedback:
              "Jumping to a single solution without comparing options may not serve the client's best interest. Multiple equity access products should be evaluated.",
          },
          {
            id: "b",
            text: "Compare refinance, HELOC, and second mortgage options based on Robert's specific needs and costs",
            is_correct: true,
            feedback:
              "Evaluating multiple options (refinance, HELOC, second mortgage) allows you to recommend the best product based on total cost, flexibility, and Robert's specific situation.",
          },
          {
            id: "c",
            text: "Suggest a personal loan instead of using home equity",
            is_correct: false,
            feedback:
              "Personal loans carry significantly higher interest rates than secured home equity products. For $80,000, the interest savings with a secured product are substantial.",
          },
          {
            id: "d",
            text: "Advise him to use his RRSP savings for the renovations",
            is_correct: false,
            feedback:
              "Using RRSP funds triggers tax consequences and reduces retirement savings. At 52, preserving retirement assets is important. Home equity is a more appropriate funding source.",
          },
        ],
        points: 20,
        explanation:
          "When clients need equity access, always compare available products: refinance (new mortgage replacing existing), HELOC (revolving credit), and second mortgage (additional loan). Each has different costs, flexibility, and implications.",
      },
      {
        title: "Prepayment Penalty Assessment",
        description:
          "Robert is 3 years into a 5-year fixed at 3.50%. What penalty applies?",
        context:
          "Robert's current mortgage: $280,000 balance, 5-year fixed at 3.50%, 3 years completed. Current posted rate for a 2-year fixed is 4.50%. He wants to understand the cost of breaking his mortgage.",
        options: [
          {
            id: "a",
            text: "There is no penalty for refinancing a mortgage",
            is_correct: false,
            feedback:
              "Fixed-rate mortgages in Canada have prepayment penalties when broken before term. This is one of the most important costs to calculate and disclose.",
          },
          {
            id: "b",
            text: "Calculate the IRD penalty (difference between contract and current rate x remaining term x balance) and compare to 3-months' interest -- the higher amount applies",
            is_correct: true,
            feedback:
              "For fixed-rate mortgages, the penalty is the GREATER of 3-months' interest or the Interest Rate Differential (IRD). IRD often results in a much higher penalty, which must be clearly disclosed to the client.",
          },
          {
            id: "c",
            text: "The penalty is always exactly 3 months' interest",
            is_correct: false,
            feedback:
              "Three months' interest is the penalty for variable-rate mortgages. Fixed-rate mortgages use the greater of 3-months' interest OR the IRD, which is often significantly higher.",
          },
          {
            id: "d",
            text: "Penalties only apply to variable rate mortgages",
            is_correct: false,
            feedback:
              "Both fixed and variable mortgages have prepayment penalties. Fixed-rate penalties (IRD) are typically much more expensive than variable-rate penalties (3-months' interest).",
          },
        ],
        points: 20,
        explanation:
          "Fixed-rate prepayment penalties: the GREATER of 3-months' interest or the IRD. IRD = (contract rate - current comparable posted rate) x remaining term x balance. This can amount to thousands of dollars and must factor into the refinance cost-benefit analysis.",
      },
      {
        title: "LTV and Refinance Eligibility",
        description:
          "Home worth $480K, owing $280K, wants $80K. Assess the refinanced LTV.",
        context:
          "Robert needs a total mortgage of $360,000 ($280K existing + $80K new) against a home valued at $480,000. Refinancing in Canada has an 80% LTV maximum.",
        options: [
          {
            id: "a",
            text: "LTV is 58% (existing mortgage only) -- easily qualifies",
            is_correct: false,
            feedback:
              "The LTV must account for the TOTAL new mortgage amount including the equity takeout, not just the existing balance.",
          },
          {
            id: "b",
            text: "LTV is 75% ($360K/$480K) -- within the 80% refinance maximum, eligible to proceed",
            is_correct: true,
            feedback:
              "Total new mortgage of $360,000 / home value of $480,000 = 75% LTV. This is within the maximum 80% LTV for refinancing in Canada, leaving room for the transaction.",
          },
          {
            id: "c",
            text: "LTV is 83% -- exceeds the refinance limit, cannot proceed",
            is_correct: false,
            feedback:
              "This calculation is incorrect. $360K / $480K = 75%, not 83%. Always verify your LTV calculations carefully.",
          },
          {
            id: "d",
            text: "LTV limits don't apply to refinancing existing mortgages",
            is_correct: false,
            feedback:
              "LTV limits absolutely apply to refinancing. In Canada, the maximum LTV for a refinance is 80% of the property's appraised value.",
          },
        ],
        points: 20,
        explanation:
          "Refinance LTV maximum in Canada is 80%. Calculate: (total new mortgage amount) / (appraised property value). Robert's 75% LTV is within limits and leaves a 5% buffer for closing costs and fees.",
      },
      {
        title: "Debt Consolidation Opportunity",
        description:
          "Robert also has $15K in credit card debt at 19.99% and a $12K car loan. What do you advise?",
        context:
          "Beyond the renovation funds, Robert carries high-interest consumer debt. The LTV at 75% leaves room to include additional amounts in the refinance.",
        options: [
          {
            id: "a",
            text: "Ignore consumer debts -- focus only on the renovation funding",
            is_correct: false,
            feedback:
              "Overlooking a debt consolidation opportunity means missing a chance to save the client significant interest costs and improve their cash flow.",
          },
          {
            id: "b",
            text: "Include the credit card and car loan in the refinance to reduce total interest cost, with a plan to avoid re-accumulating consumer debt",
            is_correct: true,
            feedback:
              "Consolidating $27K of high-interest debt into the mortgage saves substantial interest. The key is coupling this with a plan to prevent re-accumulation of consumer debt.",
          },
          {
            id: "c",
            text: "Suggest bankruptcy to clear the consumer debts",
            is_correct: false,
            feedback:
              "Bankruptcy is an extreme measure completely disproportionate to $27K in manageable consumer debt. This would severely damage Robert's credit and finances.",
          },
          {
            id: "d",
            text: "Recommend a separate debt consolidation loan at a different institution",
            is_correct: false,
            feedback:
              "A separate consolidation loan adds complexity and likely higher rates than folding the debt into the mortgage refinance at a much lower secured rate.",
          },
        ],
        points: 20,
        explanation:
          "Debt consolidation through refinancing can save significant interest (from 19.99% credit card to ~5% mortgage rate). However, always discuss the risks of converting unsecured debt to secured debt and create a plan to prevent re-accumulation.",
      },
      {
        title: "Term Recommendation",
        description:
          "What term best suits Robert's refinancing goals and life situation?",
        context:
          "Robert is 52, plans to retire at 60, and wants predictable payments. The total refinanced mortgage will be approximately $387,000 ($280K + $80K reno + $27K consolidation). He values stability as a government employee.",
        options: [
          {
            id: "a",
            text: "Shortest term possible to minimize total interest cost",
            is_correct: false,
            feedback:
              "While minimizing interest is important, the shortest term may result in payments that strain Robert's budget. Cash flow management matters, especially approaching retirement.",
          },
          {
            id: "b",
            text: "5-year fixed with a 20-year amortization to align mortgage payoff closer to retirement at 60",
            is_correct: true,
            feedback:
              "A 5-year fixed provides stability Robert values, and a 20-year amortization targets mortgage-free status around his retirement age. This balances cost, cash flow, and retirement planning.",
          },
          {
            id: "c",
            text: "30-year amortization to minimize monthly payments",
            is_correct: false,
            feedback:
              "A 30-year amortization would extend the mortgage to age 82. At 52 and planning retirement at 60, carrying a mortgage deep into retirement is not ideal financial planning.",
          },
          {
            id: "d",
            text: "Variable rate for maximum flexibility and lowest payments",
            is_correct: false,
            feedback:
              "Robert explicitly values stability as a government employee approaching retirement. Variable rate introduces payment uncertainty that conflicts with his stated preferences and life stage.",
          },
        ],
        points: 20,
        explanation:
          "Term recommendations for clients approaching retirement should consider payoff timing relative to retirement date. A 5-year fixed with 20-year amortization helps Robert target mortgage freedom by age 60-62, aligning with his retirement planning.",
      },
    ],
  },
  {
    title: "Investment Property: David & Lisa Park",
    description:
      "A dual-income couple purchasing a duplex in Vancouver as a rental investment. Navigate down payment rules, rental income qualification, cash flow analysis, and tax considerations.",
    difficulty: 'advanced',
    category: 'Investment Property',
    published: true,
    client_profile: {
      name: "David & Lisa Park",
      age: 38,
      employment_type: "Full-time Employees",
      employer: "David: BC Health Authority / Lisa: Park & Associates Law",
      annual_income: 185000,
      credit_score: 780,
      marital_status: "Married",
      dependents: 1,
    },
    property_details: {
      type: "Duplex (Up/Down)",
      location: "Vancouver, BC",
      purchase_price: 950000,
      intended_use: "Investment / Rental",
    },
    financial_details: {
      down_payment: 190000,
      existing_debts: [
        { type: "Primary Residence Mortgage", balance: 420000, monthly_payment: 2200 },
        { type: "Vehicle Loan", balance: 22000, monthly_payment: 480 },
      ],
      assets: [
        { type: "Primary Home Equity", value: 280000 },
        { type: "Investment Accounts", value: 165000 },
        { type: "Savings", value: 210000 },
        { type: "RRSP (combined)", value: 120000 },
      ],
      monthly_expenses: 4500,
    },
    scenarios: [
      {
        title: "Down Payment Requirements",
        description:
          "What is the minimum down payment for this investment duplex?",
        context:
          "David and Lisa want to purchase a $950,000 duplex in Vancouver that they will NOT occupy -- it is purely a rental investment property.",
        options: [
          {
            id: "a",
            text: "5% down payment, same as a primary residence",
            is_correct: false,
            feedback:
              "The 5% minimum only applies to owner-occupied primary residences. Investment properties have different and higher down payment requirements.",
          },
          {
            id: "b",
            text: "20% minimum ($190,000) for a non-owner-occupied rental property",
            is_correct: true,
            feedback:
              "Non-owner-occupied investment properties require a minimum 20% down payment. CMHC mortgage default insurance is not available for investment properties, so conventional financing at 20%+ is required.",
          },
          {
            id: "c",
            text: "10% with CMHC insurance available for rental properties",
            is_correct: false,
            feedback:
              "CMHC does not provide mortgage default insurance for non-owner-occupied investment properties. The minimum 20% conventional down payment is required.",
          },
          {
            id: "d",
            text: "25% minimum for all multi-unit investment properties",
            is_correct: false,
            feedback:
              "While some lenders may require 25% for certain property types, the regulatory minimum for 1-2 unit residential investment properties is 20%.",
          },
        ],
        points: 20,
        explanation:
          "Non-owner-occupied investment properties require minimum 20% down payment. CMHC insurance is unavailable for these properties. Some lenders may require 25% for multi-unit or higher-risk scenarios.",
      },
      {
        title: "Rental Income Qualification",
        description:
          "How should the expected $4,800/month rental income be used for qualification?",
        context:
          "Market analysis shows both units of the duplex can generate approximately $2,400 each ($4,800 total monthly). David and Lisa need this income to qualify for the investment mortgage.",
        options: [
          {
            id: "a",
            text: "Add 100% of the $4,800 rental income to their qualifying income",
            is_correct: false,
            feedback:
              "Lenders never use 100% of gross rental income. Vacancy and operating costs must be factored in through a rental offset or add-back calculation.",
          },
          {
            id: "b",
            text: "Use 50% of gross rental income as an offset to the property's carrying costs, per standard lender guidelines",
            is_correct: true,
            feedback:
              "Most Canadian lenders use a rental offset of 50% of gross rents to account for vacancy, maintenance, and operating costs. Some lenders use up to 80% with strong rental history documentation.",
          },
          {
            id: "c",
            text: "Rental income cannot be used for mortgage qualification purposes",
            is_correct: false,
            feedback:
              "Rental income is a key factor in investment property qualification. Lenders have established methods (rental offset or add-back) for incorporating it into debt service calculations.",
          },
          {
            id: "d",
            text: "Only count rental income if they have 5+ years of landlord experience",
            is_correct: false,
            feedback:
              "Landlord experience is not a prerequisite for using rental income in qualification. However, an appraisal with rental market analysis is typically required.",
          },
        ],
        points: 20,
        explanation:
          "Canadian lenders typically use 50-80% of gross rental income for qualification, depending on the lender and documentation. A 50% offset is the most conservative and common approach, accounting for vacancy, maintenance, and operating costs.",
      },
      {
        title: "Cash Flow Analysis",
        description:
          "Monthly costs total $5,100 against $4,800 gross rent. Advise the Parks on this negative cash flow.",
        context:
          "Estimated monthly costs: Mortgage $3,800, property tax $550, insurance $200, maintenance reserve $300, vacancy reserve $250. Total: $5,100. Gross rent: $4,800. Net monthly: -$300.",
        options: [
          {
            id: "a",
            text: "Do not proceed -- negative cash flow means it is a bad investment",
            is_correct: false,
            feedback:
              "Negative cash flow alone doesn't make an investment bad. Total return includes equity buildup, appreciation, and tax benefits that may far exceed the monthly shortfall.",
          },
          {
            id: "b",
            text: "Analyze total return: equity buildup, appreciation potential, tax benefits, and net cash position to determine if -$300/month is acceptable",
            is_correct: true,
            feedback:
              "A holistic analysis shows: ~$1,400/month in principal paydown (equity buildup), potential appreciation in Vancouver market, and tax-deductible expenses. The -$300 monthly shortfall may be well justified by total return.",
          },
          {
            id: "c",
            text: "Raise rents immediately to $5,500 to achieve positive cash flow",
            is_correct: false,
            feedback:
              "Rents are market-driven and cannot be arbitrarily set above market rates. Overpricing leads to vacancy, which is worse than a small negative cash flow.",
          },
          {
            id: "d",
            text: "Extend amortization to 35 years to reduce monthly mortgage payment",
            is_correct: false,
            feedback:
              "Maximum amortization for uninsured mortgages in Canada is 25 years (30 years with some lenders). 35 years is not available for investment properties.",
          },
        ],
        points: 20,
        explanation:
          "Investment property analysis must look beyond monthly cash flow. Total return = cash flow + principal paydown + appreciation + tax benefits. A small negative cash flow can be acceptable when total return is strong and the investor has the income to absorb it.",
      },
      {
        title: "Multi-Property Debt Service",
        description:
          "How does their existing primary residence mortgage affect this application?",
        context:
          "The Parks already carry a $420,000 mortgage ($2,200/month) on their primary residence. Combined income is $185,000/year ($15,417/month gross). They now want to add the investment property debt.",
        options: [
          {
            id: "a",
            text: "The existing mortgage doesn't affect the investment property application",
            is_correct: false,
            feedback:
              "All existing debts, including the primary residence mortgage, factor into TDS calculations for the new property. Ignoring existing obligations misrepresents the borrower's capacity.",
          },
          {
            id: "b",
            text: "Calculate combined TDS including both properties plus all debts, ensuring it stays within lender guidelines",
            is_correct: true,
            feedback:
              "Total TDS must include: primary residence costs, investment property costs (offset by rental income), vehicle loan, and any other debts. Most lenders cap TDS at 44% for investment properties.",
          },
          {
            id: "c",
            text: "Advise them to pay off their primary residence first before buying investment property",
            is_correct: false,
            feedback:
              "Paying off a low-rate mortgage before investing may not be optimal. If they qualify under debt service guidelines, carrying both properties can build wealth faster through leverage.",
          },
          {
            id: "d",
            text: "Apply at a different lender to keep the mortgages separate and avoid combined TDS review",
            is_correct: false,
            feedback:
              "All lenders review the borrower's complete credit bureau which shows all debts. Using a different lender does not hide existing obligations.",
          },
        ],
        points: 20,
        explanation:
          "Multi-property debt service analysis requires calculating combined TDS across all properties and debts. The rental offset helps reduce the investment property's impact on ratios, but the primary residence mortgage must be included.",
      },
      {
        title: "Tax and Professional Referral",
        description:
          "What tax-related guidance should you provide to David and Lisa?",
        context:
          "David and Lisa ask about the tax implications of owning a rental property, including deductible expenses, rental income reporting, and capital gains.",
        options: [
          {
            id: "a",
            text: "Provide detailed tax advice on all deductions and capital gains calculations",
            is_correct: false,
            feedback:
              "Mortgage agents are not licensed to provide specific tax advice. Overstepping professional boundaries exposes both you and the client to risk.",
          },
          {
            id: "b",
            text: "Recommend consulting a tax professional, noting that mortgage interest, property taxes, insurance, and maintenance may be deductible for rental properties",
            is_correct: true,
            feedback:
              "Providing general awareness of potential deductions while referring to a qualified tax professional is the appropriate approach. It shows knowledge without overstepping your professional scope.",
          },
          {
            id: "c",
            text: "Tell them all expenses are 100% deductible against rental income",
            is_correct: false,
            feedback:
              "This oversimplification is incorrect. Not all expenses are fully deductible, and the rules around capital expenses, personal use, and other factors require professional tax advice.",
          },
          {
            id: "d",
            text: "Tax considerations are irrelevant to the mortgage process",
            is_correct: false,
            feedback:
              "While mortgage agents don't provide tax advice, understanding that tax implications affect the client's total return and decision-making is important for a complete advisory relationship.",
          },
        ],
        points: 20,
        explanation:
          "Mortgage agents should have general awareness of rental property tax implications but must refer clients to qualified tax professionals for specific advice. Key deductible areas include mortgage interest, property taxes, insurance, maintenance, and management fees.",
      },
    ],
  },
];
