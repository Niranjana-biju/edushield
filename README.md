# EduShield — Higher Education Continuity Insurance Platform

> **B.Tech Capstone Project — Guidewire-Inspired Full-Stack Architecture**
> *Protecting Higher Education Continuum against Sponsor Demise, Permanent Disability, Critical Illness, and Involuntary Retrenchment.*

---

## 📌 Project Overview & Purpose

**EduShield** is an education continuity insurance web application developed to safeguard students' higher education journey against unforeseen financial disruptions affecting their primary earning sponsor. 

Unlike traditional education loans or term life policies that pay lump-sum unmonitored cash, **EduShield** implements an **Institutional Direct Payout Protocol**: approved tuition fee claims are remitted directly via NEFT/RTGS to the student's enrolled **University Fee Escrow Account**, ensuring zero leakage and guaranteeing that student enrollment and degree progression are uninterrupted.

### Primary Workflow
```
[Parent / Sponsor]           [PolicyCenter]               [BillingCenter]
  Obtain Quote       ───►  Bind & Issue Policy  ───►  Invoice & Premium Payment
                                                              │
                                                              ▼
                                                        [Disruption Event]
                                                              │
[ClaimCenter]                [University Bursar]              ▼
  Officer Adjudication ◄───  Fee Certification  ◄───  File Claim & Upload Docs
        │
        ▼
[Settlement Unit]
  Direct NEFT Disbursement to University Escrow ──►  Degree Continuity Preserved
```

---

## 🏛️ Guidewire-Inspired Architecture

EduShield demonstrates enterprise property and casualty (P&C) insurance patterns inspired by Guidewire:

1. **PolicyCenter (Underwriting & Inception):**
   - Configurable insurance plans: *Essential Scholar*, *Campus Shield Plus*, *Global EduGuard*, and *Executive Continuity*.
   - Deterministic sample actuarial rating: Tuition exposure, sponsor age gradient, course tenure loading, deductible co-pay discounts, and rider add-ons.
   - Statutory 18% GST computation and policy bond generation with immutable term schedules.

2. **BillingCenter (Receivables & Reconciliation):**
   - Premium invoice generation (`INV-EDU-YYYY-XXXXX`) with line-item breakdowns.
   - Payment processing with simulated instant gateways (UPI / QR, Credit/Debit Card, NetBanking).
   - Real-time policy activation and grace period tracking.

3. **ClaimCenter (FNOL, Triage, & Settlement):**
   - First Notice of Loss (FNOL) intake with private, encrypted document attachment.
   - Distinct separation of financial fields: **Requested Amount**, **University Verified Fee**, **Eligible Coverage Cap**, **Deductible Co-Pay**, **Approved Settlement**, and **Actually Paid**.
   - Strict status transition state machine: `Draft` → `Submitted` → `Under Review` → `Documents Required` / `University Verification` → `Approved` / `Rejected` → `Payment Processing` → `Paid / Closed`.
   - Immutable chronological audit and adjudication logs (`ClaimReviewLog`).

---

## 💡 EduShield Continuity Intelligence (Key Innovations)

1. **Funding-Gap Calculator:**
   - Multi-year deterministic compounding of college tuition and campus hostel fees with inflation indexation ($4\%$–$12\%$).
   - Interactive Recharts visualization comparing inflation trajectory, available family reserves, and insurance protection.
   - Vulnerability severity scoring (`fully_covered`, `moderate_gap`, `high_vulnerability`) and recommended coverage upgrades.

2. **AI Policy Clause Assistant:**
   - Natural language policy assistant powered by Google Gemini (or local fallback).
   - Explicitly cites policy clauses (e.g. *Clause 3.1 Moratorium*, *Section 6.4 Exclusions*, *Section 7.2 Escrow Protocol*).
   - Transparent disclaimer: AI is strictly advisory and cannot approve/reject claims or disburse funds.

3. **AI Claim-Document Assistant:**
   - Optical document categorization (Medical Reports, Layoff Notices, University Fee Vouchers, Municipal Certificates).
   - Cross-references extracted fields against policy beneficiary databases to highlight mismatches or missing dates.

4. **Claim-Readiness Checklist:**
   - 6-point deterministic completeness checklist verifying in-force policy status, waiting period clearance, substantiation documents, registrar certification, and bank escrow accounts.

5. **Explainable Next Steps:**
   - Contextual guidance tailored to the user's active role and current claim state.

---

## 👥 Five Role-Specific Personas (1-Click Switcher)

An interactive top simulation bar allows instant switching between all 5 personas:

| Persona | Name | Role | Primary Capabilities |
| :--- | :--- | :--- | :--- |
| **Parent / Sponsor** | Rajesh Sharma | `parent` | Quotes, in-force policies, premium payments, FNOL claim submission |
| **Student Beneficiary** | Ananya Sharma | `student` | Degree track, fee schedule, protected limit, settlement status |
| **Claims Officer** | Pooja Verma | `claims_officer` | ClaimCenter triage, document inspection, adjudication, payout execution |
| **University Bursar** | Dr. S. Ramanathan | `university` | Student enrollment verification, pending fee certification, escrow accounts |
| **System Administrator** | Vikram Malhotra | `admin` | Actuarial plan configuration, portfolio loss ratio, system audit logs |

---

## 🛠️ Technology Stack

- **Frontend:** React 18, TypeScript, Vite
- **Styling:** Tailwind CSS (Enterprise Blue `#0284c7`, Teal `#0d9488`, Navy `#0f172a`, Emerald `#10b981`)
- **Routing:** React Router v6
- **Charts:** Recharts
- **Icons:** Lucide React
- **Backend / Cloud:** Cloud Firestore, Firebase Storage, Firebase Auth, Cloud Functions (with standalone offline fallback)
- **AI Integration:** Google Gemini 1.5 Flash (with offline deterministic fallback)
- **Testing:** Vitest, Node test environment

---

## 🚀 Getting Started & Execution

### Prerequisites
- Node.js v18+ (tested on Node v24)
- npm v9+

### 1. Installation
Clone repository and navigate to the project root:
```bash
cd scratch/edushield
npm install
```

### 2. Environment Variables (Optional)
Copy the example environment template:
```bash
cp .env.example .env
```
*(If omitted, EduShield automatically runs in standalone offline mode with pre-seeded realistic data!)*

### 3. Run Development Server
```bash
npm run dev
```
Open your browser at `http://localhost:5173`.

### 4. Run Automated Test Suite
```bash
npm test
```
Runs all 12 Vitest unit and integration tests verifying rating calculations, Guidewire transitions, funding gap formulas, and AI fallbacks.

### 5. Production Build
```bash
npm run build
```
Generates production-ready distribution files in `dist/`.

---

## ⚖️ Academic Regulatory Disclaimer
*EduShield is a simulated academic prototype developed for a B.Tech Capstone Project. Premium rates, claims workflows, and institutional escrow transfers are simulated demonstrations. Actual commercial insurance underwriting requires licensed insurers, legal contracts, and statutory approval by the Insurance Regulatory and Development Authority of India (IRDAI).*
