import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useInsurance } from '../../context/InsuranceContext';
import { MetricCard } from '../common/MetricCard';
import { StatusBadge } from '../common/StatusBadge';
import { formatINR } from '../../config/constants';
import { ClaimStatus } from '../../types/insurance';
import {
  FileSearch,
  CheckCircle2,
  Clock,
  School,
  ArrowRight,
  Filter,
  CheckSquare,
  Sparkles
} from 'lucide-react';

export const ClaimsOfficerDashboard: React.FC = () => {
  const { claims } = useInsurance();
  const [statusFilter, setStatusFilter] = useState<ClaimStatus | 'all'>('all');

  const filteredClaims = statusFilter === 'all'
    ? claims
    : claims.filter(c => c.status === statusFilter);

  const pendingTriageCount = claims.filter(c => c.status === 'submitted' || c.status === 'under_review').length;
  const awaitingUniversityCount = claims.filter(c => c.status === 'university_verification').length;
  const readyToPayCount = claims.filter(c => c.status === 'approved' || c.status === 'payment_processing').length;
  const totalSettledAmount = claims.filter(c => c.status === 'paid').reduce((sum, c) => sum + c.actuallyPaidAmount, 0);

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-navy-900 via-slate-900 to-brand-950 rounded-2xl p-6 sm:p-8 text-white shadow-xl">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="inline-flex items-center space-x-2 bg-brand-500/20 text-brand-300 text-xs px-3 py-1 rounded-full mb-3 border border-brand-500/30">
              <FileSearch className="w-3.5 h-3.5" />
              <span>Guidewire-Inspired ClaimCenter Adjudication Queue</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Claims Adjudication & Triage Desk
            </h1>
            <p className="mt-2 text-slate-300 text-sm max-w-2xl leading-relaxed">
              Verify covered disruption events, inspect AI-analyzed legal documents, requisition university bursar fee confirmation, and authorize direct institutional settlements.
            </p>
          </div>
          <div className="flex items-center space-x-2 bg-slate-800/80 px-3 py-2 rounded-xl border border-slate-700 text-xs">
            <Sparkles className="w-4 h-4 text-teal-400" />
            <span className="text-slate-300 font-medium">Continuity Intelligence Assistant Active</span>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <MetricCard
          title="Triage & Review Queue"
          value={pendingTriageCount}
          subtitle="Awaiting initial officer assessment"
          icon={<Clock className="w-5 h-5" />}
          accentColor={pendingTriageCount > 0 ? 'amber' : 'emerald'}
        />
        <MetricCard
          title="Awaiting University Bursar"
          value={awaitingUniversityCount}
          subtitle="Enrollment & fee certification pending"
          icon={<School className="w-5 h-5" />}
          accentColor="blue"
        />
        <MetricCard
          title="Approved for Settlement"
          value={readyToPayCount}
          subtitle="Ready for direct NEFT escrow payout"
          icon={<CheckSquare className="w-5 h-5" />}
          accentColor="teal"
        />
        <MetricCard
          title="Total Institutional Disbursements"
          value={formatINR(totalSettledAmount)}
          subtitle="Remitted directly to university accounts"
          icon={<CheckCircle2 className="w-5 h-5" />}
          accentColor="purple"
        />
      </div>

      {/* Claims Triage Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              ClaimCenter Adjudication Queue ({filteredClaims.length})
            </h2>
            <p className="text-xs text-slate-500">Filter and adjudicate claims by state</p>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center space-x-2 overflow-x-auto max-w-full pb-1 sm:pb-0 text-xs">
            <Filter className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
            {(['all', 'submitted', 'under_review', 'university_verification', 'approved', 'paid', 'rejected'] as const).map(status => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-2.5 py-1 rounded-md font-medium capitalize whitespace-nowrap transition ${
                  statusFilter === status
                    ? 'bg-brand-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {status.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>

        {filteredClaims.length === 0 ? (
          <div className="p-8 text-center text-slate-500 text-sm">
            No claims matching the selected filter criteria.
          </div>
        ) : (
          <div className="divide-y divide-slate-200">
            {filteredClaims.map(claim => (
              <div
                key={claim.id}
                className="p-5 hover:bg-slate-50/70 transition flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-mono font-bold text-slate-900 text-sm">{claim.claimNumber}</span>
                    <StatusBadge type="claim" status={claim.status} />
                    <span className="text-xs text-slate-400 font-mono">Policy: {claim.policyNumber}</span>
                  </div>
                  <p className="text-xs text-slate-700 font-medium">
                    Student: <span className="text-slate-900 font-semibold">{claim.studentName}</span> &bull; {claim.universityName}
                  </p>
                  <p className="text-xs text-slate-500 line-clamp-1">
                    Event: <span className="font-medium text-slate-800 capitalize">{claim.eventType.replace(/_/g, ' ')}</span> &bull; {claim.claimDescription}
                  </p>
                  <div className="flex items-center space-x-3 text-[11px] text-slate-400">
                    <span>Documents: {claim.documents.length} attached</span>
                    <span>&bull;</span>
                    <span>Submitted: {new Date(claim.submittedAt).toLocaleDateString('en-IN')}</span>
                  </div>
                </div>

                {/* Amount and Action */}
                <div className="flex md:flex-col items-center md:items-end justify-between md:justify-center border-t md:border-t-0 pt-3 md:pt-0 border-slate-100">
                  <div className="text-left md:text-right">
                    <span className="text-[11px] text-slate-400 block">Requested / Eligible</span>
                    <span className="text-base font-bold text-slate-900">
                      {formatINR(claim.requestedAmount)}
                    </span>
                  </div>
                  <Link
                    to={`/claims`}
                    className="mt-2 inline-flex items-center text-xs font-semibold px-3 py-1.5 bg-brand-600 hover:bg-brand-700 text-white rounded-lg transition"
                  >
                    Adjudicate File <ArrowRight className="w-3.5 h-3.5 ml-1" />
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
