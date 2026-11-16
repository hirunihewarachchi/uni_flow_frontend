
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

const API_URL = (
    import.meta.env.VITE_API_URL || "http://localhost:3000"
).replace(/\/$/, "");

export const getLectureTimetable = async (
    token: string,
    batchNumber?: string
): Promise<LectureTimetableData> => {
    const url = new URL(`${API_URL}/api/v1/lectures/timetable`);
    if (batchNumber) {
        url.searchParams.set("batchNumber", batchNumber);
    }

    const response = await fetch(
        url.toString(),
        {
            method: "GET",
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        }
    );

    const result = await response.json();

    if (!response.ok || !result.success) {
        throw new Error(
            result.message || "Unable to load lecture timetable"
        );
    }

    return result.data as LectureTimetableData;
};
