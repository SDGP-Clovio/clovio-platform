import { apiClient } from "../api/apiCalls";
import type { User } from "../types/types";

interface BackendUserRecord {
    id: number;
    email: string;
    username: string;
    full_name: string | null;
    role: "student" | "supervisor";
    is_active: boolean;
}

interface BackendCurrentUser {
    id: number;
    email: string;
    username: string;
    full_name: string;
    role: "student" | "supervisor";
    is_active: boolean;
}

function toAppUser(record: BackendUserRecord): User {
    return {
        id: record.id,
        name: record.full_name && record.full_name.trim().length > 0 ? record.full_name : record.username,
        email: record.email,
        role: record.role,
        studentId: record.role === "student" ? record.username : undefined,
    };
}

export async function fetchUsers(): Promise<User[]> {
    const response = await apiClient.get<BackendUserRecord[]>("/api/users");
    return response.data
        .filter((record) => record.is_active)
        .map(toAppUser);
}

export async function fetchCurrentUserAsAppUser(): Promise<User> {
    const response = await apiClient.get<BackendCurrentUser>("/api/v1/auth/me");
    const me = response.data;

    return {
        id: me.id,
        name: me.full_name && me.full_name.trim().length > 0 ? me.full_name : me.username,
        email: me.email,
        role: me.role,
        studentId: me.role === "student" ? me.username : undefined,
    };
}
