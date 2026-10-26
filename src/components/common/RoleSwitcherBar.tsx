import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useInsurance } from '../../context/InsuranceContext';
import { UserRole } from '../../types/insurance';
import { ShieldCheck, GraduationCap, School, FileSearch, Settings, RotateCcw } from 'lucide-react';

export const RoleSwitcherBar: React.FC = () => {
  const { currentUser, switchUserRole } = useAuth();
  const { resetAllToSeed } = useInsurance();

  const roles: { role: UserRole; label: string; icon: React.ReactNode; user: string }[] = [
    {
      role: 'parent',
      label: 'Parent / Sponsor',
      icon: <ShieldCheck className="w-4 h-4" />,
      user: 'Rajesh Sharma',
    },
    {
      role: 'student',
      label: 'Student Beneficiary',
      icon: <GraduationCap className="w-4 h-4" />,
      user: 'Ananya Sharma',
    },
    {
      role: 'claims_officer',
      label: 'Claims Officer (ClaimCenter)',
      icon: <FileSearch className="w-4 h-4" />,
      user: 'Pooja Verma',
    },
    {
      role: 'university',
      label: 'University Registrar',
      icon: <School className="w-4 h-4" />,
      user: 'Apex Metropolitan Univ',
    },
    {
      role: 'admin',
      label: 'System Admin (PolicyCenter)',
      icon: <Settings className="w-4 h-4" />,
      user: 'Vikram Malhotra',
    },
  ];

  return (
    <div className="bg-slate-900 border-b border-slate-800 text-white text-xs px-4 py-2 flex flex-wrap items-center justify-between gap-3">
      <div className="flex items-center space-x-2">
        <span className="font-semibold text-teal-400 flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
          <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse"></span>
          Interactive Role Simulation:
        </span>
        <span className="text-slate-400 hidden sm:inline">Switch persona to test end-to-end insurance workflows</span>
      </div>

      <div className="flex items-center flex-wrap gap-1.5">
        {roles.map(({ role, label, icon, user }) => {
          const isActive = currentUser.role === role;
          return (
            <button
              key={role}
              onClick={() => switchUserRole(role)}
              title={`Switch view to ${label} (${user})`}
              className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-md transition-all font-medium ${
                isActive
                  ? 'bg-brand-600 text-white shadow-sm ring-1 ring-brand-400'
                  : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700 hover:text-white'
              }`}
            >
              {icon}
              <span>{label}</span>
              {isActive && (
                <span className="ml-1 bg-brand-800 text-brand-200 text-[10px] px-1 rounded font-normal hidden md:inline">
                  Active
                </span>
              )}
            </button>
          );
        })}

        <button
          onClick={() => {
            if (confirm('Reset all demo claims, policies, and verifications to clean seed state?')) {
              resetAllToSeed();
            }
          }}
          title="Reset database to initial demo seed"
          className="flex items-center space-x-1 px-2 py-1 rounded-md bg-slate-800 text-slate-400 hover:text-rose-300 hover:bg-slate-700 transition"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span className="hidden lg:inline">Reset Demo</span>
        </button>
      </div>
    </div>
  );
};
