import { api } from './api';
import {
  AuthResponse,
  Book,
  BooksPaginatedResponse,
  ExchangeResponse,
  Role,
  User,
} from '@/types';

export const registerUser = async (data: {
  name: string;
  email: string;
  password: string;
}): Promise<AuthResponse> => {
  const response = await api.post<AuthResponse>('/auth/register', data);
  return response.data;
};

export const loginUser = async (data: {
  email: string;
  password: string;
}): Promise<AuthResponse> => {
  const response = await api.post<AuthResponse>('/auth/login', data);
  return response.data;
};

export const getMe = async (): Promise<User> => {
  const response = await api.get<User>('/auth/me');
  return response.data;
};

export const updateProfile = async (data: {
  name?: string;
  email?: string;
  avatar?: string;
}): Promise<User> => {
  const response = await api.patch<User>('/auth/me', data);
  return response.data;
};

export const getBooks = async (params: {
  search?: string;
  sort?: 'asc' | 'desc' | 'newest';
  page?: number;
  limit?: number;
}): Promise<BooksPaginatedResponse> => {
  const response = await api.get<BooksPaginatedResponse>('/books', { params });
  return response.data;
};

export const getBookById = async (id: number): Promise<Book> => {
  const response = await api.get<Book>(`/books/${id}`);
  return response.data;
};

export const getMyBooks = async (): Promise<Book[]> => {
  const response = await api.get<Book[]>('/books/my');
  return response.data;
};

export const createBook = async (data: {
  name: string;
  author: string;
  photo?: string;
  description?: string;
}): Promise<Book> => {
  const response = await api.post<Book>('/books', data);
  return response.data;
};

export const updateBook = async (
  id: number,
  data: { name?: string; author?: string; photo?: string; description?: string }
): Promise<Book> => {
  const response = await api.patch<Book>(`/books/${id}`, data);
  return response.data;
};

export const deleteBook = async (id: number): Promise<{ message: string }> => {
  const response = await api.delete<{ message: string }>(`/books/${id}`);
  return response.data;
};

export const requestBookExchange = async (id: number): Promise<ExchangeResponse> => {
  const response = await api.post<ExchangeResponse>(`/books/${id}/exchange`);
  return response.data;
};

export const updateExchangeStatus = async (
  requestId: number,
  status: 'ACCEPTED' | 'REJECTED'
): Promise<{ message: string }> => {
  const response = await api.patch<{ message: string }>(
    `/books/exchange/${requestId}/status`,
    { status }
  );
  return response.data;
};

export const getAdminUsers = async (): Promise<User[]> => {
  const response = await api.get<User[]>('/admin/users');
  return response.data;
};

export const createAdminUser = async (data: {
  name: string;
  email: string;
  password: string;
  role: Role;
}): Promise<User> => {
  const response = await api.post<User>('/admin/users', data);
  return response.data;
};

export const updateAdminUser = async (
  id: number,
  data: { name?: string; email?: string; role?: Role; password?: string }
): Promise<User> => {
  const response = await api.patch<User>(`/admin/users/${id}`, data);
  return response.data;
};

export const deleteAdminUser = async (id: number): Promise<{ message: string }> => {
  const response = await api.delete<{ message: string }>(`/admin/users/${id}`);
  return response.data;
};

