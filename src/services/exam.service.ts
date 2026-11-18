import api from "./api";

export const getExamTimetable = async (params?: { batchNumber?: string; courseCode?: string }) => {
    const response = await api.get("/examinations/timetable", { params });
    return response.data;
};

export const createExamSchedule = async (data: {
    batchNumber: string;
    subject?: string;
    courseCode?: string;
    moduleCode?: string;
    moduleName?: string;
    date: string;
    startTime?: string;
    endTime?: string;
    time?: string;
    venue?: string;
    hall?: string;
    examType?: string;
    type?: string;
    duration?: string;
    maxMarks?: number;
}) => {
    const response = await api.post("/examinations/timetable", data);
    return response.data;
};

export const enterMarks = async (data: {
    examinationId?: string;
    batchNumber?: string;
    subject?: string;
    moduleCode?: string;
    semester?: string;
    examType?: string;
    examDate?: string;
    publish?: boolean;
    records?: Array<{
        studentId: string;
        studentName: string;
        marks: number;
    }>;
    marks?: Array<{
        studentId: string;
        studentName: string;
        score?: number;
        marks?: number;
    }>;
    [key: string]: any;
}) => {
    const response = await api.post("/examinations/marks", data);
    return response.data;
};

export const publishResults = async (examinationId: string, isPublished: boolean) => {
    const response = await api.post("/examinations/publish", { examinationId, isPublished });
    return response.data;
};

export const getMyResults = async () => {
    const response = await api.get("/examinations/my-results");
    return response.data.data;
};

export const getAllResults = async (params?: { examinationId?: string; batchNumber?: string }) => {
    const response = await api.get("/examinations/all-results", { params });
    return response.data.data;
};
