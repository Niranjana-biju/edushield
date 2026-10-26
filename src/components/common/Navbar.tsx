import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useInsurance } from '../../context/InsuranceContext';
import {
  Shield,
  Bell,
  CheckCircle2,
  FileText,
  Calculator,
  HelpCircle,
  Menu,
  X,
  CreditCard,
  FileCheck
} from 'lucide-react';
import { ROLE_LABELS } from '../../config/constants';

export const Navbar: React.FC = () => {
  const { currentUser, logout } = useAuth();
  const { notifications, markNotificationRead } = useInsurance();
  const [showNotifications, setShowNotifications] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const roleMeta = ROLE_LABELS[currentUser.role] || ROLE_LABELS.parent;

  const navLinks = [
    { to: '/', label: 'Dashboard', icon: <Shield className="w-4 h-4 mr-1.5" /> },
    { to: '/quotes/new', label: 'Get Quote', icon: <FileText className="w-4 h-4 mr-1.5" /> },
    { to: '/policies', label: 'Policies', icon: <FileCheck className="w-4 h-4 mr-1.5" /> },
    { to: '/billing', label: 'BillingCenter', icon: <CreditCard className="w-4 h-4 mr-1.5" /> },
    { to: '/claims', label: 'ClaimCenter', icon: <CheckCircle2 className="w-4 h-4 mr-1.5" /> },
    { to: '/funding-gap', label: 'Continuity Intelligence', icon: <Calculator className="w-4 h-4 mr-1.5" /> },
  ];

  if (currentUser.role === 'university') {
    navLinks.splice(1, 0, { to: '/university-portal', label: 'Bursar Verifications', icon: <FileCheck className="w-4 h-4 mr-1.5" /> });
  }

  if (currentUser.role === 'admin') {
    navLinks.push({ to: '/admin', label: 'Policy Administration', icon: <HelpCircle className="w-4 h-4 mr-1.5" /> });
  }

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <div className="flex items-center space-x-3">
            <Link to="/" className="flex items-center space-x-2.5">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-700 via-brand-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-brand-500/20">
                <Shield className="w-6 h-6 stroke-[2.2]" />
              </div>
              <div>
                <span className="text-xl font-bold tracking-tight text-navy-900 flex items-center">
                  Edu<span className="text-brand-600">Shield</span>
                </span>
                <span className="block text-[10px] font-medium text-slate-500 -mt-1 tracking-wider uppercase">
                  Education Continuity
                </span>
              </div>
            </Link>

            {/* Role indicator pill */}
            <div className="hidden lg:flex items-center ml-4 pl-4 border-l border-slate-200 text-xs">
              <span className="px-2.5 py-0.5 rounded-full bg-slate-100 border border-slate-200 text-slate-700 font-medium">
                {roleMeta.title}
              </span>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
            {navLinks.map(link => {
              const isActive = location.pathname === link.to;
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-brand-50 text-brand-700 font-semibold'
                      : 'text-slate-600 hover:text-navy-900 hover:bg-slate-100/70'
                  }`}
                >
                  {link.icon}
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Right Action Icons */}
          <div className="flex items-center space-x-3">
            {/* Notifications Bell */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 relative transition"
                aria-label="View notifications"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notification Dropdown */}
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between">
                    <span className="font-semibold text-xs text-slate-800 uppercase tracking-wider">
                      Insurance Notifications ({notifications.length})
                    </span>
                    <span className="text-[11px] text-brand-600 font-medium">Guidewire Event Feed</span>
                  </div>
                  <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
                    {notifications.length === 0 ? (
                      <div className="p-4 text-center text-xs text-slate-500">No new notifications</div>
                    ) : (
                      notifications.map(n => (
                        <div
                          key={n.id}
                          onClick={() => markNotificationRead(n.id)}
                          className={`p-3 text-xs hover:bg-slate-50 cursor-pointer transition ${
                            !n.isRead ? 'bg-brand-50/50' : ''
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-slate-900">{n.title}</span>
                            <span className="text-[10px] text-slate-400">
                              {new Date(n.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                            </span>
                          </div>
                          <p className="text-slate-600 mt-1">{n.message}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* User Profile Avatar Pill */}
            <div className="flex items-center pl-2">
              <div className="hidden sm:block text-right mr-2">
                <span className="block text-xs font-semibold text-slate-800">{currentUser.displayName}</span>
                <span className="block text-[10px] text-slate-400 capitalize">{currentUser.role.replace('_', ' ')}</span>
              </div>
              <div className="w-8 h-8 rounded-full bg-brand-100 text-brand-700 font-bold text-xs flex items-center justify-center border border-brand-200">
                {currentUser.displayName.charAt(0)}
              </div>
            </div>

            {/* Mobile Hamburger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-slate-600 hover:text-slate-900"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-2 pb-4 space-y-1">
          {navLinks.map(link => (
            <Link
              key={link.to}
              to={link.to}
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:bg-slate-100"
            >
              {link.icon}
              {link.label}
            </Link>
          ))}
          <div className="pt-2 border-t border-slate-100">
            <button
              onClick={() => logout()}
              className="w-full text-left px-3 py-2 text-sm text-rose-600 font-medium hover:bg-rose-50 rounded-md"
            >
              Sign Out
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
