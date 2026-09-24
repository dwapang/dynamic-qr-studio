import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Dynamic QR Studio - Manage, Edit & Track QR Codes',
  description: 'Create dynamic QR codes with real-time editable destination links, scan analytics, custom shapes, colors, and logos.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const theme = localStorage.getItem('theme');
                const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                if (theme === 'dark' || (!theme && prefersDark)) {
                  document.documentElement.classList.add('dark');
                } else {
                  document.documentElement.classList.remove('dark');
                }
              } catch (_) {}
            `,
          }}
        />
      </head>
      <body className="font-sans antialiased text-slate-800 dark:text-slate-100 bg-slate-50 dark:bg-slate-950 selection:bg-indigo-500 selection:text-white min-h-screen flex flex-col transition-colors duration-200">
        {children}
      </body>
    </html>
  );
}
