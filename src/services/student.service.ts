import api from "./api";

export interface StudentRegistrationPayload {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address: string;
    nic?: string;
    dateOfBirth?: string;
    courseCode: string; // e.g. "HDSE"
    batchNumber: string; // e.g. "HDSE-75"
    totalCourseFee?: number;
    initialPayment?: number;
    password?: string;
}

export const registerStudentByMarketing = async (data: StudentRegistrationPayload) => {
    const response = await api.post("/students/register", data);
    return response.data;
};

export const getAllStudents = async (params?: { search?: string; courseCode?: string; batchNumber?: string }) => {
    const response = await api.get("/students", { params });
    return response.data.data;
};

export const getStudentById = async (id: string) => {
    const response = await api.get(`/students/${id}`);
    return response.data.data;
};

export const updateStudent = async (id: string, data: any) => {
    const response = await api.put(`/students/${id}`, data);
    return response.data;
};

export const deleteStudent = async (id: string) => {
    const response = await api.delete(`/students/${id}`);
    return response.data;
};
