'use client';

import { Formik, Form, Field, ErrorMessage } from 'formik';
import { User, Role } from '@/types';

interface UserFormModalProps {
  userToEdit?: User | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (values: {
    name: string;
    email: string;
    password: string;
    role: Role;
  }) => Promise<void>;
}

export default function UserFormModal({
  userToEdit,
  isOpen,
  onClose,
  onSubmit,
}: UserFormModalProps) {
  if (!isOpen) return null;

  const isEditing = Boolean(userToEdit);

  const initialValues = {
    name: userToEdit?.name || '',
    email: userToEdit?.email || '',
    password: '',
    role: (userToEdit?.role || 'USER') as Role,
  };

  const validate = (values: typeof initialValues) => {
    const errors: Partial<Record<keyof typeof initialValues, string>> = {};

    if (!values.name.trim()) {
      errors.name = "Введіть ім'я";
    }

    if (!values.email.trim()) {
      errors.email = 'Введіть email';
    } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(values.email.trim())) {
      errors.email = 'Некоректний email';
    }

    if (!isEditing && !values.password) {
      errors.password = 'Введіть пароль';
    } else if (values.password && values.password.length < 6) {
      errors.password = 'Мінімум 6 символів';
    }

    return errors;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-slate-900">
            {isEditing ? `Редагувати: ${userToEdit?.name}` : 'Створити нового користувача'}
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 text-lg leading-none"
          >
            ✕
          </button>
        </div>

        <Formik
          initialValues={initialValues}
          validate={validate}
          onSubmit={async (values, { setSubmitting }) => {
            try {
              await onSubmit(values);
              onClose();
            } finally {
              setSubmitting(false);
            }
          }}
        >
          {({ isSubmitting }) => (
            <Form className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Ім&apos;я користувача *
                </label>
                <Field
                  name="name"
                  type="text"
                  placeholder="Олександр"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <ErrorMessage
                  name="name"
                  component="p"
                  className="text-xs text-red-600 mt-1"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Email *
                </label>
                <Field
                  name="email"
                  type="email"
                  placeholder="user@example.com"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <ErrorMessage
                  name="email"
                  component="p"
                  className="text-xs text-red-600 mt-1"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {isEditing ? 'Новий пароль (залиште порожнім, щоб не змінювати)' : 'Пароль *'}
                </label>
                <Field
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <ErrorMessage
                  name="password"
                  component="p"
                  className="text-xs text-red-600 mt-1"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Роль
                </label>
                <Field
                  as="select"
                  name="role"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="USER">USER (Звичайний користувач)</option>
                  <option value="ADMIN">ADMIN (Адміністратор)</option>
                </Field>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 text-sm font-medium transition-colors"
                >
                  Скасувати
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm font-semibold transition-colors"
                >
                  {isSubmitting ? 'Збереження...' : isEditing ? 'Оновити' : 'Створити'}
                </button>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
}

