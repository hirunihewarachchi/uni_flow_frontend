import api from "./api";

export interface LoginResponse {
    success: boolean;
    message: string;
    data: {
        token: string;
        user: {
            id: string;
            firstName: string;
            lastName: string;
            email: string;
            role: string;
            institutionalId?: string;
            studentId?: string;
            mustChangePassword?: boolean;
            department?: string;
        };
    };
}

export const login = async (loginIdentifier: string, password: string): Promise<LoginResponse> => {
    const response = await api.post("/auth/login", {
        email: loginIdentifier,
        password
    });
    return response.data;
};

export const register = async (userData: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    role?: string;
}) => {
    const response = await api.post("/auth/register", userData);
    return response.data;
};

export const getMe = async () => {
    const response = await api.get("/auth/me");
    return response.data;
};

export const firstLoginPasswordChange = async (newPassword: string) => {
    const response = await api.post("/auth/first-login-password", { newPassword });
    return response.data;
};

export const changePassword = async (currentPassword: string, newPassword: string) => {
    const response = await api.post("/auth/change-password", {
        currentPassword,
        newPassword
    });
    return response.data;
};

export const forgotPassword = async (identifier: string) => {
    const response = await api.post("/auth/forgot-password", {
        identifier,
        email: identifier
    });
    return response.data;
};

export const resetPasswordWithCode = async (identifier: string, code: string, newPassword: string) => {
    const response = await api.post("/auth/reset-password", {
        identifier,
        email: identifier,
        code,
        newPassword
    });
    return response.data;
};

