import { Prisma, Role } from '@prisma/client';
import { prisma } from '../utils/prisma';
import { createHttpError } from '../utils/http-error';
import { sendExchangeRequestEmail } from '../utils/mailer';
import {
  createBookSchema,
  updateBookSchema,
  updateExchangeStatusSchema,
  validateBody,
} from '../utils/validators';

export interface GetBooksQuery {
  search?: string;
  sort?: 'asc' | 'desc' | 'newest';
  page?: number;
  limit?: number;
}

export const getAllBooks = async (query: GetBooksQuery) => {
  const page = Math.max(1, Number(query.page) || 1);
  const limit = Math.min(50, Math.max(1, Number(query.limit) || 8));
  const skip = (page - 1) * limit;
  const search = query.search?.trim();

  const where: Prisma.BookWhereInput = search
    ? {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { author: { contains: search, mode: 'insensitive' } },
        ],
      }
    : {};

  let orderBy: Prisma.BookOrderByWithRelationInput = { name: 'asc' };
  if (query.sort === 'desc') {
    orderBy = { name: 'desc' };
  } else if (query.sort === 'newest') {
    orderBy = { createdAt: 'desc' };
  }

  const [books, total] = await Promise.all([
    prisma.book.findMany({
      where,
      orderBy,
      skip,
      take: limit,
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    }),
    prisma.book.count({ where }),
  ]);

  return {
    books,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit) || 1,
  };
};

export const getBookById = async (bookId: number) => {
  const book = await prisma.book.findUnique({
    where: { id: bookId },
    include: {
      owner: {
        select: {
          id: true,
          name: true,
          email: true,
          avatar: true,
        },
      },
    },
  });

  if (!book) {
    throw createHttpError(404, 'Книгу не знайдено');
  }

  return book;
};

export const getUserBooks = async (userId: number) => {
  return prisma.book.findMany({
    where: { ownerId: userId },
    orderBy: { createdAt: 'desc' },
  });
};

export const createBook = async (
  userId: number,
  rawData: unknown
) => {
  const data = validateBody(createBookSchema, rawData);

  return prisma.book.create({
    data: {
      name: data.name,
      author: data.author,
      photo: data.photo || null,
      description: data.description || null,
      ownerId: userId,
    },
    include: {
      owner: {
        select: { id: true, name: true, email: true },
      },
    },
  });
};

export const updateBook = async (
  bookId: number,
  userId: number,
  role: Role,
  rawData: unknown
) => {
  const data = validateBody(updateBookSchema, rawData);

  const existing = await prisma.book.findUnique({ where: { id: bookId } });
  if (!existing) {
    throw createHttpError(404, 'Книгу не знайдено');
  }

  if (existing.ownerId !== userId && role !== 'ADMIN') {
    throw createHttpError(403, 'Ви можете редагувати лише власні книги');
  }

  return prisma.book.update({
    where: { id: bookId },
    data: {
      name: data.name !== undefined ? data.name : existing.name,
      author: data.author !== undefined ? data.author : existing.author,
      photo: data.photo !== undefined ? data.photo : existing.photo,
      description: data.description !== undefined ? data.description : existing.description,
    },
  });
};

export const deleteBook = async (bookId: number, userId: number, role: Role) => {
  const existing = await prisma.book.findUnique({ where: { id: bookId } });
  if (!existing) {
    throw createHttpError(404, 'Книгу не знайдено');
  }

  if (existing.ownerId !== userId && role !== 'ADMIN') {
    throw createHttpError(403, 'Ви не маєте прав для видалення цієї книги');
  }

  await prisma.book.delete({ where: { id: bookId } });
  return { message: 'Книгу успішно видалено' };
};

export const requestBookExchange = async (bookId: number, senderId: number) => {
  const book = await prisma.book.findUnique({
    where: { id: bookId },
    include: {
      owner: {
        select: { id: true, name: true, email: true },
      },
    },
  });

  if (!book) {
    throw createHttpError(404, 'Книгу не знайдено');
  }

  if (book.ownerId === senderId) {
    throw createHttpError(400, 'Не можна надсилати запит на обмін власної книги');
  }

  const sender = await prisma.user.findUnique({
    where: { id: senderId },
    include: {
      books: {
        select: { id: true, name: true, author: true },
        orderBy: { createdAt: 'desc' },
      },
    },
  });

  if (!sender) {
    throw createHttpError(404, 'Відправника не знайдено');
  }

  const exchangeRequest = await prisma.exchangeRequest.create({
    data: {
      bookId: book.id,
      senderId: sender.id,
      receiverId: book.owner.id,
      status: 'PENDING',
    },
  });

  const emailResult = await sendExchangeRequestEmail({
    ownerEmail: book.owner.email,
    ownerName: book.owner.name,
    targetBook: {
      name: book.name,
      author: book.author,
    },
    sender: {
      name: sender.name,
      email: sender.email,
    },
    senderBooks: sender.books,
  });

  return {
    message: `Запит на обмін надіслано власнику книги (${book.owner.email})`,
    exchangeRequest,
    emailPreviewUrl: emailResult.previewUrl,
  };
};

export const updateExchangeStatus = async (
  requestId: number,
  userId: number,
  rawData: unknown
) => {
  const { status } = validateBody(updateExchangeStatusSchema, rawData);

  const request = await prisma.exchangeRequest.findUnique({
    where: { id: requestId },
    include: {
      book: true,
      sender: true,
      receiver: true,
    },
  });

  if (!request) {
    throw createHttpError(404, 'Запит на обмін не знайдено');
  }

  if (request.receiverId !== userId) {
    throw createHttpError(403, 'Лише власник книги може змінювати статус запиту');
  }

  const updated = await prisma.exchangeRequest.update({
    where: { id: requestId },
    data: { status },
    include: {
      book: { select: { id: true, name: true, author: true } },
      sender: { select: { id: true, name: true, email: true } },
    },
  });

  return {
    message: `Статус запиту змінено на ${status}`,
    request: updated,
  };
};

