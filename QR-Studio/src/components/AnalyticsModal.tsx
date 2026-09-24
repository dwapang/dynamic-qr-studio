import React, { useState, useEffect } from 'react';
import { QRCodeItem, QRAnalytics } from '@/lib/types';
import { 
  X, Activity, Smartphone, Monitor, Tablet, Globe, Calendar, 
  RotateCw, ExternalLink, ShieldCheck, ArrowUpRight 
} from 'lucide-react';

interface AnalyticsModalProps {
  qrCode: QRCodeItem;
  origin: string;
  isOpen: boolean;
  onClose: () => void;
}

const DEVICE_COLORS: Record<string, string> = {
  Mobile: '#6366f1',
  Desktop: '#0ea5e9',
  Tablet: '#f59e0b',
  Unknown: '#94a3b8',
};

export function AnalyticsModal({ qrCode, origin, isOpen, onClose }: AnalyticsModalProps) {
  const [data, setData] = useState<QRAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [hoveredPoint, setHoveredPoint] = useState<{ date: string; count: number } | null>(null);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/qr/${qrCode.id}/analytics`);
      const json = await res.json();
      if (json.success) {
        setData(json.data.analytics);
      }
    } catch (e) {
      console.error('Error fetching analytics:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && qrCode) {
      fetchAnalytics();
    }
  }, [isOpen, qrCode]);

  if (!isOpen) return null;

  const timeline = data?.timeline || [];
  const maxCount = Math.max(...timeline.map((t) => t.count), 1);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div className="relative w-full max-w-5xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400 flex items-center justify-center">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">Statistik Scan</h2>
                <span className="font-mono text-xs text-indigo-600 bg-indigo-50 dark:bg-indigo-950/60 dark:text-indigo-300 px-2 py-0.5 rounded-full border border-indigo-200/60 dark:border-indigo-800">
                  /r/{qrCode.slug}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">Metrik untuk <span className="font-medium text-slate-700 dark:text-slate-200">{qrCode.title}</span></p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={fetchAnalytics}
              disabled={loading}
              title="Refresh Analytics"
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 dark:hover:text-slate-200 rounded-full transition disabled:opacity-50"
            >
              <RotateCw className={`w-4 h-4 ${loading ? 'animate-spin text-indigo-600' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 dark:hover:text-slate-200 rounded-full transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {loading && !data ? (
            <div className="py-24 text-center">
              <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
              <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Memuat statistik...</p>
            </div>
          ) : (
            <>
              {/* Stat Cards Row */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-4 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/50">
                  <div className="flex items-center justify-between text-indigo-600 dark:text-indigo-400 mb-1">
                    <span className="text-xs font-semibold uppercase tracking-wider">Total Scan</span>
                    <Activity className="w-4 h-4" />
                  </div>
                  <div className="text-2xl font-extrabold text-slate-900 dark:text-slate-100">{data?.totalScans || 0}</div>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">Sejak awal</span>
                </div>

                <div className="p-4 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/50">
                  <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400 mb-1">
                    <span className="text-xs font-semibold uppercase tracking-wider">Perangkat Unik</span>
                    <Smartphone className="w-4 h-4" />
                  </div>
                  <div className="text-2xl font-extrabold text-slate-900 dark:text-slate-100">{data?.uniqueDevices || 0}</div>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">Perangkat unik</span>
                </div>

                <div className="p-4 rounded-xl bg-amber-50/50 dark:bg-amber-950/30 border border-amber-100 dark:border-amber-900/50">
                  <div className="flex items-center justify-between text-amber-600 dark:text-amber-400 mb-1">
                    <span className="text-xs font-semibold uppercase tracking-wider">Hari Ini</span>
                    <Calendar className="w-4 h-4" />
                  </div>
                  <div className="text-2xl font-extrabold text-slate-900 dark:text-slate-100">{data?.scansToday || 0}</div>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">Sejak pukul 00:00</span>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                  <div className="flex items-center justify-between text-slate-600 dark:text-slate-400 mb-1">
                    <span className="text-xs font-semibold uppercase tracking-wider">URL Tujuan</span>
                    <ExternalLink className="w-4 h-4" />
                  </div>
                  <div className="text-xs font-mono font-semibold text-slate-800 dark:text-slate-200 truncate" title={qrCode.targetUrl}>
                    {qrCode.targetUrl}
                  </div>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">
                    Status: <strong className={qrCode.status === 'active' ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}>{qrCode.status}</strong>
                  </span>
                </div>
              </div>

              {/* Charts Section */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Timeline Chart */}
                <div className="lg:col-span-8 p-5 bg-white dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700/80 shadow-sm flex flex-col justify-between">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">Riwayat Scan</h3>
                      <span className="text-xs text-slate-400 font-medium">Volume scan harian</span>
                    </div>
                    {hoveredPoint && (
                      <div className="px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-xs font-semibold text-indigo-700 dark:text-indigo-300">
                        {hoveredPoint.date}: {hoveredPoint.count} scan
                      </div>
                    )}
                  </div>

                  <div className="h-48 w-full flex items-end gap-1.5 pt-4 pb-2 px-1">
                    {timeline.length > 0 ? (
                      timeline.map((item, idx) => {
                        const heightPct = Math.max(Math.round((item.count / maxCount) * 100), item.count > 0 ? 10 : 3);
                        const isHovered = hoveredPoint?.date === item.date;
                        return (
                          <div
                            key={item.date || idx}
                            className="flex-1 flex flex-col items-center h-full justify-end group cursor-pointer"
                            onMouseEnter={() => setHoveredPoint(item)}
                            onMouseLeave={() => setHoveredPoint(null)}
                          >
                            <div className="w-full flex items-end justify-center h-36">
                              <div
                                style={{ height: `${heightPct}%` }}
                                className={`w-full max-w-[28px] rounded-t-md transition-all duration-200 ${
                                  isHovered
                                    ? 'bg-indigo-500 shadow-md shadow-indigo-500/30'
                                    : item.count > 0
                                    ? 'bg-indigo-600 dark:bg-indigo-500 hover:bg-indigo-500'
                                    : 'bg-slate-100 dark:bg-slate-700/50'
                                }`}
                              />
                            </div>
                            <span className="text-[10px] text-slate-400 font-mono mt-2 truncate w-full text-center">
                              {item.date ? item.date.slice(5) : ''}
                            </span>
                          </div>
                        );
                      })
                    ) : (
                      <div className="h-full w-full flex items-center justify-center text-xs text-slate-400">
                        Belum ada data riwayat scan.
                      </div>
                    )}
                  </div>
                </div>

                {/* Device Distribution */}
                <div className="lg:col-span-4 p-5 bg-white dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700/80 shadow-sm flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">Perangkat</h3>
                      <span className="text-xs text-slate-400 font-medium">Berdasarkan device</span>
                    </div>

                    {data?.devices && data.devices.length > 0 ? (
                      <>
                        <div className="h-3 w-full rounded-full overflow-hidden flex bg-slate-100 dark:bg-slate-700 mb-5">
                          {data.devices.map((d) => (
                            <div
                              key={d.name}
                              style={{
                                width: `${d.percentage}%`,
                                backgroundColor: DEVICE_COLORS[d.name] || '#6366f1',
                              }}
                              className="h-full transition-all duration-300"
                              title={`${d.name}: ${d.percentage}%`}
                            />
                          ))}
                        </div>

                        <div className="space-y-3">
                          {data.devices.map((d) => (
                            <div key={d.name} className="space-y-1">
                              <div className="flex items-center justify-between text-xs">
                                <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                                  <span
                                    className="w-2.5 h-2.5 rounded-full"
                                    style={{ backgroundColor: DEVICE_COLORS[d.name] || '#6366f1' }}
                                  />
                                  <span className="font-medium">{d.name}</span>
                                </div>
                                <span className="font-bold text-slate-900 dark:text-slate-100 font-mono">
                                  {d.percentage}% <span className="text-slate-400 font-normal">({d.count})</span>
                                </span>
                              </div>
                              <div className="w-full h-1.5 rounded-full bg-slate-100 dark:bg-slate-700/60 overflow-hidden">
                                <div
                                  className="h-full rounded-full transition-all duration-300"
                                  style={{
                                    width: `${d.percentage}%`,
                                    backgroundColor: DEVICE_COLORS[d.name] || '#6366f1',
                                  }}
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      </>
                    ) : (
                      <div className="py-12 text-center text-xs text-slate-400">Belum ada data perangkat</div>
                    )}
                  </div>
                </div>
              </div>

              {/* OS & Browser Stats */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50/70 dark:bg-slate-800/40 rounded-2xl border border-slate-200/80 dark:border-slate-700">
                  <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-3">Sistem Operasi</h4>
                  <div className="space-y-2">
                    {data?.operatingSystems && data.operatingSystems.length > 0 ? (
                      data.operatingSystems.map((item) => (
                        <div key={item.name} className="flex items-center justify-between text-xs">
                          <span className="font-medium text-slate-700 dark:text-slate-300">{item.name}</span>
                          <span className="px-2 py-0.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded font-semibold text-slate-800 dark:text-slate-200">
                            {item.count} scan
                          </span>
                        </div>
                      ))
                    ) : (
                      <span className="text-xs text-slate-400">Belum ada data</span>
                    )}
                  </div>
                </div>

                <div className="p-4 bg-slate-50/70 dark:bg-slate-800/40 rounded-2xl border border-slate-200/80 dark:border-slate-700">
                  <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-3">Browser</h4>
                  <div className="space-y-2">
                    {data?.browsers && data.browsers.length > 0 ? (
                      data.browsers.map((item) => (
                        <div key={item.name} className="flex items-center justify-between text-xs">
                          <span className="font-medium text-slate-700 dark:text-slate-300">{item.name}</span>
                          <span className="px-2 py-0.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded font-semibold text-slate-800 dark:text-slate-200">
                            {item.count} scan
                          </span>
                        </div>
                      ))
                    ) : (
                      <span className="text-xs text-slate-400">Belum ada data</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Recent Scan Activity Log Table */}
              <div className="bg-white dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700/80 shadow-sm overflow-hidden">
                <div className="px-5 py-3.5 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/80">
                  <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">Log Scan Terbaru</h3>
                  <span className="text-xs text-slate-400">20 scan terakhir</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
                    <thead className="bg-slate-50 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 uppercase font-semibold text-[10px] tracking-wider border-b border-slate-100 dark:border-slate-700">
                      <tr>
                        <th className="py-2.5 px-4">Waktu</th>
                        <th className="py-2.5 px-4">Perangkat</th>
                        <th className="py-2.5 px-4">OS & Browser</th>
                        <th className="py-2.5 px-4">Rujukan</th>
                        <th className="py-2.5 px-4">IP Address</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60">
                      {data?.recentScans && data.recentScans.length > 0 ? (
                        data.recentScans.map((scan) => (
                          <tr key={scan.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition">
                            <td className="py-3 px-4 font-mono text-[11px] text-slate-700 dark:text-slate-300 whitespace-nowrap">
                              {new Date(scan.scannedAt).toLocaleString()}
                            </td>
                            <td className="py-3 px-4 whitespace-nowrap">
                              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium capitalize bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200/50 dark:border-slate-700">
                                {scan.deviceType === 'mobile' && <Smartphone className="w-3 h-3 text-indigo-500" />}
                                {scan.deviceType === 'desktop' && <Monitor className="w-3 h-3 text-sky-500" />}
                                {scan.deviceType === 'tablet' && <Tablet className="w-3 h-3 text-amber-500" />}
                                {scan.deviceType}
                              </span>
                            </td>
                            <td className="py-3 px-4 whitespace-nowrap text-slate-700 dark:text-slate-300 font-medium">
                              {scan.os} · {scan.browser}
                            </td>
                            <td className="py-3 px-4 whitespace-nowrap text-slate-500 dark:text-slate-400 truncate max-w-[150px]">
                              {scan.referer || 'Direct'}
                            </td>
                            <td className="py-3 px-4 whitespace-nowrap font-mono text-[11px] text-slate-500 dark:text-slate-400">
                              {scan.ip || '127.0.0.1'}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={5} className="py-8 text-center text-slate-400">
                            Belum ada scan tercatat untuk QR code ini.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
