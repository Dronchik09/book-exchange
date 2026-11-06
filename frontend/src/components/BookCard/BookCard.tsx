'use client';

import Link from 'next/link';
import { Book } from '@/types';
import { useAuthStore } from '@/lib/store/authStore';

interface BookCardProps {
  book: Book;
  onDelete?: (id: number) => void;
  onEdit?: (book: Book) => void;
  isDeleting?: boolean;
}

export default function BookCard({ book, onDelete, onEdit, isDeleting }: BookCardProps) {
  const user = useAuthStore((state) => state.user);
  const isOwner = user?.id === book.ownerId;
  const isAdmin = user?.role === 'ADMIN';

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col">
      <div className="relative h-52 bg-slate-100 overflow-hidden">
        {book.photo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={book.photo}
            alt={book.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 bg-gradient-to-br from-slate-100 to-slate-200 p-4 text-center">
            <span className="text-3xl mb-1">📚</span>
            <span className="text-xs font-medium text-slate-500 line-clamp-1">
              {book.name}
            </span>
          </div>
        )}

        {isOwner && (
          <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-600 text-white shadow">
            Моя книга
          </span>
        )}
      </div>

      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <h3 className="font-bold text-slate-900 text-base line-clamp-1" title={book.name}>
            {book.name}
          </h3>
          <p className="text-sm text-slate-600 mt-0.5 line-clamp-1">{book.author}</p>

          {book.description && (
            <p className="text-xs text-slate-500 mt-2 line-clamp-2">{book.description}</p>
          )}

          {book.owner && (
            <p className="text-xs text-slate-400 mt-3">
              Власник: <span className="text-slate-600 font-medium">{book.owner.name}</span>
            </p>
          )}
        </div>

        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
          <Link
            href={`/books/${book.id}`}
            className="flex-1 text-center py-2 px-3 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold transition-colors"
          >
            Деталі книги
          </Link>

          {onEdit && isOwner && (
            <button
              type="button"
              onClick={() => onEdit(book)}
              className="py-2 px-3 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-medium transition-colors"
            >
              Редагувати
            </button>
          )}

          {onDelete && (isOwner || isAdmin) && (
            <button
              type="button"
              disabled={isDeleting}
              onClick={() => onDelete(book.id)}
              className="py-2 px-3 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 text-xs font-semibold transition-colors disabled:opacity-50"
            >
              Видалити
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

