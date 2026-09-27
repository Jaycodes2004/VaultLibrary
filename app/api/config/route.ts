import { NextResponse } from 'next/server';
import { getStoragePath, setStoragePath, getAllowedBooksCount, getTotalArchiveBooksCount } from '@/lib/db';

export async function GET() {
  try {
    const storagePath = await getStoragePath();
    const allowedCount = await getAllowedBooksCount();
    const totalCount = await getTotalArchiveBooksCount();

    return NextResponse.json({
      success: true,
      storagePath,
      allowedCount,
      totalCount,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { storagePath } = body;
    if (!storagePath) {
      return NextResponse.json({ success: false, error: 'storagePath is required' }, { status: 400 });
    }

    await setStoragePath(storagePath);
    return NextResponse.json({ success: true, storagePath });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
