import QRCode from 'qrcode';
import { QRStylingConfig } from './types';

export interface RenderOptions {
  value: string;
  size?: number; // Output pixel size (e.g. 300, 1024)
  styling: QRStylingConfig;
}

export function isFinderPattern(r: number, c: number, moduleCount: number): boolean {
  // Top-Left (7x7)
  if (r < 7 && c < 7) return true;
  // Top-Right (7x7)
  if (r < 7 && c >= moduleCount - 7) return true;
  // Bottom-Left (7x7)
  if (r >= moduleCount - 7 && c < 7) return true;
  return false;
}

export function isInCenterLogoArea(r: number, c: number, moduleCount: number, logoRatio: number = 0.22): boolean {
  const center = moduleCount / 2;
  const radius = (moduleCount * logoRatio + 1.2) / 2;
  return Math.abs(r - center + 0.5) <= radius && Math.abs(c - center + 0.5) <= radius;
}

/**
 * Generates an SVG string representation of the styled QR Code
 */
export function generateQRCodeSVG(value: string, styling: QRStylingConfig, size: number = 320): string {
  const qr = QRCode.create(value, {
    errorCorrectionLevel: styling.errorCorrectionLevel || 'H',
  });

  const moduleCount = qr.modules.size;
  const margin = 2; // quiet zone in module units
  const totalGrid = moduleCount + margin * 2;
  const unit = size / totalGrid;

  const fgColor = styling.fgColor || '#000000';
  const bgColor = styling.bgColor || '#ffffff';
  const eyeFrameColor = styling.eyeFrameColor || fgColor;
  const eyeBallColor = styling.eyeBallColor || eyeFrameColor;
  const dotType = styling.dotType || 'square';
  const cornerSquareType = styling.cornerSquareType || 'square';
  const cornerDotType = styling.cornerDotType || 'square';
  const hasLogo = Boolean(styling.logoUrl && styling.logoUrl.trim().length > 0);
  const logoRatio = styling.logoSize || 0.22;

  let bodySvgElements = '';

  // 1. Render data modules (excluding finder patterns and logo area)
  for (let r = 0; r < moduleCount; r++) {
    for (let c = 0; c < moduleCount; c++) {
      if (!qr.modules.get(r, c)) continue;

      if (isFinderPattern(r, c, moduleCount)) continue;

      if (hasLogo && isInCenterLogoArea(r, c, moduleCount, logoRatio)) continue;

      const x = (c + margin) * unit;
      const y = (r + margin) * unit;

      if (dotType === 'dots') {
        const cx = x + unit / 2;
        const cy = y + unit / 2;
        const radius = unit * 0.42;
        bodySvgElements += `<circle cx="${cx.toFixed(2)}" cy="${cy.toFixed(2)}" r="${radius.toFixed(2)}" fill="${fgColor}" />`;
      } else if (dotType === 'rounded') {
        const radius = unit * 0.3;
        bodySvgElements += `<rect x="${x.toFixed(2)}" y="${y.toFixed(2)}" width="${unit.toFixed(2)}" height="${unit.toFixed(2)}" rx="${radius.toFixed(2)}" ry="${radius.toFixed(2)}" fill="${fgColor}" />`;
      } else if (dotType === 'classy') {
        const radius = unit * 0.45;
        bodySvgElements += `<rect x="${x.toFixed(2)}" y="${y.toFixed(2)}" width="${unit.toFixed(2)}" height="${unit.toFixed(2)}" rx="${radius.toFixed(2)}" ry="${radius.toFixed(2)}" fill="${fgColor}" />`;
      } else {
        // Standard square
        bodySvgElements += `<rect x="${x.toFixed(2)}" y="${y.toFixed(2)}" width="${unit.toFixed(2)}" height="${unit.toFixed(2)}" fill="${fgColor}" />`;
      }
    }
  }

  // 2. Render 3 Finder Patterns (Corners)
  const finderPositions = [
    { row: 0, col: 0 }, // Top-Left
    { row: 0, col: moduleCount - 7 }, // Top-Right
    { row: moduleCount - 7, col: 0 }, // Bottom-Left
  ];

  let finderSvgElements = '';

  for (const pos of finderPositions) {
    const fx = (pos.col + margin) * unit;
    const fy = (pos.row + margin) * unit;
    const outerSize = 7 * unit;
    const innerSize = 5 * unit;
    const centerSize = 3 * unit;
    const innerOffset = unit;
    const centerOffset = 2 * unit;

    // Corner Square (Outer Frame)
    if (cornerSquareType === 'circle') {
      const cx = fx + outerSize / 2;
      const cy = fy + outerSize / 2;
      finderSvgElements += `
        <circle cx="${cx.toFixed(2)}" cy="${cy.toFixed(2)}" r="${(outerSize / 2).toFixed(2)}" fill="${eyeFrameColor}" />
        <circle cx="${cx.toFixed(2)}" cy="${cy.toFixed(2)}" r="${(innerSize / 2).toFixed(2)}" fill="${bgColor}" />
      `;
    } else if (cornerSquareType === 'rounded') {
      const rx = outerSize * 0.25;
      const innerRx = innerSize * 0.22;
      finderSvgElements += `
        <rect x="${fx.toFixed(2)}" y="${fy.toFixed(2)}" width="${outerSize.toFixed(2)}" height="${outerSize.toFixed(2)}" rx="${rx.toFixed(2)}" ry="${rx.toFixed(2)}" fill="${eyeFrameColor}" />
        <rect x="${(fx + innerOffset).toFixed(2)}" y="${(fy + innerOffset).toFixed(2)}" width="${innerSize.toFixed(2)}" height="${innerSize.toFixed(2)}" rx="${innerRx.toFixed(2)}" ry="${innerRx.toFixed(2)}" fill="${bgColor}" />
      `;
    } else {
      // Standard square
      finderSvgElements += `
        <rect x="${fx.toFixed(2)}" y="${fy.toFixed(2)}" width="${outerSize.toFixed(2)}" height="${outerSize.toFixed(2)}" fill="${eyeFrameColor}" />
        <rect x="${(fx + innerOffset).toFixed(2)}" y="${(fy + innerOffset).toFixed(2)}" width="${innerSize.toFixed(2)}" height="${innerSize.toFixed(2)}" fill="${bgColor}" />
      `;
    }

    // Corner Dot (Eye ball in center)
    const bx = fx + centerOffset;
    const by = fy + centerOffset;

    if (cornerDotType === 'circle') {
      const bcx = bx + centerSize / 2;
      const bcy = by + centerSize / 2;
      finderSvgElements += `<circle cx="${bcx.toFixed(2)}" cy="${bcy.toFixed(2)}" r="${(centerSize / 2).toFixed(2)}" fill="${eyeBallColor}" />`;
    } else if (cornerDotType === 'rounded') {
      const brx = centerSize * 0.3;
      finderSvgElements += `<rect x="${bx.toFixed(2)}" y="${by.toFixed(2)}" width="${centerSize.toFixed(2)}" height="${centerSize.toFixed(2)}" rx="${brx.toFixed(2)}" ry="${brx.toFixed(2)}" fill="${eyeBallColor}" />`;
    } else {
      finderSvgElements += `<rect x="${bx.toFixed(2)}" y="${by.toFixed(2)}" width="${centerSize.toFixed(2)}" height="${centerSize.toFixed(2)}" fill="${eyeBallColor}" />`;
    }
  }

  // 3. Center Logo (if present)
  let logoSvgElements = '';
  if (hasLogo && styling.logoUrl && styling.logoUrl.trim().length > 0) {
    const qrPixelWidth = moduleCount * unit;
    const qrPixelOriginX = margin * unit;
    const qrPixelOriginY = margin * unit;
    const logoPxSize = qrPixelWidth * logoRatio;
    const logoX = qrPixelOriginX + (qrPixelWidth - logoPxSize) / 2;
    const logoY = qrPixelOriginY + (qrPixelWidth - logoPxSize) / 2;
    const badgePadding = unit * 0.7;
    const badgeSize = logoPxSize + badgePadding * 2;
    const badgeX = logoX - badgePadding;
    const badgeY = logoY - badgePadding;
    const badgeRadius = badgeSize * 0.24;

    const safeUrl = styling.logoUrl.trim().replace(/"/g, '&quot;');

    logoSvgElements = `
      <g id="qr-logo-container">
        <!-- Badge background behind logo -->
        <rect x="${badgeX.toFixed(2)}" y="${badgeY.toFixed(2)}" width="${badgeSize.toFixed(2)}" height="${badgeSize.toFixed(2)}" rx="${badgeRadius.toFixed(2)}" ry="${badgeRadius.toFixed(2)}" fill="${bgColor}" stroke="${eyeFrameColor || '#e2e8f0'}" stroke-width="1.5" />
        <!-- Embedded logo image -->
        <image href="${safeUrl}" xlink:href="${safeUrl}" x="${logoX.toFixed(2)}" y="${logoY.toFixed(2)}" width="${logoPxSize.toFixed(2)}" height="${logoPxSize.toFixed(2)}" preserveAspectRatio="xMidYMid meet" />
      </g>
    `;
  }

  const svgContent = `
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}" shape-rendering="geometricPrecision">
  <rect width="${size}" height="${size}" fill="${bgColor}" />
  <g id="qr-body">
    ${bodySvgElements}
  </g>
  <g id="qr-finders">
    ${finderSvgElements}
  </g>
  ${logoSvgElements}
</svg>`.trim();

  return svgContent;
}
