'use client';

import React, { useState } from 'react';
import { BookRequest, UserProfile } from '../lib/types';
import {
  X,
  Send,
  Clock,
  CheckCircle,
  AlertCircle,
  Lock,
  Mail,
  BookOpen,
  Inbox,
  Sparkles,
  Search
} from 'lucide-react';

interface UserRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
  requests: BookRequest[];
  onSubmitRequest: (title: string, author: string, notes: string) => void;
  activeFontClass: string;
}

export const UserRequestModal: React.FC<UserRequestModalProps> = ({
  isOpen,
  onClose,
  user,
  requests,
  onSubmitRequest,
  activeFontClass,
}) => {
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [notes, setNotes] = useState('');
  const [activeTab, setActiveTab] = useState<'form' | 'inbox'>('form');
  const [submitSuccess, setSubmitSuccess] = useState(false);

  if (!isOpen) return null;

  const userRequests = requests.filter((r) => r.userId === user.userId || r.userEmail === user.email);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onSubmitRequest(title.trim(), author.trim() || 'Unknown Author', notes.trim());
    setTitle('');
    setAuthor('');
    setNotes('');
    setSubmitSuccess(true);
    setTimeout(() => {
      setSubmitSuccess(false);
      setActiveTab('inbox');
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="parchment-card rounded-3xl max-w-xl w-full p-6 sm:p-8 relative border shadow-2xl max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-black/10 dark:border-white/10">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 opacity-80" />
            <h2 className={`text-lg font-bold tracking-tight ${activeFontClass}`}>
              Book Request & Archival Dispatch
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 mt-4 parchment-input p-1 rounded-2xl">
          <button
            onClick={() => setActiveTab('form')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'form' ? 'theme-accent-btn shadow-sm' : 'opacity-70 hover:opacity-100'
            }`}
          >
            <Send className="w-3.5 h-3.5" />
            <span>Request New Book</span>
          </button>
          <button
            onClick={() => setActiveTab('inbox')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-bold transition-all relative ${
              activeTab === 'inbox' ? 'theme-accent-btn shadow-sm' : 'opacity-70 hover:opacity-100'
            }`}
          >
            <Inbox className="w-3.5 h-3.5" />
            <span>My Requests & Email Inbox</span>
            {userRequests.length > 0 && (
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-amber-500 text-white font-mono">
                {userRequests.length}
              </span>
            )}
          </button>
        </div>

        {/* Tab 1: Submit Request Form */}
        {activeTab === 'form' && (
          <form onSubmit={handleSubmit} className="mt-5 space-y-4">
            <p className="text-xs opacity-75 font-serif leading-relaxed">
              Cannot find a volume in our library catalog? Submit your request here. The system administrator will verify against our physical storage archive path (<span className="font-mono text-[10px]">D:\Desktop\Archive\Books</span>) and send an automated email update to <strong className="font-mono">{user.email}</strong>.
            </p>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider opacity-80 mb-1">
                Book Title *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder='e.g., "Distributed Systems: Principles and Paradigms"'
                className="w-full p-2.5 rounded-xl text-xs parchment-input focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider opacity-80 mb-1">
                Author
              </label>
              <input
                type="text"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                placeholder='e.g., "Andrew S. Tanenbaum"'
                className="w-full p-2.5 rounded-xl text-xs parchment-input focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider opacity-80 mb-1">
                Reason / Research Notes
              </label>
              <textarea
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Describe your research context or reason for request..."
                className="w-full p-2.5 rounded-xl text-xs parchment-input focus:outline-none resize-none font-serif"
              />
            </div>

            {submitSuccess && (
              <div className="p-3 rounded-xl bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border border-emerald-500/30 text-xs flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                <span>Request dispatched to administrator! Checking repository path...</span>
              </div>
            )}

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                className="theme-accent-btn px-6 py-2.5 rounded-xl text-xs font-semibold shadow transition-all flex items-center gap-2"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Submit Request to Admin</span>
              </button>
            </div>
          </form>
        )}

        {/* Tab 2: My Requests & Email Inbox */}
        {activeTab === 'inbox' && (
          <div className="mt-5 space-y-4">
            <div className="flex items-center justify-between text-xs opacity-70">
              <span>Delivery destination: <strong className="font-mono">{user.email}</strong></span>
              <span>{userRequests.length} Requests on Record</span>
            </div>

            {userRequests.length === 0 ? (
              <div className="py-12 text-center text-xs opacity-60 font-serif">
                You have not submitted any book requests yet.
              </div>
            ) : (
              <div className="space-y-3">
                {userRequests.map((req) => (
                  <div
                    key={req.id}
                    className="p-4 rounded-2xl border border-black/10 dark:border-white/10 bg-black/[0.02] dark:bg-white/[0.02] space-y-2.5"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h4 className={`text-sm font-bold ${activeFontClass}`}>
                          {req.title}
                        </h4>
                        <p className="text-xs font-serif italic opacity-75">{req.author}</p>
                      </div>

                      {/* Status Badge */}
                      {req.status === 'pending' && (
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/25 flex items-center gap-1 font-mono">
                          <Clock className="w-3 h-3" /> Pending Verification
                        </span>
                      )}
                      {req.status === 'approved' && (
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/25 flex items-center gap-1 font-mono">
                          <CheckCircle className="w-3 h-3" /> Approved & Added
                        </span>
                      )}
                      {req.status === 'restricted_access' && (
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] bg-purple-500/15 text-purple-700 dark:text-purple-300 border border-purple-500/25 flex items-center gap-1 font-mono">
                          <Lock className="w-3 h-3" /> Restricted Policy
                        </span>
                      )}
                      {req.status === 'not_found' && (
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] bg-rose-500/15 text-rose-700 dark:text-rose-300 border border-rose-500/25 flex items-center gap-1 font-mono">
                          <AlertCircle className="w-3 h-3" /> Not in Library
                        </span>
                      )}
                    </div>

                    {/* Email Notification Dispatch Message */}
                    {req.adminFeedbackMessage ? (
                      <div className="p-3 rounded-xl bg-white/70 dark:bg-black/40 border border-black/10 dark:border-white/10 text-xs font-serif">
                        <div className="flex items-center gap-1.5 text-[#8c6742] dark:text-[#d4af37] text-[11px] font-sans font-bold mb-1">
                          <Mail className="w-3.5 h-3.5" />
                          <span>Official Email Notification to {req.userEmail}:</span>
                        </div>
                        <p className="leading-relaxed opacity-90">{req.adminFeedbackMessage}</p>
                        {req.evaluatedPath && (
                          <div className="mt-1 text-[10px] font-mono opacity-60 truncate">
                            Archival Path: {req.evaluatedPath}
                          </div>
                        )}
                      </div>
                    ) : (
                      <p className="text-[11px] opacity-60 font-serif italic">
                        Awaiting administrator storage path inspection...
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
