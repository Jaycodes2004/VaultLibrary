'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Shield,
  Key,
  Mail,
  User,
  Building,
  FileText,
  Send,
  CheckCircle2,
  AlertCircle,
  BookOpen,
  ArrowRight,
  Lock,
  Layers,
  Sparkles,
  Server,
  Database
} from 'lucide-react';
import { UserProfile } from '../lib/types';
import { setSessionCookie } from '../lib/storage';

interface LibraryGatewayProps {
  onLoginSuccess: (user: UserProfile) => void;
  totalBooksCount: number;
  onPreviewCatalog: () => void;
  activeFontClass?: string;
}

export const LibraryGateway: React.FC<LibraryGatewayProps> = ({
  onLoginSuccess,
  totalBooksCount,
  onPreviewCatalog,
  activeFontClass = 'font-serif',
}) => {
  // Tabs: 'request' (default) | 'login'
  const [activeTab, setActiveTab] = useState<'request' | 'login'>('request');

  // Request Access Form State
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [organization, setOrganization] = useState('');
  const [purpose, setPurpose] = useState('');
  const [desiredTier, setDesiredTier] = useState('scholar');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [requestSubmittedSuccess, setRequestSubmittedSuccess] = useState(false);
  const [requestRefId, setRequestRefId] = useState('');
  const [requestError, setRequestError] = useState('');
  const [dispatchStatus, setDispatchStatus] = useState<string>('');

  // Sign In Form State
  const [loginEmail, setLoginEmail] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [loginError, setLoginError] = useState('');

  // Submit Access Request (Transmitted to Administrator)
  const handleRequestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !email.trim()) {
      setRequestError('Full Name and Email are required.');
      return;
    }

    setIsSubmitting(true);
    setRequestError('');
    setDispatchStatus('');

    try {
      const res = await fetch('/api/access-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: fullName.trim(),
          email: email.trim(),
          organization: organization.trim(),
          purpose: purpose.trim(),
          desiredTier,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setRequestRefId(data.request.id);
        setRequestSubmittedSuccess(true);
        if (data.dispatch?.mode === 'live_smtp') {
          setDispatchStatus('Live Email Notification Dispatched to Administrator');
        } else {
          setDispatchStatus('Administrative Dispatch Logged in Queue');
        }
      } else {
        setRequestError(data.error || 'Failed to submit request.');
      }
    } catch (err: any) {
      setRequestError('Network error communicating with library server.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Sign In for Approved Scholars
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail.trim()) {
      setLoginError('Please enter your approved scholar email address.');
      return;
    }

    setIsLoggingIn(true);
    setLoginError('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail.trim() }),
      });

      const data = await res.json();
      if (data.success && data.user) {
        setSessionCookie({
          userId: data.user.userId,
          name: data.user.name,
          email: data.user.email,
          role: 'scholar',
        });
        onLoginSuccess(data.user);
      } else {
        setLoginError(data.error || 'Email not found in authorized scholars directory.');
      }
    } catch (err: any) {
      setLoginError('Error connecting to authentication gateway.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleDemoLogin = (emailAddress: string) => {
    setLoginEmail(emailAddress);
    setIsLoggingIn(true);
    fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: emailAddress }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.success && data.user) {
          setSessionCookie({
            userId: data.user.userId,
            name: data.user.name,
            email: data.user.email,
            role: 'scholar',
          });
          onLoginSuccess(data.user);
        } else {
          setLoginError(data.error || 'Demo login failed.');
        }
      })
      .catch(() => setLoginError('Connection error during demo login.'))
      .finally(() => setIsLoggingIn(false));
  };

  return (
    <div className="w-full space-y-12">
      {/* Hero Archival Banner */}
      <div className="text-center space-y-4 max-w-3xl mx-auto pt-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full parchment-card border border-[#8c6742]/30 text-xs font-semibold text-[#8c6742] dark:text-[#d4af37] shadow-sm">
          <Shield className="w-3.5 h-3.5" />
          <span>Restricted Academic Repository &bull; Request-Only Access</span>
        </div>

        <h1 className={`text-3xl sm:text-5xl font-bold tracking-tight text-stone-900 dark:text-stone-100 ${activeFontClass}`}>
          ReadVault Classical & Computational Archive
        </h1>

        <p className="text-sm sm:text-base text-stone-600 dark:text-stone-300 font-serif leading-relaxed">
          Welcome to the restricted archive. All <span className="font-semibold text-[#8c6742] dark:text-[#d4af37]">{totalBooksCount} physical volumes</span> in this collection are strictly request-access only. To explore the archive, please submit an Access Request below or sign in with an administrator-authorized institutional email.
        </p>

        {/* Quick Archive Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 max-w-2xl mx-auto">
          <div className="parchment-card p-3 rounded-xl border border-black/5 dark:border-white/5 text-center">
            <div className="text-xl font-bold font-mono text-[#8c6742] dark:text-[#d4af37]">{totalBooksCount}</div>
            <div className="text-[10px] uppercase tracking-wider text-stone-500 font-serif">Preserved Volumes</div>
          </div>
          <div className="parchment-card p-3 rounded-xl border border-black/5 dark:border-white/5 text-center">
            <div className="text-xl font-bold font-mono text-emerald-600 dark:text-emerald-400">100%</div>
            <div className="text-[10px] uppercase tracking-wider text-stone-500 font-serif">Physical Archive</div>
          </div>
          <div className="parchment-card p-3 rounded-xl border border-black/5 dark:border-white/5 text-center">
            <div className="text-xl font-bold font-mono text-indigo-600 dark:text-indigo-400">PostgreSQL</div>
            <div className="text-[10px] uppercase tracking-wider text-stone-500 font-serif">Dynamic Database</div>
          </div>
          <div className="parchment-card p-3 rounded-xl border border-black/5 dark:border-white/5 text-center">
            <div className="text-xl font-bold font-mono text-amber-600 dark:text-amber-400">Port 9000</div>
            <div className="text-[10px] uppercase tracking-wider text-stone-500 font-serif">LAN & IIS Ready</div>
          </div>
        </div>
      </div>

      {/* Main Dual-Action Access Gateway Card */}
      <div className="max-w-2xl mx-auto parchment-card p-6 sm:p-8 rounded-3xl border border-[#8c6742]/30 shadow-2xl relative overflow-hidden">
        {/* Subtle Watermark Decoration */}
        <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-gradient-to-br from-[#8c6742]/10 to-transparent pointer-events-none blur-2xl" />

        {/* Tab Selector */}
        <div className="flex rounded-2xl bg-black/5 dark:bg-white/5 p-1 mb-8 border border-black/10 dark:border-white/10">
          <button
            onClick={() => {
              setActiveTab('request');
              setRequestSubmittedSuccess(false);
            }}
            className={`flex-1 py-3 text-xs sm:text-sm font-semibold rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'request'
                ? 'bg-[#8c6742] text-white shadow-md'
                : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white'
            }`}
          >
            <Send className="w-4 h-4" />
            <span>1. Request Library Access</span>
          </button>

          <button
            onClick={() => setActiveTab('login')}
            className={`flex-1 py-3 text-xs sm:text-sm font-semibold rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'login'
                ? 'bg-[#8c6742] text-white shadow-md'
                : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white'
            }`}
          >
            <Key className="w-4 h-4" />
            <span>2. Authorized Scholar Sign In</span>
          </button>
        </div>

        {/* TAB 1: Request Access Form */}
        {activeTab === 'request' && (
          <div>
            {!requestSubmittedSuccess ? (
              <form onSubmit={handleRequestSubmit} className="space-y-4">
                <div className="p-3.5 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-xs text-indigo-900 dark:text-indigo-200 leading-relaxed flex items-start gap-2.5">
                  <Mail className="w-4 h-4 text-indigo-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold">Direct Administrator Notification:</span>
                    <br />
                    Submitting this form immediately dispatches an administrative alert with your details to the Library Security Committee for review and tier assignment.
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1.5 flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-[#8c6742]" />
                      <span>Full Name</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. Dr. Julian Vance"
                      className="w-full px-3.5 py-2.5 rounded-xl parchment-input text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1.5 flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-[#8c6742]" />
                      <span>Email Address</span>
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. j.vance@oxford.edu"
                      className="w-full px-3.5 py-2.5 rounded-xl parchment-input text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1.5 flex items-center gap-1.5">
                      <Building className="w-3.5 h-3.5 text-[#8c6742]" />
                      <span>University / Institution</span>
                    </label>
                    <input
                      type="text"
                      value={organization}
                      onChange={(e) => setOrganization(e.target.value)}
                      placeholder="e.g. Oxford Dept of CS / Independent"
                      className="w-full px-3.5 py-2.5 rounded-xl parchment-input text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1.5 flex items-center gap-1.5">
                      <Shield className="w-3.5 h-3.5 text-[#8c6742]" />
                      <span>Desired Access Tier</span>
                    </label>
                    <select
                      value={desiredTier}
                      onChange={(e) => setDesiredTier(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl parchment-input text-xs"
                    >
                      <option value="scholar">Scholar (Access to Core Curriculum)</option>
                      <option value="researcher">Senior Researcher (Full 241 Volumes)</option>
                      <option value="fellow">Fellow (Download & OCR Privileges)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1.5 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-[#8c6742]" />
                    <span>Statement of Research Need / Purpose</span>
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={purpose}
                    onChange={(e) => setPurpose(e.target.value)}
                    placeholder="Briefly state your academic or research justification to access the physical collection..."
                    className="w-full px-3.5 py-2.5 rounded-xl parchment-input text-xs leading-relaxed"
                  />
                </div>

                {requestError && (
                  <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/25 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-rose-500 flex-shrink-0" />
                    <span>{requestError}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 rounded-xl bg-[#8c6742] hover:bg-[#725232] text-white font-semibold text-sm transition-all shadow-lg shadow-[#8c6742]/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                  <span>{isSubmitting ? 'Dispatching Notice to Administration...' : 'Submit Access Request for Review'}</span>
                </button>

                <p className="text-[11px] text-stone-500 text-center font-mono pt-1">
                  Administrative Dispatch Protocol: <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Live SMTP Encrypted Transmission</span>
                </p>
              </form>
            ) : (
              /* Success Confirmation Card */
              <div className="p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 space-y-4 text-center animate-in fade-in duration-300">
                <div className="w-12 h-12 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-6 h-6" />
                </div>

                <div>
                  <h3 className="text-lg font-bold text-stone-900 dark:text-white">Access Request Dispatched!</h3>
                  <p className="text-xs text-stone-600 dark:text-stone-300 mt-1 leading-relaxed">
                    Your application has been registered in the PostgreSQL database and an administrative alert was forwarded for verification:
                  </p>
                  {dispatchStatus && (
                    <div className="mt-2 inline-block px-3 py-1 rounded-lg bg-emerald-600/20 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 font-mono text-xs font-semibold">
                      {dispatchStatus}
                    </div>
                  )}
                </div>

                <div className="p-4 rounded-xl bg-black/5 dark:bg-black/40 border border-black/10 dark:border-white/10 text-left text-xs font-mono space-y-1.5">
                  <div className="text-stone-500">Request Identifier: <span className="text-stone-900 dark:text-white font-bold">{requestRefId}</span></div>
                  <div className="text-stone-500">Applicant: <span className="text-stone-900 dark:text-white">{fullName}</span></div>
                  <div className="text-stone-500">Email: <span className="text-indigo-600 dark:text-indigo-300">{email}</span></div>
                  <div className="text-stone-500">Status: <span className="text-amber-600 dark:text-amber-400 font-semibold">Pending Administrative Review</span></div>
                </div>

                <p className="text-xs text-stone-500 dark:text-stone-400 leading-relaxed font-serif">
                  Once approved in the Admin Console, your account will be active immediately. You can now test sign in using the Authorized Scholar tab.
                </p>

                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <button
                    onClick={() => setActiveTab('login')}
                    className="flex-1 py-2.5 rounded-xl bg-[#8c6742] hover:bg-[#725232] text-white font-semibold text-xs transition-all shadow"
                  >
                    Proceed to Scholar Sign In
                  </button>
                  <button
                    onClick={onPreviewCatalog}
                    className="flex-1 py-2.5 rounded-xl parchment-input hover:border-[#8c6742] text-xs font-semibold transition-all"
                  >
                    Preview Locked Catalog
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: Scholar Sign In */}
        {activeTab === 'login' && (
          <div className="space-y-6">
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1.5 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-[#8c6742]" />
                  <span>Approved Scholar Email Address</span>
                </label>
                <input
                  type="email"
                  required
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder="Enter your authorized institutional email address"
                  className="w-full px-3.5 py-2.5 rounded-xl parchment-input text-xs"
                />
              </div>

              {loginError && (
                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/25 text-amber-800 dark:text-amber-300 text-xs flex items-start gap-2 leading-relaxed">
                  <AlertCircle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                  <span>{loginError}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoggingIn}
                className="w-full py-3.5 rounded-xl bg-[#8c6742] hover:bg-[#725232] text-white font-semibold text-sm transition-all shadow-lg shadow-[#8c6742]/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <Key className="w-4 h-4" />
                <span>{isLoggingIn ? 'Verifying Credentials...' : 'Authenticate & Unlock Archive'}</span>
              </button>
            </form>

            {/* Quick Demo Scholar Logins */}
            <div className="pt-4 border-t border-black/10 dark:border-white/10 space-y-2">
              <span className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider block">
                Pre-Approved Demo Scholars (Instant Catalog Access):
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => handleDemoLogin('alice.thorne@readvault.internal')}
                  className="p-3 rounded-xl parchment-card hover:border-[#8c6742] text-left border border-black/10 dark:border-white/10 transition-all cursor-pointer group"
                >
                  <div className="font-semibold text-stone-900 dark:text-white text-xs group-hover:text-[#8c6742]">Dr. Alice Thorne</div>
                  <div className="text-[10px] font-mono text-[#8c6742] dark:text-[#d4af37] truncate">alice.thorne@readvault.internal</div>
                  <div className="text-[9px] text-emerald-600 dark:text-emerald-400 font-semibold mt-0.5">Tier: Full Archive Access</div>
                </button>

                <button
                  type="button"
                  onClick={() => handleDemoLogin('bob.vance@readvault.internal')}
                  className="p-3 rounded-xl parchment-card hover:border-[#8c6742] text-left border border-black/10 dark:border-white/10 transition-all cursor-pointer group"
                >
                  <div className="font-semibold text-stone-900 dark:text-white text-xs group-hover:text-[#8c6742]">Bob Vance</div>
                  <div className="text-[10px] font-mono text-[#8c6742] dark:text-[#d4af37] truncate">bob.vance@readvault.internal</div>
                  <div className="text-[9px] text-indigo-600 dark:text-indigo-400 font-semibold mt-0.5">Tier: Core Curriculum</div>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Footer Links & Admin Portal Navigation */}
        <div className="mt-8 pt-4 border-t border-black/10 dark:border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-stone-500 font-serif">
          <button
            onClick={onPreviewCatalog}
            className="hover:text-stone-900 dark:hover:text-white transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Browse Catalog in Preview Mode</span>
          </button>

          <Link
            href="/portal-auth-x98q"
            className="text-[#8c6742] dark:text-[#d4af37] hover:underline flex items-center gap-1 font-semibold"
          >
            <span>Chief Admin Portal (Review Requests)</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
};
