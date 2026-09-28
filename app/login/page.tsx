'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Lock,
  Mail,
  User,
  Building,
  FileText,
  Send,
  Shield,
  CheckCircle2,
  ArrowRight,
  BookOpen,
  ArrowLeft,
  Sparkles,
  AlertCircle,
  HelpCircle,
  Key
} from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();

  // Tab: 'request' (default for request-only library) | 'login' (for approved scholars)
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
  const [errorMsg, setErrorMsg] = useState('');

  // Sign In Form State
  const [loginEmail, setLoginEmail] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [loginError, setLoginError] = useState('');

  // Submit Access Request (Transmitted to Administrator)
  const handleRequestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !email.trim()) {
      setErrorMsg('Full Name and Email are required.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

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
      } else {
        setErrorMsg(data.error || 'Failed to submit request.');
      }
    } catch (err: any) {
      setErrorMsg('Network error communicating with library server.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Sign In for Approved Scholars
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail.trim()) {
      setLoginError('Please enter your approved email address.');
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
        // Save user session in localStorage and cookie
        localStorage.setItem('readvault_active_user', JSON.stringify(data.user));
        document.cookie = `readvault_user_id=${data.user.userId}; path=/; max-age=2592000`;
        document.cookie = `readvault_user_name=${encodeURIComponent(data.user.name)}; path=/; max-age=2592000`;
        document.cookie = `readvault_user_email=${encodeURIComponent(data.user.email)}; path=/; max-age=2592000`;
        
        router.push('/');
      } else {
        setLoginError(data.error || 'Authentication failed. Please submit an access request.');
      }
    } catch (err) {
      setLoginError('Error connecting to authentication authority.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070b14] text-white flex flex-col justify-between p-4 sm:p-8 font-sans selection:bg-[#8c6742] selection:text-white">
      {/* Top Header */}
      <div className="max-w-4xl mx-auto w-full flex items-center justify-between py-3">
        <Link
          href="/"
          className="flex items-center gap-2 text-xs font-semibold text-gray-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Catalog Preview</span>
        </Link>

        <div className="flex items-center gap-2 text-xs text-amber-400/90 font-mono bg-amber-500/10 border border-amber-500/20 px-3 py-1 rounded-full">
          <Shield className="w-3.5 h-3.5" />
          <span>Restricted Repository: Request-Only Access</span>
        </div>
      </div>

      {/* Main Container */}
      <div className="max-w-xl mx-auto w-full my-auto py-6">
        <div className="glass-panel p-6 sm:p-10 rounded-3xl border border-white/10 shadow-2xl relative overflow-hidden backdrop-blur-xl">
          {/* Decorative ambient glow */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#8c6742]/15 rounded-full blur-3xl pointer-events-none" />

          {/* Library Brand Emblem */}
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#8c6742] to-[#5e432a] border border-[#8c6742]/40 flex items-center justify-center text-white shadow-lg">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                <span>ReadVault Scholarly Archive</span>
              </h1>
              <p className="text-xs text-stone-400">
                Encrypted Academic Repository & Research Library
              </p>
            </div>
          </div>

          {/* Admin Routing Notice Banner */}
          <div className="mb-6 p-3.5 rounded-2xl bg-indigo-500/10 border border-indigo-500/25 flex items-start gap-3 text-xs text-indigo-200">
            <Mail className="w-4 h-4 text-indigo-400 mt-0.5 flex-shrink-0" />
            <div className="leading-relaxed">
              <span className="font-semibold text-white">Direct Administrator Dispatch:</span>
              <br />
              All library access requests are routed directly to the Library Administration and Security Access Committee for manual authorization.
            </div>
          </div>

          {/* Tab Selector */}
          <div className="flex rounded-xl bg-white/5 p-1 mb-6 border border-white/10">
            <button
              onClick={() => {
                setActiveTab('request');
                setRequestSubmittedSuccess(false);
              }}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-2 ${
                activeTab === 'request'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Send className="w-3.5 h-3.5" />
              <span>Request Library Access</span>
            </button>

            <button
              onClick={() => setActiveTab('login')}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-2 ${
                activeTab === 'login'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Key className="w-3.5 h-3.5" />
              <span>Authorized Scholar Sign In</span>
            </button>
          </div>

          {/* VIEW 1: Request Access Form */}
          {activeTab === 'request' && (
            <div>
              {!requestSubmittedSuccess ? (
                <form onSubmit={handleRequestSubmit} className="space-y-4 text-xs">
                  <div>
                    <label className="block text-gray-300 font-medium mb-1.5 flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-indigo-400" />
                      <span>Full Name *</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. Dr. Ronald Thorne"
                      className="w-full px-3.5 py-2.5 rounded-xl glass-input text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-300 font-medium mb-1.5 flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-indigo-400" />
                      <span>Email Address *</span>
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="scholar@university.edu or personal email"
                      className="w-full px-3.5 py-2.5 rounded-xl glass-input text-xs"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-gray-300 font-medium mb-1.5 flex items-center gap-1.5">
                        <Building className="w-3.5 h-3.5 text-indigo-400" />
                        <span>Institution / Organization</span>
                      </label>
                      <input
                        type="text"
                        value={organization}
                        onChange={(e) => setOrganization(e.target.value)}
                        placeholder="e.g. Stanford University / Independent"
                        className="w-full px-3.5 py-2.5 rounded-xl glass-input text-xs"
                      />
                    </div>

                    <div>
                      <label className="block text-gray-300 font-medium mb-1.5">
                        Requested Access Level
                      </label>
                      <select
                        value={desiredTier}
                        onChange={(e) => setDesiredTier(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl glass-input text-xs cursor-pointer"
                      >
                        <option value="scholar" className="bg-[#0f172a]">
                          Scholar Tier (Full Catalog & EPUB/PDF)
                        </option>
                        <option value="standard" className="bg-[#0f172a]">
                          Standard Scholar (Selected Volumes)
                        </option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-gray-300 font-medium mb-1.5 flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-indigo-400" />
                      <span>Statement of Purpose / Academic Need</span>
                    </label>
                    <textarea
                      rows={3}
                      value={purpose}
                      onChange={(e) => setPurpose(e.target.value)}
                      placeholder="Please outline the specific subjects, research questions, or volumes you wish to study in this collection..."
                      className="w-full px-3.5 py-2.5 rounded-xl glass-input text-xs resize-none"
                    />
                  </div>

                  {errorMsg && (
                    <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
                      <span>{errorMsg}</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-all shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    <Send className="w-4 h-4" />
                    <span>{isSubmitting ? 'Dispatching Access Request...' : 'Submit Access Request for Review'}</span>
                  </button>

                  <p className="text-[11px] text-gray-400 text-center font-mono pt-1">
                    Administrative Protocol: <span className="text-emerald-400">Direct Secure Dispatch &bull; Encrypted Queue</span>
                  </p>
                </form>
              ) : (
                /* Success Confirmation View */
                <div className="p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 space-y-4 text-center animate-in fade-in duration-300">
                  <div className="w-12 h-12 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-white">Access Request Dispatched!</h3>
                    <p className="text-xs text-gray-300 mt-1 leading-relaxed">
                      Your application has been registered in the PostgreSQL registry and forwarded to Administration for identity validation:
                    </p>
                    <div className="mt-2 inline-block px-3 py-1 rounded-lg bg-indigo-600/20 border border-indigo-500/30 text-indigo-300 font-mono text-xs font-semibold">
                      Status: Pending Administrative Review
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-black/40 border border-white/10 text-left text-xs font-mono space-y-1">
                    <div className="text-gray-400">Request Identifier: <span className="text-white font-bold">{requestRefId}</span></div>
                    <div className="text-gray-400">Scholar: <span className="text-white">{fullName}</span></div>
                    <div className="text-gray-400">Email: <span className="text-indigo-300">{email}</span></div>
                    <div className="text-gray-400">Status: <span className="text-amber-400">Pending Administrative Review</span></div>
                  </div>

                  <p className="text-xs text-gray-400 leading-relaxed">
                    Once the administrator approves your request in the Admin Console, your account will be activated and you can sign in directly with your email.
                  </p>

                  <button
                    onClick={() => setActiveTab('login')}
                    className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-all shadow"
                  >
                    Proceed to Scholar Sign In Tab
                  </button>
                </div>
              )}
            </div>
          )}

          {/* VIEW 2: Scholar Sign In */}
          {activeTab === 'login' && (
            <div className="space-y-4">
              <form onSubmit={handleLoginSubmit} className="space-y-4 text-xs">
                <div>
                  <label className="block text-gray-300 font-medium mb-1.5 flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Approved Scholar Email Address</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="Enter your authorized institutional scholar email"
                    className="w-full px-3.5 py-2.5 rounded-xl glass-input text-xs"
                  />
                </div>

                {loginError && (
                  <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/25 text-amber-300 text-xs flex items-start gap-2 leading-relaxed">
                    <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                    <span>{loginError}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoggingIn}
                  className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-all shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <Key className="w-4 h-4" />
                  <span>{isLoggingIn ? 'Verifying Authorization...' : 'Authenticate & Enter Library'}</span>
                </button>
              </form>

              {/* Security Policy Notice */}
              <div className="pt-4 border-t border-white/10 text-xs text-stone-400 space-y-1">
                <div className="flex items-center gap-1.5 text-stone-300 font-semibold">
                  <Shield className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Strict Request-Only Policy</span>
                </div>
                <p className="text-[11px] leading-relaxed">
                  Only scholars who have submitted an Access Request and received official approval from the Administrator are authorized to sign in. If you have not yet been approved, please submit an application using the Request Library Access tab.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer Admin Link */}
        <div className="mt-6 flex items-center justify-between text-xs text-gray-500 font-mono px-2">
          <span>ReadVault Academic Security Protocol</span>
          <Link
            href="/portal-auth-x98q"
            className="text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition-colors"
          >
            <span>Chief Admin Portal (Review Requests)</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      <div className="text-center text-xs text-gray-600 font-mono py-2">
        Port 9000 • ReadVault High-Security Core • Access Control & Cryptographic Vault
      </div>
    </div>
  );
}
