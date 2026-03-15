import { useState } from 'react';
import { createUser, deleteUser, updateUser } from '../api/usersApi';
import type { UserFormValues } from '../types/user';

// Mutation hooks
export function useUserMutations(onSuccess: () => Promise<void> | void) {
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [formErrors, setFormErrors] = useState<Record<string, string[]>>({});
  const [message, setMessage] = useState<string | null>(null);

  async function handleCreate(values: UserFormValues) {
    setSaving(true);
    setFormErrors({});
    setMessage(null);

    try {
      const result = await createUser(values);
      setMessage(result.message ?? 'User created successfully.');
      await onSuccess();
      return true;
    } catch (err: any) {
      setMessage(err?.message ?? 'Failed to create user.');
      setFormErrors(err?.errors ?? {});
      return false;
    } finally {
      setSaving(false);
    }
  }

  async function handleUpdate(id: number, values: UserFormValues) {
    setSaving(true);
    setFormErrors({});
    setMessage(null);

    try {
      const result = await updateUser(id, values);
      setMessage(result.message ?? 'User updated successfully.');
      await onSuccess();
      return true;
    } catch (err: any) {
      setMessage(err?.message ?? 'Failed to update user.');
      setFormErrors(err?.errors ?? {});
      return false;
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: number) {
    setDeletingId(id);
    setMessage(null);

    try {
      const result = await deleteUser(id);
      setMessage(result.message ?? 'User deleted successfully.');
      await onSuccess();
    } catch (err: any) {
      setMessage(err?.message ?? 'Failed to delete user.');
    } finally {
      setDeletingId(null);
    }
  }

  return {
    saving,
    deletingId,
    formErrors,
    message,
    setMessage,
    createUser: handleCreate,
    updateUser: handleUpdate,
    deleteUser: handleDelete,
  };
}