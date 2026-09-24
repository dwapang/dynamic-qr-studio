'use client';

import React, { useState, useEffect, useRef } from 'react';
import { QRCodeItem, QRStylingConfig, DotType, CornerSquareType, CornerDotType, ErrorCorrectionLevel } from '@/lib/types';
import { QRPreview, downloadQRCode, copyQRCodeToClipboard } from './QRPreview';
import { getQREncodedValue } from '@/lib/qr-helper';
import { 
  X, Download, Copy, Check, Palette, Sparkles, Image as ImageIcon, 
  RefreshCw, Sliders, ExternalLink, Save, Layers, ShieldCheck, Zap, Upload, Trash2, Globe
} from 'lucide-react';

interface QRDesignerProps {
  qrCode: QRCodeItem;
  origin: string;
  isOpen: boolean;
  onClose: () => void;
  onSaved: (updatedQR: QRCodeItem) => void;
}

const COLOR_PRESETS = [
  { name: 'Midnight', fg: '#0f172a', bg: '#ffffff', eye: '#3b82f6' },
  { name: 'Royal Indigo', fg: '#1e1b4b', bg: '#ffffff', eye: '#4f46e5' },
  { name: 'Emerald Forest', fg: '#064e3b', bg: '#ffffff', eye: '#059669' },
  { name: 'Crimson Velvet', fg: '#881337', bg: '#ffffff', eye: '#e11d48' },
  { name: 'Amethyst Purple', fg: '#581c87', bg: '#ffffff', eye: '#9333ea' },
  { name: 'Monochrome Dark', fg: '#000000', bg: '#ffffff', eye: '#000000' },
  { name: 'Dark Slate Inverted', fg: '#f8fafc', bg: '#0f172a', eye: '#38bdf8' },
  { name: 'Oceanic Teal', fg: '#134e4a', bg: '#ffffff', eye: '#0d9488' },
  { name: 'Burnt Sienna', fg: '#78350f', bg: '#ffffff', eye: '#d97706' },
  { name: 'Rose Garden', fg: '#4c0519', bg: '#fff1f2', eye: '#e11d48' },
  { name: 'Electric Blue', fg: '#1e3a5f', bg: '#ffffff', eye: '#0284c7' },
  { name: 'Olive Military', fg: '#365314', bg: '#fefce8', eye: '#65a30d' },
  { name: 'Slate Carbon', fg: '#1e293b', bg: '#f1f5f9', eye: '#475569' },
];

const LOGO_PRESETS = [
  { 
    name: 'Link', 
    url: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0OCIgaGVpZ2h0PSI0OCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IiM0ZjQ2ZTUiIHN0cm9rZS13aWR0aD0iMi41IiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiPjxwYXRoIGQ9Ik0xMCAxM2E1IDUgMCAwIDAgNy41NC41NGwzLTNhNSA1IDAgMCAwLTcuMDctNy4wN2wtMS43MiAxLjcxIi8+PHBhdGggZD0iTTE0IDExYTUgNSAwIDAgMC03LjU0LS41NGwtMyAzYTUgNSAwIDAgMCA3LjA3IDcuMDdsMS43MS0xLjcxIi8+PC9zdmc+' 
  },
  { 
    name: 'Globe', 
    url: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0OCIgaGVpZ2h0PSI0OCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IiMyNTYzZWIiIHN0cm9rZS13aWR0aD0iMi41IiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiPjxjaXJjbGUgY3g9IjEyIiBjeT0iMTIiIHI9IjEwIi8+PHBhdGggZD0iTTEyIDJhMTQuNSAxNC41IDAgMCAwIDAgMjAgMTQuNSAxNC41IDAgMCAwIDAtMjAiLz48cGF0aCBkPSJNMiAxMmgyMCIvPjwvc3ZnPg==' 
  },
  { 
    name: 'Sparkles', 
    url: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0OCIgaGVpZ2h0PSI0OCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IiM5MzMzZWEiIHN0cm9rZS13aWR0aD0iMi41IiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiPjxwYXRoIGQ9Im0xMiAzLTEuOTEyIDUuODEzYTIgMiAwIDAgMS0xLjI3NSAxLjI3NUwzIDEybDUuODEzIDEuOTEyYTIgMiAwIDAgMSAxLjI3NSAxLjI3NUwxMiAyMWwxLjkxMi01LjgxM2EyIDIgMCAwIDEgMS4yNzUtMS4yNzVMMjEgMTJsLTUuODEzLTEuOTEyYTIgMiAwIDAgMS0xLjI3NS0xLjI3NUwxMiAzWiIvPjwvc3ZnPg==' 
  },
  { 
    name: 'Heart', 
    url: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0OCIgaGVpZ2h0PSI0OCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IiNlMTFkNDgiIHN0cm9rZS13aWR0aD0iMi41IiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiPjxwYXRoIGQ9Ik0xOSAxNGMxLjQ5LTEuNDYgMy0zLjIxIDMtNS41QTUuNSA1LjUgMCAwIDAgMTYuNSAzYy0xLjc2IDAtMyAuNS00LjUgMi0xLjUtMS41LTIuNzQtMi00LjUtMkE1LjUgNS41IDAgMCAwIDIgOC41YzAgMi4zIDEuNSA0LjA1IDMgNS41bDcgN1oiLz48L3N2Zz4=' 
  },
  { 
    name: 'WiFi', 
    url: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0OCIgaGVpZ2h0PSI0OCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IiMwNTk2NjkiIHN0cm9rZS13aWR0aD0iMi41IiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiPjxwYXRoIGQ9Ik0xMiAyMGguMDEiLz48cGF0aCBkPSJNMiA4LjgyYTE1IDE1IDAgMCAxIDIwIDAiLz48cGF0aCBkPSJNNSAxMi44NTlhMTAgMTAgMCAwIDEgMTQgMCIvPjxwYXRoIGQ9Ik04LjUgMTYuNDI5YTUgNSAwIDAgMSA3IDAiLz48L3N2Zz4=' 
  },
];

