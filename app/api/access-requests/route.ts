import { NextResponse } from 'next/server';
import {
  getDbLibraryAccessRequests,
  createDbLibraryAccessRequest,
  updateDbLibraryAccessRequestStatus,
  DEFAULT_ADMIN_EMAIL,
} from '@/lib/db';
import { dispatchAccessRequestNotification } from '@/lib/mailer';

export async function GET() {
  try {
    const requests = await getDbLibraryAccessRequests();
    return NextResponse.json({
      success: true,
      requests,
      adminEmail: DEFAULT_ADMIN_EMAIL,
      pendingCount: requests.filter((r) => r.status === 'pending').length,
    });
  } catch (error: any) {
    console.error('API /api/access-requests GET error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { fullName, email, organization, purpose, desiredTier } = body;

    if (!fullName || !email) {
      return NextResponse.json(
        { success: false, error: 'Full name and email address are required' },
        { status: 400 }
      );
    }

    const newRequest = await createDbLibraryAccessRequest(
      fullName,
      email,
      organization || '',
      purpose || '',
      desiredTier || 'scholar'
    );

    // Dispatch notice to Chief Administrator
    const dispatchResult = await dispatchAccessRequestNotification({
      requestId: newRequest.id,
      fullName: fullName.trim(),
      email: email.trim().toLowerCase(),
      organization: organization || 'Independent Scholar',
      purpose: purpose || 'Academic Research',
      desiredTier: desiredTier || 'scholar',
    });

    console.log(`[DISPATCH NOTICE] Library Access Request from ${fullName} processed. Mode: ${dispatchResult.mode}`);

    return NextResponse.json({
      success: true,
      request: newRequest,
      message: `Your library access request has been officially transmitted to Administration.`,
      dispatch: dispatchResult,
      adminEmail: DEFAULT_ADMIN_EMAIL,
    });
  } catch (error: any) {
    console.error('API /api/access-requests POST error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { requestId, status, adminNotes } = body;

    if (!requestId || !status) {
      return NextResponse.json(
        { success: false, error: 'requestId and status are required' },
        { status: 400 }
      );
    }

    const result = await updateDbLibraryAccessRequestStatus(requestId, status, adminNotes);

    return NextResponse.json({
      success: result.success,
      requestId,
      status,
      userCreated: result.userCreated,
      adminEmail: DEFAULT_ADMIN_EMAIL,
    });
  } catch (error: any) {
    console.error('API /api/access-requests PATCH error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
