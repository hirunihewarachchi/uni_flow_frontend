
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL
    ? import.meta.env.VITE_API_URL
    : "http://localhost:3000/api/v1";

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
