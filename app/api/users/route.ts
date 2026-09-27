import { NextResponse } from 'next/server';
import { getDbUsers, deleteDbUser, updateDbUserTier } from '@/lib/db';

export async function GET() {
  try {
    const users = await getDbUsers();
    return NextResponse.json({ success: true, users });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    if (!userId) {
      return NextResponse.json({ success: false, error: 'userId is required' }, { status: 400 });
    }
    const success = await deleteDbUser(userId);
    return NextResponse.json({ success });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { userId, accessTier, allowedBooks } = body;
    if (!userId || !accessTier) {
      return NextResponse.json({ success: false, error: 'userId and accessTier are required' }, { status: 400 });
    }
    const success = await updateDbUserTier(userId, accessTier, allowedBooks);
    return NextResponse.json({ success });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
