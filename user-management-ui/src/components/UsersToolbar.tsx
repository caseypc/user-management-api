interface Props {
  search: string;
  onSearchChange: (value: string) => void;
  onCreateClick: () => void;
}

export function UsersToolbar({ search, onSearchChange, onCreateClick }: Props) {
  return (
    <div className="users-toolbar">
      <input
        type="text"
        placeholder="Search name, email, role, status..."
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        className="users-toolbar__search"
      />

      <button type="button" onClick={onCreateClick}>
        Register User
      </button>
    </div>
  );
}