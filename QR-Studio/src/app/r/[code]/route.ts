import { NextRequest, NextResponse } from 'next/server';
import { getQRCodeBySlug, recordScan } from '@/lib/db';
import { UAParser } from 'ua-parser-js';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: { code: string } }
) {
  const { code } = params;
  if (!code) {
    return NextResponse.json({ error: 'Code is required' }, { status: 400 });
  }

  const qr = getQRCodeBySlug(code);
  if (!qr) {
    return new NextResponse(
      `<!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="utf-8">
          <title>QR Code Not Found</title>
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <script src="https://cdn.tailwindcss.com"></script>
        </head>
        <body class="bg-slate-50 min-h-screen flex items-center justify-center p-4">
          <div class="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center border border-slate-100">
            <div class="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
              ?
            </div>
            <h1 class="text-2xl font-bold text-slate-800 mb-2">QR Code Not Found</h1>
            <p class="text-slate-600 mb-6">The dynamic link "<strong>${code}</strong>" does not exist or has been removed.</p>
            <a href="/" class="inline-flex items-center justify-center px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-medium transition shadow-md hover:shadow-lg">
              Go to Generator
            </a>
          </div>
        </body>
      </html>`,
      {
        status: 404,
        headers: { 'Content-Type': 'text/html; charset=utf-8' },
      }
    );
  }

  // Check if paused
  if (qr.status === 'paused') {
    const url = new URL('/r/paused', request.url);
    url.searchParams.set('title', qr.title);
    url.searchParams.set('slug', qr.slug);
    return NextResponse.redirect(url);
  }

  // Check if expired
  if (qr.expiresAt && new Date(qr.expiresAt) < new Date()) {
    const url = new URL('/r/expired', request.url);
    url.searchParams.set('title', qr.title);
    url.searchParams.set('slug', qr.slug);
    return NextResponse.redirect(url);
  }

  // Parse User-Agent for analytics
  try {
    const uaString = request.headers.get('user-agent') || '';
    const parser = new UAParser(uaString);
    const uaResult = parser.getResult();

    let rawDevice = uaResult.device.type; // 'mobile', 'tablet', undefined
    let deviceType: 'mobile' | 'tablet' | 'desktop' | 'unknown' = 'desktop';
    if (rawDevice === 'mobile') deviceType = 'mobile';
    else if (rawDevice === 'tablet') deviceType = 'tablet';
    else if (!rawDevice && /mobile|iphone|android/i.test(uaString)) deviceType = 'mobile';

    const os = uaResult.os.name ? `${uaResult.os.name} ${uaResult.os.version || ''}`.trim() : 'Unknown';
    const browser = uaResult.browser.name ? `${uaResult.browser.name} ${uaResult.browser.version || ''}`.trim() : 'Unknown';
    const referer = request.headers.get('referer') || 'Direct Scan';
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || request.headers.get('x-real-ip') || '127.0.0.1';

    // Asynchronously log the scan
    recordScan({
      qrCodeId: qr.id,
      deviceType,
      os,
      browser,
      referer,
      userAgent: uaString,
      ip,
    });
  } catch (err) {
    console.error('Failed to log scan:', err);
  }

  // Format destination URL (ensure http/https prefix)
  let destination = qr.targetUrl;
  if (!/^https?:\/\//i.test(destination)) {
    destination = 'https://' + destination;
  }

  return NextResponse.redirect(destination, 302);
}
