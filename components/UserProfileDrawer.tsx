'use client';

import React from 'react';
import { UserProfile } from '../lib/types';
import {
  X,
  User,
  Mail,
  Hash,
  Clock,
  ChevronRight,
  Award,
  Feather,
  Palette,
  LogOut,
  Users,
  ShieldCheck,
  Check
} from 'lucide-react';

interface UserProfileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
  availableUsers: UserProfile[];
  onSwitchUser: (newUser: UserProfile) => void;
  onOpenCustomization: () => void;
  onLogout: () => void;
  onSelectBook: (bookId: string) => void;
  activeFontClass: string;
}

export const UserProfileDrawer: React.FC<UserProfileDrawerProps> = ({
  isOpen,
  onClose,
  user,
  availableUsers,
  onSwitchUser,
  onOpenCustomization,
  onLogout,
  onSelectBook,
  activeFontClass,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-sm transition-opacity">
      <div className="w-full max-w-md h-full parchment-card p-6 flex flex-col justify-between overflow-y-auto shadow-2xl relative border-l border-[#8c6742]/25 animate-in slide-in-from-right duration-300">
        {/* Top Header */}
        <div>
          <div className="flex items-center justify-between pb-4 border-b border-[#8c6742]/20">
            <div className="flex items-center gap-2">
              <User className="w-5 h-5 text-[#8c6742]" />
              <h2 className={`text-xl font-bold tracking-tight text-[#2b1f17] dark:text-[#f0eae1] ${activeFontClass}`}>
                User Account & Settings
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-[#6e5949] dark:text-[#baaa98] hover:text-[#2b1f17] dark:hover:text-white hover:bg-black/5 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Select User Switcher */}
          <div className="mt-5">
            <label className="text-xs font-semibold uppercase tracking-wider text-[#8c6742] flex items-center gap-1.5 mb-2">
              <Users className="w-3.5 h-3.5" />
              <span>Select Active User Profile</span>
            </label>
            <div className="parchment-input p-2 rounded-2xl space-y-1.5">
              {availableUsers.map((u) => (
                <div
                  key={u.userId}
                  onClick={() => onSwitchUser(u)}
                  className={`p-2 rounded-xl transition-all cursor-pointer flex items-center justify-between gap-2 text-xs ${
                    user.userId === u.userId
                      ? 'bg-[#8c6742]/15 border border-[#8c6742]/30 font-semibold'
                      : 'hover:bg-black/5 dark:hover:bg-white/5 opacity-80'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-[#8c6742] to-[#b38738] text-white flex items-center justify-center text-[10px] font-bold">
                      {u.name.charAt(0)}
                    </div>
                    <div className="truncate">
                      <div className="text-[#2b1f17] dark:text-[#f0eae1] truncate">{u.name}</div>
                      <div className="text-[10px] text-[#8c6742] font-mono">{u.accessTier.toUpperCase()}</div>
                    </div>
                  </div>
                  {user.userId === u.userId && (
                    <Check className="w-4 h-4 text-[#8c6742] flex-shrink-0" />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Current User Card */}
          <div className="mt-5 p-4 rounded-2xl parchment-input relative overflow-hidden">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#8c6742] to-[#b38738] flex items-center justify-center text-white text-lg font-bold shadow-md">
                {user.name.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className={`text-base font-bold text-[#2b1f17] dark:text-[#f0eae1] truncate ${activeFontClass}`}>
                  {user.name}
                </h3>
                <div className="flex items-center gap-1.5 text-xs text-[#6e5949] dark:text-[#baaa98] mt-0.5">
                  <Mail className="w-3 h-3 text-[#8c6742] flex-shrink-0" />
                  <span className="truncate">{user.email}</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-[#8c6742] font-mono mt-0.5">
                  <Hash className="w-3 h-3 text-[#8c6742] flex-shrink-0" />
                  <span>ID: {user.userId}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Customization Option Moved Inside User */}
          <div className="mt-4">
            <button
              onClick={() => {
                onClose();
                onOpenCustomization();
              }}
              className="w-full flex items-center justify-between p-3.5 rounded-2xl parchment-input hover:border-[#8c6742] text-xs font-semibold text-[#2b1f17] dark:text-[#f0eae1] transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-[#8c6742]/15 flex items-center justify-center text-[#8c6742]">
                  <Palette className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <div>Customize Aesthetics & Themes</div>
                  <div className="text-[10px] text-[#6e5949] dark:text-[#baaa98] font-normal">
                    3 Light & 3 Dark themes, Calligraphy fonts
                  </div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-[#8c6742] group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>

          {/* Last Book Read Highlight */}
          <div className="mt-5">
            <h4 className="text-xs font-semibold text-[#8c6742] uppercase tracking-wider mb-2">
              Last Book Read & Position Left Off
            </h4>
            {user.lastBookReadId ? (
              <div className="p-3.5 rounded-xl border border-[#8c6742]/20 bg-[#8c6742]/5 hover:border-[#8c6742]/40 transition-all">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-semibold text-[#8c6742] uppercase">Currently Reading</span>
                    <h5 className={`text-sm font-bold text-[#2b1f17] dark:text-[#f0eae1] mt-0.5 ${activeFontClass}`}>
                      {user.lastReadTitle}
                    </h5>
                  </div>
                  <span className="text-xs font-bold text-[#5e432a] dark:text-[#d8c3af] px-2 py-0.5 rounded-full bg-[#8c6742]/15 border border-[#8c6742]/25 font-mono">
                    {user.lastReadProgress}%
                  </span>
                </div>

                <div className="mt-3 flex items-center justify-between text-xs text-[#6e5949] dark:text-[#baaa98] pt-2.5 border-t border-[#8c6742]/15">
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-[#8c6742]" />
                    <span>Left at: <strong className="text-[#2b1f17] dark:text-[#f0eae1] font-mono">{user.lastReadLocation || 'Beginning'}</strong></span>
                  </div>
                  <button
                    onClick={() => {
                      if (user.lastBookReadId) onSelectBook(user.lastBookReadId);
                      onClose();
                    }}
                    className="text-xs font-semibold text-[#8c6742] hover:text-[#5e432a] dark:hover:text-white flex items-center gap-1"
                  >
                    Resume <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-xs text-[#8c6742]/60 italic font-serif">No reading activity recorded yet.</p>
            )}
          </div>

          {/* Books Accessed History */}
          <div className="mt-5">
            <div className="flex items-center justify-between mb-2.5">
              <h4 className="text-xs font-semibold text-[#8c6742] uppercase tracking-wider">
                Books Accessed ({user.booksAccessed.length})
              </h4>
              <Award className="w-3.5 h-3.5 text-[#8c6742]" />
            </div>

            <div className="space-y-2">
              {user.booksAccessed.map((b) => (
                <div
                  key={b.bookId}
                  onClick={() => {
                    onSelectBook(b.bookId);
                    onClose();
                  }}
                  className="p-2.5 rounded-xl border border-[#8c6742]/15 bg-white/40 dark:bg-black/20 hover:border-[#8c6742]/30 transition-all cursor-pointer group"
                >
                  <div className="flex items-center justify-between">
                    <h6 className={`text-xs font-bold text-[#2b1f17] dark:text-[#f0eae1] group-hover:text-[#8c6742] transition-colors line-clamp-1 ${activeFontClass}`}>
                      {b.title}
                    </h6>
                    <span className="text-[11px] font-mono text-[#8c6742]">{b.progressPercentage}%</span>
                  </div>
                  
                  <div className="w-full h-1 bg-[#8c6742]/15 rounded-full mt-2 overflow-hidden">
                    <div 
                      className="h-full bg-[#8c6742] rounded-full"
                      style={{ width: `${b.progressPercentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Logout Option */}
        <div className="pt-5 border-t border-[#8c6742]/20 space-y-3">
          <button
            onClick={() => {
              onClose();
              onLogout();
            }}
            className="w-full flex items-center justify-center gap-2 p-3 rounded-2xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/20 text-xs font-bold transition-all"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out & Clear Active Session</span>
          </button>

          <p className="text-[10px] text-center text-[#8c6742]/70 font-serif italic">
            ReadVault Archival Core • Encrypted Session Management
          </p>
        </div>
      </div>
    </div>
  );
};
