import type { Metadata } from 'next';
import './globals.css';
import TanStackProvider from '@/components/TanStackProvider/TanStackProvider';
import Header from '@/components/Header/Header';

export const metadata: Metadata = {
  title: 'BookExchange — Сервіс обміну книгами',
  description: 'Додавайте власні книги, шукайте книги інших та надсилайте запити на обмін',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="uk">
      <body>
        <TanStackProvider>
          <Header />
          <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">{children}</main>
        </TanStackProvider>
      </body>
    </html>
  );
}

