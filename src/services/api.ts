
import axios from "axios";

export const getApiBaseUrl = (): string => {
    let envUrl = (import.meta.env.VITE_API_URL || "").trim();
    while (envUrl.startsWith("VITE_API_URL=")) {
        envUrl = envUrl.substring("VITE_API_URL=".length).trim();
    }
    if (!envUrl) {
        return "http://localhost:3000/api/v1";
    }
    envUrl = envUrl.replace(/\/+$/, "");
    if (!envUrl.includes("/api")) {
        return `${envUrl}/api/v1`;
    }
    return envUrl;
};

const API_BASE_URL = getApiBaseUrl();

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        "Content-Type": "application/json"
    }
});

// Request interceptor to attach JWT token
api.interceptors.request.use(
    (config) => {
        const token =
            localStorage.getItem("ijse_token") ||
            localStorage.getItem("token");

        if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            console.error("Unauthorized. Please check your login.");
        }

        return Promise.reject(error);
    }
);

export default api;
