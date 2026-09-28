'use client';

import React, { useState, useEffect } from 'react';
import { Navbar } from '../components/Navbar';
import { LibraryGrid } from '../components/LibraryGrid';
import { BookFinder } from '../components/BookFinder';
import { UserProfileDrawer } from '../components/UserProfileDrawer';
import { BookReader } from '../components/BookReader';
import { SettingsModal, TYPOGRAPHY_OPTIONS } from '../components/SettingsModal';
import { UserRequestModal } from '../components/UserRequestModal';
import { CalligraphyLoader } from '../components/CalligraphyLoader';
import { PdfReaderModal } from '../components/PdfReaderModal';
import { INITIAL_BOOKS, INITIAL_USER, INITIAL_USERS_LIST, INITIAL_BOOK_REQUESTS } from '../lib/mock-data';
import { Book, UserProfile, BookRequest, LightThemeId, DarkThemeId } from '../lib/types';
import { getSessionCookie, updateLastReadPosition, clearSessionCookie, setSessionCookie } from '../lib/storage';
import { BookOpen, Shield, Sparkles, Smartphone, Layers, Lock, Feather, Send, Mail, Key, AlertCircle, AlertTriangle, CheckCircle2, X } from 'lucide-react';
import Link from 'next/link';
import { LibraryGateway } from '../components/LibraryGateway';

