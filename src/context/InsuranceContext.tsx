import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  EducationPolicy,
  Quote,
  PremiumInvoice,
  PremiumPayment,
  EducationClaim,
  Student,
  University,
  UniversityVerification,
  NotificationItem,
  AuditLogEntry,
  ClaimStatus,
  UserRole
} from '../types/insurance';
import {
  SEED_POLICIES,
  SEED_INVOICES,
  SEED_PAYMENTS,
  SEED_CLAIMS,
  SEED_STUDENTS,
  SEED_UNIVERSITIES,
  SEED_UNIVERSITY_VERIFICATIONS,
  SEED_NOTIFICATIONS,
  SEED_AUDIT_LOGS
} from '../services/mockSeedData';
import { AuditService } from '../services/auditService';
import { ClaimService } from '../services/claimService';
import { BillingService } from '../services/billingService';

interface InsuranceContextType {
  policies: EducationPolicy[];
  quotes: Quote[];
  invoices: PremiumInvoice[];
  payments: PremiumPayment[];
  claims: EducationClaim[];
  students: Student[];
  universities: University[];
  verifications: UniversityVerification[];
  notifications: NotificationItem[];
  auditLogs: AuditLogEntry[];

  // Workflow Actions
  addQuote: (quote: Quote) => void;
  addPolicy: (policy: EducationPolicy) => void;
  addClaim: (claim: EducationClaim) => void;
  updateClaimStatus: (params: {
    claimId: string;
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
  }) => void;
  processInvoicePayment: (params: {
    invoiceId: string;
    paymentMethod: 'UPI' | 'CreditCard' | 'DebitCard' | 'NetBanking';
  }) => void;
  verifyUniversityClaim: (params: {
    verificationId: string;
    feeDemandAmount: number;
    feeDueDate: string;
    isEnrolled: boolean;
    remarks: string;
    verifiedBy: string;
  }) => void;
  executeClaimSettlement: (claimId: string, officerName: string) => void;
  addNotification: (notif: Omit<NotificationItem, 'id' | 'createdAt' | 'isRead'>) => void;
  markNotificationRead: (notifId: string) => void;
  resetAllToSeed: () => void;
}

const InsuranceContext = createContext<InsuranceContextType | undefined>(undefined);

