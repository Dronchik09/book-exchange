'use client';

import Link from 'next/link';
import SearchBar from '@/components/SearchBar/SearchBar';
import BookCard from '@/components/BookCard/BookCard';
import Pagination from '@/components/Pagination/Pagination';
import { useBookStore } from '@/lib/store/bookStore';
import { useAuthStore } from '@/lib/store/authStore';
import { useBooks, useDeleteBook } from '@/hooks/useBooks';

export default function BooksCatalogPage() {
  const { search, sort, page, setPage } = useBookStore();
  const user = useAuthStore((state) => state.user);

  const { data, isLoading, isError } = useBooks({
    search,
    sort,
    page,
    limit: 8,
  });

  const deleteMutation = useDeleteBook();

  const handleDelete = (id: number) => {
    if (window.confirm('Ви впевнені, що хочете видалити цю книгу?')) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Каталог книг для обміну</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Шукайте цікаві книги інших користувачів та пропонуйте обмін
          </p>
        </div>

        {user && (
          <Link
            href="/me/books"
            className="inline-flex items-center justify-center px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold transition-colors"
          >
            + Додати свою книгу
          </Link>
        )}
      </div>

      <SearchBar />

      {isLoading ? (
        <div className="py-16 text-center text-sm text-slate-500">
          Завантаження списку книг...
        </div>
      ) : isError ? (
        <div className="p-6 rounded-2xl bg-red-50 border border-red-200 text-center text-sm text-red-700">
          Не вдалося завантажити книги. Перевірте, чи запущено сервер бекенду.
        </div>
      ) : !data || data.books.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <p className="text-base font-semibold text-slate-800">Книг не знайдено</p>
          <p className="text-sm text-slate-500 mt-1">
            Спробуйте змінити параметри пошуку або додайте першу книгу.
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {data.books.map((book) => (
              <BookCard
                key={book.id}
                book={book}
                onDelete={
                  user?.role === 'ADMIN' || user?.id === book.ownerId
                    ? handleDelete
                    : undefined
                }
                isDeleting={deleteMutation.isPending}
              />
            ))}
          </div>

          <Pagination
            page={data.page}
            totalPages={data.totalPages}
            onPageChange={setPage}
          />
        </>
      )}
    </div>
  );
}

