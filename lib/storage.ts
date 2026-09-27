import { UserProfile, CookieSessionData } from './types';

const COOKIE_NAME = 'lib_user_session_v1';
const COOKIE_EXPIRY_DAYS = 120;
const COOKIE_MAX_AGE_SECONDS = COOKIE_EXPIRY_DAYS * 24 * 60 * 60; // 10,368,000 seconds

export function setSessionCookie(data: CookieSessionData): void {
  if (typeof document === 'undefined') return;

  const serialized = encodeURIComponent(JSON.stringify(data));
  const expiresDate = new Date();
  expiresDate.setDate(expiresDate.getDate() + COOKIE_EXPIRY_DAYS);
  
  // Set cookie with 120-day Max-Age, SameSite=Lax, and Secure if https
  document.cookie = `${COOKIE_NAME}=${serialized}; max-age=${COOKIE_MAX_AGE_SECONDS}; path=/; SameSite=Lax`;
  
  // Also sync to localStorage as redundant cache for hybrid apps / offline
  try {
    localStorage.setItem(COOKIE_NAME, JSON.stringify(data));
  } catch (err) {
    console.warn('LocalStorage error:', err);
  }
}

export function getSessionCookie(): CookieSessionData | null {
  if (typeof document === 'undefined') return null;

  try {
    const cookies = document.cookie.split(';');
    for (const cookie of cookies) {
      const [name, val] = cookie.trim().split('=');
      if (name === COOKIE_NAME && val) {
        return JSON.parse(decodeURIComponent(val));
      }
    }
    
    // Fallback to localStorage
    const local = localStorage.getItem(COOKIE_NAME);
    if (local) {
      return JSON.parse(local);
    }
  } catch (err) {
    console.warn('Error reading session data:', err);
  }
  return null;
}

export function clearSessionCookie(): void {
  if (typeof document === 'undefined') return;
  document.cookie = `${COOKIE_NAME}=; max-age=0; path=/; SameSite=Lax`;
  try {
    localStorage.removeItem(COOKIE_NAME);
  } catch (err) {
    console.warn('LocalStorage remove error:', err);
  }
}

export function updateLastReadPosition(
  user: UserProfile,
  bookId: string,
  bookTitle: string,
  chapterTitle: string,
  locationCfi: string,
  progressPercentage: number
): UserProfile {
  const now = new Date().toISOString();
  
  // Check if book exists in booksAccessed
  const existingIdx = user.booksAccessed.findIndex(b => b.bookId === bookId);
  const updatedBooks = [...user.booksAccessed];
  
  if (existingIdx >= 0) {
    updatedBooks[existingIdx] = {
      ...updatedBooks[existingIdx],
      lastAccessed: now,
      locationCfi,
      chapterTitle,
      progressPercentage,
    };
  } else {
    updatedBooks.unshift({
      bookId,
      title: bookTitle,
      coverUrl: '',
      lastAccessed: now,
      locationCfi,
      chapterTitle,
      progressPercentage,
    });
  }

  const updatedProfile: UserProfile = {
    ...user,
    lastBookReadId: bookId,
    lastReadTitle: bookTitle,
    lastReadLocation: locationCfi,
    lastReadProgress: progressPercentage,
    lastReadTimestamp: now,
    booksAccessed: updatedBooks,
  };

  // Sync to 120-day cookie
  const expiryDate = new Date();
  expiryDate.setDate(expiryDate.getDate() + COOKIE_EXPIRY_DAYS);

  const sessionData: CookieSessionData = {
    userId: user.userId,
    name: user.name,
    email: user.email,
    lastBookId: bookId,
    lastBookTitle: bookTitle,
    lastLocation: locationCfi,
    lastChapterTitle: chapterTitle,
    progressPercentage,
    expiresAt: expiryDate.toISOString(),
  };

  setSessionCookie(sessionData);

  // Also persist user profile in local store
  if (typeof window !== 'undefined') {
    localStorage.setItem(`user_profile_${user.userId}`, JSON.stringify(updatedProfile));
  }

  return updatedProfile;
}
