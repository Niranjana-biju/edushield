// EduShield Domain Type Definitions
// Guidewire-inspired enterprise architecture (PolicyCenter, BillingCenter, ClaimCenter)

export type UserRole = 'parent' | 'student' | 'university' | 'claims_officer' | 'admin';

export interface UserProfile {
  id: string;
  email: string;
  displayName: string;
  role: UserRole;
  phone?: string;
  kycStatus: 'unverified' | 'pending' | 'verified';
  organization?: string; // For university or insurer reps
  createdAt: string;
}

export interface Student {
  id: string;
  guardianId: string;
  fullName: string;
  dateOfBirth: string;
  gender: 'male' | 'female' | 'other';
  universityId: string;
  degreeProgram: string;
  studentEnrollmentId: string;
  currentYear: number;
  totalYears: number;
  annualTuitionFee: number;
  livingExpensesAnnual: number;
  academicStandingGpa?: number;
  createdAt: string;
}

export interface University {
  id: string;
  name: string;
  code: string;
  contactEmail: string;
  contactPhone: string;
  city: string;
  state: string;
  accreditation: string;
  bankAccountEscrow: {
    accountName: string;
    accountNumber: string;
    ifscCode: string;
    bankName: string;
    branch: string;
  };
  verifiedRepEmail: string;
}

export type VerificationStatus = 'pending' | 'verified' | 'disputed' | 'waived';

export interface UniversityVerification {
  id: string;
  claimId: string;
  studentId: string;
  universityId: string;
  academicYear: string;
  semester: string;
  isStudentEnrolled: boolean;
  officialPendingFee: number;
  feeDueDate: string;
  feeDemandDocUrl?: string;
  escrowVerified: boolean;
  officialRemarks: string;
  verifiedBy: string;
  verifiedAt?: string;
  status: VerificationStatus;
}

export type CoveredEventType = 
  | 'sponsor_death'
  | 'sponsor_permanent_disability'
  | 'sponsor_critical_illness'
  | 'sponsor_involuntary_unemployment'
  | 'student_medical_interruption';

export interface RiderConfig {
  id: string;
  name: string;
  description: string;
  annualFee: number;
  additionalCoverageAmount: number;
  selected?: boolean;
}

export interface InsurancePlan {
  id: string;
  code: string;
  name: string;
  tier: 'essential' | 'campus_plus' | 'global_continuity' | 'executive';
  tagline: string;
  description: string;
  maxTuitionCoverage: number;
  maxLivingAllowanceAnnual: number;
  waitingPeriodDays: number; // e.g. 30 or 60 days
  deductiblePercentage: number; // e.g. 0%, 5%, 10%
  baseRatePerLakh: number; // sample actuarial base rate per 1,00,000 INR
  coveredEvents: CoveredEventType[];
  standardExclusions: string[];
  availableRiders: RiderConfig[];
  isActive: boolean;
}

export interface RateCalculationBreakdown {
  baseTuitionSum: number;
  baseRateAmount: number;
  sponsorAgeFactor: number;
  courseDurationFactor: number;
  healthRiskFactor: number;
  deductibleDiscount: number;
  riderAddonsTotal: number;
  netAnnualPremium: number;
  gstAmount: number; // 18% GST in India
  grossAnnualPremium: number;
  calculationAssumptions: string[];
}

export type QuoteStatus = 'draft' | 'generated' | 'expired' | 'converted';

export interface Quote {
  id: string;
  quoteNumber: string;
  guardianId: string;
  studentId: string;
  planId: string;
  annualTuition: number;
  courseYearsRemaining: number;
  sumInsured: number;
  selectedDeductible: number;
  selectedRiders: RiderConfig[];
  sponsorAge: number;
  sponsorPreExistingConditions: boolean;
  rateBreakdown: RateCalculationBreakdown;
  status: QuoteStatus;
  expiresAt: string;
  createdAt: string;
}

export type PolicyStatus = 
  | 'active'
  | 'grace_period'
  | 'lapsed'
  | 'claim_pending'
  | 'claimed_settled'
  | 'terminated';

export interface PolicyBenefit {
  benefitType: string;
  totalLimit: number;
  usedAmount: number;
  remainingAmount: number;
}

export interface EducationPolicy {
  id: string;
  policyNumber: string;
  quoteId: string;
  planId: string;
  planName: string;
  guardianId: string;
  guardianName: string;
  studentId: string;
  studentName: string;
  universityId: string;
  universityName: string;
  courseName: string;
  status: PolicyStatus;
  effectiveDate: string;
  expiryDate: string;
  totalSumInsured: number;
  remainingCoverage: number;
  annualPremium: number;
  paymentFrequency: 'annual' | 'semi-annual' | 'quarterly';
  termsVersion: string;
  benefits: PolicyBenefit[];
  waitingPeriodEndsAt: string;
  createdAt: string;
}

export type InvoiceStatus = 'draft' | 'issued' | 'paid' | 'overdue' | 'cancelled';

