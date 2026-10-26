import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { InsuranceProvider } from './context/InsuranceContext';
import { Navbar } from './components/common/Navbar';
import { Footer } from './components/common/Footer';
import { RoleSwitcherBar } from './components/common/RoleSwitcherBar';
import { DashboardRouter } from './components/dashboard/DashboardRouter';
import { QuoteBuilder } from './components/quotes/QuoteBuilder';
import { PolicyList } from './components/policies/PolicyList';
import { BillingCenter } from './components/billing/BillingCenter';
import { ClaimList } from './components/claims/ClaimList';
import { ClaimIntakeWizard } from './components/claims/ClaimIntakeWizard';
import { FundingGapCalculator } from './components/intelligence/FundingGapCalculator';
import { AIPolicyAssistant } from './components/intelligence/AIPolicyAssistant';
import { UniversityDashboard } from './components/dashboard/UniversityDashboard';
import { AdminDashboard } from './components/dashboard/AdminDashboard';

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <InsuranceProvider>
        <BrowserRouter>
          <div className="min-h-screen bg-slate-50 flex flex-col text-slate-900 font-sans antialiased selection:bg-brand-500 selection:text-white">
            {/* Interactive Role Switcher Demonstration Bar */}
            <RoleSwitcherBar />

            {/* Main Application Header */}
            <Navbar />

            {/* Main Content Area */}
            <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
              <Routes>
                <Route path="/" element={<DashboardRouter />} />
                <Route path="/quotes/new" element={<QuoteBuilder />} />
                <Route path="/policies" element={<PolicyList />} />
                <Route path="/billing" element={<BillingCenter />} />
                <Route path="/claims" element={<ClaimList />} />
                <Route path="/claims/new" element={<ClaimIntakeWizard />} />
                <Route path="/funding-gap" element={<FundingGapCalculator />} />
                <Route path="/ai-assistant" element={<AIPolicyAssistant />} />
                <Route path="/university-portal" element={<UniversityDashboard />} />
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>

            {/* Prototype Disclaimer and Architecture Notice */}
            <Footer />
          </div>
        </BrowserRouter>
      </InsuranceProvider>
    </AuthProvider>
  );
};

export default App;
