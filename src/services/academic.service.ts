import api from "./api";

export const getBatches = async () => {
    const response = await api.get("/academic/batches");
    return response.data.data;
};

export const createBatch = async (data: {
    batchNumber: string;
    courseCode: string;
    courseName?: string;
    startDate: string;
    endDate: string;
    status?: string;
}) => {
    const response = await api.post("/academic/batches", data);
    return response.data;
};

export const getBatchStudents = async (batchNumber: string) => {
    const response = await api.get(`/academic/batches/${batchNumber}/students`);
    return response.data.data;
};

export const getCourses = async () => {
    const response = await api.get("/academic/courses");
    return response.data.data;
};

export const getModulesByCourse = async (courseCode: string) => {
    const response = await api.get(`/academic/courses/${courseCode}/modules`);
    return response.data.data;
};

export const getLecturers = async () => {
    const response = await api.get("/academic/lecturers");
    return response.data.data;
};

export const createLecturer = async (data: any) => {
    const response = await api.post("/academic/lecturers", data);
    return response.data;
};

export const getLectures = async (params?: { batchNumber?: string; date?: string; lecturerId?: string }) => {
    const response = await api.get("/academic/lectures", { params });
    return response.data.data;
};

export const createLecture = async (data: {
    batchNumber: string;
    courseCode: string;
    moduleCode: string;
    moduleName: string;
    lecturerId: string;
    lecturerName: string;
    hallNumber: string;
    date: string;
    startTime: string;
    endTime: string;
}) => {
    const response = await api.post("/academic/lectures", data);
    return response.data;
};

export const recordAttendance = async (data: {
    lectureScheduleId: string;
    batchNumber: string;
    records: Array<{
        studentId: string;
        studentName: string;
        status: "PRESENT" | "ABSENT" | "LATE" | "EXCUSED";
        notes?: string;
    }>;
}) => {
    const response = await api.post("/academic/attendance", data);
    return response.data;
};

export const getAttendanceForLecture = async (lectureScheduleId: string) => {
    const response = await api.get(`/academic/attendance/${lectureScheduleId}`);
    return response.data.data;
};

export const getAttendanceReports = async (params?: { batchNumber?: string; startDate?: string; endDate?: string }) => {
    const response = await api.get("/academic/attendance/reports", { params });
    return response.data.data;
};
