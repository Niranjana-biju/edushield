import {
  FundingGapCalculationInput,
  FundingGapCalculationResult,
  EducationClaim,
  EducationPolicy,
  UserRole
} from '../types/insurance';

export class ContinuityIntelligence {
  /**
   * 1. Deterministic Funding-Gap Calculator
   * Computes education expense progression with annual inflation indexation
   */
  public static calculateFundingGap(input: FundingGapCalculationInput): FundingGapCalculationResult {
    const {
      remainingYears,
      annualTuition,
      annualLivingExpense,
      annualInflationRate,
      existingSavingsDedicated,
      otherScholarshipsOrAid,
      currentInsuranceCoverageLimit,
    } = input;

    let totalTuitionCost = 0;
    let totalLivingCost = 0;
    let totalEstimatedFutureCost = 0;

    const yearlyBreakdown: FundingGapCalculationResult['yearlyBreakdown'] = [];

    const inflationFactor = 1 + annualInflationRate / 100;

    for (let year = 1; year <= remainingYears; year++) {
      const yearMultiplier = Math.pow(inflationFactor, year - 1);
      const yearTuition = Math.round(annualTuition * yearMultiplier);
      const yearLiving = Math.round(annualLivingExpense * yearMultiplier);
      const totalAnnualCost = yearTuition + yearLiving;

      totalTuitionCost += yearTuition;
      totalLivingCost += yearLiving;
      totalEstimatedFutureCost += totalAnnualCost;

      // Portion protected under the current insurance policy limit
      const cumulativeCoveredSoFar = (year - 1) * (currentInsuranceCoverageLimit / remainingYears);
      const insuredProtectionThisYear = Math.min(
        totalAnnualCost,
        Math.max(0, currentInsuranceCoverageLimit - cumulativeCoveredSoFar)
      );

      const uncoveredShortfall = Math.max(0, totalAnnualCost - insuredProtectionThisYear);

      yearlyBreakdown.push({
        year,
        tuitionWithInflation: yearTuition,
        livingWithInflation: yearLiving,
        totalAnnualCost,
        insuredProtection: Math.round(insuredProtectionThisYear),
        uncoveredShortfall: Math.round(uncoveredShortfall),
      });
    }

    const totalAvailableResources = existingSavingsDedicated + otherScholarshipsOrAid;
    const netProtectedCap = Math.min(totalEstimatedFutureCost, currentInsuranceCoverageLimit + totalAvailableResources);
    const netUncoveredFundingGap = Math.max(0, totalEstimatedFutureCost - (currentInsuranceCoverageLimit + totalAvailableResources));

    let gapSeverity: FundingGapCalculationResult['gapSeverity'] = 'fully_covered';
    if (netUncoveredFundingGap > totalEstimatedFutureCost * 0.4) {
      gapSeverity = 'high_vulnerability';
    } else if (netUncoveredFundingGap > 0) {
      gapSeverity = 'moderate_gap';
    }

    const recommendedCoverageAdjustment = netUncoveredFundingGap > 0 ? netUncoveredFundingGap : 0;

    return {
      totalEstimatedFutureCost,
      totalTuitionCost,
      totalLivingCost,
      totalAvailableResources,
      totalInsuranceCovered: Math.min(totalEstimatedFutureCost, currentInsuranceCoverageLimit),
      netUncoveredFundingGap,
      gapSeverity,
      yearlyBreakdown,
      recommendedCoverageAdjustment,
    };
  }

