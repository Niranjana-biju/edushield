import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { GuardianDashboard } from './GuardianDashboard';
import { StudentDashboard } from './StudentDashboard';
import { ClaimsOfficerDashboard } from './ClaimsOfficerDashboard';
import { UniversityDashboard } from './UniversityDashboard';
import { AdminDashboard } from './AdminDashboard';

export const DashboardRouter: React.FC = () => {
  const { currentUser } = useAuth();

  switch (currentUser.role) {
    case 'parent':
      return <GuardianDashboard />;
    case 'student':
      return <StudentDashboard />;
    case 'claims_officer':
      return <ClaimsOfficerDashboard />;
    case 'university':
      return <UniversityDashboard />;
    case 'admin':
      return <AdminDashboard />;
    default:
      return <GuardianDashboard />;
  }
};
