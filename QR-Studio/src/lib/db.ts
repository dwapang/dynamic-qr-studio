import fs from 'node:fs';
import path from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import { QRCodeItem, QRStylingConfig, ScanEvent, QRAnalytics } from './types';

const isServerless = Boolean(process.env.NETLIFY || process.env.AWS_LAMBDA_FUNCTION_NAME || process.env.VERCEL);
const DATA_DIR = isServerless ? '/tmp/qr_data' : path.join(process.cwd(), 'data');
if (!fs.existsSync(DATA_DIR)) {
  try {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  } catch (err) {
    console.error('Failed to create DATA_DIR:', err);
  }
}

const DB_PATH = path.join(DATA_DIR, 'qr_generator.db');

// In serverless, copy pre-seeded database from bundled directory to /tmp if not yet present
if (isServerless && !fs.existsSync(DB_PATH)) {
  const bundledDb = path.join(process.cwd(), 'data', 'qr_generator.db');
  if (fs.existsSync(bundledDb)) {
    try {
      fs.copyFileSync(bundledDb, DB_PATH);
    } catch {
      // Fallback: DatabaseSync will create and seed automatically
    }
  }
}

let _db: DatabaseSync | null = null;

function getDb(): DatabaseSync {
  if (!_db) {
    _db = new DatabaseSync(DB_PATH);
    initSchema(_db);
  }
  return _db;
}

