import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useInsurance } from '../../context/InsuranceContext';
import { StatusBadge } from '../common/StatusBadge';
import { formatINR } from '../../config/constants';
import { EducationPolicy } from '../../types/insurance';
import {
  FileCheck,
  ShieldCheck,
  GraduationCap,
  Building2,
  Calendar,
  X,
  FileDown,
  PlusCircle,
  Clock,
  Sparkles
} from 'lucide-react';

export const PolicyList: React.FC = () => {
  const { policies } = useInsurance();
  const [selectedPolicy, setSelectedPolicy] = useState<EducationPolicy | null>(null);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-2 bg-brand-50 text-brand-700 text-xs px-3 py-1 rounded-full mb-1 border border-brand-200">
            <FileCheck className="w-3.5 h-3.5" />
            <span>PolicyCenter Contracts Repository</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Education Insurance Policies
          </h1>
          <p className="text-xs text-slate-500">
            In-force student protection contracts, sum insured limits, and schedule of benefits
          </p>
        </div>

        <Link
          to="/quotes/new"
          className="inline-flex items-center px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-xs font-semibold shadow-sm transition"
        >
          <PlusCircle className="w-4 h-4 mr-1.5" />
          Get New Quote & Issue Policy
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {policies.map(policy => {
          const usedRatio = Math.round(
            ((policy.totalSumInsured - policy.remainingCoverage) / policy.totalSumInsured) * 100
          );

          return (
            <div
              key={policy.id}
              className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs hover:border-brand-300 transition flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between">
                  <span className="font-mono text-xs font-bold text-brand-700 bg-brand-50 px-2 py-0.5 rounded border border-brand-200">
                    {policy.policyNumber}
                  </span>
                  <StatusBadge type="policy" status={policy.status} />
                </div>

                <h3 className="font-bold text-slate-900 text-base mt-2.5">{policy.planName}</h3>
                
                <div className="mt-2 space-y-1 text-xs text-slate-600">
                  <p className="flex items-center font-medium text-slate-800">
                    <GraduationCap className="w-3.5 h-3.5 mr-1 text-slate-400" />
                    {policy.studentName}
                  </p>
                  <p className="flex items-center text-slate-500">
                    <Building2 className="w-3.5 h-3.5 mr-1 text-slate-400" />
                    {policy.universityName}
                  </p>
                  <p className="text-slate-400 text-[11px]">{policy.courseName}</p>
                </div>

                {/* Coverage Gauge */}
                <div className="mt-4 pt-3 border-t border-slate-100">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-500">Remaining Coverage</span>
                    <span className="font-bold text-slate-900">{formatINR(policy.remainingCoverage)}</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-brand-600 h-2 rounded-full"
                      style={{ width: `${100 - usedRatio}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                    <span>Total Sum Insured: {formatINR(policy.totalSumInsured)}</span>
                    <span>{usedRatio}% disbursed</span>
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-500 font-medium">
                  {formatINR(policy.annualPremium)}/yr
                </span>
                <button
                  onClick={() => setSelectedPolicy(policy)}
                  className="font-semibold text-brand-600 hover:text-brand-800 underline"
                >
                  View Policy Bond & Benefits
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Policy Details Modal */}
      {selectedPolicy && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-5 my-8">
            <div className="flex justify-between items-start border-b border-slate-100 pb-4">
              <div>
                <span className="font-mono text-xs text-brand-700 bg-brand-50 px-2 py-0.5 rounded font-bold border border-brand-200">
                  {selectedPolicy.policyNumber}
                </span>
                <h2 className="text-xl font-bold text-slate-900 mt-1">{selectedPolicy.planName}</h2>
                <p className="text-xs text-slate-500">Terms Version: {selectedPolicy.termsVersion}</p>
              </div>
              <button
                onClick={() => setSelectedPolicy(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* In-Force Metadata Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div>
                <span className="text-slate-400 block">Sponsor / Policyholder:</span>
                <span className="font-bold text-slate-900">{selectedPolicy.guardianName}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Student Beneficiary:</span>
                <span className="font-bold text-slate-900">{selectedPolicy.studentName}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Enrolled University:</span>
                <span className="font-bold text-slate-900">{selectedPolicy.universityName}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Total Sum Insured:</span>
                <span className="font-bold text-brand-700">{formatINR(selectedPolicy.totalSumInsured)}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Annual Premium:</span>
                <span className="font-bold text-slate-900">{formatINR(selectedPolicy.annualPremium)}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Waiting Period Concluded:</span>
                <span className="font-semibold text-emerald-700 flex items-center">
                  <ShieldCheck className="w-3.5 h-3.5 mr-1" />
                  {new Date(selectedPolicy.waitingPeriodEndsAt).toLocaleDateString('en-IN')}
                </span>
              </div>
            </div>

            {/* Policy Benefits Breakdown */}
            <div>
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
                Guaranteed Schedule of Benefits
              </h3>
              <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden text-xs">
                {selectedPolicy.benefits.map((b, idx) => (
                  <div key={idx} className="p-3 flex items-center justify-between hover:bg-slate-50">
                    <div>
                      <span className="font-semibold text-slate-800">{b.benefitType}</span>
                      <p className="text-[11px] text-slate-400">Direct university disbursement limit</p>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-slate-900 block">{formatINR(b.remainingAmount)}</span>
                      <span className="text-[10px] text-slate-400">of {formatINR(b.totalLimit)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Direct University Escrow Payout Clause */}
            <div className="p-3 bg-teal-50 border border-teal-200 rounded-xl text-xs text-teal-900 flex items-start space-x-2">
              <Sparkles className="w-4 h-4 text-teal-600 flex-shrink-0 mt-0.5" />
              <p>
                <strong>Direct Institution Settlement:</strong> Under Guidewire-inspired rules, claim proceeds are disbursed strictly to {selectedPolicy.universityName} Fee Escrow A/C to prevent academic interruption.
              </p>
            </div>

            <div className="flex justify-between items-center pt-3 border-t border-slate-100">
              <button
                onClick={() => alert(`Simulated Download of Certified Policy Bond Bond_${selectedPolicy.policyNumber}.pdf`)}
                className="inline-flex items-center text-xs font-semibold px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 text-slate-700"
              >
                <FileDown className="w-4 h-4 mr-1.5" />
                Download Policy Bond (PDF)
              </button>
              <button
                onClick={() => setSelectedPolicy(null)}
                className="px-4 py-2 text-xs font-semibold bg-brand-600 hover:bg-brand-700 text-white rounded-lg"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
