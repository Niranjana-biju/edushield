# EduShield: Comprehensive Technical Project Documentation

**A Guidewire-Inspired Higher Education Continuity Insurance Platform with Institutional Escrow Settlement & Continuity Intelligence**

---

## Table of Contents
1. [Abstract & Problem Statement](#1-abstract--problem-statement)
2. [Project Objectives](#2-project-objectives)
3. [System Architecture & Design Patterns](#3-system-architecture--design-patterns)
4. [Technology Stack](#4-technology-stack)
5. [Cloud Firestore Data Schema](#5-cloud-firestore-data-schema)
6. [Functional Modules](#6-functional-modules)
   - PolicyCenter (Quotes & Inception)
   - BillingCenter (Invoices & Premiums)
   - ClaimCenter (FNOL, Triage & Adjudication)
   - University Bursar Verification & Direct Escrow Settlement
7. [Actuarial & Financial Calculations](#7-actuarial--financial-calculations)
8. [Security, Roles & Access Control](#8-security-roles--access-control)
9. [AI Continuity Intelligence & Limitations](#9-ai-continuity-intelligence--limitations)
10. [Automated Test Suite & Verification](#10-automated-test-suite--verification)
11. [Deployment & Operations](#11-deployment--operations)
12. [Future Enhancements](#12-future-enhancements)

---

## 1. Abstract & Problem Statement

### 1.1 Abstract
In India and emerging markets, over 85% of private higher education expenses are funded directly from current household cash flows or sponsor income. When a primary sponsor experiences untimely decease, severe critical illness, total permanent disability, or sudden corporate retrenchment, students face immediate financial distress, leading to semester fee arrears, forced leaves of absence, or permanent academic dropouts.

**EduShield** addresses this vulnerability by introducing a specialized **higher education continuity insurance framework**. Architected around industry-standard Guidewire Property & Casualty concepts (PolicyCenter, BillingCenter, and ClaimCenter), EduShield provides transparent quote underwriting, automated billing, and an **Institutional Direct Payout Protocol**: upon adjudication of a covered disruption event, approved fee settlements are disbursed directly to the verified **University Tuition Escrow Account** rather than discretionary lump-sum cash.

### 1.2 Problem Statement
Existing financial mechanisms exhibit distinct limitations:
1. **Education Loans:** Require immediate repayment servicing and add debt burdens to families in crisis.
2. **Term Life Policies:** Pay unmonitored cash payouts to nominated family members, frequently diverted to medical bills or debt settlements, leaving semester college fees unpaid.
3. **Institutional Fee Deadlines:** Universities lack automated verification channels to validate insurance commitments, forcing administrative de-registration of impacted students.

---

## 2. Project Objectives

1. **Demonstrate Guidewire-Inspired Insurance Lifecycle:** Replicate enterprise policy generation, invoicing, claims investigation, document check, registrar verification, and settlement workflows.
2. **Deterministic & Transparent Rating:** Compute sample actuarial premiums without hidden factors, factoring in degree exposure, sponsor age, tenure loadings, deductible co-pays, and statutory taxes.
3. **Institutional Escrow Settlement:** Ensure zero cash leakage by routing approved claim disbursements directly to authenticated university registrar bank accounts.
4. **Continuity Intelligence:**
   - Multi-year education funding-gap analysis incorporating compounded inflation.
   - Transparent AI policy clause explanation citing explicit policy articles.
   - Optical document analysis identifying document type and checking policy match.
   - Objective claim-readiness checklist.
5. **Robust Security & RBAC:** Enforce strict role-based authorization across Parents, Students, Claims Officers, University Registrars, and Administrators.

---

## 3. System Architecture & Design Patterns

The EduShield architecture decouples presentation, domain business logic, data persistence, and intelligence services:

```
┌────────────────────────────────────────────────────────────────────────┐
│                        User Interface Layer                            │
│  React 18 • TypeScript • Tailwind CSS • Lucide Icons • Recharts        │
│  Guardian Portal • Student Track • ClaimCenter • Bursar Desk • Admin   │
└────────────────────────────────────┬───────────────────────────────────┘
                                     │
┌────────────────────────────────────▼───────────────────────────────────┐
│                    Application State & Context                         │
│       AuthContext (RBAC)      │      InsuranceContext (Guidewire)      │
└──────────────────┬─────────────────────────────────┬───────────────────┘
                   │                                 │
┌──────────────────▼──────────────┐   ┌──────────────▼───────────────────┐
│       Core Domain Services      │   │   EduShield Continuity Intel     │
│ • QuoteService (Rating Matrix)  │   │ • FundingGapCalculator           │
│ • PolicyService (PolicyCenter)  │   │ • AIPolicyAssistant              │
│ • BillingService (BillingCenter)│   │ • AIDocumentAssistant            │
│ • ClaimService (ClaimCenter)    │   │ • ClaimReadinessChecklist        │
│ • AuditService (Append-Only)    │   │ • ExplainableNextSteps           │
└──────────────────┬──────────────┘   └──────────────┬───────────────────┘
                   │                                 │
┌──────────────────▼─────────────────────────────────▼───────────────────┐
│                      Infrastructure & Cloud Layer                      │
│ Cloud Firestore • Firebase Storage • Firebase Hosting • Gemini API /   │
│ Standalone Offline Deterministic Persistence Engine                    │
└────────────────────────────────────────────────────────────────────────┘
```

### Architectural Principles
- **Domain-Driven Design (DDD):** Domain entities (`EducationPolicy`, `PremiumInvoice`, `EducationClaim`, `UniversityVerification`) maintain distinct states and validate state transitions before mutation.
- **Guidewire Finite State Machine (FSM):** Status changes in claims follow strict allowed paths (`Draft` → `Submitted` → `Under Review` → `University Verification` → `Approved` → `Paid`). Skipping or illegal transitions throw explicit runtime errors.
- **Append-Only Auditing:** Every policy issuance, invoice payment, and claim transition appends an immutable `AuditLogEntry` recording timestamp, actor role, previous state, and new state.

---

## 4. Technology Stack

| Component | Technology | Version | Purpose |
| :--- | :--- | :--- | :--- |
| **Runtime / Package Manager** | Node.js / npm | v24 / v11 | Engine runtime & build ecosystem |
| **Frontend Framework** | React 18 | 18.3.1 | Component-driven declarative UI |
| **Language** | TypeScript | 5.6.2 | Strict static type safety & domain modeling |
| **Bundler & Dev Server** | Vite | 5.4.6 | Fast HMR and optimized production bundling |
| **Styling & Design System** | Tailwind CSS | 3.4.11 | Custom utility tokens (Brand Blue, Teal, Slate) |
| **Navigation** | React Router | 6.26.2 | Role-based declarative client-side routing |
| **Data Visualizations** | Recharts | 2.12.7 | Interactive Bar, Pie & Area charts for portfolios |
| **Form Management** | React Hook Form & Zod | 7.53 / 3.23 | Robust form validation & error boundaries |
| **Cloud Backend** | Cloud Firestore / Auth | Firebase 10.13 | Document DB, RBAC token claims & Storage |
| **Artificial Intelligence** | Google Gemini 1.5 Flash | 1.5 | Advisory clause explanations with local fallback |
| **Automated Testing** | Vitest | 2.1.1 | Unit, integration & domain state machine testing |

---

## 5. Cloud Firestore Data Schema

The Firestore schema models the core insurance entities:

### 5.1 `users` Collection
```typescript
interface UserProfile {
  id: string; // Auth UID
  email: string;
  displayName: string;
  role: 'parent' | 'student' | 'university' | 'claims_officer' | 'admin';
  phone?: string;
  kycStatus: 'unverified' | 'pending' | 'verified';
  organization?: string;
  createdAt: string; // ISO 8601
}
```

### 5.2 `insurancePlans` Collection
```typescript
interface InsurancePlan {
  id: string;
  code: string; // e.g. EDU-CMP-02
  name: string;
  tier: 'essential' | 'campus_plus' | 'global_continuity' | 'executive';
  maxTuitionCoverage: number; // in INR
  maxLivingAllowanceAnnual: number;
  waitingPeriodDays: number; // 0, 15, 30, 60, 90
  deductiblePercentage: number; // 0%, 5%, 10%
  baseRatePerLakh: number; // e.g. 560 INR per 1 Lakh coverage
  coveredEvents: CoveredEventType[];
  standardExclusions: string[];
  availableRiders: RiderConfig[];
  isActive: boolean;
}
```

### 5.3 `educationPolicies` Collection (PolicyCenter)
```typescript
interface EducationPolicy {
  id: string;
  policyNumber: string; // EDU-POL-YYYY-XXXX
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
  status: 'active' | 'grace_period' | 'lapsed' | 'claim_pending' | 'claimed_settled' | 'terminated';
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
```

### 5.4 `premiumInvoices` & `premiumPayments` (BillingCenter)
```typescript
interface PremiumInvoice {
  id: string;
  invoiceNumber: string; // INV-EDU-YYYY-XXXXX
  policyId: string;
  policyNumber: string;
  guardianId: string;
  dueDate: string;
  billingPeriod: string;
  baseAmount: number;
  taxAmount: number; // 18% GST
  totalAmount: number;
  status: 'draft' | 'issued' | 'paid' | 'overdue' | 'cancelled';
  paidAt?: string;
  paymentRef?: string;
}

interface PremiumPayment {
  id: string;
  paymentNumber: string;
  invoiceId: string;
  policyId: string;
  amount: number;
  paymentMethod: 'UPI' | 'CreditCard' | 'DebitCard' | 'NetBanking';
  transactionRef: string;
  gatewayResponse: 'SUCCESS' | 'FAILURE';
  paidAt: string;
}
```

### 5.5 `educationClaims` Collection (ClaimCenter)
```typescript
interface EducationClaim {
  id: string;
  claimNumber: string; // CLM-YYYY-XXXXX
  policyId: string;
  policyNumber: string;
  studentId: string;
  studentName: string;
  guardianId: string;
  universityId: string;
  universityName: string;
  eventType: CoveredEventType;
  eventDate: string;
  claimDescription: string;
  
  // Explicitly segregated financial amounts:
  requestedAmount: number;
  universityVerifiedFeeAmount: number;
  eligibleCoverageLimit: number;
  deductibleApplied: number;
  approvedAmount: number;
  actuallyPaidAmount: number;
  
  status: ClaimStatus;
  decisionReason?: string;
  assignedOfficerId?: string;
  assignedOfficerName?: string;
  documents: ClaimDocument[];
  reviewHistory: ClaimReviewLog[];
  settlement?: ClaimPaymentSettlement;
  submittedAt: string;
  decidedAt?: string;
  closedAt?: string;
}
```

### 5.6 `universities` & `universityVerifications`
```typescript
interface University {
  id: string;
  name: string;
  code: string;
  bankAccountEscrow: {
    accountName: string;
    accountNumber: string;
    ifscCode: string;
    bankName: string;
    branch: string;
  };
  verifiedRepEmail: string;
}

interface UniversityVerification {
  id: string;
  claimId: string;
  studentId: string;
  universityId: string;
  academicYear: string;
  semester: string;
  isStudentEnrolled: boolean;
  officialPendingFee: number;
  feeDueDate: string;
  escrowVerified: boolean;
  officialRemarks: string;
  verifiedBy: string;
  status: 'pending' | 'verified' | 'disputed' | 'waived';
}
```

---

## 6. Functional Modules

### 6.1 PolicyCenter (Quotes & Policy Lifecycle)
- **Wizard Driven Inception:** Collects student enrollment details, university selection, academic tenure, and sponsor medical declaration.
- **Deterministic Rating Engine:** Instantly evaluates risk multipliers without opaque algorithms.
- **Quote Comparison & Expiry:** Generates 30-day binding quotes with comparison views across Essential, Campus Shield Plus, Global, and Executive tiers.

### 6.2 BillingCenter (Premium Accounting)
- **Automated Tax Invoicing:** Formulates invoices separating base net premium and statutory 18% GST.
- **Instant Gateway Simulation:** Real-time reconciliation of UPI (GooglePay, PhonePe, BHIM), Credit/Debit cards, and NetBanking with unique transaction references.
- **Grace Period Management:** Flags overdue accounts and updates policy in-force states.

### 6.3 ClaimCenter (Adjudication & Investigation)
- **First Notice of Loss (FNOL):** Claimants file disruption claims for Sponsor Demise, Disability, Critical Illness, Involuntary Retrenchment, or Student Medical Interruption.
- **Multi-Role Triage Queue:** Claims officers inspect AI document classifications, review waiting period criteria, request supplementary documents, or assign claims for registrar verification.

### 6.4 University Verification & Direct Settlement
- **Bursar Certification:** University representatives log into a dedicated portal to certify whether the student is bonafide and in good standing, confirm pending semester fee arrears, and validate institutional bank accounts.
- **Direct Payout Protocol:** Approved payments trigger an electronic NEFT/RTGS transaction directly to the university fee escrow account (`NEFT_ESCROW`), completing the degree continuity promise.

---

## 7. Actuarial & Financial Calculations

### 7.1 Premium Calculation Formula
The deterministic gross annual premium is derived from the following actuarial demonstration formula:

$$\text{Base Tuition Exposure} = \min(\text{Annual Tuition} \times \text{Remaining Years}, \text{Plan Max Coverage})$$

$$\text{Base Rate Amount} = \left(\frac{\text{Base Tuition Exposure}}{100,000}\right) \times \text{Plan Base Rate Per Lakh}$$

$$\text{Core Risk Premium} = \text{Base Rate Amount} \times M_{\text{age}} \times D_{\text{tenure}} \times H_{\text{health}} \times (1 - \text{Discount}_{\text{deductible}})$$

$$\text{Net Annual Premium} = \text{Core Risk Premium} + \sum \text{Rider Fees}$$

$$\text{Gross Annual Premium} = \text{Net Annual Premium} + (\text{Net Annual Premium} \times 0.18)$$

Where:
- $M_{\text{age}}$: Sponsor age multiplier ($1.0\times$ for $\le 40$, $1.15\times$ for $41-50$, $1.35\times$ for $51-60$, $1.60\times$ for $>60$).
- $D_{\text{tenure}}$: Course duration factor ($0.95\times$ for $\le 2$ yrs, $1.0\times$ for $3-4$ yrs, $1.10\times$ for $\ge 5$ yrs).
- $H_{\text{health}}$: Pre-existing condition risk factor ($1.25\times$ if declared, $1.0\times$ standard).
- $\text{Discount}_{\text{deductible}}$: Co-pay deductible discount ($0\%$ for $0\%$ co-pay, $8\%$ for $5\%$ co-pay, $15\%$ for $10\%$ co-pay).

### 7.2 Multi-Year Funding-Gap Formula
Future education cost compounded with annual inflation rate $r$:

$$\text{Year } t \text{ Tuition} = \text{Annual Tuition} \times (1 + r)^{t-1}$$
$$\text{Year } t \text{ Living} = \text{Annual Living} \times (1 + r)^{t-1}$$
$$\text{Total Future Cost} = \sum_{t=1}^{N} \left(\text{Year } t \text{ Tuition} + \text{Year } t \text{ Living}\right)$$

$$\text{Available Resources} = \text{Family Savings} + \text{Scholarships}$$
$$\text{Net Uncovered Gap} = \max(0, \text{Total Future Cost} - (\text{Insurance Coverage} + \text{Available Resources}))$$

---

## 8. Security, Roles & Access Control

### 8.1 Role-Based Access Control (RBAC) Matrix
| Resource / Action | Parent | Student | Claims Officer | University Bursar | Admin |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **Get Quote** | Create | View Own | Create | Read Only | Full |
| **View Policies** | Own | Own | All | None | Full |
| **Pay Premium** | Own | None | None | None | Admin Override |
| **File Claim** | Create Own | View Own | Create Assist | None | Full |
| **Review & Adjudicate Claims** | None | None | Full | None | Full |
| **Certify University Fees** | None | None | View | Full (Own Univ) | Full |
| **Execute Escrow Settlement** | None | None | Authorized | None | Full |
| **View Audit Trail** | None | None | Activity | None | Full |

### 8.2 Restrictive Cloud Rules
- **Firestore Rules (`firestore.rules`):** Prevents privilege escalation (`request.auth.uid == userId` cannot modify `role` or `kycStatus`). Protects claim files so only the claimant, assigned claims officer, or admin can read document attachments.
- **Storage Rules (`storage.rules`):** Restricts document uploads to verified MIME types (`application/pdf`, `image/jpeg`, `image/png`) and caps file size at 10MB.

---

## 9. AI Continuity Intelligence & Limitations

### 9.1 Responsible AI Guardrails
As mandated in Section 5 of the specification:
1. **Advisory Role Only:** AI models (Gemini 1.5 Flash) provide clause explanations, summaries, and document classification assistance.
2. **No Autonomous Decisions:** AI **never** independently approves, rejects, denies coverage, or initiates payment disbursement.
3. **Transparent Fallback:** If network isolation, API quota, or model unavailability occurs, the system automatically falls back to the deterministic local rule engine without user disruption.
4. **Untrusted Uploads:** Document text parsed via OCR is strictly treated as untrusted user input and cross-matched against structured database records before presentation to human adjudicators.

---

## 10. Automated Test Suite & Verification

The project includes an automated Vitest test suite (`npm test`) validating core insurance calculations, lifecycle state machines, and AI fallbacks.

### Test Results Summary
```
 RUN  v2.1.9 C:/Users/niran/.gemini/antigravity/scratch/edushield

 ✓ src/test/fundingGap.test.ts (4 tests)
    ✓ correctly calculates multi-year compounded education inflation and funding gaps
    ✓ identifies fully covered scenario when insurance + savings exceed future costs
    ✓ provides explainable clause citations in the AI Policy Assistant
    ✓ handles offline AI fallback gracefully without throwing errors
 ✓ src/test/quoteService.test.ts (4 tests)
    ✓ calculates deterministic base premium for a standard profile
    ✓ applies sponsor age mortality loadings correctly for age > 50 and > 60
    ✓ applies pre-existing condition loadings and deductible discounts
    ✓ enforces maximum tuition coverage limits defined in the plan
 ✓ src/test/claimService.test.ts (4 tests)
    ✓ creates an FNOL claim with initial submitted status and review history log
    ✓ enforces valid Guidewire lifecycle status transitions
    ✓ throws an error when an invalid status skip transition is attempted
    ✓ executes direct institutional escrow settlement properly

 Test Files  3 passed (3)
      Tests  12 passed (12)
   Duration  6.03s
```

---

## 11. Deployment & Operations

### 11.1 Build Verification
- Production build executed with `tsc && vite build`.
- Zero TypeScript errors across all components, stores, and services.
- Distribution bundle generated in `dist/` containing optimized JS, CSS, and HTML.

### 11.2 Firebase Hosting Deployment
Deploying to live Firebase Hosting:
```bash
firebase login
firebase use your-project-id
firebase deploy --only hosting,firestore:rules,storage:rules
```

---

## 12. Future Enhancements

1. **Automated Academic Digilocker Integration:** Fetch verified National Academic Depository (NAD) records directly to bypass manual bonafide certificate uploads.
2. **Account Aggregator (AA) Framework Integration:** Automate underwriting verification of sponsor monthly income without uploading physical Form 16s.
3. **Smart Contract Escrow on Polygon/Ethereum:** Immutable on-chain programmable escrow releasing tuition funds upon registrar cryptographic signature.
4. **Multi-Currency Cross-Border Forex Hedges:** Dynamic hedging against currency depreciation for international students enrolled in UK, US, and EU institutions.
