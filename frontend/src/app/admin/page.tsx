'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { useAuthStore } from '@/lib/store/authStore';
import {
  useAdminUsers,
  useCreateAdminUser,
  useUpdateAdminUser,
  useDeleteAdminUser,
} from '@/hooks/useAdmin';
import UserFormModal from '@/components/UserFormModal/UserFormModal';
import { User, Role } from '@/types';

export default function AdminPage() {
  const router = useRouter();
  const { user, isInitialized } = useAuthStore();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [userToEdit, setUserToEdit] = useState<User | null>(null);

  const isAdmin = user?.role === 'ADMIN';

  const { data: users, isLoading } = useAdminUsers(isInitialized && isAdmin);
  const createMutation = useCreateAdminUser();
  const updateMutation = useUpdateAdminUser();
  const deleteMutation = useDeleteAdminUser();

  useEffect(() => {
    if (isInitialized && (!user || user.role !== 'ADMIN')) {
      router.push('/books');
    }
  }, [isInitialized, user, router]);

  if (!isInitialized || !user || user.role !== 'ADMIN') {
    return (
      <div className="py-16 text-center text-sm text-slate-500">
        Перевірка прав доступу...
      </div>
    );
  }

  const handleOpenCreate = () => {
    setUserToEdit(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (targetUser: User) => {
    setUserToEdit(targetUser);
    setIsModalOpen(true);
  };

  const handleDelete = async (targetUser: User) => {
    if (targetUser.id === user.id) {
      toast.error('Ви не можете видалити власний акаунт!');
      return;
    }
    if (
      window.confirm(
        `Ви впевнені, що хочете видалити користувача ${targetUser.name} (${targetUser.email})? Всі його книги також будуть видалені.`
      )
    ) {
      try {
        await deleteMutation.mutateAsync(targetUser.id);
        toast.success(`Користувача ${targetUser.name} видалено`);
      } catch {
        toast.error('Не вдалося видалити користувача');
      }
    }
  };

  const handleSubmitModal = async (values: {
    name: string;
    email: string;
    password: string;
    role: Role;
  }) => {
    try {
      if (userToEdit) {
        await updateMutation.mutateAsync({
          id: userToEdit.id,
          data: values,
        });
        toast.success('Дані користувача оновлено');
      } else {
        await createMutation.mutateAsync(values);
        toast.success('Користувача успішно створено');
      }
    } catch {
      toast.error('Не вдалося зберегти користувача');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900">Адмін-панель</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800">
              ADMIN
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Керування користувачами сервісу та доступ до модерації книг
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenCreate}
          className="inline-flex items-center justify-center px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold transition-colors"
        >
          + Створити користувача
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="font-bold text-slate-900 text-base">
            Користувачі сервісу ({users?.length || 0})
          </h2>
        </div>

        {isLoading ? (
          <div className="py-12 text-center text-sm text-slate-500">
            Завантаження користувачів...
          </div>
        ) : !users || users.length === 0 ? (
          <div className="py-12 text-center text-sm text-slate-500">
            Користувачів не знайдено
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-6">ID</th>
                  <th className="py-3 px-6">Користувач</th>
                  <th className="py-3 px-6">Email</th>
                  <th className="py-3 px-6">Роль</th>
                  <th className="py-3 px-6">Книг</th>
                  <th className="py-3 px-6">Дата реєстрації</th>
                  <th className="py-3 px-6 text-right">Дії</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((u) => {
                  const isCurrent = u.id === user.id;
                  return (
                    <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-6 font-mono text-xs text-slate-400">
                        #{u.id}
                      </td>
                      <td className="py-3.5 px-6 font-medium text-slate-900 flex items-center gap-2">
                        <span>{u.name}</span>
                        {isCurrent && (
                          <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-semibold">
                            Ви
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-6 text-slate-600">{u.email}</td>
                      <td className="py-3.5 px-6">
                        <span
                          className={`text-xs px-2.5 py-0.5 rounded-full font-semibold ${
                            u.role === 'ADMIN'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {u.role}
                        </span>
                      </td>
                      <td className="py-3.5 px-6">
                        <span className="font-semibold text-slate-800">
                          {u._count?.books ?? 0}
                        </span>
                      </td>
                      <td className="py-3.5 px-6 text-xs text-slate-400">
                        {new Date(u.createdAt).toLocaleDateString('uk-UA')}
                      </td>
                      <td className="py-3.5 px-6 text-right space-x-2">
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(u)}
                          className="px-2.5 py-1 rounded-lg border border-slate-200 hover:bg-slate-100 text-xs font-medium text-slate-700 transition-colors"
                        >
                          Редагувати
                        </button>
                        <button
                          type="button"
                          disabled={isCurrent || deleteMutation.isPending}
                          onClick={() => handleDelete(u)}
                          className="px-2.5 py-1 rounded-lg bg-red-50 hover:bg-red-100 text-xs font-semibold text-red-600 transition-colors disabled:opacity-30 disabled:pointer-events-none"
                        >
                          Видалити
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <UserFormModal
        isOpen={isModalOpen}
        userToEdit={userToEdit}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmitModal}
      />
    </div>
  );
}

