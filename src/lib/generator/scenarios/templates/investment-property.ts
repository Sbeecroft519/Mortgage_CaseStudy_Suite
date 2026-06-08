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
import { randInt, pick } from '../../random';

export function generateInvestmentPropertyScenarios(ctx: GeneratedContext, rng: () => number): Scenario[] {
  const { client, property, financials, computed } = ctx;
  const c = computed;

  const unitCount = property.type.includes('Duplex') ? 2 : 1;
  const rentPerUnit = randInt(rng, 1800, 3200);
  const grossRent = rentPerUnit * unitCount;
  const rentalOffset50 = Math.round(grossRent * 0.5);

  const mortgagePayment = Math.round(c.monthlyMortgagePayment);
  const propTax = c.propertyTax;
  const insurance = randInt(rng, 150, 250);
  const maintenance = randInt(rng, 200, 400);
  const vacancy = randInt(rng, 200, 350);
  const totalCosts = mortgagePayment + propTax + insurance + maintenance + vacancy;
  const netCashFlow = grossRent - totalCosts;

  const primaryMortgage = financials.existing_debts.find((d) => d.type === 'Primary Residence Mortgage');
  const primaryPayment = primaryMortgage?.monthly_payment ?? 2200;

  const factories: (() => ScenarioVariant)[] = [
    () => ({
      title: 'Down Payment Requirements',
      description: `What is the minimum down payment for this investment ${property.type.toLowerCase()}?`,
      context: `${client.name} wants to purchase a ${fmt(property.purchase_price)} ${property.type.toLowerCase()} in ${property.location} that they will NOT occupy -- it is purely a rental investment property.`,
      correct: {
        text: `20% minimum (${fmt(Math.round(property.purchase_price * 0.20))}) for a non-owner-occupied rental property`,
        feedback: 'Non-owner-occupied investment properties require a minimum 20% down payment. CMHC mortgage default insurance is not available for investment properties, so conventional financing at 20%+ is required.',
      },
      wrongs: [
        { text: '5% down payment, same as a primary residence', feedback: 'The 5% minimum only applies to owner-occupied primary residences. Investment properties have different and higher down payment requirements.' },
        { text: '10% with CMHC insurance available for rental properties', feedback: 'CMHC does not provide mortgage default insurance for non-owner-occupied investment properties. The minimum 20% conventional down payment is required.' },
        { text: '25% minimum for all multi-unit investment properties', feedback: 'While some lenders may require 25% for certain property types, the regulatory minimum for 1-2 unit residential investment properties is 20%.' },
        { text: '15% with a rental income offset reducing the required down payment', feedback: 'Expected rental income does not reduce the minimum down payment requirement. The 20% minimum for investment properties is fixed regardless of rental income potential.' },
        { text: 'The same down payment rules apply to investment and primary residence properties', feedback: 'Investment properties have stricter requirements: minimum 20% down, no CMHC insurance available, and potentially higher qualifying rates.' },
      ],
      points: 20,
      explanation: 'Non-owner-occupied investment properties require minimum 20% down payment. CMHC insurance is unavailable for these properties.',
      sources: [
        { title: 'CMHC -- Mortgage Loan Insurance for Investment Properties', url: 'https://www.cmhc-schl.gc.ca/professionals/project-funding-and-mortgage-financing/mortgage-loan-insurance' },
        { title: 'Government of Canada -- Down Payment Requirements', url: 'https://www.canada.ca/en/financial-consumer-agency/services/mortgages/down-payment.html' },
      ],
    }),

    () => ({
      title: 'Rental Income Qualification',
      description: `How should the expected ${fmt(grossRent)}/month rental income be used for qualification?`,
      context: `Market analysis shows ${unitCount > 1 ? `both units can generate approximately ${fmt(rentPerUnit)} each (${fmt(grossRent)} total monthly)` : `the property can generate ${fmt(grossRent)} monthly in rent`}. ${client.name} needs this income to qualify for the investment mortgage.`,
      correct: {
        text: `Use 50% of gross rental income (${fmt(rentalOffset50)}/month) as an offset to the property's carrying costs, per standard lender guidelines`,
        feedback: 'Most Canadian lenders use a rental offset of 50% of gross rents to account for vacancy, maintenance, and operating costs. Some lenders use up to 80% with strong rental history documentation.',
      },
      wrongs: [
        { text: `Add 100% of the ${fmt(grossRent)} rental income to their qualifying income`, feedback: 'Lenders never use 100% of gross rental income. Vacancy and operating costs must be factored in through a rental offset or add-back calculation.' },
        { text: 'Rental income cannot be used for mortgage qualification purposes', feedback: 'Rental income is a key factor in investment property qualification. Lenders have established methods for incorporating it into debt service calculations.' },
        { text: `Only count rental income if they have 5+ years of landlord experience`, feedback: 'Landlord experience is not a prerequisite for using rental income in qualification. However, an appraisal with rental market analysis is typically required.' },
        { text: `Use 25% of gross rent as the most conservative offset approach`, feedback: 'While conservative lending exists, the standard offset is 50%. Using only 25% is below industry norms and would unfairly penalize the borrower\'s qualification.' },
        { text: 'Net rental income after all expenses should be added directly to the borrower\'s income', feedback: 'Lenders use standardized offset formulas (50-80% of gross rent) rather than actual net income, because actual expenses can be manipulated or estimated inaccurately.' },
      ],
      points: 20,
      explanation: 'Canadian lenders typically use 50-80% of gross rental income for qualification. A 50% offset is the most conservative and common approach.',
      sources: [
        { title: 'CMHC -- Rental Income for Qualification', url: 'https://www.cmhc-schl.gc.ca/professionals/project-funding-and-mortgage-financing/mortgage-loan-insurance/calculating-gds-tds' },
        { title: 'OSFI -- Guideline B-20: Rental Income', url: 'https://www.osfi-bsif.gc.ca/en/guidance/guidance-library/residential-mortgage-underwriting-practices-procedures' },
      ],
    }),

    () => ({
      title: 'Cash Flow Analysis',
      description: `Monthly costs total ${fmt(totalCosts)} against ${fmt(grossRent)} gross rent. Advise on this ${netCashFlow < 0 ? 'negative' : 'positive'} cash flow.`,
      context: `Estimated monthly costs: Mortgage ${fmt(mortgagePayment)}, property tax ${fmt(propTax)}, insurance ${fmt(insurance)}, maintenance reserve ${fmt(maintenance)}, vacancy reserve ${fmt(vacancy)}. Total: ${fmt(totalCosts)}. Gross rent: ${fmt(grossRent)}. Net monthly: ${netCashFlow >= 0 ? fmt(netCashFlow) : '-' + fmt(Math.abs(netCashFlow))}.`,
      correct: {
        text: `Analyze total return: equity buildup, appreciation potential, tax benefits, and net cash position to determine if the ${netCashFlow >= 0 ? 'overall investment' : fmt(Math.abs(netCashFlow)) + '/month shortfall'} is acceptable`,
        feedback: `A holistic analysis includes principal paydown (equity buildup), potential appreciation in the ${property.location} market, and tax-deductible expenses. The monthly cash flow is only one component of total return.`,
      },
      wrongs: [
        { text: `Do not proceed -- ${netCashFlow < 0 ? 'negative' : 'marginal'} cash flow means it is a bad investment`, feedback: 'Cash flow alone does not determine investment quality. Total return includes equity buildup, appreciation, and tax benefits that may far exceed the monthly position.' },
        { text: `Raise rents to ${fmt(totalCosts + 500)} to achieve strong positive cash flow`, feedback: 'Rents are market-driven and cannot be arbitrarily set above market rates. Overpricing leads to vacancy, which is worse than a small cash flow gap.' },
        { text: 'Extend amortization to 35 years to reduce monthly mortgage payment', feedback: 'Maximum amortization for uninsured mortgages in Canada is 25 years (30 years with some lenders). 35 years is not available for investment properties.' },
        { text: 'Eliminate the vacancy reserve since good tenants never leave', feedback: 'Vacancy is inevitable over the long term. Responsible investment analysis must include a vacancy allowance (typically 3-5% of gross rent) to avoid financial surprises.' },
        { text: 'The investment only makes sense if monthly cash flow exceeds $500', feedback: 'Cash flow targets are subjective and depend on the investor\'s goals. Many successful real estate investments have modest cash flow but strong total returns through equity and appreciation.' },
      ],
      points: 20,
      explanation: 'Investment property analysis must look beyond monthly cash flow. Total return = cash flow + principal paydown + appreciation + tax benefits.',
      sources: [
        { title: 'CRA -- Rental Income and Expenses', url: 'https://www.canada.ca/en/revenue-agency/services/tax/businesses/topics/rental-income.html' },
        { title: 'CMHC -- Rental Market Report', url: 'https://www.cmhc-schl.gc.ca/professionals/housing-markets-data-and-research/market-reports/rental-market-reports-major-centres' },
      ],
    }),

    () => ({
      title: 'Multi-Property Debt Service',
      description: 'How does the existing primary residence mortgage affect this application?',
      context: `${client.name} already carries a ${primaryMortgage ? fmt(primaryMortgage.balance) : '$420,000'} mortgage (${fmt(primaryPayment)}/month) on their primary residence. Combined income is ${fmt(client.annual_income)}/year (${fmt(Math.round(c.monthlyGrossIncome))}/month gross).`,
      correct: {
        text: 'Calculate combined TDS including both properties plus all debts, ensuring it stays within lender guidelines',
        feedback: 'Total TDS must include: primary residence costs, investment property costs (offset by rental income), and all other debts. Most lenders cap TDS at 44% for investment properties.',
      },
      wrongs: [
        { text: 'The existing mortgage does not affect the investment property application', feedback: 'All existing debts, including the primary residence mortgage, factor into TDS calculations for the new property.' },
        { text: 'Advise them to pay off their primary residence first before buying investment property', feedback: 'Paying off a low-rate mortgage before investing may not be optimal. If they qualify under debt service guidelines, carrying both properties can build wealth faster.' },
        { text: 'Apply at a different lender to keep the mortgages separate and avoid combined TDS review', feedback: 'All lenders review the borrower\'s complete credit bureau which shows all debts. Using a different lender does not hide existing obligations.' },
        { text: 'Only the investment property mortgage counts in the TDS calculation', feedback: 'TDS includes ALL debts: primary residence mortgage, investment property costs, car payments, credit cards, and any other obligations. Nothing is excluded.' },
        { text: 'If the rental income covers the investment property costs, the TDS is unaffected', feedback: 'Even with a full rental offset, the calculation methodology still includes the investment property in TDS. The offset reduces but does not eliminate the impact.' },
      ],
      points: 20,
      explanation: 'Multi-property debt service analysis requires calculating combined TDS across all properties and debts. The rental offset helps reduce the investment property\'s impact on ratios.',
      sources: [
        { title: 'CMHC -- Calculating GDS and TDS Ratios', url: 'https://www.cmhc-schl.gc.ca/professionals/project-funding-and-mortgage-financing/mortgage-loan-insurance/calculating-gds-tds' },
        { title: 'OSFI -- Guideline B-20: Multi-Property Assessment', url: 'https://www.osfi-bsif.gc.ca/en/guidance/guidance-library/residential-mortgage-underwriting-practices-procedures' },
      ],
    }),

    () => ({
      title: 'Tax and Professional Referral',
      description: `What tax-related guidance should you provide to ${client.name}?`,
      context: `${client.name} asks about the tax implications of owning a rental property, including deductible expenses, rental income reporting, and capital gains.`,
      correct: {
        text: 'Recommend consulting a tax professional, noting that mortgage interest, property taxes, insurance, and maintenance may be deductible for rental properties',
        feedback: 'Providing general awareness of potential deductions while referring to a qualified tax professional is the appropriate approach. It shows knowledge without overstepping your professional scope.',
      },
      wrongs: [
        { text: 'Provide detailed tax advice on all deductions and capital gains calculations', feedback: 'Mortgage agents are not licensed to provide specific tax advice. Overstepping professional boundaries exposes both you and the client to risk.' },
        { text: 'Tell them all expenses are 100% deductible against rental income', feedback: 'This oversimplification is incorrect. Not all expenses are fully deductible, and the rules require professional tax advice.' },
        { text: 'Tax considerations are irrelevant to the mortgage process', feedback: 'While mortgage agents don\'t provide tax advice, understanding that tax implications affect the client\'s total return and decision-making is important.' },
        { text: 'Advise them to claim the investment property as their primary residence for tax purposes', feedback: 'Misrepresenting property use to CRA is tax fraud. The property\'s actual use must be accurately reported. This advice is unethical and illegal.' },
        { text: 'All rental expenses are non-deductible in Canada for individual landlords', feedback: 'This is incorrect. Eligible rental expenses including mortgage interest, property taxes, insurance, repairs, and management fees can be deducted against rental income.' },
      ],
      points: 20,
      explanation: 'Mortgage agents should have general awareness of rental property tax implications but must refer clients to qualified tax professionals for specific advice.',
      sources: [
        { title: 'CRA -- Rental Income and Expenses', url: 'https://www.canada.ca/en/revenue-agency/services/tax/businesses/topics/rental-income.html' },
        { title: 'FSRA -- Mortgage Agent Scope of Practice', url: 'https://www.fsrao.ca/industry/mortgage-brokering/regulatory-framework/mortgage-brokering-standards-practice' },
      ],
    }),

    () => {
      const capRate = Math.round((grossRent * 12 - (propTax + insurance + maintenance + vacancy) * 12) / property.purchase_price * 10000) / 100;
      return {
        title: 'Cap Rate and Market Analysis',
        description: `The cap rate on this property calculates to approximately ${capRate}%. How should ${client.name} interpret this?`,
        context: `Net operating income: ${fmt((grossRent - propTax - insurance - maintenance - vacancy) * 12)}/year. Purchase price: ${fmt(property.purchase_price)}. The local market in ${property.location} has average cap rates of ${capRate < 5 ? '4-6%' : '5-7%'} for similar properties.`,
        correct: {
          text: `A ${capRate}% cap rate is ${capRate < 4 ? 'below' : capRate < 6 ? 'within' : 'above'} the local market range. Compare to alternative investments and consider both current yield and appreciation potential in ${property.location}`,
          feedback: `Cap rate measures the property's unlevered yield. At ${capRate}%, compared against local averages and alternative investments, ${client.name} can assess whether the return justifies the investment risk and management effort.`,
        },
        wrongs: [
          { text: 'Cap rate is not relevant for residential investment properties', feedback: 'Cap rate is a fundamental metric for comparing investment properties. It allows comparison across different property types, locations, and price points.' },
          { text: 'A higher cap rate always means a better investment', feedback: 'Higher cap rates often indicate higher risk, less desirable locations, or properties requiring more management. Cap rate alone does not determine investment quality.' },
          { text: 'Cap rates should only be calculated after mortgage payments are included', feedback: 'Cap rate specifically excludes financing costs (mortgage payments). It measures the property\'s return independent of how it is financed, allowing apples-to-apples comparison.' },
          { text: 'Only commercial properties use cap rates -- residential uses ROI instead', feedback: 'Cap rate is used across all property types including residential. It provides a standardized way to compare investment property yields.' },
          { text: `The cap rate guarantees a ${capRate}% annual return on investment`, feedback: 'Cap rate is a snapshot estimate based on current income and expenses. Actual returns vary with occupancy, expense changes, maintenance needs, and market conditions.' },
        ],
        points: 20,
        explanation: 'Cap rate (capitalization rate) = Net Operating Income / Purchase Price. It provides a standardized metric for comparing investment properties independent of financing structure.',
        sources: [
          { title: 'CMHC -- Rental Market Report', url: 'https://www.cmhc-schl.gc.ca/professionals/housing-markets-data-and-research/market-reports/rental-market-reports-major-centres' },
          { title: 'CRA -- Rental Income and Expenses', url: 'https://www.canada.ca/en/revenue-agency/services/tax/businesses/topics/rental-income.html' },
        ],
      };
    },

    () => ({
      title: 'Insurance Requirements for Investment Property',
      description: `What insurance considerations apply to ${client.name}'s investment property?`,
      context: `${client.name} asks about insurance requirements for the ${property.type.toLowerCase()} in ${property.location}. The property will be tenant-occupied and they will not live there.`,
      correct: {
        text: 'Landlord insurance (not standard homeowner insurance) is required, including property damage, liability, and rental income loss coverage. The lender will require proof before closing',
        feedback: 'Investment properties require specialized landlord insurance that covers risks specific to rental properties: tenant damage, liability from tenant injuries, and loss of rental income during repairs.',
      },
      wrongs: [
        { text: 'Standard homeowner insurance covers investment properties the same way', feedback: 'Standard homeowner policies do not cover rental properties. Using homeowner insurance on a rental property can void the policy if a claim is made.' },
        { text: 'The tenant\'s renter\'s insurance covers the landlord\'s risks', feedback: 'Tenant insurance only covers the tenant\'s personal belongings and liability. It does not protect the landlord\'s building, liability, or rental income.' },
        { text: 'Insurance is optional for investment properties', feedback: 'All lenders require proof of adequate insurance as a condition of the mortgage. Operating without insurance also exposes the landlord to catastrophic financial risk.' },
        { text: 'The same insurance policy can cover both the primary residence and the investment property', feedback: 'Each property typically requires its own separate insurance policy. Bundling may offer discounts but the investment property needs its own landlord-specific coverage.' },
        { text: 'Only fire insurance is required by the lender', feedback: 'While fire insurance is a minimum lender requirement, comprehensive landlord coverage including liability and rental income loss is strongly recommended and often required.' },
      ],
      points: 20,
      explanation: 'Investment properties require landlord-specific insurance covering property damage, landlord liability, and rental income loss. Standard homeowner policies do not adequately cover rental properties.',
      sources: [
        { title: 'Government of Canada -- Home Insurance', url: 'https://www.canada.ca/en/financial-consumer-agency/services/insurance/home.html' },
        { title: 'CMHC -- Renting Your Property', url: 'https://www.cmhc-schl.gc.ca/consumers/renting-a-home' },
      ],
    }),

    () => ({
      title: 'Tenant Management Planning',
      description: `What should ${client.name} consider about tenant management before purchasing?`,
      context: `${client.name} is a first-time landlord considering this investment. They are unsure about tenant screening, lease agreements, and management responsibilities.`,
      correct: {
        text: 'Discuss the choice between self-management and hiring a property manager (typically 8-12% of gross rent), and the importance of thorough tenant screening before the purchase decision',
        feedback: 'First-time landlords should understand the management commitment before purchasing. A property manager (8-12% of rent) reduces workload but impacts cash flow. Proper tenant screening (credit check, references, employment verification) prevents costly issues.',
      },
      wrongs: [
        { text: 'Tenant management is not relevant to the mortgage process', feedback: 'While not directly a mortgage consideration, a client\'s ability to manage the property affects their financial success and ability to maintain mortgage payments. Good agents discuss the full picture.' },
        { text: 'All investment property buyers are required to hire a property management company', feedback: 'Property management is optional. Many landlords self-manage successfully. The decision depends on time availability, proximity, and management skill.' },
        { text: 'Suggest renting to friends or family to avoid screening', feedback: 'Renting to friends or family without proper screening creates conflict and may result in missed payments. Professional tenant screening should always be conducted.' },
        { text: 'Tenant issues are rare and planning for them is unnecessary', feedback: 'Tenant issues (late payments, damage, disputes) are common in property management. Planning for these scenarios before purchasing is responsible investment practice.' },
        { text: 'The real estate agent handles all tenant management after the purchase', feedback: 'Real estate agents facilitate the purchase transaction, not ongoing property management. Landlord responsibilities begin at closing and continue throughout ownership.' },
      ],
      points: 20,
      explanation: 'Property management planning is an essential part of the investment property decision. Understanding the time commitment, costs of professional management, and importance of tenant screening helps ensure investment success.',
      sources: [
        { title: 'CMHC -- Renting Your Property', url: 'https://www.cmhc-schl.gc.ca/consumers/renting-a-home' },
        { title: 'Government of Canada -- Rights and Responsibilities of Landlords', url: 'https://www.canada.ca/en/financial-consumer-agency/services/mortgages.html' },
      ],
    }),
  ];

  return selectAndBuild(factories, 5, rng);
}