export default function HomePage() {
  const [user, setUser] = useState<UserProfile>(INITIAL_USER);
  const [availableUsers, setAvailableUsers] = useState<UserProfile[]>(INITIAL_USERS_LIST);
  const [books, setBooks] = useState<Book[]>(INITIAL_BOOKS);
  const [requests, setRequests] = useState<BookRequest[]>(INITIAL_BOOK_REQUESTS);
  const [activeTab, setActiveTab] = useState<'library' | 'finder'>('library');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modals & Panels
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isRequestsOpen, setIsRequestsOpen] = useState(false);
  const [activeReadingBook, setActiveReadingBook] = useState<Book | null>(null);
  const [initialLocation, setInitialLocation] = useState<string>('');
  const [initialFormat, setInitialFormat] = useState<'epub' | 'pdf'>('epub');
  const [isPdfModalOpen, setIsPdfModalOpen] = useState<boolean>(false);
  const [pdfModalBook, setPdfModalBook] = useState<Book>(INITIAL_BOOKS[0]);
  const [toastConfig, setToastConfig] = useState<{ message: string; type: 'success' | 'error' | 'warning' } | null>(null);

  // Appearance & Themes (Default: Light Mode with Vintage Slate & Dark Grey + Calligraphy Font)
  const [themeMode, setThemeMode] = useState<'light' | 'dark'>('light');
  const [selectedLightTheme, setSelectedLightTheme] = useState<LightThemeId>('vintage-slate');
  const [selectedDarkTheme, setSelectedDarkTheme] = useState<DarkThemeId>('archival-obsidian');
  const [selectedFontId, setSelectedFontId] = useState<string>('calligraphy');
  const [isInitialLoading, setIsInitialLoading] = useState<boolean>(true);

  // Request-Only Library Gateway Authorization State
  const [isScholarLoggedIn, setIsScholarLoggedIn] = useState<boolean>(false);
  const [isPreviewMode, setIsPreviewMode] = useState<boolean>(false);

  // Initial loading simulation with Calligraphy writing animation
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsInitialLoading(false);
    }, 700);
    return () => clearTimeout(timer);
  }, []);

  const showToast = (msg: string, type: 'success' | 'error' | 'warning' = 'success') => {
    setToastConfig({ message: msg, type });
    setTimeout(() => setToastConfig(null), 3500);
  };

  // Determine active font class
  const activeFontClass =
    TYPOGRAPHY_OPTIONS.find((f) => f.id === selectedFontId)?.className || 'font-calligraphy';

  // Determine active theme CSS class
  const activeThemeClass =
    themeMode === 'light'
      ? `theme-light-${selectedLightTheme}`
      : `theme-dark-${selectedDarkTheme}`;

  // Restore session from cookie & localStorage preferences on mount
  useEffect(() => {
    const session = getSessionCookie();
    if (session && session.userId && session.role === 'scholar') {
      setIsScholarLoggedIn(true);
      setUser((prev) => ({
        ...prev,
        userId: session.userId || prev.userId,
        name: session.name || prev.name,
        email: session.email || prev.email,
        lastBookReadId: session.lastBookId || prev.lastBookReadId,
        lastReadTitle: session.lastBookTitle || prev.lastReadTitle,
        lastReadLocation: session.lastLocation || prev.lastReadLocation,
        lastReadProgress: session.progressPercentage ?? prev.lastReadProgress,
      }));
    } else {
      setIsScholarLoggedIn(false);
    }

    // Load saved preferences
    const savedFont = localStorage.getItem('user_font_pref');
    if (savedFont) setSelectedFontId(savedFont);

    const savedMode = localStorage.getItem('user_theme_mode');
    if (savedMode === 'dark' || savedMode === 'light') setThemeMode(savedMode);

    const savedLight = localStorage.getItem('user_theme_light') as LightThemeId;
    if (savedLight) setSelectedLightTheme(savedLight);

    const savedDark = localStorage.getItem('user_theme_dark') as DarkThemeId;
    if (savedDark) setSelectedDarkTheme(savedDark);
  }, []);

  // Fetch dynamic books, users, and requests from PostgreSQL database
  useEffect(() => {
    async function loadData() {
      try {
        const [booksRes, usersRes, reqsRes] = await Promise.all([
          fetch('/api/books').then((r) => r.json()),
          fetch('/api/users').then((r) => r.json()),
          fetch('/api/requests').then((r) => r.json()),
        ]);

        if (booksRes.success && Array.isArray(booksRes.books) && booksRes.books.length > 0) {
          setBooks(booksRes.books);
          setPdfModalBook(booksRes.books[0]);
        }
        if (usersRes.success && Array.isArray(usersRes.users) && usersRes.users.length > 0) {
          setAvailableUsers(usersRes.users);
        }
        if (reqsRes.success && Array.isArray(reqsRes.requests)) {
          setRequests(reqsRes.requests);
        }
      } catch (err) {
        console.error('Failed to load database books:', err);
      }
    }
    loadData();
  }, []);

  const handleSelectFont = (fontId: string) => {
    setSelectedFontId(fontId);
    localStorage.setItem('user_font_pref', fontId);
  };

  const handleToggleMode = (mode: 'light' | 'dark') => {
    setThemeMode(mode);
    localStorage.setItem('user_theme_mode', mode);
  };

  const handleSelectLightTheme = (theme: LightThemeId) => {
    setSelectedLightTheme(theme);
    localStorage.setItem('user_theme_light', theme);
  };

  const handleSelectDarkTheme = (theme: DarkThemeId) => {
    setSelectedDarkTheme(theme);
    localStorage.setItem('user_theme_dark', theme);
  };

  // Gateway login handler
  const handleGatewayLoginSuccess = (newUser: UserProfile) => {
    setUser(newUser);
    setIsScholarLoggedIn(true);
    setIsPreviewMode(false);
    showToast(`Welcome back, ${newUser.name}. Archive unlocked.`);
  };

  // Switch user handler
  const handleSwitchUser = (newUser: UserProfile) => {
    setUser(newUser);
    setIsScholarLoggedIn(true);
    setIsPreviewMode(false);
    showToast(`Switched active profile to ${newUser.name}`);
  };

  // Logout handler (locks the archive)
  const handleLogout = () => {
    clearSessionCookie();
    setIsScholarLoggedIn(false);
    setIsPreviewMode(false);
    showToast('Signed out. Archive locked to Gateway.');
    setUser({
      userId: `usr_guest_${Math.floor(Math.random() * 8999 + 1000)}`,
      name: 'Guest Scholar',
      email: 'guest@readvault.internal',
      accessTier: 'standard',
      booksAccessed: [],
    });
  };

  // Open book handler
  const handleOpenBook = (book: Book, resume: boolean, format: 'epub' | 'pdf' = 'epub') => {
    if (!isScholarLoggedIn) {
      showToast('Volume reading is restricted to approved scholars. Please sign in or request access.', 'warning');
      setIsPreviewMode(false);
      return;
    }
    if (resume) {
      const accessed = user.booksAccessed.find((b) => b.bookId === book.id);
      const loc = accessed?.locationCfi || user.lastReadLocation || 'ch-01:p-0';
      setInitialLocation(loc);
    } else {
      setInitialLocation('ch-01:p-0');
    }
    setInitialFormat(format);
    setActiveReadingBook(book);
  };

  // Open standalone PDF Table of Contents reader
  const handleOpenPdfReader = (book: Book) => {
    setPdfModalBook(book);
    setIsPdfModalOpen(true);
  };

  // Resume last read shortcut
  const handleResumeLastRead = () => {
    const book = books.find((b) => b.id === user.lastBookReadId) || books[0];
    if (book) {
      handleOpenBook(book, true);
    }
  };

  // Progress update callback
  const handleProgressUpdate = (
    bookId: string,
    bookTitle: string,
    chapterTitle: string,
    locationCfi: string,
    progressPercentage: number
  ) => {
    const updated = updateLastReadPosition(
      user,
      bookId,
      bookTitle,
      chapterTitle,
      locationCfi,
      progressPercentage
    );
    setUser(updated);
  };

  // Add custom parsed books from batch import
  const handleAddCustomBooks = (newBooks: Book[]) => {
    setBooks((prev) => [...newBooks, ...prev]);
  };

  // User submits a book request with real database checking against D:\Desktop\Archive\Books
  const handleSubmitBookRequest = async (title: string, author: string, notes: string) => {
    try {
      const res = await fetch('/api/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.userId,
          userName: user.name,
          userEmail: user.email,
          title,
          author,
        }),
      });
      const data = await res.json();
      if (data.success && data.request) {
        setRequests((prev) => [data.request, ...prev]);
        showToast(data.message || `Request for "${title}" verified against physical archive.`);
      } else {
        showToast('Request submitted to administrator.');
      }
    } catch (e) {
      showToast('Book request submitted.');
    }
  };

  const pendingRequestsCount = requests.filter(
    (r) => (r.userId === user.userId || r.userEmail === user.email) && r.status === 'pending'
  ).length;

  return (
    <div
      className={`min-h-screen flex flex-col justify-between selection:bg-[#8c6742] selection:text-white transition-colors duration-300 ${activeThemeClass}`}
    >
      {/* Toast Notification */}
      {toastConfig && (
        <div
          role="alert"
          className={`fixed top-6 right-6 z-50 p-4 rounded-2xl text-xs font-semibold shadow-2xl animate-in fade-in slide-in-from-top-3 flex items-center gap-3 border backdrop-blur-md transition-all max-w-md ${
            toastConfig.type === 'error'
              ? 'bg-rose-950/95 text-rose-100 border-rose-500/60 shadow-rose-950/60 ring-1 ring-rose-500/30'
              : toastConfig.type === 'warning'
              ? 'bg-amber-950/95 text-amber-100 border-amber-500/60 shadow-amber-950/60 ring-1 ring-amber-500/30'
              : 'bg-[#8c6742] text-white border-[#b38738] shadow-black/30'
          }`}
        >
          {toastConfig.type === 'error' ? (
            <div className="w-8 h-8 rounded-xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center shrink-0">
              <AlertCircle className="w-4 h-4 text-rose-400" />
            </div>
          ) : toastConfig.type === 'warning' ? (
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
            </div>
          ) : (
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            </div>
          )}
          <div className="flex-1">
            <div className="font-bold uppercase tracking-wider text-[10px] opacity-75">
              {toastConfig.type === 'error' ? 'Notice / Error' : toastConfig.type === 'warning' ? 'Access Restricted' : 'Archive Notice'}
            </div>
            <div className="leading-snug mt-0.5">{toastConfig.message}</div>
          </div>
          <button
            type="button"
            onClick={() => setToastConfig(null)}
            className="text-white/60 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/10"
            aria-label="Close notification"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Top Navbar */}
      <Navbar
        user={user}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onOpenProfile={() => setIsProfileOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenRequests={() => setIsRequestsOpen(true)}
        onOpenPdfReader={() => handleOpenPdfReader(books.find((b) => b.id === user.lastBookReadId) || books[0])}
        activeFontClass={activeFontClass}
        totalBooksCount={books.length}
        pendingRequestsCount={pendingRequestsCount}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 lg:px-8 py-8">
        {isInitialLoading ? (
          <div className="py-24">
            <CalligraphyLoader label="Loading" subtext="Inscribing parchment and reading cache..." />
          </div>
        ) : !isScholarLoggedIn && !isPreviewMode ? (
          /* DEFAULT VIEW: Request-Only Library Gateway */
          <LibraryGateway
            onLoginSuccess={handleGatewayLoginSuccess}
            totalBooksCount={books.length}
            onPreviewCatalog={() => setIsPreviewMode(true)}
            activeFontClass={activeFontClass}
          />
        ) : (
          /* UNLOCKED CATALOG VIEW (For Authorized Scholars or Preview Mode) */
          <>
            {/* Status Header Banner */}
            {!isScholarLoggedIn && isPreviewMode ? (
              <div className="mb-8 p-4 rounded-2xl parchment-card border border-amber-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm animate-in fade-in">
                <div className="flex items-center gap-3 text-xs">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center flex-shrink-0">
                    <Lock className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-stone-900 dark:text-white">Catalog Preview Mode:</span>{' '}
                    <span className="text-stone-600 dark:text-stone-300 font-serif">
                      You are viewing archive metadata. Reading full volumes requires an authorized scholar account.
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => setIsPreviewMode(false)}
                  className="px-4 py-2 rounded-xl bg-[#8c6742] hover:bg-[#725232] text-white text-xs font-semibold shadow transition-all cursor-pointer flex-shrink-0"
                >
                  Return to Access Gateway / Sign In
                </button>
              </div>
            ) : (
              <div className="mb-8 p-4 rounded-2xl parchment-card border border-emerald-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm animate-in fade-in">
                <div className="flex items-center gap-3 text-xs">
                  <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center flex-shrink-0">
                    <Shield className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-stone-900 dark:text-white">Active Authorized Scholar Session:</span>{' '}
                    <span className="text-[#8c6742] dark:text-[#d4af37] font-semibold">{user.name}</span>{' '}
                    <span className="text-stone-500">({user.email})</span> &bull;{' '}
                    <span className="uppercase text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                      Tier: {user.accessTier}
                    </span>
                  </div>
                </div>

                <button
                  onClick={handleLogout}
                  className="px-3.5 py-1.5 rounded-xl parchment-input hover:border-rose-500/50 hover:text-rose-600 text-xs font-semibold transition-all cursor-pointer flex-shrink-0"
                >
                  Lock Archive & Sign Out
                </button>
              </div>
            )}

            {/* View 1: My Library Dashboard */}
            {activeTab === 'library' && (
              <LibraryGrid
                books={books}
                user={user}
                searchQuery={searchQuery}
                onOpenBook={handleOpenBook}
                onNavigateToFinder={() => setActiveTab('finder')}
                activeFontClass={activeFontClass}
              />
            )}

            {/* View 2: Dedicated Find Books Tab */}
            {activeTab === 'finder' && (
              <BookFinder
                books={books}
                user={user}
                onOpenBook={handleOpenBook}
                onAddCustomBooks={handleAddCustomBooks}
                activeFontClass={activeFontClass}
              />
            )}
          </>
        )}

        {/* System Capabilities Section */}
        <section className="mt-16 pt-12 border-t border-black/10 dark:border-white/10 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="parchment-card p-6 rounded-2xl">
            <div className="w-10 h-10 rounded-xl theme-accent-btn flex items-center justify-center mb-4 shadow-sm">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <h3 className={`font-bold text-base ${activeFontClass}`}>
              Anti-Download Protection
            </h3>
            <p className="text-xs opacity-75 font-serif mt-2 leading-relaxed">
              Volumes are AES-256 encrypted at rest. The client streams in-memory decrypted chunks directly into an anti-scraping reader with right-click context menu suppression.
            </p>
          </div>

          <div className="parchment-card p-6 rounded-2xl">
            <div className="w-10 h-10 rounded-xl theme-accent-btn flex items-center justify-center mb-4 shadow-sm">
              <Send className="w-5 h-5 text-white" />
            </div>
            <h3 className={`font-bold text-base ${activeFontClass}`}>
              Book Requests & Fetch Path
            </h3>
            <p className="text-xs opacity-75 font-serif mt-2 leading-relaxed">
              Users can request missing titles. The administrator validates each request against physical server fetch paths and sends automated email notices.
            </p>
          </div>

          <div className="parchment-card p-6 rounded-2xl">
            <div className="w-10 h-10 rounded-xl theme-accent-btn flex items-center justify-center mb-4 shadow-sm">
              <Feather className="w-5 h-5 text-white" />
            </div>
            <h3 className={`font-bold text-base ${activeFontClass}`}>
              6 Custom Themes & Calligraphy
            </h3>
            <p className="text-xs opacity-75 font-serif mt-2 leading-relaxed">
              Choose from 3 dark and 3 light themes (with default Vintage Slate & dark grey ink), font styles, and animated fountain pen loading.
            </p>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="parchment-card border-t border-black/10 dark:border-white/10 mt-12 py-6 px-4 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs opacity-75 font-serif">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 opacity-70" />
            <span>ReadVault Archival Library</span>
            <span>•</span>
            <span>{books.length} Inscribed Volumes</span>
          </div>

          <div className="flex items-center gap-6">
            <button
              onClick={() => setIsRequestsOpen(true)}
              className="hover:underline flex items-center gap-1"
            >
              <Mail className="w-3.5 h-3.5" />
              <span>Request a Volume</span>
            </button>

            <Link
              href="/portal-auth-x98q"
              className="hover:underline flex items-center gap-1"
            >
              <Lock className="w-3 h-3" />
              <span>Admin Gateway</span>
            </Link>
          </div>
        </div>
      </footer>

      {/* User Profile & Reading State Drawer */}
      <UserProfileDrawer
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        user={user}
        availableUsers={availableUsers}
        onSwitchUser={handleSwitchUser}
        onOpenCustomization={() => setIsSettingsOpen(true)}
        onLogout={handleLogout}
        onSelectBook={(bookId) => {
          const target = books.find((b) => b.id === bookId);
          if (target) handleOpenBook(target, true);
        }}
        activeFontClass={activeFontClass}
      />

      {/* User Book Request Modal */}
      <UserRequestModal
        isOpen={isRequestsOpen}
        onClose={() => setIsRequestsOpen(false)}
        user={user}
        requests={requests}
        onSubmitRequest={handleSubmitBookRequest}
        activeFontClass={activeFontClass}
      />

      {/* Settings & Aesthetics Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        selectedFontId={selectedFontId}
        onSelectFont={handleSelectFont}
        themeMode={themeMode}
        onToggleMode={handleToggleMode}
        selectedLightTheme={selectedLightTheme}
        onSelectLightTheme={handleSelectLightTheme}
        selectedDarkTheme={selectedDarkTheme}
        onSelectDarkTheme={handleSelectDarkTheme}
      />

      {/* Active In-Book Reading Modal */}
      {activeReadingBook && (
        <BookReader
          book={activeReadingBook}
          user={user}
          initialLocation={initialLocation}
          initialFormat={initialFormat}
          onClose={() => setActiveReadingBook(null)}
          onProgressUpdate={handleProgressUpdate}
          activeFontClass={activeFontClass}
        />
      )}

      {/* Standalone PDF Reader & Table of Contents Inspector Modal */}
      <PdfReaderModal
        isOpen={isPdfModalOpen}
        onClose={() => setIsPdfModalOpen(false)}
        book={pdfModalBook}
        user={user}
        onProgressUpdate={handleProgressUpdate}
        activeFontClass={activeFontClass}
      />
    </div>
  );
}
