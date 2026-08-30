import '../index.css';
import ImageProtectionGuard from '../components/ImageProtectionGuard';
import CookieConsentBanner from '../components/CookieConsentBanner';

export const metadata = {
  title: 'AYEZZ GLOBAL — Studio Pakaian Sublimasi High-End',
  description: 'Kilang pengeluaran jersi sukan, esports, dan pakaian seragam komuniti cetakan penuh berpiawaian antarabangsa. Bebas reka bentuk 100%, tanpa pesanan minimum.',
  keywords: ['Sublimation Jersey', 'Jersi Sukan', 'Jersi Futsal', 'Jersi Esports', 'Custom Apparel Malaysia', 'AYEZZ GLOBAL'],
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
