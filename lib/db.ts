import { Pool } from 'pg';
import fs from 'fs';
import path from 'path';
import { Book, Chapter, UserProfile, BookRequest, LibraryAccessRequest } from './types';

export const pool = new Pool({
  host: process.env.PGHOST || '127.0.0.1',
  port: parseInt(process.env.PGPORT || '5432', 10),
  user: process.env.PGUSER || 'postgres',
  password: process.env.PGPASSWORD || '123456',
  database: process.env.PGDATABASE || 'library_db',
  max: 10,
  idleTimeoutMillis: 30000,
});

export const DEFAULT_ARCHIVE_PATH = 'D:\\Desktop\\Archive\\Books';

// Get storage path from DB or default
export async function getStoragePath(): Promise<string> {
  try {
    const res = await pool.query("SELECT value FROM library_config WHERE key = 'storage_path'");
    if (res.rows.length > 0) return res.rows[0].value;
  } catch (err) {
    console.error('getStoragePath error:', err);
  }
  return DEFAULT_ARCHIVE_PATH;
}

// Update storage path in DB
export async function setStoragePath(newPath: string): Promise<void> {
  await pool.query(
    "INSERT INTO library_config (key, value) VALUES ('storage_path', $1) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value",
    [newPath]
  );
}

// Get dynamic allowed books count
export async function getAllowedBooksCount(): Promise<number> {
  try {
    const res = await pool.query('SELECT COUNT(*) FROM books WHERE is_allowed = true');
    return parseInt(res.rows[0].count, 10);
  } catch (e) {
    return 0;
  }
}

// Get dynamic total books count in archive
export async function getTotalArchiveBooksCount(): Promise<number> {
  try {
    const res = await pool.query('SELECT COUNT(*) FROM books');
    return parseInt(res.rows[0].count, 10);
  } catch (e) {
    return 0;
  }
}

// Fetch all books (with optional allowedOnly filter)
export async function getDbBooks(allowedOnly = true): Promise<Book[]> {
  try {
    const query = allowedOnly
      ? 'SELECT * FROM books WHERE is_allowed = true ORDER BY id ASC'
      : 'SELECT * FROM books ORDER BY id ASC';
    const booksRes = await pool.query(query);

    const bookIds = booksRes.rows.map((b) => b.id);
    if (bookIds.length === 0) return [];

    const chaptersRes = await pool.query(
      'SELECT * FROM chapters WHERE book_id = ANY($1) ORDER BY book_id, chapter_order ASC',
      [bookIds]
    );

    // Group chapters by book_id
    const chaptersByBook: Record<string, Chapter[]> = {};
    for (const row of chaptersRes.rows) {
      if (!chaptersByBook[row.book_id]) chaptersByBook[row.book_id] = [];
      chaptersByBook[row.book_id].push({
        id: row.id,
        title: row.title,
        pageNumber: row.page_number,
        paragraphs: typeof row.paragraphs === 'string' ? JSON.parse(row.paragraphs) : row.paragraphs || [],
      });
    }

    return booksRes.rows.map((row) => ({
      id: row.id,
      uniqueId: row.unique_id || ('RV-BK-' + String(row.id).replace('bk-', '').padStart(4, '0')),
      title: row.title,
      author: row.author,
      category: row.category,
      coverGradient: row.cover_gradient,
      totalPages: row.total_pages,
      description: `Physical archive volume: ${row.file_name} (${(row.file_size / (1024 * 1024)).toFixed(1)} MB). Stored at ${row.file_path}`,
      chapters: chaptersByBook[row.id] || [
        {
          id: `ch-${row.id}-1`,
          title: '1. Inscribed Architecture & Theory',
          pageNumber: 1,
          paragraphs: [
            `Welcome to ${row.title} by ${row.author}. This volume is securely stored in your local archive.`,
            `ReadVault encrypted stream dynamically manages access rights and provides high-fidelity EPUB and PDF reading.`
          ]
        }
      ],
      isAllowed: row.is_allowed,
      filePath: row.file_path,
      fileSize: row.file_size,
      fileType: row.file_type
    }));
  } catch (err) {
    console.error('getDbBooks error:', err);
    return [];
  }
}

