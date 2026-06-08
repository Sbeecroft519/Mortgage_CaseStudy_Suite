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

import type { Scenario } from '../../../../types';
import type { GeneratedContext } from '../../types';
import type { ScenarioVariant } from '../builder';
import { selectAndBuild, fmt, pct } from '../builder';
import { pick, randInt } from '../../random';
import { GDS_LIMIT, TDS_LIMIT } from '../../mortgage-math';

export function generateCreditChallengeScenarios(ctx: GeneratedContext, rng: () => number): Scenario[] {
  const { client, property, financials, computed } = ctx;
  const c = computed;

  const creditIssues = [
    'a consumer proposal that was completed 18 months ago',
    'two missed credit card payments in the past year',
    'a collections account from an unpaid phone bill',
    'a history of high credit utilization above 80%',
    'a vehicle loan that went to collections 2 years ago',
  ];
  const creditIssue = pick(rng, creditIssues);

  const bLenderRate = randInt(rng, 6, 8) + randInt(rng, 0, 99) / 100;
  const privateLenderRate = randInt(rng, 8, 12) + randInt(rng, 0, 99) / 100;

  const gdsExceeds = c.gdsPercent > GDS_LIMIT;
  const tdsExceeds = c.tdsPercent > TDS_LIMIT;
  const debtList = financials.existing_debts.map((d) => `${d.type}: ${fmt(d.monthly_payment)}/month`).join(', ');
  const timeToRepair = client.credit_score < 580 ? '18-24 months' : '6-12 months';

  const factories: (() => ScenarioVariant)[] = [
    () => ({
      title: 'Credit Score Assessment',
      description: `${client.name} has a ${client.credit_score} credit score with ${creditIssue}. How do you assess their situation?`,
      context: `${client.name} is a ${client.age}-year-old ${client.employment_type.toLowerCase()} earning ${fmt(client.annual_income)} annually. Their credit score is ${client.credit_score} due to ${creditIssue}. They want to purchase a ${property.type.toLowerCase()} at ${fmt(property.purchase_price)}.`,
      correct: {
        text: 'Obtain the full credit bureau, identify all derogatory items, assess timelines for improvement, and determine which lender tier is appropriate',
        feedback: 'A thorough credit assessment reviews the full bureau report, identifies specific issues, evaluates time since last derogatory event, and matches the client to the appropriate lender tier (A, B, or private).',
      },
      wrongs: [
        { text: 'A score of ' + client.credit_score + ' means automatic decline at all lenders', feedback: `While ${client.credit_score} is below prime A-lender thresholds (typically 680+), B-lenders and alternative lenders specialize in credit-challenged borrowers. Many successful mortgages are funded below this score.` },
        { text: 'Tell the client to wait 7 years until all negative items fall off their report', feedback: 'While negative items do age off credit reports, many can be addressed sooner through targeted credit repair strategies. Waiting 7 years ignores proactive solutions.' },
        { text: 'The credit score is the only factor lenders consider', feedback: 'Lenders look beyond the score to the full credit history: payment patterns, time since derogatory events, types of credit, utilization, and the story behind the numbers.' },
        { text: 'Refer them to a credit repair company before discussing mortgage options', feedback: 'While credit repair may be part of the plan, a mortgage agent should first assess the full picture. Many clients can qualify at B-lenders without waiting for credit repair.' },
        { text: 'Focus only on the credit score number, not the underlying credit events', feedback: 'The credit score is a summary. Understanding the specific derogatory items, their age, and circumstances is essential for proper lender matching and application strategy.' },
      ],
      points: 20,
      explanation: 'Credit assessment for challenged borrowers requires analyzing the full credit bureau, not just the score. Understanding specific issues, timelines, and patterns determines the best lending approach.',
      sources: [
        { title: 'Equifax Canada -- Understanding Your Credit Score', url: 'https://www.consumer.equifax.ca/personal/education/credit-score/how-to-improve-credit-score/' },
        { title: 'Government of Canada -- Understanding Your Credit Report and Score', url: 'https://www.canada.ca/en/financial-consumer-agency/services/credit-reports-score/understanding-credit-report.html' },
      ],
    }),

    () => ({
      title: 'Alternative Lender Options',
      description: `With a ${client.credit_score} score, which lending channel is most appropriate?`,
      context: `${client.name}'s credit history shows ${creditIssue}. They have ${pct(c.downPaymentPercent, 0)} down payment (${fmt(financials.down_payment)}), verifiable income of ${fmt(client.annual_income)}, and the desire to move forward now rather than wait.`,
      correct: {
        text: `B-lender with rates around ${pct(bLenderRate)} -- more flexible credit criteria while still offering reasonable terms and a path back to A-lending`,
        feedback: `B-lenders specialize in near-prime borrowers. At approximately ${pct(bLenderRate)}, the rate premium over A-lenders is the cost of the credit history. A 1-2 year term allows rebuilding credit for future A-lender refinancing.`,
      },
      wrongs: [
        { text: 'Only submit to A-lenders for the best rate', feedback: `With a ${client.credit_score} score and ${creditIssue}, A-lender approval is unlikely. Multiple declines create unnecessary credit inquiries that further impact the score.` },
        { text: `Go directly to a private lender at ${pct(privateLenderRate)} for guaranteed approval`, feedback: `Private lending at ${pct(privateLenderRate)} should be a last resort. ${client.name}'s profile with verifiable income and reasonable down payment qualifies for B-lender consideration at significantly lower rates.` },
        { text: 'Credit-challenged borrowers cannot obtain mortgages in Canada', feedback: 'Canada has a robust alternative lending market specifically serving credit-challenged borrowers. B-lenders, credit unions, and private lenders provide solutions across the credit spectrum.' },
        { text: 'Submit to multiple lenders simultaneously to maximize approval chances', feedback: 'Shotgun submissions generate multiple credit inquiries, further damaging the already challenged credit score. A targeted submission to the most appropriate lender tier is the professional approach.' },
        { text: 'Recommend a credit union as they do not check credit scores', feedback: 'Credit unions absolutely check credit scores and review credit history. While some may have more flexible criteria than major banks, they are not a way to bypass credit assessment.' },
      ],
      points: 20,
      explanation: 'Alternative lending in Canada follows a tiered approach: A-lenders (prime), B-lenders (near-prime/alt-A), and private lenders (last resort). Matching the borrower to the right tier optimizes terms while ensuring approval.',
      sources: [
        { title: 'FSRA -- Alternative Lending Guidance', url: 'https://www.fsrao.ca/industry/mortgage-brokering/regulatory-framework/guidance/alternative-lending' },
        { title: 'Government of Canada -- Mortgages: What You Need to Know', url: 'https://www.canada.ca/en/financial-consumer-agency/services/mortgages.html' },
      ],
    }),

    () => ({
      title: 'Documentation Strategy',
      description: `What documentation approach strengthens ${client.name}'s application at the chosen lender?`,
      context: `You are preparing ${client.name}'s application for a B-lender. They have ${creditIssue} but can demonstrate stable income and a clear explanation for the credit issues.`,
      correct: {
        text: 'Prepare a detailed letter of explanation for credit events, compile 12 months of clean payment history on current accounts, and include all standard income/asset documentation',
        feedback: 'B-lenders value context. A letter explaining the circumstances, combined with evidence of recent responsible credit behavior, significantly strengthens the application and can improve terms offered.',
      },
      wrongs: [
        { text: 'Submit only the minimum required documents and hope for the best', feedback: 'With a credit-challenged file, less documentation means more questions from underwriters. Proactively providing context and supporting documents increases approval chances.' },
        { text: 'Dispute all negative items on the credit bureau before applying', feedback: 'Disputing legitimate items is unethical and may delay the application. Legitimate disputes are appropriate, but blanket disputes of valid items can backfire with lenders.' },
        { text: 'Omit the credit explanation and focus only on income strength', feedback: 'Underwriters will ask about derogatory credit items regardless. Proactively addressing the issues shows transparency and allows you to control the narrative rather than leaving it to interpretation.' },
        { text: 'Have the client write a brief note saying "life was hard" as the explanation', feedback: 'Vague explanations do not satisfy underwriter requirements. The letter must detail specific circumstances, timelines, resolution steps taken, and evidence of current financial stability.' },
        { text: 'Wait until the underwriter asks for additional documents before providing them', feedback: 'Reactive documentation slows the process and may result in less favorable terms. Proactively submitting a complete package demonstrates organization and transparency.' },
      ],
      points: 20,
      explanation: 'For credit-challenged applications, documentation strategy is critical. A well-crafted letter of explanation, evidence of recent positive credit behavior, and comprehensive income documentation create the strongest possible file.',
      sources: [
        { title: 'FSRA -- Mortgage Brokering Standards of Practice', url: 'https://www.fsrao.ca/industry/mortgage-brokering/regulatory-framework/mortgage-brokering-standards-practice' },
        { title: 'Government of Canada -- Credit Report and Score', url: 'https://www.canada.ca/en/financial-consumer-agency/services/credit-reports-score.html' },
      ],
    }),

    () => ({
      title: 'Debt Service Analysis with Existing Debt',
      description: `${client.name}'s existing debts impact qualification. How should you address this?`,
      context: `Monthly gross income: ${fmt(Math.round(c.monthlyGrossIncome))}. Existing debts: ${debtList}. GDS: ${pct(c.gdsPercent, 1)}. TDS: ${pct(c.tdsPercent, 1)}. Standard limits: ${GDS_LIMIT}%/${TDS_LIMIT}%.`,
      correct: gdsExceeds || tdsExceeds
        ? {
            text: `Identify debts to pay off or consolidate before application. Paying off the smallest debts first can quickly reduce TDS from ${pct(c.tdsPercent, 1)} toward the ${TDS_LIMIT}% target`,
            feedback: `With TDS at ${pct(c.tdsPercent, 1)} exceeding the ${TDS_LIMIT}% guideline, strategic debt reduction is essential. Even B-lenders have TDS limits (typically 50%). Eliminating smaller debts provides the quickest ratio improvement.`,
          }
        : {
            text: `TDS at ${pct(c.tdsPercent, 1)} is within guidelines. Focus documentation on stable debt management history to strengthen the credit narrative`,
            feedback: `Although ${client.name} has credit challenges, their debt service ratios are manageable. Demonstrating consistent debt payments supports the narrative of financial recovery.`,
          },
      wrongs: [
        { text: 'Debt levels are irrelevant for B-lender applications', feedback: `B-lenders still have debt service requirements, typically GDS up to 45% and TDS up to 50%. Current ratios must be assessed against these guidelines.` },
        { text: 'Recommend taking on a new consolidation loan to simplify payments', feedback: 'Adding new debt before a mortgage application is counterproductive. It adds a credit inquiry, reduces borrowing capacity, and does not improve debt service ratios.' },
        { text: `Suggest filing for a consumer proposal to eliminate the debts`, feedback: `A consumer proposal would severely damage ${client.name}'s credit further and create a 3-year waiting period for most lenders. This is disproportionate to the current debt levels.` },
        { text: 'Omit some debts from the application to improve the ratios', feedback: 'All debts appearing on the credit bureau must be disclosed. Omitting debts is fraud and will be discovered during the lender\'s credit review.' },
        { text: 'Debt service ratios only apply to A-lender applications', feedback: 'All lender tiers have debt service guidelines. B-lenders may allow higher ratios (GDS 45%, TDS 50%) but they still have limits that must be met.' },
      ],
      points: 20,
      explanation: `Debt management is critical for credit-challenged borrowers. Strategic debt reduction, rather than adding new obligations, is the most effective path to improving qualification ratios and demonstrating financial responsibility.`,
      sources: [
        { title: 'CMHC -- Calculating GDS and TDS Ratios', url: 'https://www.cmhc-schl.gc.ca/professionals/project-funding-and-mortgage-financing/mortgage-loan-insurance/calculating-gds-tds' },
        { title: 'Government of Canada -- Managing Debt', url: 'https://www.canada.ca/en/financial-consumer-agency/services/debt/manage-debt.html' },
      ],
    }),

    () => ({
      title: 'Credit Repair Path',
      description: `What credit improvement strategy should ${client.name} follow alongside or before the mortgage process?`,
      context: `${client.name}'s score of ${client.credit_score} limits their options. Even with B-lender approval, a higher score at renewal could save thousands in interest over the mortgage life.`,
      correct: {
        text: `Build a credit repair plan: reduce utilization below 30%, make all payments on time for ${timeToRepair}, maintain 2-3 active trade lines, and set a target score of 680+ for A-lender refinancing`,
        feedback: `A structured credit repair plan with specific targets enables ${client.name} to refinance from a B-lender to an A-lender at the first renewal, potentially saving 2-3% on their rate.`,
      },
      wrongs: [
        { text: 'Close all credit cards to prevent future problems', feedback: 'Closing credit cards reduces available credit and can increase utilization ratios, further damaging the score. Maintaining accounts with low utilization builds positive history.' },
        { text: 'Open many new credit accounts to build a thicker file quickly', feedback: 'Multiple new applications generate hard inquiries and reduce average account age, both of which lower the score. A targeted approach with 2-3 well-managed trade lines is more effective.' },
        { text: 'Credit repair is not possible -- the score is permanent', feedback: 'Credit scores are dynamic and can improve significantly with consistent positive behavior. Most negative items diminish in impact over 2-3 years and fall off after 6-7 years.' },
        { text: 'Pay only the minimum on all debts to preserve cash reserves', feedback: 'Paying only minimums extends debt repayment and keeps utilization high. Targeting one debt at a time for accelerated payoff reduces utilization and demonstrates responsible behavior.' },
        { text: 'Avoid using credit cards entirely to prevent any negative activity', feedback: 'Lenders want to see active, responsible credit use. Zero activity on trade lines does not build the positive payment history needed to improve the credit score.' },
      ],
      points: 20,
      explanation: 'Credit repair is a structured process: maintain low utilization (under 30%), make all payments on time, keep 2-3 active trade lines, and avoid unnecessary new inquiries. Most clients can reach A-lender territory within 12-24 months.',
      sources: [
        { title: 'Equifax Canada -- How to Improve Your Credit Score', url: 'https://www.consumer.equifax.ca/personal/education/credit-score/how-to-improve-credit-score/' },
        { title: 'Government of Canada -- Improving Your Credit Score', url: 'https://www.canada.ca/en/financial-consumer-agency/services/credit-reports-score/improve-credit-score.html' },
      ],
    }),

    () => ({
      title: 'B-Lender Mortgage Term Strategy',
      description: `What term should ${client.name} choose with a B-lender?`,
      context: `${client.name} has been approved at a B-lender at ${pct(bLenderRate)}. They need to choose a mortgage term. Their credit score is ${client.credit_score} and the goal is to eventually move to an A-lender.`,
      correct: {
        text: '1-2 year term to allow the shortest path to refinancing at an A-lender once credit improves, minimizing total time at the higher B-lender rate',
        feedback: `A short 1-2 year term at ${pct(bLenderRate)} limits the duration of the rate premium. With a structured credit repair plan, ${client.name} can target A-lender refinancing at renewal, potentially saving 2-3% on their rate.`,
      },
      wrongs: [
        { text: '5-year fixed for maximum rate stability', feedback: `Locking in at ${pct(bLenderRate)} for 5 years means paying the premium rate for the entire term. A shorter term allows refinancing to a lower A-lender rate once credit improves.` },
        { text: 'Variable rate for the lowest possible payments', feedback: 'B-lender variable rates still carry significant premiums. A short fixed term provides payment certainty while working toward A-lender qualification.' },
        { text: 'The longest term available to avoid having to requalify', feedback: 'Requalifying at renewal is actually the goal: once credit improves, requalifying at an A-lender results in significantly lower rates and long-term savings.' },
        { text: 'Term length does not matter at a B-lender', feedback: 'Term length significantly impacts total interest paid and the timeline for moving to better rates. A strategic term choice aligned with credit improvement goals is essential.' },
        { text: '3-year term as a balanced approach', feedback: 'While 3 years is not the worst choice, it extends the B-lender rate period unnecessarily. With focused credit repair, 1-2 years is typically sufficient to qualify for A-lender refinancing.' },
      ],
      points: 20,
      explanation: 'B-lender mortgage terms should be strategic: choose the shortest term that allows adequate time for credit improvement, minimizing total interest paid at the premium rate before refinancing to an A-lender.',
      sources: [
        { title: 'Government of Canada -- Choosing a Mortgage', url: 'https://www.canada.ca/en/financial-consumer-agency/services/mortgages/choosing-mortgage.html' },
        { title: 'FSRA -- Mortgage Brokering Standards of Practice', url: 'https://www.fsrao.ca/industry/mortgage-brokering/regulatory-framework/mortgage-brokering-standards-practice' },
      ],
    }),

    () => ({
      title: 'Lender Fee Disclosure',
      description: `What fees should you disclose to ${client.name} for B-lender and alternative mortgage products?`,
      context: `The B-lender has approved ${client.name} but the commitment includes a lender fee of 1% of the mortgage amount plus a broker fee. ${client.name} asks why these fees apply when A-lenders typically have no such charges.`,
      correct: {
        text: 'Disclose all fees transparently: lender fee, broker fee, legal costs, and appraisal. Explain that alternative lenders charge fees to offset the higher risk, and compare total cost against the benefits of proceeding now',
        feedback: 'Full fee disclosure is a regulatory requirement. Explaining the cost-benefit helps the client make an informed decision: the fees are the cost of proceeding despite credit challenges, versus waiting and potentially missing opportunities.',
      },
      wrongs: [
        { text: 'Minimize the fee discussion to avoid scaring the client', feedback: 'Full disclosure of all fees is a legal and ethical requirement. Minimizing fees can lead to surprise costs at closing and potential regulatory complaints.' },
        { text: 'B-lenders never charge lender fees -- this must be an error', feedback: 'Many B-lenders and alternative lenders charge fees (typically 0.5-2% of the mortgage). This is standard practice for higher-risk lending and must be disclosed upfront.' },
        { text: 'The fees can be hidden by adding them to the mortgage amount', feedback: 'While fees may be added to the mortgage, they must still be clearly disclosed to the client. "Hiding" fees is a violation of mortgage brokering standards.' },
        { text: 'Advise the client to negotiate the fees down to zero', feedback: 'While some fee negotiation is possible, B-lender fees reflect risk pricing. Expecting zero fees for a credit-challenged borrower is unrealistic and may jeopardize the approval.' },
        { text: 'Only the lender fee needs disclosure -- broker fees are private', feedback: 'All fees, including broker compensation, must be disclosed to the borrower. Failure to disclose broker fees violates FSRA requirements and is grounds for regulatory action.' },
      ],
      points: 20,
      explanation: 'Fee disclosure is mandatory for all mortgage transactions. B-lender and alternative mortgage fees must be clearly explained, and the total cost compared against the alternative of waiting or not proceeding.',
      sources: [
        { title: 'FSRA -- Mortgage Brokering Fee Disclosure', url: 'https://www.fsrao.ca/industry/mortgage-brokering/regulatory-framework/mortgage-brokering-standards-practice' },
        { title: 'Government of Canada -- Mortgage Fees', url: 'https://www.canada.ca/en/financial-consumer-agency/services/mortgages.html' },
      ],
    }),

    () => ({
      title: 'Gifted Down Payment with Credit Issues',
      description: `${client.name}'s parents want to gift the down payment. How does this interact with their credit situation?`,
      context: `${client.name}'s down payment of ${fmt(financials.down_payment)} is being gifted by their parents. With a credit score of ${client.credit_score} and ${creditIssue}, the lender may scrutinize the source of funds more carefully.`,
      correct: {
        text: 'Prepare a signed gift letter, parents\' proof of funds, confirmation the gift is non-repayable, and bank statements showing the transfer. B-lenders accept gifted down payments with proper documentation',
        feedback: 'Gifted down payments are acceptable at most lender tiers with proper documentation. For credit-challenged borrowers, thorough documentation is especially important as the file receives enhanced scrutiny.',
      },
      wrongs: [
        { text: 'B-lenders do not accept gifted down payments', feedback: 'Most B-lenders accept gifted down payments from immediate family with proper documentation. This is not restricted to A-lenders.' },
        { text: 'The gift does not need to be documented if it comes from parents', feedback: 'All gifted funds require documentation regardless of the source. A signed gift letter, proof of donor funds, and evidence of transfer are mandatory.' },
        { text: 'Have the parents deposit funds into the client\'s account without a paper trail', feedback: 'Large undocumented deposits raise anti-money laundering flags and can derail the application. All fund movements must be clearly documented and traceable.' },
        { text: 'The gift letter is sufficient -- no proof of the parents\' funds is needed', feedback: 'Lenders typically require both the gift letter and evidence that the donor has the financial capacity to provide the gift. This prevents fraudulent gift claims.' },
        { text: 'Gifted funds cannot be used for the entire down payment -- the client must contribute their own funds', feedback: 'While some lenders may require a minimum client contribution, many accept 100% gifted down payments from immediate family members with proper documentation.' },
      ],
      points: 20,
      explanation: 'Gifted down payments require thorough documentation: signed gift letter, proof of donor funds, confirmation of non-repayment, and bank statements showing the transfer. Credit-challenged files receive enhanced scrutiny, making documentation even more critical.',
      sources: [
        { title: 'Government of Canada -- Down Payment Requirements', url: 'https://www.canada.ca/en/financial-consumer-agency/services/mortgages/down-payment.html' },
        { title: 'FINTRAC -- Source of Funds Documentation', url: 'https://fintrac-canafe.canada.ca/guidance-directives/overview-apercu/Guide1/1-eng' },
      ],
    }),
  ];

  return selectAndBuild(factories, 5, rng);
}