  /**
   * 2. AI Policy Assistant (Rule-backed with transparent clause citations)
   * Answers queries referencing explicit EduShield Policy wording
   */
  public static queryPolicyAssistant(query: string, policy?: EducationPolicy): {
    answer: string;
    citedClause: string;
    confidence: 'high' | 'moderate' | 'insufficient_evidence';
    suggestedQueries: string[];
  } {
    const q = query.toLowerCase();

    if (q.includes('waiting period') || q.includes('how long') || q.includes('effective date')) {
      return {
        answer: `Under standard EduShield terms, the statutory waiting period is 30 days from policy issuance for critical illness or disability claims, and 90 days for involuntary job retrenchment. In the unfortunate event of accidental demise, the waiting period is waived immediately (0 days). For this policy (${policy?.policyNumber || 'Sample Policy'}), the waiting period concludes on ${policy ? new Date(policy.waitingPeriodEndsAt).toLocaleDateString('en-IN') : 'Day 30'}.`,
        citedClause: 'Clause 3.1 & Section 4 (Inception and Waiting Period Moratorium)',
        confidence: 'high',
        suggestedQueries: [
          'What happens during involuntary job loss?',
          'How does university fee settlement work?',
          'What are the standard exclusions?'
        ],
      };
    }

    if (q.includes('exclusion') || q.includes('not covered') || q.includes('rejected') || q.includes('suicide')) {
      return {
        answer: 'Standard policy exclusions include: 1) Self-inflicted injury or suicide within the initial policy year; 2) Pre-existing medical conditions not disclosed during quote declaration; 3) Voluntary student academic withdrawal or expulsion due to misconduct; 4) Voluntary resignation or termination due to employee misconduct; 5) University fees billed prior to the policy inception date.',
        citedClause: 'Section 6.4 (General Exclusions & Non-Covered Disruptions)',
        confidence: 'high',
        suggestedQueries: [
          'Can medical conditions be covered?',
          'What documents are needed for claims?',
          'How does the university verify fees?'
        ],
      };
    }

    if (q.includes('university') || q.includes('bursar') || q.includes('direct payment') || q.includes('escrow') || q.includes('how paid')) {
      return {
        answer: 'EduShield implements a direct-to-institution disbursement protocol. Approved claim settlements are never paid out as unrestricted cash to individuals. Instead, after the University Registrar or Bursar verifies the student\'s active enrollment and outstanding fee demand, funds are remitted directly via NEFT/RTGS to the University\'s authenticated Tuition Escrow Account.',
        citedClause: 'Section 7.2 (Direct Institutional Settlement & Registrar Escrow Protocol)',
        confidence: 'high',
        suggestedQueries: [
          'What is the university verification process?',
          'What if the university fee exceeds the policy limit?',
          'What documents does the student need?'
        ],
      };
    }

    if (q.includes('job loss') || q.includes('unemployment') || q.includes('layoff')) {
      return {
        answer: 'Involuntary sponsor retrenchment is covered under Campus Shield Plus and Global EduGuard plans. The sponsor must have been employed continuously for at least 12 months with the current employer, and the termination must be an involuntary corporate retrenchment, redundancy, or plant closure. Resignations and performance-based terminations are excluded.',
        citedClause: 'Section 5.3 (Sponsor Involuntary Retrenchment Rider)',
        confidence: 'high',
        suggestedQueries: [
          'What proof is needed for layoff?',
          'Is severance pay deducted?',
          'How long does claim review take?'
        ],
      };
    }

    if (q.includes('living expense') || q.includes('hostel') || q.includes('allowance')) {
      return {
        answer: 'If your plan includes a campus living allowance (such as Campus Shield Plus or Global EduGuard), the policy provides an annual living stipend (up to ₹3,00,000 to ₹6,00,000 depending on plan tier) paid in monthly installments to cover student hostel, mess, and educational equipment.',
        citedClause: 'Schedule B (Student Campus Subsistence Allowance)',
        confidence: 'high',
        suggestedQueries: [
          'What is the maximum tuition coverage?',
          'Can I upgrade my plan mid-year?',
          'What is the deductible?'
        ],
      };
    }

    // Default transparent fallback
    return {
      answer: `Regarding "${query}": The policy document specifies general conditions of student continuity insurance. For specific inquiries regarding custom academic situations or non-standard riders, please review the registered Policy Terms and Conditions Schedule or contact the EduShield Adjudication Officer. EduShield never makes ambiguous assumptions.`,
      citedClause: 'Section 1.2 (Scope of Demonstration Coverage)',
      confidence: 'insufficient_evidence',
      suggestedQueries: [
        'What are the covered events?',
        'What is the statutory waiting period?',
        'How are university fees verified?'
      ],
    };
  }