// Toggle whether a book is allowed to access
export async function toggleBookAllowed(bookId: string, isAllowed: boolean): Promise<boolean> {
  try {
    await pool.query('UPDATE books SET is_allowed = $1, allowed_at = CURRENT_TIMESTAMP WHERE id = $2 OR unique_id = $2', [isAllowed, bookId]);
    return true;
  } catch (err) {
    console.error('toggleBookAllowed error:', err);
    return false;
  }
}

// Update book maintenance details (Title, Author, Category, Unique ID, Total Pages, IsAllowed)
export async function updateDbBook(
  bookId: string,
  updates: {
    title?: string;
    author?: string;
    category?: string;
    totalPages?: number;
    uniqueId?: string;
    isAllowed?: boolean;
  }
): Promise<boolean> {
  try {
    const fields: string[] = [];
    const values: any[] = [];
    let idx = 1;

    if (updates.title !== undefined) {
      fields.push(`title = $${idx++}`);
      values.push(updates.title);
    }
    if (updates.author !== undefined) {
      fields.push(`author = $${idx++}`);
      values.push(updates.author);
    }
    if (updates.category !== undefined) {
      fields.push(`category = $${idx++}`);
      values.push(updates.category);
    }
    if (updates.totalPages !== undefined) {
      fields.push(`total_pages = $${idx++}`);
      values.push(updates.totalPages);
    }
    if (updates.uniqueId !== undefined) {
      fields.push(`unique_id = $${idx++}`);
      values.push(updates.uniqueId);
    }
    if (updates.isAllowed !== undefined) {
      fields.push(`is_allowed = $${idx++}`);
      values.push(updates.isAllowed);
    }

    if (fields.length === 0) return true;

    values.push(bookId);
    const query = `UPDATE books SET ${fields.join(', ')} WHERE id = $${idx} OR unique_id = $${idx}`;
    await pool.query(query, values);
    return true;
  } catch (err) {
    console.error('updateDbBook error:', err);
    return false;
  }
}

// Delete book and its chapters from database
export async function deleteDbBook(bookId: string): Promise<boolean> {
  try {
    await pool.query('DELETE FROM chapters WHERE book_id = $1', [bookId]);
    await pool.query('DELETE FROM books WHERE id = $1 OR unique_id = $1', [bookId]);
    return true;
  } catch (err) {
    console.error('deleteDbBook error:', err);
    return false;
  }
}

// Get single book with chapters
export async function getDbBookById(bookId: string): Promise<Book | null> {
  try {
    const bRes = await pool.query('SELECT * FROM books WHERE id = $1', [bookId]);
    if (bRes.rows.length === 0) return null;
    const row = bRes.rows[0];

    const cRes = await pool.query('SELECT * FROM chapters WHERE book_id = $1 ORDER BY chapter_order ASC', [bookId]);
    const chapters: Chapter[] = cRes.rows.map((ch) => ({
      id: ch.id,
      title: ch.title,
      pageNumber: ch.page_number,
      paragraphs: typeof ch.paragraphs === 'string' ? JSON.parse(ch.paragraphs) : ch.paragraphs || [],
    }));

    return {
      id: row.id,
      uniqueId: row.unique_id || ('RV-BK-' + String(row.id).replace('bk-', '').padStart(4, '0')),
      title: row.title,
      author: row.author,
      category: row.category,
      coverGradient: row.cover_gradient,
      totalPages: row.total_pages,
      description: `Physical archive volume: ${row.file_name} (${(row.file_size / (1024 * 1024)).toFixed(1)} MB). Stored at ${row.file_path}`,
      chapters,
      isAllowed: row.is_allowed,
      filePath: row.file_path,
      fileSize: row.file_size,
      fileType: row.file_type
    };
  } catch (err) {
    console.error('getDbBookById error:', err);
    return null;
  }
}

// Get all users
export async function getDbUsers(): Promise<UserProfile[]> {
  try {
    const res = await pool.query('SELECT * FROM users ORDER BY created_at ASC');
    return res.rows.map((r) => ({
      userId: r.id,
      name: r.name,
      email: r.email,
      accessTier: r.access_tier,
      allowedBooks: typeof r.allowed_books === 'string' ? JSON.parse(r.allowed_books) : r.allowed_books || ['all'],
      lastBookReadId: r.last_book_read_id || undefined,
      lastReadLocation: r.last_read_location || undefined,
      booksAccessed: []
    }));
  } catch (err) {
    console.error('getDbUsers error:', err);
    return [];
  }
}

