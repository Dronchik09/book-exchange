'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import BookForm from '@/components/BookForm/BookForm';
import BookCard from '@/components/BookCard/BookCard';
import { useAuthStore } from '@/lib/store/authStore';
import {
  useMyBooks,
  useCreateBook,
  useUpdateBook,
  useDeleteBook,
} from '@/hooks/useBooks';
import { Book } from '@/types';

export default function MyBooksPage() {
  const router = useRouter();
  const { user, isInitialized } = useAuthStore();
  const [editingBook, setEditingBook] = useState<Book | null>(null);

  const { data: books, isLoading } = useMyBooks(Boolean(user));
  const createMutation = useCreateBook();
  const updateMutation = useUpdateBook();
  const deleteMutation = useDeleteBook();

  useEffect(() => {
    if (isInitialized && !user) {
      router.push('/login');
    }
  }, [isInitialized, user, router]);

  if (!isInitialized || !user) {
    return (
      <div className="py-16 text-center text-sm text-slate-500">
        Перевірка авторизації...
      </div>
    );
  }

  const handleSubmit = async (values: {
    name: string;
    author: string;
    photo: string;
    description: string;
  }) => {
    try {
      if (editingBook) {
        await updateMutation.mutateAsync({
          id: editingBook.id,
          data: values,
        });
        toast.success('Книгу успішно оновлено!');
        setEditingBook(null);
      } else {
        await createMutation.mutateAsync(values);
        toast.success('Книгу успішно додано до вашої бібліотеки!');
      }
    } catch {
      toast.error('Не вдалося зберегти книгу');
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Видалити цю книгу з вашої бібліотеки?')) {
      try {
        await deleteMutation.mutateAsync(id);
        toast.success('Книгу видалено');
      } catch {
        toast.error('Не вдалося видалити книгу');
      }
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Мої книги</h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Додавайте книги, якими готові обмінятися з іншими користувачами
        </p>
      </div>

      <BookForm
        initialBook={editingBook}
        onSubmit={handleSubmit}
        onCancel={editingBook ? () => setEditingBook(null) : undefined}
      />

      <div className="space-y-4">
        <h2 className="text-lg font-bold text-slate-900">
          Мій список ({books?.length || 0})
        </h2>

        {isLoading ? (
          <div className="py-12 text-center text-sm text-slate-500">
            Завантаження ваших книг...
          </div>
        ) : !books || books.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center">
            <p className="text-sm font-medium text-slate-700">
              У вас поки немає доданих книг
            </p>
            <p className="text-xs text-slate-500 mt-1">
              Скористайтеся формою вище, щоб додати першу книгу для обміну.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {books.map((book) => (
              <BookCard
                key={book.id}
                book={book}
                onEdit={(b) => {
                  setEditingBook(b);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                onDelete={handleDelete}
                isDeleting={deleteMutation.isPending}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

