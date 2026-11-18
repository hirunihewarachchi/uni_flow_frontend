import api from "./api";

export interface AdmissionInquiry {
    fullName: string;
    email: string;
    phone: string;
    dateOfBirth?: string;
    address?: string;
    courseCode?: string;
    programInterest?: string;
    preferredIntake?: string;
    qualification?: string;
    statement?: string;
    branchPreference?: string;
    message?: string;
}

export const submitAdmissionInquiry = async (data: AdmissionInquiry) => {
    const response = await api.post("/admissions", data);
    return response.data;
};

export const getAdmissionRequests = async (params?: { status?: string; search?: string }) => {
    const response = await api.get("/admissions", { params });
    return response.data.data;
};

export const updateAdmissionStatus = async (id: string, status: string, notes?: string) => {
    const response = await api.patch(`/admissions/${id}/status`, { status, notes });
    return response.data;
};
