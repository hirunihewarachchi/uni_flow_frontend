import api from "./api";

export const getAdminOverview = async () => {
    const response = await api.get("/admin/overview");
    return response.data.data;
};

export const getStaff = async () => {
    const response = await api.get("/admin/staff");
    return response.data.data;
};

export const createStaff = async (data: {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    role: string;
    password?: string;
}) => {
    const response = await api.post("/admin/staff", data);
    return response.data.data;
};

export const toggleStaffStatus = async (id: string) => {
    const response = await api.put(`/admin/staff/${id}/status`);
    return response.data.data;
};

export const resetStaffPassword = async (id: string, password?: string) => {
    const response = await api.post(`/admin/staff/${id}/reset-password`, { password });
    return response.data.data;
};

export const deleteStaff = async (id: string) => {
    const response = await api.delete(`/admin/staff/${id}`);
    return response.data.data;
};

export const getWebsiteContent = async () => {
    const response = await api.get("/admin/website");
    return response.data.data;
};

export const updateWebsiteContent = async (data: any) => {
    const response = await api.put("/admin/website", data);
    return response.data.data;
};

export const getAnnouncements = async () => {
    const response = await api.get("/admin/announcements");
    return response.data.data;
};

export const createAnnouncement = async (data: {
    title: string;
    description?: string;
    content?: string;
    status?: "DRAFT" | "PUBLISHED";
}) => {
    const response = await api.post("/admin/announcements", data);
    return response.data.data;
};

export const updateAnnouncement = async (id: string, data: any) => {
    const response = await api.put(`/admin/announcements/${id}`, data);
    return response.data.data;
};

export const deleteAnnouncement = async (id: string) => {
    const response = await api.delete(`/admin/announcements/${id}`);
    return response.data.data;
};

export const getAdminCourses = async () => {
    const response = await api.get("/admin/courses");
    return response.data.data;
};

export const createAdminCourse = async (data: any) => {
    const response = await api.post("/admin/courses", data);
    return response.data.data;
};

export const updateAdminCourse = async (id: string, data: any) => {
    const response = await api.put(`/admin/courses/${id}`, data);
    return response.data.data;
};

export const deleteAdminCourse = async (id: string) => {
    const response = await api.delete(`/admin/courses/${id}`);
    return response.data.data;
};

export const getActivityLogs = async () => {
    const response = await api.get("/admin/activity");
    return response.data.data;
};
