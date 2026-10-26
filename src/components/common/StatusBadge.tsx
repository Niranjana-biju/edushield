import React from 'react';
import { ClaimStatus, PolicyStatus, InvoiceStatus } from '../../types/insurance';
import { CLAIM_STATUS_MAP, POLICY_STATUS_MAP } from '../../config/constants';

interface StatusBadgeProps {
  type: 'claim' | 'policy' | 'invoice';
  status: string;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ type, status, size = 'md' }) => {
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs font-semibold';

  if (type === 'claim') {
    const claimConfig = CLAIM_STATUS_MAP[status as ClaimStatus] || {
      label: status,
      color: 'bg-slate-100 text-slate-700 border-slate-300',
    };
    return (
      <span className={`inline-flex items-center rounded-full border ${claimConfig.color} ${sizeClasses}`}>
        <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5 opacity-75"></span>
        {claimConfig.label}
      </span>
    );
  }

  if (type === 'policy') {
    const policyConfig = POLICY_STATUS_MAP[status as PolicyStatus] || {
      label: status,
      badgeClass: 'bg-slate-100 text-slate-700 border-slate-300',
    };
    return (
      <span className={`inline-flex items-center rounded-full border ${policyConfig.badgeClass} ${sizeClasses}`}>
        <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5 opacity-75"></span>
        {policyConfig.label}
      </span>
    );
  }

  if (type === 'invoice') {
    let color = 'bg-slate-100 text-slate-700 border-slate-300';
    let label = status;
    switch (status as InvoiceStatus) {
      case 'paid':
        color = 'bg-emerald-100 text-emerald-800 border-emerald-300';
        label = 'Paid in Full';
        break;
      case 'issued':
        color = 'bg-amber-100 text-amber-800 border-amber-300';
        label = 'Payment Due';
        break;
      case 'overdue':
        color = 'bg-rose-100 text-rose-800 border-rose-300';
        label = 'Overdue';
        break;
      case 'cancelled':
        color = 'bg-slate-100 text-slate-700 border-slate-300';
        label = 'Cancelled';
        break;
    }
    return (
      <span className={`inline-flex items-center rounded-full border ${color} ${sizeClasses}`}>
        <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5 opacity-75"></span>
        {label}
      </span>
    );
  }

  return (
    <span className={`inline-flex items-center rounded-full border bg-slate-100 text-slate-700 border-slate-300 ${sizeClasses}`}>
      {status}
    </span>
  );
};
