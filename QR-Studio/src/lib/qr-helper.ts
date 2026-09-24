import { QRCodeItem } from './types';

/**
 * Returns the exact content string encoded into the QR code matrix:
 * 
 * 1. DIRECT (Static) Mode:
 *    - Encodes the destination URL directly (e.g. "https://instagram.com/myaccount").
 *    - When scanned by a phone camera, it immediately opens the destination with ZERO localhost and ZERO server dependency!
 * 
 * 2. DYNAMIC Mode:
 *    - Encodes the redirection link (e.g. "http://10.1.18.32:3000/r/promo" or "https://yourdomain.com/r/promo").
 *    - Enables editing the destination URL later without re-printing + real-time scan analytics tracking.
 */
export function getQREncodedValue(qr: QRCodeItem, baseUrl: string): string {
  if (qr.qrType === 'direct') {
    let url = (qr.targetUrl || '').trim();
    if (!/^https?:\/\//i.test(url) && !url.startsWith('mailto:') && !url.startsWith('tel:') && !url.startsWith('WIFI:')) {
      url = 'https://' + url;
    }
    return url;
  }

  const cleanBase = (baseUrl || 'http://localhost:3000').replace(/\/+$/, '');
  return `${cleanBase}/r/${qr.slug}`;
}
