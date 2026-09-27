import { NextResponse } from 'next/server';
import { getDbBookById, toggleBookAllowed, updateDbBook, deleteDbBook } from '@/lib/db';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const book = await getDbBookById(id);
    if (!book) {
      return NextResponse.json({ success: false, error: 'Book not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, book });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    if (body.title || body.author || body.category || body.totalPages || body.uniqueId) {
      const updated = await updateDbBook(id, {
        title: body.title,
        author: body.author,
        category: body.category,
        totalPages: body.totalPages,
        uniqueId: body.uniqueId,
        isAllowed: body.isAllowed,
      });
      return NextResponse.json({ success: updated, bookId: id, details: body });
    }

    if (typeof body.isAllowed === 'boolean') {
      const updated = await toggleBookAllowed(id, body.isAllowed);
      return NextResponse.json({ success: updated, bookId: id, isAllowed: body.isAllowed });
    }

    return NextResponse.json({ success: false, error: 'No valid maintenance update parameters provided' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const deleted = await deleteDbBook(id);
    return NextResponse.json({ success: deleted, deletedBookId: id });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
