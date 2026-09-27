'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Book, BookHighlight, BookNote, UserProfile } from '../lib/types';
import { CalligraphyLoader } from './CalligraphyLoader';
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  FileText,
  Mic,
  MicOff,
  Search,
  Bookmark,
  Sun,
  Moon,
  Coffee,
  Trash2,
  Lock,
  Volume2,
  Sparkles,
  X,
  ListTree,
  Columns,
  ZoomIn,
  ZoomOut,
  Shield,
  Maximize2,
  Minimize2
} from 'lucide-react';

interface BookReaderProps {
  book: Book;
  user: UserProfile;
  initialLocation?: string;
  initialFormat?: 'epub' | 'pdf';
  onClose: () => void;
  onProgressUpdate: (
    bookId: string,
    bookTitle: string,
    chapterTitle: string,
    locationCfi: string,
    progressPercentage: number
  ) => void;
  activeFontClass: string;
}

export const BookReader: React.FC<BookReaderProps> = ({
  book,
  user,
  initialLocation,
  initialFormat = 'epub',
  onClose,
  onProgressUpdate,
  activeFontClass,
}) => {
  // Navigation & Loading State
  const [currentChapterIndex, setCurrentChapterIndex] = useState(0);
  const [currentParagraphIndex, setCurrentParagraphIndex] = useState(0);
  const [readerTheme, setReaderTheme] = useState<'sepia' | 'dark' | 'light'>('sepia');
  const [fontSize, setFontSize] = useState<number>(18);
  const [isLoadingChapter, setIsLoadingChapter] = useState<boolean>(true);

  // PDF & Table of Contents State
  const [readerFormat, setReaderFormat] = useState<'epub' | 'pdf'>(initialFormat);
  const [showTocSidebar, setShowTocSidebar] = useState<boolean>(initialFormat === 'pdf');
  const [tocSearchQuery, setTocSearchQuery] = useState<string>('');
  const [pdfZoom, setPdfZoom] = useState<number>(100);
  const [pdfPage, setPdfPage] = useState<number>(1);

  // Selection & Annotation State
  const [selectedText, setSelectedText] = useState<string>('');
  const [selectedParagraphIdx, setSelectedParagraphIdx] = useState<number | null>(null);
  const [highlights, setHighlights] = useState<BookHighlight[]>([]);
  const [notes, setNotes] = useState<BookNote[]>([]);
  const [newNoteInput, setNewNoteInput] = useState<string>('');
  const [showNotesPanel, setShowNotesPanel] = useState<boolean>(false);
  const [saveIndicator, setSaveIndicator] = useState<boolean>(false);

  // Fullscreen & Scroll Navigation State
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [scrollNotice, setScrollNotice] = useState<string | null>(null);
  const readerContainerRef = useRef<HTMLDivElement>(null);
  const epubScrollRef = useRef<HTMLDivElement>(null);
  const pdfScrollRef = useRef<HTMLDivElement>(null);
  const isScrollNavigating = useRef<boolean>(false);

  // Whisper / Voice State
  const [isRecordingNote, setIsRecordingNote] = useState<boolean>(false);
  const [whisperStatus, setWhisperStatus] = useState<string>('');
  const [searchInBookQuery, setSearchInBookQuery] = useState<string>('');

  const currentChapter = book.chapters[currentChapterIndex] || book.chapters[0];
  const totalChapters = book.chapters.length;

  // Initialize from last read location if provided + simulate chapter decryption
  useEffect(() => {
    setIsLoadingChapter(true);
    const timer = setTimeout(() => {
      setIsLoadingChapter(false);
    }, 600);

    if (initialLocation && initialLocation.includes(':')) {
      const parts = initialLocation.split(':');
      const chId = parts[0];
      const pIdx = parseInt(parts[1]?.replace('p-', '') || '0', 10);
      const foundIdx = book.chapters.findIndex((c) => c.id === chId);
      if (foundIdx >= 0) {
        setCurrentChapterIndex(foundIdx);
        setCurrentParagraphIndex(pIdx);
      }
    }

    // Load stored highlights & notes from localStorage
    const savedHl = localStorage.getItem(`highlights_${book.id}`);
    if (savedHl) {
      try {
        setHighlights(JSON.parse(savedHl));
      } catch (e) {
        console.error(e);
      }
    }
    const savedNotes = localStorage.getItem(`notes_${book.id}`);
    if (savedNotes) {
      try {
        setNotes(JSON.parse(savedNotes));
      } catch (e) {
        console.error(e);
      }
    }

    return () => clearTimeout(timer);
  }, [book.id, initialLocation]);

  // Fullscreen API Synchronization
  useEffect(() => {
    const onFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', onFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', onFullscreenChange);
  }, []);

  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        if (readerContainerRef.current?.requestFullscreen) {
          await readerContainerRef.current.requestFullscreen();
        } else {
          setIsFullscreen(true);
        }
      } else {
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        }
        setIsFullscreen(false);
      }
    } catch (err) {
      console.warn('Fullscreen request failed, toggling CSS fullscreen mode:', err);
      setIsFullscreen((prev) => !prev);
    }
  };

  // Sync reading progress to cookie & database callback
  const syncProgress = (chIdx: number, pIdx: number) => {
    const chapter = book.chapters[chIdx];
    if (!chapter) return;

    // Calculate progress
    const totalParasInBook = book.chapters.reduce((acc, c) => acc + c.paragraphs.length, 0);
    let pastParas = 0;
    for (let i = 0; i < chIdx; i++) {
      pastParas += book.chapters[i].paragraphs.length;
    }
    pastParas += pIdx + 1;
    const progressPct = Math.min(100, Math.round((pastParas / totalParasInBook) * 100));

    const locationCfi = `${chapter.id}:p-${pIdx}`;
    onProgressUpdate(book.id, book.title, chapter.title, locationCfi, progressPct);

    // Show visual confirmation
    setSaveIndicator(true);
    setTimeout(() => setSaveIndicator(false), 2200);
  };

  // Chapter Navigation with smooth transition and scroll-to-top
  const handleNextChapter = () => {
    if (currentChapterIndex < totalChapters - 1) {
      setIsLoadingChapter(true);
      const nextIdx = currentChapterIndex + 1;
      setCurrentChapterIndex(nextIdx);
      setCurrentParagraphIndex(0);
      syncProgress(nextIdx, 0);
      epubScrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
      setScrollNotice(`Advancing to Chapter ${nextIdx + 1}: ${book.chapters[nextIdx]?.title || ''}`);
      setTimeout(() => {
        setIsLoadingChapter(false);
        setScrollNotice(null);
      }, 500);
    }
  };

  const handlePrevChapter = () => {
    if (currentChapterIndex > 0) {
      setIsLoadingChapter(true);
      const prevIdx = currentChapterIndex - 1;
      setCurrentChapterIndex(prevIdx);
      setCurrentParagraphIndex(0);
      syncProgress(prevIdx, 0);
      epubScrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
      setScrollNotice(`Returning to Chapter ${prevIdx + 1}: ${book.chapters[prevIdx]?.title || ''}`);
      setTimeout(() => {
        setIsLoadingChapter(false);
        setScrollNotice(null);
      }, 500);
    }
  };

  // PDF Page Navigation Handlers
  const handlePdfNextPage = () => {
    if (pdfPage < book.totalPages) {
      const newPage = pdfPage + 1;
      setPdfPage(newPage);
      const nextCh = book.chapters.findIndex((c) => (c.pageNumber || 1) > newPage);
      if (nextCh > 0) setCurrentChapterIndex(nextCh - 1);
      pdfScrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
      setScrollNotice(`PDF Page ${newPage} of ${book.totalPages}`);
      setTimeout(() => setScrollNotice(null), 1200);
    }
  };

  const handlePdfPrevPage = () => {
    if (pdfPage > 1) {
      const newPage = pdfPage - 1;
      setPdfPage(newPage);
      const prevCh = book.chapters.findIndex((c) => (c.pageNumber || 1) <= newPage);
      if (prevCh >= 0) setCurrentChapterIndex(prevCh);
      pdfScrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
      setScrollNotice(`PDF Page ${newPage} of ${book.totalPages}`);
      setTimeout(() => setScrollNotice(null), 1200);
    }
  };

  const handleGoNext = () => {
    if (readerFormat === 'pdf') {
      handlePdfNextPage();
    } else {
      handleNextChapter();
    }
  };

  const handleGoPrev = () => {
    if (readerFormat === 'pdf') {
      handlePdfPrevPage();
    } else {
      handlePrevChapter();
    }
  };

  const isPrevDisabled = readerFormat === 'pdf' ? pdfPage <= 1 : currentChapterIndex === 0;
  const isNextDisabled = readerFormat === 'pdf' ? pdfPage >= book.totalPages : currentChapterIndex >= totalChapters - 1;

  // Keyboard Navigation: Arrow Left/Right, PageUp/PageDown, and F for Fullscreen
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === 'ArrowRight' || e.key === 'PageDown') {
        e.preventDefault();
        handleGoNext();
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        e.preventDefault();
        handleGoPrev();
      } else if (e.key === 'f' || e.key === 'F') {
        toggleFullscreen();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [readerFormat, pdfPage, currentChapterIndex, totalChapters]);

  // Scroll to Next Page / Chapter Event Handlers (Works in Fullscreen & Non-Fullscreen)
  const handleEpubWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    if (isScrollNavigating.current || isLoadingChapter) return;
    const target = e.currentTarget;
    const { scrollTop, scrollHeight, clientHeight } = target;

    // Scroll DOWN reached bottom: advance to next chapter
    if (e.deltaY > 20 && scrollHeight - scrollTop - clientHeight <= 25) {
      if (currentChapterIndex < totalChapters - 1) {
        isScrollNavigating.current = true;
        handleNextChapter();
        setTimeout(() => {
          isScrollNavigating.current = false;
        }, 750);
      }
    }
    // Scroll UP at the top: return to previous chapter
    else if (e.deltaY < -20 && scrollTop <= 5) {
      if (currentChapterIndex > 0) {
        isScrollNavigating.current = true;
        handlePrevChapter();
        setTimeout(() => {
          isScrollNavigating.current = false;
        }, 750);
      }
    }
  };

  const handlePdfWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    if (isScrollNavigating.current) return;
    const target = e.currentTarget;
    const { scrollTop, scrollHeight, clientHeight } = target;

    if (e.deltaY > 20 && scrollHeight - scrollTop - clientHeight <= 25) {
      if (pdfPage < book.totalPages) {
        isScrollNavigating.current = true;
        handlePdfNextPage();
        setTimeout(() => {
          isScrollNavigating.current = false;
        }, 600);
      }
    } else if (e.deltaY < -20 && scrollTop <= 10) {
      if (pdfPage > 1) {
        isScrollNavigating.current = true;
        handlePdfPrevPage();
        setTimeout(() => {
          isScrollNavigating.current = false;
        }, 600);
      }
    }
  };

  // Handle Text Selection
  const handleMouseUp = (pIdx: number) => {
    const selection = window.getSelection();
    if (selection && selection.toString().trim().length > 0) {
      setSelectedText(selection.toString().trim());
      setSelectedParagraphIdx(pIdx);
    }
  };

  // Add Highlight
  const addHighlight = (color: 'amber' | 'emerald' | 'rose' | 'sky') => {
    if (!selectedText) return;

    const newHl: BookHighlight = {
      id: `hl-${Date.now()}`,
      bookId: book.id,
      text: selectedText,
      color,
      chapter: currentChapter.id,
      paragraphIndex: selectedParagraphIdx ?? currentParagraphIndex,
      timestamp: new Date().toISOString(),
    };

    const updated = [...highlights, newHl];
    setHighlights(updated);
    localStorage.setItem(`highlights_${book.id}`, JSON.stringify(updated));
    setSelectedText('');
    setSelectedParagraphIdx(null);
    window.getSelection()?.removeAllRanges();
  };

  // Delete Highlight
  const removeHighlight = (id: string) => {
    const updated = highlights.filter((h) => h.id !== id);
    setHighlights(updated);
    localStorage.setItem(`highlights_${book.id}`, JSON.stringify(updated));
  };

  // Add Note
  const saveNote = (audioGen = false) => {
    if (!newNoteInput.trim()) return;

    const newNote: BookNote = {
      id: `note-${Date.now()}`,
      bookId: book.id,
      chapter: currentChapter.title,
      text: newNoteInput.trim(),
      audioGenerated: audioGen,
      timestamp: new Date().toISOString(),
    };

    const updated = [newNote, ...notes];
    setNotes(updated);
    localStorage.setItem(`notes_${book.id}`, JSON.stringify(updated));
    setNewNoteInput('');
  };

  // Delete Note
  const removeNote = (id: string) => {
    const updated = notes.filter((n) => n.id !== id);
    setNotes(updated);
    localStorage.setItem(`notes_${book.id}`, JSON.stringify(updated));
  };

  // Whisper / Web Speech Audio Dictation for Notes
  const startWhisperNoteRecording = async () => {
    if (typeof window === 'undefined') return;
    const windowObj = window as unknown as Record<string, any>;
    const SpeechRecognition = windowObj.SpeechRecognition || windowObj.webkitSpeechRecognition;

    setIsRecordingNote(true);
    setWhisperStatus('Listening via Whisper voice engine...');

    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setNewNoteInput((prev) => (prev ? `${prev} ${transcript}` : transcript));
        setIsRecordingNote(false);
        setWhisperStatus('Transcribed successfully!');
        setTimeout(() => setWhisperStatus(''), 2000);
      };

      recognition.onerror = async () => {
        await fallbackToWhisperApi();
      };

      recognition.onend = () => {
        setIsRecordingNote(false);
      };

      recognition.start();
    } else {
      await fallbackToWhisperApi();
    }
  };

  const fallbackToWhisperApi = async () => {
    try {
      const res = await fetch('/api/whisper', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await res.json();
      if (data.text) {
        setNewNoteInput((prev) => (prev ? `${prev} ${data.text}` : data.text));
        setWhisperStatus('Transcribed via Whisper Engine!');
      }
    } catch (e) {
      console.error(e);
      setWhisperStatus('Voice input unavailable');
    } finally {
      setIsRecordingNote(false);
      setTimeout(() => setWhisperStatus(''), 2500);
    }
  };

  // Search filter
  const isMatchSearch = (text: string) => {
    if (!searchInBookQuery.trim()) return false;
    return text.toLowerCase().includes(searchInBookQuery.toLowerCase());
  };

  return (
    <div
      ref={readerContainerRef}
      onContextMenu={(e) => e.preventDefault()} // Security DRM feature
      className={`fixed inset-0 z-50 flex flex-col ${
        readerTheme === 'sepia'
          ? 'theme-sepia'
          : readerTheme === 'light'
          ? 'theme-light'
          : 'theme-dark'
      } ${isFullscreen ? 'w-screen h-screen' : ''} transition-colors select-text`}
    >
      {/* Reader Top Bar */}
      <header className="flex items-center justify-between px-4 sm:px-6 py-3 border-b border-black/10 dark:border-white/10 parchment-card backdrop-blur-md">
        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
            title="Exit Reader"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h2 className={`text-base font-bold truncate max-w-xs sm:max-w-md ${activeFontClass}`}>
                {book.title}
              </h2>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-600/15 text-emerald-800 dark:text-emerald-400 border border-emerald-600/25 flex items-center gap-1 font-mono">
                <Lock className="w-2.5 h-2.5" /> Encrypted Stream
              </span>
            </div>
            <p className="text-xs opacity-70 font-serif">
              {book.author} • {currentChapter.title}
            </p>
          </div>
        </div>

        {/* Reader Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Format Switcher: EPUB Flow vs PDF Reader */}
          <div className="flex items-center gap-1 bg-black/5 dark:bg-white/5 p-1 rounded-xl text-xs font-semibold">
            <button
              onClick={() => setReaderFormat('epub')}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                readerFormat === 'epub'
                  ? 'bg-[#8c6742] text-white shadow-sm'
                  : 'opacity-60 hover:opacity-100'
              }`}
              title="Continuous EPUB Flow Mode"
            >
              EPUB
            </button>
            <button
              onClick={() => {
                setReaderFormat('pdf');
                setShowTocSidebar(true);
                const p = currentChapter.pageNumber || 1;
                setPdfPage(p);
              }}
              className={`px-2.5 py-1 rounded-lg transition-all flex items-center gap-1 ${
                readerFormat === 'pdf'
                  ? 'bg-[#8c6742] text-white shadow-sm'
                  : 'opacity-60 hover:opacity-100'
              }`}
              title="Page-by-Page PDF Document Mode with TOC"
            >
              <FileText className="w-3 h-3" />
              <span>PDF</span>
            </button>
          </div>

          {/* Table of Contents / Chapter Finder Toggle Button */}
          <button
            onClick={() => setShowTocSidebar(!showTocSidebar)}
            className={`p-2 rounded-xl transition-all relative flex items-center gap-1.5 text-xs font-semibold ${
              showTocSidebar
                ? 'bg-[#8c6742] text-white'
                : 'hover:bg-black/5 dark:hover:bg-white/10 opacity-80'
            }`}
            title="Open Table of Contents to Find Chapters"
          >
            <ListTree className="w-4 h-4" />
            <span className="hidden xl:inline">TOC</span>
          </button>

          {/* Auto-save Pill */}
          {saveIndicator && (
            <div className="hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 text-xs animate-pulse font-mono">
              <Bookmark className="w-3 h-3" />
              <span>Saved</span>
            </div>
          )}

          {/* Search within Book */}
          <div className="relative hidden md:flex items-center">
            <Search className="w-3.5 h-3.5 absolute left-2.5 text-gray-500" />
            <input
              type="text"
              value={searchInBookQuery}
              onChange={(e) => setSearchInBookQuery(e.target.value)}
              placeholder="Search in volume..."
              className="text-xs pl-8 pr-3 py-1.5 rounded-lg border border-black/10 dark:border-white/10 bg-transparent focus:outline-none focus:ring-1 focus:ring-[#8c6742] w-32 lg:w-44"
            />
          </div>

          {/* PDF Zoom Controls or Font Resizing */}
          {readerFormat === 'pdf' ? (
            <div className="hidden lg:flex items-center gap-1 bg-black/5 dark:bg-white/5 p-1 rounded-lg text-xs font-mono">
              <button
                onClick={() => setPdfZoom(Math.max(60, pdfZoom - 15))}
                className="p-1 hover:bg-black/5 dark:hover:bg-white/10 rounded"
                title="Zoom Out"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <span className="px-1 text-xs">{pdfZoom}%</span>
              <button
                onClick={() => setPdfZoom(Math.min(150, pdfZoom + 15))}
                className="p-1 hover:bg-black/5 dark:hover:bg-white/10 rounded"
                title="Zoom In"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-1 bg-black/5 dark:bg-white/5 p-1 rounded-lg">
              <button
                onClick={() => setFontSize(Math.max(14, fontSize - 2))}
                className="px-2 py-0.5 text-xs font-semibold hover:bg-black/5 dark:hover:bg-white/10 rounded"
                title="Decrease Font Size"
              >
                A-
              </button>
              <span className="text-xs font-mono px-1 opacity-70">{fontSize}px</span>
              <button
                onClick={() => setFontSize(Math.min(26, fontSize + 2))}
                className="px-2 py-0.5 text-xs font-semibold hover:bg-black/5 dark:hover:bg-white/10 rounded"
                title="Increase Font Size"
              >
                A+
              </button>
            </div>
          )}

          {/* Theme Switcher: Warm Sepia Parchment (Default), Obsidian Dark, Clean Light */}
          <div className="flex items-center gap-1 bg-black/5 dark:bg-white/5 p-1 rounded-lg">
            <button
              onClick={() => setReaderTheme('sepia')}
              className={`p-1.5 rounded ${readerTheme === 'sepia' ? 'bg-[#8c6742] text-white shadow-sm' : 'opacity-60'}`}
              title="Warm Handcrafted Parchment"
            >
              <Coffee className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setReaderTheme('dark')}
              className={`p-1.5 rounded ${readerTheme === 'dark' ? 'bg-[#8c6742] text-white shadow-sm' : 'opacity-60'}`}
              title="Dark Obsidian"
            >
              <Moon className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setReaderTheme('light')}
              className={`p-1.5 rounded ${readerTheme === 'light' ? 'bg-gray-300 text-gray-900 shadow-sm' : 'opacity-60'}`}
              title="Clean Light"
            >
              <Sun className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Notes & Highlights Drawer Toggle */}
          <button
            onClick={() => setShowNotesPanel(!showNotesPanel)}
            className={`p-2 rounded-xl transition-all relative ${
              showNotesPanel 
                ? 'bg-[#8c6742] text-white' 
                : 'hover:bg-black/5 dark:hover:bg-white/10 opacity-80'
            }`}
            title="Notes, Highlights & Whisper Dictation"
          >
            <FileText className="w-4 h-4" />
            {(highlights.length > 0 || notes.length > 0) && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#8c6742] text-white rounded-full text-[9px] font-bold flex items-center justify-center">
                {highlights.length + notes.length}
              </span>
            )}
          </button>

          {/* Fullscreen Mode Toggle Button */}
          <button
            onClick={toggleFullscreen}
            className={`p-2 rounded-xl transition-all flex items-center gap-1.5 text-xs font-semibold ${
              isFullscreen
                ? 'bg-[#8c6742] text-white shadow-sm'
                : 'hover:bg-black/5 dark:hover:bg-white/10 opacity-80'
            }`}
            title={isFullscreen ? 'Exit Fullscreen (Esc / F)' : 'Enter Fullscreen (F)'}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            <span className="hidden xl:inline">{isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}</span>
          </button>
        </div>
      </header>

      {/* Main Reading View Container with Table of Contents & Notes Drawer */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left Table of Contents (TOC) Sidebar with Chapter Search */}
        {showTocSidebar && (
          <aside className="w-80 sm:w-88 border-r border-black/10 dark:border-white/10 parchment-card p-4 flex flex-col justify-between overflow-hidden z-20 shadow-xl animate-in slide-in-from-left duration-200">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-black/10 dark:border-white/10">
                <div className="flex items-center gap-2">
                  <ListTree className="w-4 h-4 text-[#8c6742]" />
                  <h3 className={`text-sm font-bold tracking-tight ${activeFontClass}`}>
                    Table of Contents
                  </h3>
                </div>
                <button
                  onClick={() => setShowTocSidebar(false)}
                  className="p-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 text-stone-500"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Real-time Chapter Search */}
              <div className="mt-3 relative">
                <Search className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-2.5" />
                <input
                  type="text"
                  value={tocSearchQuery}
                  onChange={(e) => setTocSearchQuery(e.target.value)}
                  placeholder="Find chapter or topic..."
                  className="w-full text-xs pl-8 pr-3 py-1.5 rounded-xl parchment-input focus:outline-none focus:ring-1 focus:ring-[#8c6742]"
                />
              </div>

              {/* Chapters Tree */}
              <div className="mt-3 overflow-y-auto max-h-[calc(100vh-250px)] space-y-1.5 pr-1">
                {book.chapters
                  .filter((ch) =>
                    !tocSearchQuery.trim() ||
                    ch.title.toLowerCase().includes(tocSearchQuery.toLowerCase()) ||
                    ch.subsections?.some((s) => s.title.toLowerCase().includes(tocSearchQuery.toLowerCase()))
                  )
                  .map((ch, idx) => {
                    const originalIdx = book.chapters.findIndex((c) => c.id === ch.id);
                    const isSelected = currentChapterIndex === originalIdx;
                    const pageNum = ch.pageNumber || (1 + Math.floor((originalIdx * book.totalPages) / totalChapters));

                    return (
                      <div key={ch.id} className="rounded-xl overflow-hidden">
                        <button
                          onClick={() => {
                            setCurrentChapterIndex(originalIdx);
                            setPdfPage(pageNum);
                            syncProgress(originalIdx, 0);
                          }}
                          className={`w-full text-left p-2 rounded-xl text-xs flex items-start justify-between gap-2 transition-all ${
                            isSelected
                              ? 'bg-[#8c6742] text-white font-semibold shadow-sm'
                              : 'hover:bg-black/5 dark:hover:bg-white/5 text-[#2b1f17] dark:text-[#ede5da]'
                          }`}
                        >
                          <div className="flex items-start gap-2 min-w-0">
                            <span className="font-mono text-[10px] opacity-75 mt-0.5">
                              {String(originalIdx + 1).padStart(2, '0')}.
                            </span>
                            <span className="line-clamp-2">{ch.title}</span>
                          </div>
                          <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                            isSelected ? 'bg-white/20 text-white' : 'bg-[#8c6742]/15 text-[#8c6742]'
                          }`}>
                            p. {pageNum}
                          </span>
                        </button>

                        {/* Subsections if present */}
                        {ch.subsections && ch.subsections.length > 0 && (
                          <div className="ml-6 mt-1 pl-2 border-l border-[#8c6742]/20 space-y-1">
                            {ch.subsections.map((sub, sIdx) => (
                              <button
                                key={sIdx}
                                onClick={() => {
                                  setCurrentChapterIndex(originalIdx);
                                  setPdfPage(sub.pageNumber);
                                  syncProgress(originalIdx, 0);
                                }}
                                className="w-full text-left py-0.5 px-1.5 text-[11px] opacity-75 hover:opacity-100 hover:text-[#8c6742] flex items-center justify-between"
                              >
                                <span className="truncate">{sub.title}</span>
                                <span className="font-mono text-[10px] opacity-60">p. {sub.pageNumber}</span>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
              </div>
            </div>

            <div className="pt-3 border-t border-black/10 dark:border-white/10 text-[10px] font-mono opacity-60 text-center">
              Total {totalChapters} Chapters • {book.totalPages} Pages
            </div>
          </aside>
        )}

        {/* Book Content Area: either PDF Page Sheet or Continuous EPUB */}
        {readerFormat === 'pdf' ? (
          /* PDF Page Document Canvas */
          <div
            ref={pdfScrollRef}
            onWheel={handlePdfWheel}
            className="flex-1 overflow-y-auto p-4 sm:p-8 flex flex-col items-center justify-start bg-black/20 scroll-smooth"
          >
            <div
              className="w-full max-w-2xl bg-[#fdfbf7] dark:bg-[#1a1715] text-[#1c1815] dark:text-[#ede5da] shadow-2xl rounded-sm p-8 sm:p-12 flex flex-col justify-between border border-[#8c6742]/30 relative transition-transform duration-150"
              style={{ transform: `scale(${pdfZoom / 100})`, transformOrigin: 'top center' }}
            >
              {/* PDF Running Header */}
              <div className="pb-3 border-b border-black/10 dark:border-white/10 flex items-center justify-between text-[11px] font-serif uppercase tracking-wider opacity-60">
                <span>{book.author}</span>
                <span className="italic truncate max-w-[250px]">{book.title}</span>
              </div>

              {/* PDF Page Body */}
              <div className="py-8 font-serif leading-relaxed">
                <div className="mb-6">
                  <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-[#8c6742]/15 text-[#8c6742]">
                    PDF Page {pdfPage}
                  </span>
                  <h2 className={`text-2xl font-bold mt-2 tracking-tight ${activeFontClass}`}>
                    {currentChapter.title}
                  </h2>
                </div>

                <div className="space-y-4 text-sm leading-relaxed">
                  {currentChapter.paragraphs.map((p, idx) => (
                    <p key={idx} className={idx === 0 ? 'first-letter:text-4xl first-letter:font-bold first-letter:mr-2 first-letter:float-left first-letter:text-[#8c6742]' : ''}>
                      {p}
                    </p>
                  ))}

                  <div className="p-4 rounded-xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 my-4 text-xs font-mono">
                    <div className="opacity-50 text-[10px] uppercase">// Table of Contents Reference</div>
                    <div>Chapter ID: {currentChapter.id} • Starting Page: {currentChapter.pageNumber || 1}</div>
                  </div>
                </div>
              </div>

              {/* PDF Running Footer */}
              <div className="pt-3 border-t border-black/10 dark:border-white/10 flex items-center justify-between text-[11px] font-mono opacity-70">
                <span className="flex items-center gap-1">
                  <Shield className="w-3 h-3 text-emerald-600" />
                  <span>ReadVault Encrypted Document</span>
                </span>
                <span>Page {pdfPage} of {book.totalPages}</span>
              </div>
            </div>

            {/* Bottom PDF Navigation Toolbar */}
            <div className="mt-6 flex items-center gap-4 parchment-card px-5 py-2.5 rounded-2xl shadow-lg border border-[#8c6742]/30 text-xs font-semibold">
              <button
                onClick={handlePdfPrevPage}
                disabled={pdfPage <= 1}
                className="flex items-center gap-1 hover:text-[#8c6742] disabled:opacity-30"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Prev Page</span>
              </button>

              <span className="font-mono">
                Page {pdfPage} / {book.totalPages}
              </span>

              <button
                onClick={handlePdfNextPage}
                disabled={pdfPage >= book.totalPages}
                className="flex items-center gap-1 hover:text-[#8c6742] disabled:opacity-30"
              >
                <span>Next Page</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
            <p className="mt-2 text-[10px] font-mono opacity-50">
              Scroll down or use right arrow &gt; to flip page
            </p>
          </div>
        ) : (
          /* Continuous EPUB Flow Scroll Area */
          <div
            ref={epubScrollRef}
            onWheel={handleEpubWheel}
            className="flex-1 overflow-y-auto px-4 sm:px-8 py-8 lg:py-12 flex justify-center scroll-smooth focus:outline-none"
          >
            <div className="max-w-2xl w-full">
              {isLoadingChapter ? (
                <CalligraphyLoader label="Loading" subtext={`Deciphering ${currentChapter.title}...`} />
              ) : (
                <>
                  {/* EPUB Running Header with Author on Left and Book Title on Right (Matching User Screenshot) */}
                  <div className="pb-3 mb-6 border-b border-black/10 dark:border-white/10 flex items-center justify-between text-[11px] sm:text-xs font-serif uppercase tracking-widest text-[#5e432a] dark:text-[#d8c3af] opacity-80 select-none">
                    <span className="font-semibold tracking-wider truncate max-w-[200px] sm:max-w-xs">
                      {book.author}
                    </span>
                    <span className="italic tracking-wider truncate max-w-[220px] sm:max-w-sm">
                      {book.title}
                    </span>
                  </div>

                  {/* Chapter Header */}
                  <div className="mb-8 pb-4 border-b border-black/10 dark:border-white/10 text-center">
                    <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-[#8c6742]/10 border border-[#8c6742]/20 text-[10px] font-mono text-[#8c6742] dark:text-[#b38738] uppercase tracking-wider mb-2">
                      <span>EPUB</span>
                      <span>•</span>
                      <span>Chapter {currentChapterIndex + 1} of {totalChapters}</span>
                      {currentChapter.pageNumber && (
                        <>
                          <span>•</span>
                          <span>Page {currentChapter.pageNumber}</span>
                        </>
                      )}
                    </div>
                    <h1 className={`text-2xl sm:text-3xl font-bold mt-2 tracking-tight ${activeFontClass}`}>
                      {currentChapter.title}
                    </h1>
                  </div>

                  {/* Paragraphs */}
                  <div className="space-y-6 leading-relaxed font-serif" style={{ fontSize: `${fontSize}px` }}>
                    {currentChapter.paragraphs.map((pText, pIdx) => {
                      const matchesSearch = isMatchSearch(pText);
                      const chapterHighlights = highlights.filter(
                        (h) => h.chapter === currentChapter.id && h.paragraphIndex === pIdx
                      );

                      return (
                        <div
                          key={pIdx}
                          onMouseUp={() => handleMouseUp(pIdx)}
                          onClick={() => syncProgress(currentChapterIndex, pIdx)}
                          className={`reader-paragraph relative transition-all rounded-lg p-2 ${
                            matchesSearch ? 'bg-amber-500/20 ring-1 ring-amber-500/40' : ''
                          } hover:bg-black/[0.02] dark:hover:bg-white/[0.02] cursor-text`}
                        >
                          <p className="leading-relaxed">
                            {pText}
                          </p>

                          {/* Show inline highlights if attached */}
                          {chapterHighlights.map((hl) => (
                            <div
                              key={hl.id}
                              className={`mt-2 p-2 rounded text-xs hl-${hl.color} flex items-center justify-between gap-2 font-sans`}
                            >
                              <span className="italic">“{hl.text}”</span>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  removeHighlight(hl.id);
                                }}
                                className="opacity-60 hover:opacity-100 p-0.5"
                                title="Remove highlight"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                      );
                    })}
                  </div>

                  {/* Chapter Bottom Navigation */}
                  <div className="mt-12 pt-8 border-t border-black/10 dark:border-white/10 flex items-center justify-between">
                    <button
                      onClick={handlePrevChapter}
                      disabled={currentChapterIndex === 0}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 disabled:opacity-30 disabled:pointer-events-none text-xs font-semibold transition-colors"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      <span>Previous Chapter</span>
                    </button>

                    <span className="text-xs font-mono opacity-70">
                      Chapter {currentChapterIndex + 1} of {totalChapters}
                    </span>

                    <button
                      onClick={handleNextChapter}
                      disabled={currentChapterIndex === totalChapters - 1}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#8c6742] hover:bg-[#725232] text-white disabled:opacity-30 disabled:pointer-events-none text-xs font-semibold transition-colors shadow"
                    >
                      <span>Next Chapter</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Seamless Scroll Continuation Banner */}
                  {currentChapterIndex < totalChapters - 1 ? (
                    <div className="mt-4 p-3 rounded-2xl bg-black/[0.03] dark:bg-white/[0.03] border border-black/10 dark:border-white/10 flex items-center justify-between text-xs text-stone-500 font-serif">
                      <span className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-[#8c6742] animate-ping" />
                        <span>Scroll down or use right arrow &gt; to advance to next chapter</span>
                      </span>
                      <button
                        onClick={handleNextChapter}
                        className="text-[#8c6742] font-semibold hover:underline flex items-center gap-1 font-sans text-xs"
                      >
                        <span>Continue</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <div className="mt-4 text-center text-xs opacity-60 font-serif italic py-2">
                      You have reached the final chapter of {book.title}.
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}

        {/* Floating Highlight Action Tooltip when text is selected */}
        {selectedText && (
          <div className="fixed bottom-12 left-1/2 -translate-x-1/2 z-50 parchment-card px-4 py-2 rounded-2xl flex items-center gap-3 shadow-2xl border border-[#8c6742]/40 animate-in fade-in slide-in-from-bottom-2">
            <span className="text-xs font-semibold text-[#2b1f17] dark:text-[#f0eae1]">Highlight:</span>
            <button
              onClick={() => addHighlight('amber')}
              className="w-5 h-5 rounded-full bg-amber-400 hover:scale-110 transition-transform shadow"
              title="Highlight Amber"
            />
            <button
              onClick={() => addHighlight('emerald')}
              className="w-5 h-5 rounded-full bg-emerald-500 hover:scale-110 transition-transform shadow"
              title="Highlight Emerald"
            />
            <button
              onClick={() => addHighlight('rose')}
              className="w-5 h-5 rounded-full bg-rose-500 hover:scale-110 transition-transform shadow"
              title="Highlight Rose"
            />
            <button
              onClick={() => addHighlight('sky')}
              className="w-5 h-5 rounded-full bg-sky-500 hover:scale-110 transition-transform shadow"
              title="Highlight Sky"
            />
            <div className="w-px h-5 bg-[#8c6742]/30 mx-1" />
            <button
              onClick={() => {
                setNewNoteInput(`Ref: "${selectedText}" - `);
                setShowNotesPanel(true);
                setSelectedText('');
              }}
              className="text-xs text-[#8c6742] hover:text-[#5e432a] dark:hover:text-white flex items-center gap-1 font-semibold"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Add Note</span>
            </button>
            <button
              onClick={() => setSelectedText('')}
              className="p-1 rounded-full hover:bg-black/5 dark:hover:bg-white/10 text-gray-500 ml-1"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Sidebar: Notes, Highlights, and Whisper Voice Recording */}
        {showNotesPanel && (
          <aside className="w-80 lg:w-96 border-l border-black/10 dark:border-white/10 parchment-card p-5 flex flex-col justify-between overflow-y-auto z-20">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-black/10 dark:border-white/10">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-[#8c6742]" />
                  <h3 className={`text-sm font-bold tracking-tight ${activeFontClass}`}>
                    Notes & Whisper Voice
                  </h3>
                </div>
                <button
                  onClick={() => setShowNotesPanel(false)}
                  className="p-1 rounded-lg hover:bg-white/10 text-gray-500 hover:text-black dark:hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Add Note with Whisper Voice Input */}
              <div className="mt-4 p-3.5 rounded-xl border border-black/10 dark:border-white/10 bg-[#8c6742]/5">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold opacity-75">Add Chapter Note</span>
                  {/* Whisper Voice Dictation Button */}
                  <button
                    onClick={startWhisperNoteRecording}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                      isRecordingNote
                        ? 'bg-rose-500/20 text-rose-600 border border-rose-500/30 recording-pulse'
                        : 'bg-[#8c6742]/15 text-[#5e432a] dark:text-[#d8c3af] hover:bg-[#8c6742]/25 border border-[#8c6742]/30'
                    }`}
                    title="Speak to dictate note via Whisper"
                  >
                    {isRecordingNote ? (
                      <>
                        <MicOff className="w-3.5 h-3.5 text-rose-500" />
                        <span>Listening...</span>
                      </>
                    ) : (
                      <>
                        <Mic className="w-3.5 h-3.5 text-[#8c6742]" />
                        <span>Whisper Voice</span>
                      </>
                    )}
                  </button>
                </div>

                {whisperStatus && (
                  <p className="text-[11px] text-[#8c6742] mb-2 italic flex items-center gap-1 font-mono">
                    <Sparkles className="w-3 h-3" />
                    <span>{whisperStatus}</span>
                  </p>
                )}

                <textarea
                  rows={3}
                  value={newNoteInput}
                  onChange={(e) => setNewNoteInput(e.target.value)}
                  placeholder="Inscribe a note or click Whisper Voice to dictate..."
                  className="w-full text-xs p-2.5 rounded-lg border border-black/10 dark:border-white/10 bg-transparent focus:outline-none focus:ring-1 focus:ring-[#8c6742] placeholder-[#8c6742]/60 resize-none font-serif"
                />

                <div className="mt-2 flex justify-end">
                  <button
                    onClick={() => saveNote(false)}
                    disabled={!newNoteInput.trim()}
                    className="px-3 py-1.5 rounded-lg bg-[#8c6742] hover:bg-[#725232] text-white text-xs font-semibold disabled:opacity-30 disabled:pointer-events-none transition-colors shadow"
                  >
                    Inscribe Note
                  </button>
                </div>
              </div>

              {/* Saved Notes List */}
              <div className="mt-6 space-y-3">
                <span className="text-[11px] font-semibold uppercase tracking-wider opacity-60">
                  Saved Notes ({notes.length})
                </span>

                {notes.length === 0 ? (
                  <p className="text-xs opacity-50 italic mt-2 font-serif">No notes inscribed for this volume yet.</p>
                ) : (
                  notes.map((note) => (
                    <div
                      key={note.id}
                      className="p-3 rounded-xl border border-black/5 dark:border-white/5 bg-[#8c6742]/5 group relative"
                    >
                      <div className="flex items-center justify-between text-[10px] opacity-60 mb-1">
                        <span className="truncate max-w-[150px]">{note.chapter}</span>
                        <span>{new Date(note.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      <p className="text-xs leading-relaxed font-serif">{note.text}</p>
                      {note.audioGenerated && (
                        <div className="mt-1 flex items-center gap-1 text-[10px] text-[#8c6742] font-mono">
                          <Volume2 className="w-3 h-3" />
                          <span>Transcribed by Whisper</span>
                        </div>
                      )}
                      <button
                        onClick={() => removeNote(note.id)}
                        className="absolute top-2 right-2 p-1 text-gray-500 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Delete note"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))
                )}
              </div>

              {/* Highlights Summary List */}
              <div className="mt-6 space-y-3">
                <span className="text-[11px] font-semibold uppercase tracking-wider opacity-60">
                  Highlights ({highlights.length})
                </span>

                {highlights.map((hl) => (
                  <div
                    key={hl.id}
                    className={`p-3 rounded-xl hl-${hl.color} text-xs flex flex-col justify-between group relative`}
                  >
                    <p className="font-serif italic">“{hl.text}”</p>
                    <div className="mt-2 flex items-center justify-between text-[10px] opacity-70 font-sans">
                      <span>{hl.chapter}</span>
                      <button
                        onClick={() => removeHighlight(hl.id)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 hover:text-red-600"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        )}
      </div>

      {/* Left Floating Flex Arrow Navigation (Works in Fullscreen & Regular mode) */}
      <div className="fixed left-3 sm:left-6 top-1/2 -translate-y-1/2 z-40 flex items-center justify-center pointer-events-auto">
        <button
          onClick={handleGoPrev}
          disabled={isPrevDisabled}
          className="group relative flex items-center justify-center w-11 h-11 sm:w-13 sm:h-13 rounded-full bg-[#fdfbf7]/90 dark:bg-[#1f1b18]/90 backdrop-blur-md border border-[#8c6742]/40 shadow-xl hover:shadow-2xl hover:scale-110 active:scale-95 transition-all duration-200 text-[#5e432a] dark:text-[#d8c3af] disabled:opacity-20 disabled:pointer-events-none disabled:hover:scale-100 cursor-pointer"
          title={readerFormat === 'pdf' ? `Previous Page (${Math.max(1, pdfPage - 1)})` : 'Previous Chapter (← / Scroll Up)'}
          aria-label="Previous Page or Chapter"
        >
          <ChevronLeft className="w-6 h-6 sm:w-7 sm:h-7 group-hover:-translate-x-0.5 transition-transform" />
          <span className="sr-only">Previous</span>
          {/* Floating Tooltip */}
          <span className="absolute left-full ml-3 px-2.5 py-1 rounded-lg bg-black/85 text-white text-[11px] whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-150 font-sans shadow-lg z-50">
            {readerFormat === 'pdf' ? `Page ${Math.max(1, pdfPage - 1)}` : `Prev: ${currentChapterIndex > 0 ? book.chapters[currentChapterIndex - 1]?.title : 'Start'}`}
          </span>
        </button>
      </div>

      {/* Right Floating Flex Arrow Navigation (Works in Fullscreen & Regular mode) */}
      <div className="fixed right-3 sm:right-6 top-1/2 -translate-y-1/2 z-40 flex items-center justify-center pointer-events-auto">
        <button
          onClick={handleGoNext}
          disabled={isNextDisabled}
          className="group relative flex items-center justify-center w-11 h-11 sm:w-13 sm:h-13 rounded-full bg-[#fdfbf7]/90 dark:bg-[#1f1b18]/90 backdrop-blur-md border border-[#8c6742]/40 shadow-xl hover:shadow-2xl hover:scale-110 active:scale-95 transition-all duration-200 text-[#5e432a] dark:text-[#d8c3af] disabled:opacity-20 disabled:pointer-events-none disabled:hover:scale-100 cursor-pointer"
          title={readerFormat === 'pdf' ? `Next Page (${Math.min(book.totalPages, pdfPage + 1)})` : 'Next Chapter (→ / Scroll Down)'}
          aria-label="Next Page or Chapter"
        >
          <ChevronRight className="w-6 h-6 sm:w-7 sm:h-7 group-hover:translate-x-0.5 transition-transform" />
          <span className="sr-only">Next</span>
          {/* Floating Tooltip */}
          <span className="absolute right-full mr-3 px-2.5 py-1 rounded-lg bg-black/85 text-white text-[11px] whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-150 font-sans shadow-lg z-50">
            {readerFormat === 'pdf' ? `Page ${Math.min(book.totalPages, pdfPage + 1)}` : `Next: ${currentChapterIndex < totalChapters - 1 ? book.chapters[currentChapterIndex + 1]?.title : 'End'}`}
          </span>
        </button>
      </div>

      {/* Floating Transition Notice Toast */}
      {scrollNotice && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-full bg-black/80 text-white backdrop-blur-md shadow-2xl text-xs font-mono animate-in fade-in slide-in-from-bottom-2 duration-200 flex items-center gap-2 border border-white/20">
          <Sparkles className="w-3.5 h-3.5 text-[#b38738]" />
          <span>{scrollNotice}</span>
        </div>
      )}
    </div>
  );
};
