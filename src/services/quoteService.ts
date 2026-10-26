import {
  InsurancePlan,
  Quote,
  RateCalculationBreakdown,
  RiderConfig
} from '../types/insurance';
import { DEFAULT_INSURANCE_PLANS } from '../config/plans';

export interface QuoteInput {
  guardianId: string;
  studentId: string;
  planId: string;
  annualTuition: number;
  courseYearsRemaining: number;
  sponsorAge: number;
  sponsorPreExistingConditions: boolean;
  selectedDeductible?: number;
  selectedRiders?: RiderConfig[];
}

export class QuoteService {
  /**
   * Deterministic actuarial demonstration premium calculation
   * Transparently discloses all multipliers, loadings, discounts and statutory taxes
   */
  public static calculatePremium(
    plan: InsurancePlan,
    input: {
      annualTuition: number;
      courseYearsRemaining: number;
      sponsorAge: number;
      sponsorPreExistingConditions: boolean;
      selectedDeductible?: number;
      selectedRiders?: RiderConfig[];
    }
  ): RateCalculationBreakdown {
    const {
      annualTuition,
      courseYearsRemaining,
      sponsorAge,
      sponsorPreExistingConditions,
      selectedDeductible = plan.deductiblePercentage,
      selectedRiders = [],
    } = input;

    // 1. Total education exposure
    const baseTuitionSum = Math.min(annualTuition * courseYearsRemaining, plan.maxTuitionCoverage);

    // 2. Base rate calculation (per ₹1,00,000 INR sum insured)
    const baseRateAmount = (baseTuitionSum / 100000) * plan.baseRatePerLakh;

    // 3. Sponsor age risk factor (actuarial mortality / morbidity gradient)
    let sponsorAgeFactor = 1.0;
    if (sponsorAge > 60) {
      sponsorAgeFactor = 1.6;
    } else if (sponsorAge > 50) {
      sponsorAgeFactor = 1.35;
    } else if (sponsorAge > 40) {
      sponsorAgeFactor = 1.15;
    }

    // 4. Course duration duration factor
    let courseDurationFactor = 1.0;
    if (courseYearsRemaining <= 2) {
      courseDurationFactor = 0.95; // Short horizon discount
    } else if (courseYearsRemaining >= 5) {
      courseDurationFactor = 1.1; // Extended tenure risk loading
    }

    // 5. Pre-existing health conditions risk loading
    const healthRiskFactor = sponsorPreExistingConditions ? 1.25 : 1.0;

    // 6. Deductible co-pay discount
    let deductibleDiscount = 0;
    if (selectedDeductible >= 10) {
      deductibleDiscount = 0.15; // 15% discount
    } else if (selectedDeductible >= 5) {
      deductibleDiscount = 0.08; // 8% discount
    }

    // 7. Rider addons
    const riderAddonsTotal = selectedRiders.reduce((acc, rider) => acc + (rider.annualFee || 0), 0);

    // 8. Net annual premium calculation
    const coreRiskPremium = baseRateAmount * sponsorAgeFactor * courseDurationFactor * healthRiskFactor * (1 - deductibleDiscount);
    const netAnnualPremium = Math.round(coreRiskPremium + riderAddonsTotal);

    // 9. Statutory Indian GST (18%)
    const gstAmount = Math.round(netAnnualPremium * 0.18);

    // 10. Gross annual premium payable
    const grossAnnualPremium = netAnnualPremium + gstAmount;

    const calculationAssumptions = [
      `Sample actuarial base rate: ₹${plan.baseRatePerLakh} per ₹1 Lakh sum insured (${plan.name})`,
      `Exposure Cap: ₹${(baseTuitionSum / 100000).toFixed(1)} Lakhs based on ${courseYearsRemaining} years remaining @ ₹${(annualTuition / 100000).toFixed(1)}L/yr`,
      `Sponsor Age factor: ${sponsorAgeFactor}x applied for age ${sponsorAge}`,
      `Health Declaration: ${sponsorPreExistingConditions ? 'Pre-existing condition loading (+25%)' : 'Standard healthy sponsor baseline (1.0x)'}`,
      `Deductible selected: ${selectedDeductible}% (${deductibleDiscount > 0 ? `-${(deductibleDiscount * 100).toFixed(0)}% co-pay discount` : 'Full 100% first-rupee claim coverage'})`,
      `Statutory Goods and Services Tax (GST): 18% computed per Indian tax code (₹${gstAmount.toLocaleString('en-IN')})`,
      'Disclaimer: Rates are for demonstration and not an actuarial pricing offer. Licensed underwriter validation required.'
    ];

    return {
      baseTuitionSum,
      baseRateAmount: Math.round(baseRateAmount),
      sponsorAgeFactor,
      courseDurationFactor,
      healthRiskFactor,
      deductibleDiscount,
      riderAddonsTotal,
      netAnnualPremium,
      gstAmount,
      grossAnnualPremium,
      calculationAssumptions,
    };
  }

  /**
   * Generates a fully calculated quote entity
   */
  public static createQuote(input: QuoteInput): Quote {
    const plan = DEFAULT_INSURANCE_PLANS.find(p => p.id === input.planId) || DEFAULT_INSURANCE_PLANS[0];
    const rateBreakdown = this.calculatePremium(plan, input);
    
    // Expiry date is 30 days from generation
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
    const quoteNumber = `QT-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`;

    return {
      id: `quote_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      quoteNumber,
      guardianId: input.guardianId,
      studentId: input.studentId,
      planId: plan.id,
      annualTuition: input.annualTuition,
      courseYearsRemaining: input.courseYearsRemaining,
      sumInsured: rateBreakdown.baseTuitionSum,
      selectedDeductible: input.selectedDeductible ?? plan.deductiblePercentage,
      selectedRiders: input.selectedRiders || [],
      sponsorAge: input.sponsorAge,
      sponsorPreExistingConditions: input.sponsorPreExistingConditions,
      rateBreakdown,
      status: 'generated',
      expiresAt,
      createdAt: new Date().toISOString(),
    };
  }

  /**
   * Compares all plans for a given education profile
   */
  public static comparePlans(input: Omit<QuoteInput, 'planId'>) {
    return DEFAULT_INSURANCE_PLANS.map(plan => {
      const breakdown = this.calculatePremium(plan, input);
      return {
        plan,
        breakdown,
        isEligible: input.annualTuition * input.courseYearsRemaining <= plan.maxTuitionCoverage * 1.5,
      };
    });
  }
}
