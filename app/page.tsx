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
import { BookOpen, Shield, Sparkles, Smartphone, Layers, Lock, Feather, Send, Mail } from 'lucide-react';
import Link from 'next/link';

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
  const [toastMessage, setToastMessage] = useState<string>('');

  // Appearance & Themes (Default: Light Mode with Vintage Slate & Dark Grey + Calligraphy Font)
  const [themeMode, setThemeMode] = useState<'light' | 'dark'>('light');
  const [selectedLightTheme, setSelectedLightTheme] = useState<LightThemeId>('vintage-slate');
  const [selectedDarkTheme, setSelectedDarkTheme] = useState<DarkThemeId>('archival-obsidian');
  const [selectedFontId, setSelectedFontId] = useState<string>('calligraphy');
  const [isInitialLoading, setIsInitialLoading] = useState<boolean>(true);

  // Initial loading simulation with Calligraphy writing animation
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsInitialLoading(false);
    }, 700);
    return () => clearTimeout(timer);
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
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
    if (session) {
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

  // Switch user handler
  const handleSwitchUser = (newUser: UserProfile) => {
    setUser(newUser);
    showToast(`Switched active profile to ${newUser.name}`);
  };

  // Logout handler
  const handleLogout = () => {
    clearSessionCookie();
    showToast('Signed out of session. Switched to guest scholar profile.');
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
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 p-3.5 rounded-xl bg-[#8c6742] text-white text-xs font-semibold shadow-2xl animate-in fade-in slide-in-from-top-2 border border-[#b38738]">
          {toastMessage}
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
        ) : (
          <>
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

            {/* View 2: Dedicated Find Books Tab (150 Volumes) */}
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
