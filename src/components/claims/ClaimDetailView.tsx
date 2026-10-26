import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useInsurance } from '../../context/InsuranceContext';
import { EducationClaim, ClaimStatus } from '../../types/insurance';
import { StatusBadge } from '../common/StatusBadge';
import { CLAIM_STATUS_MAP, formatINR } from '../../config/constants';
import { ContinuityIntelligence } from '../../services/continuityIntelligence';
import {
  FileText,
  ShieldCheck,
  Building2,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Sparkles,
  FileCheck,
  Send,
  ArrowRight,
  X,
  CreditCard,
  UserCheck
} from 'lucide-react';

interface ClaimDetailViewProps {
  claim: EducationClaim;
  onBack: () => void;
}

export const ClaimDetailView: React.FC<ClaimDetailViewProps> = ({ claim, onBack }) => {
  const { currentUser } = useAuth();
  const { policies, updateClaimStatus, executeClaimSettlement } = useInsurance();

  const policy = policies.find(p => p.id === claim.policyId);

  // Officer adjudication inputs
  const [adjudicationAction, setAdjudicationAction] = useState<ClaimStatus | null>(null);
  const [approvedAmountInput, setApprovedAmountInput] = useState<number>(
    claim.universityVerifiedFeeAmount || claim.requestedAmount
  );
  const [deductibleInput, setDeductibleInput] = useState<number>(claim.deductibleApplied || 0);
  const [decisionReason, setDecisionReason] = useState<string>('');

  // AI & Readiness Evaluation
  const readiness = ContinuityIntelligence.evaluateClaimReadiness(claim, policy);
  const nextSteps = ContinuityIntelligence.getExplainableNextSteps(claim, currentUser.role);

  const isOfficerOrAdmin = currentUser.role === 'claims_officer' || currentUser.role === 'admin';

  const handleApplyTransition = (status: ClaimStatus) => {
    updateClaimStatus({
      claimId: claim.id,
      newStatus: status,
      reviewerId: currentUser.id,
      reviewerName: currentUser.displayName,
      reviewerRole: currentUser.role,
      actionTaken: `Officer transition to ${status}`,
      reasons: decisionReason || `Status updated to ${status.replace('_', ' ')} based on review criteria.`,
      approvedAmount: status === 'approved' ? approvedAmountInput : undefined,
      deductibleApplied: status === 'approved' ? deductibleInput : undefined,
    });
    setAdjudicationAction(null);
    setDecisionReason('');
  };

  const handleDisburseSettlement = () => {
    executeClaimSettlement(claim.id, currentUser.displayName);
  };

  const stepsList: ClaimStatus[] = [
    'submitted',
    'under_review',
    'university_verification',
    'approved',
    'paid'
  ];

  const currentStepIndex = stepsList.indexOf(claim.status as any);

  return (
    <div className="space-y-6">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200">
        <div className="flex items-center space-x-3">
          <button
            onClick={onBack}
            className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-100"
          >
            &larr; Back
          </button>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-xl font-bold text-slate-900 font-mono">{claim.claimNumber}</h1>
              <StatusBadge type="claim" status={claim.status} />
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              ClaimCenter File &bull; Policy: <strong className="text-slate-700">{claim.policyNumber}</strong>
            </p>
          </div>
        </div>

        {/* Settlement Direct Action */}
        {claim.status === 'approved' && isOfficerOrAdmin && (
          <button
            onClick={handleDisburseSettlement}
            className="inline-flex items-center px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-md transition"
          >
            <CreditCard className="w-4 h-4 mr-1.5" />
            Disburse NEFT to University Escrow
          </button>
        )}
      </div>

      {/* Guidewire Claim Lifecycle Stepper */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
        <div className="flex items-center justify-between overflow-x-auto pb-2 sm:pb-0">
          {stepsList.map((stepKey, idx) => {
            const isCompleted = currentStepIndex > idx || claim.status === 'paid' || claim.status === 'closed';
            const isCurrent = claim.status === stepKey;

            return (
              <div key={stepKey} className="flex items-center flex-1 min-w-[130px] last:flex-none">
                <div className="flex flex-col items-center text-center space-y-1">
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition ${
                      isCompleted
                        ? 'bg-emerald-600 text-white'
                        : isCurrent
                        ? 'bg-brand-600 text-white ring-4 ring-brand-100'
                        : 'bg-slate-100 text-slate-400 border border-slate-200'
                    }`}
                  >
                    {isCompleted ? '✓' : idx + 1}
                  </div>
                  <span
                    className={`text-[11px] font-medium capitalize ${
                      isCurrent ? 'text-brand-700 font-bold' : isCompleted ? 'text-slate-800' : 'text-slate-400'
                    }`}
                  >
                    {stepKey.replace('_', ' ')}
                  </span>
                </div>
                {idx < stepsList.length - 1 && (
                  <div
                    className={`flex-1 h-0.5 mx-2 ${
                      isCompleted ? 'bg-emerald-500' : 'bg-slate-200'
                    }`}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols): Financial Summary & Documents & History */}
        <div className="lg:col-span-2 space-y-6">
          {/* Explicit Separate Amounts Breakdown */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
              Separate Financial Breakdown (Guidewire Standard)
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-slate-400 block">1. Requested Fee Amount</span>
                <span className="text-base font-bold text-slate-900">{formatINR(claim.requestedAmount)}</span>
              </div>
              <div className="p-3 bg-indigo-50/60 rounded-lg border border-indigo-200">
                <span className="text-indigo-600 block">2. University Verified Fee</span>
                <span className="text-base font-bold text-indigo-950">
                  {claim.universityVerifiedFeeAmount > 0 ? formatINR(claim.universityVerifiedFeeAmount) : 'Pending Certification'}
                </span>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-slate-400 block">3. Eligible Policy Cap</span>
                <span className="text-base font-bold text-slate-900">{formatINR(claim.eligibleCoverageLimit)}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-slate-400 block">4. Deductible / Co-Pay</span>
                <span className="text-base font-bold text-slate-900">{formatINR(claim.deductibleApplied)}</span>
              </div>
              <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200">
                <span className="text-emerald-700 block">5. Approved Settlement</span>
                <span className="text-base font-bold text-emerald-950">
                  {claim.approvedAmount > 0 ? formatINR(claim.approvedAmount) : '—'}
                </span>
              </div>
              <div className="p-3 bg-teal-50 rounded-lg border border-teal-200">
                <span className="text-teal-700 block">6. Actually Remitted</span>
                <span className="text-base font-bold text-teal-950">
                  {claim.actuallyPaidAmount > 0 ? formatINR(claim.actuallyPaidAmount) : '—'}
                </span>
              </div>
            </div>

            {claim.settlement && (
              <div className="mt-4 p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold flex items-center">
                    <CheckCircle2 className="w-4 h-4 mr-1 text-emerald-600" />
                    Direct Institutional Fee Settlement Completed
                  </span>
                  <span className="font-mono text-[10px] bg-emerald-200 text-emerald-900 px-2 py-0.5 rounded font-bold">
                    {claim.settlement.paymentMode}
                  </span>
                </div>
                <p>
                  Settlement of <strong>{formatINR(claim.settlement.actualSettledAmount)}</strong> remitted to {claim.settlement.universityName} Tuition Escrow.
                </p>
                <p className="font-mono text-[11px] text-emerald-800">
                  Ref: {claim.settlement.transactionReference} &bull; A/C: {claim.settlement.escrowAccountNumber} (IFSC: {claim.settlement.ifscCode})
                </p>
              </div>
            )}
          </div>

          {/* Event Circumstances */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-3">
            <h2 className="text-sm font-bold text-slate-900 flex items-center">
              <AlertTriangle className="w-4 h-4 mr-2 text-amber-600" />
              Reported Disruption Event Circumstances
            </h2>
            <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <div>
                <span className="text-slate-400 block">Event Type:</span>
                <span className="font-semibold text-slate-900 capitalize">{claim.eventType.replace(/_/g, ' ')}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Event Incurred Date:</span>
                <span className="font-semibold text-slate-900">{new Date(claim.eventDate).toLocaleDateString('en-IN')}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Enrolled Student:</span>
                <span className="font-semibold text-slate-900">{claim.studentName}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Enrolled University:</span>
                <span className="font-semibold text-slate-900">{claim.universityName}</span>
              </div>
            </div>
            <p className="text-xs text-slate-700 leading-relaxed bg-white p-3 rounded-lg border border-slate-200">
              {claim.claimDescription}
            </p>
          </div>

          {/* AI Inspected Supporting Documents */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-900 flex items-center">
                <Sparkles className="w-4 h-4 mr-2 text-teal-600" />
                Attached Supporting Documents ({claim.documents.length})
              </h2>
              <span className="text-[11px] text-teal-700 font-semibold bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                AI Document Assistant Verified
              </span>
            </div>

            <div className="space-y-3">
              {claim.documents.map(doc => (
                <div key={doc.id} className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-bold text-slate-900">{doc.fileName}</span>
                      <span className="ml-2 font-mono text-[10px] uppercase bg-slate-200 px-1.5 py-0.2 rounded text-slate-700">
                        {doc.documentType.replace(/_/g, ' ')}
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-400">{(doc.fileSize / 1024).toFixed(0)} KB</span>
                  </div>

                  {doc.ocrDetectedData && (
                    <div className="bg-white p-2.5 rounded-lg border border-slate-200 space-y-1 text-[11px]">
                      <span className="text-slate-500 font-medium block">
                        Classification: <strong className="text-slate-800">{doc.ocrDetectedData.documentClassification}</strong> (Confidence: {Math.round(doc.ocrDetectedData.confidenceScore * 100)}%)
                      </span>
                      <div className="flex flex-wrap gap-1 pt-1">
                        {doc.ocrDetectedData.flags.map((flag, idx) => (
                          <span key={idx} className="bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded border border-emerald-200 flex items-center text-[10px]">
                            <CheckCircle2 className="w-2.5 h-2.5 mr-1 text-emerald-600" />
                            {flag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Immutable Claim Review & Adjudication Audit Log */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-3">
            <h2 className="text-sm font-bold text-slate-900 flex items-center">
              <Clock className="w-4 h-4 mr-2 text-brand-600" />
              ClaimCenter Adjudication & Decision Log ({claim.reviewHistory.length})
            </h2>

            <div className="divide-y divide-slate-100 text-xs">
              {claim.reviewHistory.map(rev => (
                <div key={rev.id} className="py-3 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800">{rev.actionTaken}</span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {new Date(rev.timestamp).toLocaleString('en-IN')}
                    </span>
                  </div>
                  <p className="text-slate-600">{rev.reasons}</p>
                  <p className="text-[10px] text-slate-400">
                    By: <strong className="text-slate-700">{rev.reviewerName}</strong> ({rev.reviewerRole})
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column (1 Col): Readiness Checklist & Next Steps & Actions */}
        <div className="space-y-6">
          {/* Claim Readiness Checklist (Innovation 4) */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-xs uppercase tracking-wider text-slate-800 flex items-center">
                <FileCheck className="w-4 h-4 mr-1.5 text-teal-600" />
                Claim-Readiness Checklist
              </h3>
              <span className="font-bold text-xs text-teal-700">{readiness.percentReady}%</span>
            </div>

            <div className="w-full bg-slate-100 rounded-full h-1.5">
              <div
                className="bg-teal-500 h-1.5 rounded-full"
                style={{ width: `${readiness.percentReady}%` }}
              ></div>
            </div>
            <p className="text-[11px] text-slate-500">{readiness.statusLabel}</p>

            <div className="space-y-2 pt-2">
              {readiness.items.map(item => (
                <div key={item.id} className="flex items-start space-x-2 text-xs">
                  <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] flex-shrink-0 mt-0.5 ${
                    item.isSatisfied ? 'bg-emerald-100 text-emerald-700 font-bold' : 'bg-slate-200 text-slate-400'
                  }`}>
                    {item.isSatisfied ? '✓' : '•'}
                  </span>
                  <div>
                    <span className={`font-semibold ${item.isSatisfied ? 'text-slate-800' : 'text-slate-400'}`}>
                      {item.title}
                    </span>
                    <p className="text-[10px] text-slate-400">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Explainable Next Steps (Innovation 5) */}
          <div className="bg-gradient-to-br from-brand-50 to-teal-50/50 border border-brand-200 rounded-xl p-5 text-xs space-y-2">
            <span className="font-bold text-brand-800 uppercase tracking-wider text-[10px] block">
              Explainable Next Steps: {nextSteps.currentStage}
            </span>
            <p className="text-slate-800 font-medium leading-relaxed">
              {nextSteps.recommendation}
            </p>
            <span className="text-[11px] text-brand-600 block">
              Responsible: <strong>{nextSteps.responsibleParty}</strong>
            </span>
          </div>

          {/* Claims Officer Adjudication Controls */}
          {isOfficerOrAdmin && (
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-3">
              <h3 className="font-bold text-xs uppercase tracking-wider text-slate-800 flex items-center">
                <UserCheck className="w-4 h-4 mr-1.5 text-brand-600" />
                Claims Officer Adjudication Actions
              </h3>

              <div className="space-y-2 pt-1">
                {claim.status === 'submitted' && (
                  <button
                    onClick={() => handleApplyTransition('university_verification')}
                    className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-xs"
                  >
                    Refer to University Registrar
                  </button>
                )}

                {claim.status === 'submitted' || claim.status === 'under_review' ? (
                  <button
                    onClick={() => handleApplyTransition('documents_required')}
                    className="w-full py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-semibold"
                  >
                    Request Clarifying Documents
                  </button>
                ) : null}

                {(claim.status === 'under_review' || claim.status === 'university_verification') && (
                  <div className="space-y-2 pt-2 border-t border-slate-100">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                        Approved University Fee Settlement (INR)
                      </label>
                      <input
                        type="number"
                        value={approvedAmountInput}
                        onChange={(e) => setApprovedAmountInput(Number(e.target.value))}
                        className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs font-bold text-slate-900"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                        Decision Justification Notes
                      </label>
                      <textarea
                        value={decisionReason}
                        onChange={(e) => setDecisionReason(e.target.value)}
                        placeholder="Reason for approval / rejection"
                        rows={2}
                        className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs"
                      />
                    </div>
                    <div className="flex space-x-2 pt-1">
                      <button
                        onClick={() => handleApplyTransition('approved')}
                        className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-xs"
                      >
                        Approve Claim
                      </button>
                      <button
                        onClick={() => handleApplyTransition('rejected')}
                        className="flex-1 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold"
                      >
                        Reject Claim
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
