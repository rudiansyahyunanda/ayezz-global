import '../index.css';

export const metadata = {
  title: 'AYEZZ GLOBAL — Studio Pakaian Sublimasi High-End',
  description: 'Kilang pengeluaran jersi sukan, esports, dan pakaian seragam komuniti cetakan penuh berpiawaian antarabangsa. Bebas reka bentuk 100%, tanpa pesanan minimum.',
  keywords: ['Sublimation Jersey', 'Jersi Sukan', 'Jersi Futsal', 'Jersi Esports', 'Custom Apparel Malaysia', 'AYEZZ GLOBAL']
};

export default function RootLayout({ children }) {
  return (
    <html lang="ms">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Outfit:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />
      </head>
      <body className="bg-[#F6F5F3] text-[#1A1A1A] font-sans antialiased selection:bg-[#1A1A1A] selection:text-white">
        {children}
      </body>
    </html>
  );
}
