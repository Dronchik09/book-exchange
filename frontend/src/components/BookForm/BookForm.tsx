'use client';

import { Formik, Form, Field, ErrorMessage } from 'formik';
import { Book } from '@/types';

interface BookFormValues {
  name: string;
  author: string;
  photo: string;
  description: string;
}

interface BookFormProps {
  initialBook?: Book | null;
  onSubmit: (values: BookFormValues) => Promise<void>;
  onCancel?: () => void;
}

export default function BookForm({ initialBook, onSubmit, onCancel }: BookFormProps) {
  const initialValues: BookFormValues = {
    name: initialBook?.name || '',
    author: initialBook?.author || '',
    photo: initialBook?.photo || '',
    description: initialBook?.description || '',
  };

  const validate = (values: BookFormValues) => {
    const errors: Partial<Record<keyof BookFormValues, string>> = {};
    if (!values.name.trim()) {
      errors.name = 'Введіть назву книги';
    }
    if (!values.author.trim()) {
      errors.author = 'Введіть автора книги';
    }
    return errors;
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
      <h2 className="text-lg font-bold text-slate-900 mb-4">
        {initialBook ? 'Редагувати книгу' : 'Додати нову книгу'}
      </h2>

      <Formik
        enableReinitialize
        initialValues={initialValues}
        validate={validate}
        onSubmit={async (values, { setSubmitting, resetForm }) => {
          try {
            await onSubmit(values);
            if (!initialBook) {
              resetForm();
            }
          } finally {
            setSubmitting(false);
          }
        }}
      >
        {({ isSubmitting, values, setFieldValue }) => (
          <Form className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Назва книги *
                </label>
                <Field
                  name="name"
                  type="text"
                  placeholder="Наприклад: Захар Беркут"
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
                  Автор *
                </label>
                <Field
                  name="author"
                  type="text"
                  placeholder="Наприклад: Іван Франко"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <ErrorMessage
                  name="author"
                  component="p"
                  className="text-xs text-red-600 mt-1"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Обкладинка книги (URL або завантаження файлу)
              </label>
              <div className="flex flex-col sm:flex-row gap-3">
                <Field
                  name="photo"
                  type="text"
                  placeholder="https://images.unsplash.com/..."
                  className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />

                <label className="px-4 py-2.5 rounded-xl border border-slate-300 bg-slate-50 hover:bg-slate-100 text-xs font-medium text-slate-700 cursor-pointer text-center whitespace-nowrap transition-colors">
                  Обрати файл...
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
                          setFieldValue('photo', reader.result);
                        }
                      };
                      reader.readAsDataURL(file);
                    }}
                  />
                </label>
              </div>

              {values.photo && (
                <div className="mt-2 flex items-center gap-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={values.photo}
                    alt="Прев'ю"
                    className="w-12 h-16 object-cover rounded-lg border border-slate-200"
                  />
                  <button
                    type="button"
                    onClick={() => setFieldValue('photo', '')}
                    className="text-xs text-red-600 hover:underline"
                  >
                    Прибрати фото
                  </button>
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Короткий опис (опціонально)
              </label>
              <Field
                as="textarea"
                name="description"
                rows={2}
                placeholder="Стан книги, видавництво або коментар щодо обміну..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="flex items-center gap-3 pt-1">
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm font-semibold transition-colors"
              >
                {isSubmitting
                  ? 'Збереження...'
                  : initialBook
                  ? 'Зберегти зміни'
                  : 'Додати книгу'}
              </button>

              {onCancel && (
                <button
                  type="button"
                  onClick={onCancel}
                  className="px-4 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 text-sm font-medium transition-colors"
                >
                  Скасувати
                </button>
              )}
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
}

