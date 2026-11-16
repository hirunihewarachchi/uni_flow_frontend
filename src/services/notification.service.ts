import api from "./api";

export const getMyNotifications = async () => {
    const response = await api.get("/notifications");
    return response.data.data;
};

export const markNotificationAsRead = async (id: string) => {
    const response = await api.patch(`/notifications/${id}/read`);
    return response.data.data;
};

export const markAllNotificationsAsRead = async () => {
    const response = await api.post("/notifications/mark-all-read");
    return response.data;
};
