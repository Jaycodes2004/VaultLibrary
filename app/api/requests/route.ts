import { NextResponse } from 'next/server';
import { getDbBookRequests, createDbBookRequest, updateDbBookRequestStatus } from '@/lib/db';

export async function GET() {
  try {
    const requests = await getDbBookRequests();
    return NextResponse.json({ success: true, requests });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, userName, userEmail, title, author } = body;

    if (!userId || !userEmail || !title) {
      return NextResponse.json(
        { success: false, error: 'userId, userEmail, and title are required' },
        { status: 400 }
      );
    }

    const result = await createDbBookRequest(
      userId,
      userName || 'Scholar',
      userEmail,
      title,
      author || ''
    );

    return NextResponse.json({
      success: true,
      request: result.request,
      foundInArchive: result.foundInArchive,
      isAllowed: result.isAllowed,
      message: result.message
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { requestId, status, adminNotes } = body;

    if (!requestId || !status) {
      return NextResponse.json({ success: false, error: 'requestId and status are required' }, { status: 400 });
    }

    const success = await updateDbBookRequestStatus(requestId, status, adminNotes);
    return NextResponse.json({ success });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
