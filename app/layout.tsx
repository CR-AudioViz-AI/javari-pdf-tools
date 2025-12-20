import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'CR PDF Tools - 60+ Professional PDF Tools',
  description: 'Merge, split, compress, convert, and edit PDFs with 60+ professional tools. Free to use. No signup required. Powered by CR AudioViz AI.',
  keywords: 'PDF tools, merge PDF, split PDF, compress PDF, convert PDF, PDF editor, free PDF tools',
  openGraph: {
    title: 'CR PDF Tools - 60+ Professional PDF Tools',
    description: 'All your PDF needs in one place. Free, secure, and powerful.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
