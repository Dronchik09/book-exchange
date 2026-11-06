'use client';

import { useState, useEffect } from 'react';
import { useBookStore } from '@/lib/store/bookStore';

export default function SearchBar() {
  const { search, sort, setSearch, setSort, resetFilters } = useBookStore();
  const [localSearch, setLocalSearch] = useState(search);

  // Синхронізація локального інпуту, якщо стейт у store скинувся ззовні
  useEffect(() => {
    setLocalSearch(search);
  }, [search]);

  // Debounce: оновлюємо глобальний пошуковий стейт через 350мс після зупинки друку
  useEffect(() => {
    const handler = setTimeout(() => {
      if (localSearch !== search) {
        setSearch(localSearch);
      }
    }, 350);

    return () => clearTimeout(handler);
  }, [localSearch, search, setSearch]);

  const handleClear = () => {
    setLocalSearch('');
    setSearch('');
  };

  const handleResetAll = () => {
    setLocalSearch('');
    resetFilters();
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
      <div className="relative flex-1">
        <input
          type="text"
          value={localSearch}
          onChange={(e) => setLocalSearch(e.target.value)}
          placeholder="Пошук книги за назвою або автором..."
          className="w-full pl-4 pr-10 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
        />
        {localSearch && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-sm"
            title="Очистити пошук"
          >
            ✕
          </button>
        )}
      </div>

      <div className="flex items-center gap-2">
        <label className="text-xs font-medium text-slate-500 whitespace-nowrap">
          Сортування:
        </label>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as 'asc' | 'desc' | 'newest')}
          className="px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="asc">За алфавітом (А → Я)</option>
          <option value="desc">За алфавітом (Я → А)</option>
          <option value="newest">Спочатку нові</option>
        </select>

        {(localSearch || sort !== 'asc') && (
          <button
            type="button"
            onClick={handleResetAll}
            className="px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-600 hover:bg-slate-100 transition-colors"
          >
            Скинути
          </button>
        )}
      </div>
    </div>
  );
}
