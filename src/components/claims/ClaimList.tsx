import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useInsurance } from '../../context/InsuranceContext';
import { useAuth } from '../../context/AuthContext';
import { StatusBadge } from '../common/StatusBadge';
import { ClaimDetailView } from './ClaimDetailView';
import { formatINR } from '../../config/constants';
import { EducationClaim, ClaimStatus } from '../../types/insurance';
import {
  FileText,
  PlusCircle,
  Filter,
  ArrowRight,
  Sparkles,
  Building2,
  Calendar
} from 'lucide-react';

export const ClaimList: React.FC = () => {
  const { currentUser } = useAuth();
  const { claims } = useInsurance();
  const [selectedClaim, setSelectedClaim] = useState<EducationClaim | null>(null);
  const [statusFilter, setStatusFilter] = useState<ClaimStatus | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Filter based on user role and criteria
  let displayedClaims = claims;
  if (currentUser.role === 'parent') {
    displayedClaims = claims.filter(c => c.guardianId === currentUser.id);
  } else if (currentUser.role === 'student') {
    displayedClaims = claims.filter(c => c.studentName.toLowerCase().includes(currentUser.displayName.toLowerCase()));
  }

  if (statusFilter !== 'all') {
    displayedClaims = displayedClaims.filter(c => c.status === statusFilter);
  }

  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase();
    displayedClaims = displayedClaims.filter(
      c =>
        c.claimNumber.toLowerCase().includes(q) ||
        c.studentName.toLowerCase().includes(q) ||
        c.universityName.toLowerCase().includes(q)
    );
  }

  if (selectedClaim) {
    return <ClaimDetailView claim={selectedClaim} onBack={() => setSelectedClaim(null)} />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-2 bg-brand-50 text-brand-700 text-xs px-3 py-1 rounded-full mb-1 border border-brand-200">
            <FileText className="w-3.5 h-3.5" />
            <span>ClaimCenter Case Adjudication</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Education Disruption Claims
          </h1>
          <p className="text-xs text-slate-500">
            Guidewire-inspired claim intake, document verification, and direct university fee disbursement
          </p>
        </div>

        <Link
          to="/claims/new"
          className="inline-flex items-center px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-xs font-semibold shadow-sm transition"
        >
          <PlusCircle className="w-4 h-4 mr-1.5" />
          File Disruption Claim
        </Link>
      </div>

      {/* Filters and Search Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by Claim #, Student, or University..."
          className="px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-brand-500 w-full md:w-80"
        />

        <div className="flex items-center space-x-1.5 overflow-x-auto text-xs pb-1 md:pb-0">
          <Filter className="w-3.5 h-3.5 text-slate-400 mr-1 flex-shrink-0" />
          {(['all', 'submitted', 'under_review', 'university_verification', 'approved', 'paid', 'rejected'] as const).map(status => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-2.5 py-1 rounded-md font-medium whitespace-nowrap capitalize transition ${
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

      {/* Claims Grid / List */}
      {displayedClaims.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-xl border border-slate-200 text-slate-500 text-sm">
          No disruption claims found.
        </div>
      ) : (
        <div className="space-y-4">
          {displayedClaims.map(claim => (
            <div
              key={claim.id}
              onClick={() => setSelectedClaim(claim)}
              className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs hover:border-brand-400 hover:shadow-md transition cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="space-y-1.5 flex-1">
                <div className="flex items-center space-x-2">
                  <span className="font-mono font-bold text-slate-900 text-sm">{claim.claimNumber}</span>
                  <StatusBadge type="claim" status={claim.status} />
                  <span className="text-xs text-slate-400 font-mono">Policy: {claim.policyNumber}</span>
                </div>

                <p className="text-xs text-slate-700 font-medium">
                  Student: <strong className="text-slate-900">{claim.studentName}</strong> &bull; {claim.universityName}
                </p>

                <p className="text-xs text-slate-500 line-clamp-1">
                  Covered Event: <strong className="text-slate-700 capitalize">{claim.eventType.replace(/_/g, ' ')}</strong> &bull; {claim.claimDescription}
                </p>

                <div className="flex items-center space-x-3 text-[11px] text-slate-400">
                  <span>Docs: {claim.documents.length} verified</span>
                  <span>&bull;</span>
                  <span>Date: {new Date(claim.submittedAt).toLocaleDateString('en-IN')}</span>
                  {claim.assignedOfficerName && (
                    <>
                      <span>&bull;</span>
                      <span>Officer: {claim.assignedOfficerName}</span>
                    </>
                  )}
                </div>
              </div>

              <div className="flex md:flex-col items-center md:items-end justify-between md:justify-center border-t md:border-t-0 pt-3 md:pt-0 border-slate-100">
                <div className="text-left md:text-right">
                  <span className="text-[11px] text-slate-400 block">Requested Amount</span>
                  <span className="text-lg font-bold text-slate-900">
                    {formatINR(claim.requestedAmount)}
                  </span>
                </div>

                <span className="mt-2 text-xs font-semibold text-brand-600 hover:text-brand-800 flex items-center">
                  Open Claim File <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
