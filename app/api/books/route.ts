import { NextResponse } from 'next/server';
import { getDbBooks, getAllowedBooksCount, getTotalArchiveBooksCount, getStoragePath, getDbBookById, pool } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const all = searchParams.get('all') === 'true'; // Admin can request all archive books

    const books = await getDbBooks(!all);
    const allowedCount = await getAllowedBooksCount();
    const totalArchiveCount = await getTotalArchiveBooksCount();
    const storagePath = await getStoragePath();

    return NextResponse.json({
      success: true,
      books,
      count: books.length,
      allowedCount,
      totalArchiveCount,
      storagePath,
    });
  } catch (error: any) {
    console.error('API /api/books GET error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, author, category, totalPages, uniqueId, description } = body;
    if (!title || !title.trim()) {
      return NextResponse.json({ success: false, error: 'Book title is required' }, { status: 400 });
    }

    // Determine uniqueId and id
    const countRes = await pool.query('SELECT COUNT(*) FROM books');
    const nextNum = parseInt(countRes.rows[0].count, 10) + 1;
    const assignedUniqueId = uniqueId?.trim() || `RV-BK-${String(nextNum).padStart(4, '0')}`;
    const assignedId = `bk-${Date.now()}`;
    const storagePath = await getStoragePath();

    await pool.query(
      `INSERT INTO books (
        id, unique_id, title, author, file_path, file_name, file_type, file_size,
        category, cover_gradient, total_pages, is_allowed, allowed_by
      ) VALUES ($1, $2, $3, $4, $5, $6, 'pdf', 1048576, $7, 'from-amber-800 to-stone-900', $8, true, 'admin')`,
      [
        assignedId,
        assignedUniqueId,
        title.trim(),
        (author || 'ReadVault Archive').trim(),
        `${storagePath}\\${title.trim().replace(/[^a-zA-Z0-9_-]/g, '_')}.pdf`,
        `${title.trim().replace(/[^a-zA-Z0-9_-]/g, '_')}.pdf`,
        category || 'Computer Science',
        totalPages || 150
      ]
    );

    // Create 1 initial chapter
    await pool.query(
      `INSERT INTO chapters (id, book_id, title, chapter_order, page_number, paragraphs)
       VALUES ($1, $2, $3, 1, 1, $4)`,
      [
        `ch-${assignedId}-1`,
        assignedId,
        '1. Inscribed Architecture & Theory',
        JSON.stringify([
          `Welcome to ${title} by ${author || 'ReadVault Archive'}.`,
          description || 'This volume was added to the secure administrative repository.'
        ])
      ]
    );

    const book = await getDbBookById(assignedId);
    return NextResponse.json({ success: true, book });
  } catch (error: any) {
    console.error('API /api/books POST error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