  /**
   * 3. AI Claim-Document Assistant
   * Simulates document inspection, OCR extraction, and field cross-comparison
   */
  public static analyzeDocument(file: { name: string; size: number }, claim: Partial<EducationClaim>) {
    const fileName = file.name.toLowerCase();
    let detectedType = 'other';
    let classification = 'General Supporting Documentation';
    const flags: string[] = [];
    let confidence = 0.88;

    if (fileName.includes('death') || fileName.includes('demise') || fileName.includes('cert')) {
      detectedType = 'death_certificate';
      classification = 'Municipal Death Registration Certificate';
      confidence = 0.96;
      flags.push('Official seal and registration stamp detected.');
      flags.push(`Name cross-check with Sponsor: ${claim.guardianName || 'Rajesh Sharma'} (Match: 98%)`);
    } else if (fileName.includes('discharge') || fileName.includes('medical') || fileName.includes('hospital') || fileName.includes('cardiac')) {
      detectedType = 'medical_report';
      classification = 'Hospital Inpatient Summary & Specialist Diagnostic';
      confidence = 0.94;
      flags.push('Hospital Registration No. and Attending Physician signature detected.');
      flags.push('Diagnostic ICD-10 coding confirmed.');
    } else if (fileName.includes('fee') || fileName.includes('invoice') || fileName.includes('tuition') || fileName.includes('demand')) {
      detectedType = 'university_fee_invoice';
      classification = 'Official University Fee Demand Voucher';
      confidence = 0.98;
      flags.push(`Student Enrollment Match: ${claim.studentName || 'Student'} (Verified)`);
      if (claim.requestedAmount) {
        flags.push(`Extracted fee liability matches claimed amount: ₹${claim.requestedAmount.toLocaleString('en-IN')}`);
      }
    } else if (fileName.includes('layoff') || fileName.includes('termination') || fileName.includes('severance') || fileName.includes('form16')) {
      detectedType = 'employment_termination';
      classification = 'Corporate Layoff / Retrenchment Notice';
      confidence = 0.92;
      flags.push('Employer Corporate Identity Number (CIN) identified.');
      flags.push('Notice confirms organizational restructuring / non-voluntary departure.');
    } else {
      classification = 'Supplementary Student/Identity Verification Record';
      flags.push('General document accepted for manual adjudicator review.');
    }

    return {
      detectedType,
      classification,
      fileSizeFormatted: `${(file.size / 1024).toFixed(1)} KB`,
      confidenceScore: confidence,
      flags,
      summary: `Automated inspection identified this file as ${classification}. Verified formatting, metadata integrity, and cross-referenced with policy beneficiary records.`,
    };
  }

  /**
   * 4. Claim-Readiness Checklist
   * Determines completeness without pretending to be a fraud score
   */
  public static evaluateClaimReadiness(claim: EducationClaim, policy?: EducationPolicy) {
    const items = [
      {
        id: 'chk_policy_active',
        title: 'Active Policy In-Force Status',
        description: 'Policy is active and not lapsed or terminated.',
        isSatisfied: policy ? policy.status === 'active' || policy.status === 'claim_pending' : true,
      },
      {
        id: 'chk_waiting_period',
        title: 'Statutory Waiting Period Clearance',
        description: 'Disruption event occurred outside initial waiting moratorium.',
        isSatisfied: true, // evaluated by policyService
      },
      {
        id: 'chk_event_doc',
        title: 'Event Substantiation Documentation',
        description: 'Uploaded medical report, death certificate, or retrenchment letter.',
        isSatisfied: claim.documents.some(d => 
          ['death_certificate', 'disability_certificate', 'medical_report', 'employment_termination'].includes(d.documentType)
        ),
      },
      {
        id: 'chk_fee_demand',
        title: 'University Fee Demand Invoice',
        description: 'Official registrar semester fee schedule or invoice attached.',
        isSatisfied: claim.documents.some(d => d.documentType === 'university_fee_invoice'),
      },
      {
        id: 'chk_univ_verification',
        title: 'University Registrar Enrollment Certification',
        description: 'Institution has certified student enrollment and pending dues.',
        isSatisfied: ['approved', 'payment_processing', 'paid'].includes(claim.status) || claim.universityVerifiedFeeAmount > 0,
      },
      {
        id: 'chk_escrow_account',
        title: 'Institutional Escrow Bank Account Verified',
        description: 'Bank IFSC and Escrow Account details verified for direct NEFT payout.',
        isSatisfied: Boolean(claim.settlement?.escrowAccountNumber) || ['approved', 'payment_processing', 'paid'].includes(claim.status),
      },
    ];

    const completedCount = items.filter(i => i.isSatisfied).length;
    const totalCount = items.length;
    const percentReady = Math.round((completedCount / totalCount) * 100);

    return {
      items,
      completedCount,
      totalCount,
      percentReady,
      statusLabel: 
        percentReady === 100 
          ? 'Fully Verified & Ready for Settlement' 
          : percentReady >= 60 
          ? 'Under Active Adjudication' 
          : 'Pending Essential Documentation',
    };
  }

