'use client';

import React from 'react';
import { Book, UserProfile } from '../lib/types';
import { BookOpen, Clock, Shield, Sparkles, ArrowRight, Play, Compass, ListTree, FileText } from 'lucide-react';

interface LibraryGridProps {
  books: Book[];
  user: UserProfile;
  searchQuery: string;
  onOpenBook: (book: Book, resume: boolean, format?: 'epub' | 'pdf') => void;
  onNavigateToFinder: () => void;
  activeFontClass: string;
}

export const LibraryGrid: React.FC<LibraryGridProps> = ({
  books,
  user,
  searchQuery,
  onOpenBook,
  onNavigateToFinder,
  activeFontClass,
}) => {
  const filteredBooks = books.filter(
    (b) =>
      b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (b.uniqueId && b.uniqueId.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const lastReadBook = books.find((b) => b.id === user.lastBookReadId);

  return (
    <div className="space-y-8">
      {/* Hero: Continue Reading Last Left Book */}
      {lastReadBook && !searchQuery && (
        <section className="relative overflow-hidden rounded-3xl parchment-card p-6 sm:p-8 border border-[#8c6742]/25 shadow-xl">
          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 max-w-2xl">
              {lastReadBook.coverImage && (
                <div className="w-28 h-40 rounded-xl overflow-hidden shadow-lg border border-[#8c6742]/30 flex-shrink-0 relative group">
                  <img
                    src={lastReadBook.coverImage}
                    alt={lastReadBook.title}
                    className="w-full h-full object-cover object-top"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />
                </div>
              )}
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#8c6742]/15 text-[#5e432a] dark:text-[#d8c3af] text-xs font-semibold mb-3 border border-[#8c6742]/25">
                  <Sparkles className="w-3.5 h-3.5 text-[#8c6742]" />
                  <span>Jump Back In</span>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <h2
                    onClick={() => onOpenBook(lastReadBook, true)}
                    className={`text-2xl sm:text-3xl font-bold tracking-tight text-[#2b1f17] dark:text-[#f0eae1] leading-snug hover:text-[#8c6742] cursor-pointer transition-colors ${activeFontClass}`}
                  >
                    {lastReadBook.title}
                  </h2>
                  <button
                    onClick={() => onOpenBook(lastReadBook, true)}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#8c6742] hover:bg-[#725232] text-white text-xs font-bold shadow-sm transition-all"
                    title="Resume reading"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Resume ({user.lastReadProgress}%)</span>
                  </button>
                </div>
                <p className="text-xs text-[#6e5949] dark:text-[#baaa98] font-serif italic mt-1">
                  By {lastReadBook.author}
                </p>
                <p className="text-xs text-[#5e432a] dark:text-[#d8c3af] mt-2 line-clamp-2 leading-relaxed">
                  {lastReadBook.description}
                </p>

                <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-[#6e5949] dark:text-[#baaa98]">
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-[#8c6742]" />
                    <span>Left off at: <strong className="text-[#2b1f17] dark:text-[#f0eae1]">{user.lastReadLocation || 'Chapter 1'}</strong></span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    <span>AES-256 Encrypted Core</span>
                  </span>
                </div>

                {/* Progress bar */}
                <div className="mt-4 flex items-center gap-3 max-w-sm">
                  <div className="flex-1 h-2 bg-[#8c6742]/15 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#8c6742] rounded-full"
                      style={{ width: `${user.lastReadProgress || 0}%` }}
                    />
                  </div>
                  <span className="text-xs font-mono font-bold text-[#8c6742]">
                    {user.lastReadProgress || 0}%
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
              <button
                onClick={() => onOpenBook(lastReadBook, true)}
                className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-[#8c6742] hover:bg-[#725232] text-white font-semibold text-xs shadow-md transition-all transform hover:-translate-y-0.5 active:translate-y-0"
              >
                <Play className="w-4 h-4 fill-white" />
                <span>Resume Reading</span>
              </button>
            </div>
          </div>
        </section>
      )}

      {/* Library Catalog Heading with Quick Switch to Full 150 Catalog */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h3 className={`text-xl font-bold tracking-tight text-[#2b1f17] dark:text-[#f0eae1] ${activeFontClass}`}>
            Recently Accessed & Featured Works
          </h3>
          <p className="text-xs text-[#6e5949] dark:text-[#baaa98] mt-1 font-serif">
            Showing quick access volumes. Explore the dedicated catalog.
          </p>
        </div>

        <button
          onClick={onNavigateToFinder}
          className="flex items-center gap-2 px-4 py-2 rounded-xl parchment-input hover:border-[#8c6742] text-xs font-semibold text-[#5e432a] dark:text-[#d8c3af] transition-all"
        >
          <Compass className="w-4 h-4 text-[#8c6742]" />
          <span>Explore Catalog</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Recent Books Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredBooks.slice(0, 9).map((book) => {
          const accessedInfo = user.booksAccessed.find((b) => b.bookId === book.id);
          const progress = accessedInfo?.progressPercentage || 0;

          return (
            <div
              key={book.id}
              className="group parchment-card rounded-2xl p-5 flex flex-col justify-between relative overflow-hidden"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-[#5e432a] dark:text-[#d8c3af] px-2.5 py-0.5 rounded-md bg-[#8c6742]/15 border border-[#8c6742]/20">
                      {book.category}
                    </span>
                    {book.uniqueId && (
                      <span className="text-[10px] font-mono font-bold text-[#8c6742] dark:text-[#d8c3af] px-2 py-0.5 rounded bg-black/5 dark:bg-white/5 border border-[#8c6742]/30">
                        {book.uniqueId}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1 text-[11px] text-[#8c6742] font-mono">
                    <Shield className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                    <span>AES-256</span>
                  </div>
                </div>

                {/* Book Cover Image Thumbnail or Gradient */}
                {book.coverImage ? (
                  <div className="w-full h-36 rounded-xl overflow-hidden shadow-md relative mb-3 group-hover:scale-[1.01] transition-transform border border-[#8c6742]/20">
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
                    className={`w-full h-32 rounded-xl bg-gradient-to-br ${book.coverGradient} p-4 flex flex-col justify-between shadow-md relative overflow-hidden mb-3 group-hover:scale-[1.01] transition-transform`}
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

              {/* Progress & Bottom Actions */}
              <div className="mt-5 pt-4 border-t border-[#8c6742]/15">
                {progress > 0 && (
                  <div className="mb-3">
                    <div className="flex items-center justify-between text-[11px] text-[#6e5949] dark:text-[#baaa98] mb-1 font-mono">
                      <span>Progress</span>
                      <span>{progress}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-[#8c6742]/15 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#8c6742] rounded-full"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onOpenBook(book, progress > 0)}
                    className="flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-xl bg-[#8c6742] hover:bg-[#725232] text-white text-xs font-semibold transition-all shadow-sm"
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>{progress > 0 ? 'Continue Reading' : 'Read Book'}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-white/70" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
