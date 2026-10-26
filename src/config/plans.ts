import { InsurancePlan } from '../types/insurance';

export const DEFAULT_INSURANCE_PLANS: InsurancePlan[] = [
  {
    id: 'plan_essential_scholar',
    code: 'EDU-ESS-01',
    name: 'Essential Scholar Continuity',
    tier: 'essential',
    tagline: 'Basic safety net covering core college tuition fees against severe sponsor disruptions.',
    description: 'Designed for domestic undergraduate courses. Guarantees university tuition fee payments directly to the registrar if the primary earning sponsor suffers untimely demise or total permanent disability.',
    maxTuitionCoverage: 1500000, // ₹15 Lakhs
    maxLivingAllowanceAnnual: 0,
    waitingPeriodDays: 30,
    deductiblePercentage: 5, // 5% co-pay
    baseRatePerLakh: 420, // ₹420 per ₹1,00,000 coverage/year
    coveredEvents: [
      'sponsor_death',
      'sponsor_permanent_disability'
    ],
    standardExclusions: [
      'Pre-existing critical illness within initial 90 days',
      'Voluntary student withdrawal or academic dismissal',
      'War, nuclear risks, or sponsor participation in unlawful activities'
    ],
    availableRiders: [
      {
        id: 'rider_critical_illness',
        name: 'Critical Illness Protection Rider',
        description: 'Extends coverage to 12 major critical illnesses diagnosed in the sponsor.',
        annualFee: 1800,
        additionalCoverageAmount: 500000,
      },
      {
        id: 'rider_exam_repeat',
        name: 'Academic Delay Protection',
        description: 'Covers 1 additional semester fee if trauma delays student exams.',
        annualFee: 1200,
        additionalCoverageAmount: 150000,
      }
    ],
    isActive: true,
  },
  {
    id: 'plan_campus_plus',
    code: 'EDU-CMP-02',
    name: 'Campus Shield Plus (Recommended)',
    tier: 'campus_plus',
    tagline: 'Comprehensive coverage for tuition fees, hostel allowance, and involuntary job loss.',
    description: 'Our most popular higher education protection plan. Covers 100% of university tuition fees with zero deductible, plus an annual hostel and living stipend paid to sustain the student on campus.',
    maxTuitionCoverage: 3000000, // ₹30 Lakhs
    maxLivingAllowanceAnnual: 300000, // ₹3 Lakhs/year
    waitingPeriodDays: 30,
    deductiblePercentage: 0, // Zero deductible
    baseRatePerLakh: 560, // ₹560 per ₹1,00,000 coverage/year
    coveredEvents: [
      'sponsor_death',
      'sponsor_permanent_disability',
      'sponsor_critical_illness',
      'sponsor_involuntary_unemployment'
    ],
    standardExclusions: [
      'Self-inflicted injury or suicide within first policy year',
      'Voluntary resignation or disciplinary dismissal from employment',
      'University fees incurred prior to policy inception'
    ],
    availableRiders: [
      {
        id: 'rider_living_stipend_boost',
        name: 'Living Expense Inflation Buffer (+₹1.5L/yr)',
        description: 'Increases living allowance to account for inflation in metropolitan university cities.',
        annualFee: 2400,
        additionalCoverageAmount: 300000,
      },
      {
        id: 'rider_laptop_gadget',
        name: 'STEM Equipment & Laptop Guarantee',
        description: 'Covers essential study hardware replacement during a continuity event.',
        annualFee: 950,
        additionalCoverageAmount: 100000,
      }
    ],
    isActive: true,
  },
  {
    id: 'plan_global_continuity',
    code: 'EDU-GLO-03',
    name: 'Global EduGuard Continuity',
    tier: 'global_continuity',
    tagline: 'Premier cross-border tuition protection for international and top-tier institutions.',
    description: 'Specialized high-limit policy for engineering, medical, and overseas degree students. Directly settles foreign or domestic university fees, provides emergency sponsor travel and medical evacuation.',
    maxTuitionCoverage: 6000000, // ₹60 Lakhs
    maxLivingAllowanceAnnual: 600000, // ₹6 Lakhs/year
    waitingPeriodDays: 15,
    deductiblePercentage: 0,
    baseRatePerLakh: 680, // ₹680 per ₹1,00,000 coverage/year
    coveredEvents: [
      'sponsor_death',
      'sponsor_permanent_disability',
      'sponsor_critical_illness',
      'sponsor_involuntary_unemployment',
      'student_medical_interruption'
    ],
    standardExclusions: [
      'Foreign visa revocation due to academic malpractice or illegal employment',
      'Losses caused by sanction or embargo enforcement',
      'Currency fluctuation losses outside agreed Forex peg'
    ],
    availableRiders: [
      {
        id: 'rider_repatriation',
        name: 'Emergency Travel & Sponsor Evacuation',
        description: 'Emergency flight tickets for student or family in case of sponsor critical condition.',
        annualFee: 3200,
        additionalCoverageAmount: 500000,
      },
      {
        id: 'rider_forex_hedge',
        name: 'Foreign Exchange Rate Buffer (10%)',
        description: 'Protects tuition shortfall caused by INR depreciation against USD/EUR/GBP.',
        annualFee: 4100,
        additionalCoverageAmount: 600000,
      }
    ],
    isActive: true,
  },
  {
    id: 'plan_executive_continuity',
    code: 'EDU-EXE-04',
    name: 'Executive & Medical Continuity',
    tier: 'executive',
    tagline: 'High-sum insured continuity for intensive medical, dental, and premier MBA programs.',
    description: 'Designed for intensive high-fee professional degrees (MBBS, MD, Executive MBA) where single-year tuition is substantial and continuity cannot be compromised.',
    maxTuitionCoverage: 10000000, // ₹1 Crore
    maxLivingAllowanceAnnual: 800000,
    waitingPeriodDays: 0, // Immediate coverage upon issuance
    deductiblePercentage: 0,
    baseRatePerLakh: 790,
    coveredEvents: [
      'sponsor_death',
      'sponsor_permanent_disability',
      'sponsor_critical_illness',
      'sponsor_involuntary_unemployment',
      'student_medical_interruption'
    ],
    standardExclusions: [
      'Failure to maintain professional licensing body registration standards',
      'Unauthorized student transfer between unrecognized institutions'
    ],
    availableRiders: [
      {
        id: 'rider_residency_delay',
        name: 'Clinical Residency Delay Compensation',
        description: 'Provides monthly living bridge stipend if clinical rotations are deferred.',
        annualFee: 4900,
        additionalCoverageAmount: 800000,
      }
    ],
    isActive: true,
  }
];
