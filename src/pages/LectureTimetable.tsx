
import { useContext, useEffect, useMemo, useState } from "react";
import { Navigate } from "react-router-dom";

import {
    CalendarDays,
    Clock,
    MapPin,
    BookOpen,
    Users,
    Search,
    GraduationCap,
    CheckCircle2,
    AlertCircle,
    RefreshCw
} from "lucide-react";

import { AuthContext } from "../context/AuthContext";
import {
    getLectureTimetable,
    type LectureSchedule
} from "../services/lecture.service";

type LectureStatus = "Upcoming" | "Completed";

type FilterType = "All" | LectureStatus;

const getLectureStatus = (
    lecture: LectureSchedule
): LectureStatus => {
    const endDateTime = new Date(
        `${lecture.date}T${lecture.endTime}:00`
    );

    return endDateTime.getTime() < Date.now()
        ? "Completed"
        : "Upcoming";
};

const getDuration = (
    startTime: string,
    endTime: string
): string => {
    const [startHour, startMinute] = startTime.split(":").map(Number);
    const [endHour, endMinute] = endTime.split(":").map(Number);

    const start = startHour * 60 + startMinute;
    const end = endHour * 60 + endMinute;

    const totalMinutes = end - start;

    if (!Number.isFinite(totalMinutes) || totalMinutes < 0) {
        return "N/A";
    }

    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    if (hours === 0) return `${minutes} min`;
    if (minutes === 0) return `${hours} hr`;

    return `${hours} hr ${minutes} min`;
};

const formatDate = (date: string): string => {
    const parsedDate = new Date(`${date}T00:00:00`);

    if (Number.isNaN(parsedDate.getTime())) {
        return date;
    }

    return parsedDate.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric"
    });
};

const formatTime = (time: string): string => {
    const [hours, minutes] = time.split(":").map(Number);

    if (!Number.isFinite(hours) || !Number.isFinite(minutes)) {
        return time;
    }

    const date = new Date();
    date.setHours(hours, minutes, 0, 0);

    return date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true
    });
};

