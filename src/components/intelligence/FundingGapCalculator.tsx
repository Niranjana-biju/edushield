import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useInsurance } from '../../context/InsuranceContext';
import { ContinuityIntelligence } from '../../services/continuityIntelligence';
import { formatINR } from '../../config/constants';
import {
  Calculator,
  ShieldCheck,
  AlertTriangle,
  TrendingUp,
  Sparkles,
  ArrowRight,
  Info,
  DollarSign
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';

export const FundingGapCalculator: React.FC = () => {
  const { policies } = useInsurance();

  const totalCurrentInsurance = policies.reduce((sum, p) => sum + p.remainingCoverage, 0);

  // Inputs
  const [remainingYears, setRemainingYears] = useState<number>(3);
  const [annualTuition, setAnnualTuition] = useState<number>(280000);
  const [annualLivingExpense, setAnnualLivingExpense] = useState<number>(120000);
  const [annualInflationRate, setAnnualInflationRate] = useState<number>(6); // 6% education inflation
  const [existingSavings, setExistingSavings] = useState<number>(200000);
  const [otherAid, setOtherAid] = useState<number>(50000);
  const [currentCoverage, setCurrentCoverage] = useState<number>(totalCurrentInsurance || 1500000);

  // Deterministic calculation
  const result = ContinuityIntelligence.calculateFundingGap({
    remainingYears,
    annualTuition,
    annualLivingExpense,
    annualInflationRate,
    existingSavingsDedicated: existingSavings,
    otherScholarshipsOrAid: otherAid,
    currentInsuranceCoverageLimit: currentCoverage,
  });

  const chartData = result.yearlyBreakdown.map(y => ({
    name: `Year ${y.year}`,
    'Total Cost': y.totalAnnualCost,
    'Tuition Fee': y.tuitionWithInflation,
    'Living & Hostel': y.livingWithInflation,
    'Insured Cap': y.insuredProtection,
    'Uncovered Gap': y.uncoveredShortfall,
  }));

  const severityColor = {
    fully_covered: 'bg-emerald-50 text-emerald-800 border-emerald-300',
    moderate_gap: 'bg-amber-50 text-amber-800 border-amber-300',
    high_vulnerability: 'bg-rose-50 text-rose-800 border-rose-300',
  }[result.gapSeverity];

  const severityLabel = {
    fully_covered: 'Fully Insured & Protected Against Sponsor Disruption',
    moderate_gap: 'Moderate Disruption Vulnerability (Uncovered Shortfall Present)',
    high_vulnerability: 'High Vulnerability: Severe Academic Continuity Risk',
  }[result.gapSeverity];

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-navy-900 via-brand-900 to-teal-950 rounded-2xl p-6 sm:p-8 text-white shadow-xl">
        <div className="inline-flex items-center space-x-2 bg-teal-500/20 text-teal-300 text-xs px-3 py-1 rounded-full mb-3 border border-teal-500/30">
          <Sparkles className="w-3.5 h-3.5" />
          <span>EduShield Continuity Intelligence &bull; Core Innovation</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
          Education Continuity Funding-Gap Calculator
        </h1>
        <p className="mt-2 text-slate-300 text-sm max-w-3xl leading-relaxed">
          Estimate remaining higher education expenses under compounded educational inflation, evaluate family financial buffers, and quantify the net uninsured funding gap against sponsor disruptions.
        </p>
      </div>

      {/* Main Grid: Inputs vs Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Form: Assumptions & Sliders */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-5 text-xs">
          <h2 className="text-sm font-bold text-slate-900 flex items-center">
            <Calculator className="w-4 h-4 mr-2 text-brand-600" />
            Degree & Financial Parameters
          </h2>

          <div>
            <div className="flex justify-between font-semibold text-slate-700 mb-1">
              <span>Remaining Degree Years:</span>
              <span className="text-brand-700 font-bold">{remainingYears} Years</span>
            </div>
            <input
              type="range"
              min={1}
              max={5}
              value={remainingYears}
              onChange={(e) => setRemainingYears(Number(e.target.value))}
              className="w-full accent-brand-600 cursor-pointer"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Annual University Tuition Fee (INR)</label>
            <div className="relative">
              <span className="absolute left-3 top-2 text-slate-400 font-semibold">₹</span>
              <input
                type="number"
                value={annualTuition}
                onChange={(e) => setAnnualTuition(Number(e.target.value))}
                className="w-full pl-7 pr-3 py-2 border border-slate-300 rounded-lg font-bold text-slate-900 text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Annual Living & Campus Hostel Expense</label>
            <div className="relative">
              <span className="absolute left-3 top-2 text-slate-400 font-semibold">₹</span>
              <input
                type="number"
                value={annualLivingExpense}
                onChange={(e) => setAnnualLivingExpense(Number(e.target.value))}
                className="w-full pl-7 pr-3 py-2 border border-slate-300 rounded-lg text-slate-900 text-sm"
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between font-semibold text-slate-700 mb-1">
              <span>Higher Education Inflation Rate:</span>
              <span className="text-amber-700 font-bold">{annualInflationRate}% p.a.</span>
            </div>
            <input
              type="range"
              min={2}
              max={12}
              value={annualInflationRate}
              onChange={(e) => setAnnualInflationRate(Number(e.target.value))}
              className="w-full accent-amber-600 cursor-pointer"
            />
            <span className="text-[10px] text-slate-400">Compounded year-over-year university fee inflation</span>
          </div>

          <div className="pt-3 border-t border-slate-100 space-y-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Dedicated Family College Savings</label>
              <input
                type="number"
                value={existingSavings}
                onChange={(e) => setExistingSavings(Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 text-sm"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Scholarships, Grants or State Aid</label>
              <input
                type="number"
                value={otherAid}
                onChange={(e) => setOtherAid(Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 text-sm"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Active EduShield Policy Limit</label>
              <input
                type="number"
                value={currentCoverage}
                onChange={(e) => setCurrentCoverage(Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg font-bold text-brand-700 text-sm"
              />
            </div>
          </div>
        </div>

        {/* Right Area: Results & Visual Recharts */}
        <div className="lg:col-span-2 space-y-6">
          {/* Severity Banner */}
          <div className={`p-5 rounded-xl border ${severityColor} flex items-start space-x-3`}>
            <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-bold text-sm">{severityLabel}</h3>
              <p className="text-xs mt-1 leading-relaxed">
                {result.gapSeverity === 'fully_covered'
                  ? 'Your active policy and savings adequately guarantee degree completion through graduation even during severe household sponsor disruptions.'
                  : `In the event of an untimely sponsor disruption, an uncovered funding shortfall of ${formatINR(result.netUncoveredFundingGap)} could interrupt student enrollment.`}
              </p>
            </div>
          </div>

          {/* KPI Output Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-4 bg-white rounded-xl border border-slate-200">
              <span className="text-slate-400 block">Total Future Degree Cost</span>
              <span className="text-base font-bold text-slate-900 mt-1 block">
                {formatINR(result.totalEstimatedFutureCost)}
              </span>
              <span className="text-[10px] text-slate-400">incl. {annualInflationRate}% inflation</span>
            </div>

            <div className="p-4 bg-white rounded-xl border border-slate-200">
              <span className="text-slate-400 block">Available Reserves</span>
              <span className="text-base font-bold text-slate-900 mt-1 block">
                {formatINR(result.totalAvailableResources)}
              </span>
              <span className="text-[10px] text-slate-400">Savings & Grants</span>
            </div>

            <div className="p-4 bg-white rounded-xl border border-slate-200">
              <span className="text-slate-400 block">Insured Protection Cap</span>
              <span className="text-base font-bold text-brand-700 mt-1 block">
                {formatINR(result.totalInsuranceCovered)}
              </span>
              <span className="text-[10px] text-brand-600">EduShield Guarantee</span>
            </div>

            <div className="p-4 bg-white rounded-xl border border-slate-200">
              <span className="text-slate-400 block">Net Uncovered Shortfall</span>
              <span className={`text-base font-bold mt-1 block ${result.netUncoveredFundingGap > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                {formatINR(result.netUncoveredFundingGap)}
              </span>
              <span className="text-[10px] text-slate-400">At-Risk Gap</span>
            </div>
          </div>

          {/* Recharts Yearly Progression Breakdown */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 mb-1">
              Year-by-Year Cost Progression vs Insured Coverage (INR)
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Deterministic compounding of university fee + living costs across remaining semesters
            </p>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: 20, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis tickFormatter={(val) => `₹${(val / 1000).toFixed(0)}k`} tick={{ fontSize: 11 }} />
                  <Tooltip
                    formatter={(val: number) => [formatINR(val)]}
                    contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                  <Bar dataKey="Total Cost" fill="#0284c7" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Insured Cap" fill="#0d9488" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Uncovered Gap" fill="#f43f5e" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Actionable Recommendation */}
          {result.recommendedCoverageAdjustment > 0 && (
            <div className="p-5 bg-gradient-to-r from-brand-50 to-teal-50 border border-brand-200 rounded-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-xs">
              <div className="space-y-1">
                <span className="font-bold text-brand-900 text-sm">
                  Recommended Policy Enhancement: +{formatINR(result.recommendedCoverageAdjustment)}
                </span>
                <p className="text-slate-600">
                  Upgrade your coverage limit to eliminate the remaining degree continuity vulnerability.
                </p>
              </div>
              <Link
                to="/quotes/new"
                className="inline-flex items-center px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-lg font-semibold shadow-xs transition"
              >
                Recalculate Quote <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
