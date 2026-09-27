export type UserAccessTier = 'full' | 'standard' | 'restricted' | 'suspended';

export interface UserProfile {
  userId: string;
  name: string;
  email: string;
  avatarUrl?: string;
  accessTier: UserAccessTier;
  allowedBooks?: string[];
  lastBookReadId?: string;
  lastReadTitle?: string;
  lastReadLocation?: string;
  lastReadProgress?: number;
  lastReadTimestamp?: string;
  booksAccessed: {
    bookId: string;
    title: string;
    coverUrl: string;
    lastAccessed: string;
    locationCfi: string;
    chapterTitle: string;
    progressPercentage: number;
  }[];
}

export interface BookHighlight {
  id: string;
  bookId: string;
  text: string;
  color: 'amber' | 'emerald' | 'rose' | 'sky';
  chapter: string;
  paragraphIndex: number;
  timestamp: string;
  note?: string;
}

export interface BookNote {
  id: string;
  bookId: string;
  chapter: string;
  text: string;
  audioGenerated?: boolean;
  timestamp: string;
}

export interface Chapter {
  id: string;
  title: string;
  pageNumber?: number;
  subsections?: { title: string; pageNumber: number }[];
  paragraphs: string[];
}

export interface Book {
  id: string;
  uniqueId?: string;
  title: string;
  author: string;
  coverGradient: string;
  coverImage?: string;
  category: string;
  totalPages: number;
  description: string;
  requiredTier?: UserAccessTier;
  chapters: Chapter[];
  pdfUrl?: string;
  isAllowed?: boolean;
  filePath?: string;
  fileSize?: number;
  fileType?: string;
}

export interface CookieSessionData {
  userId: string;
  name: string;
  email: string;
  lastBookId: string;
  lastBookTitle: string;
  lastLocation: string;
  lastChapterTitle: string;
  progressPercentage: number;
  expiresAt: string;
}

export type BookRequestStatus =
  | 'pending'
  | 'approved'
  | 'approved_in_archive'
  | 'rejected_not_in_archive'
  | 'not_found'
  | 'restricted_access'
  | 'fulfilled';

export interface BookRequest {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  title?: string;
  bookTitle?: string;
  author: string;
  notes?: string;
  status: BookRequestStatus;
  adminNotificationSent?: boolean;
  notificationSent?: boolean;
  adminFeedbackMessage?: string;
  adminNotes?: string;
  evaluatedPath?: string;
  matchedFilePath?: string;
  createdAt?: string;
  timestamp?: string;
}

export type LightThemeId = 'vintage-slate' | 'antique-parchment' | 'monastic-ivory';
export type DarkThemeId = 'archival-obsidian' | 'midnight-scholar' | 'forest-leather';

export interface LibraryAccessRequest {
  id: string;
  fullName: string;
  email: string;
  organization?: string;
  purpose?: string;
  desiredTier: string;
  status: 'pending' | 'approved' | 'rejected';
  adminEmail: string;
  notificationDispatched: boolean;
  adminNotes?: string;
  createdAt: string;
  reviewedAt?: string;
}

export interface CustomThemePreferences {
  mode: 'light' | 'dark';
  lightTheme: LightThemeId;
  darkTheme: DarkThemeId;
  fontId: string;
}

