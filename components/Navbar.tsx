'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { UserProfile } from '../lib/types';
import {
  BookOpen,
  Search,
  Mic,
  MicOff,
  User,
  Sparkles,
  Clock,
  Compass,
  Feather,
  MailCheck,
  Send,
  FileText,
  Key
} from 'lucide-react';

interface NavbarProps {
  user: UserProfile;
  activeTab: 'library' | 'finder';
  onTabChange: (tab: 'library' | 'finder') => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onOpenProfile: () => void;
  onOpenSettings: () => void;
  onOpenRequests: () => void;
  onOpenPdfReader?: () => void;
  activeFontClass: string;
  totalBooksCount: number;
  pendingRequestsCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  activeTab,
  onTabChange,
  searchQuery,
  onSearchChange,
  onOpenProfile,
  onOpenSettings,
  onOpenRequests,
  onOpenPdfReader,
  activeFontClass,
  totalBooksCount,
  pendingRequestsCount,
}) => {
  const [isListening, setIsListening] = useState(false);

  const startVoiceSearch = () => {
    if (typeof window === 'undefined') return;
    const windowObj = window as unknown as Record<string, any>;
    const SpeechRecognition = windowObj.SpeechRecognition || windowObj.webkitSpeechRecognition;

    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      setIsListening(true);

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        onSearchChange(transcript);
        setIsListening(false);
      };

      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);
      recognition.start();
    } else {
      setIsListening(true);
      setTimeout(() => {
        onSearchChange('500 Lines Or Less');
        setIsListening(false);
      }, 1200);
    }
  };

  return (
    <header className="sticky top-0 z-40 parchment-card border-b px-4 lg:px-8 py-3.5 backdrop-blur-md">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Brand & Main Tabs */}
        <div className="flex items-center justify-between w-full md:w-auto gap-5">
          {/* Logo and Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#8c6742] to-[#b38738] flex items-center justify-center shadow-md">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className={`font-bold text-xl tracking-tight ${activeFontClass}`}>
                  ReadVault
                </span>
                <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded bg-[#8c6742]/15 text-[#5e432a] dark:text-[#d8c3af] border border-[#8c6742]/25">
                  {totalBooksCount} VOLUMES
                </span>
              </div>
              <p className="text-[11px] opacity-70 font-serif italic hidden sm:block">
                Archival Library & In-Memory EPUB Core
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="flex items-center parchment-input p-1 rounded-2xl gap-1">
            <button
              onClick={() => onTabChange('library')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'library'
                  ? 'bg-[#8c6742] text-white shadow-sm'
                  : 'text-[#6e5949] dark:text-[#baaa98] hover:text-[#2b1f17] dark:hover:text-white'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>My Library & Books</span>
            </button>

            <button
              onClick={() => onTabChange('finder')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'finder'
                  ? 'bg-[#8c6742] text-white shadow-sm'
                  : 'text-[#6e5949] dark:text-[#baaa98] hover:text-[#2b1f17] dark:hover:text-white'
              }`}
            >
              <Compass className="w-3.5 h-3.5" />
              <span>Find Books</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                activeTab === 'finder' ? 'bg-white/20 text-white' : 'bg-[#8c6742]/15 text-[#8c6742]'
              }`}>
                {totalBooksCount}
              </span>
            </button>
          </nav>
        </div>

        {/* Global Search Bar with Voice Input (Active in Library View) */}
        {activeTab === 'library' && (
          <div className="w-full md:w-64 lg:w-72 relative">
            <div className="relative flex items-center">
              <Search className="w-3.5 h-3.5 opacity-60 absolute left-3 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Search recent volumes..."
                className="w-full pl-9 pr-10 py-2 rounded-xl text-xs parchment-input focus:outline-none"
              />
              <button
                onClick={startVoiceSearch}
                title="Voice Search"
                className={`absolute right-2 p-1 rounded-lg transition-colors ${
                  isListening
                    ? 'bg-rose-500/20 text-rose-500 recording-pulse'
                    : 'opacity-60 hover:opacity-100'
                }`}
              >
                {isListening ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
        )}

        {/* Action Controls & Settings */}
        <div className="flex items-center justify-end w-full md:w-auto gap-2.5">
          {/* Check PDF Table of Contents Button */}
          {onOpenPdfReader && (
            <button
              onClick={onOpenPdfReader}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl parchment-input hover:border-[#8c6742] text-xs font-semibold text-[#5e432a] dark:text-[#d8c3af] transition-all"
              title="Open PDF Reader to check Table of Contents & find chapters"
            >
              <FileText className="w-3.5 h-3.5 text-[#8c6742]" />
              <span className="hidden sm:inline">PDF Reader & TOC</span>
            </button>
          )}

          {/* Request a Book Button */}
          <button
            onClick={onOpenRequests}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl parchment-input hover:border-black/30 dark:hover:border-white/30 text-xs font-semibold transition-all relative"
            title="Request a Book from Storage Path"
          >
            <Send className="w-3.5 h-3.5 opacity-70" />
            <span className="hidden sm:inline">Request Book</span>
            {pendingRequestsCount > 0 && (
              <span className="w-2 h-2 rounded-full bg-amber-500" />
            )}
          </button>

          {/* Request Access / Login Gateway Button */}
          <Link
            href="/login"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600/15 hover:bg-indigo-600 text-indigo-700 dark:text-indigo-300 hover:text-white border border-indigo-500/30 text-xs font-semibold shadow-sm transition-all"
            title="Request Library Access or Sign In"
          >
            <Key className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Request Access / Login</span>
          </Link>

          {/* User Profile Button (Opens User Drawer with Theme Customization, User Switcher & Logout) */}
          <button
            onClick={onOpenProfile}
            className="flex items-center gap-2.5 p-1 sm:px-3 sm:py-1.5 rounded-xl parchment-input hover:border-[#8c6742] transition-all text-left"
            title="Account, Theme Customization & Switch User"
          >
            <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-[#8c6742] to-[#b38738] flex items-center justify-center text-white font-semibold text-xs shadow-sm">
              {user.name.charAt(0)}
            </div>
            <div className="hidden sm:block">
              <div className="text-xs font-semibold truncate max-w-[110px]">
                {user.name}
              </div>
              <div className="text-[10px] text-[#8c6742] font-mono">{user.userId}</div>
            </div>
          </button>
        </div>
      </div>
    </header>
  );
};
