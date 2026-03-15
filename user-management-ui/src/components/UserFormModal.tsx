import { useEffect, useMemo, useState } from 'react';
import type { User, UserFormValues } from '../types/user';

interface Props {
  open: boolean;
  mode: 'create' | 'edit';
  initialUser?: User | null;
  saving: boolean;
  errors: Record<string, string[]>;
  onClose: () => void;
  onSubmit: (values: UserFormValues) => Promise<boolean>;
}

export function UserFormModal({
  open,
  mode,
  initialUser,
  saving,
  errors,
  onClose,
  onSubmit,
}: Props) {
  const initialValues = useMemo<UserFormValues>(() => ({
    firstName: initialUser?.firstName ?? '',
    lastName: initialUser?.lastName ?? '',
    email: initialUser?.email ?? '',
    role: initialUser?.role ?? 'user',
    status: initialUser?.status ?? 'pending',
  }), [initialUser]);

  const [values, setValues] = useState<UserFormValues>(initialValues);
  const [clientErrors, setClientErrors] = useState<Record<string, string[]>>({});

  useEffect(() => {
    setValues(initialValues);
    setClientErrors({});
  }, [initialValues, open]);

  if (!open) {
    return null;
  }

  function setField<K extends keyof UserFormValues>(field: K, value: UserFormValues[K]) {
    setValues((prev) => ({ ...prev, [field]: value }));
  }

  function validate(): boolean {
    const next: Record<string, string[]> = {};

    if (!values.firstName.trim()) next.firstName = ['First name is required.'];
    if (!values.lastName.trim()) next.lastName = ['Last name is required.'];

    if (!values.email.trim()) {
      next.email = ['Email is required.'];
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
      next.email = ['Email format is invalid.'];
    }

    setClientErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    if (!validate()) {
      return;
    }

    const ok = await onSubmit(values);

    if (ok) {
      onClose();
    }
  }

  const mergedErrors = { ...errors, ...clientErrors };

  return (
    <div className="modal-backdrop">
      <div className="modal-card">
        <div className="modal-card__header">
          <h2>{mode === 'create' ? 'Register User' : 'Edit User'}</h2>
          <button type="button" onClick={onClose} disabled={saving}>Close</button>
        </div>

        <form onSubmit={handleSubmit} className="user-form">
          <Field
            label="First Name"
            value={values.firstName}
            onChange={(value) => setField('firstName', value)}
            errors={mergedErrors.firstName}
          />

          <Field
            label="Last Name"
            value={values.lastName}
            onChange={(value) => setField('lastName', value)}
            errors={mergedErrors.lastName}
          />

          <Field
            label="Email"
            type="email"
            value={values.email}
            onChange={(value) => setField('email', value)}
            errors={mergedErrors.email}
          />

          <div className="form-field">
            <label>Role</label>
            <select
              value={values.role}
              onChange={(e) => setField('role', e.target.value as UserFormValues['role'])}
            >
              <option value="admin">admin</option>
              <option value="manager">manager</option>
              <option value="user">user</option>
            </select>
          </div>

          <div className="form-field">
            <label>Status</label>
            <select
              value={values.status}
              onChange={(e) => setField('status', e.target.value as UserFormValues['status'])}
            >
              <option value="active">active</option>
              <option value="inactive">inactive</option>
              <option value="pending">pending</option>
            </select>
          </div>

          <div className="modal-card__actions">
            <button type="submit" disabled={saving}>
              {saving ? 'Saving...' : mode === 'create' ? 'Create User' : 'Save Changes'}
            </button>
            <button type="button" onClick={onClose} disabled={saving}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  errors,
  type = 'text',
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  errors?: string[];
  type?: string;
}) {
  return (
    <div className="form-field">
      <label>{label}</label>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} />
      {errors?.map((error) => (
        <div key={error} className="form-error">{error}</div>
      ))}
    </div>
  );
}