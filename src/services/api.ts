import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL
    ? `${import.meta.env.VITE_API_URL}/api/v1`
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
        const token = localStorage.getItem("ijse_token") || localStorage.getItem("token");
        if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor to handle errors gracefully
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            // Optional: Handle token expiration
            // localStorage.removeItem("ijse_token");
            // localStorage.removeItem("ijse_user");
            // localStorage.removeItem("token");
            // localStorage.removeItem("user");
        }
        return Promise.reject(error);
    }
);

export default api;
