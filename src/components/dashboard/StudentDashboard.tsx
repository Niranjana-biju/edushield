import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useInsurance } from '../../context/InsuranceContext';
import { MetricCard } from '../common/MetricCard';
import { formatINR } from '../../config/constants';
import {
  GraduationCap,
  Building2,
  Calendar,
  CheckCircle2,
  FileCheck,
  ShieldCheck,
  Award,
  Sparkles
} from 'lucide-react';

export const StudentDashboard: React.FC = () => {
  const { currentUser } = useAuth();
  const { students, policies, claims } = useInsurance();

  const student = students.find(s => s.fullName.toLowerCase().includes(currentUser.displayName.toLowerCase())) || students[0];
  const policy = policies.find(p => p.studentId === student.id) || policies[0];
  const studentClaims = claims.filter(c => c.studentId === student.id);

  const completedYears = student.currentYear - 1;
  const progressPercent = Math.round((completedYears / student.totalYears) * 100);

  return (
    <div className="space-y-8">
      {/* Student Banner */}
      <div className="bg-gradient-to-r from-teal-900 via-brand-900 to-navy-950 rounded-2xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center space-x-2 bg-teal-500/20 text-teal-300 text-xs px-3 py-1 rounded-full mb-3 border border-teal-500/30">
            <GraduationCap className="w-3.5 h-3.5" />
            <span>Student Degree Continuity Portal</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Academic Track: {student.fullName}
          </h1>
          <p className="mt-2 text-slate-300 text-sm leading-relaxed">
            Enrollment ID: <strong className="text-white font-mono">{student.studentEnrollmentId}</strong> &bull; Degree: {student.degreeProgram}
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link
              to="/funding-gap"
              className="inline-flex items-center px-4 py-2 rounded-lg bg-teal-500 hover:bg-teal-600 text-white font-semibold text-sm transition shadow-md"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Analyze Remaining Degree Funding Gap
            </Link>
            <Link
              to="/claims"
              className="inline-flex items-center px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-sm transition border border-slate-700"
            >
              <FileCheck className="w-4 h-4 mr-2" />
              View Enrolled Claims
            </Link>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <MetricCard
          title="Degree Progression"
          value={`Year ${student.currentYear} of ${student.totalYears}`}
          subtitle={`${progressPercent}% completed`}
          icon={<GraduationCap className="w-5 h-5" />}
          accentColor="teal"
        />
        <MetricCard
          title="Tuition Protected"
          value={formatINR(policy?.remainingCoverage || 2000000)}
          subtitle="Direct university disbursement limit"
          icon={<ShieldCheck className="w-5 h-5" />}
          accentColor="blue"
        />
        <MetricCard
          title="Annual Tuition Fee"
          value={formatINR(student.annualTuitionFee)}
          subtitle="Per academic year"
          icon={<Building2 className="w-5 h-5" />}
          accentColor="purple"
        />
        <MetricCard
          title="Academic Standing (CGPA)"
          value={student.academicStandingGpa ? `${student.academicStandingGpa} / 10` : 'First Class'}
          subtitle="Good institutional standing"
          icon={<Award className="w-5 h-5" />}
          accentColor="emerald"
        />
      </div>

      {/* Degree Protection Card */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
        <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center">
          <ShieldCheck className="w-5 h-5 mr-2 text-brand-600" />
          Active Policy Continuity Bond
        </h2>

        {policy ? (
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-5">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 border-b border-slate-200 pb-4">
              <div>
                <span className="text-xs font-mono font-bold text-brand-700 bg-brand-50 px-2.5 py-1 rounded border border-brand-200">
                  {policy.policyNumber}
                </span>
                <h3 className="font-bold text-slate-900 text-base mt-2">{policy.planName}</h3>
                <p className="text-xs text-slate-500">Sponsored by: {policy.guardianName}</p>
              </div>
              <div className="text-right">
                <span className="text-xs text-slate-500 block">Total Guaranteed Cap</span>
                <span className="text-xl font-bold text-brand-700">{formatINR(policy.totalSumInsured)}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 text-xs">
              <div>
                <span className="text-slate-400 block">Enrolled University:</span>
                <span className="font-semibold text-slate-800">{policy.universityName}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Policy Inception & Term:</span>
                <span className="font-semibold text-slate-800">
                  {new Date(policy.effectiveDate).toLocaleDateString('en-IN')} to {new Date(policy.expiryDate).toLocaleDateString('en-IN')}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block">Coverage Mechanism:</span>
                <span className="font-semibold text-slate-800 text-emerald-700 flex items-center">
                  <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                  Direct Institutional Fee Escrow
                </span>
              </div>
            </div>
          </div>
        ) : (
          <p className="text-slate-500 text-sm">No policy attached to student enrollment.</p>
        )}
      </div>

      {/* Continuity Events & Settlements */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
        <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center">
          <Calendar className="w-5 h-5 mr-2 text-brand-600" />
          University Tuition Settlements & Claims History
        </h2>

        {studentClaims.length === 0 ? (
          <p className="text-slate-500 text-sm">No disruption claims recorded. Degree progression is normal.</p>
        ) : (
          <div className="space-y-3">
            {studentClaims.map(c => (
              <div key={c.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800 font-mono">{c.claimNumber}</span>
                  <span className="font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 uppercase text-[10px]">
                    {c.status}
                  </span>
                </div>
                <p className="text-slate-600 mt-1">
                  Tuition settlement of <strong>{formatINR(c.actuallyPaidAmount || c.requestedAmount)}</strong> paid directly to {c.universityName} Fee Escrow.
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