// Delete user
export async function deleteDbUser(userId: string): Promise<boolean> {
  try {
    await pool.query('DELETE FROM users WHERE id = $1', [userId]);
    return true;
  } catch (err) {
    console.error('deleteDbUser error:', err);
    return false;
  }
}

// Update user access tier and allowed books
export async function updateDbUserTier(userId: string, accessTier: string, allowedBooks?: string[]): Promise<boolean> {
  try {
    if (allowedBooks) {
      await pool.query('UPDATE users SET access_tier = $1, allowed_books = $2 WHERE id = $3', [
        accessTier,
        JSON.stringify(allowedBooks),
        userId
      ]);
    } else {
      await pool.query('UPDATE users SET access_tier = $1 WHERE id = $2', [accessTier, userId]);
    }
    return true;
  } catch (err) {
    console.error('updateDbUserTier error:', err);
    return false;
  }
}

// Get Book Requests
export async function getDbBookRequests(): Promise<BookRequest[]> {
  try {
    const res = await pool.query('SELECT * FROM book_requests ORDER BY created_at DESC');
    return res.rows.map((r) => ({
      id: r.id,
      userId: r.user_id,
      userName: r.user_name,
      userEmail: r.user_email,
      bookTitle: r.requested_title,
      author: r.requested_author,
      status: r.status,
      timestamp: r.created_at ? new Date(r.created_at).toISOString() : new Date().toISOString(),
      matchedFilePath: r.matched_file_path || undefined,
      adminNotes: r.admin_notes || undefined,
      notificationSent: r.notification_sent
    }));
  } catch (err) {
    console.error('getDbBookRequests error:', err);
    return [];
  }
}

// Create Book Request with automatic archive path check
export async function createDbBookRequest(
  userId: string,
  userName: string,
  userEmail: string,
  requestedTitle: string,
  requestedAuthor: string
): Promise<{ request: BookRequest; foundInArchive: boolean; isAllowed: boolean; message: string }> {
  try {
    const qTitle = requestedTitle.toLowerCase().trim();
    const qAuthor = requestedAuthor.toLowerCase().trim();

    // Check against real books table (scanned from D:\Desktop\Archive\Books)
    const matchRes = await pool.query(
      `SELECT * FROM books 
       WHERE LOWER(title) LIKE $1 
          OR LOWER(file_name) LIKE $1 
          OR ($2 != '' AND LOWER(author) LIKE $2)
       LIMIT 1`,
      [`%${qTitle}%`, `%${qAuthor}%`]
    );

    let status: 'approved_in_archive' | 'rejected_not_in_archive' | 'pending' = 'pending';
    let matchedFilePath: string | null = null;
    let foundInArchive = false;
    let isAllowed = false;
    let message = '';

    if (matchRes.rows.length > 0) {
      const matched = matchRes.rows[0];
      foundInArchive = true;
      isAllowed = matched.is_allowed;
      matchedFilePath = matched.file_path;

      if (isAllowed) {
        status = 'approved_in_archive';
        message = `Volume "${matched.title}" is already in the physical archive and allowed for scholar access.`;
      } else {
        status = 'pending';
        message = `Volume "${matched.title}" was verified in the physical storage archive (${matched.file_name}), but access has not yet been unlocked by the administrator. Request forwarded to admin.`;
      }
    } else {
      status = 'rejected_not_in_archive';
      message = `This book is not currently in the physical library archive path (${DEFAULT_ARCHIVE_PATH}). An automated notice has been registered.`;
    }

    const reqId = `req-${Date.now()}`;
    await pool.query(
      `INSERT INTO book_requests (
        id, user_id, user_name, user_email, requested_title, requested_author,
        status, matched_file_path, notification_sent, admin_notes
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, true, $9)`,
      [reqId, userId, userName, userEmail, requestedTitle, requestedAuthor, status, matchedFilePath, message]
    );

    const request: BookRequest = {
      id: reqId,
      userId,
      userName,
      userEmail,
      bookTitle: requestedTitle,
      author: requestedAuthor,
      status,
      timestamp: new Date().toISOString(),
      matchedFilePath: matchedFilePath || undefined,
      notificationSent: true,
      adminNotes: message
    };

    return { request, foundInArchive, isAllowed, message };
  } catch (err) {
    console.error('createDbBookRequest error:', err);
    throw err;
  }
}

