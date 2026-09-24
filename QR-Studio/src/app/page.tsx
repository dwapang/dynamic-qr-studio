'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { QRCodeItem } from '@/lib/types';
import { Navbar } from '@/components/Navbar';
import { QRCard } from '@/components/QRCard';
import { CreateQRModal } from '@/components/CreateQRModal';
import { QRDesigner } from '@/components/QRDesigner';
import { AnalyticsModal } from '@/components/AnalyticsModal';
import { 
  Search, Plus, Sparkles, Filter, Activity, QrCode, 
  ArrowUpDown, CheckCircle2, RotateCw, ExternalLink, ShieldCheck, Zap 
} from 'lucide-react';

export default function DashboardPage() {
  const [qrs, setQrs] = useState<QRCodeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [origin, setOrigin] = useState('http://localhost:3000');
  const [baseUrl, setBaseUrl] = useState('http://localhost:3000');

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'paused'>('all');
  const [typeFilter, setTypeFilter] = useState<'all' | 'dynamic' | 'direct'>('all');

  // Modal states
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [designerQR, setDesignerQR] = useState<QRCodeItem | null>(null);
  const [analyticsQR, setAnalyticsQR] = useState<QRCodeItem | null>(null);

  // Stats
  const [globalStats, setGlobalStats] = useState({
    totalQRs: 0,
    activeQRs: 0,
    totalScans: 0,
    todayScans: 0,
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const winOrigin = window.location.origin;
      setOrigin(winOrigin);
      setBaseUrl(winOrigin);
    }
    fetchQRs();
    fetchStats();
  }, []);

  const fetchQRs = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/qr');
      const json = await res.json();
      if (json.success) {
        setQrs(json.data);
      }
    } catch (e) {
      console.error('Error fetching QRs:', e);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/analytics');
      const json = await res.json();
      if (json.success) {
        setGlobalStats(json.data);
      }
    } catch (e) {
      console.error('Error fetching global stats:', e);
    }
  };

  const handleQRUpdated = (updated: QRCodeItem) => {
    setQrs((prev) => prev.map((q) => (q.id === updated.id ? updated : q)));
    if (designerQR?.id === updated.id) setDesignerQR(updated);
    if (analyticsQR?.id === updated.id) setAnalyticsQR(updated);
    fetchStats();
  };

  const handleQRDeleted = (id: string) => {
    setQrs((prev) => prev.filter((q) => q.id !== id));
    fetchStats();
  };

  const handleQRCreated = (newQR: QRCodeItem) => {
    setQrs((prev) => [newQR, ...prev]);
    fetchStats();
    // Open designer right away so they can customize if they want
    setDesignerQR(newQR);
  };

  // Filtered QR List
  const filteredQRs = useMemo(() => {
    return qrs.filter((qr) => {
      const matchesSearch =
        qr.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        qr.slug.toLowerCase().includes(searchQuery.toLowerCase()) ||
        qr.targetUrl.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus =
        statusFilter === 'all' ? true : qr.status === statusFilter;

      const matchesType =
        typeFilter === 'all' ? true : (qr.qrType || 'dynamic') === typeFilter;

      return matchesSearch && matchesStatus && matchesType;
    });
  }, [qrs, searchQuery, statusFilter, typeFilter]);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 transition-colors">
      {/* Top Navigation */}
      <Navbar
        onOpenCreate={() => setIsCreateOpen(true)}
        activeCount={globalStats.activeQRs}
        totalScans={globalStats.totalScans}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Hero Banner / Quick Overview Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">Total QR</span>
              <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                <QrCode className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
                {globalStats.totalQRs}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Terdaftar</p>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Aktif</span>
              <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400 tracking-tight">
                {globalStats.activeQRs}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Sedang aktif</p>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">Total Scan</span>
              <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                <Activity className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
                {globalStats.totalScans}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Semua QR</p>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between text-amber-600 dark:text-amber-400 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Hari Ini</span>
              <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                <Sparkles className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="text-3xl font-extrabold text-amber-600 dark:text-amber-400 tracking-tight">
                {globalStats.todayScans}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Scan hari ini</p>
            </div>
          </div>
        </div>

        {/* Search, Filter & Actions Bar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
          {/* Search Box */}
          <div className="relative w-full md:w-72">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              placeholder="Cari nama, slug, atau link..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 placeholder-slate-400 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white dark:focus:bg-slate-800 transition"
            />
          </div>

          {/* Type Filter & Status Filter Pills */}
          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-between md:justify-end">
            {/* Mode / Type filter */}
            <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200/60 dark:border-slate-700 text-xs font-medium">
              {[
                { id: 'all', label: 'Semua' },
                { id: 'direct', label: 'Direct' },
                { id: 'dynamic', label: 'Dynamic' },
              ].map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setTypeFilter(t.id as any)}
                  className={`px-3 py-1.5 rounded-lg transition text-xs ${
                    typeFilter === t.id
                      ? 'bg-white dark:bg-slate-700 text-indigo-700 dark:text-indigo-300 font-bold shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* Status Filter */}
            <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200/60 dark:border-slate-700">
              {[
                { id: 'all', label: 'Semua Status' },
                { id: 'active', label: 'Aktif' },
                { id: 'paused', label: 'Dijeda' },
              ].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setStatusFilter(item.id as any)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                    statusFilter === item.id
                      ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 font-semibold shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>

            <button
              onClick={() => {
                fetchQRs();
                fetchStats();
              }}
              title="Refresh QR codes"
              className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 dark:hover:text-slate-200 rounded-xl transition"
            >
              <RotateCw className={`w-4 h-4 ${loading ? 'animate-spin text-indigo-600' : ''}`} />
            </button>
          </div>
        </div>

        {/* QR Codes Grid */}
        {loading && qrs.length === 0 ? (
          <div className="py-24 text-center">
            <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Memuat data...</p>
          </div>
        ) : filteredQRs.length === 0 ? (
          <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col items-center justify-center max-w-md mx-auto">
            <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-4">
              <QrCode className="w-7 h-7 stroke-[1.8]" />
            </div>
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 mb-1">Belum Ada QR Code</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-5">
              {searchQuery
                ? `Tidak ditemukan QR code dengan kata kunci "${searchQuery}"`
                : "Buat QR code pertama Anda untuk mulai membagikan tautan."}
            </p>
            <button
              onClick={() => setIsCreateOpen(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs transition shadow-md shadow-indigo-600/20"
            >
              <Plus className="w-4 h-4" /> Buat QR Code
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredQRs.map((qr) => (
              <QRCard
                key={qr.id}
                qr={qr}
                origin={baseUrl}
                onOpenDesigner={(item) => setDesignerQR(item)}
                onOpenAnalytics={(item) => setAnalyticsQR(item)}
                onUpdated={handleQRUpdated}
                onDeleted={handleQRDeleted}
              />
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 py-6 text-center text-xs text-slate-400 dark:text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>© Diky Wahyudi</p>
          <div className="flex items-center gap-4">
            <span className="inline-flex items-center gap-1 text-slate-500 dark:text-slate-400">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> SQLite Database
            </span>
          </div>
        </div>
      </footer>

      {/* Modals */}
      {isCreateOpen && (
        <CreateQRModal
          origin={baseUrl}
          isOpen={isCreateOpen}
          onClose={() => setIsCreateOpen(false)}
          onCreated={handleQRCreated}
        />
      )}

      {designerQR && (
        <QRDesigner
          qrCode={designerQR}
          origin={baseUrl}
          isOpen={Boolean(designerQR)}
          onClose={() => setDesignerQR(null)}
          onSaved={handleQRUpdated}
        />
      )}

      {analyticsQR && (
        <AnalyticsModal
          qrCode={analyticsQR}
          origin={baseUrl}
          isOpen={Boolean(analyticsQR)}
          onClose={() => setAnalyticsQR(null)}
        />
      )}
    </div>
  );
}
