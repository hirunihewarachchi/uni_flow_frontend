import api from "./api";

export const getPublicDashboard = async () => {
    const response = await api.get("/public/dashboard");
    return response.data.data;
};

export const getPublicDepartments = async () => {
    const response = await api.get("/public/departments");
    return response.data.data;
};

export const getPublicCourses = async () => {
    const response = await api.get("/public/courses");
    return response.data.data;
};
