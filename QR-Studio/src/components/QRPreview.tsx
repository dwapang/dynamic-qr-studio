'use client';

import React, { useMemo } from 'react';
import { QRStylingConfig } from '@/lib/types';
import { generateQRCodeSVG } from '@/lib/qr-renderer';

interface QRPreviewProps {
  value: string;
  styling: QRStylingConfig;
  size?: number;
  className?: string;
  id?: string;
}

export function QRPreview({ value, styling, size = 260, className = '', id }: QRPreviewProps) {
  const svgString = useMemo(() => {
    try {
      return generateQRCodeSVG(value, styling, size);
    } catch (e) {
      console.error('Error generating QR SVG:', e);
      return '';
    }
  }, [value, styling, size]);

  if (!svgString) {
    return (
      <div
        style={{ width: size, height: size }}
        className={`flex items-center justify-center bg-slate-100 rounded-2xl text-slate-400 text-xs ${className}`}
      >
        Generating QR...
      </div>
    );
  }

  return (
    <div
      id={id}
      className={`inline-flex items-center justify-center select-none overflow-hidden transition-all duration-300 ${className}`}
      dangerouslySetInnerHTML={{ __html: svgString }}
    />
  );
}

/**
 * Utility to download the QR code as high-res PNG or vector SVG
 */
export async function downloadQRCode(
  value: string,
  styling: QRStylingConfig,
  format: 'png' | 'svg',
  filename: string = 'dynamic-qr-code',
  exportSize: number = 1024
): Promise<void> {
  const svgMarkup = generateQRCodeSVG(value, styling, exportSize);

  if (format === 'svg') {
    const blob = new Blob([svgMarkup], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${filename}.svg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    return;
  }

  // Convert SVG to PNG via offscreen canvas
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    canvas.width = exportSize;
    canvas.height = exportSize;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      reject(new Error('Canvas context not available'));
      return;
    }

    const img = new Image();
    const svgBlob = new Blob([svgMarkup], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);

    img.onload = () => {
      ctx.drawImage(img, 0, 0, exportSize, exportSize);
      URL.revokeObjectURL(url);

      canvas.toBlob((blob) => {
        if (!blob) {
          reject(new Error('Failed to create PNG blob'));
          return;
        }
        const pngUrl = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = pngUrl;
        link.download = `${filename}-${exportSize}px.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(pngUrl);
        resolve();
      }, 'image/png');
    };

    img.onerror = (e) => {
      URL.revokeObjectURL(url);
      reject(e);
    };

    img.src = url;
  });
}

/**
 * Utility to copy QR PNG image directly to system clipboard
 */
export async function copyQRCodeToClipboard(
  value: string,
  styling: QRStylingConfig,
  exportSize: number = 1024
): Promise<boolean> {
  try {
    const svgMarkup = generateQRCodeSVG(value, styling, exportSize);
    const canvas = document.createElement('canvas');
    canvas.width = exportSize;
    canvas.height = exportSize;
    const ctx = canvas.getContext('2d');
    if (!ctx) return false;

    const img = new Image();
    const svgBlob = new Blob([svgMarkup], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);

    await new Promise<void>((resolve, reject) => {
      img.onload = () => {
        ctx.drawImage(img, 0, 0, exportSize, exportSize);
        URL.revokeObjectURL(url);
        resolve();
      };
      img.onerror = (e) => {
        URL.revokeObjectURL(url);
        reject(e);
      };
      img.src = url;
    });

    return new Promise((resolve) => {
      canvas.toBlob(async (blob) => {
        if (!blob) {
          resolve(false);
          return;
        }
        try {
          await navigator.clipboard.write([
            new ClipboardItem({ 'image/png': blob }),
          ]);
          resolve(true);
        } catch {
          resolve(false);
        }
      }, 'image/png');
    });
  } catch (err) {
    console.error('Clipboard copy error:', err);
    return false;
  }
}
