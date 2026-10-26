import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useInsurance } from '../../context/InsuranceContext';
import { DEFAULT_INSURANCE_PLANS } from '../../config/plans';
import { QuoteService } from '../../services/quoteService';
import { PolicyService } from '../../services/policyService';
import { InsurancePlan, RiderConfig } from '../../types/insurance';
import { formatINR } from '../../config/constants';
import {
  FileText,
  Shield,
  GraduationCap,
  Sparkles,
  ArrowRight,
  Info,
  Building2,
  Calendar
} from 'lucide-react';

export const QuoteBuilder: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { universities, addQuote, addPolicy } = useInsurance();

  // Wizard state
  const [step, setStep] = useState<number>(1);

  // Form Fields
  const [studentName, setStudentName] = useState('Ananya Sharma');
  const [universityId, setUniversityId] = useState(universities[0]?.id || '');
  const [degreeProgram, setDegreeProgram] = useState('B.Tech in Computer Science & AI');
  const [currentYear, setCurrentYear] = useState<number>(3);
  const [totalYears, setTotalYears] = useState<number>(4);
  const [annualTuition, setAnnualTuition] = useState<number>(280000);
  const [sponsorAge, setSponsorAge] = useState<number>(48);
  const [hasPreExistingConditions, setHasPreExistingConditions] = useState<boolean>(false);

  // Selected Plan & Customizations
  const [selectedPlanId, setSelectedPlanId] = useState<string>(DEFAULT_INSURANCE_PLANS[1].id); // Campus Shield Plus
  const [selectedDeductible, setSelectedDeductible] = useState<number>(0);
  const [selectedRiders, setSelectedRiders] = useState<RiderConfig[]>([]);

  const selectedPlan: InsurancePlan = DEFAULT_INSURANCE_PLANS.find(p => p.id === selectedPlanId) || DEFAULT_INSURANCE_PLANS[0];
  const courseYearsRemaining = Math.max(1, totalYears - currentYear + 1);

  // Live Deterministic Calculation
  const rateBreakdown = QuoteService.calculatePremium(selectedPlan, {
    annualTuition,
    courseYearsRemaining,
    sponsorAge,
    sponsorPreExistingConditions: hasPreExistingConditions,
    selectedDeductible,
    selectedRiders,
  });

  const toggleRider = (rider: RiderConfig) => {
    setSelectedRiders(prev => {
      const exists = prev.some(r => r.id === rider.id);
      if (exists) {
        return prev.filter(r => r.id !== rider.id);
      } else {
        return [...prev, rider];
      }
    });
  };

  const handleCreateAndIssuePolicy = () => {
    const selectedUniv = universities.find(u => u.id === universityId) || universities[0];

    // 1. Generate Quote
    const quote = QuoteService.createQuote({
      guardianId: currentUser.id,
      studentId: `student_${Date.now()}`,
      planId: selectedPlan.id,
      annualTuition,
      courseYearsRemaining,
      sponsorAge,
      sponsorPreExistingConditions: hasPreExistingConditions,
      selectedDeductible,
      selectedRiders,
    });
    addQuote(quote);

    // 2. Issue Policy directly into PolicyCenter
    const student = {
      id: quote.studentId,
      guardianId: currentUser.id,
      fullName: studentName,
      dateOfBirth: '2004-06-18',
      gender: 'female' as const,
      universityId: selectedUniv.id,
      degreeProgram,
      studentEnrollmentId: `AMU/${new Date().getFullYear()}/${Math.floor(1000 + Math.random() * 9000)}`,
      currentYear,
      totalYears,
      annualTuitionFee: annualTuition,
      livingExpensesAnnual: selectedPlan.maxLivingAllowanceAnnual,
      academicStandingGpa: 8.9,
      createdAt: new Date().toISOString(),
    };

    const policy = PolicyService.issuePolicy({
      quote,
      student,
      university: selectedUniv,
      guardianName: currentUser.displayName,
    });

    addPolicy(policy);
    navigate('/policies');
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Title */}
      <div>
        <div className="inline-flex items-center space-x-2 bg-brand-50 text-brand-700 text-xs px-3 py-1 rounded-full mb-2 border border-brand-200">
          <FileText className="w-3.5 h-3.5" />
          <span>PolicyCenter &bull; Quote & Inception Engine</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
          Education Continuity Quote Generator
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Obtain deterministic higher education protection quotes with transparent sample actuarial rates.
        </p>
      </div>

      {/* Stepper Bar */}
      <div className="grid grid-cols-3 gap-2 border-b border-slate-200 pb-4 text-xs font-semibold">
        <div className={`flex items-center space-x-2 ${step >= 1 ? 'text-brand-600' : 'text-slate-400'}`}>
          <span className={`w-6 h-6 rounded-full flex items-center justify-center ${step >= 1 ? 'bg-brand-600 text-white' : 'bg-slate-200 text-slate-600'}`}>
            1
          </span>
          <span>Education & Sponsor Profile</span>
        </div>
        <div className={`flex items-center space-x-2 ${step >= 2 ? 'text-brand-600' : 'text-slate-400'}`}>
          <span className={`w-6 h-6 rounded-full flex items-center justify-center ${step >= 2 ? 'bg-brand-600 text-white' : 'bg-slate-200 text-slate-600'}`}>
            2
          </span>
          <span>Plan & Riders Selection</span>
        </div>
        <div className={`flex items-center space-x-2 ${step >= 3 ? 'text-brand-600' : 'text-slate-400'}`}>
          <span className={`w-6 h-6 rounded-full flex items-center justify-center ${step >= 3 ? 'bg-brand-600 text-white' : 'bg-slate-200 text-slate-600'}`}>
            3
          </span>
          <span>Actuarial Summary & Inception</span>
        </div>
      </div>

      {/* Step 1: Education & Sponsor Profile */}
      {step === 1 && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-6">
          <h2 className="text-base font-bold text-slate-900 flex items-center">
            <GraduationCap className="w-5 h-5 mr-2 text-brand-600" />
            Student & Academic Details
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
            <div>
              <label className="block font-medium text-slate-700 mb-1">Student Full Name</label>
              <input
                type="text"
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-brand-500"
                placeholder="e.g. Ananya Sharma"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">Enrolled Higher Institution / University</label>
              <select
                value={universityId}
                onChange={(e) => setUniversityId(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-brand-500"
              >
                {universities.map(u => (
                  <option key={u.id} value={u.id}>
                    {u.name} ({u.city})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">Degree Program & Specialization</label>
              <input
                type="text"
                value={degreeProgram}
                onChange={(e) => setDegreeProgram(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-brand-500"
                placeholder="e.g. B.Tech Computer Science"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Current Year</label>
                <select
                  value={currentYear}
                  onChange={(e) => setCurrentYear(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-brand-500"
                >
                  <option value={1}>Year 1</option>
                  <option value={2}>Year 2</option>
                  <option value={3}>Year 3</option>
                  <option value={4}>Year 4</option>
                  <option value={5}>Year 5</option>
                </select>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Total Course Years</label>
                <select
                  value={totalYears}
                  onChange={(e) => setTotalYears(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-brand-500"
                >
                  <option value={3}>3 Years (B.Sc / BBA)</option>
                  <option value={4}>4 Years (B.Tech / B.Des)</option>
                  <option value={5}>5 Years (MBBS / Dual)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">
                Annual University Tuition Fee (INR)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-slate-400 font-semibold">₹</span>
                <input
                  type="number"
                  value={annualTuition}
                  onChange={(e) => setAnnualTuition(Number(e.target.value))}
                  className="w-full pl-7 pr-3 py-2 border border-slate-300 rounded-lg text-sm font-semibold text-slate-900 focus:ring-2 focus:ring-brand-500"
                  placeholder="250000"
                />
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Total course exposure ({courseYearsRemaining} years remaining): {formatINR(annualTuition * courseYearsRemaining)}
              </p>
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">
                Primary Financial Sponsor Age (Years)
              </label>
              <input
                type="number"
                value={sponsorAge}
                onChange={(e) => setSponsorAge(Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-brand-500"
                min={21}
                max={75}
              />
              <p className="text-[11px] text-slate-400 mt-1">Standard mortality age gradient factor applied</p>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100">
            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={hasPreExistingConditions}
                onChange={(e) => setHasPreExistingConditions(e.target.checked)}
                className="w-4 h-4 rounded text-brand-600 focus:ring-brand-500"
              />
              <span className="text-xs text-slate-700">
                Sponsor declares pre-existing severe chronic medical condition (e.g. cardiac, diabetes with complications). Transparent +25% underwriting loading applies.
              </span>
            </label>
          </div>

          <div className="flex justify-end pt-4">
            <button
              onClick={() => setStep(2)}
              className="inline-flex items-center px-5 py-2.5 rounded-lg bg-brand-600 hover:bg-brand-700 text-white font-semibold text-sm transition shadow-sm"
            >
              Continue to Plan Selection <ArrowRight className="w-4 h-4 ml-2" />
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Plan & Riders Selection */}
      {step === 2 && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {DEFAULT_INSURANCE_PLANS.map(plan => {
              const isSelected = plan.id === selectedPlanId;
              const breakdown = QuoteService.calculatePremium(plan, {
                annualTuition,
                courseYearsRemaining,
                sponsorAge,
                sponsorPreExistingConditions: hasPreExistingConditions,
              });

              return (
                <div
                  key={plan.id}
                  onClick={() => setSelectedPlanId(plan.id)}
                  className={`rounded-xl p-5 cursor-pointer transition border-2 flex flex-col justify-between ${
                    isSelected
                      ? 'border-brand-600 bg-brand-50/40 shadow-md ring-2 ring-brand-500/20'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div>
                    <span className="text-[10px] font-mono font-bold uppercase text-slate-400 block">{plan.code}</span>
                    <h3 className="font-bold text-slate-900 text-base mt-1">{plan.name}</h3>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2">{plan.tagline}</p>

                    <div className="mt-4 pt-3 border-t border-slate-100 space-y-1.5 text-xs">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Max Tuition:</span>
                        <span className="font-bold text-slate-800">{formatINR(plan.maxTuitionCoverage)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Living Allowance:</span>
                        <span className="font-medium text-slate-800">
                          {plan.maxLivingAllowanceAnnual > 0 ? `${formatINR(plan.maxLivingAllowanceAnnual)}/yr` : 'Nil'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Waiting Period:</span>
                        <span className="font-medium text-slate-800">{plan.waitingPeriodDays} days</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 pt-3 border-t border-slate-200">
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Estimated Annual Premium</span>
                    <span className="text-xl font-bold text-brand-700">
                      {formatINR(breakdown.grossAnnualPremium)}
                      <span className="text-xs text-slate-400 font-normal">/yr</span>
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Deductibles and Riders */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-5">
            <h3 className="font-bold text-slate-900 text-sm flex items-center">
              <Shield className="w-4 h-4 mr-2 text-brand-600" />
              Configure Deductible Tier & Continuity Riders
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
              {/* Deductibles */}
              <div>
                <label className="block font-medium text-slate-700 mb-2">
                  Deductible Co-Pay Preference
                </label>
                <div className="space-y-2">
                  {[
                    { val: 0, label: '0% Deductible — Comprehensive first-rupee university payout' },
                    { val: 5, label: '5% Co-Pay — 8% Premium Discount' },
                    { val: 10, label: '10% Co-Pay — 15% Premium Discount' },
                  ].map(opt => (
                    <label
                      key={opt.val}
                      className={`flex items-center space-x-3 p-3 rounded-lg border cursor-pointer ${
                        selectedDeductible === opt.val
                          ? 'border-brand-500 bg-brand-50/60 font-medium text-slate-900'
                          : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                      }`}
                    >
                      <input
                        type="radio"
                        name="deductible"
                        checked={selectedDeductible === opt.val}
                        onChange={() => setSelectedDeductible(opt.val)}
                        className="text-brand-600 focus:ring-brand-500"
                      />
                      <span>{opt.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Riders */}
              <div>
                <label className="block font-medium text-slate-700 mb-2">
                  Available Policy Riders ({selectedPlan.name})
                </label>
                <div className="space-y-2">
                  {selectedPlan.availableRiders.map(rider => {
                    const isChecked = selectedRiders.some(r => r.id === rider.id);
                    return (
                      <div
                        key={rider.id}
                        onClick={() => toggleRider(rider)}
                        className={`p-3 rounded-lg border cursor-pointer transition ${
                          isChecked
                            ? 'border-teal-500 bg-teal-50/60'
                            : 'border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-slate-900">{rider.name}</span>
                          <span className="font-bold text-teal-700">+{formatINR(rider.annualFee)}/yr</span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-1">{rider.description}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center pt-4 border-t border-slate-100">
              <button
                onClick={() => setStep(1)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Back
              </button>
              <button
                onClick={() => setStep(3)}
                className="inline-flex items-center px-5 py-2.5 rounded-lg bg-brand-600 hover:bg-brand-700 text-white font-semibold text-sm transition shadow-sm"
              >
                View Actuarial Breakdown <ArrowRight className="w-4 h-4 ml-2" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Step 3: Transparent Actuarial Summary & Inception */}
      {step === 3 && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex justify-between items-start border-b border-slate-200 pb-5">
            <div>
              <div className="inline-flex items-center space-x-1.5 text-xs text-brand-600 font-semibold mb-1">
                <Sparkles className="w-4 h-4" />
                <span>Deterministic Guidewire-Style PolicyCenter Rating</span>
              </div>
              <h2 className="text-xl font-bold text-slate-900">{selectedPlan.name}</h2>
              <p className="text-xs text-slate-500">
                Beneficiary: {studentName} &bull; University: {universities.find(u => u.id === universityId)?.name}
              </p>
            </div>

            <div className="text-right">
              <span className="text-xs text-slate-400 block uppercase tracking-wider font-semibold">
                Gross Annual Premium Payable
              </span>
              <span className="text-3xl font-extrabold text-brand-700">
                {formatINR(rateBreakdown.grossAnnualPremium)}
              </span>
              <span className="text-xs text-slate-500 block">incl. 18% Statutory GST</span>
            </div>
          </div>

          {/* Transparent Calculation Breakdown */}
          <div className="bg-slate-50 rounded-xl p-5 border border-slate-200 space-y-4">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center">
              <Info className="w-4 h-4 mr-1.5 text-brand-600" />
              Deterministic Actuarial Formulation Transparency
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
              <div className="p-3 bg-white rounded-lg border border-slate-200">
                <span className="text-slate-400 block">Tuition Exposure Sum</span>
                <span className="font-bold text-slate-900 text-sm">{formatINR(rateBreakdown.baseTuitionSum)}</span>
              </div>
              <div className="p-3 bg-white rounded-lg border border-slate-200">
                <span className="text-slate-400 block">Base Rate</span>
                <span className="font-bold text-slate-900 text-sm">₹{selectedPlan.baseRatePerLakh} / Lakh</span>
              </div>
              <div className="p-3 bg-white rounded-lg border border-slate-200">
                <span className="text-slate-400 block">Sponsor Age Factor</span>
                <span className="font-bold text-slate-900 text-sm">{rateBreakdown.sponsorAgeFactor}x (Age {sponsorAge})</span>
              </div>
              <div className="p-3 bg-white rounded-lg border border-slate-200">
                <span className="text-slate-400 block">Statutory GST (18%)</span>
                <span className="font-bold text-slate-900 text-sm">{formatINR(rateBreakdown.gstAmount)}</span>
              </div>
            </div>

            <div className="border-t border-slate-200 pt-3">
              <span className="text-xs font-semibold text-slate-700 block mb-1">Underwriting Assumptions Disclosed:</span>
              <ul className="space-y-1 text-xs text-slate-600 list-disc pl-5">
                {rateBreakdown.calculationAssumptions.map((asm, idx) => (
                  <li key={idx}>{asm}</li>
                ))}
              </ul>
            </div>
          </div>

          <div className="flex justify-between items-center pt-4 border-t border-slate-100">
            <button
              onClick={() => setStep(2)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              Back to Plans
            </button>
            <button
              onClick={handleCreateAndIssuePolicy}
              className="inline-flex items-center px-6 py-3 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm transition shadow-md shadow-teal-600/20"
            >
              <Shield className="w-4 h-4 mr-2" />
              Bind & Issue Policy Bond
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
