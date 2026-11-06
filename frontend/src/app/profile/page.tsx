'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import { AxiosError } from 'axios';
import toast from 'react-hot-toast';
import { useAuthStore } from '@/lib/store/authStore';
import { updateProfile, getMe, updateExchangeStatus } from '@/lib/api/clientApi';

export default function ProfilePage() {
  const router = useRouter();
  const { user, isInitialized, updateUser } = useAuthStore();
  const [updatingRequestId, setUpdatingRequestId] = useState<number | null>(null);

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

  const initialValues = {
    name: user.name || '',
    email: user.email || '',
    avatar: user.avatar || '',
  };

  const validate = (values: typeof initialValues) => {
    const errors: Partial<Record<keyof typeof initialValues, string>> = {};
    if (!values.name.trim()) errors.name = "Ім'я не може бути порожнім";
    if (!values.email.trim()) errors.email = 'Email обов’язковий';
    return errors;
  };

  const handleUpdateStatus = async (requestId: number, newStatus: 'ACCEPTED' | 'REJECTED') => {
    setUpdatingRequestId(requestId);
    try {
      await updateExchangeStatus(requestId, newStatus);
      const freshUser = await getMe();
      updateUser(freshUser);
      toast.success(
        newStatus === 'ACCEPTED'
          ? 'Запит на обмін прийнято!'
          : 'Запит на обмін відхилено'
      );
    } catch (err) {
      const axiosErr = err as AxiosError<{ message?: string }>;
      toast.error(
        axiosErr.response?.data?.message || 'Не вдалося оновити статус запиту'
      );
    } finally {
      setUpdatingRequestId(null);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Профіль користувача</h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Керуйте своїми персональними даними та переглядайте активність
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Моїх книг
          </p>
          <p className="text-3xl font-extrabold text-indigo-600 mt-2">
            {user._count?.books ?? 0}
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Отримано запитів
          </p>
          <p className="text-3xl font-extrabold text-emerald-600 mt-2">
            {user._count?.receivedRequests ?? 0}
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Роль у системі
          </p>
          <p className="text-xl font-bold text-slate-800 mt-3">{user.role}</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm">
        <h2 className="text-lg font-bold text-slate-900 mb-6">Редагування профілю</h2>

        <Formik
          initialValues={initialValues}
          validate={validate}
          onSubmit={async (values, { setSubmitting }) => {
            try {
              await updateProfile(values);
              const fresh = await getMe();
              updateUser(fresh);
              toast.success('Профіль успішно оновлено!');
            } catch (err) {
              const axiosErr = err as AxiosError<{ message?: string }>;
              toast.error(
                axiosErr.response?.data?.message || 'Не вдалося оновити профіль'
              );
            } finally {
              setSubmitting(false);
            }
          }}
        >
          {({ isSubmitting, setFieldValue }) => (
            <Form className="space-y-4 max-w-xl">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Ім&apos;я
                </label>
                <Field
                  name="name"
                  type="text"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <ErrorMessage
                  name="name"
                  component="p"
                  className="text-xs text-red-600 mt-1"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Email
                </label>
                <Field
                  name="email"
                  type="email"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <ErrorMessage
                  name="email"
                  component="p"
                  className="text-xs text-red-600 mt-1"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Аватар (URL або вибір фото)
                </label>
                <div className="flex gap-3">
                  <Field
                    name="avatar"
                    type="text"
                    placeholder="https://..."
                    className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <label className="px-4 py-2.5 rounded-xl border border-slate-300 bg-slate-50 hover:bg-slate-100 text-xs font-medium text-slate-700 cursor-pointer text-center whitespace-nowrap transition-colors">
                    Обрати...
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          if (typeof reader.result === 'string') {
                            setFieldValue('avatar', reader.result);
                          }
                        };
                        reader.readAsDataURL(file);
                      }}
                    />
                  </label>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm font-semibold transition-colors"
                >
                  {isSubmitting ? 'Збереження...' : 'Зберегти зміни'}
                </button>
              </div>
            </Form>
          )}
        </Formik>
      </div>

      {user.receivedRequests && user.receivedRequests.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900 mb-4">
            Отримані запити на обмін ваших книг
          </h2>
          <div className="divide-y divide-slate-100">
            {user.receivedRequests.map((req) => {
              const isPending = req.status === 'PENDING';
              const isAccepted = req.status === 'ACCEPTED';
              const isRejected = req.status === 'REJECTED';

              return (
                <div
                  key={req.id}
                  className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div>
                    <p className="text-sm font-semibold text-slate-900">
                      Книга: «{req.book.name}»
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Запит від:{' '}
                      <span className="font-medium text-slate-700">
                        {req.sender.name}
                      </span>{' '}
                      (<a href={`mailto:${req.sender.email}`} className="text-indigo-600 underline">{req.sender.email}</a>)
                    </p>
                    <p className="text-[11px] text-slate-400 mt-1">
                      {new Date(req.createdAt).toLocaleString('uk-UA')}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    {isPending ? (
                      <>
                        <button
                          type="button"
                          disabled={updatingRequestId === req.id}
                          onClick={() => handleUpdateStatus(req.id, 'ACCEPTED')}
                          className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-semibold transition-colors"
                        >
                          ✓ Прийняти
                        </button>
                        <button
                          type="button"
                          disabled={updatingRequestId === req.id}
                          onClick={() => handleUpdateStatus(req.id, 'REJECTED')}
                          className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-red-50 hover:text-red-600 disabled:opacity-50 text-slate-600 text-xs font-semibold transition-colors"
                        >
                          ✕ Відхилити
                        </button>
                      </>
                    ) : (
                      <span
                        className={`text-xs px-3 py-1 rounded-full font-semibold ${
                          isAccepted
                            ? 'bg-emerald-100 text-emerald-800'
                            : isRejected
                            ? 'bg-red-100 text-red-800'
                            : 'bg-indigo-50 text-indigo-700'
                        }`}
                      >
                        {isAccepted
                          ? '✓ Прийнято'
                          : isRejected
                          ? '✕ Відхилено'
                          : req.status}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
