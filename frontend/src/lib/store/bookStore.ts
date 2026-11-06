import { create } from 'zustand';

interface BookFilterState {
  search: string;
  sort: 'asc' | 'desc' | 'newest';
  page: number;
  setSearch: (search: string) => void;
  setSort: (sort: 'asc' | 'desc' | 'newest') => void;
  setPage: (page: number) => void;
  resetFilters: () => void;
}

export const useBookStore = create<BookFilterState>((set) => ({
  search: '',
  sort: 'asc',
  page: 1,

  setSearch: (search) => set({ search, page: 1 }),
  setSort: (sort) => set({ sort, page: 1 }),
  setPage: (page) => set({ page }),
  resetFilters: () => set({ search: '', sort: 'asc', page: 1 }),
}));

