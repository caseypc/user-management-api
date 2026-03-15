import { useMemo } from 'react';
import { AgGridReact } from 'ag-grid-react';
import type { ColDef, SortChangedEvent } from 'ag-grid-community';
import type { SortDirection, User, UserSortField } from '../types/user';
import { UserBadge } from './UserBadge';

import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';

interface Props {
  users: User[];
  loading: boolean;
  page: number;
  perPage: number;
  total: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onEdit: (user: User) => void;
  onDelete: (user: User) => void;
  onSortChange: (field: UserSortField, direction: SortDirection) => void;
}

export function UsersGrid({
  users,
  loading,
  page,
  perPage,
  total,
  totalPages,
  onPageChange,
  onEdit,
  onDelete,
  onSortChange,
}: Props) {
  const columnDefs = useMemo<ColDef<User>[]>(() => [
    { field: 'id', sortable: true, width: 90 },
    { field: 'firstName', headerName: 'First Name', sortable: true, flex: 1 },
    { field: 'lastName', headerName: 'Last Name', sortable: true, flex: 1 },
    { field: 'email', sortable: true, flex: 1.4 },
    { field: 'role', sortable: true, flex: 1 },
    {
      field: 'status',
      sortable: true,
      flex: 1,
      cellRenderer: (params: { value: User['status'] }) => <UserBadge status={params.value} />,
    },
    {
      field: 'createdAt',
      headerName: 'Created',
      sortable: true,
      flex: 1.2,
      valueFormatter: (params) => new Date(params.value).toLocaleString(),
    },
    {
      headerName: 'Actions',
      sortable: false,
      width: 180,
      cellRenderer: (params: { data: User }) => (
        <div className="grid-actions">
          <button onClick={() => onEdit(params.data)}>Edit</button>
          <button onClick={() => onDelete(params.data)}>Delete</button>
        </div>
      ),
    },
  ], [onDelete, onEdit]);

  function handleSortChanged(event: SortChangedEvent<User>) {
    const sortedColumn = event.columns?.find((column) => column.getSort());

    if (!sortedColumn) {
      onSortChange('createdAt', 'DESC');
      return;
    }

    const field = sortedColumn.getColDef().field as UserSortField;
    const direction = (sortedColumn.getSort()?.toUpperCase() ?? 'ASC') as SortDirection;

    onSortChange(field, direction);
  }

  return (
    <div>
      <div className="grid-meta">
        <strong>Total:</strong> {total} users
        {loading && <span className="grid-meta__loading">Loading...</span>}
      </div>

      <div className="ag-theme-alpine" style={{ height: 460, width: '100%' }}>
        <AgGridReact<User>
          rowData={users}
          columnDefs={columnDefs}
          animateRows
          onSortChanged={handleSortChanged}
          suppressPaginationPanel
        />
      </div>

      <div className="grid-pagination">
        <button onClick={() => onPageChange(page - 1)} disabled={page <= 1 || loading}>
          Previous
        </button>

        <span>
          Page {page} of {Math.max(totalPages, 1)}
        </span>

        <button onClick={() => onPageChange(page + 1)} disabled={page >= totalPages || loading}>
          Next
        </button>

        <span>Per page: {perPage}</span>
      </div>
    </div>
  );
}