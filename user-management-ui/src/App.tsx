import { useMemo, useState } from 'react';
import { UserFormModal } from './components/UserFormModal';
import { UsersGrid } from './components/UsersGrid';
import { UsersToolbar } from './components/UsersToolbar';
import { useUserMutations } from './hooks/useUserMutations';
import { useUsers } from './hooks/useUsers';
import type { User } from './types/user';
import './styles/app.scss';

export default function App() {
  const {
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
    refetch,
  } = useUsers(1, 10);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const {
    saving,
    deletingId,
    formErrors,
    message,
    setMessage,
    createUser,
    updateUser,
    deleteUser,
  } = useUserMutations(refetch);

  const modalMode = useMemo(() => (editingUser ? 'edit' : 'create'), [editingUser]);

  function openCreateModal() {
    setEditingUser(null);
    setModalOpen(true);
  }

  function openEditModal(user: User) {
    setEditingUser(user);
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
    setEditingUser(null);
  }

  async function handleDelete(user: User) {
    const confirmed = window.confirm(`Delete ${user.firstName} ${user.lastName}?`);

    if (!confirmed) {
      return;
    }

    await deleteUser(user.id);
  }

  return (
    <div className="app-shell">
      <div className="page-header">
        <h1>User Management</h1>
        <p>Manage registered users, roles, and statuses.</p>
      </div>

      <UsersToolbar
        search={searchInput}
        onSearchChange={setSearchInput}
        onCreateClick={openCreateModal}
      />

      {message && <div className="alert alert--info">{message}</div>}
      {error && <div className="alert alert--error">{error}</div>}
      {deletingId !== null && <div className="alert alert--info">Deleting user #{deletingId}...</div>}

      <UsersGrid
        users={users}
        loading={loading}
        page={page}
        perPage={perPage}
        total={total}
        totalPages={totalPages}
        onPageChange={setPage}
        onEdit={openEditModal}
        onDelete={handleDelete}
        onSortChange={updateSort}
      />

      <UserFormModal
        open={modalOpen}
        mode={modalMode}
        initialUser={editingUser}
        saving={saving}
        errors={formErrors}
        onClose={closeModal}
        onSubmit={(values) =>
          editingUser ? updateUser(editingUser.id, values) : createUser(values)
        }
      />

      <button type="button" hidden={!message} onClick={() => setMessage(null)}>
        Dismiss
      </button>
    </div>
  );
}