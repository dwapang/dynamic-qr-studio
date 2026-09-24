import { NextRequest, NextResponse } from 'next/server';
import { getQRCodeById, getQRCodeAnalytics } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const qr = getQRCodeById(params.id);
    if (!qr) {
      return NextResponse.json({ success: false, error: 'QR Code not found' }, { status: 404 });
    }

    const analytics = getQRCodeAnalytics(params.id);
    return NextResponse.json({ success: true, data: { qr, analytics } });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
