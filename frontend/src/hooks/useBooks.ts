import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getBooks,
  getBookById,
  getMyBooks,
  createBook,
  updateBook,
  deleteBook,
  requestBookExchange,
} from '@/lib/api/clientApi';

export const useBooks = (params: {
  search?: string;
  sort?: 'asc' | 'desc' | 'newest';
  page?: number;
  limit?: number;
}) => {
  return useQuery({
    queryKey: ['books', params],
    queryFn: () => getBooks(params),
  });
};

export const useBook = (id: number) => {
  return useQuery({
    queryKey: ['book', id],
    queryFn: () => getBookById(id),
    enabled: Number.isFinite(id) && id > 0,
  });
};

export const useMyBooks = (enabled = true) => {
  return useQuery({
    queryKey: ['my-books'],
    queryFn: getMyBooks,
    enabled,
  });
};

export const useCreateBook = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createBook,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['books'] });
      queryClient.invalidateQueries({ queryKey: ['my-books'] });
    },
  });
};

export const useUpdateBook = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number;
      data: { name?: string; author?: string; photo?: string; description?: string };
    }) => updateBook(id, data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['books'] });
      queryClient.invalidateQueries({ queryKey: ['my-books'] });
      queryClient.invalidateQueries({ queryKey: ['book', variables.id] });
    },
  });
};

export const useDeleteBook = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => deleteBook(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['books'] });
      queryClient.invalidateQueries({ queryKey: ['my-books'] });
    },
  });
};

export const useRequestExchange = () => {
  return useMutation({
    mutationFn: (bookId: number) => requestBookExchange(bookId),
  });
};

