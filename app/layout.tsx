import type { Metadata } from 'next';
import { Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';
import { DecompressProvider } from '@/src/context/DecompressContext';
import { ErrorBoundary } from '@/src/components/ui/ErrorBoundary';
import { Header } from '@/src/components/layout/Header';
import { Footer } from '@/src/components/layout/Footer';
import { WhatsAppFloat } from '@/src/components/ui/WhatsAppFloat';

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-jakarta',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Decompress | Social Experience Discovery & Venue Booking',
  description:
    'Discover social experiences, book venues with indicative Budget Ranges, and arrange event-planning and coordination support across Lagos.',
  icons: {
    icon: '/icon.png',
    apple: '/apple-icon.png',
  },
  openGraph: {
    title: 'Decompress | Social Experience Discovery & Venue Booking',
    description:
      'Discover social experiences, book venues with indicative Budget Ranges, and arrange event-planning and coordination support across Lagos.',
    type: 'website',
    siteName: 'Decompress',
    images: [
      {
        url: '/opengraph-image.png',
        width: 1200,
        height: 630,
        alt: 'Decompress - Public Relations | Events | Leisure Booking',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Decompress | Social Experience Discovery & Venue Booking',
    description:
      'Discover social experiences, book venues with indicative Budget Ranges, and arrange event-planning and coordination support across Lagos.',
    images: ['/opengraph-image.png'],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={plusJakartaSans.variable}>
      <body
        suppressHydrationWarning
        className="min-h-screen flex flex-col bg-surface text-brand-navy overflow-x-clip"
      >
        <ErrorBoundary>
          <DecompressProvider>
            <Header />
            <main className="flex-1 min-w-0">{children}</main>
            <Footer />
            <WhatsAppFloat />
          </DecompressProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
