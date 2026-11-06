'use client';

import { useState } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AxiosError } from 'axios';
import { loginUser, registerUser } from '@/lib/api/clientApi';
import { useAuthStore } from '@/lib/store/authStore';

interface AuthFormProps {
  mode: 'login' | 'register';
}

interface AuthFormValues {
  name: string;
  email: string;
  password: string;
}

export default function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);
  const [serverError, setServerError] = useState<string | null>(null);

  const isRegister = mode === 'register';

  const initialValues: AuthFormValues = {
    name: '',
    email: '',
    password: '',
  };

  const validate = (values: AuthFormValues) => {
    const errors: Partial<Record<keyof AuthFormValues, string>> = {};

    if (isRegister && !values.name.trim()) {
      errors.name = "Введіть ваше ім'я";
    }

    if (!values.email.trim()) {
      errors.email = 'Введіть email';
    } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(values.email.trim())) {
      errors.email = 'Некоректний формат email';
    }

    if (!values.password) {
      errors.password = 'Введіть пароль';
    } else if (values.password.length < 6) {
      errors.password = 'Мінімум 6 символів';
    }

    return errors;
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-slate-900">
            {isRegister ? 'Створення акаунта' : 'Вхід у BookExchange'}
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            {isRegister
              ? 'Зареєструйтеся, щоб додавати книги та обмінюватися ними'
              : 'Увійдіть до свого облікового запису'}
          </p>
        </div>

        {serverError && (
          <div className="mb-5 p-3.5 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700">
            {serverError}
          </div>
        )}

        <Formik
          initialValues={initialValues}
          validate={validate}
          onSubmit={async (values, { setSubmitting }) => {
            setServerError(null);
            try {
              const result = isRegister
                ? await registerUser({
                    name: values.name,
                    email: values.email,
                    password: values.password,
                  })
                : await loginUser({
                    email: values.email,
                    password: values.password,
                  });

              setAuth(result.token, result.user);
              router.push('/books');
            } catch (err) {
              const axiosErr = err as AxiosError<{ message?: string }>;
              setServerError(
                axiosErr.response?.data?.message || 'Сталася помилка. Спробуйте ще раз.'
              );
            } finally {
              setSubmitting(false);
            }
          }}
        >
          {({ isSubmitting, setValues }) => (
            <Form className="space-y-4">
              {isRegister && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Ім&apos;я
                  </label>
                  <Field
                    name="name"
                    type="text"
                    placeholder="Олександр Коваленко"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                  <ErrorMessage
                    name="name"
                    component="p"
                    className="text-xs text-red-600 mt-1"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Email
                </label>
                <Field
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
                <ErrorMessage
                  name="email"
                  component="p"
                  className="text-xs text-red-600 mt-1"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Пароль
                </label>
                <Field
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
                <ErrorMessage
                  name="password"
                  component="p"
                  className="text-xs text-red-600 mt-1"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white text-sm font-semibold transition-colors"
              >
                {isSubmitting
                  ? 'Завантаження...'
                  : isRegister
                  ? 'Зареєструватися'
                  : 'Увійти'}
              </button>

              {!isRegister && (
                <div className="pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() =>
                      setValues({
                        name: '',
                        email: 'admin@book.com',
                        password: 'admin123',
                      })
                    }
                    className="w-full py-2 px-3 rounded-lg bg-slate-50 hover:bg-slate-100 text-xs text-slate-600 font-medium transition-colors"
                  >
                    Підставити демо-акаунт Admin (admin@book.com / admin123)
                  </button>
                </div>
              )}
            </Form>
          )}
        </Formik>

        <div className="mt-6 text-center text-sm text-slate-600">
          {isRegister ? (
            <>
              Вже маєте акаунт?{' '}
              <Link href="/login" className="text-indigo-600 font-semibold hover:underline">
                Увійти
              </Link>
            </>
          ) : (
            <>
              Ще немає акаунта?{' '}
              <Link
                href="/register"
                className="text-indigo-600 font-semibold hover:underline"
              >
                Зареєструватися
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

