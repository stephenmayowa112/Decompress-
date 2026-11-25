import type { Metadata } from 'next';
import { Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';
import { DecompressProvider } from '@/src/context/DecompressContext';
import { ErrorBoundary } from '@/src/components/ui/ErrorBoundary';
import { Header } from '@/src/components/layout/Header';
import { Footer } from '@/src/components/layout/Footer';

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-jakarta',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Decompress',
  description:
    'Discover social experiences, book venues with indicative Budget Ranges, and arrange event-planning and coordination support across Lagos.',
  openGraph: {
    title: 'Decompress',
    description:
      'Discover social experiences, book venues with indicative Budget Ranges, and arrange event-planning and coordination support across Lagos.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Decompress',
    description:
      'Discover social experiences, book venues with indicative Budget Ranges, and arrange event-planning and coordination support across Lagos.',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={plusJakartaSans.variable}>
      <body suppressHydrationWarning className="min-h-screen flex flex-col bg-surface text-brand-navy">
        <ErrorBoundary>
          <DecompressProvider>
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
          </DecompressProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
