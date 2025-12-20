import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'CR PDF Tools - 60+ Professional PDF Tools',
  description: 'Merge, split, compress, convert, and secure your PDFs. Free online PDF tools powered by CR AudioViz AI.',
  keywords: 'PDF tools, merge PDF, split PDF, compress PDF, convert PDF, PDF editor',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