export function QRDesigner({ qrCode, origin, isOpen, onClose, onSaved }: QRDesignerProps) {
  const [styling, setStyling] = useState<QRStylingConfig>(qrCode.styling);
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const [exportSize, setExportSize] = useState<number>(1024);
  const [downloading, setDownloading] = useState(false);
  const [activeTab, setActiveTab] = useState<'style' | 'colors' | 'logo'>('style');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (qrCode) {
      setStyling(qrCode.styling);
    }
  }, [qrCode]);

  if (!isOpen) return null;

  const encodedValue = getQREncodedValue(qrCode, origin);
  const isDirect = qrCode.qrType === 'direct';

  const handleSave = async () => {
    try {
      setSaving(true);
      const res = await fetch(`/api/qr/${qrCode.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ styling }),
      });
      const data = await res.json();
      if (data.success) {
        onSaved(data.data);
        onClose();
      } else {
        alert(data.error || 'Failed to save styling');
      }
    } catch (e: any) {
      alert(e.message || 'Error saving changes');
    } finally {
      setSaving(false);
    }
  };

  const handleCopyImage = async () => {
    const ok = await copyQRCodeToClipboard(encodedValue, styling, exportSize);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } else {
      alert('Could not copy image to clipboard in this browser.');
    }
  };

  const handleDownload = async (format: 'png' | 'svg') => {
    try {
      setDownloading(true);
      await downloadQRCode(encodedValue, styling, format, `${qrCode.slug}-qr`, exportSize);
    } catch (err: any) {
      console.error(err);
      alert('Failed to download QR: ' + err.message);
    } finally {
      setDownloading(false);
    }
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert('Ukuran file logo maksimal 2MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      if (base64) {
        setStyling((prev) => ({
          ...prev,
          logoUrl: base64,
          errorCorrectionLevel: 'H', // Optimal for logos
        }));
      }
    };
    reader.onerror = () => {
      alert('Gagal membaca file gambar');
    };
    reader.readAsDataURL(file);
    // Reset file input so user can pick same file or change
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden flex flex-col max-h-[92vh] transition-colors">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">Kustomisasi QR</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Desain untuk <span className="font-semibold text-slate-700 dark:text-slate-200">{qrCode.title}</span></p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body (Split Preview & Controls) */}
        <div className="flex-1 overflow-y-auto grid grid-cols-1 lg:grid-cols-12 gap-0">
          {/* Left Column: Live QR Preview & Actions */}
          <div className="lg:col-span-5 p-6 bg-slate-50/80 dark:bg-slate-950/80 border-b lg:border-b-0 lg:border-r border-slate-100 dark:border-slate-800 flex flex-col items-center justify-center gap-5">
            {/* The QR Canvas Card */}
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 shadow-xl shadow-slate-200/50 dark:shadow-black/40 border border-slate-100 dark:border-slate-800 flex flex-col items-center justify-center">
              <QRPreview value={encodedValue} styling={styling} size={240} className="rounded-2xl" />
              <div className="mt-4 text-center space-y-1">
                <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full inline-flex items-center gap-1 ${
                  isDirect 
                    ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800' 
                    : 'bg-indigo-100 dark:bg-indigo-950/60 text-indigo-800 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800'
                }`}>
                  {isDirect ? <Zap className="w-2.5 h-2.5" /> : <Globe className="w-2.5 h-2.5" />}
                  {isDirect ? 'Direct (Static URL)' : 'Dynamic (Redirect Link)'}
                </span>
                <div>
                  <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full border border-slate-200/60 dark:border-slate-700/60 inline-flex items-center gap-1.5 max-w-[240px] truncate" title={encodedValue}>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    {encodedValue}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Export Controls */}
            <div className="w-full max-w-xs space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400 px-1">
                <span>Export Resolution:</span>
                <select
                  value={exportSize}
                  onChange={(e) => setExportSize(Number(e.target.value))}
                  className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 text-xs font-medium text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value={512}>512 x 512 px (Web)</option>
                  <option value={1024}>1024 x 1024 px (HD)</option>
                  <option value={2048}>2048 x 2048 px (Print)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  disabled={downloading}
                  onClick={() => handleDownload('png')}
                  className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-xs shadow-sm transition"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>PNG Export</span>
                </button>
                <button
                  type="button"
                  disabled={downloading}
                  onClick={() => handleDownload('svg')}
                  className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-slate-800 dark:bg-slate-700 hover:bg-slate-900 dark:hover:bg-slate-600 text-white font-medium text-xs shadow-sm transition"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Vector SVG</span>
                </button>
              </div>

              <button
                type="button"
                onClick={handleCopyImage}
                className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/60 text-slate-700 dark:text-slate-200 font-medium text-xs shadow-sm transition"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied Image to Clipboard!' : 'Copy Image to Clipboard'}</span>
              </button>
            </div>
          </div>

          {/* Right Column: Customization Controls */}
          <div className="lg:col-span-7 p-6 flex flex-col bg-white dark:bg-slate-900">
            {/* Tabs */}
            <div className="flex border-b border-slate-200 dark:border-slate-800 gap-6 mb-6">
              <button
                type="button"
                onClick={() => setActiveTab('style')}
                className={`pb-3 text-sm font-semibold flex items-center gap-2 border-b-2 transition ${
                  activeTab === 'style'
                    ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                    : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                <Layers className="w-4 h-4" /> Shapes & Patterns
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('colors')}
                className={`pb-3 text-sm font-semibold flex items-center gap-2 border-b-2 transition ${
                  activeTab === 'colors'
                    ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                    : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                <Palette className="w-4 h-4" /> Colors
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('logo')}
                className={`pb-3 text-sm font-semibold flex items-center gap-2 border-b-2 transition ${
                  activeTab === 'logo'
                    ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                    : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                <ImageIcon className="w-4 h-4" /> Center Logo / Icon
              </button>
            </div>

            {/* Tab: Shapes & Patterns */}
            {activeTab === 'style' && (
              <div className="space-y-6">
                {/* Dot Type */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                    Body Dot Style
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    {[
                      { id: 'square', label: 'Classic Square' },
                      { id: 'rounded', label: 'Rounded' },
                      { id: 'dots', label: 'Circles' },
                      { id: 'classy', label: 'Classy Smooth' },
                    ].map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setStyling((prev) => ({ ...prev, dotType: item.id as DotType }))}
                        className={`p-3 rounded-xl border text-xs font-semibold text-center transition ${
                          styling.dotType === item.id
                            ? 'border-indigo-600 bg-indigo-50/60 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 ring-2 ring-indigo-500/20 shadow-sm'
                            : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800'
                        }`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Corner Square (Eye Frame) */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                    Corner Eye Frame
                  </label>
                  <div className="grid grid-cols-3 gap-2.5">
                    {[
                      { id: 'square', label: 'Square' },
                      { id: 'rounded', label: 'Soft Rounded' },
                      { id: 'circle', label: 'Circular' },
                    ].map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setStyling((prev) => ({ ...prev, cornerSquareType: item.id as CornerSquareType }))}
                        className={`p-3 rounded-xl border text-xs font-semibold text-center transition ${
                          styling.cornerSquareType === item.id
                            ? 'border-indigo-600 bg-indigo-50/60 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 ring-2 ring-indigo-500/20 shadow-sm'
                            : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800'
                        }`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Corner Dot (Eye Center) */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                    Corner Eye Center Dot
                  </label>
                  <div className="grid grid-cols-3 gap-2.5">
                    {[
                      { id: 'square', label: 'Square' },
                      { id: 'rounded', label: 'Rounded' },
                      { id: 'circle', label: 'Circle' },
                    ].map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setStyling((prev) => ({ ...prev, cornerDotType: item.id as CornerDotType }))}
                        className={`p-3 rounded-xl border text-xs font-semibold text-center transition ${
                          styling.cornerDotType === item.id
                            ? 'border-indigo-600 bg-indigo-50/60 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 ring-2 ring-indigo-500/20 shadow-sm'
                            : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800'
                        }`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Error Correction Level */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1 flex items-center justify-between">
                    <span>Error Correction Level</span>
                    <span className="text-[11px] text-slate-400 font-normal">Level H is recommended when using logos</span>
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { id: 'L', label: 'Low (7%)' },
                      { id: 'M', label: 'Med (15%)' },
                      { id: 'Q', label: 'Quart (25%)' },
                      { id: 'H', label: 'High (30%)' },
                    ].map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setStyling((prev) => ({ ...prev, errorCorrectionLevel: item.id as ErrorCorrectionLevel }))}
                        className={`p-2.5 rounded-xl border text-xs font-medium text-center transition ${
                          styling.errorCorrectionLevel === item.id
                            ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-bold'
                            : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-600'
                        }`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Tab: Colors */}
            {activeTab === 'colors' && (
              <div className="space-y-6">
                {/* Presets */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                    Color Themes
                  </label>
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                    {COLOR_PRESETS.map((preset) => (
                      <button
                        key={preset.name}
                        type="button"
                        onClick={() =>
                          setStyling((prev) => ({
                            ...prev,
                            fgColor: preset.fg,
                            bgColor: preset.bg,
                            eyeFrameColor: preset.eye,
                            eyeBallColor: preset.eye,
                          }))
                        }
                        className="flex items-center gap-2.5 p-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-indigo-400 bg-white dark:bg-slate-800 text-left transition group"
                      >
                        <div className="flex -space-x-1">
                          <span
                            className="w-5 h-5 rounded-full border border-slate-200 dark:border-slate-600"
                            style={{ backgroundColor: preset.fg }}
                          />
                          <span
                            className="w-5 h-5 rounded-full border border-slate-200 dark:border-slate-600"
                            style={{ backgroundColor: preset.eye }}
                          />
                        </div>
                        <span className="text-xs font-medium text-slate-700 dark:text-slate-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 truncate">
                          {preset.name}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Custom Pickers */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                      Foreground Pattern Color
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={styling.fgColor}
                        onChange={(e) => setStyling((prev) => ({ ...prev, fgColor: e.target.value }))}
                        className="w-10 h-10 rounded-xl cursor-pointer border border-slate-200 dark:border-slate-700 bg-transparent p-0.5"
                      />
                      <input
                        type="text"
                        value={styling.fgColor}
                        onChange={(e) => setStyling((prev) => ({ ...prev, fgColor: e.target.value }))}
                        className="flex-1 font-mono text-xs uppercase px-3 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-xl focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                      Background Color
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={styling.bgColor}
                        onChange={(e) => setStyling((prev) => ({ ...prev, bgColor: e.target.value }))}
                        className="w-10 h-10 rounded-xl cursor-pointer border border-slate-200 dark:border-slate-700 bg-transparent p-0.5"
                      />
                      <input
                        type="text"
                        value={styling.bgColor}
                        onChange={(e) => setStyling((prev) => ({ ...prev, bgColor: e.target.value }))}
                        className="flex-1 font-mono text-xs uppercase px-3 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-xl focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                      Eye Outer Frame Color
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={styling.eyeFrameColor || styling.fgColor}
                        onChange={(e) => setStyling((prev) => ({ ...prev, eyeFrameColor: e.target.value }))}
                        className="w-10 h-10 rounded-xl cursor-pointer border border-slate-200 dark:border-slate-700 bg-transparent p-0.5"
                      />
                      <input
                        type="text"
                        value={styling.eyeFrameColor || styling.fgColor}
                        onChange={(e) => setStyling((prev) => ({ ...prev, eyeFrameColor: e.target.value }))}
                        className="flex-1 font-mono text-xs uppercase px-3 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-xl focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                      Eye Center Dot Color
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={styling.eyeBallColor || styling.eyeFrameColor || styling.fgColor}
                        onChange={(e) => setStyling((prev) => ({ ...prev, eyeBallColor: e.target.value }))}
                        className="w-10 h-10 rounded-xl cursor-pointer border border-slate-200 dark:border-slate-700 bg-transparent p-0.5"
                      />
                      <input
                        type="text"
                        value={styling.eyeBallColor || styling.eyeFrameColor || styling.fgColor}
                        onChange={(e) => setStyling((prev) => ({ ...prev, eyeBallColor: e.target.value }))}
                        className="flex-1 font-mono text-xs uppercase px-3 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-xl focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Tab: Logo */}
            {activeTab === 'logo' && (
              <div className="space-y-6">
                {/* Active Logo Display if set */}
                {styling.logoUrl && (
                  <div className="p-3.5 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/50 border border-indigo-200/80 dark:border-indigo-800/80 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-white dark:bg-slate-800 border border-indigo-200 dark:border-indigo-800 p-2 flex items-center justify-center shadow-sm">
                        <img src={styling.logoUrl} alt="Active logo" className="max-w-full max-h-full object-contain" />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-slate-800 dark:text-slate-100 block">Logo Aktif Terpasang</span>
                        <span className="text-[11px] text-slate-500 dark:text-slate-400 block">Error Correction Level otomatis diset ke High (30%)</span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setStyling((prev) => ({ ...prev, logoUrl: '' }))}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold text-rose-600 dark:text-rose-400 bg-white dark:bg-slate-800 hover:bg-rose-50 dark:hover:bg-rose-950/60 border border-rose-200 dark:border-rose-900 transition"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Hapus Logo
                    </button>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                    Preset Center Icons (Pilih salah satu)
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                    {LOGO_PRESETS.map((preset) => (
                      <button
                        key={preset.name}
                        type="button"
                        onClick={() =>
                          setStyling((prev) => ({
                            ...prev,
                            logoUrl: preset.url,
                            errorCorrectionLevel: 'H',
                          }))
                        }
                        className={`flex items-center gap-2.5 p-3 rounded-xl border transition ${
                          styling.logoUrl === preset.url
                            ? 'border-indigo-600 bg-indigo-50/70 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 ring-2 ring-indigo-500/20'
                            : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-600'
                        }`}
                      >
                        <div className="w-6 h-6 flex items-center justify-center shrink-0">
                          <img src={preset.url} alt={preset.name} className="w-5 h-5 object-contain" />
                        </div>
                        <span className="text-xs font-semibold truncate">{preset.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Custom Logo Upload */}
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                    Atau Upload Custom Logo / Gambar Sendiri
                  </label>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="inline-flex items-center gap-2 px-4 py-2.5 border border-dashed border-indigo-400 dark:border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/40 hover:bg-indigo-50 dark:hover:bg-indigo-900/50 rounded-2xl text-xs font-semibold text-indigo-700 dark:text-indigo-300 transition shadow-sm"
                    >
                      <Upload className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                      <span>Pilih File Gambar (PNG / SVG / JPG)</span>
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      className="hidden"
                    />
                    <span className="text-[11px] text-slate-400">Maks. 2MB</span>
                  </div>
                </div>

                {/* Logo Size Slider */}
                {styling.logoUrl && (
                  <div className="pt-2">
                    <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400 mb-1.5">
                      <span className="font-semibold">Logo Scale</span>
                      <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">{Math.round((styling.logoSize || 0.22) * 100)}% dari QR</span>
                    </div>
                    <input
                      type="range"
                      min={0.15}
                      max={0.28}
                      step={0.01}
                      value={styling.logoSize || 0.22}
                      onChange={(e) =>
                        setStyling((prev) => ({ ...prev, logoSize: parseFloat(e.target.value) }))
                      }
                      className="w-full accent-indigo-600 dark:accent-indigo-500"
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between">
          <button
            type="button"
            onClick={() => setStyling(qrCode.styling)}
            className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 font-medium transition"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Reset to saved style
          </button>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={saving}
              onClick={handleSave}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-semibold text-xs shadow-md shadow-indigo-600/20 transition disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Saving...' : 'Save Design'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
