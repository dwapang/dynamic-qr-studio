'use client';

import React, { useState } from 'react';
import { QRCodeItem, QRStylingConfig } from '@/lib/types';
import { QRPreview } from './QRPreview';
import { X, Sparkles, Link as LinkIcon, Globe, AlertCircle, ArrowRight, Zap } from 'lucide-react';

interface CreateQRModalProps {
  origin: string;
  isOpen: boolean;
  onClose: () => void;
  onCreated: (newQR: QRCodeItem) => void;
}

const INITIAL_STYLING: QRStylingConfig = {
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

export function CreateQRModal({ origin, isOpen, onClose, onCreated }: CreateQRModalProps) {
  // Direct is now the default option requested by user
  const [qrType, setQrType] = useState<'dynamic' | 'direct'>('direct');
  const [title, setTitle] = useState('');
  const [targetUrl, setTargetUrl] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [expiresAt, setExpiresAt] = useState('');
  const [styling, setStyling] = useState<QRStylingConfig>(INITIAL_STYLING);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const previewSlug = slug.trim() || 'demo-link';
  const previewValue = qrType === 'direct' 
    ? (targetUrl.trim() || 'https://example.com')
    : `${origin}/r/${previewSlug}`;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!title.trim()) {
      setError('Please provide a name/title for your QR Code');
      return;
    }

    if (!targetUrl.trim()) {
      setError('Please provide a destination target URL');
      return;
    }

    try {
      setLoading(true);
      const res = await fetch('/api/qr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          targetUrl,
          qrType,
          slug: qrType === 'dynamic' ? (slug.trim() || undefined) : undefined,
          description,
          expiresAt: expiresAt ? new Date(expiresAt).toISOString() : null,
          styling,
        }),
      });

      const json = await res.json();
      if (!json.success) {
        setError(json.error || 'Failed to create QR code');
        return;
      }

      onCreated(json.data);
      // Reset form
      setTitle('');
      setTargetUrl('');
      setSlug('');
      setDescription('');
      setExpiresAt('');
      setQrType('direct');
      onClose();
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden flex flex-col transition-colors">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">Buat QR Code</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Pilih mode Langsung (Direct) atau Dinamis (Redirect)</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200/80 dark:border-rose-800/80 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
              <span>{error}</span>
            </div>
          )}

          {/* Mode Selector (Direct is first and highlighted as primary) */}
          <div className="grid grid-cols-2 gap-3 p-1.5 bg-slate-100/80 dark:bg-slate-800/60 rounded-2xl border border-slate-200/60 dark:border-slate-700/60">
            <button
              type="button"
              onClick={() => setQrType('direct')}
              className={`p-3 rounded-xl text-left transition flex flex-col gap-1 ${
                qrType === 'direct'
                  ? 'bg-white dark:bg-slate-800 shadow-sm border border-slate-200/80 dark:border-slate-700 ring-2 ring-emerald-500/30'
                  : 'hover:bg-slate-200/50 dark:hover:bg-slate-700/50'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${qrType === 'direct' ? 'bg-emerald-500' : 'bg-slate-400'}`}></span>
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-100">Direct / Langsung</span>
                </div>
                <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-200/70 dark:border-emerald-800/60">
                  Utama
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
                Langsung membuka URL asli tujuan tanpa localhost & server.
              </p>
            </button>

            <button
              type="button"
              onClick={() => setQrType('dynamic')}
              className={`p-3 rounded-xl text-left transition flex flex-col gap-1 ${
                qrType === 'dynamic'
                  ? 'bg-white dark:bg-slate-800 shadow-sm border border-slate-200/80 dark:border-slate-700 ring-2 ring-indigo-500/30'
                  : 'hover:bg-slate-200/50 dark:hover:bg-slate-700/50'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${qrType === 'dynamic' ? 'bg-indigo-600' : 'bg-slate-400'}`}></span>
                <span className="text-xs font-bold text-slate-800 dark:text-slate-100">Dynamic QR</span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
                Bisa diubah tujuannya nanti & pantau analytics via URL pengalihan.
              </p>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
            {/* Fields */}
            <div className="md:col-span-8 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  QR Code Name / Campaign Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Profil Instagram, Menu Restoran, Brosur Digital"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  Destination Target URL <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Globe className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    placeholder="https://instagram.com/akunanda atau https://website.com"
                    value={targetUrl}
                    onChange={(e) => setTargetUrl(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono text-xs transition"
                  />
                </div>
                <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
                  {qrType === 'direct' 
                    ? 'QR Code akan langsung menyimpan link ini murni (bisa langsung dibuka dari kamera HP tanpa server).'
                    : 'Anda bisa mengubah URL tujuan ini kapan saja kemudian.'}
                </p>
              </div>

              {qrType === 'dynamic' && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                    Custom Short Slug (Optional)
                  </label>
                  <div className="flex rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden focus-within:ring-2 focus-within:ring-indigo-500 bg-white dark:bg-slate-800">
                    <span className="bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-300 px-3 py-2.5 text-xs font-mono select-none flex items-center border-r border-slate-200 dark:border-slate-700">
                      /r/
                    </span>
                    <input
                      type="text"
                      placeholder="custom-slug (kosongkan untuk auto-generate)"
                      value={slug}
                      onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, '-'))}
                      className="flex-1 px-3 py-2 text-xs font-mono bg-transparent text-slate-800 dark:text-slate-100 focus:outline-none"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  Description / Catatan (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Dicetak di kartu nama atau meja"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {qrType === 'dynamic' && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                    Expiration Date (Optional)
                  </label>
                  <input
                    type="datetime-local"
                    value={expiresAt}
                    onChange={(e) => setExpiresAt(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              )}
            </div>

            {/* Live QR Preview Card */}
            <div className="md:col-span-4 flex flex-col items-center justify-center p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Live QR Preview</span>
              <div className="p-3 bg-white rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
                <QRPreview value={previewValue} styling={styling} size={140} />
              </div>
              <div className="mt-3 text-center w-full">
                <span className="text-[10px] font-mono text-slate-500 dark:text-slate-300 bg-white dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700 block truncate max-w-[170px] mx-auto" title={previewValue}>
                  {previewValue}
                </span>
                <span className={`text-[10px] font-semibold block mt-1.5 ${
                  qrType === 'direct' ? 'text-emerald-600 dark:text-emerald-400' : 'text-indigo-600 dark:text-indigo-400'
                }`}>
                  {qrType === 'direct' ? 'Langsung ke URL Asli' : 'Dynamic via Server'}
                </span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-md shadow-indigo-600/20 transition disabled:opacity-50"
            >
              <span>{loading ? 'Menyimpan...' : qrType === 'direct' ? 'Buat Direct QR' : 'Buat Dynamic QR'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
