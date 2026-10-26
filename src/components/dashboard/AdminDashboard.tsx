import React from 'react';
import { useInsurance } from '../../context/InsuranceContext';
import { MetricCard } from '../common/MetricCard';
import { DEFAULT_INSURANCE_PLANS } from '../../config/plans';
import { formatINR } from '../../config/constants';
import {
  Settings,
  Shield,
  Layers,
  Activity,
  History,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

export const AdminDashboard: React.FC = () => {
  const { policies, claims, invoices, payments, auditLogs } = useInsurance();

  const totalPremiumsCollected = payments
    .filter(p => p.gatewayResponse === 'SUCCESS')
    .reduce((sum, p) => sum + p.amount, 0);

  const totalClaimsDisbursed = claims
    .filter(c => c.status === 'paid')
    .reduce((sum, c) => sum + c.actuallyPaidAmount, 0);

  const lossRatio = totalPremiumsCollected > 0
    ? Math.round((totalClaimsDisbursed / totalPremiumsCollected) * 100)
    : 0;

  // Chart Data: Financial Comparison
  const financialData = [
    { name: 'Premiums Invoiced', amount: invoices.reduce((s, i) => s + i.totalAmount, 0) },
    { name: 'Premiums Collected', amount: totalPremiumsCollected },
    { name: 'Claims Requested', amount: claims.reduce((s, c) => s + c.requestedAmount, 0) },
    { name: 'Claims Disbursed', amount: totalClaimsDisbursed },
  ];

  // Claims Status Distribution for Pie Chart
  const statusCounts = claims.reduce((acc, c) => {
    acc[c.status] = (acc[c.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const pieData = Object.keys(statusCounts).map(k => ({
    name: k.replace(/_/g, ' '),
    value: statusCounts[k],
  }));

  const COLORS = ['#0284c7', '#0d9488', '#10b981', '#f59e0b', '#64748b', '#ef4444'];

  return (
    <div className="space-y-8">
      {/* Admin Header */}
      <div className="bg-gradient-to-r from-navy-950 via-slate-900 to-navy-900 rounded-2xl p-6 sm:p-8 text-white shadow-xl">
        <div className="inline-flex items-center space-x-2 bg-brand-500/20 text-brand-300 text-xs px-3 py-1 rounded-full mb-3 border border-brand-500/30">
          <Settings className="w-3.5 h-3.5" />
          <span>PolicyCenter System Administrator & Actuarial Governance</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
          Executive Portfolio & Underwriting Console
        </h1>
        <p className="mt-2 text-slate-300 text-sm max-w-3xl leading-relaxed">
          Monitor enterprise loss ratios, active insurance contracts, deterministic underwriting matrices, and complete immutable state audit logs across all Guidewire modules.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <MetricCard
          title="Active Education Policies"
          value={policies.length}
          subtitle="In-force binding contracts"
          icon={<Shield className="w-5 h-5" />}
          accentColor="blue"
        />
        <MetricCard
          title="Total Premium Revenue"
          value={formatINR(totalPremiumsCollected)}
          subtitle="Collected through BillingCenter"
          icon={<CheckCircle2 className="w-5 h-5" />}
          accentColor="emerald"
        />
        <MetricCard
          title="Direct University Payouts"
          value={formatINR(totalClaimsDisbursed)}
          subtitle="Settled tuition fee continuity"
          icon={<Layers className="w-5 h-5" />}
          accentColor="purple"
        />
        <MetricCard
          title="Demonstration Loss Ratio"
          value={`${lossRatio}%`}
          subtitle="Disbursements / Premiums"
          icon={<Activity className="w-5 h-5" />}
          accentColor={lossRatio > 80 ? 'amber' : 'teal'}
        />
      </div>

      {/* Recharts Visualizations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Financial Flow Bar Chart */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <h2 className="text-sm font-bold text-slate-900 mb-1">
            Financial Balance: BillingCenter vs Claims Disbursements
          </h2>
          <p className="text-xs text-slate-500 mb-4">Values in INR (₹)</p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={financialData} margin={{ top: 10, right: 10, left: 20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis
                  tickFormatter={(val) => `₹${(val / 1000).toFixed(0)}k`}
                  tick={{ fontSize: 11 }}
                />
                <Tooltip
                  formatter={(val: number) => [formatINR(val), 'Amount']}
                  contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                />
                <Bar dataKey="amount" fill="#0284c7" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Claims Distribution Pie Chart */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <h2 className="text-sm font-bold text-slate-900 mb-1">
            ClaimCenter Lifecycle Distribution
          </h2>
          <p className="text-xs text-slate-500 mb-4">Proportion of claims in each adjudication state</p>
          <div className="h-64 flex items-center justify-center">
            {pieData.length === 0 ? (
              <p className="text-xs text-slate-400">No claim records</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                    labelLine={false}
                  >
                    {pieData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* Insurance Plans Configuration Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-200">
          <h2 className="text-base font-bold text-slate-900">
            Configured Insurance Plans & Underwriting Rates
          </h2>
          <p className="text-xs text-slate-500">
            Deterministic demonstration actuarial rates, waiting periods, and deductible parameters
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="px-5 py-3 text-left">Plan Name & Code</th>
                <th className="px-5 py-3 text-left">Max Tuition Coverage</th>
                <th className="px-5 py-3 text-left">Living Allowance</th>
                <th className="px-5 py-3 text-left">Waiting Period</th>
                <th className="px-5 py-3 text-left">Deductible</th>
                <th className="px-5 py-3 text-left">Base Rate / Lakh</th>
                <th className="px-5 py-3 text-left">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-slate-800">
              {DEFAULT_INSURANCE_PLANS.map(plan => (
                <tr key={plan.id} className="hover:bg-slate-50/60">
                  <td className="px-5 py-3">
                    <span className="font-bold text-slate-900 block">{plan.name}</span>
                    <span className="font-mono text-slate-400 text-[10px]">{plan.code}</span>
                  </td>
                  <td className="px-5 py-3 font-semibold text-brand-700">{formatINR(plan.maxTuitionCoverage)}</td>
                  <td className="px-5 py-3">{plan.maxLivingAllowanceAnnual > 0 ? `${formatINR(plan.maxLivingAllowanceAnnual)}/yr` : '—'}</td>
                  <td className="px-5 py-3">{plan.waitingPeriodDays} days</td>
                  <td className="px-5 py-3">{plan.deductiblePercentage}%</td>
                  <td className="px-5 py-3 font-mono font-bold text-slate-900">₹{plan.baseRatePerLakh}</td>
                  <td className="px-5 py-3">
                    <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-semibold text-[10px]">
                      Active
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Immutable System Audit Trail */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center">
              <History className="w-5 h-5 mr-2 text-brand-600" />
              Guidewire System Audit Trail (Last {auditLogs.length} Events)
            </h2>
            <p className="text-xs text-slate-500">Immutable chronological record of policy, billing and claim state mutations</p>
          </div>
          <span className="px-2.5 py-1 rounded bg-slate-100 text-slate-600 font-mono text-xs">
            Append-Only
          </span>
        </div>

        <div className="divide-y divide-slate-100 max-h-80 overflow-y-auto">
          {auditLogs.map(log => (
            <div key={log.id} className="p-4 hover:bg-slate-50/60 text-xs flex items-start space-x-3">
              <div className="w-2 h-2 rounded-full bg-brand-500 mt-1.5 flex-shrink-0"></div>
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-slate-800">{log.action}</span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {new Date(log.timestamp).toLocaleString('en-IN')}
                  </span>
                </div>
                <p className="text-slate-600">{log.notes || 'No description provided'}</p>
                <div className="flex items-center space-x-2 text-[10px] text-slate-400">
                  <span>Actor: <strong className="text-slate-700">{log.actorName}</strong> ({log.actorRole})</span>
                  <span>&bull;</span>
                  <span>Entity: <span className="font-mono">{log.entityType} ({log.entityId})</span></span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
