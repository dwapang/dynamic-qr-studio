import { NextRequest, NextResponse } from 'next/server';
import { getAllQRCodes, createQRCode, getQRCodeBySlug } from '@/lib/db';
import { QRStylingConfig } from '@/lib/types';

export const dynamic = 'force-dynamic';

function generateRandomSlug(length = 6): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export async function GET() {
  try {
    const qrs = getAllQRCodes();
    return NextResponse.json({ success: true, data: qrs });
  } catch (error: any) {
    console.error('Error fetching QR codes:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, targetUrl, description, expiresAt, styling } = body;
    let slug = body.slug ? body.slug.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '-') : '';

    if (!title || !targetUrl) {
      return NextResponse.json(
        { success: false, error: 'Title and Destination URL are required' },
        { status: 400 }
      );
    }

    // If slug is empty, generate an available random slug
    if (!slug) {
      let candidate = generateRandomSlug(6);
      while (getQRCodeBySlug(candidate)) {
        candidate = generateRandomSlug(6);
      }
      slug = candidate;
    } else {
      // Check for collision
      const existing = getQRCodeBySlug(slug);
      if (existing) {
        return NextResponse.json(
          { success: false, error: `The slug "${slug}" is already in use. Please choose another.` },
          { status: 409 }
        );
      }
    }

    const defaultStyling: QRStylingConfig = {
      fgColor: '#1e1b4b',
      bgColor: '#ffffff',
      eyeFrameColor: '#4f46e5',
      eyeBallColor: '#4338ca',
      dotType: 'rounded',
      cornerSquareType: 'rounded',
      cornerDotType: 'circle',
      errorCorrectionLevel: 'H',
      logoUrl: '',
      logoSize: 0.22,
    };

    const newQR = createQRCode({
      slug,
      title: title.trim(),
      description: description || '',
      targetUrl: targetUrl.trim(),
      qrType: body.qrType === 'direct' ? 'direct' : 'dynamic',
      expiresAt: expiresAt || null,
      styling: styling ? { ...defaultStyling, ...styling } : defaultStyling,
    });

    return NextResponse.json({ success: true, data: newQR }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating QR code:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
