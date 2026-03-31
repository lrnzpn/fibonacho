import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/contexts/AuthContext';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Fibonacho - Planning Poker for Agile Teams',
  description: 'A high-vibe, real-time pointing poker tool for agile teams.',
  keywords: ['planning poker', 'agile', 'scrum', 'estimation', 'fibonacci', 'team collaboration'],
  authors: [{ name: 'Fibonacho Team' }],
  viewport: 'width=device-width, initial-scale=1',
  themeColor: '#3b82f6',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:rounded-lg focus:bg-[var(--accent-primary)] focus:px-4 focus:py-2 focus:text-[var(--background)] focus:ring-2 focus:ring-[var(--accent-primary)] focus:ring-offset-2 focus:outline-none"
        >
          Skip to main content
        </a>
        <AuthProvider>
          <div id="main-content">{children}</div>
        </AuthProvider>
      </body>
    </html>
  );
}
