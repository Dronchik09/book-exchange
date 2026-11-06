import bcrypt from 'bcryptjs';
import { Role } from '@prisma/client';
import { prisma } from '../utils/prisma';
import { createHttpError } from '../utils/http-error';

export const getAllUsers = async () => {
  return prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      avatar: true,
      createdAt: true,
      _count: {
        select: { books: true },
      },
    },
  });
};

export const createUserByAdmin = async (data: {
  name: string;
  email: string;
  password: string;
  role?: Role;
}) => {
  const name = data.name?.trim();
  const email = data.email?.trim().toLowerCase();
  const password = data.password;
  const role: Role = data.role === 'ADMIN' ? 'ADMIN' : 'USER';

  if (!name || !email || !password) {
    throw createHttpError(400, "Ім'я, email та пароль є обов'язковими");
  }

  if (password.length < 6) {
    throw createHttpError(400, 'Пароль має містити щонайменше 6 символів');
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    throw createHttpError(409, 'Користувач із таким email вже існує');
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  return prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      role,
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
      _count: {
        select: { books: true },
      },
    },
  });
};

export const updateUserByAdmin = async (
  targetUserId: number,
  data: { name?: string; email?: string; role?: Role; password?: string }
) => {
  const existing = await prisma.user.findUnique({ where: { id: targetUserId } });
  if (!existing) {
    throw createHttpError(404, 'Користувача не знайдено');
  }

  const updateData: {
    name?: string;
    email?: string;
    role?: Role;
    password?: string;
  } = {};

  if (data.name !== undefined) {
    const trimmed = data.name.trim();
    if (!trimmed) throw createHttpError(400, "Ім'я не може бути порожнім");
    updateData.name = trimmed;
  }

  if (data.email !== undefined) {
    const trimmed = data.email.trim().toLowerCase();
    if (!trimmed) throw createHttpError(400, 'Email не може бути порожнім');
    const duplicate = await prisma.user.findFirst({
      where: { email: trimmed, NOT: { id: targetUserId } },
    });
    if (duplicate) {
      throw createHttpError(409, 'Цей email вже використовується');
    }
    updateData.email = trimmed;
  }

  if (data.role === 'ADMIN' || data.role === 'USER') {
    updateData.role = data.role;
  }

  if (data.password && data.password.trim().length > 0) {
    if (data.password.length < 6) {
      throw createHttpError(400, 'Пароль має містити щонайменше 6 символів');
    }
    updateData.password = await bcrypt.hash(data.password, 10);
  }

  return prisma.user.update({
    where: { id: targetUserId },
    data: updateData,
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
      _count: {
        select: { books: true },
      },
    },
  });
};

export const deleteUserByAdmin = async (targetUserId: number, currentAdminId: number) => {
  if (targetUserId === currentAdminId) {
    throw createHttpError(400, 'Ви не можете видалити власний акаунт');
  }

  const existing = await prisma.user.findUnique({ where: { id: targetUserId } });
  if (!existing) {
    throw createHttpError(404, 'Користувача не знайдено');
  }

  await prisma.user.delete({ where: { id: targetUserId } });
  return { message: 'Користувача успішно видалено' };
};