// Update Book Request Status
export async function updateDbBookRequestStatus(
  requestId: string,
  status: 'approved_in_archive' | 'rejected_not_in_archive' | 'pending' | 'fulfilled',
  adminNotes?: string
): Promise<boolean> {
  try {
    await pool.query(
      'UPDATE book_requests SET status = $1, admin_notes = COALESCE($2, admin_notes), notification_sent = true WHERE id = $3',
      [status, adminNotes, requestId]
    );
    return true;
  } catch (err) {
    console.error('updateDbBookRequestStatus error:', err);
    return false;
  }
}

export const DEFAULT_ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@vaultlibrary.org';

// Fetch all library access requests
export async function getDbLibraryAccessRequests(): Promise<LibraryAccessRequest[]> {
  try {
    const res = await pool.query('SELECT * FROM library_access_requests ORDER BY created_at DESC');
    return res.rows.map((r) => ({
      id: r.id,
      fullName: r.full_name,
      email: r.email,
      organization: r.organization || '',
      purpose: r.purpose || '',
      desiredTier: r.desired_tier || 'scholar',
      status: r.status,
      adminEmail: r.admin_email || DEFAULT_ADMIN_EMAIL,
      notificationDispatched: r.notification_dispatched,
      adminNotes: r.admin_notes || undefined,
      createdAt: r.created_at ? new Date(r.created_at).toISOString() : new Date().toISOString(),
      reviewedAt: r.reviewed_at ? new Date(r.reviewed_at).toISOString() : undefined,
    }));
  } catch (err) {
    console.error('getDbLibraryAccessRequests error:', err);
    return [];
  }
}

// Create new library access request (routed to configured administrator)
export async function createDbLibraryAccessRequest(
  fullName: string,
  email: string,
  organization: string,
  purpose: string,
  desiredTier: string = 'scholar'
): Promise<LibraryAccessRequest> {
  const reqId = `req-acc-${Date.now()}`;
  await pool.query(
    `INSERT INTO library_access_requests (
      id, full_name, email, organization, purpose, desired_tier, status, admin_email, notification_dispatched
    ) VALUES ($1, $2, $3, $4, $5, $6, 'pending', $7, true)`,
    [reqId, fullName.trim(), email.trim().toLowerCase(), organization.trim(), purpose.trim(), desiredTier, DEFAULT_ADMIN_EMAIL]
  );

  return {
    id: reqId,
    fullName: fullName.trim(),
    email: email.trim().toLowerCase(),
    organization: organization.trim(),
    purpose: purpose.trim(),
    desiredTier,
    status: 'pending',
    adminEmail: DEFAULT_ADMIN_EMAIL,
    notificationDispatched: true,
    createdAt: new Date().toISOString(),
  };
}

// Approve or reject access request
export async function updateDbLibraryAccessRequestStatus(
  requestId: string,
  status: 'approved' | 'rejected',
  adminNotes?: string
): Promise<{ success: boolean; userCreated?: UserProfile }> {
  try {
    await pool.query(
      `UPDATE library_access_requests 
       SET status = $1, admin_notes = COALESCE($2, admin_notes), reviewed_at = CURRENT_TIMESTAMP 
       WHERE id = $3`,
      [status, adminNotes, requestId]
    );

    let userCreated: UserProfile | undefined;

    // If approved, create or update user in users table!
    if (status === 'approved') {
      const reqRes = await pool.query('SELECT * FROM library_access_requests WHERE id = $1', [requestId]);
      if (reqRes.rows.length > 0) {
        const r = reqRes.rows[0];
        const userId = `usr_${r.email.replace(/[^a-zA-Z0-9]/g, '_')}`;
        await pool.query(
          `INSERT INTO users (id, name, email, access_tier, allowed_books)
           VALUES ($1, $2, $3, $4, '["all"]')
           ON CONFLICT (email) DO UPDATE SET access_tier = EXCLUDED.access_tier`,
          [userId, r.full_name, r.email, r.desired_tier || 'scholar']
        );
        userCreated = {
          userId,
          name: r.full_name,
          email: r.email,
          accessTier: (r.desired_tier || 'scholar') as any,
          allowedBooks: ['all'],
          booksAccessed: []
        };
      }
    }

    return { success: true, userCreated };
  } catch (err) {
    console.error('updateDbLibraryAccessRequestStatus error:', err);
    return { success: false };
  }
}

