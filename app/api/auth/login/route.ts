import { NextResponse } from 'next/server';
import { pool, DEFAULT_ADMIN_EMAIL } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = (body.email || '').trim().toLowerCase();

    if (!email) {
      return NextResponse.json({ success: false, error: 'Email is required' }, { status: 400 });
    }

    // 1. Check approved users table
    const userRes = await pool.query('SELECT * FROM users WHERE LOWER(email) = $1', [email]);
    if (userRes.rows.length > 0) {
      const u = userRes.rows[0];
      if (u.access_tier === 'suspended') {
        return NextResponse.json({
          success: false,
          error: 'Your library privileges have been suspended. Please contact the administrator.',
        }, { status: 403 });
      }

      return NextResponse.json({
        success: true,
        user: {
          userId: u.id,
          name: u.name,
          email: u.email,
          accessTier: u.access_tier,
          allowedBooks: typeof u.allowed_books === 'string' ? JSON.parse(u.allowed_books) : u.allowed_books || ['all'],
          lastBookReadId: u.last_book_read_id || undefined,
          lastReadLocation: u.last_read_location || undefined,
          booksAccessed: [],
        },
      });
    }

    // 2. Check if there's a pending access request
    const reqRes = await pool.query(
      'SELECT * FROM library_access_requests WHERE LOWER(email) = $1 ORDER BY created_at DESC LIMIT 1',
      [email]
    );

    if (reqRes.rows.length > 0) {
      const r = reqRes.rows[0];
      if (r.status === 'pending') {
        return NextResponse.json({
          success: false,
          pending: true,
          error: `Your access request is currently pending administrative review. You will receive authorization upon approval.`,
        }, { status: 403 });
      }
      if (r.status === 'rejected') {
        return NextResponse.json({
          success: false,
          rejected: true,
          error: `Access request for this email was reviewed and declined by the library administration.`,
        }, { status: 403 });
      }
    }

    // 3. Not found
    return NextResponse.json({
      success: false,
      notFound: true,
      error: `Access credentials not found. ReadVault is a request-only library. Please submit an Access Request for administrative review.`,
    }, { status: 404 });
  } catch (error: any) {
    console.error('API /api/auth/login error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
