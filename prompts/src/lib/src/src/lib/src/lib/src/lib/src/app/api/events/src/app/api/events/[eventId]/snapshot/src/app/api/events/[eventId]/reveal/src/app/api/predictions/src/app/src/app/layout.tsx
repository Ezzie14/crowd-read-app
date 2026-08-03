import type { Metadata } from 'next';
import { Oswald, Source_Sans_3 } from 'next/font/google';
import './globals.css';

const display = Oswald({
  subsets: ['latin'],
  weight: ['500', '600', '700'],
  variable: '--font-display'
});

const body = Source_Sans_3({
  subsets: ['latin'],
  weight: ['400', '600'],
  variable: '--font-body'
});

export const metadata: Metadata = {
  title: 'Crowd Read',
  description: 'Read the market, not the winner. A daily crowd prediction game.'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable}`}>
      <body className="font-body text-ink min-h-screen">{children}</body>
    </html>
  );
}
