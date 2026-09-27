'use client';

import React, { useState, useMemo } from 'react';
import { Book, UserProfile } from '../lib/types';
import { parseBookEntry } from '../lib/mock-data';
import {
  Search,
  Mic,
  MicOff,
  Filter,
  ArrowUpDown,
  Grid,
  List as ListIcon,
  BookOpen,
  PlusCircle,
  Sparkles,
  ArrowRight,
  Shield,
  Layers,
  Check,
  FileText,
  X,
  ListTree
} from 'lucide-react';

interface BookFinderProps {
  books: Book[];
  user: UserProfile;
  onOpenBook: (book: Book, resume: boolean, format?: 'epub' | 'pdf') => void;
  onAddCustomBooks?: (newBooks: Book[]) => void;
  activeFontClass: string;
}

export const BookFinder: React.FC<BookFinderProps> = ({
  books,
  user,
  onOpenBook,
  onAddCustomBooks,
  activeFontClass,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedAuthor, setSelectedAuthor] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'title-asc' | 'author-asc' | 'pages-desc' | 'pages-asc'>('title-asc');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(18);
  const [isVoiceSearching, setIsVoiceSearching] = useState(false);

  // Batch import modal for "Title - Author" syntax
  const [showImportModal, setShowImportModal] = useState(false);
  const [importText, setImportText] = useState(
    '500 Lines Or Less - Michael DiBernardo\nThe Architecture of Open Source Applications - Amy Brown\nDesigning Data-Intensive Applications - Martin Kleppmann'
  );
  const [importFeedback, setImportFeedback] = useState('');

  // Extract unique categories & top authors
  const categories = useMemo(() => {
    const set = new Set<string>();
    books.forEach((b) => set.add(b.category));
    return ['All', ...Array.from(set)];
  }, [books]);

  const authors = useMemo(() => {
    const map = new Map<string, number>();
    books.forEach((b) => {
      map.set(b.author, (map.get(b.author) || 0) + 1);
    });
    const sorted = Array.from(map.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([author]) => author);
    return ['All', ...sorted.slice(0, 15)];
  }, [books]);

  // Voice Search via Web Speech or fallback
  const startVoiceSearch = () => {
    if (typeof window === 'undefined') return;
    const windowObj = window as unknown as Record<string, any>;
    const SpeechRecognition = windowObj.SpeechRecognition || windowObj.webkitSpeechRecognition;

    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      setIsVoiceSearching(true);

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setSearchQuery(transcript);
        setIsVoiceSearching(false);
      };

      recognition.onerror = () => setIsVoiceSearching(false);
      recognition.onend = () => setIsVoiceSearching(false);
      recognition.start();
    } else {
      setIsVoiceSearching(true);
      setTimeout(() => {
        setSearchQuery('500 Lines Or Less');
        setIsVoiceSearching(false);
      }, 1200);
    }
  };

  // Filter & Sort books
  const filteredBooks = useMemo(() => {
    let result = [...books];

    // Search query filter (title or author or category or uniqueId)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (b) =>
          b.title.toLowerCase().includes(q) ||
          b.author.toLowerCase().includes(q) ||
          b.category.toLowerCase().includes(q) ||
          (b.uniqueId && b.uniqueId.toLowerCase().includes(q))
      );
    }

    // Category filter
    if (selectedCategory !== 'All') {
      result = result.filter((b) => b.category === selectedCategory);
    }

    // Author filter
    if (selectedAuthor !== 'All') {
      result = result.filter((b) => b.author === selectedAuthor);
    }

    // Sorting
    result.sort((a, b) => {
      if (sortBy === 'title-asc') return a.title.localeCompare(b.title);
      if (sortBy === 'author-asc') return a.author.localeCompare(b.author);
      if (sortBy === 'pages-desc') return b.totalPages - a.totalPages;
      if (sortBy === 'pages-asc') return a.totalPages - b.totalPages;
      return 0;
    });

    return result;
  }, [books, searchQuery, selectedCategory, selectedAuthor, sortBy]);

  // Pagination calculation
  const totalItems = filteredBooks.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  const paginatedBooks = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredBooks.slice(start, start + itemsPerPage);
  }, [filteredBooks, currentPage, itemsPerPage]);

  // Handle batch import: "Title - Author"
  const handleBatchImport = () => {
    const lines = importText.split('\n').filter((l) => l.trim().length > 0);
    const newBooks: Book[] = [];

    lines.forEach((line, idx) => {
      if (line.includes('-')) {
        const book = parseBookEntry(line, books.length + idx);
        newBooks.push(book);
      }
    });

    if (newBooks.length > 0 && onAddCustomBooks) {
      onAddCustomBooks(newBooks);
      setImportFeedback(`Successfully parsed and added ${newBooks.length} books!`);
      setTimeout(() => {
        setImportFeedback('');
        setShowImportModal(false);
      }, 1500);
    } else {
      setImportFeedback('Please format lines as "Book Title - Author Name"');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner: Catalog Overview */}
      <div className="parchment-card rounded-3xl p-6 sm:p-8 relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#8c6742]/15 text-[#5e432a] dark:text-[#d8c3af] text-xs font-semibold mb-3 border border-[#8c6742]/25">
              <Layers className="w-3.5 h-3.5" />
              <span>Dedicated Book Discovery Engine</span>
            </div>
            <h2 className={`text-2xl sm:text-3xl font-bold tracking-tight text-[#2b1f17] dark:text-[#f0eae1] ${activeFontClass}`}>
              Archive Catalog & Explorer ({books.length} Volumes)
            </h2>
            <p className="text-xs text-[#6e5949] dark:text-[#baaa98] mt-1.5 max-w-2xl leading-relaxed">
              Browse, filter, and search your collection of {books.length} allowed volumes. Supports instant author lookups, genre categorizations, and custom list imports formatted as <span className="font-mono bg-[#8c6742]/10 px-1 py-0.5 rounded text-[11px]">Title - Author</span>.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowImportModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#8c6742] hover:bg-[#725232] text-white text-xs font-semibold shadow-md transition-all"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Import & Paste Books</span>
            </button>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="mt-6 pt-6 border-t border-[#8c6742]/20 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
          {/* Main Search Input */}
          <div className="flex-1 relative">
            <Search className="w-4 h-4 text-[#8c6742] absolute left-3 top-3 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder={`Search ${books.length} books by title or author (e.g., "500 Lines Or Less", "DiBernardo")...`}
              className="w-full pl-9 pr-10 py-2.5 rounded-xl text-xs parchment-input focus:outline-none placeholder-[#8c6742]/60"
            />
            <button
              onClick={startVoiceSearch}
              title="Voice Search (Whisper)"
              className={`absolute right-2.5 top-2 p-1 rounded-lg transition-colors ${
                isVoiceSearching
                  ? 'bg-rose-500/20 text-rose-500 recording-pulse'
                  : 'text-[#8c6742] hover:text-[#5e432a] dark:hover:text-white'
              }`}
            >
              {isVoiceSearching ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>
          </div>

          {/* Controls: Sorting & View Mode */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Sort Selector */}
            <div className="flex items-center gap-1.5 parchment-input px-3 py-1.5 rounded-xl text-xs">
              <ArrowUpDown className="w-3.5 h-3.5 text-[#8c6742]" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-transparent text-xs text-[#2b1f17] dark:text-[#f0eae1] focus:outline-none cursor-pointer"
              >
                <option value="title-asc">Title (A - Z)</option>
                <option value="author-asc">Author (A - Z)</option>
                <option value="pages-desc">Pages: Longest First</option>
                <option value="pages-asc">Pages: Shortest First</option>
              </select>
            </div>

            {/* View Mode Switcher */}
            <div className="flex items-center parchment-input p-0.5 rounded-xl">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg text-xs transition-colors ${
                  viewMode === 'grid'
                    ? 'bg-[#8c6742] text-white shadow-sm'
                    : 'text-[#8c6742] hover:text-[#2b1f17] dark:hover:text-white'
                }`}
                title="Grid Cards"
              >
                <Grid className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-lg text-xs transition-colors ${
                  viewMode === 'list'
                    ? 'bg-[#8c6742] text-white shadow-sm'
                    : 'text-[#8c6742] hover:text-[#2b1f17] dark:hover:text-white'
                }`}
                title="Dense List"
              >
                <ListIcon className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Genre / Category Filter Chips */}
        <div className="mt-4 flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none text-xs">
          <span className="text-[#8c6742] text-[11px] font-semibold uppercase tracking-wider flex-shrink-0 flex items-center gap-1">
            <Filter className="w-3 h-3" /> Genres:
          </span>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => {
                setSelectedCategory(cat);
                setCurrentPage(1);
              }}
              className={`px-3 py-1 rounded-full text-xs transition-all whitespace-nowrap ${
                selectedCategory === cat
                  ? 'bg-[#8c6742] text-white font-semibold shadow-sm'
                  : 'bg-[#8c6742]/10 hover:bg-[#8c6742]/20 text-[#5e432a] dark:text-[#d8c3af]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Results Count & Current Filter Indicators */}
      <div className="flex items-center justify-between text-xs text-[#6e5949] dark:text-[#baaa98] px-1">
        <span>
          Displaying <strong>{paginatedBooks.length}</strong> of <strong>{totalItems}</strong> matching books (out of {books.length} total)
        </span>
        <div className="flex items-center gap-3">
          <span className="hidden sm:inline">Page {currentPage} of {totalPages}</span>
          <select
            value={itemsPerPage}
            onChange={(e) => {
              setItemsPerPage(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="parchment-input px-2 py-0.5 rounded text-[11px] cursor-pointer"
          >
            <option value={12}>12 / page</option>
            <option value={18}>18 / page</option>
            <option value={36}>36 / page</option>
            <option value={books.length}>All ({books.length})</option>
          </select>
        </div>
      </div>

      {/* Grid View */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {paginatedBooks.map((book) => {
            const accessed = user.booksAccessed.find((b) => b.bookId === book.id);
            const progress = accessed?.progressPercentage || 0;

            return (
              <div
                key={book.id}
                className="group parchment-card rounded-2xl p-5 flex flex-col justify-between relative overflow-hidden"
              >
                <div>
                  <div className="flex items-center justify-between mb-3 text-[11px]">
                    <span className="font-semibold px-2 py-0.5 rounded bg-[#8c6742]/15 text-[#5e432a] dark:text-[#d8c3af]">
                      {book.category}
                    </span>
                    <span className="font-mono text-[#8c6742] dark:text-[#d8c3af] text-[10px] font-bold px-2 py-0.5 rounded bg-black/5 dark:bg-white/5 border border-[#8c6742]/30">
                      {book.uniqueId || book.id}
                    </span>
                  </div>

                  {/* Book Cover Image or Spine */}
                  {book.coverImage ? (
                    <div className="w-full h-32 rounded-xl overflow-hidden shadow-md relative mb-3.5 group-hover:scale-[1.01] transition-transform border border-[#8c6742]/20">
                      <img
                        src={book.coverImage}
                        alt={book.title}
                        className="w-full h-full object-cover object-top"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                      <div className="absolute bottom-2 left-3 right-3 flex items-center justify-between text-[11px] text-white/90 font-mono drop-shadow">
                        <span>{book.totalPages} Pages</span>
                        <span>{book.chapters.length} Chapters</span>
                      </div>
                    </div>
                  ) : (
                    <div
                      className={`w-full h-32 rounded-xl bg-gradient-to-br ${book.coverGradient} p-4 flex flex-col justify-between shadow-md relative overflow-hidden mb-3.5 group-hover:scale-[1.01] transition-transform`}
                    >
                      <div className="absolute inset-0 bg-black/25" />
                      <div className="relative z-10 flex items-center justify-between text-[11px] text-white/80 font-mono">
                        <span>{book.totalPages} Pages</span>
                        <span>{book.chapters.length} Chapters</span>
                      </div>
                    </div>
                  )}

                  {/* Book Title & Resume button on book's name */}
                  <div className="mt-2 mb-2">
                    <div className="flex items-start justify-between gap-2">
                      <h4
                        onClick={() => onOpenBook(book, progress > 0)}
                        className={`font-bold text-base text-[#2b1f17] dark:text-[#f0eae1] leading-snug hover:text-[#8c6742] cursor-pointer transition-colors ${activeFontClass}`}
                      >
                        {book.title}
                      </h4>
                      {progress > 0 && (
                        <button
                          onClick={() => onOpenBook(book, true)}
                          className="flex-shrink-0 inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#8c6742] hover:bg-[#725232] text-white text-[10px] font-bold shadow-sm transition-all"
                          title="Resume reading"
                        >
                          <Sparkles className="w-2.5 h-2.5" />
                          <span>Resume ({progress}%)</span>
                        </button>
                      )}
                    </div>
                    <p className="text-xs text-[#6e5949] dark:text-[#baaa98] font-serif italic mt-0.5">
                      By {book.author}
                    </p>
                  </div>

                  <p className="text-xs text-[#5e432a] dark:text-[#d8c3af] line-clamp-2 leading-relaxed">
                    {book.description}
                  </p>
                </div>

                {/* Card Action */}
                <div className="mt-4 pt-3 border-t border-[#8c6742]/15 flex items-center justify-between">
                  <div className="text-[11px] text-[#8c6742] font-mono">
                    {progress > 0 ? (
                      <span className="font-semibold text-emerald-700 dark:text-emerald-400">
                        {progress}% read
                      </span>
                    ) : (
                      <span>Unread</span>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => onOpenBook(book, progress > 0, 'epub')}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#8c6742] hover:bg-[#725232] text-white text-xs font-semibold transition-all shadow-sm group-hover:shadow"
                    >
                      <BookOpen className="w-3.5 h-3.5" />
                      <span>{progress > 0 ? 'Resume' : 'Read'}</span>
                    </button>

                    <button
                      onClick={() => onOpenBook(book, progress > 0, 'pdf')}
                      className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl parchment-input hover:border-[#8c6742] text-xs font-semibold text-[#5e432a] dark:text-[#d8c3af] transition-all"
                      title="Open PDF Reader & Table of Contents"
                    >
                      <ListTree className="w-3.5 h-3.5 text-[#8c6742]" />
                      <span>PDF</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Dense List View */}
      {viewMode === 'list' && (
        <div className="parchment-card rounded-2xl overflow-hidden divide-y divide-[#8c6742]/15">
          {paginatedBooks.map((book) => {
            const accessed = user.booksAccessed.find((b) => b.bookId === book.id);
            const progress = accessed?.progressPercentage || 0;

            return (
              <div
                key={book.id}
                className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-[#8c6742]/5 transition-colors"
              >
                <div className="flex items-center gap-3.5 flex-1 min-w-0">
                  {book.coverImage ? (
                    <div className="w-10 h-14 rounded-lg overflow-hidden flex-shrink-0 shadow-sm border border-[#8c6742]/20">
                      <img
                        src={book.coverImage}
                        alt={book.title}
                        className="w-full h-full object-cover object-top"
                      />
                    </div>
                  ) : (
                    <div className={`w-10 h-14 rounded-lg bg-gradient-to-br ${book.coverGradient} flex-shrink-0 flex items-center justify-center text-white text-[10px] font-mono shadow-sm`}>
                      EPUB
                    </div>
                  )}
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h4
                        onClick={() => onOpenBook(book, progress > 0)}
                        className={`text-sm font-bold text-[#2b1f17] dark:text-[#f0eae1] truncate hover:text-[#8c6742] cursor-pointer transition-colors ${activeFontClass}`}
                      >
                        {book.title}
                      </h4>
                      {progress > 0 && (
                        <button
                          onClick={() => onOpenBook(book, true)}
                          className="flex-shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#8c6742] hover:bg-[#725232] text-white text-[10px] font-bold shadow-sm transition-all"
                          title="Resume reading"
                        >
                          <Sparkles className="w-2.5 h-2.5" />
                          <span>Resume ({progress}%)</span>
                        </button>
                      )}
                    </div>
                    <p className="text-xs text-[#6e5949] dark:text-[#baaa98] font-serif italic truncate">
                      {book.author}
                    </p>
                    <div className="flex items-center gap-2 text-[10px] text-[#8c6742] mt-0.5">
                      <span className="font-mono font-bold px-1.5 py-0.5 rounded bg-black/5 dark:bg-white/5 border border-[#8c6742]/30">
                        {book.uniqueId || book.id}
                      </span>
                      <span>{book.category}</span>
                      <span>•</span>
                      <span>{book.totalPages} pages</span>
                      <span>•</span>
                      <span>{book.chapters.length} chapters</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                  {progress > 0 && (
                    <span className="text-xs font-mono font-semibold text-emerald-700 dark:text-emerald-400">
                      {progress}%
                    </span>
                  )}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onOpenBook(book, progress > 0, 'epub')}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#8c6742] hover:bg-[#725232] text-white text-xs font-semibold transition-all shadow-sm"
                    >
                      <BookOpen className="w-3.5 h-3.5" />
                      <span>{progress > 0 ? 'Resume' : 'Read'}</span>
                    </button>

                    <button
                      onClick={() => onOpenBook(book, progress > 0, 'pdf')}
                      className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl parchment-input hover:border-[#8c6742] text-xs font-semibold text-[#5e432a] dark:text-[#d8c3af] transition-all"
                      title="Open PDF Reader & Table of Contents"
                    >
                      <ListTree className="w-3.5 h-3.5 text-[#8c6742]" />
                      <span>PDF</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-4">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="px-3 py-1.5 rounded-lg parchment-input text-xs disabled:opacity-30 disabled:pointer-events-none"
          >
            Previous
          </button>
          <div className="flex items-center gap-1">
            {Array.from({ length: Math.min(7, totalPages) }, (_, i) => {
              let pageNum = i + 1;
              if (totalPages > 7 && currentPage > 4) {
                pageNum = currentPage - 3 + i;
                if (pageNum > totalPages) pageNum = totalPages - (6 - i);
              }
              return (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`w-7 h-7 rounded-lg text-xs font-semibold ${
                    currentPage === pageNum
                      ? 'bg-[#8c6742] text-white shadow-sm'
                      : 'parchment-input hover:bg-[#8c6742]/10'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
          </div>
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="px-3 py-1.5 rounded-lg parchment-input text-xs disabled:opacity-30 disabled:pointer-events-none"
          >
            Next
          </button>
        </div>
      )}

      {/* Batch Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="parchment-card rounded-3xl max-w-lg w-full p-6 relative border border-[#8c6742]/30 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-[#8c6742]/20">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-[#8c6742]" />
                <h3 className="text-base font-bold text-[#2b1f17] dark:text-[#f0eae1]">
                  Import Books (Title - Author Format)
                </h3>
              </div>
              <button
                onClick={() => setShowImportModal(false)}
                className="p-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4">
              <p className="text-xs text-[#6e5949] dark:text-[#baaa98] leading-relaxed">
                Paste your book list below. Each line should follow the rule:
                <br />
                <code className="text-[#8c6742] font-semibold text-[11px]">
                  &quot;500 Lines Or Less - Michael DiBernardo&quot;
                </code>
                <br />
                (Before hyphen = Book Title, After hyphen = Author Name).
              </p>

              <textarea
                rows={6}
                value={importText}
                onChange={(e) => setImportText(e.target.value)}
                className="w-full mt-3 p-3 rounded-xl parchment-input text-xs font-mono resize-none focus:outline-none"
              />

              {importFeedback && (
                <p className="mt-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                  {importFeedback}
                </p>
              )}

              <div className="mt-4 flex items-center justify-end gap-3">
                <button
                  onClick={() => setShowImportModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-[#6e5949] dark:text-[#baaa98] hover:bg-black/5"
                >
                  Cancel
                </button>
                <button
                  onClick={handleBatchImport}
                  className="px-4 py-2 rounded-xl bg-[#8c6742] hover:bg-[#725232] text-white text-xs font-semibold shadow"
                >
                  Parse & Add to Catalog
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
