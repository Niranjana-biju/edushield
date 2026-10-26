import { describe, it, expect } from 'vitest';
import { QuoteService } from '../services/quoteService';
import { DEFAULT_INSURANCE_PLANS } from '../config/plans';

describe('QuoteService Deterministic Rating Engine', () => {
  const plan = DEFAULT_INSURANCE_PLANS[1]; // Campus Shield Plus (baseRatePerLakh: 560, maxTuition: 30L)

  it('calculates deterministic base premium for a standard profile', () => {
    const breakdown = QuoteService.calculatePremium(plan, {
      annualTuition: 250000,
      courseYearsRemaining: 3,
      sponsorAge: 38, // <40 -> age factor 1.0
      sponsorPreExistingConditions: false,
      selectedDeductible: 0,
      selectedRiders: [],
    });

    // Base tuition exposure: 2,50,000 * 3 = 7,50,000
    expect(breakdown.baseTuitionSum).toBe(750000);
    // Base rate: (7,50,000 / 100,000) * 560 = 4200
    expect(breakdown.baseRateAmount).toBe(4200);
    expect(breakdown.sponsorAgeFactor).toBe(1.0);
    expect(breakdown.courseDurationFactor).toBe(1.0);
    expect(breakdown.healthRiskFactor).toBe(1.0);
    expect(breakdown.deductibleDiscount).toBe(0);
    // Net premium: 4200
    expect(breakdown.netAnnualPremium).toBe(4200);
    // 18% GST: 4200 * 0.18 = 756
    expect(breakdown.gstAmount).toBe(756);
    // Gross: 4200 + 756 = 4956
    expect(breakdown.grossAnnualPremium).toBe(4956);
  });

  it('applies sponsor age mortality loadings correctly for age > 50 and > 60', () => {
    const age55 = QuoteService.calculatePremium(plan, {
      annualTuition: 200000,
      courseYearsRemaining: 2,
      sponsorAge: 55,
      sponsorPreExistingConditions: false,
    });
    expect(age55.sponsorAgeFactor).toBe(1.35);

    const age65 = QuoteService.calculatePremium(plan, {
      annualTuition: 200000,
      courseYearsRemaining: 2,
      sponsorAge: 65,
      sponsorPreExistingConditions: false,
    });
    expect(age65.sponsorAgeFactor).toBe(1.6);
  });

  it('applies pre-existing condition loadings and deductible discounts', () => {
    const withConditions = QuoteService.calculatePremium(plan, {
      annualTuition: 200000,
      courseYearsRemaining: 2,
      sponsorAge: 35,
      sponsorPreExistingConditions: true,
      selectedDeductible: 10,
    });

    expect(withConditions.healthRiskFactor).toBe(1.25);
    expect(withConditions.deductibleDiscount).toBe(0.15); // 15% discount for 10% co-pay
  });

  it('enforces maximum tuition coverage limits defined in the plan', () => {
    const highFeeBreakdown = QuoteService.calculatePremium(plan, {
      annualTuition: 2000000, // 20 Lakhs/yr
      courseYearsRemaining: 4, // 80 Lakhs total
      sponsorAge: 40,
      sponsorPreExistingConditions: false,
    });

    // Plan cap is 30,00,000 INR
    expect(highFeeBreakdown.baseTuitionSum).toBe(plan.maxTuitionCoverage);
  });
});
