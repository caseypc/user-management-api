// Front end types for user management UI
export type UserRole = 'admin' | 'manager' | 'user';
export type UserStatus = 'active' | 'inactive' | 'pending';
export type UserSortField =
    | 'id'
    | 'firstName'
    | 'lastName'
    | 'email'
    | 'role'
    | 'status'
    | 'createdAt'
    | 'updatedAt';
export type SortDirection = 'ASC' | 'DESC';

export interface User {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    role: UserRole;
    status: UserStatus;
    createdAt: string;
    updatedAt: string;
}

export interface UsersResponse {
    data: User[];
    meta: {
        page: number;
        perPage: number;
        total: number;
        totalPages: number;
        search?: string | null;
        sortBy?: UserSortField;
        sortDir?: SortDirection;
    };
}

export interface UserResponse {
    data: User;
    message?: string;
}

export interface UserFormValues {
    firstName: string;
    lastName: string;
    email: string;
    role: UserRole;
    status: UserStatus;
}