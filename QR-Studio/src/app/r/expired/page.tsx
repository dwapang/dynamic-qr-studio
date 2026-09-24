'use client';

import { useSearchParams } from 'next/navigation';
import { Clock, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Suspense } from 'react';

function ExpiredContent() {
  const searchParams = useSearchParams();
  const title = searchParams.get('title') || 'Dynamic Link';
  const slug = searchParams.get('slug') || '';

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-slate-50 to-indigo-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 text-center border border-rose-100">
        <div className="w-20 h-20 bg-rose-100 text-rose-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-inner">
          <Clock className="w-10 h-10 stroke-[2.2]" />
        </div>
        <div className="inline-block px-3 py-1 rounded-full bg-rose-100 text-rose-800 text-xs font-semibold uppercase tracking-wider mb-3">
          QR Code Expired
        </div>
        <h1 className="text-2xl font-bold text-slate-800 mb-2">{title}</h1>
        <p className="text-slate-600 text-sm leading-relaxed mb-6">
          This dynamic QR Code (<code className="px-1.5 py-0.5 bg-slate-100 rounded text-slate-700 font-mono text-xs">/r/{slug}</code>) has reached its scheduled expiration date and is no longer active.
        </p>
        <Link
          href="/"
          className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-medium text-sm transition shadow-md hover:shadow-lg"
        >
          <ArrowLeft className="w-4 h-4" /> Return to Home
        </Link>
      </div>
    </div>
  );
}

export default function ExpiredPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center">Loading...</div>}>
      <ExpiredContent />
    </Suspense>
  );
}