function LectureTimetable() {
    const auth = useContext(AuthContext);

    if (!auth) {
        throw new Error(
            "LectureTimetable must be used inside AuthProvider"
        );
    }

    const { user, token, loading: authLoading } = auth;

    const [lectures, setLectures] = useState<LectureSchedule[]>([]);
    const [batchNumber, setBatchNumber] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedFilter, setSelectedFilter] =
        useState<FilterType>("All");

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [refreshKey, setRefreshKey] = useState(0);
    const [availableBatches, setAvailableBatches] = useState<string[]>([
        "HDSE-75",
        "HDSE-76",
        "HDSE-77"
    ]);

    const isStaffOrAdmin = user?.role && user.role !== "STUDENT";

    // Load timetable
    useEffect(() => {
        if (authLoading) return;

        if (!user || !token) {
            setLoading(false);
            return;
        }

        let isMounted = true;

        const loadTimetable = async () => {
            try {
                setLoading(true);
                setError("");

                const param = isStaffOrAdmin && batchNumber ? batchNumber : undefined;
                const result = await getLectureTimetable(token, param);

                if (!isMounted) return;

                setBatchNumber(result.batchNumber || "HDSE-75");
                setLectures(result.lectures || []);
                if (result.availableBatches?.length) {
                    setAvailableBatches(result.availableBatches);
                }

            } catch (err) {
                if (!isMounted) return;

                setError(
                    err instanceof Error
                        ? err.message
                        : "Failed to load lecture timetable"
                );

            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        loadTimetable();

        return () => {
            isMounted = false;
        };
    }, [authLoading, user, token, refreshKey, batchNumber]);

    // Calculate timetable summary
    const upcomingCount = useMemo(
        () =>
            lectures.filter(
                (lecture) => getLectureStatus(lecture) === "Upcoming"
            ).length,
        [lectures]
    );

    const completedCount = lectures.length - upcomingCount;

    // Search and filter lectures
    const filteredLectures = useMemo(() => {
        return lectures.filter((lecture) => {
            const matchesSearch = [
                lecture.subject,
                lecture.lecturer,
                lecture.room,
                lecture.sessionInfo || ""
            ]
                .join(" ")
                .toLowerCase()
                .includes(searchTerm.toLowerCase());

            const status = getLectureStatus(lecture);

            const matchesFilter =
                selectedFilter === "All" ||
                status === selectedFilter;

            return matchesSearch && matchesFilter;
        });
    }, [lectures, searchTerm, selectedFilter]);

    // Authentication checks
    if (authLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#F5F5F5]">
                <div className="text-center">
                    <RefreshCw className="w-8 h-8 animate-spin text-[#D71920] mx-auto mb-3" />
                    <p className="text-gray-600">
                        Checking authentication...
                    </p>
                </div>
            </div>
        );
    }

    if (!user || !token) {
        return <Navigate to="/login" replace />;
    }

    return (
        <div className="min-h-screen bg-[#F5F5F5] p-4 md:p-8">

            {/* Page Header */}
            <div className="mb-6">
                <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
                    <span>Academic</span>
                    <span>/</span>
                    <span className="text-[#D71920] font-medium">
                        Lecture Timetable
                    </span>
                </div>

                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                            Lecture Timetable
                        </h1>

                        <p className="text-gray-500 mt-1">
                            {isStaffOrAdmin
                                ? "View and manage scheduled batch lectures."
                                : "View your batch's scheduled lectures."}
                        </p>
                    </div>

                    <button
                        onClick={() => setRefreshKey((prev) => prev + 1)}
                        disabled={loading}
                        className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition"
                    >
                        <RefreshCw
                            size={17}
                            className={loading ? "animate-spin" : ""}
                        />
                        Refresh
                    </button>
                </div>
            </div>

            {/* Error Banner */}
            {error && (
                <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <AlertCircle size={18} className="text-red-500 shrink-0" />
                        <span>{error}</span>
                    </div>
                    <button
                        onClick={() => setRefreshKey((prev) => prev + 1)}
                        className="rounded bg-red-600 px-3 py-1 font-semibold text-white hover:bg-red-700 text-xs"
                    >
                        Try Again
                    </button>
                </div>
            )}

            {/* Batch Information */}
            <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center">
                        <GraduationCap
                            size={25}
                            className="text-[#D71920]"
                        />
                    </div>

                    <div>
                        <p className="text-sm text-gray-500">
                            {isStaffOrAdmin ? "Active Batch View" : "Your Registered Batch"}
                        </p>

                        <h2 className="text-xl font-bold text-gray-900">
                            {batchNumber || "Loading batch..."}
                        </h2>
                    </div>
                </div>

                {isStaffOrAdmin && (
                    <div className="flex items-center gap-3">
                        <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                            Select Batch:
                        </span>
                        <select
                            value={batchNumber}
                            onChange={(e) => setBatchNumber(e.target.value)}
                            className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-semibold text-gray-800 shadow-sm outline-none focus:border-[#D71920]"
                        >
                            <option value="ALL">All Batches</option>
                            {availableBatches.map((b) => (
                                <option key={b} value={b}>
                                    {b}
                                </option>
                            ))}
                        </select>
                    </div>
                )}
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">

                <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">
                                Total Lectures
                            </p>

                            <h3 className="text-2xl font-bold text-gray-900 mt-2">
                                {lectures.length}
                            </h3>
                        </div>

                        <div className="w-11 h-11 rounded-lg bg-red-50 flex items-center justify-center">
                            <BookOpen
                                className="text-[#D71920]"
                                size={22}
                            />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">
                                Upcoming Lectures
                            </p>

                            <h3 className="text-2xl font-bold text-gray-900 mt-2">
                                {upcomingCount}
                            </h3>
                        </div>

                        <div className="w-11 h-11 rounded-lg bg-blue-50 flex items-center justify-center">
                            <CalendarDays
                                className="text-blue-600"
                                size={22}
                            />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">
                                Completed Lectures
                            </p>

                            <h3 className="text-2xl font-bold text-gray-900 mt-2">
                                {completedCount}
                            </h3>
                        </div>

                        <div className="w-11 h-11 rounded-lg bg-green-50 flex items-center justify-center">
                            <CheckCircle2
                                className="text-green-600"
                                size={22}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Search and Filters */}
            <div className="bg-white rounded-xl border border-gray-200 p-4 md:p-5 mb-6 shadow-sm">
                <div className="flex flex-col lg:flex-row gap-4 lg:items-center lg:justify-between">

                    <div className="relative flex-1 max-w-xl">
                        <Search
                            size={19}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                        />

                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search subject, lecturer or venue..."
                            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg outline-none focus:border-[#D71920] focus:ring-1 focus:ring-[#D71920]"
                        />
                    </div>

                    <div className="flex flex-wrap gap-2">
                        {(["All", "Upcoming", "Completed"] as FilterType[]).map(
                            (filter) => (
                                <button
                                    key={filter}
                                    onClick={() => setSelectedFilter(filter)}
                                    className={`px-4 py-2.5 rounded-lg text-sm font-medium transition ${
                                        selectedFilter === filter
                                            ? "bg-[#D71920] text-white"
                                            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                    }`}
                                >
                                    {filter}
                                </button>
                            )
                        )}
                    </div>
                </div>
            </div>

            {/* Error Message */}
            {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 flex items-start gap-3">
                    <AlertCircle
                        className="text-red-600 shrink-0 mt-0.5"
                        size={20}
                    />

                    <div className="flex-1">
                        <p className="font-semibold text-red-800">
                            Unable to load timetable
                        </p>

                        <p className="text-sm text-red-700 mt-1">
                            {error}
                        </p>
                    </div>

                    <button
                        onClick={() => setRefreshKey((prev) => prev + 1)}
                        className="text-sm font-semibold text-red-700 hover:underline"
                    >
                        Retry
                    </button>
                </div>
            )}

            {/* Lecture Table */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">

                <div className="p-5 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-lg font-bold text-gray-900">
                                Scheduled Lectures
                            </h2>

                            <p className="text-sm text-gray-500 mt-1">
                                {filteredLectures.length} lecture(s) found
                            </p>
                        </div>

                        <div className="hidden sm:flex items-center gap-2 text-sm text-gray-500">
                            <Users size={17} />
                            <span>{batchNumber}</span>
                        </div>
                    </div>
                </div>

                {loading ? (
                    <div className="py-16 text-center">
                        <RefreshCw
                            className="w-8 h-8 animate-spin text-[#D71920] mx-auto mb-3"
                        />

                        <p className="text-gray-500">
                            Loading your lecture timetable...
                        </p>
                    </div>
                ) : filteredLectures.length === 0 ? (
                    <div className="py-16 px-5 text-center">
                        <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <CalendarDays
                                size={26}
                                className="text-gray-400"
                            />
                        </div>

                        <h3 className="text-lg font-semibold text-gray-800">
                            No lectures found
                        </h3>

                        <p className="text-sm text-gray-500 mt-2">
                            {lectures.length === 0
                                ? "There are no lectures scheduled for your batch yet."
                                : "Try changing your search or filter."}
                        </p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left min-w-[1050px]">
                            <thead className="bg-gray-50">
                                <tr className="text-xs uppercase tracking-wider text-gray-500">
                                    <th className="px-5 py-4 font-semibold">
                                        Date
                                    </th>

                                    <th className="px-5 py-4 font-semibold">
                                        Subject
                                    </th>

                                    <th className="px-5 py-4 font-semibold">
                                        Lecturer
                                    </th>

                                    <th className="px-5 py-4 font-semibold">
                                        Time
                                    </th>

                                    <th className="px-5 py-4 font-semibold">
                                        Duration
                                    </th>

                                    <th className="px-5 py-4 font-semibold">
                                        Venue
                                    </th>

                                    <th className="px-5 py-4 font-semibold">
                                        Status
                                    </th>
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-gray-100">
                                {filteredLectures.map((lecture) => {
                                    const status = getLectureStatus(lecture);

                                    return (
                                        <tr
                                            key={lecture._id}
                                            className="hover:bg-gray-50 transition"
                                        >
                                            <td className="px-5 py-4">
                                                <div className="flex items-center gap-2 text-sm text-gray-700">
                                                    <CalendarDays
                                                        size={16}
                                                        className="text-gray-400"
                                                    />

                                                    <span className="font-medium">
                                                        {formatDate(lecture.date)}
                                                    </span>
                                                </div>
                                            </td>

                                            <td className="px-5 py-4">
                                                <div className="font-semibold text-gray-900">
                                                    {lecture.subject}
                                                </div>

                                                {lecture.sessionInfo && (
                                                    <p className="text-xs text-gray-500 mt-1">
                                                        {lecture.sessionInfo}
                                                    </p>
                                                )}
                                            </td>

                                            <td className="px-5 py-4">
                                                <div className="flex items-center gap-2 text-sm text-gray-700">
                                                    <Users
                                                        size={16}
                                                        className="text-gray-400"
                                                    />

                                                    {lecture.lecturer}
                                                </div>
                                            </td>

                                            <td className="px-5 py-4">
                                                <div className="flex items-center gap-2 text-sm text-gray-700">
                                                    <Clock
                                                        size={16}
                                                        className="text-gray-400"
                                                    />

                                                    <span>
                                                        {formatTime(lecture.startTime)}
                                                        {" - "}
                                                        {formatTime(lecture.endTime)}
                                                    </span>
                                                </div>
                                            </td>

                                            <td className="px-5 py-4 text-sm text-gray-700">
                                                {getDuration(
                                                    lecture.startTime,
                                                    lecture.endTime
                                                )}
                                            </td>

                                            <td className="px-5 py-4">
                                                <div className="flex items-center gap-2 text-sm text-gray-700">
                                                    <MapPin
                                                        size={16}
                                                        className="text-gray-400"
                                                    />

                                                    {lecture.room}
                                                </div>
                                            </td>

                                            <td className="px-5 py-4">
                                                <span
                                                    className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                                                        status === "Upcoming"
                                                            ? "bg-blue-50 text-blue-700"
                                                            : "bg-green-50 text-green-700"
                                                    }`}
                                                >
                                                    {status === "Upcoming"
                                                        ? "Upcoming"
                                                        : "Completed"}
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Notice */}
            <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-xl p-4 flex items-start gap-3">
                <AlertCircle
                    size={20}
                    className="text-yellow-700 shrink-0 mt-0.5"
                />

                <div>
                    <h3 className="font-semibold text-yellow-900 text-sm">
                        Lecture Timetable Notice
                    </h3>

                    <p className="text-sm text-yellow-800 mt-1">
                        Please check your lecture dates, times and venues
                        regularly. Contact your academic department if you
                        notice any timetable errors.
                    </p>
                </div>
            </div>

            {/* Footer */}
            <div className="text-center text-sm text-gray-400 mt-8">
                IJSE | Academic Management System
            </div>
        </div>
    );
}

export default LectureTimetable;
