import '../index.css';
import ImageProtectionGuard from '../components/ImageProtectionGuard';
import CookieConsentBanner from '../components/CookieConsentBanner';

export const metadata = {
  metadataBase: new URL('https://ayezz.com'),
  title: {
    default: 'AYEZZ GLOBAL — Studio Pakaian Sublimasi High-End',
    template: '%s | AYEZZ GLOBAL'
  },
  description: 'Kilang pengeluaran jersi sukan, esports, dan pakaian seragam komuniti cetakan penuh berpiawaian antarabangsa. Bebas reka bentuk 100%, tanpa pesanan minimum.',
  keywords: ['Sublimation Jersey', 'Jersi Sukan', 'Jersi Futsal', 'Jersi Esports', 'Custom Apparel Malaysia', 'AYEZZ GLOBAL', 'Jersi Custom'],
  authors: [{ name: 'AYEZZ GLOBAL' }],
  creator: 'AYEZZ GLOBAL',
  publisher: 'AYEZZ GLOBAL',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: 'https://ayezz.com',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    title: 'AYEZZ GLOBAL — Studio Pakaian Sublimasi High-End',
    description: 'Kilang pengeluaran jersi sukan, esports, dan pakaian seragam komuniti cetakan penuh berpiawaian antarabangsa. Bebas reka bentuk 100%, tanpa pesanan minimum.',
    url: 'https://ayezz.com',
    siteName: 'AYEZZ GLOBAL',
    locale: 'ms_MY',
    type: 'website',
    images: [
      {
        url: '/logo/ayezz-logo-01.svg',
        width: 1200,
        height: 630,
        alt: 'AYEZZ GLOBAL Sublimation'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AYEZZ GLOBAL — Studio Pakaian Sublimasi High-End',
    description: 'Kilang pengeluaran jersi sukan, esports, dan pakaian seragam komuniti cetakan penuh berpiawaian antarabangsa.',
    images: ['/logo/ayezz-logo-01.svg'],
  },
  verification: {
    google: 'google5824a082129debc6'
  }
};

export default function RootLayout({ children }) {
  return (
    <html lang="ms" className="scroll-smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body className="bg-white text-[#111111] font-sans antialiased selection:bg-[#111111] selection:text-white">
        <ImageProtectionGuard />
        {children}
        <CookieConsentBanner />
      </body>
    </html>
  );
}
