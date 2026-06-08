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
import { randInt, randFloat, pick } from '../../random';

export function generateSelfEmployedScenarios(ctx: GeneratedContext, rng: () => number): Scenario[] {
  const { client, property, financials, computed } = ctx;
  const c = computed;
  const yearsInBusiness = randInt(rng, 3, 12);

  const year1Income = Math.round(client.annual_income * randFloat(rng, 1.05, 1.20));
  const year2Income = Math.round(client.annual_income * randFloat(rng, 0.82, 0.95));
  const avgIncome = Math.round((year1Income + year2Income) / 2);
  const variancePercent = Math.round(((year1Income - year2Income) / year1Income) * 100);

  const factories: (() => ScenarioVariant)[] = [
    () => ({
      title: 'Income Verification Approach',
      description: `How should you verify ${client.name}'s self-employed income?`,
      context: `${client.name} has been self-employed for ${yearsInBusiness} years running a successful business. They declare ${fmt(client.annual_income)} in annual income but their business writes off significant expenses.`,
      correct: {
        text: 'Request 2 years of T1 Generals, NOAs, and business financial statements',
        feedback: 'Standard self-employed documentation includes 2 years of T1 Generals with all schedules, Notices of Assessment, and business financial statements to verify income consistency.',
      },
      wrongs: [
        { text: 'Accept their stated income without documentation', feedback: 'Stated income programs are largely unavailable in Canada. All lenders require documentation to verify self-employed income.' },
        { text: 'Only need their most recent pay stub', feedback: 'Self-employed individuals do not receive traditional pay stubs. Income verification requires tax returns and business financials.' },
        { text: 'Use bank statements only, skip tax documents', feedback: 'While bank statements support the application, tax documents (T1 Generals, NOAs) are the primary income verification for self-employed borrowers at A-lenders.' },
        { text: 'Request only the most recent year\'s tax return to save time', feedback: 'A single year does not show income consistency or trends. Most lenders require 2 years to establish a reliable income picture for self-employed borrowers.' },
        { text: 'Ask their accountant to provide a letter confirming their income', feedback: 'An accountant\'s letter alone is insufficient. CRA documents (T1 Generals, NOAs) are required as primary income verification. An accountant letter can supplement but not replace them.' },
      ],
      points: 20,
      explanation: 'Self-employed income verification requires T1 General tax returns (2 years), Notices of Assessment, business financial statements, and often Articles of Incorporation.',
      sources: [
        { title: 'CRA -- Self-Employment Income', url: 'https://www.canada.ca/en/revenue-agency/services/tax/businesses/topics/sole-proprietorships-partnerships/reporting-income.html' },
        { title: 'CMHC -- Self-Employed Borrowers', url: 'https://www.cmhc-schl.gc.ca/professionals/project-funding-and-mortgage-financing/mortgage-loan-insurance/mortgage-loan-insurance-homeownership-programs' },
      ],
    }),

    () => ({
      title: 'Income Variance Analysis',
      description: `${client.name}'s declared income dropped ${variancePercent}% last year. How do you handle this?`,
      context: `Year 1: ${fmt(year1Income)} declared. Year 2: ${fmt(year2Income)} declared. ${client.name} explains the drop was due to a slow quarter when a major project was delayed.`,
      correct: {
        text: `Average the two years (${fmt(avgIncome)}) and document the variance with a letter of explanation`,
        feedback: 'Averaging 2 years is standard practice. A letter explaining the variance (delayed project) with supporting evidence strengthens the application and satisfies underwriter questions.',
      },
      wrongs: [
        { text: 'Use only the higher year\'s income for qualification', feedback: 'Lenders typically average self-employed income over 2 years or use the lower figure. Cherry-picking the higher year misrepresents the borrower\'s income.' },
        { text: 'Decline the application due to income instability', feedback: `A ${variancePercent}% variance with a reasonable explanation is not uncommon for self-employed borrowers. Many lenders accommodate this with proper documentation.` },
        { text: 'Suggest they amend their tax returns to show higher income', feedback: 'Suggesting a client amend tax returns to inflate income is unethical and potentially illegal. This violates mortgage agent professional standards.' },
        { text: 'Use only the lower year as a conservative approach', feedback: 'While conservative, using only the lower year unnecessarily penalizes the borrower. The industry standard is to average 2 years of income for self-employed applicants.' },
        { text: 'Wait until the current year\'s tax return is filed to see if income rebounds', feedback: 'Waiting adds unnecessary delay. Lenders accept 2-year averages with explanations. If the variance is reasonable and documented, proceed with the application.' },
      ],
      points: 20,
      explanation: 'For self-employed borrowers, lenders typically average 2 years of income. Income variances should be explained with supporting documentation.',
      sources: [
        { title: 'CRA -- T1 General Income Tax and Benefit Return', url: 'https://www.canada.ca/en/revenue-agency/services/forms-publications/tax-packages-years/general-income-tax-benefit-package.html' },
        { title: 'OSFI -- Guideline B-20: Income Verification', url: 'https://www.osfi-bsif.gc.ca/en/guidance/guidance-library/residential-mortgage-underwriting-practices-procedures' },
      ],
    }),

    () => ({
      title: 'Lender Selection Strategy',
      description: `Which lender category best suits ${client.name}'s profile?`,
      context: `${client.name} has ${pct(c.downPaymentPercent, 0)} down payment, ${client.credit_score} credit score, ${yearsInBusiness} years self-employed, averaged income of ${fmt(avgIncome)}, and some income variance between years.`,
      correct: {
        text: 'Monoline lender experienced with self-employed borrowers for flexible underwriting and competitive rates',
        feedback: 'Monoline lenders often have more flexible underwriting for self-employed borrowers while offering competitive rates. They understand business income nuances better.',
      },
      wrongs: [
        { text: 'Big 5 bank -- they offer the best rates for everyone', feedback: 'While Big 5 banks offer competitive rates, their self-employed underwriting can be rigid. Income variance and credit profile may face more scrutiny.' },
        { text: 'Private lender for guaranteed quick approval', feedback: `Private lending should be a last resort due to significantly higher rates and fees. ${client.name}'s profile is strong enough for an A-lender or monoline.` },
        { text: 'Only credit unions handle self-employed borrowers', feedback: 'Credit unions are one option but not the only one. Multiple lender types serve self-employed borrowers. Limiting to one category may miss better options.' },
        { text: 'Submit to every lender simultaneously to see who approves first', feedback: 'Shotgun submissions generate multiple credit inquiries and damage the borrower\'s score. A targeted submission to the most suitable lender is the professional approach.' },
        { text: 'An MIC (Mortgage Investment Corporation) for the most flexibility', feedback: 'MICs are alternative lenders with higher rates. A borrower with good income documentation and credit does not need to resort to MIC lending.' },
      ],
      points: 20,
      explanation: 'Lender selection for self-employed borrowers should consider underwriting flexibility, experience with business income, and rates.',
      sources: [
        { title: 'FSRA -- Licensed Mortgage Brokerages, Brokers and Agents', url: 'https://www.fsrao.ca/consumers/mortgage-brokering' },
        { title: 'Government of Canada -- Choosing a Mortgage', url: 'https://www.canada.ca/en/financial-consumer-agency/services/mortgages/choosing-mortgage.html' },
      ],
    }),

    () => ({
      title: 'Down Payment Verification',
      description: `${client.name} has ${pct(c.downPaymentPercent, 0)} down (${fmt(financials.down_payment)}). What verification is required?`,
      context: `${client.name}'s down payment comes from their personal savings and business account. They have more than enough funds but need to document the source.`,
      correct: {
        text: '90-day bank history showing source and accumulation of funds, plus proof funds are not borrowed',
        feedback: 'Lenders require 90 days of bank statements showing the accumulation and source of down payment funds. For self-employed, business-to-personal transfers must be clearly documented.',
      },
      wrongs: [
        { text: `No verification needed with ${pct(c.downPaymentPercent, 0)} down`, feedback: 'Anti-money laundering regulations require verification of down payment source regardless of the amount. All down payments must be documented.' },
        { text: 'Only a current balance statement is sufficient', feedback: 'A current balance alone does not prove the source of funds. Lenders need to see the history of how funds accumulated to comply with anti-money laundering rules.' },
        { text: `A signed letter from ${client.name} confirming the funds are their own`, feedback: 'A self-declaration is insufficient. Bank statements and transaction history are required documentation to verify the source and legitimacy of down payment funds.' },
        { text: 'Business account statements are not needed if personal accounts show the balance', feedback: 'When funds are transferred from business to personal accounts, both sets of statements are needed to document the complete flow of funds.' },
        { text: 'A letter from their accountant confirming the funds are legitimate', feedback: 'While an accountant letter may support the file, it cannot replace bank statements. Direct financial documentation showing fund accumulation is mandatory.' },
      ],
      points: 20,
      explanation: 'Down payment verification requires 90-day bank statements showing fund accumulation and source. For self-employed borrowers, transfers between business and personal accounts must be clearly documented.',
      sources: [
        { title: 'FINTRAC -- Proceeds of Crime and Anti-Money Laundering', url: 'https://fintrac-canafe.canada.ca/guidance-directives/overview-apercu/Guide1/1-eng' },
        { title: 'Government of Canada -- Down Payment Requirements', url: 'https://www.canada.ca/en/financial-consumer-agency/services/mortgages/down-payment.html' },
      ],
    }),

    () => ({
      title: 'Conditions Management',
      description: 'The lender approves with conditions. What is your approach?',
      context: `Approval comes with conditions: updated business financials, confirmation of no new debts, property appraisal, and title insurance. The closing date is in 30 days.`,
      correct: {
        text: 'Address conditions promptly and systematically, communicate progress with both lender and client throughout',
        feedback: 'Proactive conditions management is critical. Address each condition as quickly as possible, keep all parties informed, and escalate any issues early to protect the closing date.',
      },
      wrongs: [
        { text: 'Send all documents at once right at the deadline', feedback: 'Waiting until the deadline risks missing closing if issues arise. Conditions should be addressed promptly and systematically.' },
        { text: `Let ${client.name} handle the conditions directly with the lender`, feedback: 'The mortgage agent should manage conditions on behalf of the client. Letting the client deal directly with the lender can lead to miscommunication and delays.' },
        { text: 'Only address conditions the lender specifically follows up on', feedback: 'ALL conditions must be satisfied before closing regardless of follow-ups. Ignoring conditions until prompted risks delays and could jeopardize the deal.' },
        { text: 'Request an extension immediately to give more time for conditions', feedback: 'Requesting extensions before attempting to meet conditions signals poor planning. Address conditions promptly; request extensions only if genuinely needed.' },
        { text: 'Have the client\'s lawyer handle all conditions since they manage the closing', feedback: 'The mortgage agent is responsible for lender conditions. The lawyer handles legal aspects of closing. These are separate responsibilities that should not be conflated.' },
      ],
      points: 20,
      explanation: 'Effective conditions management means addressing all requirements promptly, maintaining clear communication with lender and client, tracking progress systematically, and escalating potential issues well before deadlines.',
      sources: [
        { title: 'FSRA -- Mortgage Brokering Standards of Practice', url: 'https://www.fsrao.ca/industry/mortgage-brokering/regulatory-framework/mortgage-brokering-standards-practice' },
        { title: 'CMHC -- Mortgage Process Guide', url: 'https://www.cmhc-schl.gc.ca/consumers/home-buying/buying-guides/home-buying-guide' },
      ],
    }),

    () => {
      const structure = pick(rng, ['sole proprietorship', 'incorporated business', 'partnership']);
      return {
        title: 'Business Structure Impact on Qualification',
        description: `How does ${client.name}'s ${structure} affect their mortgage qualification?`,
        context: `${client.name} operates as a ${structure} with ${yearsInBusiness} years of history. Their accountant has optimized tax deductions, resulting in declared income of ${fmt(client.annual_income)} but gross business revenue significantly higher.`,
        correct: {
          text: `Assess the ${structure}'s income documentation requirements, understand how deductions affect qualifying income, and determine if gross-up programs are available`,
          feedback: `Business structure affects income calculation. ${structure === 'incorporated business' ? 'Corporations require T2 returns, T4/T5 slips for owner draws, and possibly retained earnings analysis.' : structure === 'partnership' ? 'Partnerships require the T5013 form plus each partner\'s share of income on their T1.' : 'Sole proprietors use T2125 business income on their T1, where net business income is the qualifying figure.'}`,
        },
        wrongs: [
          { text: 'Business structure has no impact on mortgage qualification', feedback: 'Business structure directly affects how income is calculated, what documents are needed, and which gross-up programs may be available.' },
          { text: 'Use the gross business revenue as qualifying income', feedback: 'Gross revenue is not income. After business expenses, the net income declared to CRA is what lenders use for qualification.' },
          { text: 'Recommend they change their business structure before applying', feedback: 'Changing business structure has significant tax and legal implications. This advice is outside the mortgage agent\'s scope and could harm the client.' },
          { text: 'Only incorporated businesses can qualify for mortgages', feedback: 'Self-employed individuals qualify for mortgages regardless of business structure. Each structure simply has different documentation requirements.' },
          { text: 'Ask them to draw a larger salary from the business to show more income', feedback: 'Advising on corporate salary decisions is outside the mortgage agent\'s scope and could have negative tax consequences. Work with the income as declared.' },
        ],
        points: 20,
        explanation: 'Business structure (sole proprietorship, corporation, partnership) affects income documentation, qualification calculations, and available gross-up programs. Understanding these differences is essential for self-employed applications.',
        sources: [
          { title: 'CRA -- Business Structures', url: 'https://www.canada.ca/en/revenue-agency/services/tax/businesses/topics/sole-proprietorships-partnerships.html' },
          { title: 'OSFI -- Guideline B-20: Self-Employed Income', url: 'https://www.osfi-bsif.gc.ca/en/guidance/guidance-library/residential-mortgage-underwriting-practices-procedures' },
        ],
      };
    },

    () => ({
      title: 'Stated Income vs Full Documentation Programs',
      description: `Should ${client.name} pursue a stated income or full documentation program?`,
      context: `${client.name}'s declared income of ${fmt(client.annual_income)} is lower than their actual earnings due to aggressive tax planning. A stated income program would allow them to declare higher income. Down payment is ${pct(c.downPaymentPercent, 0)}.`,
      correct: {
        text: 'Explain both options: full documentation at A-lender rates vs stated income at B-lender rates with higher costs, and let the client make an informed decision',
        feedback: 'Presenting both options with full cost analysis allows the client to weigh the trade-offs. Full documentation offers better rates; stated income programs accommodate income not fully reflected on tax returns but at a premium.',
      },
      wrongs: [
        { text: 'Always choose stated income to maximize qualification amount', feedback: 'Stated income programs carry higher rates and fees. If the client can qualify with full documentation, pursuing stated income costs them more unnecessarily.' },
        { text: 'Stated income programs are illegal in Canada', feedback: 'Stated income programs exist at B-lenders for self-employed borrowers with strong equity positions. They are regulated, not illegal.' },
        { text: 'Tell them to inflate their stated income to qualify for more', feedback: 'Misrepresenting income on a mortgage application is fraud. The stated income must be reasonable and consistent with the borrower\'s industry and experience.' },
        { text: 'Full documentation is always required -- there are no alternatives', feedback: 'While A-lenders require full documentation, B-lenders offer stated income programs for self-employed borrowers who may not fully reflect their income on tax returns.' },
        { text: 'Recommend stated income only if their credit score is below 650', feedback: 'The choice between stated and full documentation depends on income documentation, not credit score. Credit score affects lender options independently.' },
      ],
      points: 20,
      explanation: 'Stated income programs serve self-employed borrowers whose tax-optimized income does not reflect true earning capacity. They come at a rate premium and typically require larger down payments (typically 20%+).',
      sources: [
        { title: 'FSRA -- Mortgage Brokering Standards of Practice', url: 'https://www.fsrao.ca/industry/mortgage-brokering/regulatory-framework/mortgage-brokering-standards-practice' },
        { title: 'Government of Canada -- Mortgages: What You Need to Know', url: 'https://www.canada.ca/en/financial-consumer-agency/services/mortgages.html' },
      ],
    }),

    () => ({
      title: 'HST/GST Considerations for Self-Employed',
      description: `${client.name} asks about potential HST/GST obligations related to the property purchase. What is your guidance?`,
      context: `${client.name} is considering whether the ${property.type.toLowerCase()} in ${property.location} could be partially used for their business. They wonder about tax implications.`,
      correct: {
        text: 'Advise that mixing personal and business use of the property has tax implications and recommend consulting their accountant before making decisions that affect the mortgage structure',
        feedback: 'Mixed-use properties have complex tax implications including HST rebate eligibility, capital gains treatment, and expense deductibility. These decisions affect the mortgage application and should involve a tax professional.',
      },
      wrongs: [
        { text: 'Provide detailed tax advice on HST implications for the property', feedback: 'Mortgage agents are not licensed to provide specific tax advice. Overstepping professional boundaries exposes both the agent and client to risk.' },
        { text: 'HST/GST is irrelevant to the mortgage process', feedback: 'Property use affects the mortgage type, insurance eligibility, and tax treatment. While agents should not provide tax advice, awareness of these issues is important.' },
        { text: 'Tell them to declare it entirely as a primary residence regardless of business use', feedback: 'Misrepresenting property use could constitute mortgage fraud and has serious tax consequences. Property use must be accurately declared.' },
        { text: 'All new property purchases are exempt from HST/GST', feedback: 'This is incorrect. New construction is subject to HST/GST (with partial rebates for primary residences). Resale properties are generally exempt but business use changes the analysis.' },
        { text: 'Business use of a primary residence does not affect the mortgage at all', feedback: 'If a significant portion of the property is used for business, it can affect insurance eligibility, interest deductibility, and capital gains treatment upon sale.' },
      ],
      points: 20,
      explanation: 'Self-employed borrowers often consider mixed property use. Mortgage agents should be aware of the implications but refer clients to tax professionals for specific advice on HST/GST and business use deductions.',
      sources: [
        { title: 'CRA -- GST/HST New Housing Rebate', url: 'https://www.canada.ca/en/revenue-agency/services/forms-publications/publications/rc4028/gst-hst-new-housing-rebate.html' },
        { title: 'CRA -- Business Use of Home Expenses', url: 'https://www.canada.ca/en/revenue-agency/services/tax/businesses/topics/sole-proprietorships-partnerships/business-expenses/work-space-home-expenses.html' },
      ],
    }),
  ];

  return selectAndBuild(factories, 5, rng);
}
