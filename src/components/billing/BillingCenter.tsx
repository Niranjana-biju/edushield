import React, { useState } from 'react';
import { useInsurance } from '../../context/InsuranceContext';
import { StatusBadge } from '../common/StatusBadge';
import { MetricCard } from '../common/MetricCard';
import { formatINR } from '../../config/constants';
import { PremiumInvoice } from '../../types/insurance';
import {
  CreditCard,
  CheckCircle2,
  Clock,
  QrCode,
  Smartphone,
  Building,
  X,
  FileText,
  AlertCircle
} from 'lucide-react';

export const BillingCenter: React.FC = () => {
  const { invoices, payments, processInvoicePayment } = useInsurance();

  const [payingInvoice, setPayingInvoice] = useState<PremiumInvoice | null>(null);
  const [selectedMethod, setSelectedMethod] = useState<'UPI' | 'CreditCard' | 'DebitCard' | 'NetBanking'>('UPI');
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentSuccessRef, setPaymentSuccessRef] = useState<string | null>(null);

  const pendingInvoices = invoices.filter(i => i.status === 'issued' || i.status === 'overdue');
  const totalOutstanding = pendingInvoices.reduce((sum, i) => sum + i.totalAmount, 0);
  const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);

  const handlePay = () => {
    if (!payingInvoice) return;
    setIsProcessing(true);

    setTimeout(() => {
      processInvoicePayment({
        invoiceId: payingInvoice.id,
        paymentMethod: selectedMethod,
      });
      setIsProcessing(false);
      setPaymentSuccessRef(`UPI-TXN-${Date.now().toString().slice(-8)}`);
    }, 900);
  };

  const closePaymentModal = () => {
    setPayingInvoice(null);
    setPaymentSuccessRef(null);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <div className="inline-flex items-center space-x-2 bg-brand-50 text-brand-700 text-xs px-3 py-1 rounded-full mb-1 border border-brand-200">
          <CreditCard className="w-3.5 h-3.5" />
          <span>Guidewire-Inspired BillingCenter Module</span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Billing & Premium Invoicing Center
        </h1>
        <p className="text-xs text-slate-500">
          Monitor premium receivables, statutory GST invoicing, due dates, and simulated instant settlements
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <MetricCard
          title="Outstanding Premium Due"
          value={formatINR(totalOutstanding)}
          subtitle={pendingInvoices.length > 0 ? `${pendingInvoices.length} invoices awaiting payment` : 'All invoices cleared'}
          icon={<Clock className="w-5 h-5" />}
          accentColor={totalOutstanding > 0 ? 'amber' : 'emerald'}
        />
        <MetricCard
          title="Cumulative Paid Premiums"
          value={formatINR(totalPaid)}
          subtitle={`${payments.length} successful transactions`}
          icon={<CheckCircle2 className="w-5 h-5" />}
          accentColor="teal"
        />
        <MetricCard
          title="Total Invoices Issued"
          value={invoices.length}
          subtitle="Tax compliant premium invoices"
          icon={<FileText className="w-5 h-5" />}
          accentColor="blue"
        />
      </div>

      {/* Invoices List */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-200">
          <h2 className="text-base font-bold text-slate-900">
            Premium Invoices ({invoices.length})
          </h2>
          <p className="text-xs text-slate-500">Scheduled policy renewal and inception invoices</p>
        </div>

        <div className="divide-y divide-slate-200">
          {invoices.map(invoice => (
            <div
              key={invoice.id}
              className="p-5 hover:bg-slate-50/60 transition flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <span className="font-mono text-xs font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded">
                    {invoice.invoiceNumber}
                  </span>
                  <StatusBadge type="invoice" status={invoice.status} />
                  <span className="text-xs text-slate-400 font-mono">Policy: {invoice.policyNumber}</span>
                </div>
                <p className="text-sm font-semibold text-slate-800">{invoice.billingPeriod}</p>
                <div className="flex items-center space-x-3 text-xs text-slate-500">
                  <span>Base: {formatINR(invoice.baseAmount)}</span>
                  <span>&bull;</span>
                  <span>18% GST: {formatINR(invoice.taxAmount)}</span>
                  <span>&bull;</span>
                  <span>Due: {new Date(invoice.dueDate).toLocaleDateString('en-IN')}</span>
                </div>
              </div>

              <div className="flex md:flex-col items-center md:items-end justify-between md:justify-center border-t md:border-t-0 pt-3 md:pt-0 border-slate-100">
                <div className="text-left md:text-right">
                  <span className="text-[11px] text-slate-400 block">Total Payable</span>
                  <span className="text-lg font-bold text-slate-900">{formatINR(invoice.totalAmount)}</span>
                </div>

                {invoice.status === 'issued' || invoice.status === 'overdue' ? (
                  <button
                    onClick={() => setPayingInvoice(invoice)}
                    className="mt-2 inline-flex items-center text-xs font-semibold px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-lg transition shadow-xs"
                  >
                    <CreditCard className="w-3.5 h-3.5 mr-1.5" />
                    Pay Premium
                  </button>
                ) : (
                  <span className="mt-2 text-xs text-emerald-700 font-semibold flex items-center">
                    <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Paid ({invoice.paymentRef})
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Payment Gateway Modal (Simulated) */}
      {payingInvoice && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-5">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-slate-900 text-base">BillingCenter Payment Gateway</h3>
                <p className="text-xs text-slate-400">Invoice: {payingInvoice.invoiceNumber}</p>
              </div>
              <button onClick={closePaymentModal} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {paymentSuccessRef ? (
              <div className="text-center py-6 space-y-3">
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h4 className="font-bold text-slate-900 text-lg">Payment Successful!</h4>
                <p className="text-xs text-slate-500">
                  Premium of {formatINR(payingInvoice.totalAmount)} processed. Policy continuity maintained.
                </p>
                <div className="p-3 bg-slate-50 rounded-lg text-xs font-mono text-slate-700">
                  Txn Ref: {paymentSuccessRef}
                </div>
                <button
                  onClick={closePaymentModal}
                  className="w-full mt-3 py-2 bg-brand-600 text-white font-semibold rounded-lg text-xs"
                >
                  Done
                </button>
              </div>
            ) : (
              <div className="space-y-4 text-xs">
                {/* Simulation Notice */}
                <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 text-[11px] flex items-start space-x-2">
                  <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                  <span>
                    <strong>Simulated Payment Gateway:</strong> No real funds are charged. Demonstration of BillingCenter automated status reconciliation.
                  </span>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex justify-between items-center">
                  <span className="text-slate-600 font-medium">Total Amount Due (incl. GST):</span>
                  <span className="text-lg font-bold text-brand-700">{formatINR(payingInvoice.totalAmount)}</span>
                </div>

                {/* Method Selector */}
                <div className="space-y-2">
                  <label className="block font-semibold text-slate-700">Select Payment Instrument</label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedMethod('UPI')}
                      className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1 transition ${
                        selectedMethod === 'UPI'
                          ? 'border-brand-600 bg-brand-50 text-brand-700 font-semibold'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <Smartphone className="w-5 h-5" />
                      <span className="text-[11px]">UPI / QR</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedMethod('CreditCard')}
                      className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1 transition ${
                        selectedMethod === 'CreditCard'
                          ? 'border-brand-600 bg-brand-50 text-brand-700 font-semibold'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <CreditCard className="w-5 h-5" />
                      <span className="text-[11px]">Card</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedMethod('NetBanking')}
                      className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1 transition ${
                        selectedMethod === 'NetBanking'
                          ? 'border-brand-600 bg-brand-50 text-brand-700 font-semibold'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <Building className="w-5 h-5" />
                      <span className="text-[11px]">NetBanking</span>
                    </button>
                  </div>
                </div>

                {selectedMethod === 'UPI' && (
                  <div className="text-center p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                    <QrCode className="w-24 h-24 mx-auto text-slate-800" />
                    <p className="text-[11px] text-slate-500">Scan using GooglePay, PhonePe, or BHIM</p>
                    <span className="font-mono text-xs font-semibold text-slate-700">edushield.escrow@icici</span>
                  </div>
                )}

                <button
                  onClick={handlePay}
                  disabled={isProcessing}
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white font-bold rounded-lg text-xs transition shadow-sm"
                >
                  {isProcessing ? 'Processing Transaction...' : `Simulate Instant Payment of ${formatINR(payingInvoice.totalAmount)}`}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
