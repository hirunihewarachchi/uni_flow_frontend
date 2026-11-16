import api from "./api";

export const getFinanceOverview = async () => {
    const response = await api.get("/finance/overview");
    return response.data.data;
};

export const getStudentPayments = async (params?: { search?: string; status?: string; batchNumber?: string }) => {
    const response = await api.get("/finance/student-payments", { params });
    return response.data.data;
};

export const recordManualPayment = async (data: {
    studentId: string;
    amount: number;
    method: "Bank Transfer" | "Card" | "Cash";
    reference: string;
    notes?: string;
}) => {
    const response = await api.post("/finance/payments", data);
    return response.data;
};

export const createOnlinePaymentSession = async (amount: number) => {
    const response = await api.post("/finance/online-payment/session", { amount });
    return response.data;
};

export const verifyPayment = async (sessionId: string) => {
    const response = await api.post("/finance/online-payment/verify", { sessionId });
    return response.data;
};

export const getPaymentTransactions = async (params?: { studentId?: string; batchNumber?: string }) => {
    const response = await api.get("/finance/transactions", { params });
    return response.data.data;
};

export const sendPaymentWarning = async (data: {
    studentId: string;
    stage: "FIRST" | "SECOND" | "FINAL_SUSPENSION";
    message: string;
}) => {
    const response = await api.post("/finance/warnings", data);
    return response.data;
};

export const getMyFinance = async () => {
    const response = await api.get("/finance/my-finance");
    return response.data.data;
};
