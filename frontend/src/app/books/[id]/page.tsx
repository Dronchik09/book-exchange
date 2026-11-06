'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { AxiosError } from 'axios';
import toast from 'react-hot-toast';
import { useBook, useDeleteBook, useRequestExchange } from '@/hooks/useBooks';
import { useAuthStore } from '@/lib/store/authStore';

export default function BookDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const bookId = Number(params?.id);

  const user = useAuthStore((state) => state.user);
  const { data: book, isLoading, isError } = useBook(bookId);
  const exchangeMutation = useRequestExchange();
  const deleteMutation = useDeleteBook();

  const [exchangeFeedback, setExchangeFeedback] = useState<{
    type: 'success' | 'error';
    message: string;
    previewUrl?: string | null;
  } | null>(null);

  if (isLoading) {
    return (
      <div className="py-16 text-center text-sm text-slate-500">
        Завантаження деталей книги...
      </div>
    );
  }

  if (isError || !book) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center">
        <h2 className="text-lg font-bold text-slate-900">Книгу не знайдено</h2>
        <Link
          href="/books"
          className="inline-block mt-4 px-4 py-2 rounded-xl bg-indigo-600 text-white text-sm font-medium"
        >
          ← Повернутися до каталогу
        </Link>
      </div>
    );
  }

  const isOwner = user?.id === book.ownerId;
  const isAdmin = user?.role === 'ADMIN';

  const handleExchangeRequest = async () => {
    setExchangeFeedback(null);
    try {
      const result = await exchangeMutation.mutateAsync(book.id);
      toast.success('Запит на обмін надіслано власнику!');
      setExchangeFeedback({
        type: 'success',
        message: result.message,
        previewUrl: result.emailPreviewUrl,
      });
    } catch (err) {
      const axiosErr = err as AxiosError<{ message?: string }>;
      const msg =
        axiosErr.response?.data?.message || 'Не вдалося надіслати запит на обмін';
      toast.error(msg);
      setExchangeFeedback({
        type: 'error',
        message: msg,
      });
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Ви впевнені, що хочете видалити цю книгу?')) return;
    try {
      await deleteMutation.mutateAsync(book.id);
      toast.success('Книгу видалено');
      router.push('/books');
    } catch {
      toast.error('Не вдалося видалити книгу');
    }
  };

  return (
    <div className="space-y-6">
      <Link
        href="/books"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-slate-900"
      >
        ← Назад до списку книг
      </Link>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden grid grid-cols-1 md:grid-cols-12">
        <div className="md:col-span-5 bg-slate-100 min-h-[320px] flex items-center justify-center">
          {book.photo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={book.photo}
              alt={book.name}
              className="w-full h-full max-h-[460px] object-cover"
            />
          ) : (
            <div className="p-10 text-center text-slate-400">
              <div className="text-5xl mb-2">📖</div>
              <p className="text-sm font-medium">{book.name}</p>
            </div>
          )}
        </div>

        <div className="md:col-span-7 p-6 sm:p-8 flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
                  {book.name}
                </h1>
                <p className="text-base font-medium text-indigo-600 mt-1">
                  {book.author}
                </p>
              </div>

              {isOwner && (
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700">
                  Ваша книга
                </span>
              )}
            </div>

            {book.description ? (
              <div className="pt-2">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                  Опис книги
                </h3>
                <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                  {book.description}
                </p>
              </div>
            ) : (
              <p className="text-sm text-slate-400 italic">Опис книги відсутній.</p>
            )}

            {book.owner && (
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Власник книги
                </p>
                <p className="text-sm font-bold text-slate-900 mt-1">{book.owner.name}</p>
                <p className="text-xs text-slate-500">{book.owner.email}</p>
              </div>
            )}

            {exchangeFeedback && (
              <div
                className={`p-4 rounded-xl border text-sm ${
                  exchangeFeedback.type === 'success'
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                    : 'bg-red-50 border-red-200 text-red-700'
                }`}
              >
                <p className="font-medium">{exchangeFeedback.message}</p>
                {exchangeFeedback.previewUrl && (
                  <a
                    href={exchangeFeedback.previewUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-block mt-2 text-xs font-semibold text-indigo-700 underline hover:text-indigo-900"
                  >
                    Переглянути надісланий Email-лист (Ethereal) ↗
                  </a>
                )}
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center gap-3">
            {!user ? (
              <Link
                href="/login"
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold transition-colors"
              >
                Увійдіть, щоб запросити обмін
              </Link>
            ) : isOwner ? (
              <span className="text-xs text-slate-500 bg-slate-100 px-3.5 py-2 rounded-xl">
                Ви є власником цієї книги (запит на обмін власної книги недоступний)
              </span>
            ) : (
              <button
                type="button"
                disabled={exchangeMutation.isPending}
                onClick={handleExchangeRequest}
                className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white text-sm font-semibold transition-colors shadow-sm"
              >
                {exchangeMutation.isPending
                  ? 'Надсилання листа...'
                  : 'Запросити обмін'}
              </button>
            )}

            {(isOwner || isAdmin) && (
              <button
                type="button"
                disabled={deleteMutation.isPending}
                onClick={handleDelete}
                className="px-4 py-2.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 text-sm font-semibold transition-colors"
              >
                Видалити книгу
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

