import type { Metadata, Viewport } from 'next';
import './globals.css';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { PersonaProvider } from '@/context/PersonaContext';
import { ThemeProvider } from '@/context/ThemeContext';
import { Suspense } from 'react';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export const metadata: Metadata = {
  title: 'CivicPulse — Smart Civic Complaint Triage System',
  description:
    'Real-time municipal AI complaint triage platform with intelligent prioritization, automated duplicate clustering, and rapid public service dispatch.',
  keywords: [
    'CivicPulse',
    'Smart City',
    'Municipal Triage',
    'AI Complaint Management',
    'Public Works',
    'Open311',
  ],
  authors: [{ name: 'CivicPulse Platform Architecture' }],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
      </head>
      <body className="min-h-screen flex flex-col bg-[var(--canvas-base)] text-[var(--text-primary)] selection:bg-emerald-500/30 selection:text-emerald-200 antialiased transition-colors duration-300">
        <ThemeProvider>
          <PersonaProvider>
            {/* Top Navigation */}
            <Suspense fallback={<header className="h-16 w-full glass-nav border-b border-white/[0.08]" />}>
              <Navbar />
            </Suspense>

            {/* Main content body */}
            <main className="flex-1 flex flex-col w-full">
              <Suspense fallback={<div className="flex-1 flex items-center justify-center min-h-[50vh]"><div className="w-8 h-8 rounded-full border-2 border-emerald-400 border-t-transparent animate-spin" /></div>}>
                {children}
              </Suspense>
            </main>

            {/* Public Service Footer */}
            <Footer />
          </PersonaProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
