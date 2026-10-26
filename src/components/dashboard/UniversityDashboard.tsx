import React, { useState } from 'react';
import { useInsurance } from '../../context/InsuranceContext';
import { MetricCard } from '../common/MetricCard';
import { formatINR } from '../../config/constants';
import {
  School,
  Building2,
  CheckCircle2,
  Clock,
  Check,
  X,
  FileCheck,
  ShieldCheck
} from 'lucide-react';

export const UniversityDashboard: React.FC = () => {
  const { universities, verifications, claims, verifyUniversityClaim } = useInsurance();

  const university = universities[0]; // Apex Metropolitan University
  const univVerifications = verifications.filter(v => v.universityId === university.id || true);
  const pendingVerifs = univVerifications.filter(v => v.status === 'pending');
  const settledClaims = claims.filter(c => c.universityId === university.id && c.status === 'paid');

  const totalReceivedEscrow = settledClaims.reduce((sum, c) => sum + c.actuallyPaidAmount, 0);

  // Verification modal state
  const [selectedVerifId, setSelectedVerifId] = useState<string | null>(null);
  const [certifiedFee, setCertifiedFee] = useState<number>(140000);
  const [remarks, setRemarks] = useState<string>('Student is actively enrolled and in good standing. Semester fee arrears authenticated.');

  const handleVerify = (verifId: string) => {
    verifyUniversityClaim({
      verificationId: verifId,
      feeDemandAmount: certifiedFee,
      feeDueDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString(),
      isEnrolled: true,
      remarks,
      verifiedBy: 'Dr. S. Ramanathan, Registrar',
    });
    setSelectedVerifId(null);
  };

  return (
    <div className="space-y-8">
      {/* University Banner */}
      <div className="bg-gradient-to-r from-navy-900 via-indigo-950 to-brand-900 rounded-2xl p-6 sm:p-8 text-white shadow-xl">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="inline-flex items-center space-x-2 bg-indigo-500/20 text-indigo-300 text-xs px-3 py-1 rounded-full mb-3 border border-indigo-500/30">
              <School className="w-3.5 h-3.5" />
              <span>University Bursar & Registrar Portal</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
              {university.name}
            </h1>
            <p className="mt-2 text-slate-300 text-sm max-w-2xl leading-relaxed">
              Institutional Fee Escrow Code: <strong className="text-white font-mono">{university.code}</strong> &bull; {university.accreditation}
            </p>
          </div>
          <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700 text-xs space-y-1">
            <span className="text-slate-400 font-semibold block uppercase tracking-wider text-[10px]">
              Institutional Escrow A/C (Direct NEFT Settlement)
            </span>
            <p className="text-white font-mono font-bold">{university.bankAccountEscrow.accountNumber}</p>
            <p className="text-slate-300 text-[11px]">{university.bankAccountEscrow.bankName} &bull; IFSC: {university.bankAccountEscrow.ifscCode}</p>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <MetricCard
          title="Pending Student Verifications"
          value={pendingVerifs.length}
          subtitle="Tuition fee certifications required"
          icon={<Clock className="w-5 h-5" />}
          accentColor={pendingVerifs.length > 0 ? 'amber' : 'emerald'}
        />
        <MetricCard
          title="Certified Continuity Cases"
          value={univVerifications.filter(v => v.status === 'verified').length}
          subtitle="Authenticated enrollment records"
          icon={<FileCheck className="w-5 h-5" />}
          accentColor="teal"
        />
        <MetricCard
          title="Total Escrow Payouts Received"
          value={formatINR(totalReceivedEscrow)}
          subtitle="Settled directly from EduShield"
          icon={<CheckCircle2 className="w-5 h-5" />}
          accentColor="emerald"
        />
        <MetricCard
          title="Enrolled Beneficiary Students"
          value={settledClaims.length + pendingVerifs.length + 1}
          subtitle="Protected by EduShield policies"
          icon={<Building2 className="w-5 h-5" />}
          accentColor="purple"
        />
      </div>

      {/* Pending Verifications Queue */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-200">
          <h2 className="text-base font-bold text-slate-900">
            Pending Student Fee Verifications ({pendingVerifs.length})
          </h2>
          <p className="text-xs text-slate-500">
            Authenticate bonafide enrollment and certify actual pending semester fee dues before claims payment
          </p>
        </div>

        {pendingVerifs.length === 0 ? (
          <div className="p-8 text-center text-slate-500 text-sm">
            No pending student fee verifications in the registrar inbox.
          </div>
        ) : (
          <div className="divide-y divide-slate-200">
            {pendingVerifs.map(v => (
              <div key={v.id} className="p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-xs font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded">
                      Claim Ref: {v.claimId}
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-medium">
                      Verification Pending
                    </span>
                  </div>
                  <p className="text-sm font-semibold text-slate-900">
                    Academic Year {v.academicYear} &bull; {v.semester}
                  </p>
                  <p className="text-xs text-slate-500">
                    Bursar Notes: {v.officialRemarks}
                  </p>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="text-right">
                    <span className="text-[11px] text-slate-400 block">Claimed Fee Amount</span>
                    <span className="font-bold text-slate-900">{formatINR(v.officialPendingFee)}</span>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedVerifId(v.id);
                      setCertifiedFee(v.officialPendingFee);
                    }}
                    className="inline-flex items-center text-xs font-semibold px-3 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-lg transition"
                  >
                    <Check className="w-3.5 h-3.5 mr-1" />
                    Certify Fees
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Verification Certification Modal */}
      {selectedVerifId && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-base flex items-center">
                <ShieldCheck className="w-5 h-5 mr-2 text-teal-600" />
                Registrar Fee Certification
              </h3>
              <button onClick={() => setSelectedVerifId(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  Certified Pending Semester Fee Liability (INR)
                </label>
                <input
                  type="number"
                  value={certifiedFee}
                  onChange={(e) => setCertifiedFee(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-semibold text-slate-900 focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  Registrar Certification Notes & Enrollment Remarks
                </label>
                <textarea
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs text-slate-800 focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div className="p-3 bg-brand-50 border border-brand-200 rounded-lg text-[11px] text-brand-900">
                <strong>Institutional Direct Payout Notice:</strong> Upon claim approval, approved fees will be wired directly via NEFT into {university.bankAccountEscrow.accountName} (A/C: {university.bankAccountEscrow.accountNumber}).
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setSelectedVerifId(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={() => handleVerify(selectedVerifId)}
                className="px-4 py-2 text-xs font-semibold bg-brand-600 hover:bg-brand-700 text-white rounded-lg shadow-sm"
              >
                Sign & Submit Official Verification
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
