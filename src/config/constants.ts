// Application Constants, Labels & Formatters

import { CoveredEventType, ClaimStatus, PolicyStatus, UserRole } from '../types/insurance';

export const APP_NAME = 'EduShield';
export const APP_TAGLINE = 'Higher Education Continuity & Sponsor Disruption Insurance';
export const DISCLAIMER_TEXT = 
  'EduShield is an academic prototype demonstrating Guidewire-inspired higher education continuity insurance workflows. ' +
  'Rates, policies, university escrow transfers, and AI analyses are simulated for educational demonstration. ' +
  'Actual insurance coverage requires licensed insurer underwriting, statutory approvals, and IRDAI/regulatory compliance.';

// Standard Indian Currency Formatter (e.g. ₹12,50,000)
export function formatINR(amount: number | undefined | null): string {
  if (amount === undefined || amount === null || isNaN(amount)) return '₹0';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

// Compact INR Formatter (e.g. ₹12.5 L)
export function formatINRCompact(amount: number): string {
  if (amount >= 10000000) {
    return `₹${(amount / 10000000).toFixed(2)} Cr`;
  }
  if (amount >= 100000) {
    return `₹${(amount / 100000).toFixed(2)} L`;
  }
  if (amount >= 1000) {
    return `₹${(amount / 1000).toFixed(1)} k`;
  }
  return formatINR(amount);
}

export const COVERED_EVENT_DETAILS: Record<CoveredEventType, {
  label: string;
  badgeColor: string;
  description: string;
  requiredDocuments: string[];
  waitingPeriodDays: number;
}> = {
  sponsor_death: {
    label: 'Primary Sponsor Decease',
    badgeColor: 'bg-rose-100 text-rose-800 border-rose-300',
    description: 'Untimely demise of the enrolled financial sponsor named on the policy.',
    requiredDocuments: [
      'Official Municipal Death Certificate',
      'Policy Bond & KYC of Beneficiary',
      'Current Semester University Fee Demand Notice',
      'Student Enrollment Certificate'
    ],
    waitingPeriodDays: 0, // No waiting period for accidental/demise
  },
  sponsor_permanent_disability: {
    label: 'Sponsor Total Permanent Disability',
    badgeColor: 'bg-amber-100 text-amber-800 border-amber-300',
    description: 'Irreversible physical disability rendering the sponsor unable to earn.',
    requiredDocuments: [
      'Government Disability Medical Board Certificate (min 70%)',
      'Hospital Discharge & Treatment Records',
      'University Fee Demand Notice',
      'Bank Account Verification'
    ],
    waitingPeriodDays: 30,
  },
  sponsor_critical_illness: {
    label: 'Sponsor Critical Illness Diagnosis',
    badgeColor: 'bg-purple-100 text-purple-800 border-purple-300',
    description: 'Diagnosis of a listed severe critical illness (e.g. cancer, stroke, organ failure).',
    requiredDocuments: [
      'Histopathology / Specialist Diagnostic Report',
      'Attending Physician Statement',
      'University Fee Demand Notice',
      'Student ID Proof'
    ],
    waitingPeriodDays: 60,
  },
  sponsor_involuntary_unemployment: {
    label: 'Involuntary Job Loss / Sponsor Insolvency',
    badgeColor: 'bg-blue-100 text-blue-800 border-blue-300',
    description: 'Involuntary retrenchment or formal organizational layoff not due to misconduct.',
    requiredDocuments: [
      'Formal Corporate Retrenchment / Termination Letter',
      'Form 16 / Last 3 Months Salary Slips',
      'University Fee Demand Notice',
      'Proof of Non-Voluntary Resignation'
    ],
    waitingPeriodDays: 90,
  },
  student_medical_interruption: {
    label: 'Student Severe Medical Interruption',
    badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    description: 'Major medical condition requiring medical leave of absence or repeated hospitalization.',
    requiredDocuments: [
      'Hospital Inpatient Admission & Discharge Summary',
      'Dean / Registrar Approved Leave of Absence Memo',
      'University Re-enrollment Fee Schedule'
    ],
    waitingPeriodDays: 30,
  },
};

export const CLAIM_STATUS_MAP: Record<ClaimStatus, {
  label: string;
  stepNumber: number;
  color: string;
  description: string;
}> = {
  draft: {
    label: 'Draft',
    stepNumber: 1,
    color: 'bg-slate-100 text-slate-700 border-slate-300',
    description: 'Claim intake initiated; documentation incomplete.'
  },
  submitted: {
    label: 'Submitted',
    stepNumber: 2,
    color: 'bg-blue-100 text-blue-800 border-blue-300',
    description: 'Submitted by claimant; awaiting triage and document intake check.'
  },
  under_review: {
    label: 'Under Review',
    stepNumber: 3,
    color: 'bg-amber-100 text-amber-800 border-amber-300',
    description: 'Assigned to Claims Adjudication Officer for eligibility assessment.'
  },
  documents_required: {
    label: 'Documents Required',
    stepNumber: 3,
    color: 'bg-orange-100 text-orange-800 border-orange-300',
    description: 'Officer requested additional or clearer legal/medical documents.'
  },
  university_verification: {
    label: 'University Verification',
    stepNumber: 4,
    color: 'bg-indigo-100 text-indigo-800 border-indigo-300',
    description: 'Referred to University Registrar/Bursar to verify student fee liability.'
  },
  approved: {
    label: 'Approved',
    stepNumber: 5,
    color: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    description: 'Claim approved for institution direct disbursement.'
  },
  rejected: {
    label: 'Rejected',
    stepNumber: 5,
    color: 'bg-red-100 text-red-800 border-red-300',
    description: 'Claim ineligible under policy terms, exclusion or waiting period.'
  },
  payment_processing: {
    label: 'Payment Processing',
    stepNumber: 6,
    color: 'bg-teal-100 text-teal-800 border-teal-300',
    description: 'NEFT/RTGS settlement batch initiated to University Escrow account.'
  },
  paid: {
    label: 'Settled & Paid',
    stepNumber: 7,
    color: 'bg-green-100 text-green-800 border-green-300',
    description: 'Fees disbursed directly to University. Student continuity preserved.'
  },
  closed: {
    label: 'Case Closed',
    stepNumber: 7,
    color: 'bg-slate-200 text-slate-800 border-slate-400',
    description: 'Lifecycle completed and archived with complete audit trail.'
  },
};

export const POLICY_STATUS_MAP: Record<PolicyStatus, {
  label: string;
  badgeClass: string;
}> = {
  active: {
    label: 'Active & In-Force',
    badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-300',
  },
  grace_period: {
    label: 'Grace Period (30d)',
    badgeClass: 'bg-amber-100 text-amber-800 border-amber-300',
  },
  lapsed: {
    label: 'Lapsed (Premium Overdue)',
    badgeClass: 'bg-rose-100 text-rose-800 border-rose-300',
  },
  claim_pending: {
    label: 'Claim In Progress',
    badgeClass: 'bg-blue-100 text-blue-800 border-blue-300',
  },
  claimed_settled: {
    label: 'Claim Settled',
    badgeClass: 'bg-purple-100 text-purple-800 border-purple-300',
  },
  terminated: {
    label: 'Terminated / Completed',
    badgeClass: 'bg-slate-100 text-slate-700 border-slate-300',
  },
};

export const ROLE_LABELS: Record<UserRole, { title: string; subtitle: string; icon: string }> = {
  parent: {
    title: 'Parent / Sponsor',
    subtitle: 'Manage child education policies, quotes, premium invoices & claims',
    icon: 'ShieldCheck',
  },
  student: {
    title: 'Student Beneficiary',
    subtitle: 'Track degree coverage, university fee due dates & claim status',
    icon: 'GraduationCap',
  },
  university: {
    title: 'University Registrar',
    subtitle: 'Verify student enrollments, pending tuition dues & receive direct settlements',
    icon: 'School',
  },
  claims_officer: {
    title: 'Claims Officer (ClaimCenter)',
    subtitle: 'Investigate covered events, review documents, adjust & approve claims',
    icon: 'FileSearch',
  },
  admin: {
    title: 'System Administrator (PolicyCenter)',
    subtitle: 'Configure plans, actuarial rules, audit logs & system health',
    icon: 'Settings',
  },
};
