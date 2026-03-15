import { useCallback, useEffect, useState } from 'react';
import { fetchUsers } from '../api/usersApi';
import { useDebounce } from './useDebounce';
import type { SortDirection, User, UserSortField } from '../types/user';

// Data loading hook keeps API logic out of components.
export function useUsers(initialPage = 1, initialPerPage = 10) {
  const [users, setUsers] = useState<User[]>([]);
  const [page, setPage] = useState(initialPage);
  const [perPage] = useState(initialPerPage);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const [searchInput, setSearchInput] = useState('');
  const debouncedSearch = useDebounce(searchInput, 400);

  const [sortBy, setSortBy] = useState<UserSortField>('createdAt');
  const [sortDir, setSortDir] = useState<SortDirection>('DESC');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadUsers = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetchUsers({
        page,
        perPage,
        search: debouncedSearch,
        sortBy,
        sortDir,
      });

      setUsers(response.data);
      setTotal(response.meta.total);
      setTotalPages(response.meta.totalPages);
    } catch (err: any) {
      setError(err?.message ?? 'Failed to load users.');
    } finally {
      setLoading(false);
    }
  }, [page, perPage, debouncedSearch, sortBy, sortDir]);

  useEffect(() => {
    void loadUsers();
  }, [loadUsers]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch]);

  function updateSort(field: UserSortField, direction: SortDirection) {
    setSortBy(field);
    setSortDir(direction);
    setPage(1);
  }

  return {
    users,
    page,
    perPage,
    total,
    totalPages,
    loading,
    error,
    searchInput,
    setSearchInput,
    setPage,
    updateSort,
    refetch: loadUsers,
  };
}