import {
  Quote,
  EducationPolicy,
  PolicyBenefit,
  Student,
  University
} from '../types/insurance';
import { DEFAULT_INSURANCE_PLANS } from '../config/plans';

export class PolicyService {
  /**
   * Issues an Education Policy from a generated Quote (PolicyCenter workflow)
   */
  public static issuePolicy(params: {
    quote: Quote;
    student: Student;
    university: University;
    guardianName: string;
    paymentFrequency?: 'annual' | 'semi-annual' | 'quarterly';
  }): EducationPolicy {
    const { quote, student, university, guardianName, paymentFrequency = 'annual' } = params;
    const plan = DEFAULT_INSURANCE_PLANS.find(p => p.id === quote.planId) || DEFAULT_INSURANCE_PLANS[0];

    const now = new Date();
    const effectiveDate = now.toISOString();
    
    // Policy duration matches course years remaining
    const expiryDate = new Date(now.getTime() + quote.courseYearsRemaining * 365 * 24 * 60 * 60 * 1000).toISOString();
    
    // Waiting period calculation
    const waitingPeriodEndsAt = new Date(now.getTime() + plan.waitingPeriodDays * 24 * 60 * 60 * 1000).toISOString();

    const policyNumber = `EDU-POL-${now.getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    // Build specific benefits breakdown
    const benefits: PolicyBenefit[] = [
      {
        benefitType: 'Tuition Fee Guaranteed Settlement',
        totalLimit: quote.sumInsured,
        usedAmount: 0,
        remainingAmount: quote.sumInsured,
      },
    ];

    if (plan.maxLivingAllowanceAnnual > 0) {
      const livingAllowanceTotal = plan.maxLivingAllowanceAnnual * quote.courseYearsRemaining;
      benefits.push({
        benefitType: 'Hostel & Campus Living Allowance',
        totalLimit: livingAllowanceTotal,
        usedAmount: 0,
        remainingAmount: livingAllowanceTotal,
      });
    }

    quote.selectedRiders.forEach(rider => {
      benefits.push({
        benefitType: rider.name,
        totalLimit: rider.additionalCoverageAmount,
        usedAmount: 0,
        remainingAmount: rider.additionalCoverageAmount,
      });
    });

    const totalSumInsured = benefits.reduce((acc, b) => acc + b.totalLimit, 0);

    return {
      id: `pol_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      policyNumber,
      quoteId: quote.id,
      planId: plan.id,
      planName: plan.name,
      guardianId: quote.guardianId,
      guardianName,
      studentId: student.id,
      studentName: student.fullName,
      universityId: university.id,
      universityName: university.name,
      courseName: `${student.degreeProgram} (Year ${student.currentYear} of ${student.totalYears})`,
      status: 'active',
      effectiveDate,
      expiryDate,
      totalSumInsured,
      remainingCoverage: totalSumInsured,
      annualPremium: quote.rateBreakdown.grossAnnualPremium,
      paymentFrequency,
      termsVersion: 'v2026.1-IRDAI-EDU',
      benefits,
      waitingPeriodEndsAt,
      createdAt: effectiveDate,
    };
  }

  /**
   * Check whether a claim event date falls within the policy in-force window and waiting period
   */
  public static evaluatePolicyEligibility(policy: EducationPolicy, eventDateStr: string, plan: any) {
    const eventTime = new Date(eventDateStr).getTime();
    const effectiveTime = new Date(policy.effectiveDate).getTime();
    const expiryTime = new Date(policy.expiryDate).getTime();
    const waitingEndTime = new Date(policy.waitingPeriodEndsAt).getTime();

    if (eventTime < effectiveTime) {
      return {
        isEligible: false,
        reason: 'Event occurred prior to policy effective inception date.',
      };
    }

    if (eventTime > expiryTime) {
      return {
        isEligible: false,
        reason: 'Policy term expired prior to the reported disruption event.',
      };
    }

    if (eventTime < waitingEndTime && plan.waitingPeriodDays > 0) {
      return {
        isEligible: false,
        reason: `Disruption event occurred within the initial ${plan.waitingPeriodDays}-day statutory waiting period.`,
      };
    }

    if (policy.status === 'lapsed') {
      return {
        isEligible: false,
        reason: 'Policy is currently lapsed due to outstanding unpaid renewal premiums.',
      };
    }

    return {
      isEligible: true,
      reason: 'Policy is active, in-force, and statutory waiting period criteria are satisfied.',
    };
  }
}
