import {
  PremiumInvoice,
  PremiumPayment,
  EducationPolicy
} from '../types/insurance';

export class BillingService {
  /**
   * Generates a new premium invoice for an issued policy (BillingCenter workflow)
   */
  public static generateInvoice(policy: EducationPolicy, periodLabel?: string): PremiumInvoice {
    const now = new Date();
    const dueDate = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000).toISOString(); // 14 days due
    const invoiceNumber = `INV-EDU-${now.getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;

    const baseAmount = Math.round(policy.annualPremium / 1.18);
    const taxAmount = policy.annualPremium - baseAmount;

    return {
      id: `inv_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      invoiceNumber,
      policyId: policy.id,
      policyNumber: policy.policyNumber,
      guardianId: policy.guardianId,
      guardianName: policy.guardianName,
      dueDate,
      billingPeriod: periodLabel || `Annual Coverage (${new Date(policy.effectiveDate).getFullYear()} - ${new Date(policy.expiryDate).getFullYear()})`,
      baseAmount,
      taxAmount,
      totalAmount: policy.annualPremium,
      status: 'issued',
      createdAt: now.toISOString(),
    };
  }

  /**
   * Processes a simulated payment for an outstanding invoice
   */
  public static processPayment(params: {
    invoice: PremiumInvoice;
    paymentMethod: 'UPI' | 'CreditCard' | 'DebitCard' | 'NetBanking';
    simulatedSuccess?: boolean;
  }): { payment: PremiumPayment; updatedInvoice: PremiumInvoice } {
    const { invoice, paymentMethod, simulatedSuccess = true } = params;
    const now = new Date().toISOString();
    const txnPrefix = paymentMethod === 'UPI' ? 'UPI' : paymentMethod === 'CreditCard' ? 'CC' : 'NB';
    const transactionRef = `${txnPrefix}-TXN-${Date.now().toString().slice(-8)}${Math.floor(10 + Math.random() * 90)}`;
    const paymentNumber = `PMT-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;

    const payment: PremiumPayment = {
      id: `pmt_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      paymentNumber,
      invoiceId: invoice.id,
      policyId: invoice.policyId,
      guardianId: invoice.guardianId,
      amount: invoice.totalAmount,
      paymentMethod,
      transactionRef,
      gatewayResponse: simulatedSuccess ? 'SUCCESS' : 'FAILURE',
      paidAt: now,
    };

    const updatedInvoice: PremiumInvoice = {
      ...invoice,
      status: simulatedSuccess ? 'paid' : invoice.status,
      paidAt: simulatedSuccess ? now : undefined,
      paymentRef: simulatedSuccess ? transactionRef : undefined,
    };

    return { payment, updatedInvoice };
  }

  /**
   * Calculates outstanding premium balance for a guardian
   */
  public static calculateOutstandingBalance(invoices: PremiumInvoice[]): number {
    return invoices
      .filter(inv => inv.status === 'issued' || inv.status === 'overdue')
      .reduce((sum, inv) => sum + inv.totalAmount, 0);
  }
}
