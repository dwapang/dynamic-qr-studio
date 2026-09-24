'use client';

import React, { useState } from 'react';
import { QRCodeItem, QRStatus } from '@/lib/types';
import { QRPreview } from './QRPreview';
import { getQREncodedValue } from '@/lib/qr-helper';
import { 
  Palette, BarChart3, Trash2, Copy, Check, ExternalLink, 
  Edit2, CheckCircle2, PauseCircle, PlayCircle, Clock, Link2, Globe, Zap, ArrowLeftRight
} from 'lucide-react';

interface QRCardProps {
  qr: QRCodeItem;
  origin: string;
  onOpenDesigner: (qr: QRCodeItem) => void;
  onOpenAnalytics: (qr: QRCodeItem) => void;
  onUpdated: (updated: QRCodeItem) => void;
  onDeleted: (id: string) => void;
}

export function QRCard({
  qr,
  origin,
  onOpenDesigner,
  onOpenAnalytics,
  onUpdated,
  onDeleted,
}: QRCardProps) {
  const [copiedLink, setCopiedLink] = useState(false);
  const [isEditingUrl, setIsEditingUrl] = useState(false);
  const [editUrlValue, setEditUrlValue] = useState(qr.targetUrl);
  const [savingUrl, setSavingUrl] = useState(false);
  const [togglingStatus, setTogglingStatus] = useState(false);
  const [switchingType, setSwitchingType] = useState(false);

  const isDirect = qr.qrType === 'direct';
  const encodedValue = getQREncodedValue(qr, origin);
  const dynamicUrl = `${origin}/r/${qr.slug}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(encodedValue);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleToggleQRType = async () => {
    const nextType = isDirect ? 'dynamic' : 'direct';
    try {
      setSwitchingType(true);
      const res = await fetch(`/api/qr/${qr.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ qrType: nextType }),
      });
      const json = await res.json();
      if (json.success) {
        onUpdated(json.data);
      }
    } catch (e) {
      console.error('Error toggling QR type:', e);
    } finally {
      setSwitchingType(false);
    }
  };

  const handleSaveUrl = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editUrlValue.trim()) return;

    try {
      setSavingUrl(true);
      const res = await fetch(`/api/qr/${qr.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetUrl: editUrlValue.trim() }),
      });
      const json = await res.json();
      if (json.success) {
        onUpdated(json.data);
        setIsEditingUrl(false);
      } else {
        alert(json.error || 'Failed to update destination URL');
      }
    } catch (e: any) {
      alert(e.message || 'Error updating destination URL');
    } finally {
      setSavingUrl(false);
    }
  };

  const handleToggleStatus = async () => {
    const nextStatus: QRStatus = qr.status === 'active' ? 'paused' : 'active';
    try {
      setTogglingStatus(true);
      const res = await fetch(`/api/qr/${qr.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus }),
      });
      const json = await res.json();
      if (json.success) {
        onUpdated(json.data);
      }
    } catch (e) {
      console.error('Error toggling status:', e);
    } finally {
      setTogglingStatus(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to delete "${qr.title}"? This cannot be undone.`)) {
      return;
    }

    try {
      const res = await fetch(`/api/qr/${qr.id}`, { method: 'DELETE' });
      const json = await res.json();
      if (json.success) {
        onDeleted(qr.id);
      }
    } catch (e) {
      console.error('Error deleting QR:', e);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col overflow-hidden group">
      {/* Top Banner & Info */}
      <div className="p-5 flex gap-4">
        {/* Thumbnail Preview (Click opens Designer) */}
        <div 
          onClick={() => onOpenDesigner(qr)}
          title="Click to customize design"
          className="relative shrink-0 cursor-pointer p-2 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 hover:border-indigo-400 dark:hover:border-indigo-500 transition-all hover:scale-105 group/thumb shadow-sm"
        >
          <QRPreview value={encodedValue} styling={qr.styling} size={92} className="rounded-xl" />
          <div className="absolute inset-0 bg-indigo-900/40 rounded-2xl opacity-0 group-hover/thumb:opacity-100 transition flex items-center justify-center text-white backdrop-blur-[1px]">
            <Palette className="w-5 h-5 drop-shadow" />
          </div>
        </div>

        {/* Title, Status & Link */}
        <div className="flex-1 min-w-0 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-2 mb-1">
              <h3 className="font-bold text-slate-800 dark:text-slate-100 text-base truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition">
                {qr.title}
              </h3>

              {/* Status pill with quick toggle */}
              <button
                type="button"
                onClick={handleToggleStatus}
                disabled={togglingStatus}
                title={`Click to ${qr.status === 'active' ? 'pause' : 'activate'}`}
                className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize transition ${
                  qr.status === 'active'
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/70 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800'
                    : 'bg-amber-50 text-amber-700 border border-amber-200/70 hover:bg-amber-100 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800'
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${qr.status === 'active' ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
                <span>{qr.status}</span>
              </button>
            </div>

            {qr.description && (
              <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 mb-2">{qr.description}</p>
            )}

            {/* Mode & Link display */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Mode Switch Badge */}
              <button
                type="button"
                onClick={handleToggleQRType}
                disabled={switchingType}
                title={`Klik untuk ubah ke ${isDirect ? 'Dynamic Mode' : 'Direct Mode'}`}
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold transition hover:opacity-80 ${
                  isDirect 
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-200 dark:bg-emerald-950/70 dark:text-emerald-300 dark:border-emerald-800' 
                    : 'bg-indigo-100 text-indigo-800 border border-indigo-200 dark:bg-indigo-950/70 dark:text-indigo-300 dark:border-indigo-800'
                }`}
              >
                {isDirect ? <Zap className="w-2.5 h-2.5" /> : <Globe className="w-2.5 h-2.5" />}
                <span>{isDirect ? 'Direct (Asli)' : 'Dynamic (Redirect)'}</span>
                <ArrowLeftRight className="w-2.5 h-2.5 opacity-60 ml-0.5" />
              </button>

              <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 font-mono text-xs text-slate-700 dark:text-slate-300 border border-slate-200/70 dark:border-slate-700 max-w-[190px] truncate">
                <Link2 className="w-3 h-3 text-indigo-500 shrink-0" />
                <span className="truncate">{isDirect ? qr.targetUrl : `/r/${qr.slug}`}</span>
              </div>
              <button
                type="button"
                onClick={handleCopyLink}
                title={isDirect ? "Copy Direct URL" : "Copy Dynamic Redirect URL"}
                className="p-1 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-slate-800 dark:hover:text-indigo-400 rounded-lg transition"
              >
                {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Target Destination Box (The Core Dynamic Feature) */}
      <div className="px-5 py-3 bg-slate-50/70 dark:bg-slate-800/40 border-y border-slate-100 dark:border-slate-800 flex flex-col gap-1.5">
        <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
          <span className="flex items-center gap-1">
            <Globe className="w-3 h-3 text-slate-400" /> Dynamic Destination
          </span>
          {!isEditingUrl && (
            <button
              onClick={() => {
                setEditUrlValue(qr.targetUrl);
                setIsEditingUrl(true);
              }}
              className="text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 font-medium inline-flex items-center gap-1 normal-case tracking-normal hover:underline"
            >
              <Edit2 className="w-2.5 h-2.5" /> Edit URL
            </button>
          )}
        </div>

        {isEditingUrl ? (
          <form onSubmit={handleSaveUrl} className="flex items-center gap-1.5 mt-1">
            <input
              type="text"
              required
              value={editUrlValue}
              onChange={(e) => setEditUrlValue(e.target.value)}
              className="flex-1 px-2.5 py-1 text-xs font-mono rounded-lg border border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white dark:bg-slate-800 dark:border-indigo-500 dark:text-slate-100"
            />
            <button
              type="submit"
              disabled={savingUrl}
              className="px-2.5 py-1 bg-indigo-600 text-white rounded-lg text-xs font-medium hover:bg-indigo-700 transition"
            >
              Save
            </button>
            <button
              type="button"
              onClick={() => setIsEditingUrl(false)}
              className="px-2 py-1 text-xs text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition"
            >
              Cancel
            </button>
          </form>
        ) : (
          <div className="flex items-center justify-between gap-2">
            <span className="font-mono text-xs text-slate-700 dark:text-slate-300 truncate" title={qr.targetUrl}>
              {qr.targetUrl}
            </span>
            <a
              href={qr.targetUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 shrink-0"
              title="Open destination in new tab"
            >
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        )}
      </div>

      {/* Action Footer */}
      <div className="p-3.5 mt-auto flex items-center justify-between text-xs bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800/80">
        {/* Scans counter badge */}
        <div 
          onClick={() => onOpenAnalytics(qr)}
          className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-indigo-50 text-indigo-700 hover:bg-indigo-100 dark:bg-indigo-950/60 dark:text-indigo-300 dark:hover:bg-indigo-900/50 font-semibold transition"
          title="Click to view analytics"
        >
          <BarChart3 className="w-3.5 h-3.5" />
          <span>{qr.scanCount} {qr.scanCount === 1 ? 'Scan' : 'Scans'}</span>
        </div>

        {/* Buttons Toolbar */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => onOpenDesigner(qr)}
            title="Design & Download QR"
            className="p-2 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 dark:text-slate-400 dark:hover:text-indigo-400 dark:hover:bg-slate-800 rounded-xl transition"
          >
            <Palette className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => onOpenAnalytics(qr)}
            title="Detailed Analytics"
            className="p-2 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 dark:text-slate-400 dark:hover:text-indigo-400 dark:hover:bg-slate-800 rounded-xl transition"
          >
            <BarChart3 className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={handleDelete}
            title="Delete QR Code"
            className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:text-slate-500 dark:hover:text-rose-400 dark:hover:bg-rose-950/50 rounded-xl transition"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