function initSchema(db: DatabaseSync) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS qr_codes (
      id TEXT PRIMARY KEY,
      slug TEXT UNIQUE NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      target_url TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'active',
      qr_type TEXT NOT NULL DEFAULT 'dynamic',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      expires_at TEXT,
      styling_json TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS scans (
      id TEXT PRIMARY KEY,
      qr_code_id TEXT NOT NULL,
      scanned_at TEXT NOT NULL,
      device_type TEXT NOT NULL,
      os TEXT NOT NULL,
      browser TEXT NOT NULL,
      referer TEXT,
      user_agent TEXT,
      ip TEXT,
      FOREIGN KEY (qr_code_id) REFERENCES qr_codes(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_qr_slug ON qr_codes(slug);
    CREATE INDEX IF NOT EXISTS idx_scans_qr_time ON scans(qr_code_id, scanned_at);
  `);

  try {
    db.exec(`ALTER TABLE qr_codes ADD COLUMN qr_type TEXT NOT NULL DEFAULT 'dynamic';`);
  } catch (e) {
    // Column already exists
  }

  // Check if seed data is needed
  const countRow = db.prepare('SELECT COUNT(*) as count FROM qr_codes').get() as { count: number } | undefined;
  if (!countRow || countRow.count === 0) {
    seedDatabase(db);
  }
}

function seedDatabase(db: DatabaseSync) {
  const now = new Date();
  const defaultStyling: QRStylingConfig = {
    fgColor: '#0f172a',
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

  const insertQR = db.prepare(`
    INSERT INTO qr_codes (id, slug, title, description, target_url, status, qr_type, created_at, updated_at, expires_at, styling_json)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insertQR.run(
    'qr-sample-1',
    'portfolio-demo',
    'Sample Direct QR',
    'Contoh QR code direct untuk tautan portfolio',
    'https://github.com',
    'active',
    'direct',
    now.toISOString(),
    now.toISOString(),
    null,
    JSON.stringify(defaultStyling)
  );
}

export function getAllQRCodes(): QRCodeItem[] {
  const db = getDb();
  const stmt = db.prepare(`
    SELECT 
      q.id, q.slug, q.title, q.description, q.target_url, q.status, q.qr_type,
      q.created_at, q.updated_at, q.expires_at, q.styling_json,
      COUNT(s.id) as scan_count
    FROM qr_codes q
    LEFT JOIN scans s ON q.id = s.qr_code_id
    GROUP BY q.id
    ORDER BY q.created_at DESC
  `);
  
  const rows = stmt.all() as any[];
  return rows.map(r => ({
    id: r.id,
    slug: r.slug,
    title: r.title,
    description: r.description || '',
    targetUrl: r.target_url,
    status: r.status,
    qrType: (r.qr_type || 'dynamic') as 'dynamic' | 'direct',
    createdAt: r.created_at,
    updatedAt: r.updated_at,
    expiresAt: r.expires_at || null,
    scanCount: Number(r.scan_count || 0),
    styling: JSON.parse(r.styling_json || '{}'),
  }));
}

export function getQRCodeById(id: string): QRCodeItem | null {
  const db = getDb();
  const stmt = db.prepare(`
    SELECT 
      q.id, q.slug, q.title, q.description, q.target_url, q.status, q.qr_type,
      q.created_at, q.updated_at, q.expires_at, q.styling_json,
      COUNT(s.id) as scan_count
    FROM qr_codes q
    LEFT JOIN scans s ON q.id = s.qr_code_id
    WHERE q.id = ?
    GROUP BY q.id
  `);
  const r = stmt.get(id) as any;
  if (!r) return null;
  return {
    id: r.id,
    slug: r.slug,
    title: r.title,
    description: r.description || '',
    targetUrl: r.target_url,
    status: r.status,
    qrType: (r.qr_type || 'dynamic') as 'dynamic' | 'direct',
    createdAt: r.created_at,
    updatedAt: r.updated_at,
    expiresAt: r.expires_at || null,
    scanCount: Number(r.scan_count || 0),
    styling: JSON.parse(r.styling_json || '{}'),
  };
}

export function getQRCodeBySlug(slug: string): QRCodeItem | null {
  const db = getDb();
  const stmt = db.prepare(`
    SELECT 
      q.id, q.slug, q.title, q.description, q.target_url, q.status, q.qr_type,
      q.created_at, q.updated_at, q.expires_at, q.styling_json,
      COUNT(s.id) as scan_count
    FROM qr_codes q
    LEFT JOIN scans s ON q.id = s.qr_code_id
    WHERE LOWER(q.slug) = LOWER(?)
    GROUP BY q.id
  `);
  const r = stmt.get(slug) as any;
  if (!r) return null;
  return {
    id: r.id,
    slug: r.slug,
    title: r.title,
    description: r.description || '',
    targetUrl: r.target_url,
    status: r.status,
    qrType: (r.qr_type || 'dynamic') as 'dynamic' | 'direct',
    createdAt: r.created_at,
    updatedAt: r.updated_at,
    expiresAt: r.expires_at || null,
    scanCount: Number(r.scan_count || 0),
    styling: JSON.parse(r.styling_json || '{}'),
  };
}

export function createQRCode(data: {
  slug: string;
  title: string;
  description?: string;
  targetUrl: string;
  status?: string;
  qrType?: 'dynamic' | 'direct';
  expiresAt?: string | null;
  styling: QRStylingConfig;
}): QRCodeItem {
  const db = getDb();
  const id = 'qr_' + Math.random().toString(36).substring(2, 10);
  const now = new Date().toISOString();

  const stmt = db.prepare(`
    INSERT INTO qr_codes (id, slug, title, description, target_url, status, qr_type, created_at, updated_at, expires_at, styling_json)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  stmt.run(
    id,
    data.slug.trim(),
    data.title.trim(),
    data.description || '',
    data.targetUrl.trim(),
    data.status || 'active',
    data.qrType || 'dynamic',
    now,
    now,
    data.expiresAt || null,
    JSON.stringify(data.styling)
  );

  return getQRCodeById(id)!;
}

export function updateQRCode(
  id: string,
  updates: {
    slug?: string;
    title?: string;
    description?: string;
    targetUrl?: string;
    status?: string;
    qrType?: 'dynamic' | 'direct';
    expiresAt?: string | null;
    styling?: QRStylingConfig;
  }
): QRCodeItem | null {
  const db = getDb();
  const current = getQRCodeById(id);
  if (!current) return null;

  const now = new Date().toISOString();
  const newSlug = updates.slug !== undefined ? updates.slug.trim() : current.slug;
  const newTitle = updates.title !== undefined ? updates.title.trim() : current.title;
  const newDesc = updates.description !== undefined ? updates.description : (current.description || '');
  const newUrl = updates.targetUrl !== undefined ? updates.targetUrl.trim() : current.targetUrl;
  const newStatus = updates.status !== undefined ? updates.status : current.status;
  const newQrType = updates.qrType !== undefined ? updates.qrType : current.qrType;
  const newExpires = updates.expiresAt !== undefined ? updates.expiresAt : current.expiresAt;
  const newStyling = updates.styling !== undefined ? JSON.stringify(updates.styling) : JSON.stringify(current.styling);

  const stmt = db.prepare(`
    UPDATE qr_codes
    SET slug = ?, title = ?, description = ?, target_url = ?, status = ?, qr_type = ?, updated_at = ?, expires_at = ?, styling_json = ?
    WHERE id = ?
  `);

  stmt.run(newSlug, newTitle, newDesc, newUrl, newStatus, newQrType, now, newExpires, newStyling, id);
  return getQRCodeById(id);
}

export function deleteQRCode(id: string): boolean {
  const db = getDb();
  // scans table has foreign key with cascade, but we can also manually clean scans
  db.prepare('DELETE FROM scans WHERE qr_code_id = ?').run(id);
  const stmt = db.prepare('DELETE FROM qr_codes WHERE id = ?');
  stmt.run(id);
  return true;
}

export function recordScan(data: {
  qrCodeId: string;
  deviceType: string;
  os: string;
  browser: string;
  referer?: string;
  userAgent?: string;
  ip?: string;
}): void {
  const db = getDb();
  const id = 'scan_' + Math.random().toString(36).substring(2, 12);
  const now = new Date().toISOString();

  const stmt = db.prepare(`
    INSERT INTO scans (id, qr_code_id, scanned_at, device_type, os, browser, referer, user_agent, ip)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  stmt.run(
    id,
    data.qrCodeId,
    now,
    data.deviceType || 'unknown',
    data.os || 'Unknown',
    data.browser || 'Unknown',
    data.referer || 'Direct',
    data.userAgent || '',
    data.ip || ''
  );
}

export function getQRCodeAnalytics(id: string): QRAnalytics {
  const db = getDb();
  
  // Total scans
  const totalRow = db.prepare('SELECT COUNT(*) as count FROM scans WHERE qr_code_id = ?').get(id) as { count: number };
  const totalScans = Number(totalRow?.count || 0);

  // Scans today
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayRow = db.prepare(`
    SELECT COUNT(*) as count FROM scans 
    WHERE qr_code_id = ? AND scanned_at >= ?
  `).get(id, todayStart.toISOString()) as { count: number };
  const scansToday = Number(todayRow?.count || 0);

  // Unique devices (grouped by IP + User Agent)
  const uniqueRow = db.prepare(`
    SELECT COUNT(DISTINCT(user_agent || ip)) as count 
    FROM scans WHERE qr_code_id = ?
  `).get(id) as { count: number };
  const uniqueDevices = Number(uniqueRow?.count || 0);

  // Timeline (scans by date for last 14 days)
  const timelineRows = db.prepare(`
    SELECT substr(scanned_at, 1, 10) as date, COUNT(*) as count
    FROM scans
    WHERE qr_code_id = ?
    GROUP BY substr(scanned_at, 1, 10)
    ORDER BY date ASC
    LIMIT 30
  `).all(id) as { date: string; count: number }[];

  // Devices
  const deviceRows = db.prepare(`
    SELECT device_type as name, COUNT(*) as count
    FROM scans
    WHERE qr_code_id = ?
    GROUP BY device_type
    ORDER BY count DESC
  `).all(id) as { name: string; count: number }[];

  const devices = deviceRows.map(d => ({
    name: (d.name.charAt(0).toUpperCase() + d.name.slice(1)) || 'Unknown',
    count: Number(d.count),
    percentage: totalScans > 0 ? Math.round((Number(d.count) / totalScans) * 100) : 0,
  }));

  // Operating Systems
  const osRows = db.prepare(`
    SELECT os as name, COUNT(*) as count
    FROM scans
    WHERE qr_code_id = ?
    GROUP BY os
    ORDER BY count DESC
    LIMIT 5
  `).all(id) as { name: string; count: number }[];

  // Browsers
  const browserRows = db.prepare(`
    SELECT browser as name, COUNT(*) as count
    FROM scans
    WHERE qr_code_id = ?
    GROUP BY browser
    ORDER BY count DESC
    LIMIT 5
  `).all(id) as { name: string; count: number }[];

  // Recent scans
  const recentRows = db.prepare(`
    SELECT id, qr_code_id, scanned_at, device_type, os, browser, referer, user_agent, ip
    FROM scans
    WHERE qr_code_id = ?
    ORDER BY scanned_at DESC
    LIMIT 20
  `).all(id) as any[];

  const recentScans: ScanEvent[] = recentRows.map(r => ({
    id: r.id,
    qrCodeId: r.qr_code_id,
    scannedAt: r.scanned_at,
    deviceType: r.device_type,
    os: r.os,
    browser: r.browser,
    referer: r.referer,
    userAgent: r.user_agent,
    ip: r.ip,
  }));

  return {
    totalScans,
    uniqueDevices,
    scansToday,
    timeline: timelineRows.map(r => ({ date: r.date, count: Number(r.count) })),
    devices,
    operatingSystems: osRows.map(r => ({ name: r.name || 'Unknown', count: Number(r.count) })),
    browsers: browserRows.map(r => ({ name: r.name || 'Unknown', count: Number(r.count) })),
    recentScans,
  };
}

export function getGlobalStats() {
  const db = getDb();
  const qrsCount = (db.prepare('SELECT COUNT(*) as c FROM qr_codes').get() as any)?.c || 0;
  const activeCount = (db.prepare("SELECT COUNT(*) as c FROM qr_codes WHERE status = 'active'").get() as any)?.c || 0;
  const totalScans = (db.prepare('SELECT COUNT(*) as c FROM scans').get() as any)?.c || 0;

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayScans = (db.prepare('SELECT COUNT(*) as c FROM scans WHERE scanned_at >= ?').get(todayStart.toISOString()) as any)?.c || 0;

  return {
    totalQRs: Number(qrsCount),
    activeQRs: Number(activeCount),
    totalScans: Number(totalScans),
    todayScans: Number(todayScans),
  };
}
