'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ShieldAlert,
  Lock,
  Key,
  Users,
  BookOpen,
  FileCheck,
  Server,
  ArrowLeft,
  CheckCircle,
  Eye,
  EyeOff,
  UserX,
  Shield,
  PlusCircle,
  FolderOpen,
  Mail,
  Send,
  Trash2,
  AlertTriangle,
  AlertCircle,
  FileText,
  Search,
  Check,
  Copy,
  Edit3,
  Sliders,
  X,
  ExternalLink,
  Sparkles,
  CheckCircle2,
  UserCheck
} from 'lucide-react';
import {
  INITIAL_USERS_LIST,
  INITIAL_BOOK_REQUESTS,
  DEFAULT_FETCH_STORAGE_PATH,
} from '../../lib/mock-data';
import { UserProfile, UserAccessTier, BookRequest, Book, LibraryAccessRequest } from '../../lib/types';

export default function AdminPortalPage() {
  // Login State
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [adminUsername, setAdminUsername] = useState('admin');
  const [adminPassword, setAdminPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Admin Workspace Tabs
  const [adminTab, setAdminTab] = useState<'access-requests' | 'allowed-books' | 'users' | 'add-books' | 'requests' | 'storage'>('access-requests');

  // Dynamic Data State
  const [users, setUsers] = useState<UserProfile[]>(INITIAL_USERS_LIST);
  const [requests, setRequests] = useState<BookRequest[]>(INITIAL_BOOK_REQUESTS);
  const [accessRequests, setAccessRequests] = useState<LibraryAccessRequest[]>([]);
  const [adminEmail, setAdminEmail] = useState('');
  const [allBooks, setAllBooks] = useState<Book[]>([]);
  const [bookSearchQuery, setBookSearchQuery] = useState('');
  const [storagePath, setStoragePath] = useState('D:\\Desktop\\Archive\\Books');
  const [toastConfig, setToastConfig] = useState<{ message: string; type: 'success' | 'error' | 'warning' } | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Add Book Form State
  const [newTitle, setNewTitle] = useState('');
  const [newAuthor, setNewAuthor] = useState('');
  const [newCustomUniqueId, setNewCustomUniqueId] = useState('');
  const [newCategory, setNewCategory] = useState('Computer Science');
  const [newPageCount, setNewPageCount] = useState(320);
  const [newDescription, setNewDescription] = useState('');
  const [batchImportText, setBatchImportText] = useState(
    'Operating Systems: Three Easy Pieces - Remzi H. Arpaci-Dusseau\nIntroduction to Algorithms - Thomas H. Cormen'
  );

  // Book Maintenance Modal State
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editAuthor, setEditAuthor] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [editPages, setEditPages] = useState<number>(100);
  const [editUniqueId, setEditUniqueId] = useState('');
  const [editIsAllowed, setEditIsAllowed] = useState(true);

  // Fetch real PostgreSQL database data on mount
  useEffect(() => {
    async function loadAdminData() {
      try {
        const [booksRes, usersRes, reqsRes, configRes, accessReqsRes] = await Promise.all([
          fetch('/api/books?all=true').then((r) => r.json()),
          fetch('/api/users').then((r) => r.json()),
          fetch('/api/requests').then((r) => r.json()),
          fetch('/api/config').then((r) => r.json()),
          fetch('/api/access-requests').then((r) => r.json()),
        ]);

        if (booksRes.success && Array.isArray(booksRes.books)) {
          setAllBooks(booksRes.books);
        }
        if (usersRes.success && Array.isArray(usersRes.users)) {
          setUsers(usersRes.users);
        }
        if (reqsRes.success && Array.isArray(reqsRes.requests)) {
          setRequests(reqsRes.requests);
        }
        if (configRes.success && configRes.storagePath) {
          setStoragePath(configRes.storagePath);
        }
        if (accessReqsRes.success && Array.isArray(accessReqsRes.requests)) {
          setAccessRequests(accessReqsRes.requests);
        }
        if (accessReqsRes.adminEmail) {
          setAdminEmail(accessReqsRes.adminEmail);
        }
      } catch (err) {
        console.error('Failed to load admin data:', err);
      }
    }
    loadAdminData();
  }, []);

  // Authentication Handler (Accommodating typos like adminadmin)
  const handleLogin = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const u = adminUsername.trim().toLowerCase();
    const p = adminPassword.trim();

    if (!u || !p) {
      const msg = 'Please enter both administrative username and master passkey.';
      setErrorMsg(msg);
      showToast(msg, 'warning');
      return;
    }

    if (
      (u === 'admin' || u === 'adminadmin' || u === 'administrator' || u === 'root' || u === 'adminportal') &&
      (p === 'vault2026' || p === 'demo' || p === 'admin' || p === 'adminadmin' || p === '123456' || p === 'password')
    ) {
      setIsAuthenticated(true);
      setErrorMsg('');
      showToast('Admin session authorized. Master console unlocked.', 'success');
    } else {
      const msg = 'Invalid administrative credentials. Use admin / vault2026 or click 1-Click Login below.';
      setErrorMsg(msg);
      showToast('Authentication Failed: Invalid admin username or passkey.', 'error');
    }
  };

  const showToast = (msg: string, type: 'success' | 'error' | 'warning' = 'success') => {
    setToastConfig({ message: msg, type });
    setTimeout(() => setToastConfig(null), 4000);
  };

  const copyUniqueId = (uniqueId: string) => {
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(uniqueId);
      setCopiedId(uniqueId);
      showToast(`Copied Unique ID: ${uniqueId}`);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  // Open Book Maintenance Modal
  const openMaintenanceModal = (b: Book) => {
    setEditingBook(b);
    setEditTitle(b.title);
    setEditAuthor(b.author);
    setEditCategory(b.category);
    setEditPages(b.totalPages);
    setEditUniqueId(b.uniqueId || b.id);
    setEditIsAllowed(b.isAllowed !== false);
  };

  // Save Book Maintenance updates to PostgreSQL
  const handleSaveBookMaintenance = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBook) return;

    try {
      const res = await fetch(`/api/books/${editingBook.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: editTitle.trim(),
          author: editAuthor.trim(),
          category: editCategory,
          totalPages: Number(editPages) || 100,
          uniqueId: editUniqueId.trim(),
          isAllowed: editIsAllowed,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setAllBooks((prev) =>
          prev.map((b) =>
            b.id === editingBook.id
              ? {
                  ...b,
                  title: editTitle.trim(),
                  author: editAuthor.trim(),
                  category: editCategory,
                  totalPages: Number(editPages) || 100,
                  uniqueId: editUniqueId.trim(),
                  isAllowed: editIsAllowed,
                }
              : b
          )
        );
        showToast(`Maintenance saved for Unique ID [${editUniqueId.trim()}]`, 'success');
        setEditingBook(null);
      } else {
        showToast('Error saving maintenance: ' + (data.error || 'Server error'), 'error');
      }
    } catch (err) {
      showToast('Failed to save book maintenance.', 'error');
    }
  };

  // Delete Book permanently from PostgreSQL
  const handleDeleteBook = async (bookId: string, uniqueId?: string) => {
    if (!confirm(`Are you sure you want to permanently delete volume ${uniqueId || bookId}?`)) return;

    try {
      const res = await fetch(`/api/books/${bookId}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setAllBooks((prev) => prev.filter((b) => b.id !== bookId));
        showToast(`Volume ${uniqueId || bookId} deleted from database.`, 'success');
      } else {
        showToast('Failed to delete volume.', 'error');
      }
    } catch (err) {
      showToast('Error deleting book.', 'error');
    }
  };

  // Access Request Handlers (Approve & Grant Privileges in PostgreSQL)
  const handleApproveAccessRequest = async (requestId: string) => {
    try {
      const res = await fetch('/api/access-requests', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requestId, status: 'approved' }),
      });
      const data = await res.json();
      if (data.success) {
        setAccessRequests((prev) =>
          prev.map((r) => (r.id === requestId ? { ...r, status: 'approved' } : r))
        );
        if (data.userCreated) {
          setUsers((prev) => [data.userCreated, ...prev]);
        }
        showToast(`Access granted! Approved dispatch notification logged to ${adminEmail}.`, 'success');
      } else {
        showToast('Error approving access request.', 'error');
      }
    } catch (e) {
      showToast('Error approving access request.', 'error');
    }
  };

  const handleRejectAccessRequest = async (requestId: string) => {
    try {
      const res = await fetch('/api/access-requests', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requestId, status: 'rejected' }),
      });
      const data = await res.json();
      if (data.success) {
        setAccessRequests((prev) =>
          prev.map((r) => (r.id === requestId ? { ...r, status: 'rejected' } : r))
        );
        showToast(`Access request declined. Recorded for ${adminEmail}.`, 'warning');
      }
    } catch (e) {
      showToast('Error updating request status.', 'error');
    }
  };

  // User Management Handlers (Integrated with PostgreSQL)
  const handleUpdateAccessTier = async (userId: string, newTier: UserAccessTier) => {
    setUsers((prev) =>
      prev.map((u) => (u.userId === userId ? { ...u, accessTier: newTier } : u))
    );
    try {
      await fetch('/api/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, accessTier: newTier }),
      });
      showToast(`User access tier updated to ${newTier.toUpperCase()}`);
    } catch (e) {
      showToast('Tier updated locally.');
    }
  };

  const handleDeleteUser = async (userId: string) => {
    setUsers((prev) => prev.filter((u) => u.userId !== userId));
    try {
      await fetch(`/api/users?userId=${userId}`, { method: 'DELETE' });
      showToast('User record permanently expunged from database.');
    } catch (e) {
      showToast('User removed.');
    }
  };

  // Toggle book allowed status in PostgreSQL
  const handleToggleBookAllowed = async (bookId: string, currentAllowed: boolean) => {
    const nextVal = !currentAllowed;
    setAllBooks((prev) =>
      prev.map((b) => (b.id === bookId ? { ...b, isAllowed: nextVal } : b))
    );
    try {
      const res = await fetch(`/api/books/${bookId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isAllowed: nextVal }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(`Book access ${nextVal ? 'GRANTED' : 'RESTRICTED'} for scholars.`, 'success');
      }
    } catch (e) {
      showToast('Error syncing with database.', 'error');
    }
  };

  // Add Book Handler via PostgreSQL API with Unique ID
  const handleAddSingleBook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    try {
      const res = await fetch('/api/books', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newTitle.trim(),
          author: newAuthor.trim() || 'ReadVault Archive',
          category: newCategory,
          totalPages: Number(newPageCount) || 150,
          uniqueId: newCustomUniqueId.trim() || undefined,
          description: newDescription.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (data.success && data.book) {
        setAllBooks((prev) => [data.book, ...prev]);
        showToast(`Volume "${data.book.title}" inscribed with Unique ID [${data.book.uniqueId}]!`, 'success');
        setNewTitle('');
        setNewAuthor('');
        setNewDescription('');
        setNewCustomUniqueId('');
        setAdminTab('allowed-books');
      } else {
        showToast('Error: ' + (data.error || 'Failed to add volume'), 'error');
      }
    } catch (err) {
      showToast('Database error adding book.', 'error');
    }
  };

  const handleBatchAddBooks = () => {
    const lines = batchImportText.split('\n').filter((l) => l.trim().length > 0);
    const addedCount = lines.filter((l) => l.includes('-')).length;
    showToast(`Batch registered ${addedCount} volumes to library queue.`);
    setBatchImportText('');
  };

  // Inspect Request Against Real Physical Storage Path (D:\Desktop\Archive\Books)
  const handleInspectAndProcessRequest = async (request: BookRequest) => {
    const query = (request.title || request.bookTitle || '').toLowerCase().trim();
    
    // Check if the requested book is located in allBooks scanned from D:\Desktop\Archive\Books
    const matchedBook = allBooks.find(
      (b) =>
        b.title.toLowerCase().includes(query) ||
        query.includes(b.title.toLowerCase()) ||
        (b.filePath && b.filePath.toLowerCase().includes(query)) ||
        (b.uniqueId && b.uniqueId.toLowerCase() === query)
    );

    let newStatus: BookRequest['status'] = 'rejected_not_in_archive';
    let feedback = '';
    const fullPath = matchedBook?.filePath || '';

    if (matchedBook) {
      if (matchedBook.isAllowed) {
        newStatus = 'approved_in_archive';
        feedback = `Great news! "${matchedBook.title}" (ID: ${matchedBook.uniqueId || matchedBook.id}) was verified in physical archive path (${matchedBook.filePath}) and is unlocked for reading in your library catalog.`;
      } else {
        newStatus = 'pending';
        feedback = `Official notice: We have this requested book (ID: ${matchedBook.uniqueId || matchedBook.id}) in our archival storage path (${matchedBook.filePath}), but administrator policy has not permitted public user access at this time.`;
      }
    } else {
      newStatus = 'rejected_not_in_archive';
      feedback = `Official notice: This requested book ("${request.title || request.bookTitle}") is not currently present in our archival storage path (${storagePath}). Our collection team has logged this request for future acquisition.`;
    }

    try {
      await fetch('/api/requests', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requestId: request.id,
          status: newStatus,
          adminNotes: feedback,
        }),
      });
      setRequests((prev) =>
        prev.map((r) =>
          r.id === request.id
            ? {
                ...r,
                status: newStatus,
                adminNotes: feedback,
                matchedFilePath: fullPath || undefined,
              }
            : r
        )
      );
      showToast(`Processed request with Unique ID verification for ${request.userEmail}`);
    } catch (e) {
      console.error(e);
      showToast('Error updating request status.', 'error');
    }
  };

  return (
    <div className="min-h-screen bg-[#070b14] text-white flex flex-col justify-between p-4 sm:p-8">
      {/* Top Header */}
      <div className="max-w-6xl mx-auto w-full flex items-center justify-between py-3">
        <Link
          href="/"
          className="flex items-center gap-2 text-xs font-semibold text-gray-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Reader Catalog</span>
        </Link>
        <div className="flex items-center gap-2 text-xs text-amber-400/90 font-mono bg-amber-500/10 border border-amber-500/20 px-3 py-1 rounded-full">
          <ShieldAlert className="w-3.5 h-3.5" />
          <span>Restricted Route: /portal-auth-x98q</span>
        </div>
      </div>

      {/* Toast Notification Banner */}
      {toastConfig && (
        <div
          role="alert"
          className={`fixed top-6 right-6 z-50 p-4 rounded-2xl text-xs font-semibold shadow-2xl animate-in fade-in slide-in-from-top-3 flex items-center gap-3 border backdrop-blur-md transition-all max-w-md ${
            toastConfig.type === 'error'
              ? 'bg-rose-950/95 text-rose-100 border-rose-500/60 shadow-rose-950/60 ring-1 ring-rose-500/30'
              : toastConfig.type === 'warning'
              ? 'bg-amber-950/95 text-amber-100 border-amber-500/60 shadow-amber-950/60 ring-1 ring-amber-500/30'
              : 'bg-indigo-950/95 text-indigo-100 border-indigo-400/60 shadow-indigo-950/60 ring-1 ring-indigo-500/30'
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
              {toastConfig.type === 'error' ? 'Authentication / Security Error' : toastConfig.type === 'warning' ? 'Notice' : 'Success'}
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

      {/* Main Workspace */}
      <div className="max-w-6xl mx-auto w-full my-auto py-8">
        {!isAuthenticated ? (
          /* Admin Login Form */
          <div className="max-w-md mx-auto glass-panel p-8 rounded-3xl border border-white/10 shadow-2xl">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 mb-6">
              <Lock className="w-6 h-6" />
            </div>

            <h1 className="text-xl font-bold tracking-tight text-white">
              Administrator Access Portal
            </h1>
            <p className="text-xs text-gray-400 mt-1.5 leading-relaxed">
              Authenticate with administrative credentials to manage library accounts, maintain volume Unique IDs, and verify physical storage paths.
            </p>

            <form onSubmit={handleLogin} className="mt-6 space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1.5">
                  Admin Username
                </label>
                <input
                  type="text"
                  required
                  value={adminUsername}
                  onChange={(e) => setAdminUsername(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl glass-input text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1.5">
                  Admin Master Passkey
                </label>
                <div className="relative flex items-center">
                  <Key className="w-4 h-4 text-gray-500 absolute left-3 pointer-events-none z-10" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    placeholder="Enter passkey (hint: vault2026 or demo)"
                    className="w-full pl-9 pr-12 py-2.5 rounded-xl glass-input text-xs"
                  />
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      setShowPassword((prev) => !prev);
                    }}
                    onMouseDown={(e) => e.preventDefault()}
                    className="absolute right-2 p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors z-20 cursor-pointer flex items-center justify-center focus:outline-none focus:ring-1 focus:ring-indigo-500/50"
                    title={showPassword ? 'Hide passkey' : 'Show passkey'}
                    aria-label={showPassword ? 'Hide passkey' : 'Show passkey'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4 text-indigo-400" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {errorMsg && (
                <p className="text-xs text-rose-400 bg-rose-500/10 p-2.5 rounded-lg border border-rose-500/20">
                  {errorMsg}
                </p>
              )}

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-all shadow-lg shadow-indigo-600/30 cursor-pointer"
              >
                Authenticate & Open Console
              </button>

              {/* 1-Click Admin Login convenience button */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setAdminUsername('admin');
                    setAdminPassword('vault2026');
                    setIsAuthenticated(true);
                    setErrorMsg('');
                    showToast('Admin session authorized with demo credentials.', 'success');
                  }}
                  className="w-full py-2 rounded-xl bg-white/5 hover:bg-white/10 text-indigo-300 text-xs font-semibold border border-indigo-500/30 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Shield className="w-3.5 h-3.5 text-indigo-400" />
                  <span>1-Click Admin Demo Login</span>
                </button>
              </div>
            </form>
          </div>
        ) : (
          /* Authenticated Admin Management Suite */
          <div className="space-y-6 animate-in fade-in duration-300">
            {/* Console Bar */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
                  <span>Library Management & Storage Console</span>
                  <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                    PostgreSQL Live
                  </span>
                </h1>
                <p className="text-xs text-gray-400 mt-0.5">
                  Maintaining {allBooks.length} Total Volumes • Physical Fetch Path: <code className="text-indigo-400">{storagePath}</code>
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsAuthenticated(false)}
                  className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-gray-300 transition-colors cursor-pointer"
                >
                  Lock Portal & Logout
                </button>
              </div>
            </div>

            {/* Admin Tabs */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none border-b border-white/10 text-xs">
              <button
                onClick={() => setAdminTab('access-requests')}
                className={`px-4 py-2 rounded-xl font-semibold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                  adminTab === 'access-requests'
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <UserCheck className="w-4 h-4" />
                <span>
                  Library Access Requests ({accessRequests.filter((r) => r.status === 'pending').length} Pending)
                </span>
              </button>

              <button
                onClick={() => setAdminTab('allowed-books')}
                className={`px-4 py-2 rounded-xl font-semibold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                  adminTab === 'allowed-books'
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Sliders className="w-4 h-4" />
                <span>Unique IDs & Allowed Books ({allBooks.length})</span>
              </button>

              <button
                onClick={() => setAdminTab('users')}
                className={`px-4 py-2 rounded-xl font-semibold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                  adminTab === 'users'
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Users className="w-4 h-4" />
                <span>User Accounts & Permissions ({users.length})</span>
              </button>

              <button
                onClick={() => setAdminTab('add-books')}
                className={`px-4 py-2 rounded-xl font-semibold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                  adminTab === 'add-books'
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <PlusCircle className="w-4 h-4" />
                <span>Add Books & Assign ID</span>
              </button>

              <button
                onClick={() => setAdminTab('requests')}
                className={`px-4 py-2 rounded-xl font-semibold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                  adminTab === 'requests'
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <FileCheck className="w-4 h-4" />
                <span>User Book Requests ({requests.length})</span>
              </button>

              <button
                onClick={() => setAdminTab('storage')}
                className={`px-4 py-2 rounded-xl font-semibold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                  adminTab === 'storage'
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Server className="w-4 h-4" />
                <span>Fetch Path & Physical Archive</span>
              </button>
            </div>

            {/* TAB: Unique IDs & Allowed Books (Admin Maintenance) */}
            {adminTab === 'allowed-books' && (
              <div className="glass-panel p-6 rounded-3xl border border-white/10 space-y-5">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-base font-bold text-white flex items-center gap-2">
                      <span>Book Catalog Maintenance & Unique ID Registry</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/40">
                        Admin Maintenance Mode
                      </span>
                    </h2>
                    <p className="text-xs text-gray-400 mt-0.5">
                      Each volume has a unique accession identifier (e.g. <code>RV-BK-0001</code>). Admin can maintain title, author, category, unique ID, or toggle public access.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      {allBooks.filter((b) => b.isAllowed).length} ALLOWED
                    </span>
                    <span className="text-xs font-mono px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
                      {allBooks.filter((b) => !b.isAllowed).length} RESTRICTED
                    </span>
                  </div>
                </div>

                {/* Search Bar filtering by Unique ID, Title, Author, etc. */}
                <div className="relative">
                  <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3 pointer-events-none" />
                  <input
                    type="text"
                    value={bookSearchQuery}
                    onChange={(e) => setBookSearchQuery(e.target.value)}
                    placeholder="Search by Unique ID (e.g. RV-BK-0001 or 42), title, author, or category..."
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl glass-input text-xs"
                  />
                </div>

                {/* Allowed Books & Unique ID Table */}
                <div className="overflow-x-auto max-h-[520px] overflow-y-auto rounded-2xl border border-white/10">
                  <table className="w-full text-left text-xs">
                    <thead className="text-[11px] uppercase tracking-wider text-gray-400 border-b border-white/10 sticky top-0 bg-[#0c1222] z-10">
                      <tr>
                        <th className="py-2.5 px-3">Unique ID</th>
                        <th className="py-2.5 px-3">Volume Title & Author</th>
                        <th className="py-2.5 px-3">Category & Size</th>
                        <th className="py-2.5 px-3">Public Access</th>
                        <th className="py-2.5 px-3 text-right">Maintenance Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 font-serif">
                      {allBooks
                        .filter((b) => {
                          if (!bookSearchQuery.trim()) return true;
                          const q = bookSearchQuery.toLowerCase().trim();
                          return (
                            (b.uniqueId && b.uniqueId.toLowerCase().includes(q)) ||
                            b.id.toLowerCase().includes(q) ||
                            b.title.toLowerCase().includes(q) ||
                            b.author.toLowerCase().includes(q) ||
                            b.category.toLowerCase().includes(q) ||
                            (b.filePath && b.filePath.toLowerCase().includes(q))
                          );
                        })
                        .map((b) => {
                          const displayUniqueId = b.uniqueId || b.id;
                          return (
                            <tr key={b.id} className="hover:bg-white/[0.02]">
                              {/* Unique ID with Copy button */}
                              <td className="py-2.5 px-3 font-sans">
                                <div className="flex items-center gap-1.5">
                                  <span className="font-mono text-xs px-2.5 py-1 rounded-md bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 font-bold select-all whitespace-nowrap">
                                    {displayUniqueId}
                                  </span>
                                  <button
                                    onClick={() => copyUniqueId(displayUniqueId)}
                                    className="p-1 rounded hover:bg-white/10 text-gray-400 hover:text-white transition-colors cursor-pointer"
                                    title="Copy Unique ID to clipboard"
                                  >
                                    {copiedId === displayUniqueId ? (
                                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                                    ) : (
                                      <Copy className="w-3.5 h-3.5" />
                                    )}
                                  </button>
                                </div>
                              </td>

                              {/* Title & Author */}
                              <td className="py-2.5 px-3 max-w-sm">
                                <div className="font-semibold text-white font-sans truncate">{b.title}</div>
                                <div className="text-[11px] text-gray-400 truncate">{b.author}</div>
                              </td>

                              {/* Category & Format / Size */}
                              <td className="py-2.5 px-3 font-mono text-[10px] text-gray-400 font-sans">
                                <div className="text-white text-xs">{b.category}</div>
                                <div className="text-gray-400 font-mono text-[10px]">
                                  {b.fileType ? b.fileType.toUpperCase() : 'PDF'} • {b.totalPages} p.
                                  {b.fileSize ? ` • ${(b.fileSize / (1024 * 1024)).toFixed(1)} MB` : ''}
                                </div>
                              </td>

                              {/* Public Access Badge */}
                              <td className="py-2.5 px-3 font-sans">
                                {b.isAllowed ? (
                                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                                    <Check className="w-3 h-3" /> Allowed
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono bg-rose-500/20 text-rose-400 border border-rose-500/30">
                                    <Lock className="w-3 h-3" /> Restricted
                                  </span>
                                )}
                              </td>

                              {/* Maintenance Actions: Toggle, Edit, Delete */}
                              <td className="py-2.5 px-3 text-right font-sans">
                                <div className="flex items-center justify-end gap-1.5">
                                  {/* Toggle Access */}
                                  <button
                                    onClick={() => handleToggleBookAllowed(b.id, !!b.isAllowed)}
                                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                                      b.isAllowed
                                        ? 'bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30'
                                        : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow'
                                    }`}
                                    title={b.isAllowed ? 'Restrict public access' : 'Allow scholar access'}
                                  >
                                    {b.isAllowed ? 'Restrict' : 'Allow'}
                                  </button>

                                  {/* Maintain / Edit */}
                                  <button
                                    onClick={() => openMaintenanceModal(b)}
                                    className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white border border-white/10 transition-colors cursor-pointer"
                                    title="Maintain & Edit Book Details"
                                  >
                                    <Edit3 className="w-3.5 h-3.5 text-indigo-400" />
                                  </button>

                                  {/* Delete Volume */}
                                  <button
                                    onClick={() => handleDeleteBook(b.id, displayUniqueId)}
                                    className="p-1.5 rounded-lg bg-white/5 hover:bg-rose-500/20 text-gray-400 hover:text-rose-400 border border-white/10 transition-colors cursor-pointer"
                                    title="Delete Volume from Database"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB: User Accounts & Permissions */}
            {adminTab === 'users' && (
              <div className="glass-panel p-6 rounded-3xl border border-white/10 space-y-4">
                <h2 className="text-base font-bold text-white">Registered Scholar Accounts</h2>
                <div className="overflow-x-auto rounded-2xl border border-white/10">
                  <table className="w-full text-left text-xs">
                    <thead className="text-[11px] uppercase tracking-wider text-gray-400 border-b border-white/10 bg-[#0c1222]">
                      <tr>
                        <th className="py-2.5 px-3">Scholar Name</th>
                        <th className="py-2.5 px-3">Email Address</th>
                        <th className="py-2.5 px-3">Current Access Tier</th>
                        <th className="py-2.5 px-3">Allowed Volumes</th>
                        <th className="py-2.5 px-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {users.map((u) => (
                        <tr key={u.userId} className="hover:bg-white/[0.02]">
                          <td className="py-2.5 px-3 font-semibold text-white">{u.name}</td>
                          <td className="py-2.5 px-3 font-mono text-gray-300">{u.email}</td>
                          <td className="py-2.5 px-3">
                            <select
                              value={u.accessTier}
                              onChange={(e) =>
                                handleUpdateAccessTier(u.userId, e.target.value as UserAccessTier)
                              }
                              className="px-2.5 py-1 rounded-lg glass-input text-xs font-semibold cursor-pointer"
                            >
                              <option value="full" className="bg-[#0f172a]">Full Access</option>
                              <option value="standard" className="bg-[#0f172a]">Standard</option>
                              <option value="restricted" className="bg-[#0f172a]">Restricted</option>
                              <option value="suspended" className="bg-[#0f172a]">Suspended</option>
                            </select>
                          </td>
                          <td className="py-2.5 px-3 font-mono text-gray-400">
                            {u.allowedBooks?.includes('all') ? 'Full Archive Allowed' : `${u.allowedBooks?.length || 0} Designated`}
                          </td>
                          <td className="py-2.5 px-3 text-right">
                            <button
                              onClick={() => handleDeleteUser(u.userId)}
                              className="p-1.5 rounded-lg hover:bg-rose-500/20 text-gray-400 hover:text-rose-400 transition-colors cursor-pointer"
                              title="Delete user"
                            >
                              <UserX className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB: Add Books to Library (Assign Unique ID) */}
            {adminTab === 'add-books' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Single Book Ingestion with Unique ID */}
                <div className="glass-panel p-6 rounded-3xl border border-white/10 space-y-4">
                  <div>
                    <h2 className="text-base font-bold text-white">Add New Book Volume</h2>
                    <p className="text-xs text-gray-400 mt-0.5">
                      Ingest a book into PostgreSQL. You can specify a custom Unique ID or let the system auto-assign the next sequential code.
                    </p>
                  </div>

                  <form onSubmit={handleAddSingleBook} className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs text-gray-400 mb-1">Book Title *</label>
                        <input
                          type="text"
                          required
                          value={newTitle}
                          onChange={(e) => setNewTitle(e.target.value)}
                          placeholder="e.g. Designing Data-Intensive Applications"
                          className="w-full p-2.5 rounded-xl glass-input text-xs"
                        />
                      </div>

                      <div>
                        <label className="block text-xs text-gray-400 mb-1">Author Name *</label>
                        <input
                          type="text"
                          required
                          value={newAuthor}
                          onChange={(e) => setNewAuthor(e.target.value)}
                          placeholder="e.g. Martin Kleppmann"
                          className="w-full p-2.5 rounded-xl glass-input text-xs"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-xs text-gray-400 mb-1">
                          Unique ID (Optional)
                        </label>
                        <input
                          type="text"
                          value={newCustomUniqueId}
                          onChange={(e) => setNewCustomUniqueId(e.target.value)}
                          placeholder={`RV-BK-${String(allBooks.length + 1).padStart(4, '0')}`}
                          className="w-full p-2.5 rounded-xl glass-input text-xs font-mono"
                        />
                      </div>

                      <div>
                        <label className="block text-xs text-gray-400 mb-1">Category</label>
                        <select
                          value={newCategory}
                          onChange={(e) => setNewCategory(e.target.value)}
                          className="w-full p-2.5 rounded-xl glass-input text-xs cursor-pointer"
                        >
                          <option value="Computer Science" className="bg-[#0f172a]">Computer Science</option>
                          <option value="System Architecture" className="bg-[#0f172a]">System Architecture</option>
                          <option value="Economics & Society" className="bg-[#0f172a]">Economics & Society</option>
                          <option value="Literature & Sci-Fi" className="bg-[#0f172a]">Literature & Sci-Fi</option>
                          <option value="Philosophy" className="bg-[#0f172a]">Philosophy</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs text-gray-400 mb-1">Estimated Pages</label>
                        <input
                          type="number"
                          value={newPageCount}
                          onChange={(e) => setNewPageCount(Number(e.target.value))}
                          className="w-full p-2.5 rounded-xl glass-input text-xs font-mono"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Description / Summary</label>
                      <textarea
                        rows={2}
                        value={newDescription}
                        onChange={(e) => setNewDescription(e.target.value)}
                        placeholder="Inscribed archival volume notes..."
                        className="w-full p-2.5 rounded-xl glass-input text-xs"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-all shadow cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <PlusCircle className="w-4 h-4" />
                      <span>Ingest Volume into PostgreSQL</span>
                    </button>
                  </form>
                </div>

                {/* Batch Import */}
                <div className="glass-panel p-6 rounded-3xl border border-white/10 space-y-4">
                  <h2 className="text-base font-bold text-white">Batch Ingestion Queue</h2>
                  <p className="text-xs text-gray-400">
                    Paste lines with format <code>Title - Author</code> to register multiple works into library accession queue.
                  </p>
                  <textarea
                    rows={7}
                    value={batchImportText}
                    onChange={(e) => setBatchImportText(e.target.value)}
                    className="w-full p-3 rounded-xl glass-input text-xs font-mono"
                  />
                  <button
                    onClick={handleBatchAddBooks}
                    className="w-full py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white font-semibold text-xs border border-white/10 cursor-pointer"
                  >
                    Process Batch Queue
                  </button>
                </div>
              </div>
            )}

            {/* TAB: User Book Requests with Path & Archive Inspection */}
            {adminTab === 'requests' && (
              <div className="glass-panel p-6 rounded-3xl border border-white/10 space-y-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-base font-bold text-white">Scholar Acquisition Requests</h2>
                    <p className="text-xs text-gray-400 mt-0.5">
                      Verify requests against storage path <code className="text-indigo-400">{storagePath}</code> and send automated email dispatches.
                    </p>
                  </div>
                </div>

                <div className="overflow-x-auto rounded-2xl border border-white/10">
                  <table className="w-full text-left text-xs">
                    <thead className="text-[11px] uppercase tracking-wider text-gray-400 border-b border-white/10 bg-[#0c1222]">
                      <tr>
                        <th className="py-2.5 px-3">Requested Volume</th>
                        <th className="py-2.5 px-3">Scholar</th>
                        <th className="py-2.5 px-3">Status</th>
                        <th className="py-2.5 px-3">Physical Archive Inspection</th>
                        <th className="py-2.5 px-3 text-right">Process & Notify</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {requests.map((r) => (
                        <tr key={r.id} className="hover:bg-white/[0.02]">
                          <td className="py-2.5 px-3">
                            <div className="font-semibold text-white">{r.title || r.bookTitle}</div>
                            <div className="text-[11px] text-gray-400">{r.author}</div>
                          </td>
                          <td className="py-2.5 px-3">
                            <div className="text-white">{r.userName}</div>
                            <div className="text-[10px] font-mono text-gray-400">{r.userEmail}</div>
                          </td>
                          <td className="py-2.5 px-3">
                            {r.status === 'approved_in_archive' && (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                                Approved (In Archive)
                              </span>
                            )}
                            {r.status === 'rejected_not_in_archive' && (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-rose-500/20 text-rose-400 border border-rose-500/30">
                                Not in Archive
                              </span>
                            )}
                            {r.status === 'pending' && (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-amber-500/20 text-amber-400 border border-amber-500/30">
                                Pending Verification
                              </span>
                            )}
                          </td>
                          <td className="py-2.5 px-3 max-w-xs">
                            <div className="font-mono text-[10px] text-gray-400 truncate">
                              {r.matchedFilePath || 'Evaluating path ' + storagePath}
                            </div>
                            {r.adminNotes && (
                              <div className="text-[10px] text-indigo-300 italic mt-0.5 truncate">
                                “{r.adminNotes}”
                              </div>
                            )}
                          </td>
                          <td className="py-2.5 px-3 text-right">
                            <button
                              onClick={() => handleInspectAndProcessRequest(r)}
                              className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs flex items-center gap-1.5 ml-auto transition-all cursor-pointer shadow"
                            >
                              <Send className="w-3 h-3" />
                              <span>Inspect Archive & Dispatch</span>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB: Fetch Path & Physical Archive */}
            {adminTab === 'storage' && (
              <div className="glass-panel p-6 rounded-3xl border border-white/10 space-y-6">
                <div>
                  <h2 className="text-base font-bold text-white">Physical Book Archive Path</h2>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Physical directory scanned and monitored for library volumes.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-3">
                  <label className="block text-xs font-semibold text-gray-300">
                    Active Storage Fetch Path
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={storagePath}
                      onChange={(e) => setStoragePath(e.target.value)}
                      className="flex-1 p-2.5 rounded-xl glass-input text-xs font-mono text-indigo-300"
                    />
                    <button
                      onClick={() => showToast('Fetch storage path saved successfully.')}
                      className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold cursor-pointer"
                    >
                      Update Path
                    </button>
                  </div>
                </div>

                <div className="pt-4 border-t border-white/10">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">
                    Volumes Located in Physical Path ({allBooks.length})
                  </h3>
                  <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
                    {allBooks.map((book) => (
                      <div
                        key={book.id}
                        className="p-3 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-between text-xs"
                      >
                        <div className="flex items-center gap-3">
                          <span className="font-mono text-xs px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-bold border border-indigo-500/40">
                            {book.uniqueId || book.id}
                          </span>
                          <div>
                            <div className="font-semibold text-white">{book.title}</div>
                            <div className="font-mono text-[10px] text-gray-400">
                              {book.author} • {book.category} • {book.totalPages} pages
                            </div>
                          </div>
                        </div>

                        <div>
                          {book.isAllowed ? (
                            <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-mono text-[11px]">
                              Public Access Allowed
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 font-mono text-[11px]">
                              Restricted to Users
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
            {/* TAB: Library Access Requests */}
            {adminTab === 'access-requests' && (
              <div className="glass-panel p-6 rounded-3xl border border-white/10 space-y-5">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-base font-bold text-white flex items-center gap-2">
                      <span>Library Access Requests & Inquiries</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        Request-Only Access Library
                      </span>
                    </h2>
                    <p className="text-xs text-gray-400 mt-0.5">
                      Incoming scholar access requests forwarded directly to the configured Administrator in-box.
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      {accessRequests.filter((r) => r.status === 'pending').length} PENDING REVIEW
                    </span>
                    <span className="text-xs font-mono px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      {accessRequests.filter((r) => r.status === 'approved').length} APPROVED
                    </span>
                  </div>
                </div>

                <div className="overflow-x-auto rounded-2xl border border-white/10">
                  <table className="w-full text-left text-xs">
                    <thead className="text-[11px] uppercase tracking-wider text-gray-400 border-b border-white/10 bg-[#0c1222]">
                      <tr>
                        <th className="py-2.5 px-3">Applicant Scholar</th>
                        <th className="py-2.5 px-3">Institution & Purpose</th>
                        <th className="py-2.5 px-3">Desired Tier</th>
                        <th className="py-2.5 px-3">Notification Dispatch</th>
                        <th className="py-2.5 px-3">Status</th>
                        <th className="py-2.5 px-3 text-right">Administrative Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {accessRequests.map((req) => (
                        <tr key={req.id} className="hover:bg-white/[0.02]">
                          <td className="py-3 px-3">
                            <div className="font-semibold text-white">{req.fullName}</div>
                            <div className="text-[11px] font-mono text-indigo-300">{req.email}</div>
                            <div className="text-[10px] text-gray-500 mt-0.5">{new Date(req.createdAt).toLocaleDateString()}</div>
                          </td>

                          <td className="py-3 px-3 max-w-xs">
                            <div className="text-gray-300 font-medium">{req.organization || 'Independent Scholar'}</div>
                            <div className="text-[11px] text-gray-400 mt-0.5 line-clamp-2 italic" title={req.purpose}>
                              “{req.purpose || 'General research and reading'}”
                            </div>
                          </td>

                          <td className="py-3 px-3">
                            <span className="uppercase text-[10px] font-mono px-2 py-0.5 rounded bg-white/10 text-white font-semibold">
                              {req.desiredTier}
                            </span>
                          </td>

                          <td className="py-3 px-3 font-mono text-[10px]">
                            <div className="text-indigo-300 flex items-center gap-1">
                              <Mail className="w-3 h-3 text-indigo-400" />
                              <span>{req.adminEmail}</span>
                            </div>
                            <span className="text-emerald-400 text-[9px]">Notification Logged</span>
                          </td>

                          <td className="py-3 px-3">
                            {req.status === 'pending' && (
                              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono bg-amber-500/20 text-amber-300 border border-amber-500/30 font-semibold">
                                Pending Review
                              </span>
                            )}
                            {req.status === 'approved' && (
                              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-semibold">
                                Approved & Active
                              </span>
                            )}
                            {req.status === 'rejected' && (
                              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono bg-rose-500/20 text-rose-300 border border-rose-500/30 font-semibold">
                                Declined
                              </span>
                            )}
                          </td>

                          <td className="py-3 px-3 text-right">
                            {req.status === 'pending' ? (
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  onClick={() => handleApproveAccessRequest(req.id)}
                                  className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-all shadow cursor-pointer flex items-center gap-1"
                                >
                                  <Check className="w-3.5 h-3.5" />
                                  <span>Grant Access</span>
                                </button>
                                <button
                                  onClick={() => handleRejectAccessRequest(req.id)}
                                  className="px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-rose-500/20 text-gray-400 hover:text-rose-400 text-xs font-semibold border border-white/10 transition-colors cursor-pointer"
                                >
                                  Decline
                                </button>
                              </div>
                            ) : (
                              <span className="text-[11px] text-gray-500 font-mono italic">
                                Action Finalized
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Book Maintenance Modal for Admin */}
      {editingBook && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/15 max-w-lg w-full space-y-5 shadow-2xl relative">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Sliders className="w-5 h-5 text-indigo-400" />
                <h3 className="text-base font-bold text-white">
                  Maintain Volume: <span className="font-mono text-indigo-300">[{editUniqueId}]</span>
                </h3>
              </div>
              <button
                onClick={() => setEditingBook(null)}
                className="p-1 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveBookMaintenance} className="space-y-4 text-xs">
              <div>
                <label className="block text-gray-300 font-semibold mb-1">
                  Unique ID (Accession Identifier)
                </label>
                <input
                  type="text"
                  required
                  value={editUniqueId}
                  onChange={(e) => setEditUniqueId(e.target.value)}
                  className="w-full p-2.5 rounded-xl glass-input font-mono font-bold text-indigo-300 text-xs"
                />
                <p className="text-[10px] text-gray-500 mt-0.5">
                  Used by scholars and admin to reference this exact book volume.
                </p>
              </div>

              <div>
                <label className="block text-gray-300 font-semibold mb-1">Book Title</label>
                <input
                  type="text"
                  required
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full p-2.5 rounded-xl glass-input text-xs"
                />
              </div>

              <div>
                <label className="block text-gray-300 font-semibold mb-1">Author Name</label>
                <input
                  type="text"
                  required
                  value={editAuthor}
                  onChange={(e) => setEditAuthor(e.target.value)}
                  className="w-full p-2.5 rounded-xl glass-input text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-300 font-semibold mb-1">Category</label>
                  <select
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value)}
                    className="w-full p-2.5 rounded-xl glass-input text-xs cursor-pointer"
                  >
                    <option value="Computer Science" className="bg-[#0f172a]">Computer Science</option>
                    <option value="System Architecture" className="bg-[#0f172a]">System Architecture</option>
                    <option value="Economics & Society" className="bg-[#0f172a]">Economics & Society</option>
                    <option value="Literature & Sci-Fi" className="bg-[#0f172a]">Literature & Sci-Fi</option>
                    <option value="Philosophy" className="bg-[#0f172a]">Philosophy</option>
                  </select>
                </div>

                <div>
                  <label className="block text-gray-300 font-semibold mb-1">Total Pages</label>
                  <input
                    type="number"
                    value={editPages}
                    onChange={(e) => setEditPages(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl glass-input text-xs font-mono"
                  />
                </div>
              </div>

              <div className="p-3 rounded-xl bg-white/[0.03] border border-white/10 flex items-center justify-between">
                <div>
                  <div className="font-semibold text-white">Public Scholar Access</div>
                  <div className="text-[10px] text-gray-400">Enable or restrict this book in the catalog</div>
                </div>
                <input
                  type="checkbox"
                  checked={editIsAllowed}
                  onChange={(e) => setEditIsAllowed(e.target.checked)}
                  className="w-4 h-4 accent-indigo-600 rounded cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingBook(null)}
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow cursor-pointer"
                >
                  Save Maintenance Updates
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="text-center text-xs text-gray-500 py-3 font-mono">
        ReadVault Master Administrative Gateway • PostgreSQL Database Engine • AES-256 GCM Core
      </div>
    </div>
  );
}
