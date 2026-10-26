import {
  EducationClaim,
  ClaimStatus,
  ClaimDocument,
  ClaimReviewLog,
  ClaimPaymentSettlement,
  EducationPolicy,
  CoveredEventType,
  UserRole,
  University
} from '../types/insurance';

export interface CreateClaimInput {
  policy: EducationPolicy;
  eventType: CoveredEventType;
  eventDate: string;
  claimDescription: string;
  requestedAmount: number;
  uploadedDocuments: Omit<ClaimDocument, 'id' | 'claimId' | 'uploadedAt' | 'verificationStatus'>[];
  claimantRole: UserRole;
  claimantName: string;
}

export class ClaimService {
  /**
   * Intakes a new claim (ClaimCenter intake wizard)
   */
  public static createClaim(input: CreateClaimInput): EducationClaim {
    const {
      policy,
      eventType,
      eventDate,
      claimDescription,
      requestedAmount,
      uploadedDocuments,
      claimantName,
    } = input;

    const claimId = `claim_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const now = new Date().toISOString();
    const claimNumber = `CLM-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;

    const docs: ClaimDocument[] = uploadedDocuments.map((doc, idx) => ({
      ...doc,
      id: `doc_${Date.now()}_${idx}`,
      claimId,
      uploadedAt: now,
      verificationStatus: 'pending',
    }));

    const initialReview: ClaimReviewLog = {
      id: `rev_${Date.now()}`,
      claimId,
      reviewerId: policy.guardianId,
      reviewerName: claimantName,
      reviewerRole: 'parent',
      actionTaken: 'Initial Claim Submission',
      previousStatus: 'draft',
      newStatus: 'submitted',
      reasons: `Claim initiated for covered event: ${eventType}. Requested amount: ₹${requestedAmount.toLocaleString('en-IN')}`,
      timestamp: now,
    };

    return {
      id: claimId,
      claimNumber,
      policyId: policy.id,
      policyNumber: policy.policyNumber,
      studentId: policy.studentId,
      studentName: policy.studentName,
      guardianId: policy.guardianId,
      guardianName: policy.guardianName,
      universityId: policy.universityId,
      universityName: policy.universityName,
      eventType,
      eventDate,
      claimDescription,
      requestedAmount,
      universityVerifiedFeeAmount: 0,
      eligibleCoverageLimit: policy.remainingCoverage,
      deductibleApplied: 0,
      approvedAmount: 0,
      actuallyPaidAmount: 0,
      status: 'submitted',
      documents: docs,
      reviewHistory: [initialReview],
      submittedAt: now,
    };
  }

  /**
   * Validates if transition is permissible under Guidewire ClaimCenter lifecycle rules
   */
  public static isValidTransition(from: ClaimStatus, to: ClaimStatus): boolean {
    const allowedTransitions: Record<ClaimStatus, ClaimStatus[]> = {
      draft: ['submitted', 'closed'],
      submitted: ['under_review', 'documents_required', 'rejected', 'closed'],
      under_review: ['documents_required', 'university_verification', 'approved', 'rejected', 'closed'],
      documents_required: ['under_review', 'university_verification', 'rejected', 'closed'],
      university_verification: ['under_review', 'approved', 'rejected', 'documents_required', 'closed'],
      approved: ['payment_processing', 'closed'],
      rejected: ['closed', 'under_review'], // reopen on appeal
      payment_processing: ['paid', 'approved'],
      paid: ['closed'],
      closed: [],
    };

    return allowedTransitions[from]?.includes(to) ?? false;
  }

