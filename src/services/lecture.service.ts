import api from "./api";

export interface LectureSchedule {
    _id: string;
    batchNumber: string;
    subject: string;
    lecturer: string;
    lecturerId?: string;
    date: string;
    startTime: string;
    endTime: string;
    room: string;
    sessionInfo?: string;
}

export interface LectureTimetableData {
    batchNumber: string;
    studentId?: string;
    lectures: LectureSchedule[];
    availableBatches?: string[];
}

export const getLectureTimetable = async (
    _token?: string,
    batchNumber?: string
): Promise<LectureTimetableData> => {
    const response = await api.get("/lectures/timetable", {
        params: batchNumber && batchNumber !== "ALL" ? { batchNumber } : undefined
    });

    return response.data.data;
};
