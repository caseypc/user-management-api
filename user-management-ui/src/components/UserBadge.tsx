import type { UserStatus } from '../types/user';

export function UserBadge({ status }: { status: UserStatus }) {
  const className = `user-badge user-badge--${status}`;

  return (
    <span className={className}>
      {status}
    </span>
  );
}