  /**
   * Claims officer status transition with audit trail
   */
  public static transitionClaimStatus(params: {
    claim: EducationClaim;
    newStatus: ClaimStatus;
    reviewerId: string;
    reviewerName: string;
    reviewerRole: UserRole;
    actionTaken: string;
    reasons: string;
    internalNotes?: string;
    approvedAmount?: number;
    deductibleApplied?: number;
    universityVerifiedFeeAmount?: number;
  }): EducationClaim {
    const {
      claim,
      newStatus,
      reviewerId,
      reviewerName,
      reviewerRole,
      actionTaken,
      reasons,
      internalNotes,
      approvedAmount,
      deductibleApplied,
      universityVerifiedFeeAmount,
    } = params;

    if (!this.isValidTransition(claim.status, newStatus)) {
      throw new Error(`Invalid status transition from "${claim.status}" to "${newStatus}".`);
    }

    const now = new Date().toISOString();

    const reviewLog: ClaimReviewLog = {
      id: `rev_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`,
      claimId: claim.id,
      reviewerId,
      reviewerName,
      reviewerRole,
      actionTaken,
      previousStatus: claim.status,
      newStatus,
      reasons,
      internalNotes,
      timestamp: now,
    };

    const updatedClaim: EducationClaim = {
      ...claim,
      status: newStatus,
      decisionReason: reasons,
      assignedOfficerId: reviewerRole === 'claims_officer' ? reviewerId : claim.assignedOfficerId,
      assignedOfficerName: reviewerRole === 'claims_officer' ? reviewerName : claim.assignedOfficerName,
      reviewHistory: [...claim.reviewHistory, reviewLog],
      decidedAt: ['approved', 'rejected'].includes(newStatus) ? now : claim.decidedAt,
      closedAt: newStatus === 'closed' ? now : claim.closedAt,
    };

    if (approvedAmount !== undefined) {
      updatedClaim.approvedAmount = approvedAmount;
    }
    if (deductibleApplied !== undefined) {
      updatedClaim.deductibleApplied = deductibleApplied;
    }
    if (universityVerifiedFeeAmount !== undefined) {
      updatedClaim.universityVerifiedFeeAmount = universityVerifiedFeeAmount;
    }

    return updatedClaim;
  }

  /**
   * Executes institutional escrow settlement direct to university
   */
  public static executeUniversitySettlement(params: {
    claim: EducationClaim;
    university: University;
    settlementAmount: number;
    officerName: string;
  }): { claim: EducationClaim; settlement: ClaimPaymentSettlement } {
    const { claim, university, settlementAmount, officerName } = params;
    const now = new Date().toISOString();
    const settlementRef = `STL-NEFT-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;
    const transactionReference = `NEFT-EDUSHIELD-${university.code.replace(/[^A-Z]/g, '')}-${Date.now().toString().slice(-6)}`;

    const settlement: ClaimPaymentSettlement = {
      id: `stl_${Date.now()}`,
      settlementRef,
      claimId: claim.id,
      policyId: claim.policyId,
      universityId: university.id,
      universityName: university.name,
      approvedAmount: claim.approvedAmount || settlementAmount,
      actualSettledAmount: settlementAmount,
      escrowAccountNumber: university.bankAccountEscrow.accountNumber,
      ifscCode: university.bankAccountEscrow.ifscCode,
      paymentMode: 'NEFT_ESCROW',
      transactionReference,
      status: 'completed',
      processedAt: now,
    };

    const updatedClaim: EducationClaim = {
      ...claim,
      status: 'paid',
      actuallyPaidAmount: settlementAmount,
      settlement,
      closedAt: now,
      reviewHistory: [
        ...claim.reviewHistory,
        {
          id: `rev_${Date.now()}`,
          claimId: claim.id,
          reviewerId: 'officer_system',
          reviewerName: officerName,
          reviewerRole: 'claims_officer',
          actionTaken: 'Direct University Escrow Disbursement',
          previousStatus: claim.status,
          newStatus: 'paid',
          reasons: `Disbursed ₹${settlementAmount.toLocaleString('en-IN')} directly to ${university.name} student fee escrow account. Ref: ${transactionReference}`,
          timestamp: now,
        },
      ],
    };

    return { claim: updatedClaim, settlement };
  }
}
