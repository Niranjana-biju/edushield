import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useInsurance } from '../../context/InsuranceContext';
import { MetricCard } from '../common/MetricCard';
import { StatusBadge } from '../common/StatusBadge';
import { formatINR } from '../../config/constants';
import {
  ShieldCheck,
  CreditCard,
  FileText,
  AlertTriangle,
  ArrowRight,
  PlusCircle,
  GraduationCap,
  Calendar,
  Building2,
  ChevronRight,
  Calculator
} from 'lucide-react';

export const GuardianDashboard: React.FC = () => {
  const { currentUser } = useAuth();
  const { policies, claims, invoices } = useInsurance();

  const userPolicies = policies.filter(p => p.guardianId === currentUser.id);
  const userClaims = claims.filter(c => c.guardianId === currentUser.id);
  const pendingInvoices = invoices.filter(
    i => i.guardianId === currentUser.id && (i.status === 'issued' || i.status === 'overdue')
  );

  const totalCoverage = userPolicies.reduce((acc, p) => acc + p.totalSumInsured, 0);
  const remainingCoverage = userPolicies.reduce((acc, p) => acc + p.remainingCoverage, 0);
  const pendingPremiumTotal = pendingInvoices.reduce((acc, i) => acc + i.totalAmount, 0);

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-navy-900 via-brand-900 to-navy-900 rounded-2xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-radial from-brand-500/10 to-transparent pointer-events-none"></div>
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center space-x-2 bg-brand-500/20 text-brand-300 text-xs px-3 py-1 rounded-full mb-3 border border-brand-500/30">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>PolicyCenter Guardian Portal &bull; In-Force Protection</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Welcome back, {currentUser.displayName}
          </h1>
          <p className="mt-2 text-slate-300 text-sm sm:text-base leading-relaxed">
            Your family's higher education continuum is protected. Monitor active policy guarantees, tuition fee payment schedules, and claim adjudication statuses in one unified portal.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              to="/quotes/new"
              className="inline-flex items-center px-4 py-2 rounded-lg bg-teal-500 hover:bg-teal-600 text-white font-semibold text-sm transition shadow-md shadow-teal-500/20"
            >
              <PlusCircle className="w-4 h-4 mr-2" />
              Obtain New Course Quote
            </Link>
            <Link
              to="/claims/new"
              className="inline-flex items-center px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-medium text-sm transition border border-slate-700"
            >
              <AlertTriangle className="w-4 h-4 mr-2 text-amber-400" />
              Report Disruption Event
            </Link>
            <Link
              to="/funding-gap"
              className="inline-flex items-center px-4 py-2 rounded-lg bg-slate-800/60 hover:bg-slate-700 text-slate-300 font-medium text-sm transition border border-slate-700/60"
            >
              <Calculator className="w-4 h-4 mr-2 text-brand-400" />
              Check Funding Gap
            </Link>
          </div>
        </div>
      </div>

      {/* Metric Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <MetricCard
          title="Active Policies In-Force"
          value={userPolicies.length}
          subtitle="Education continuity contracts"
          icon={<ShieldCheck className="w-5 h-5" />}
          accentColor="blue"
        />
        <MetricCard
          title="Guaranteed Protection Cap"
          value={formatINR(remainingCoverage)}
          subtitle={`Total limit: ${formatINR(totalCoverage)}`}
          icon={<GraduationCap className="w-5 h-5" />}
          accentColor="teal"
        />
        <MetricCard
          title="Pending Premium Invoices"
          value={formatINR(pendingPremiumTotal)}
          subtitle={pendingInvoices.length > 0 ? `${pendingInvoices.length} invoice(s) due soon` : 'All invoices settled'}
          icon={<CreditCard className="w-5 h-5" />}
          accentColor={pendingInvoices.length > 0 ? 'amber' : 'emerald'}
        />
        <MetricCard
          title="Filed Claims"
          value={userClaims.length}
          subtitle={`${userClaims.filter(c => c.status === 'paid').length} settled to university`}
          icon={<FileText className="w-5 h-5" />}
          accentColor="purple"
        />
      </div>

      {/* Active Policies Section */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center">
              <ShieldCheck className="w-5 h-5 mr-2 text-brand-600" />
              Active Enrolled Policies
            </h2>
            <p className="text-xs text-slate-500">Underwritten higher education coverage guarantees</p>
          </div>
          <Link
            to="/policies"
            className="text-xs font-semibold text-brand-600 hover:text-brand-700 flex items-center"
          >
            View all policies <ChevronRight className="w-4 h-4 ml-0.5" />
          </Link>
        </div>

        {userPolicies.length === 0 ? (
          <div className="text-center py-8 bg-slate-50 rounded-xl border border-dashed border-slate-200">
            <p className="text-sm text-slate-600 font-medium">No active policies found</p>
            <p className="text-xs text-slate-400 mt-1">Get an instant quote to protect your child's degree</p>
            <Link
              to="/quotes/new"
              className="mt-4 inline-flex items-center text-xs font-semibold px-3 py-1.5 bg-brand-600 text-white rounded-lg hover:bg-brand-700"
            >
              Create Quote
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {userPolicies.map(policy => {
              const coverageUsedPercent = Math.round(
                ((policy.totalSumInsured - policy.remainingCoverage) / policy.totalSumInsured) * 100
              );

              return (
                <div
                  key={policy.id}
                  className="rounded-xl border border-slate-200 p-5 bg-gradient-to-br from-white to-slate-50/50 hover:border-brand-300 transition shadow-xs"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[11px] font-mono font-semibold text-brand-700 uppercase bg-brand-50 px-2 py-0.5 rounded border border-brand-200">
                        {policy.policyNumber}
                      </span>
                      <h3 className="font-bold text-slate-900 text-base mt-2">{policy.planName}</h3>
                      <p className="text-xs text-slate-500 flex items-center mt-0.5">
                        <GraduationCap className="w-3.5 h-3.5 mr-1 text-slate-400" />
                        {policy.studentName} &bull; {policy.courseName}
                      </p>
                      <p className="text-xs text-slate-500 flex items-center mt-0.5">
                        <Building2 className="w-3.5 h-3.5 mr-1 text-slate-400" />
                        {policy.universityName}
                      </p>
                    </div>
                    <StatusBadge type="policy" status={policy.status} />
                  </div>

                  {/* Coverage Gauge Bar */}
                  <div className="mt-4 pt-3 border-t border-slate-100">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-500">Remaining Coverage:</span>
                      <span className="font-bold text-slate-900">{formatINR(policy.remainingCoverage)}</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-brand-600 h-2 rounded-full"
                        style={{ width: `${100 - coverageUsedPercent}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-[11px] text-slate-400 mt-1">
                      <span>Total: {formatINR(policy.totalSumInsured)}</span>
                      <span>{coverageUsedPercent}% utilized</span>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-slate-500 flex items-center">
                      <Calendar className="w-3.5 h-3.5 mr-1" />
                      Renews: {new Date(policy.expiryDate).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                    <Link
                      to={`/policies`}
                      className="font-semibold text-brand-600 hover:text-brand-700 flex items-center"
                    >
                      Policy Bond <ArrowRight className="w-3.5 h-3.5 ml-1" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Claims Lifecycle Tracker */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center">
              <FileText className="w-5 h-5 mr-2 text-brand-600" />
              ClaimCenter Continuity Claims
            </h2>
            <p className="text-xs text-slate-500">Direct university tuition fee claims tracking</p>
          </div>
          <Link
            to="/claims/new"
            className="text-xs font-semibold px-3 py-1.5 bg-brand-600 text-white rounded-lg hover:bg-brand-700 flex items-center"
          >
            <PlusCircle className="w-3.5 h-3.5 mr-1.5" /> Submit New Claim
          </Link>
        </div>

        {userClaims.length === 0 ? (
          <div className="text-center py-6 bg-slate-50 rounded-xl border border-dashed border-slate-200 text-xs text-slate-500">
            No claims filed under this policy account.
          </div>
        ) : (
          <div className="space-y-4">
            {userClaims.map(claim => (
              <div
                key={claim.id}
                className="border border-slate-200 rounded-xl p-4 hover:border-brand-300 transition bg-white"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-mono font-bold text-slate-800 text-sm">{claim.claimNumber}</span>
                      <StatusBadge type="claim" status={claim.status} />
                    </div>
                    <p className="text-xs text-slate-600 mt-1">
                      <strong className="text-slate-800 capitalize">{claim.eventType.replace(/_/g, ' ')}</strong> &bull; Student: {claim.studentName} ({claim.universityName})
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-slate-400 block">Requested Amount</span>
                    <span className="font-bold text-base text-slate-900">{formatINR(claim.requestedAmount)}</span>
                  </div>
                </div>

                {claim.settlement && (
                  <div className="mt-3 p-2.5 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800 flex items-center justify-between">
                    <span>
                      ✓ Remitted {formatINR(claim.settlement.actualSettledAmount)} directly to {claim.settlement.universityName} Escrow
                    </span>
                    <span className="font-mono text-[10px] bg-emerald-100 px-2 py-0.5 rounded">
                      {claim.settlement.transactionReference}
                    </span>
                  </div>
                )}

                <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-400">
                    Submitted on: {new Date(claim.submittedAt).toLocaleDateString('en-IN')}
                  </span>
                  <Link
                    to={`/claims`}
                    className="font-semibold text-brand-600 hover:text-brand-700 flex items-center"
                  >
                    Open Claim File <ArrowRight className="w-3.5 h-3.5 ml-1" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
