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
import { GDS_LIMIT, TDS_LIMIT } from '../../mortgage-math';
import { pick, randInt } from '../../random';

export function generateFirstTimeBuyerScenarios(ctx: GeneratedContext, rng: () => number): Scenario[] {
  const { client, property, financials, computed } = ctx;
  const c = computed;

  const factories: (() => ScenarioVariant)[] = [
    () => ({
      title: 'Initial Client Consultation',
      description: `${client.name} has reached out about purchasing their first home. What should be your priority?`,
      context: `${client.name} is a ${client.age}-year-old ${client.employment_type.toLowerCase()} earning ${fmt(client.annual_income)} annually. They have found a ${property.type.toLowerCase()} listed at ${fmt(property.purchase_price)} in ${property.location} and are eager to get started.`,
      correct: {
        text: 'Review their complete financial picture, homebuying goals, and timeline before discussing products',
        feedback: 'A comprehensive needs assessment is essential. Understanding goals, risk tolerance, timeline, and financial situation allows you to provide the most suitable advice.',
      },
      wrongs: [
        { text: 'Start the pre-approval process immediately to lock in a rate', feedback: 'Jumping straight to pre-approval without understanding the full picture could lead to unsuitable product recommendations. Always start with a thorough needs assessment.' },
        { text: 'Recommend the maximum property price they qualify for', feedback: 'The maximum qualification amount may not be what the client should borrow. Always consider comfort level, lifestyle, and long-term goals.' },
        { text: 'Advise them to wait until they have a 20% down payment', feedback: 'This blanket advice ignores market conditions, timeline, and the fact that building equity sooner can offset insurance costs. Each situation requires individual analysis.' },
        { text: 'Send them a list of properties to look at before the financial assessment', feedback: 'Property searches before understanding financial capacity waste time and risk emotional attachment to unaffordable homes.' },
        { text: 'Focus exclusively on finding the lowest interest rate available', feedback: 'Rate is only one factor. Product features, flexibility, penalties, and suitability for the client\'s situation are equally important considerations.' },
      ],
      points: 20,
      explanation: 'The initial consultation sets the foundation for the client relationship. A thorough needs assessment ensures you understand goals, finances, risk tolerance, and timeline before recommending products.',
      sources: [
        { title: 'FSRA -- Mortgage Brokering Standards of Practice', url: 'https://www.fsrao.ca/industry/mortgage-brokering/regulatory-framework/mortgage-brokering-standards-practice' },
        { title: 'CMHC -- First-Time Home Buyer Guide', url: 'https://www.cmhc-schl.gc.ca/consumers/home-buying/buying-guides/home-buying-guide' },
      ],
    }),

    () => ({
      title: 'Pre-Approval Documentation',
      description: `What documents should ${client.name} provide for a complete pre-approval package?`,
      context: `${client.name} is ready to move forward with a pre-approval. They are a ${client.employment_type.toLowerCase()} with ${client.dependents} dependent${client.dependents !== 1 ? 's' : ''} and a credit score of ${client.credit_score}.`,
      correct: {
        text: 'Employment letter, recent pay stubs, T4s/NOAs for 2 years, bank statements showing down payment, government ID, and a signed credit consent',
        feedback: 'A complete pre-approval package includes all income verification, asset documentation, identification, and credit authorization. This prevents delays and demonstrates professionalism.',
      },
      wrongs: [
        { text: 'Only a credit check is needed for pre-approval', feedback: 'A credit check alone does not constitute a pre-approval. Income, assets, and employment must also be verified for a meaningful pre-approval.' },
        { text: 'Just the most recent pay stub and a verbal confirmation of employment', feedback: 'Lenders require formal documentation. A single pay stub and verbal confirmation are insufficient for a proper pre-approval submission.' },
        { text: 'No documents needed -- pre-approvals are based on stated income', feedback: 'Stated income programs are largely unavailable in Canada. Proper pre-approvals require full documentation of income, assets, and employment.' },
        { text: 'Only bank statements showing down payment funds are required at pre-approval', feedback: 'Down payment verification is just one component. Income, employment, credit, and identification are all required for a complete pre-approval.' },
        { text: 'Tax returns are only needed for self-employed applicants', feedback: 'While self-employed borrowers need additional tax documents, T4s and NOAs are standard requirements for all applicants to verify declared income.' },
      ],
      points: 20,
      explanation: 'A complete pre-approval package speeds up the process and gives the client confidence when making offers. Missing documents cause delays and may result in conditions that weaken their competitive position.',
      sources: [
        { title: 'CMHC -- Getting Pre-Approved', url: 'https://www.cmhc-schl.gc.ca/consumers/home-buying/buying-guides/home-buying-guide' },
        { title: 'Government of Canada -- Mortgages: What You Need to Know', url: 'https://www.canada.ca/en/financial-consumer-agency/services/mortgages.html' },
      ],
    }),

    () => {
      const v: ScenarioVariant = c.isHighRatio
        ? {
            title: 'Mortgage Insurance Assessment',
            description: `With ${fmt(financials.down_payment)} down on ${fmt(property.purchase_price)} (${pct(c.downPaymentPercent)}), what insurance implications apply?`,
            context: `${client.name}'s down payment of ${fmt(financials.down_payment)} represents ${pct(c.downPaymentPercent)} of the purchase price. They ask about additional costs to expect.`,
            correct: {
              text: `CMHC insurance is required at ${pct(c.cmhcPremiumPercent)} premium (${fmt(c.cmhcPremiumAmount)}), added to the mortgage balance`,
              feedback: `With ${pct(c.downPaymentPercent)} down, the CMHC premium is ${pct(c.cmhcPremiumPercent)}. On a ${fmt(c.mortgageAmount)} mortgage, that is ${fmt(c.cmhcPremiumAmount)}, making the insured amount ${fmt(c.insuredMortgage)}.`,
            },
            wrongs: [
              { text: `No insurance is needed since ${client.name}'s credit score is ${client.credit_score}`, feedback: 'Credit score does not determine whether mortgage insurance is required. CMHC insurance is mandatory for all mortgages with less than 20% down payment.' },
              { text: `They cannot purchase at this price with only ${pct(c.downPaymentPercent)} down`, feedback: `Minimum down payment: 5% on first $500K + 10% on remainder. ${client.name} needs ${fmt(c.minimumDownPayment)} minimum. Their ${fmt(financials.down_payment)} ${financials.down_payment >= c.minimumDownPayment ? 'exceeds' : 'falls short of'} this.` },
              { text: 'Insurance only applies to investment properties', feedback: 'Mortgage default insurance is required for all high-ratio mortgages (under 20% down) on owner-occupied properties. CMHC does NOT insure investment properties under 20% down.' },
              { text: 'The insurance premium is paid upfront as a lump sum at closing', feedback: 'While the premium can be paid upfront, it is standard practice to add it to the mortgage balance. This is how most borrowers handle it in Canada.' },
              { text: `Insurance is optional and only recommended if the credit score is below 700`, feedback: 'Mortgage insurance is not optional for high-ratio mortgages. It is mandatory for all mortgages with less than 20% down, regardless of credit score.' },
            ],
            points: 20,
            explanation: `CMHC insurance tiers: 5-9.99% down = 4.00%, 10-14.99% = 3.10%, 15-19.99% = 2.80%. The premium is added to the mortgage and amortized over the loan's life.`,
            sources: [
              { title: 'CMHC -- Mortgage Loan Insurance Premiums', url: 'https://www.cmhc-schl.gc.ca/consumers/home-buying/mortgage-loan-insurance-for-consumers/mortgage-loan-insurance-premiums' },
              { title: 'Government of Canada -- Down Payment Requirements', url: 'https://www.canada.ca/en/financial-consumer-agency/services/mortgages/down-payment.html' },
            ],
          }
        : {
            title: 'Mortgage Insurance Assessment',
            description: `With ${fmt(financials.down_payment)} down on ${fmt(property.purchase_price)} (${pct(c.downPaymentPercent)}), what insurance implications apply?`,
            context: `${client.name}'s down payment of ${fmt(financials.down_payment)} represents ${pct(c.downPaymentPercent)} of the purchase price. They ask about additional costs to expect.`,
            correct: {
              text: `No CMHC insurance is required since the down payment is 20% or more, resulting in a conventional mortgage of ${fmt(c.mortgageAmount)}`,
              feedback: `With ${pct(c.downPaymentPercent)} down (20% or more), this is a conventional mortgage. No mortgage default insurance is required, saving the borrower thousands in premiums.`,
            },
            wrongs: [
              { text: `CMHC insurance is required at 4.00% since this is a first-time buyer`, feedback: 'First-time buyer status does not determine insurance requirements. With 20% or more down payment, no CMHC insurance is needed regardless of buyer status.' },
              { text: `Insurance is optional but recommended to get better rates`, feedback: 'Mortgage insurance is not optional when required (under 20% down). Above 20% down, it is not available at all. Insured mortgages may have slightly lower rates, but this is a lender pricing decision, not a borrower choice.' },
              { text: 'A separate private insurance policy is needed to protect the lender', feedback: 'CMHC (or Sagen/Canada Guaranty) insurance is arranged through the lender as part of the mortgage process. It is not a separate private policy the borrower shops for.' },
              { text: 'Insurance is mandatory for all first-time home purchases in Canada', feedback: 'There is no blanket insurance requirement for first-time buyers. Insurance depends solely on the loan-to-value ratio. With 20% or more down, no default insurance is required.' },
              { text: 'The lender will automatically add insurance at their discretion', feedback: 'Mortgage default insurance is determined by the LTV ratio, not lender discretion. With 20%+ down, no insurance is required or available.' },
            ],
            points: 20,
            explanation: `With 20% or more down payment, no mortgage default insurance is required. This is a conventional mortgage, which may have slightly different rate offerings from lenders.`,
            sources: [
              { title: 'CMHC -- Mortgage Loan Insurance Premiums', url: 'https://www.cmhc-schl.gc.ca/consumers/home-buying/mortgage-loan-insurance-for-consumers/mortgage-loan-insurance-premiums' },
              { title: 'Government of Canada -- Down Payment Requirements', url: 'https://www.canada.ca/en/financial-consumer-agency/services/mortgages/down-payment.html' },
            ],
          };
      return v;
    },

    () => ({
      title: 'Stress Test Qualification',
      description: `The lender offers ${pct(c.contractRate)} fixed. How does the stress test apply?`,
      context: `The lender has offered a 5-year fixed rate of ${pct(c.contractRate)}. You need to explain the B-20 stress test to ${client.name}.`,
      correct: {
        text: `They must qualify at the higher of the BoC qualifying rate (${pct(c.bocQualifyingRate)}) or contract rate + 2% (${pct(c.contractRate + 2)}), which is ${pct(c.stressTestRate)}`,
        feedback: `The stress test uses the higher of the BoC qualifying rate or contract rate + 2%. Since ${pct(c.stressTestRate)} is the higher value, ${client.name} must qualify at ${pct(c.stressTestRate)}.`,
      },
      wrongs: [
        { text: `They qualify at the ${pct(c.contractRate)} contract rate as a first-time buyer`, feedback: 'First-time buyer status does not exempt anyone from the stress test. All borrowers must qualify at the stress test rate.' },
        { text: 'The stress test only applies to variable rate mortgages', feedback: 'Since the B-20 guidelines update, the stress test applies to ALL mortgage applications at federally regulated lenders, including fixed rates.' },
        { text: 'They qualify at prime rate plus 1%', feedback: 'The qualifying rate is the higher of the BoC rate or contract + 2%. Prime rate is not used in the stress test calculation.' },
        { text: `The stress test adds 1% to the contract rate, so they qualify at ${pct(c.contractRate + 1)}`, feedback: 'The stress test adds 2%, not 1%, to the contract rate. The qualifying rate is the higher of contract + 2% or the BoC qualifying rate.' },
        { text: 'Insured mortgages are exempt from the stress test', feedback: 'All mortgages, whether insured or uninsured, are subject to the B-20 stress test at federally regulated lenders.' },
      ],
      points: 20,
      explanation: `The B-20 stress test requires borrowers at federally regulated lenders to qualify at the higher of the BoC qualifying rate (${pct(c.bocQualifyingRate)}) or their contract rate + 2%, ensuring they can handle potential rate increases.`,
      sources: [
        { title: 'OSFI -- Guideline B-20: Residential Mortgage Underwriting', url: 'https://www.osfi-bsif.gc.ca/en/guidance/guidance-library/residential-mortgage-underwriting-practices-procedures' },
        { title: 'Bank of Canada -- Qualifying Rate for Uninsured Mortgages', url: 'https://www.bankofcanada.ca/rates/interest-rates/canadian-interest-rates/' },
      ],
    }),

    () => {
      const gdsExceeds = c.gdsPercent > GDS_LIMIT;
      const tdsExceeds = c.tdsPercent > TDS_LIMIT;
      const housingStr = `Stressed mortgage payment: ${fmt(Math.round(c.stressedMortgagePayment))}. Property tax: ${fmt(c.propertyTax)}. ${c.condoFees > 0 ? `Condo fees: ${fmt(c.condoFees)} (50% = ${fmt(Math.round(c.condoFees * 0.5))} for qualification). ` : ''}Heating: ${fmt(c.heatingCost)}.`;
      const debtStr = financials.existing_debts.map((d) => `${d.type}: ${fmt(d.monthly_payment)}`).join('. ');

      return {
        title: 'Debt Service Ratio Analysis',
        description: `Assess ${client.name}'s GDS and TDS ratios.`,
        context: `Monthly gross income: ${fmt(Math.round(c.monthlyGrossIncome))}. ${housingStr}${debtStr ? ` ${debtStr}.` : ''}`,
        correct: gdsExceeds || tdsExceeds
          ? {
              text: `GDS ${pct(c.gdsPercent, 1)}, TDS ${pct(c.tdsPercent, 1)} -- exceeds ${GDS_LIMIT}%/${TDS_LIMIT}% guidelines. Recommend reducing price, increasing down payment, or eliminating debts`,
              feedback: `GDS = ${pct(c.gdsPercent, 1)} (${gdsExceeds ? 'exceeds' : 'within'} ${GDS_LIMIT}%). TDS = ${pct(c.tdsPercent, 1)} (${tdsExceeds ? 'exceeds' : 'within'} ${TDS_LIMIT}%). Proactive strategies must be discussed.`,
            }
          : {
              text: `GDS ${pct(c.gdsPercent, 1)}, TDS ${pct(c.tdsPercent, 1)} -- both within ${GDS_LIMIT}%/${TDS_LIMIT}% guidelines, qualifying ratios are acceptable`,
              feedback: `GDS = ${pct(c.gdsPercent, 1)} (within ${GDS_LIMIT}%). TDS = ${pct(c.tdsPercent, 1)} (within ${TDS_LIMIT}%). These ratios meet CMHC guidelines for insured mortgages.`,
            },
        wrongs: [
          { text: `GDS 33%, TDS 40% -- both within limits, proceed as-is`, feedback: `These numbers don't match the provided data. Always verify your calculations carefully using the actual figures provided.` },
          { text: `Ratios don't matter with a credit score above ${Math.min(client.credit_score + 50, 800)}`, feedback: `Debt service ratios are a fundamental qualification requirement regardless of credit score. CMHC has firm guidelines of ${GDS_LIMIT}% GDS and ${TDS_LIMIT}% TDS.` },
          { text: `GDS ${pct(c.gdsPercent, 1)}, TDS ${pct(c.tdsPercent, 1)} -- ratios are fine for insured mortgages with relaxed guidelines`, feedback: `The math may be correct but the assessment is wrong. Standard CMHC limits are GDS ${GDS_LIMIT}% and TDS ${TDS_LIMIT}%. There are no "relaxed" guidelines for standard insured mortgages.` },
          { text: 'Only TDS matters for mortgage qualification -- GDS is informational only', feedback: `Both GDS and TDS are mandatory qualification metrics. GDS measures housing affordability while TDS includes all debts. Both must be within ${GDS_LIMIT}%/${TDS_LIMIT}% limits.` },
          { text: `The ratios can be ignored if the client provides a larger down payment`, feedback: 'A larger down payment does not waive debt service ratio requirements. GDS and TDS must be within guidelines regardless of the down payment size.' },
        ],
        points: 20,
        explanation: `GDS = Housing costs / Gross income (max ${GDS_LIMIT}%). TDS = (Housing + all debts) / Gross income (max ${TDS_LIMIT}%). When ratios exceed limits, explore reducing price, larger down payment, paying off debts, or adding a co-borrower.`,
        sources: [
          { title: 'CMHC -- Calculating GDS and TDS Ratios', url: 'https://www.cmhc-schl.gc.ca/professionals/project-funding-and-mortgage-financing/mortgage-loan-insurance/calculating-gds-tds' },
          { title: 'Government of Canada -- How Much Can You Afford?', url: 'https://www.canada.ca/en/financial-consumer-agency/services/mortgages/how-much-afford.html' },
        ],
      };
    },

    () => ({
      title: 'Product Recommendation',
      description: `Recommend a mortgage product for ${client.name}.`,
      context: `${client.name} has a ${client.credit_score} credit score, ${client.marital_status === 'Single' ? 'moderate' : 'moderate-to-conservative'} risk tolerance, values payment stability, and plans to stay at least 5 years.`,
      correct: {
        text: '5-year fixed rate for payment certainty during their initial homeownership period',
        feedback: `A 5-year fixed matches ${client.name}'s profile: moderate risk tolerance, ${c.gdsPercent > 35 ? 'tight budget needing' : 'preference for'} predictable payments, and plans to stay 5+ years.`,
      },
      wrongs: [
        { text: '5-year variable rate for the lowest initial payments', feedback: 'Variable rates carry risk. For a first-time buyer with moderate risk tolerance who values stability, payment fluctuations could cause financial stress.' },
        { text: '1-year fixed rate to reassess market conditions soon', feedback: 'A 1-year term creates renewal uncertainty within 12 months. For a first-time buyer planning to stay 5+ years, this adds unnecessary stress and rate risk.' },
        { text: '10-year fixed rate for maximum long-term protection', feedback: 'A 10-year fixed comes with a significantly higher rate and steep penalties. Since the client plans to stay only 5+ years, a 5-year term better balances protection with flexibility.' },
        { text: 'An open mortgage so they can pay it off faster without penalties', feedback: 'Open mortgages carry significantly higher rates. For a first-time buyer who is unlikely to pay off the mortgage quickly, the rate premium is an unnecessary cost.' },
        { text: '3-year fixed as a compromise between rate and term', feedback: 'A 3-year term means renewal in 3 years with possible rate increases. Given the client values stability and plans to stay 5+ years, a 5-year fixed provides the requested certainty.' },
      ],
      points: 20,
      explanation: 'Product recommendations should align with client risk tolerance, finances, and plans. For first-time buyers with moderate risk tolerance, a 5-year fixed provides the stability needed during early homeownership.',
      sources: [
        { title: 'Government of Canada -- Choosing a Mortgage', url: 'https://www.canada.ca/en/financial-consumer-agency/services/mortgages/choosing-mortgage.html' },
        { title: 'CMHC -- Mortgage Types', url: 'https://www.cmhc-schl.gc.ca/consumers/home-buying/buying-guides/home-buying-guide/mortgage-types' },
      ],
    }),

    () => ({
      title: 'Down Payment Source Verification',
      description: `How should ${client.name}'s down payment source be verified?`,
      context: `${client.name} has ${fmt(financials.down_payment)} saved for a down payment. They mention the funds come from personal savings accumulated over several years and a gift from their parents.`,
      correct: {
        text: '90-day bank history showing accumulation, a signed gift letter from parents confirming the gift is non-repayable, and proof the gifted funds have been deposited',
        feedback: 'Down payment verification requires documenting the full source and history of funds. Gifted funds require a signed letter confirming they are a true gift with no repayment obligation.',
      },
      wrongs: [
        { text: 'A current bank statement showing the balance is sufficient', feedback: 'A current balance does not prove the source of funds. Lenders need history showing how the funds accumulated, per anti-money laundering requirements.' },
        { text: 'No verification is needed for amounts under $50,000', feedback: 'All down payment funds must be verified regardless of amount. There is no threshold below which verification is waived.' },
        { text: 'Only the personal savings need documenting -- family gifts are assumed legitimate', feedback: 'Gifted down payments require specific documentation: a gift letter, proof of the donor\'s ability to give, and evidence of transfer. Gifts cannot be assumed legitimate without documentation.' },
        { text: 'A verbal confirmation from the parents during the application meeting is enough', feedback: 'Verbal confirmations are not acceptable documentation. A formal, signed gift letter with specific details is required by all lenders.' },
        { text: 'The bank teller can simply write a note confirming the funds are available', feedback: 'A bank teller\'s note confirms availability but not source. Full 90-day statements are required to trace the origin and accumulation of funds.' },
      ],
      points: 20,
      explanation: 'Down payment verification is a critical compliance requirement. All funds must be traced to a legitimate source through bank statements, gift letters, or other documentation per anti-money laundering regulations.',
      sources: [
        { title: 'FINTRAC -- Proceeds of Crime and Anti-Money Laundering', url: 'https://fintrac-canafe.canada.ca/guidance-directives/overview-apercu/Guide1/1-eng' },
        { title: 'Government of Canada -- Down Payment Requirements', url: 'https://www.canada.ca/en/financial-consumer-agency/services/mortgages/down-payment.html' },
      ],
    }),

    () => {
      const closingCostPct = pick(rng, [1.5, 2.0, 2.5, 3.0]);
      const closingCosts = Math.round(property.purchase_price * closingCostPct / 100);
      const landTransferTax = Math.round(property.purchase_price * 0.01);
      return {
        title: 'Closing Cost Preparation',
        description: `What closing costs should ${client.name} budget for beyond the down payment?`,
        context: `${client.name} is focused on saving the ${fmt(financials.down_payment)} down payment but hasn't considered additional costs. The property is in ${property.location} at ${fmt(property.purchase_price)}.`,
        correct: {
          text: `Budget approximately ${fmt(closingCosts)} (${closingCostPct}% of purchase price) for legal fees, land transfer tax, title insurance, home inspection, appraisal, and adjustments`,
          feedback: `Closing costs typically range from 1.5-4% of purchase price. Key items include: land transfer tax (approximately ${fmt(landTransferTax)}), legal fees ($1,500-2,500), title insurance ($300-500), home inspection ($400-600), and prepaid property tax/utility adjustments.`,
        },
        wrongs: [
          { text: 'The down payment covers all costs -- there are no additional closing costs', feedback: 'Closing costs are separate from the down payment and typically amount to 1.5-4% of the purchase price. Failing to budget for these can delay or derail the transaction.' },
          { text: 'Closing costs can be added to the mortgage', feedback: 'Unlike CMHC premiums, closing costs generally cannot be financed through the mortgage. They must be paid from the buyer\'s own funds at closing.' },
          { text: 'Only legal fees apply -- other costs are optional', feedback: 'Multiple closing costs are mandatory: land transfer tax, title insurance (or title search), and legal fees. Others like home inspection are strongly recommended.' },
          { text: 'The seller typically pays all closing costs in a standard transaction', feedback: 'In Canada, buyers are responsible for their own closing costs. While some costs can be negotiated, buyers should not expect the seller to cover them.' },
          { text: 'First-time buyers are exempt from all closing costs in Canada', feedback: 'While first-time buyers may qualify for land transfer tax rebates in some provinces, they are not exempt from all closing costs.' },
        ],
        points: 20,
        explanation: 'Closing costs are a frequently overlooked expense for first-time buyers. A thorough agent ensures clients budget 1.5-4% beyond the down payment for legal, tax, insurance, and other mandatory costs.',
        sources: [
          { title: 'CMHC -- Closing Costs', url: 'https://www.cmhc-schl.gc.ca/consumers/home-buying/buying-guides/home-buying-guide' },
          { title: 'Government of Canada -- Costs of Buying a Home', url: 'https://www.canada.ca/en/financial-consumer-agency/services/mortgages/costs-buying-home.html' },
        ],
      };
    },

    () => {
      const hhbpLimit = 35000;
      const fhsaLimit = 40000;
      return {
        title: 'First-Time Buyer Incentives',
        description: `What government incentives should ${client.name} know about as a first-time buyer?`,
        context: `${client.name} is a confirmed first-time home buyer with no previous home ownership. They are purchasing a ${property.type.toLowerCase()} at ${fmt(property.purchase_price)} in ${property.location}.`,
        correct: {
          text: `Explain the HBP (up to ${fmt(hhbpLimit)} RRSP withdrawal), FHSA (up to ${fmt(fhsaLimit)} tax-free savings), Home Buyers\' Tax Credit ($10,000), and any applicable provincial programs`,
          feedback: `First-time buyers have access to multiple programs: the Home Buyers' Plan allows RRSP withdrawals up to ${fmt(hhbpLimit)}, the FHSA allows tax-free savings up to ${fmt(fhsaLimit)}, and the Home Buyers' Tax Credit provides a $10,000 non-refundable credit.`,
        },
        wrongs: [
          { text: 'There are no special programs for first-time home buyers in Canada', feedback: 'Canada has multiple federal and provincial programs specifically designed for first-time buyers. Not informing clients of these programs is a disservice.' },
          { text: 'The only benefit is a reduced CMHC insurance premium', feedback: 'CMHC premiums are based on LTV ratio, not buyer status. First-time buyer benefits include the HBP, FHSA, tax credits, and potentially provincial programs.' },
          { text: 'First-time buyers can borrow their entire down payment from their RRSP tax-free', feedback: `The HBP allows RRSP withdrawals up to ${fmt(hhbpLimit)} per person, not unlimited amounts. Funds must be repaid over 15 years or added to taxable income.` },
          { text: 'Only buyers under age 30 qualify for first-time buyer programs', feedback: 'First-time buyer status is based on home ownership history, not age. Anyone who has not owned a home in the qualifying period may be eligible.' },
          { text: 'These programs are only available for properties under $500,000', feedback: 'The HBP, FHSA, and Home Buyers\' Tax Credit do not have property price caps (though some provincial programs may). They are available regardless of purchase price.' },
        ],
        points: 20,
        explanation: 'Mortgage agents should ensure first-time buyers are aware of all available incentives. These programs can significantly reduce the financial burden of home ownership.',
        sources: [
          { title: 'Government of Canada -- Home Buyers\' Plan', url: 'https://www.canada.ca/en/revenue-agency/services/tax/individuals/topics/rrsps-related-plans/what-home-buyers-plan.html' },
          { title: 'Government of Canada -- First Home Savings Account', url: 'https://www.canada.ca/en/revenue-agency/services/tax/individuals/topics/first-home-savings-account.html' },
        ],
      };
    },

    () => {
      const amortOptions = [20, 25, 30];
      const payments = amortOptions.map((yr) => {
        const r = (c.contractRate / 100 / 2);
        const mr = Math.pow(1 + r, 1 / 6) - 1;
        const n = yr * 12;
        const pmt = c.insuredMortgage * (mr * Math.pow(1 + mr, n)) / (Math.pow(1 + mr, n) - 1);
        return { years: yr, payment: Math.round(pmt) };
      });
      return {
        title: 'Amortization Period Selection',
        description: `What amortization period best suits ${client.name}'s situation?`,
        context: `${client.name} wants manageable payments but also wants to build equity. Monthly budget is tight with GDS at ${pct(c.gdsPercent, 1)}. Mortgage amount: ${fmt(Math.round(c.insuredMortgage))}.`,
        correct: {
          text: `25-year amortization at approximately ${fmt(payments[1].payment)}/month balances affordability with reasonable equity building and total interest cost`,
          feedback: `A 25-year amortization provides a middle ground: lower payments than 20 years (${fmt(payments[0].payment)}) while building equity faster than 30 years (${fmt(payments[2].payment)}). It is the standard choice for most first-time buyers.`,
        },
        wrongs: [
          { text: `Longest amortization possible to minimize monthly payments`, feedback: 'While longer amortization lowers payments, it significantly increases total interest paid. The right balance considers both monthly affordability and long-term cost.' },
          { text: `15-year amortization to pay off the mortgage as quickly as possible`, feedback: 'A 15-year amortization results in very high monthly payments that would push debt service ratios beyond acceptable limits. Affordability must come first.' },
          { text: 'Amortization period does not significantly affect the mortgage', feedback: 'Amortization has a major impact on monthly payments, total interest paid, and equity building speed. It is one of the most important decisions in structuring a mortgage.' },
          { text: `35-year amortization for first-time buyers with insured mortgages`, feedback: 'Maximum amortization for insured mortgages in Canada is 25 years. Uninsured mortgages may go to 30 years at some lenders, but 35 years is not available.' },
          { text: 'Always choose the shortest amortization the lender will approve', feedback: 'The shortest amortization may create payment stress. A balanced approach considers monthly comfort, emergency fund maintenance, and overall financial health.' },
        ],
        points: 20,
        explanation: 'Amortization selection balances monthly affordability with total interest cost and equity building speed. Standard insured maximum is 25 years; some uninsured lenders offer up to 30 years.',
        sources: [
          { title: 'Government of Canada -- Amortization Period', url: 'https://www.canada.ca/en/financial-consumer-agency/services/mortgages/amortization-period.html' },
          { title: 'CMHC -- Amortization and Mortgage Insurance', url: 'https://www.cmhc-schl.gc.ca/consumers/home-buying/mortgage-loan-insurance-for-consumers/mortgage-loan-insurance-premiums' },
        ],
      };
    },

    () => {
      const conditionDays = pick(rng, [5, 7, 10]);
      return {
        title: 'Condition Period Strategy',
        description: `${client.name}'s offer includes a ${conditionDays}-day financing condition. What needs to happen during this period?`,
        context: `The offer has been accepted with a ${conditionDays}-day financing condition. The appraisal, final lender approval, and any outstanding documents must all be completed within this window.`,
        correct: {
          text: `Immediately submit the full application package, order the appraisal, and create a day-by-day checklist to ensure all conditions are met before the deadline`,
          feedback: `A ${conditionDays}-day condition period is tight. Immediately submitting documents, ordering the appraisal on day 1, and daily follow-up with the lender ensures nothing falls through the cracks.`,
        },
        wrongs: [
          { text: 'Wait for the lender to contact you with next steps', feedback: 'The mortgage agent must drive the process proactively. Waiting for the lender to initiate contact wastes valuable time in a tight condition period.' },
          { text: `${conditionDays} days is plenty of time -- submit documents within the first week`, feedback: `${conditionDays} business days is a very tight timeline. Appraisals alone can take 3-5 days. Every hour counts in the condition period.` },
          { text: 'Focus only on getting the appraisal done -- the rest can wait', feedback: 'Multiple conditions need to run in parallel: application submission, document collection, appraisal, and lender review. Sequential processing risks missing the deadline.' },
          { text: 'Request a condition extension immediately to give more time', feedback: 'Requesting an extension before attempting to meet the original deadline signals poor organization and can weaken the client\'s negotiating position.' },
          { text: 'The condition period automatically extends if the lender needs more time', feedback: 'Condition periods do not auto-extend. If conditions are not waived by the deadline, the buyer may lose the deal. Extensions require seller agreement.' },
        ],
        points: 20,
        explanation: 'Condition period management is a critical skill. Proactive scheduling, parallel processing of requirements, and daily follow-up are essential to meeting tight deadlines and protecting the client\'s purchase.',
        sources: [
          { title: 'FSRA -- Mortgage Brokering Standards of Practice', url: 'https://www.fsrao.ca/industry/mortgage-brokering/regulatory-framework/mortgage-brokering-standards-practice' },
          { title: 'CMHC -- Steps in the Home Buying Process', url: 'https://www.cmhc-schl.gc.ca/consumers/home-buying/buying-guides/home-buying-guide' },
        ],
      };
    },

    () => ({
      title: 'Title Insurance and Legal Protection',
      description: `What should ${client.name} understand about title insurance?`,
      context: `The lawyer has recommended title insurance for the property in ${property.location}. ${client.name} asks whether this is necessary and what it covers.`,
      correct: {
        text: 'Title insurance protects against title defects, fraud, survey issues, and certain zoning violations -- it is required by most lenders and is a one-time cost at closing',
        feedback: 'Title insurance is a one-time premium that protects both the lender and homeowner against risks that may not be discovered during the title search. Most lenders require it as a condition of the mortgage.',
      },
      wrongs: [
        { text: 'Title insurance is the same as home insurance and is unnecessary if they already have property insurance', feedback: 'Title insurance and home insurance are completely different products. Home insurance covers physical damage; title insurance covers ownership and legal issues.' },
        { text: 'Title insurance is an annual premium that continues for the life of the mortgage', feedback: 'Title insurance is a one-time payment at closing that provides coverage for as long as the owner or their heirs own the property.' },
        { text: 'Only the lender needs title insurance -- the buyer has no benefit', feedback: 'While lenders require a lender policy, homeowner title insurance provides valuable protection to the buyer against title fraud, survey disputes, and other ownership issues.' },
        { text: 'Title insurance is optional and rarely useful in modern transactions', feedback: 'Title fraud and undisclosed encumbrances remain real risks. Most lenders require title insurance, and it provides cost-effective protection for a one-time fee.' },
        { text: 'A full survey is always better and cheaper than title insurance', feedback: 'Surveys and title insurance serve different purposes. Surveys show physical boundaries; title insurance covers legal title issues, fraud, and more. Most lenders accept title insurance in lieu of a survey.' },
      ],
      points: 20,
      explanation: 'Title insurance is a standard closing requirement that protects against title defects, fraud, and encumbrances. It is a one-time cost that provides long-term protection for both lender and homeowner.',
      sources: [
        { title: 'Government of Canada -- Title Insurance', url: 'https://www.canada.ca/en/financial-consumer-agency/services/mortgages/costs-buying-home.html' },
        { title: 'FSRA -- Consumer Information on Title Insurance', url: 'https://www.fsrao.ca/industry/insurance/regulatory-framework/guidance/title-insurance' },
      ],
    }),
  ];

  return selectAndBuild(factories, 5, rng);
}
