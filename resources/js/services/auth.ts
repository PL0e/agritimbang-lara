import axios from "axios";

import api from "./api";

import type {
    ApiResponse,
    AuthData,
    AuthUser,
    LoginInput,
    RegisterFarmerInput,
} from "../types";

export async function login(input: LoginInput): Promise<AuthData> {
    const response = await api.post<ApiResponse<AuthData>>(
        "/auth/login",
        input,
    );

    const auth = response.data.data;

    localStorage.setItem("auth_token", auth.token);

    return auth;
}

export async function registerFarmer(
    input: RegisterFarmerInput,
): Promise<AuthData> {
    const response = await api.post<ApiResponse<AuthData>>(
        "/auth/register/farmer",
        input,
    );

    const auth = response.data.data;

    localStorage.setItem("auth_token", auth.token);

    return auth;
}

export async function getCurrentUser(): Promise<AuthUser> {
    const response = await api.get<ApiResponse<AuthUser>>("/auth/me");

    return response.data.data;
}

export async function logout(): Promise<void> {
    try {
        await api.post("/auth/logout");
    } finally {
        localStorage.removeItem("auth_token");
    }
}

export function getApiErrorMessage(
    error: unknown,
    fallback = "Something went wrong. Please try again.",
): string {
    if (!axios.isAxiosError(error)) {
        return fallback;
    }

    const data = error.response?.data as
        | {
              message?: string;
              errors?: Record<string, string[]>;
          }
        | undefined;

    if (data?.errors) {
        const firstError = Object.values(data.errors)[0]?.[0];

        if (firstError) {
            return firstError;
        }
    }

    return data?.message ?? fallback;
}
