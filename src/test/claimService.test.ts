import { describe, it, expect } from 'vitest';
import { ClaimService } from '../services/claimService';
import { PolicyService } from '../services/policyService';
import { SEED_POLICIES, SEED_UNIVERSITIES } from '../services/mockSeedData';

describe('ClaimService Guidewire ClaimCenter Lifecycle', () => {
  const policy = SEED_POLICIES[0];
  const university = SEED_UNIVERSITIES[0];

  it('creates an FNOL claim with initial submitted status and review history log', () => {
    const claim = ClaimService.createClaim({
      policy,
      eventType: 'sponsor_critical_illness',
      eventDate: '2026-01-15',
      claimDescription: 'Hospitalization of sponsor',
      requestedAmount: 140000,
      uploadedDocuments: [
        {
          documentType: 'medical_report',
          fileName: 'DischargeSummary.pdf',
          fileSize: 1024000,
          fileUrl: '/docs/doc.pdf',
          uploadedBy: 'Rajesh Sharma',
        }
      ],
      claimantRole: 'parent',
      claimantName: 'Rajesh Sharma',
    });

    expect(claim.status).toBe('submitted');
    expect(claim.requestedAmount).toBe(140000);
    expect(claim.universityVerifiedFeeAmount).toBe(0);
    expect(claim.approvedAmount).toBe(0);
    expect(claim.actuallyPaidAmount).toBe(0);
    expect(claim.reviewHistory.length).toBe(1);
    expect(claim.reviewHistory[0].actionTaken).toBe('Initial Claim Submission');
  });

  it('enforces valid Guidewire lifecycle status transitions', () => {
    // Valid transitions
    expect(ClaimService.isValidTransition('submitted', 'under_review')).toBe(true);
    expect(ClaimService.isValidTransition('submitted', 'university_verification')).toBe(false); // must be in review first or direct triage
    expect(ClaimService.isValidTransition('under_review', 'university_verification')).toBe(true);
    expect(ClaimService.isValidTransition('university_verification', 'approved')).toBe(true);
    expect(ClaimService.isValidTransition('approved', 'paid')).toBe(false); // must transition through payment_processing or direct settlement
    expect(ClaimService.isValidTransition('approved', 'payment_processing')).toBe(true);

    // Invalid skipping transitions
    expect(ClaimService.isValidTransition('submitted', 'paid')).toBe(false);
    expect(ClaimService.isValidTransition('draft', 'approved')).toBe(false);
  });

  it('throws an error when an invalid status skip transition is attempted', () => {
    const claim = ClaimService.createClaim({
      policy,
      eventType: 'sponsor_death',
      eventDate: '2026-01-10',
      claimDescription: 'Demise notice',
      requestedAmount: 200000,
      uploadedDocuments: [],
      claimantRole: 'parent',
      claimantName: 'Rajesh Sharma',
    });

    expect(() => {
      ClaimService.transitionClaimStatus({
        claim,
        newStatus: 'paid', // illegal skip from 'submitted' to 'paid'
        reviewerId: 'officer_01',
        reviewerName: 'Pooja Verma',
        reviewerRole: 'claims_officer',
        actionTaken: 'Direct Payout',
        reasons: 'Skip review',
      });
    }).toThrow('Invalid status transition');
  });

  it('executes direct institutional escrow settlement properly', () => {
    const claim = ClaimService.createClaim({
      policy,
      eventType: 'sponsor_permanent_disability',
      eventDate: '2026-01-12',
      claimDescription: 'Total disability',
      requestedAmount: 150000,
      uploadedDocuments: [],
      claimantRole: 'parent',
      claimantName: 'Rajesh Sharma',
    });

    const reviewed = ClaimService.transitionClaimStatus({
      claim,
      newStatus: 'under_review',
      reviewerId: 'officer_01',
      reviewerName: 'Pooja Verma',
      reviewerRole: 'claims_officer',
      actionTaken: 'Reviewed',
      reasons: 'Valid medical records',
    });

    const verified = ClaimService.transitionClaimStatus({
      claim: reviewed,
      newStatus: 'university_verification',
      reviewerId: 'officer_01',
      reviewerName: 'Pooja Verma',
      reviewerRole: 'claims_officer',
      actionTaken: 'Sent to registrar',
      reasons: 'Awaiting bursar certification',
    });

    const approved = ClaimService.transitionClaimStatus({
      claim: verified,
      newStatus: 'approved',
      reviewerId: 'officer_01',
      reviewerName: 'Pooja Verma',
      reviewerRole: 'claims_officer',
      actionTaken: 'Approved',
      reasons: 'Registrar verified pending fee',
      approvedAmount: 150000,
    });

    const { claim: settledClaim, settlement } = ClaimService.executeUniversitySettlement({
      claim: approved,
      university,
      settlementAmount: 150000,
      officerName: 'Pooja Verma',
    });

    expect(settledClaim.status).toBe('paid');
    expect(settledClaim.actuallyPaidAmount).toBe(150000);
    expect(settlement.paymentMode).toBe('NEFT_ESCROW');
    expect(settlement.escrowAccountNumber).toBe(university.bankAccountEscrow.accountNumber);
    expect(settlement.transactionReference).toContain('NEFT-EDUSHIELD');
  });
});
