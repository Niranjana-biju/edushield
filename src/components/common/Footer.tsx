import React from 'react';
import { Shield, AlertCircle, ExternalLink } from 'lucide-react';
import { APP_NAME, DISCLAIMER_TEXT } from '../../config/constants';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 border-t border-slate-800 text-slate-400 text-xs py-8 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Academic / Regulatory Prototype Notice Banner */}
        <div className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-4 flex items-start space-x-3 text-slate-300">
          <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
          <div className="text-xs leading-relaxed">
            <span className="font-semibold text-amber-300 block mb-1">
              Regulatory Compliance & Demonstration Disclaimer (B.Tech Capstone Project)
            </span>
            <p className="text-slate-300">{DISCLAIMER_TEXT}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 pt-4 border-t border-slate-800">
          <div className="space-y-2 md:col-span-2">
            <div className="flex items-center space-x-2 text-white font-bold text-base">
              <Shield className="w-5 h-5 text-brand-400" />
              <span>{APP_NAME} Architecture</span>
            </div>
            <p className="text-slate-400 max-w-md text-xs leading-normal">
              A comprehensive student continuity insurance platform demonstrating PolicyCenter, BillingCenter, and ClaimCenter integration workflows with direct university fee escrow settlement.
            </p>
          </div>

          <div>
            <h4 className="text-slate-200 font-semibold mb-2">Guidewire Concepts</h4>
            <ul className="space-y-1 text-slate-400">
              <li>• PolicyCenter (Quotes & Inception)</li>
              <li>• BillingCenter (Invoices & Premiums)</li>
              <li>• ClaimCenter (Triage & Adjudication)</li>
              <li>• Direct University Escrow Settlement</li>
            </ul>
          </div>

          <div>
            <h4 className="text-slate-200 font-semibold mb-2">Continuity Intelligence</h4>
            <ul className="space-y-1 text-slate-400">
              <li>• Funding-Gap Calculator</li>
              <li>• AI Policy Clause Explainer</li>
              <li>• OCR Document Assistant</li>
              <li>• Claim-Readiness Checklist</li>
            </ul>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between text-slate-400 text-[11px] gap-2">
          <span>&copy; {new Date().getFullYear()} EduShield Project. Built for Academic Engineering Evaluation.</span>
          <div className="flex items-center space-x-4">
            <span className="hover:text-slate-200 cursor-pointer">Security Policies</span>
            <span>&bull;</span>
            <span className="hover:text-slate-200 cursor-pointer">Actuarial Formulation</span>
            <span>&bull;</span>
            <span className="hover:text-slate-200 cursor-pointer flex items-center">
              IRDAI Guidelines <ExternalLink className="w-3 h-3 ml-1" />
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
