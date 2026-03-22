import { apiClient } from "../api/apiCalls";
import type { DayAvailability, Skill, SkillLevel, User } from "../types/types";

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

interface BackendDayAvailability {
    day_of_week: number;
    hours: number[];
    enabled: boolean;
}

interface BackendUserSkill {
    name: string;
    level: SkillLevel;
}

interface BackendCurrentUserSettings extends BackendCurrentUser {
    skills: BackendUserSkill[];
    default_availability: BackendDayAvailability[];
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

function toAppSkill(record: BackendUserSkill): Skill {
    return {
        name: record.name,
        level: record.level,
    };
}

function toAppAvailability(record: BackendDayAvailability): DayAvailability {
    return {
        dayOfWeek: record.day_of_week,
        hours: Array.isArray(record.hours)
            ? record.hours.filter((hour) => Number.isFinite(hour)).map((hour) => Number(hour))
            : [],
        enabled: Boolean(record.enabled),
    };
}

function toAppCurrentUser(record: BackendCurrentUserSettings): User {
    return {
        id: record.id,
        name: record.full_name && record.full_name.trim().length > 0 ? record.full_name : record.username,
        email: record.email,
        role: record.role,
        studentId: record.role === "student" ? record.username : undefined,
        skills: Array.isArray(record.skills) ? record.skills.map(toAppSkill) : [],
        defaultAvailability: Array.isArray(record.default_availability)
            ? record.default_availability.map(toAppAvailability)
            : [],
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

export async function fetchCurrentUserSettingsAsAppUser(): Promise<User> {
    const response = await apiClient.get<BackendCurrentUserSettings>("/api/users/me/settings");
    return toAppCurrentUser(response.data);
}

interface UpdateCurrentUserSettingsPayload {
    full_name?: string;
    skills?: BackendUserSkill[];
    default_availability?: BackendDayAvailability[];
}

interface UpdateCurrentUserSettingsRequest {
    fullName?: string;
    skills?: Skill[];
    defaultAvailability?: DayAvailability[];
}

export async function updateCurrentUserSettings(
    request: UpdateCurrentUserSettingsRequest,
): Promise<User> {
    const payload: UpdateCurrentUserSettingsPayload = {};

    if (request.fullName !== undefined) {
        payload.full_name = request.fullName;
    }

    if (request.skills !== undefined) {
        payload.skills = request.skills.map((skill) => ({
            name: skill.name,
            level: skill.level,
        }));
    }

    if (request.defaultAvailability !== undefined) {
        payload.default_availability = request.defaultAvailability.map((slot) => ({
            day_of_week: slot.dayOfWeek,
            hours: slot.hours,
            enabled: slot.enabled,
        }));
    }

    const response = await apiClient.put<BackendCurrentUserSettings>("/api/users/me/settings", payload);
    return toAppCurrentUser(response.data);
}