export interface PremiumInvoice {
  id: string;
  invoiceNumber: string;
  policyId: string;
  policyNumber: string;
  guardianId: string;
  guardianName: string;
  dueDate: string;
  billingPeriod: string;
  baseAmount: number;
  taxAmount: number;
  totalAmount: number;
  status: InvoiceStatus;
  paidAt?: string;
  paymentRef?: string;
  createdAt: string;
}

export interface PremiumPayment {
  id: string;
  paymentNumber: string;
  invoiceId: string;
  policyId: string;
  guardianId: string;
  amount: number;
  paymentMethod: 'UPI' | 'CreditCard' | 'DebitCard' | 'NetBanking';
  transactionRef: string;
  gatewayResponse: 'SUCCESS' | 'FAILURE' | 'PENDING';
  paidAt: string;
}

export type ClaimStatus = 
  | 'draft'
  | 'submitted'
  | 'under_review'
  | 'documents_required'
  | 'university_verification'
  | 'approved'
  | 'rejected'
  | 'payment_processing'
  | 'paid'
  | 'closed';

export type ClaimDocumentType = 
  | 'death_certificate'
  | 'disability_certificate'
  | 'medical_report'
  | 'employment_termination'
  | 'university_fee_invoice'
  | 'student_id_proof'
  | 'bank_statement'
  | 'other';

export interface ClaimDocument {
  id: string;
  claimId: string;
  documentType: ClaimDocumentType;
  fileName: string;
  fileSize: number;
  fileUrl: string;
  uploadedBy: string;
  uploadedAt: string;
  verificationStatus: 'pending' | 'verified' | 'rejected' | 'resubmission_requested';
  ocrDetectedData?: {
    documentClassification: string;
    extractedDate?: string;
    extractedNames?: string[];
    extractedAmount?: number;
    confidenceScore: number;
    flags: string[];
  };
  reviewNotes?: string;
}

export interface ClaimReviewLog {
  id: string;
  claimId: string;
  reviewerId: string;
  reviewerName: string;
  reviewerRole: UserRole;
  actionTaken: string;
  previousStatus: ClaimStatus;
  newStatus: ClaimStatus;
  reasons: string;
  internalNotes?: string;
  timestamp: string;
}

export interface ClaimPaymentSettlement {
  id: string;
  settlementRef: string;
  claimId: string;
  policyId: string;
  universityId: string;
  universityName: string;
  approvedAmount: number;
  actualSettledAmount: number;
  escrowAccountNumber: string;
  ifscCode: string;
  paymentMode: 'NEFT_ESCROW' | 'RTGS_ESCROW' | 'DIRECT_INSTITUTION_CLEARING';
  transactionReference: string;
  status: 'initiated' | 'completed' | 'failed';
  processedAt: string;
}

export interface EducationClaim {
  id: string;
  claimNumber: string;
  policyId: string;
  policyNumber: string;
  studentId: string;
  studentName: string;
  guardianId: string;
  guardianName: string;
  universityId: string;
  universityName: string;
  eventType: CoveredEventType;
  eventDate: string;
  claimDescription: string;
  
  // Amounts separated as requested in Prompt Section 4:
  requestedAmount: number;
  universityVerifiedFeeAmount: number;
  eligibleCoverageLimit: number;
  deductibleApplied: number;
  approvedAmount: number;
  actuallyPaidAmount: number;
  
  status: ClaimStatus;
  decisionReason?: string;
  rejectionCategory?: string;
  assignedOfficerId?: string;
  assignedOfficerName?: string;
  universityVerificationId?: string;
  documents: ClaimDocument[];
  reviewHistory: ClaimReviewLog[];
  settlement?: ClaimPaymentSettlement;
  
  submittedAt: string;
  decidedAt?: string;
  closedAt?: string;
}

export interface AuditLogEntry {
  id: string;
  actorId: string;
  actorName: string;
  actorRole: UserRole;
  action: string;
  entityType: 'policy' | 'quote' | 'invoice' | 'payment' | 'claim' | 'document' | 'verification' | 'user';
  entityId: string;
  previousState?: any;
  newState?: any;
  timestamp: string;
  ipAddress?: string;
  notes?: string;
}

export interface NotificationItem {
  id: string;
  userId: string;
  targetRole: UserRole | 'all';
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'urgent';
  isRead: boolean;
  link?: string;
  createdAt: string;
}

// Funding Gap Calculator Data Structure
export interface FundingGapCalculationInput {
  remainingYears: number;
  annualTuition: number;
  annualLivingExpense: number;
  annualInflationRate: number; // e.g. 6%
  existingSavingsDedicated: number;
  otherScholarshipsOrAid: number;
  currentInsuranceCoverageLimit: number;
}

export interface FundingGapCalculationResult {
  totalEstimatedFutureCost: number;
  totalTuitionCost: number;
  totalLivingCost: number;
  totalAvailableResources: number; // Savings + Aid
  totalInsuranceCovered: number;
  netUncoveredFundingGap: number;
  gapSeverity: 'fully_covered' | 'moderate_gap' | 'high_vulnerability';
  yearlyBreakdown: Array<{
    year: number;
    tuitionWithInflation: number;
    livingWithInflation: number;
    totalAnnualCost: number;
    insuredProtection: number;
    uncoveredShortfall: number;
  }>;
  recommendedCoverageAdjustment: number;
}
