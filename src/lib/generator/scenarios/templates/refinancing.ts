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
import { randInt, randFloat } from '../../random';
import { calcIrdPenalty, calcThreeMonthInterest, MAX_REFINANCE_LTV } from '../../mortgage-math';

export function generateRefinancingScenarios(ctx: GeneratedContext, rng: () => number): Scenario[] {
  const { client, property, financials, computed } = ctx;

  const existingMortgage = financials.existing_debts.find((d) => d.type === 'Existing Mortgage');
  const mortgageBalance = existingMortgage?.balance ?? 280000;
  const homeValue = property.purchase_price;
  const equityAmount = homeValue - mortgageBalance;
  const renoAmount = Math.round(equityAmount * randFloat(rng, 0.3, 0.6) / 5000) * 5000;

  const yearsCompleted = randInt(rng, 2, 4);
  const remainingYears = 5 - yearsCompleted;
  const existingRate = randFloat(rng, 3.0, 4.5);
  const currentPostedRate = randFloat(rng, existingRate + 0.5, existingRate + 1.5);
  const irdPenalty = Math.round(calcIrdPenalty(mortgageBalance, existingRate, currentPostedRate, remainingYears * 12));
  const threeMonthPenalty = Math.round(calcThreeMonthInterest(mortgageBalance, existingRate));
  const higherPenalty = Math.max(irdPenalty, threeMonthPenalty);

  const totalNewMortgage = mortgageBalance + renoAmount;
  const refinanceLtv = Math.round((totalNewMortgage / homeValue) * 1000) / 10;
  const withinLimit = refinanceLtv <= MAX_REFINANCE_LTV;

  const consumerDebts = financials.existing_debts.filter((d) => d.type !== 'Existing Mortgage');
  const consumerTotal = consumerDebts.reduce((s, d) => s + d.balance, 0);
  const debtDesc = consumerDebts.map((d) => `${fmt(d.balance)} ${d.type}`).join(' and ');

  const retirementAge = randInt(rng, 58, 65);
  const yearsToRetirement = retirementAge - client.age;
  const recommendedAmort = Math.min(25, Math.max(15, Math.round(yearsToRetirement / 5) * 5));

  const factories: (() => ScenarioVariant)[] = [
    () => ({
      title: 'Needs Assessment: Equity Access Options',
      description: `${client.name} wants ${fmt(renoAmount)} for renovations. What do you assess first?`,
      context: `${client.name} wants to renovate (${fmt(renoAmount)} estimated). They are partway into a 5-year fixed mortgage. Their home is worth ${fmt(homeValue)} with ${fmt(mortgageBalance)} owing.`,
      correct: {
        text: `Compare refinance, HELOC, and second mortgage options based on ${client.name}'s specific needs and costs`,
        feedback: 'Evaluating multiple options (refinance, HELOC, second mortgage) allows you to recommend the best product based on total cost, flexibility, and the specific situation.',
      },
      wrongs: [
        { text: 'Recommend a cash-out refinance immediately', feedback: 'Jumping to a single solution without comparing options may not serve the client\'s best interest. Multiple equity access products should be evaluated.' },
        { text: 'Suggest a personal loan instead of using home equity', feedback: `Personal loans carry significantly higher interest rates than secured home equity products. For ${fmt(renoAmount)}, the interest savings with a secured product are substantial.` },
        { text: `Advise them to use their RRSP savings for the renovations`, feedback: `Using RRSP funds triggers tax consequences and reduces retirement savings. At ${client.age}, preserving retirement assets is important. Home equity is a more appropriate funding source.` },
        { text: 'Recommend using a line of credit against their investment portfolio', feedback: 'Investment-backed credit lines carry market risk and potential margin calls. Using home equity at lower rates is typically more stable and cost-effective for renovations.' },
        { text: 'Suggest they wait until their mortgage term ends to avoid any costs', feedback: `Waiting ${remainingYears} year${remainingYears > 1 ? 's' : ''} delays the renovations unnecessarily. A proper cost-benefit analysis may show that proceeding now is worthwhile.` },
      ],
      points: 20,
      explanation: 'When clients need equity access, always compare available products: refinance (new mortgage replacing existing), HELOC (revolving credit), and second mortgage (additional loan). Each has different costs, flexibility, and implications.',
      sources: [
        { title: 'Government of Canada -- Home Equity Lines of Credit', url: 'https://www.canada.ca/en/financial-consumer-agency/services/mortgages/home-equity-line-credit.html' },
        { title: 'CMHC -- Refinancing Your Mortgage', url: 'https://www.cmhc-schl.gc.ca/consumers/home-buying/mortgage-loan-insurance-for-consumers' },
      ],
    }),

    () => ({
      title: 'Prepayment Penalty Assessment',
      description: `${client.name} is ${yearsCompleted} years into a 5-year fixed at ${pct(existingRate)}. What penalty applies?`,
      context: `Current mortgage: ${fmt(mortgageBalance)} balance, 5-year fixed at ${pct(existingRate)}, ${yearsCompleted} years completed. Current posted rate for a ${remainingYears}-year fixed is ${pct(currentPostedRate)}.`,
      correct: {
        text: `Calculate the IRD penalty and compare to 3-months' interest -- the higher amount applies (approximately ${fmt(higherPenalty)})`,
        feedback: `For fixed-rate mortgages, the penalty is the GREATER of 3-months' interest (${fmt(threeMonthPenalty)}) or the IRD (${fmt(irdPenalty)}). The higher amount of ${fmt(higherPenalty)} applies.`,
      },
      wrongs: [
        { text: 'There is no penalty for refinancing a mortgage', feedback: 'Fixed-rate mortgages in Canada have prepayment penalties when broken before term. This is one of the most important costs to calculate and disclose.' },
        { text: 'The penalty is always exactly 3 months\' interest', feedback: 'Three months\' interest is the penalty for variable-rate mortgages. Fixed-rate mortgages use the greater of 3-months\' interest OR the IRD, which is often significantly higher.' },
        { text: 'Penalties only apply to variable rate mortgages', feedback: 'Both fixed and variable mortgages have prepayment penalties. Fixed-rate penalties (IRD) are typically much more expensive than variable-rate penalties.' },
        { text: `The penalty is a flat fee of $3,000 set by the lender`, feedback: 'Prepayment penalties are calculated, not flat fees. The formula uses either 3 months\' interest or the IRD, whichever is greater. The amount varies based on balance, rate, and remaining term.' },
        { text: 'The penalty equals 1% of the original mortgage amount', feedback: 'This is not how Canadian prepayment penalties are calculated. The formula involves comparing 3 months\' interest against the IRD and using the greater of the two.' },
      ],
      points: 20,
      explanation: `Fixed-rate prepayment penalties: the GREATER of 3-months' interest or the IRD. IRD = (contract rate - current comparable posted rate) x remaining term x balance. This must factor into the refinance cost-benefit analysis.`,
      sources: [
        { title: 'Government of Canada -- Prepayment Penalties', url: 'https://www.canada.ca/en/financial-consumer-agency/services/mortgages/prepay-mortgage.html' },
        { title: 'OSFI -- Guideline B-20: Prepayment Charges', url: 'https://www.osfi-bsif.gc.ca/en/guidance/guidance-library/residential-mortgage-underwriting-practices-procedures' },
      ],
    }),

    () => ({
      title: 'LTV and Refinance Eligibility',
      description: `Home worth ${fmt(homeValue)}, owing ${fmt(mortgageBalance)}, wants ${fmt(renoAmount)}. Assess the refinanced LTV.`,
      context: `${client.name} needs a total mortgage of ${fmt(totalNewMortgage)} (${fmt(mortgageBalance)} existing + ${fmt(renoAmount)} new) against a home valued at ${fmt(homeValue)}. Refinancing in Canada has an ${MAX_REFINANCE_LTV}% LTV maximum.`,
      correct: {
        text: `LTV is ${pct(refinanceLtv, 1)} (${fmt(totalNewMortgage)}/${fmt(homeValue)}) -- ${withinLimit ? `within the ${MAX_REFINANCE_LTV}% refinance maximum, eligible to proceed` : `exceeds the ${MAX_REFINANCE_LTV}% refinance limit, need to reduce the amount`}`,
        feedback: `Total new mortgage of ${fmt(totalNewMortgage)} / home value of ${fmt(homeValue)} = ${pct(refinanceLtv, 1)} LTV. This is ${withinLimit ? `within the maximum ${MAX_REFINANCE_LTV}% LTV for refinancing in Canada.` : `above the ${MAX_REFINANCE_LTV}% maximum. The amount must be reduced or a HELOC considered for the remainder.`}`,
      },
      wrongs: [
        { text: `LTV is ${pct((mortgageBalance / homeValue) * 100, 1)} (existing mortgage only) -- easily qualifies`, feedback: 'The LTV must account for the TOTAL new mortgage amount including the equity takeout, not just the existing balance.' },
        { text: `LTV limits don't apply to refinancing existing mortgages`, feedback: `LTV limits absolutely apply to refinancing. In Canada, the maximum LTV for a refinance is ${MAX_REFINANCE_LTV}% of the property's appraised value.` },
        { text: `LTV is ${pct(refinanceLtv + 8, 1)} -- calculation shows higher than expected`, feedback: `This calculation is incorrect. ${fmt(totalNewMortgage)} / ${fmt(homeValue)} = ${pct(refinanceLtv, 1)}, not ${pct(refinanceLtv + 8, 1)}. Always verify your LTV calculations carefully.` },
        { text: 'CMHC insurance can be added to allow an LTV above 80% for refinances', feedback: 'CMHC insurance is not available for refinances. Refinances are capped at 80% LTV as conventional mortgages only.' },
        { text: 'The LTV cap is 90% for refinances if the borrower has excellent credit', feedback: 'The 80% LTV cap for refinances is a regulatory limit that applies regardless of credit score. There are no exceptions based on creditworthiness.' },
      ],
      points: 20,
      explanation: `Refinance LTV maximum in Canada is ${MAX_REFINANCE_LTV}%. Calculate: (total new mortgage amount) / (appraised property value).`,
      sources: [
        { title: 'Government of Canada -- Refinancing Your Mortgage', url: 'https://www.canada.ca/en/financial-consumer-agency/services/mortgages/refinance-mortgage.html' },
        { title: 'CMHC -- Loan-to-Value Limits', url: 'https://www.cmhc-schl.gc.ca/professionals/project-funding-and-mortgage-financing/mortgage-loan-insurance' },
      ],
    }),

    () => ({
      title: 'Debt Consolidation Opportunity',
      description: `${client.name} also has ${debtDesc}. What do you advise?`,
      context: `Beyond the renovation funds, ${client.name} carries high-interest consumer debt totalling ${fmt(consumerTotal)}. The LTV at ${pct(refinanceLtv, 1)} ${withinLimit ? 'may leave room' : 'is tight but may allow some room'} to include additional amounts.`,
      correct: {
        text: 'Include the consumer debts in the refinance to reduce total interest cost, with a plan to avoid re-accumulating debt',
        feedback: `Consolidating ${fmt(consumerTotal)} of high-interest debt into the mortgage saves substantial interest. The key is coupling this with a plan to prevent re-accumulation.`,
      },
      wrongs: [
        { text: 'Ignore consumer debts -- focus only on the renovation funding', feedback: 'Overlooking a debt consolidation opportunity means missing a chance to save the client significant interest costs and improve their cash flow.' },
        { text: 'Suggest bankruptcy to clear the consumer debts', feedback: `Bankruptcy is an extreme measure completely disproportionate to ${fmt(consumerTotal)} in manageable consumer debt.` },
        { text: 'Recommend a separate debt consolidation loan at a different institution', feedback: 'A separate consolidation loan adds complexity and likely higher rates than folding the debt into the mortgage refinance at a much lower secured rate.' },
        { text: 'Consolidating unsecured debt into a mortgage is always a bad idea', feedback: 'While there are risks (converting unsecured to secured debt), the interest savings can be substantial. The key is proper counseling to prevent re-accumulation.' },
        { text: 'Wait until the debts are paid off before refinancing', feedback: 'The purpose of consolidation is to reduce interest costs now. Paying high-interest debt while sitting on low-cost home equity is financially inefficient.' },
      ],
      points: 20,
      explanation: 'Debt consolidation through refinancing can save significant interest. However, always discuss the risks of converting unsecured debt to secured debt and create a plan to prevent re-accumulation.',
      sources: [
        { title: 'Government of Canada -- Debt Consolidation', url: 'https://www.canada.ca/en/financial-consumer-agency/services/debt/consolidate-debts.html' },
        { title: 'Government of Canada -- Refinancing Your Mortgage', url: 'https://www.canada.ca/en/financial-consumer-agency/services/mortgages/refinance-mortgage.html' },
      ],
    }),

    () => ({
      title: 'Term and Amortization Strategy',
      description: `What term best suits ${client.name}'s refinancing goals and life situation?`,
      context: `${client.name} is ${client.age}, plans to retire at ${retirementAge}, and wants predictable payments. They value stability as a ${client.employment_type.toLowerCase()}.`,
      correct: {
        text: `5-year fixed with a ${recommendedAmort}-year amortization to align mortgage payoff closer to retirement at ${retirementAge}`,
        feedback: `A 5-year fixed provides stability ${client.name} values, and a ${recommendedAmort}-year amortization targets mortgage-free status around their retirement age.`,
      },
      wrongs: [
        { text: 'Shortest term possible to minimize total interest cost', feedback: 'While minimizing interest is important, the shortest term may result in payments that strain the budget. Cash flow management matters, especially approaching retirement.' },
        { text: `30-year amortization to minimize monthly payments`, feedback: `A 30-year amortization would extend the mortgage to age ${client.age + 30}. At ${client.age} and planning retirement at ${retirementAge}, carrying a mortgage deep into retirement is not ideal.` },
        { text: 'Variable rate for maximum flexibility and lowest payments', feedback: `${client.name} explicitly values stability as a ${client.employment_type.toLowerCase()} approaching retirement. Variable rate introduces payment uncertainty that conflicts with stated preferences.` },
        { text: '10-year fixed for the longest possible rate protection', feedback: `A 10-year fixed carries significantly higher rates and steep prepayment penalties. The rate premium may not be justified, and ${client.name} may want flexibility at renewal.` },
        { text: '1-year term to reassess annually as retirement approaches', feedback: 'Annual renewals create repeated uncertainty and potential rate increases. A 5-year term provides the stability the client seeks while retirement planning solidifies.' },
      ],
      points: 20,
      explanation: 'Term recommendations for clients approaching retirement should consider payoff timing relative to retirement date.',
      sources: [
        { title: 'Government of Canada -- Choosing a Mortgage', url: 'https://www.canada.ca/en/financial-consumer-agency/services/mortgages/choosing-mortgage.html' },
        { title: 'Government of Canada -- Amortization Period', url: 'https://www.canada.ca/en/financial-consumer-agency/services/mortgages/amortization-period.html' },
      ],
    }),

    () => ({
      title: 'HELOC vs Refinance Comparison',
      description: `Compare a HELOC and a full refinance for ${client.name}'s situation.`,
      context: `${client.name} needs ${fmt(renoAmount)} for renovations. Current mortgage balance: ${fmt(mortgageBalance)} at ${pct(existingRate)} with ${remainingYears} years remaining on term. Home value: ${fmt(homeValue)}. Available equity: ${fmt(equityAmount)}.`,
      correct: {
        text: 'A HELOC provides flexible revolving access at variable rates with interest-only minimums, while a refinance replaces the existing mortgage at potentially better terms but triggers prepayment penalties',
        feedback: `For ${client.name}, the HELOC avoids the ${fmt(higherPenalty)} prepayment penalty and provides flexible access to funds. However, the refinance may offer a lower blended rate. Total cost analysis over 5 years determines the better option.`,
      },
      wrongs: [
        { text: 'A HELOC and refinance are essentially the same product', feedback: 'A HELOC is revolving credit secured by home equity (variable rate, interest-only minimums). A refinance replaces the existing mortgage entirely. They have fundamentally different structures and costs.' },
        { text: 'HELOCs are unavailable if you already have a mortgage', feedback: 'HELOCs can be registered behind an existing first mortgage or as part of a readvanceable mortgage product. Having a mortgage does not disqualify HELOC access.' },
        { text: 'Always choose the refinance because fixed rates are better', feedback: 'The choice depends on the specific situation: penalty costs, amount needed, repayment timeline, and rate environment. Sometimes a HELOC is more cost-effective.' },
        { text: 'A HELOC always has lower total costs than refinancing', feedback: 'Not necessarily. HELOC rates are typically prime + a margin, while refinance rates may be lower. The penalty cost and usage pattern determine which option costs less overall.' },
        { text: 'HELOCs are limited to 50% of home value', feedback: 'HELOCs can go up to 65% of home value as a standalone product, or combined with a mortgage to a total of 80% LTV under a readvanceable structure.' },
      ],
      points: 20,
      explanation: 'Comparing HELOC vs refinance requires analyzing: prepayment penalties, interest rate differences, required payment structure, flexibility needs, and total cost over the planned usage period.',
      sources: [
        { title: 'Government of Canada -- Home Equity Lines of Credit', url: 'https://www.canada.ca/en/financial-consumer-agency/services/mortgages/home-equity-line-credit.html' },
        { title: 'Government of Canada -- Refinancing Your Mortgage', url: 'https://www.canada.ca/en/financial-consumer-agency/services/mortgages/refinance-mortgage.html' },
      ],
    }),

    () => ({
      title: 'Blend-and-Extend Option',
      description: `Could a blend-and-extend avoid penalties for ${client.name}?`,
      context: `${client.name}'s current lender offers blend-and-extend: blend the existing ${pct(existingRate)} rate with current rates for a new 5-year term. The penalty of ${fmt(higherPenalty)} would be avoided but the blended rate may be higher than market.`,
      correct: {
        text: 'Compare the total cost of blend-and-extend (no penalty, potentially higher blended rate) against breaking and refinancing (penalty cost, potentially lower new rate) over the new term',
        feedback: `The blend-and-extend avoids the ${fmt(higherPenalty)} penalty but the blended rate may cost more over 5 years. A detailed comparison of total interest cost under each option determines the best path.`,
      },
      wrongs: [
        { text: 'Blend-and-extend is always the best option because it avoids penalties', feedback: 'Avoiding the penalty is one factor, but the blended rate may result in higher total interest over the new term. Total cost analysis is essential.' },
        { text: 'Blend-and-extend options are not available from Canadian lenders', feedback: 'Many Canadian lenders, particularly the major banks, offer blend-and-extend options. It is a common retention strategy.' },
        { text: 'The blended rate will always be lower than the current market rate', feedback: 'The blended rate depends on the existing rate, current rate, and remaining term. It can be above or below the current market rate depending on the specific numbers.' },
        { text: 'Always break the mortgage and refinance to get the lowest possible rate', feedback: 'Breaking the mortgage incurs a penalty that must be recovered through the lower rate. If the penalty is large relative to the rate savings, blend-and-extend may cost less overall.' },
        { text: 'A blend-and-extend resets the amortization to 25 years automatically', feedback: 'The amortization terms of a blend-and-extend are negotiable. Some lenders may extend, but it is not automatic and should be specifically discussed with the client.' },
      ],
      points: 20,
      explanation: 'Blend-and-extend avoids prepayment penalties by blending the existing rate with current rates for a new term. The total cost comparison over the full term determines whether this or breaking and refinancing is more cost-effective.',
      sources: [
        { title: 'Government of Canada -- Renewing Your Mortgage', url: 'https://www.canada.ca/en/financial-consumer-agency/services/mortgages/renew-mortgage.html' },
        { title: 'Government of Canada -- Prepayment Penalties', url: 'https://www.canada.ca/en/financial-consumer-agency/services/mortgages/prepay-mortgage.html' },
      ],
    }),

    () => ({
      title: 'Appraisal Considerations',
      description: `An appraisal shows the property at ${fmt(homeValue)}. How does this affect the refinance?`,
      context: `${client.name} expected the home to be worth more. The appraised value of ${fmt(homeValue)} sets the maximum refinance at ${MAX_REFINANCE_LTV}% LTV = ${fmt(Math.round(homeValue * MAX_REFINANCE_LTV / 100))}. Current mortgage: ${fmt(mortgageBalance)}.`,
      correct: {
        text: `The maximum available equity for takeout is ${fmt(Math.round(homeValue * MAX_REFINANCE_LTV / 100) - mortgageBalance)} (${MAX_REFINANCE_LTV}% of ${fmt(homeValue)} minus ${fmt(mortgageBalance)}). Adjust the refinance amount to fit within this limit`,
        feedback: `Maximum new mortgage: ${fmt(Math.round(homeValue * MAX_REFINANCE_LTV / 100))}. After paying out the existing ${fmt(mortgageBalance)}, available equity is ${fmt(Math.round(homeValue * MAX_REFINANCE_LTV / 100) - mortgageBalance)}. The refinance plan must work within these constraints.`,
      },
      wrongs: [
        { text: 'Challenge the appraisal and request the lender use a higher value', feedback: 'While appraisal reviews are possible with evidence of comparable sales, challenging without basis wastes time. Work with the appraised value and adjust the plan accordingly.' },
        { text: 'Use the municipal property assessment value instead of the appraisal', feedback: 'Municipal assessments are for tax purposes and often differ significantly from market value. Lenders require a professional appraisal for refinancing decisions.' },
        { text: 'The appraisal does not affect the refinance amount', feedback: 'The appraisal directly determines the maximum LTV and therefore the maximum mortgage amount. It is a critical factor in every refinance.' },
        { text: 'Get a second appraisal from a different appraiser to get a higher value', feedback: 'Lenders typically require their own approved appraisers. Shopping for a favorable appraisal is problematic and may be flagged as suspicious by the lender.' },
        { text: 'Proceed with the original plan and ask the lender to make an exception on LTV', feedback: 'LTV limits for refinancing are regulatory, not discretionary. Lenders cannot make exceptions to exceed the 80% maximum for conventional refinances.' },
      ],
      points: 20,
      explanation: `The appraisal establishes the property value for LTV calculations. Maximum refinance is ${MAX_REFINANCE_LTV}% LTV. When the appraisal comes in lower than expected, the refinance plan must be adjusted accordingly.`,
      sources: [
        { title: 'Government of Canada -- Refinancing Your Mortgage', url: 'https://www.canada.ca/en/financial-consumer-agency/services/mortgages/refinance-mortgage.html' },
        { title: 'CMHC -- Loan-to-Value Limits', url: 'https://www.cmhc-schl.gc.ca/professionals/project-funding-and-mortgage-financing/mortgage-loan-insurance' },
      ],
    }),
  ];

  return selectAndBuild(factories, 5, rng);
}
