// API client functions for user management UI
import type {
    SortDirection,
    User,
    UserFormValues,
    UserResponse,
    UsersResponse,
    UserSortField,
} from '../types/user';

const API_BASE = 'http://127.0.0.1:8000/api/users';

export interface FetchUsersParams {
    page: number;
    perPage: number;
    search: string;
    sortBy: UserSortField;
    sortDir: SortDirection;
}

async function handleResponse<T>(response: Response): Promise<T> {
    const payload = await response.json();

    if (!response.ok) {
        throw {
            status: response.status,
            message: payload?.message ?? 'Request failed.',
            errors: payload?.errors ?? {},
        };
    }

    return payload as T;
}

export async function fetchUsers(params: FetchUsersParams): Promise<UsersResponse> {
    const query = new URLSearchParams({
        page: String(params.page),
        perPage: String(params.perPage),
        search: params.search,
        sortBy: params.sortBy,
        sortDir: params.sortDir,
    });

    return handleResponse<UsersResponse>(await fetch(`${API_BASE}?${query.toString()}`));
}

export async function createUser(values: UserFormValues): Promise<UserResponse> {
    return handleResponse<UserResponse>(await fetch(API_BASE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
    }));
}

export async function updateUser(id: number, values: UserFormValues): Promise<UserResponse> {
    return handleResponse<UserResponse>(await fetch(`${API_BASE}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
    }));
}

export async function deleteUser(id: number): Promise<{ message: string }> {
    return handleResponse<{ message: string }>(await fetch(`${API_BASE}/${id}`, {
        method: 'DELETE',
    }));
}

export async function fetchUser(id: number): Promise<{ data: User }> {
    return handleResponse<{ data: User }>(await fetch(`${API_BASE}/${id}`));
}