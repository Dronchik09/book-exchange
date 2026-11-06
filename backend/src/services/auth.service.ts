import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Role } from '@prisma/client';
import { prisma } from '../utils/prisma';
import { createHttpError } from '../utils/http-error';
import {
  registerSchema,
  loginSchema,
  updateProfileSchema,
  validateBody,
} from '../utils/validators';

const generateToken = (userId: number, role: Role): string => {
  const secret = process.env.JWT_SECRET || 'book_exchange_super_secret_jwt_2026';
  return jwt.sign({ userId, role }, secret, { expiresIn: '7d' });
};

export const registerUser = async (rawData: unknown) => {
  const data = validateBody(registerSchema, rawData);
  const email = data.email.toLowerCase();

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    throw createHttpError(409, 'Користувач із таким email вже існує');
  }

  const hashedPassword = await bcrypt.hash(data.password, 10);

  const user = await prisma.user.create({
    data: {
      name: data.name,
      email,
      password: hashedPassword,
      role: 'USER',
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      avatar: true,
      createdAt: true,
    },
  });

  const token = generateToken(user.id, user.role);

  return { token, user };
};

export const loginUser = async (rawData: unknown) => {
  const data = validateBody(loginSchema, rawData);
  const email = data.email.toLowerCase();

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    throw createHttpError(401, 'Невірний email або пароль');
  }

  const isPasswordValid = await bcrypt.compare(data.password, user.password);
  if (!isPasswordValid) {
    throw createHttpError(401, 'Невірний email або пароль');
  }

  const token = generateToken(user.id, user.role);

  return {
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      createdAt: user.createdAt,
    },
  };
};

export const getCurrentUser = async (userId: number) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      avatar: true,
      createdAt: true,
      _count: {
        select: {
          books: true,
          receivedRequests: true,
          sentRequests: true,
        },
      },
      receivedRequests: {
        orderBy: { createdAt: 'desc' },
        take: 10,
        include: {
          book: { select: { id: true, name: true, author: true } },
          sender: { select: { id: true, name: true, email: true } },
        },
      },
    },
  });

  if (!user) {
    throw createHttpError(404, 'Користувача не знайдено');
  }

  return user;
};

export const updateProfile = async (
  userId: number,
  rawData: unknown
) => {
  const data = validateBody(updateProfileSchema, rawData);
  const updateData: { name?: string; email?: string; avatar?: string | null } = {};

  if (data.name !== undefined) {
    updateData.name = data.name;
  }

  if (data.email !== undefined) {
    const trimmedEmail = data.email.toLowerCase();
    const existing = await prisma.user.findFirst({
      where: { email: trimmedEmail, NOT: { id: userId } },
    });
    if (existing) {
      throw createHttpError(409, 'Цей email вже зайнятий іншим користувачем');
    }
    updateData.email = trimmedEmail;
  }

  if (data.avatar !== undefined) {
    updateData.avatar = data.avatar || null;
  }

  return prisma.user.update({
    where: { id: userId },
    data: updateData,
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      avatar: true,
      createdAt: true,
    },
  });
};

