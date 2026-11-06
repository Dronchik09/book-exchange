'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store/authStore';

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const navLinkClass = (href: string) => {
    const isActive = pathname === href || (href !== '/' && pathname?.startsWith(href));
    return `px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
      isActive
        ? 'bg-indigo-50 text-indigo-600'
        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
    }`;
  };

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-slate-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        <div className="flex items-center gap-6">
          <Link
            href="/books"
            className="flex items-center gap-2 text-lg font-bold text-slate-900 tracking-tight"
          >
            <span className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center text-sm font-bold">
              B
            </span>
            <span>BookExchange</span>
          </Link>

          <nav className="hidden sm:flex items-center gap-1">
            <Link href="/books" className={navLinkClass('/books')}>
              Каталог книг
            </Link>
            {user && (
              <>
                <Link href="/me/books" className={navLinkClass('/me/books')}>
                  Мої книги
                </Link>
                <Link href="/profile" className={navLinkClass('/profile')}>
                  Профіль
                </Link>
                {user.role === 'ADMIN' && (
                  <Link href="/admin" className={navLinkClass('/admin')}>
                    Адмін-панель
                  </Link>
                )}
              </>
            )}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          {user ? (
            <>
              <div className="hidden md:flex items-center gap-2 text-sm text-slate-700">
                <span className="font-medium">{user.name}</span>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                    user.role === 'ADMIN'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {user.role}
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="px-3.5 py-1.5 rounded-lg text-sm font-medium text-slate-700 border border-slate-300 hover:bg-slate-100 transition-colors"
              >
                Вийти
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="px-3.5 py-1.5 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100 transition-colors"
              >
                Увійти
              </Link>
              <Link
                href="/register"
                className="px-4 py-1.5 rounded-lg text-sm font-medium bg-indigo-600 text-white hover:bg-indigo-700 transition-colors"
              >
                Реєстрація
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Мобільна навігація */}
      <div className="sm:hidden flex items-center gap-1 px-4 pb-2 overflow-x-auto border-t border-slate-100 pt-2">
        <Link href="/books" className={navLinkClass('/books')}>
          Каталог
        </Link>
        {user && (
          <>
            <Link href="/me/books" className={navLinkClass('/me/books')}>
              Мої книги
            </Link>
            <Link href="/profile" className={navLinkClass('/profile')}>
              Профіль
            </Link>
            {user.role === 'ADMIN' && (
              <Link href="/admin" className={navLinkClass('/admin')}>
                Адмін
              </Link>
            )}
          </>
        )}
      </div>
    </header>
  );
}