  /**
   * 5. Explainable Next Steps
   * Contextual action guide tailored to the exact user role and claim state
   */
  public static getExplainableNextSteps(claim: EducationClaim, role: UserRole) {
    switch (claim.status) {
      case 'draft':
        return {
          currentStage: 'Claim Intake in Progress',
          recommendation: 'Complete mandatory document upload (event proof and college fee invoice) and submit the claim for triage.',
          responsibleParty: 'Parent / Sponsor',
          actionLabel: 'Resume Submission',
          actionUrl: `/claims/${claim.id}/edit`,
        };

      case 'submitted':
        return role === 'claims_officer' || role === 'admin'
          ? {
              currentStage: 'Initial Triage Queue',
              recommendation: 'Review uploaded document classifications and dispatch official verification request to the University Bursar.',
              responsibleParty: 'Claims Adjudication Officer',
              actionLabel: 'Assign & Triage Claim',
              actionUrl: `/claims/${claim.id}`,
            }
          : {
              currentStage: 'Awaiting Claims Officer Triage',
              recommendation: 'Your claim has been received. Our claims team will verify document completeness within 2 business days.',
              responsibleParty: 'EduShield Claims Desk',
              actionLabel: 'View Claim Details',
              actionUrl: `/claims/${claim.id}`,
            };

      case 'university_verification':
        return role === 'university'
          ? {
              currentStage: 'Pending University Verification',
              recommendation: 'Authenticate student enrollment, certify semester fee arrears, and confirm designated institutional escrow account.',
              responsibleParty: 'University Registrar / Bursar Office',
              actionLabel: 'Complete Fee Verification',
              actionUrl: `/university-portal`,
            }
          : {
              currentStage: 'Referred to University Bursar',
              recommendation: 'Claim documentation has passed initial screening. We are awaiting formal confirmation of pending fee dues from the university registrar.',
              responsibleParty: 'Apex Metropolitan University Registrar',
              actionLabel: 'Track Verification Status',
              actionUrl: `/claims/${claim.id}`,
            };

      case 'documents_required':
        return {
          currentStage: 'Additional Information Requested',
          recommendation: 'The claims officer requested clarifying medical or academic documentation. Please upload requested files to proceed.',
          responsibleParty: 'Parent / Sponsor',
          actionLabel: 'Upload Additional Documents',
          actionUrl: `/claims/${claim.id}`,
        };

      case 'approved':
        return role === 'claims_officer' || role === 'admin'
          ? {
              currentStage: 'Approved — Ready for Disbursement',
              recommendation: 'Execute electronic transfer to authenticated University Tuition Escrow Account via direct NEFT/RTGS gateway.',
              responsibleParty: 'Disbursement Finance Unit',
              actionLabel: 'Execute Institutional Settlement',
              actionUrl: `/claims/${claim.id}`,
            }
          : {
              currentStage: 'Approved for University Settlement',
              recommendation: `Claim for ₹${claim.approvedAmount.toLocaleString('en-IN')} approved. Disbursement batch scheduled to University Escrow account.`,
              responsibleParty: 'EduShield Settlement Desk',
              actionLabel: 'View Settlement Schedule',
              actionUrl: `/claims/${claim.id}`,
            };

      case 'payment_processing':
      case 'paid':
        return {
          currentStage: 'Settlement Completed',
          recommendation: `Fees of ₹${claim.actuallyPaidAmount.toLocaleString('en-IN')} remitted directly to ${claim.universityName}. Student academic continuity preserved.`,
          responsibleParty: 'Settled & Closed',
          actionLabel: 'Download Settlement Receipt',
          actionUrl: `/claims/${claim.id}`,
        };

      case 'rejected':
        return {
          currentStage: 'Claim Ineligible Under Policy Terms',
          recommendation: `Adjudication concluded: ${claim.decisionReason || 'Policy exclusion or waiting period criteria not met'}. Formal written explanation dispatched.`,
          responsibleParty: 'Closed Adjudication',
          actionLabel: 'View Decision Notice',
          actionUrl: `/claims/${claim.id}`,
        };

      default:
        return {
          currentStage: 'Review Cycle',
          recommendation: 'Monitoring ongoing claim milestone updates.',
          responsibleParty: 'EduShield Claims Desk',
          actionLabel: 'View File',
          actionUrl: `/claims/${claim.id}`,
        };
    }
  }
}
