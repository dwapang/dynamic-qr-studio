import { NextRequest, NextResponse } from 'next/server';
import { getQRCodeById, updateQRCode, deleteQRCode, getQRCodeBySlug } from '@/lib/db';

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
    return NextResponse.json({ success: true, data: qr });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const existing = getQRCodeById(params.id);
    if (!existing) {
      return NextResponse.json({ success: false, error: 'QR Code not found' }, { status: 404 });
    }

    if (body.slug && body.slug !== existing.slug) {
      const slugTaken = getQRCodeBySlug(body.slug);
      if (slugTaken && slugTaken.id !== existing.id) {
        return NextResponse.json(
          { success: false, error: `Slug "${body.slug}" is already in use by another QR code.` },
          { status: 409 }
        );
      }
    }

    const updated = updateQRCode(params.id, body);
    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const existing = getQRCodeById(params.id);
    if (!existing) {
      return NextResponse.json({ success: false, error: 'QR Code not found' }, { status: 404 });
    }

    deleteQRCode(params.id);
    return NextResponse.json({ success: true, message: 'QR Code deleted successfully' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
