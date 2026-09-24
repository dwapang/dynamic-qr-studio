export type QRStatus = 'active' | 'paused' | 'expired';
export type QRType = 'dynamic' | 'direct';

export type DotType = 'square' | 'rounded' | 'dots' | 'classy';
export type CornerSquareType = 'square' | 'rounded' | 'circle';
export type CornerDotType = 'square' | 'rounded' | 'circle';
export type ErrorCorrectionLevel = 'L' | 'M' | 'Q' | 'H';

export interface QRStylingConfig {
  fgColor: string;
  bgColor: string;
  eyeFrameColor?: string;
  eyeBallColor?: string;
  dotType: DotType;
  cornerSquareType: CornerSquareType;
  cornerDotType: CornerDotType;
  logoUrl?: string;
  logoSize?: number; // scale relative to QR (e.g. 0.22)
  errorCorrectionLevel: ErrorCorrectionLevel;
}

export interface QRCodeItem {
  id: string;
  slug: string;
  title: string;
  description?: string;
  targetUrl: string;
  status: QRStatus;
  qrType: QRType;
  createdAt: string;
  updatedAt: string;
  expiresAt?: string | null;
  scanCount: number;
  styling: QRStylingConfig;
}

export interface ScanEvent {
  id: string;
  qrCodeId: string;
  scannedAt: string;
  deviceType: 'mobile' | 'tablet' | 'desktop' | 'unknown';
  os: string;
  browser: string;
  referer: string;
  userAgent: string;
  ip?: string;
}

export interface QRAnalytics {
  totalScans: number;
  uniqueDevices: number;
  scansToday: number;
  timeline: { date: string; count: number }[];
  devices: { name: string; count: number; percentage: number }[];
  operatingSystems: { name: string; count: number }[];
  browsers: { name: string; count: number }[];
  recentScans: ScanEvent[];
}