export const InsuranceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [policies, setPolicies] = useState<EducationPolicy[]>(() => {
    const s = localStorage.getItem('edushield_policies');
    return s ? JSON.parse(s) : SEED_POLICIES;
  });

  const [quotes, setQuotes] = useState<Quote[]>(() => {
    const s = localStorage.getItem('edushield_quotes');
    return s ? JSON.parse(s) : [];
  });

  const [invoices, setInvoices] = useState<PremiumInvoice[]>(() => {
    const s = localStorage.getItem('edushield_invoices');
    return s ? JSON.parse(s) : SEED_INVOICES;
  });

  const [payments, setPayments] = useState<PremiumPayment[]>(() => {
    const s = localStorage.getItem('edushield_payments');
    return s ? JSON.parse(s) : SEED_PAYMENTS;
  });

  const [claims, setClaims] = useState<EducationClaim[]>(() => {
    const s = localStorage.getItem('edushield_claims');
    return s ? JSON.parse(s) : SEED_CLAIMS;
  });

  const [students] = useState<Student[]>(SEED_STUDENTS);
  const [universities] = useState<University[]>(SEED_UNIVERSITIES);

  const [verifications, setVerifications] = useState<UniversityVerification[]>(() => {
    const s = localStorage.getItem('edushield_verifications');
    return s ? JSON.parse(s) : SEED_UNIVERSITY_VERIFICATIONS;
  });

  const [notifications, setNotifications] = useState<NotificationItem[]>(() => {
    const s = localStorage.getItem('edushield_notifications');
    return s ? JSON.parse(s) : SEED_NOTIFICATIONS;
  });

  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(() => {
    const s = localStorage.getItem('edushield_audit_logs');
    return s ? JSON.parse(s) : SEED_AUDIT_LOGS;
  });

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('edushield_policies', JSON.stringify(policies));
  }, [policies]);

  useEffect(() => {
    localStorage.setItem('edushield_quotes', JSON.stringify(quotes));
  }, [quotes]);

  useEffect(() => {
    localStorage.setItem('edushield_invoices', JSON.stringify(invoices));
  }, [invoices]);

  useEffect(() => {
    localStorage.setItem('edushield_payments', JSON.stringify(payments));
  }, [payments]);

  useEffect(() => {
    localStorage.setItem('edushield_claims', JSON.stringify(claims));
  }, [claims]);

  useEffect(() => {
    localStorage.setItem('edushield_verifications', JSON.stringify(verifications));
  }, [verifications]);

  useEffect(() => {
    localStorage.setItem('edushield_notifications', JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem('edushield_audit_logs', JSON.stringify(auditLogs));
  }, [auditLogs]);

  const addQuote = (quote: Quote) => {
    setQuotes(prev => [quote, ...prev]);
    const log = AuditService.logAction({
      actorId: quote.guardianId,
      actorName: 'Guardian',
      actorRole: 'parent',
      action: 'QUOTE_CREATED',
      entityType: 'quote',
      entityId: quote.id,
      notes: `Generated quote ${quote.quoteNumber} for ₹${quote.sumInsured.toLocaleString('en-IN')}`,
    });
    setAuditLogs(prev => [log, ...prev]);
  };

  const addPolicy = (policy: EducationPolicy) => {
    setPolicies(prev => [policy, ...prev]);
    // Create initial invoice in BillingCenter
    const invoice = BillingService.generateInvoice(policy);
    setInvoices(prev => [invoice, ...prev]);

    const log = AuditService.logAction({
      actorId: policy.guardianId,
      actorName: policy.guardianName,
      actorRole: 'parent',
      action: 'POLICY_ISSUED',
      entityType: 'policy',
      entityId: policy.id,
      notes: `Issued Policy ${policy.policyNumber} for student ${policy.studentName}`,
    });
    setAuditLogs(prev => [log, ...prev]);
  };

  const addClaim = (claim: EducationClaim) => {
    setClaims(prev => [claim, ...prev]);

    // Also create initial University Verification entity for Bursar
    const verif: UniversityVerification = {
      id: `verif_${Date.now()}`,
      claimId: claim.id,
      studentId: claim.studentId,
      universityId: claim.universityId,
      academicYear: '2025-2026',
      semester: 'Current Semester',
      isStudentEnrolled: true,
      officialPendingFee: claim.requestedAmount,
      feeDueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      escrowVerified: true,
      officialRemarks: 'Pending bursar fee demand verification.',
      verifiedBy: 'Pending University Assignment',
      status: 'pending',
    };
    setVerifications(prev => [verif, ...prev]);

    const log = AuditService.logAction({
      actorId: claim.guardianId,
      actorName: claim.guardianName,
      actorRole: 'parent',
      action: 'CLAIM_SUBMITTED',
      entityType: 'claim',
      entityId: claim.id,
      notes: `Claim ${claim.claimNumber} submitted for ${claim.eventType} (₹${claim.requestedAmount.toLocaleString('en-IN')})`,
    });
    setAuditLogs(prev => [log, ...prev]);
  };

  const updateClaimStatus = (params: {
    claimId: string;
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
  }) => {
    setClaims(prev => {
      const claim = prev.find(c => c.id === params.claimId);
      if (!claim) return prev;

      const updated = ClaimService.transitionClaimStatus({
        claim,
        newStatus: params.newStatus,
        reviewerId: params.reviewerId,
        reviewerName: params.reviewerName,
        reviewerRole: params.reviewerRole,
        actionTaken: params.actionTaken,
        reasons: params.reasons,
        internalNotes: params.internalNotes,
        approvedAmount: params.approvedAmount,
        deductibleApplied: params.deductibleApplied,
        universityVerifiedFeeAmount: params.universityVerifiedFeeAmount,
      });

      const log = AuditService.logAction({
        actorId: params.reviewerId,
        actorName: params.reviewerName,
        actorRole: params.reviewerRole,
        action: `CLAIM_TRANSITION_${params.newStatus.toUpperCase()}`,
        entityType: 'claim',
        entityId: claim.id,
        previousState: { status: claim.status },
        newState: { status: params.newStatus, approvedAmount: params.approvedAmount },
        notes: params.reasons,
      });
      setAuditLogs(p => [log, ...p]);

      return prev.map(c => c.id === params.claimId ? updated : c);
    });
  };

  const processInvoicePayment = (params: {
    invoiceId: string;
    paymentMethod: 'UPI' | 'CreditCard' | 'DebitCard' | 'NetBanking';
  }) => {
    const inv = invoices.find(i => i.id === params.invoiceId);
    if (!inv) return;

    const { payment, updatedInvoice } = BillingService.processPayment({
      invoice: inv,
      paymentMethod: params.paymentMethod,
    });

    setInvoices(prev => prev.map(i => i.id === params.invoiceId ? updatedInvoice : i));
    setPayments(prev => [payment, ...prev]);

    const log = AuditService.logAction({
      actorId: inv.guardianId,
      actorName: inv.guardianName,
      actorRole: 'parent',
      action: 'PREMIUM_PAYMENT_PROCESSED',
      entityType: 'payment',
      entityId: payment.id,
      notes: `Received ₹${payment.amount.toLocaleString('en-IN')} via ${params.paymentMethod} (Ref: ${payment.transactionRef})`,
    });
    setAuditLogs(prev => [log, ...prev]);
  };

  const verifyUniversityClaim = (params: {
    verificationId: string;
    feeDemandAmount: number;
    feeDueDate: string;
    isEnrolled: boolean;
    remarks: string;
    verifiedBy: string;
  }) => {
    setVerifications(prev => prev.map(v => {
      if (v.id !== params.verificationId) return v;
      return {
        ...v,
        officialPendingFee: params.feeDemandAmount,
        feeDueDate: params.feeDueDate,
        isStudentEnrolled: params.isEnrolled,
        officialRemarks: params.remarks,
        verifiedBy: params.verifiedBy,
        verifiedAt: new Date().toISOString(),
        status: 'verified',
      };
    }));

    // Also update claim with university verified fee amount
    const targetVerif = verifications.find(v => v.id === params.verificationId);
    if (targetVerif) {
      setClaims(prev => prev.map(c => {
        if (c.id !== targetVerif.claimId) return c;
        return {
          ...c,
          universityVerifiedFeeAmount: params.feeDemandAmount,
          reviewHistory: [
            ...c.reviewHistory,
            {
              id: `rev_${Date.now()}`,
              claimId: c.id,
              reviewerId: 'registrar_rep',
              reviewerName: params.verifiedBy,
              reviewerRole: 'university',
              actionTaken: 'University Fee Certification',
              previousStatus: c.status,
              newStatus: c.status,
              reasons: `University Bursar certified pending semester fees of ₹${params.feeDemandAmount.toLocaleString('en-IN')}. Student active enrollment confirmed.`,
              timestamp: new Date().toISOString(),
            }
          ]
        };
      }));
    }
  };

  const executeClaimSettlement = (claimId: string, officerName: string) => {
    const claim = claims.find(c => c.id === claimId);
    if (!claim) return;
    const university = universities.find(u => u.id === claim.universityId) || universities[0];

    const settlementAmount = claim.approvedAmount || claim.universityVerifiedFeeAmount || claim.requestedAmount;
    const { claim: updatedClaim } = ClaimService.executeUniversitySettlement({
      claim,
      university,
      settlementAmount,
      officerName,
    });

    setClaims(prev => prev.map(c => c.id === claimId ? updatedClaim : c));

    // Deduct remaining coverage from policy
    setPolicies(prev => prev.map(p => {
      if (p.id !== claim.policyId) return p;
      return {
        ...p,
        remainingCoverage: Math.max(0, p.remainingCoverage - settlementAmount),
        status: 'claimed_settled',
      };
    }));

    const log = AuditService.logAction({
      actorId: 'officer',
      actorName: officerName,
      actorRole: 'claims_officer',
      action: 'DIRECT_UNIVERSITY_SETTLEMENT_EXECUTED',
      entityType: 'claim',
      entityId: claim.id,
      notes: `Disbursed ₹${settlementAmount.toLocaleString('en-IN')} directly to ${university.name} Escrow A/C.`,
    });
    setAuditLogs(prev => [log, ...prev]);
  };

  const addNotification = (notif: Omit<NotificationItem, 'id' | 'createdAt' | 'isRead'>) => {
    const newItem: NotificationItem = {
      ...notif,
      id: `notif_${Date.now()}`,
      createdAt: new Date().toISOString(),
      isRead: false,
    };
    setNotifications(prev => [newItem, ...prev]);
  };

  const markNotificationRead = (notifId: string) => {
    setNotifications(prev => prev.map(n => n.id === notifId ? { ...n, isRead: true } : n));
  };

  const resetAllToSeed = () => {
    setPolicies(SEED_POLICIES);
    setInvoices(SEED_INVOICES);
    setPayments(SEED_PAYMENTS);
    setClaims(SEED_CLAIMS);
    setVerifications(SEED_UNIVERSITY_VERIFICATIONS);
    setNotifications(SEED_NOTIFICATIONS);
    setAuditLogs(SEED_AUDIT_LOGS);
    setQuotes([]);
    localStorage.removeItem('edushield_policies');
    localStorage.removeItem('edushield_invoices');
    localStorage.removeItem('edushield_payments');
    localStorage.removeItem('edushield_claims');
    localStorage.removeItem('edushield_verifications');
    localStorage.removeItem('edushield_notifications');
    localStorage.removeItem('edushield_audit_logs');
    localStorage.removeItem('edushield_quotes');
  };

  return (
    <InsuranceContext.Provider
      value={{
        policies,
        quotes,
        invoices,
        payments,
        claims,
        students,
        universities,
        verifications,
        notifications,
        auditLogs,
        addQuote,
        addPolicy,
        addClaim,
        updateClaimStatus,
        processInvoicePayment,
        verifyUniversityClaim,
        executeClaimSettlement,
        addNotification,
        markNotificationRead,
        resetAllToSeed,
      }}
    >
      {children}
    </InsuranceContext.Provider>
  );
};

export const useInsurance = () => {
  const context = useContext(InsuranceContext);
  if (!context) {
    throw new Error('useInsurance must be used within an InsuranceProvider');
  }
  return context;
};
