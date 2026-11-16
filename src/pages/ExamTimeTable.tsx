
import { useMemo, useState, useEffect } from "react";
import {
  CalendarDays,
  Clock,
  MapPin,
  BookOpen,
  Users,
  Search,
  GraduationCap,
  Filter,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { getExamTimetable } from "../services/exam.service";

type Exam = {
  id: number;
  batch: string;
  subject: string;
  examType: string;
  date: string;
  startTime: string;
  endTime: string;
  duration: string;
  venue: string;
  status: "Upcoming" | "Completed";
};

const examData: Exam[] = [
  {
    id: 1,
    batch: "HDSE 75",
    subject: "Programming Fundamentals (PRF)",
    examType: "Final Examination",
    date: "2026-11-25",
    startTime: "09:00 AM",
    endTime: "12:00 PM",
    duration: "3 Hours",
    venue: "Lab 01",
    status: "Upcoming",
  },
  {
    id: 2,
    batch: "HDSE 75",
    subject: "Object Oriented Programming (OOP)",
    examType: "Final Examination",
    date: "2026-11-27",
    startTime: "09:00 AM",
    endTime: "12:00 PM",
    duration: "3 Hours",
    venue: "Hall A",
    status: "Upcoming",
  },
  {
    id: 3,
    batch: "HDSE 75",
    subject: "Database Management System",
    examType: "Final Examination",
    date: "2026-11-30",
    startTime: "01:00 PM",
    endTime: "04:00 PM",
    duration: "3 Hours",
    venue: "Lab 02",
    status: "Upcoming",
  },
  {
    id: 4,
    batch: "HDSE 75",
    subject: "Web Development",
    examType: "Practical Examination",
    date: "2026-12-03",
    startTime: "09:00 AM",
    endTime: "11:00 AM",
    duration: "2 Hours",
    venue: "Computer Lab 01",
    status: "Upcoming",
  },
  {
    id: 5,
    batch: "HDSE 75",
    subject: "Software Engineering",
    examType: "Final Examination",
    date: "2026-12-05",
    startTime: "09:00 AM",
    endTime: "12:00 PM",
    duration: "3 Hours",
    venue: "Hall B",
    status: "Upcoming",
  },
  {
    id: 6,
    batch: "HDSE 75",
    subject: "Programming Fundamentals (PRF)",
    examType: "Mid Examination",
    date: "2026-10-10",
    startTime: "09:00 AM",
    endTime: "11:00 AM",
    duration: "2 Hours",
    venue: "Hall A",
    status: "Completed",
  },
  {
    id: 7,
    batch: "HDSE 77",
    subject: "Programming Fundamentals (PRF)",
    examType: "Final Examination",
    date: "2026-12-10",
    startTime: "09:00 AM",
    endTime: "12:00 PM",
    duration: "3 Hours",
    venue: "Lab 01",
    status: "Upcoming",
  },
  {
    id: 8,
    batch: "HDSE 77",
    subject: "Database Management System",
    examType: "Final Examination",
    date: "2026-12-12",
    startTime: "01:00 PM",
    endTime: "04:00 PM",
    duration: "3 Hours",
    venue: "Hall A",
    status: "Upcoming",
  },
  {
    id: 9,
    batch: "HDSE 77",
    subject: "Object Oriented Programming (OOP)",
    examType: "Final Examination",
    date: "2026-12-15",
    startTime: "09:00 AM",
    endTime: "12:00 PM",
    duration: "3 Hours",
    venue: "Lab 02",
    status: "Upcoming",
  },
  {
    id: 10,
    batch: "CMJD 109",
    subject: "Programming Fundamentals (PRF)",
    examType: "Final Examination",
    date: "2026-11-28",
    startTime: "09:00 AM",
    endTime: "12:00 PM",
    duration: "3 Hours",
    venue: "Hall B",
    status: "Upcoming",
  },
  {
    id: 11,
    batch: "CMJD 109",
    subject: "Object Oriented Programming (OOP)",
    examType: "Practical Examination",
    date: "2026-12-01",
    startTime: "01:00 PM",
    endTime: "03:00 PM",
    duration: "2 Hours",
    venue: "Computer Lab 02",
    status: "Upcoming",
  },
  {
    id: 12,
    batch: "CAME 01",
    subject: "Python Programming for AI",
    examType: "Final Examination",
    date: "2026-12-08",
    startTime: "09:00 AM",
    endTime: "12:00 PM",
    duration: "3 Hours",
    venue: "Lab 01",
    status: "Upcoming",
  },
  {
    id: 13,
    batch: "Foundation 01",
    subject: "Introduction to Programming",
    examType: "Final Examination",
    date: "2026-12-18",
    startTime: "09:00 AM",
    endTime: "11:00 AM",
    duration: "2 Hours",
    venue: "Hall A",
    status: "Upcoming",
  },
];

const batches = [
  "HDSE 75",
  "HDSE 77",
  "CMJD 109",
  "CAME 01",
  "Foundation 01",
];

function ExamTimetable() {
  const [exams, setExams] = useState<Exam[]>(examData);
  const [selectedBatch, setSelectedBatch] = useState("HDSE 75");
  const [activeFilter, setActiveFilter] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    getExamTimetable()
      .then((data: any[]) => {
        if (data && data.length > 0) {
          const mapped: Exam[] = data.map((e: any, idx: number) => ({
            id: idx + 1,
            batch: e.batchNumber,
            subject: `${e.moduleName} (${e.moduleCode})`,
            examType: e.type || "Final Examination",
            date: e.date,
            startTime: e.time?.split("-")[0] || "09:00 AM",
            endTime: e.time?.split("-")[1] || "12:00 PM",
            duration: "3 Hours",
            venue: e.hall || "Lab 01",
            status: "Upcoming",
          }));
          setExams(mapped);
        }
      })
      .catch(() => {});
  }, []);

  const batchExams = useMemo(
    () => exams.filter((exam) => exam.batch.replace("-", " ") === selectedBatch.replace("-", " ") || exam.batch === selectedBatch),
    [exams, selectedBatch]
  );

  const filteredExams = useMemo(() => {
    return batchExams.filter((exam) => {
      const matchesFilter =
        activeFilter === "All" || exam.status === activeFilter;

      const matchesSearch = exam.subject
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

      return matchesFilter && matchesSearch;
    });
  }, [batchExams, activeFilter, searchTerm]);

  const upcomingCount = batchExams.filter(
    (exam) => exam.status === "Upcoming"
  ).length;

  const completedCount = batchExams.filter(
    (exam) => exam.status === "Completed"
  ).length;

  const formatDate = (date: string) => {
    return new Date(date + "T00:00:00").toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-[#F5F5F5] p-4 md:p-8">
      {/* Page Heading */}
      <div className="mb-7 flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <div className="mb-2 flex items-center gap-2 text-sm text-gray-500">
            <span>Academic</span>
            <span>/</span>
            <span className="font-medium text-[#D71920]">
              Exam Timetable
            </span>
          </div>

          <h1 className="text-2xl font-bold text-[#171717] md:text-3xl">
            Examination Timetable
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            View examination schedules according to your student batch.
          </p>
        </div>

        <div className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-3">
          <GraduationCap className="text-[#D71920]" size={22} />
          <div>
            <p className="text-xs text-gray-500">Selected Batch</p>
            <p className="font-semibold text-gray-800">
              {selectedBatch}
            </p>
          </div>
        </div>
      </div>

      {/* Batch Selector */}
      <div className="mb-6 rounded-xl border border-gray-200 bg-white p-5">
        <div className="mb-3 flex items-center gap-2">
          <Users size={19} className="text-[#D71920]" />
          <h2 className="font-semibold text-gray-800">
            Select Student Batch
          </h2>
        </div>

        <select
          value={selectedBatch}
          onChange={(e) => {
            setSelectedBatch(e.target.value);
            setActiveFilter("All");
            setSearchTerm("");
          }}
          className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm font-medium outline-none transition focus:border-[#D71920] md:w-80"
        >
          {batches.map((batch) => (
            <option key={batch} value={batch}>
              {batch}
            </option>
          ))}
        </select>

        <p className="mt-2 text-xs text-gray-400">
          Select a batch to view its examination timetable.
        </p>
      </div>

      {/* Summary Cards */}
      <div className="mb-7 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Exams</p>
              <h2 className="mt-2 text-3xl font-bold text-gray-900">
                {batchExams.length}
              </h2>
            </div>
            <div className="rounded-xl bg-red-50 p-3 text-[#D71920]">
              <CalendarDays size={25} />
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Upcoming Exams</p>
              <h2 className="mt-2 text-3xl font-bold text-gray-900">
                {upcomingCount}
              </h2>
            </div>
            <div className="rounded-xl bg-orange-50 p-3 text-orange-600">
              <Clock size={25} />
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Completed Exams</p>
              <h2 className="mt-2 text-3xl font-bold text-gray-900">
                {completedCount}
              </h2>
            </div>
            <div className="rounded-xl bg-green-50 p-3 text-green-600">
              <CheckCircle2 size={25} />
            </div>
          </div>
        </div>
      </div>

      {/* Timetable Section */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        <div className="border-b border-gray-200 p-5">
          <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
            <div>
              <h2 className="text-lg font-bold text-gray-900">
                {selectedBatch} Examination Schedule
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                Examination dates, times and venues.
              </p>
            </div>

            <div className="relative w-full lg:w-72">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search subject..."
                className="w-full rounded-lg border border-gray-300 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-[#D71920]"
              />
            </div>
          </div>

          {/* Filters */}
          <div className="mt-5 flex flex-wrap items-center gap-2">
            <Filter size={17} className="mr-1 text-gray-400" />

            {["All", "Upcoming", "Completed"].map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                  activeFilter === filter
                    ? "bg-[#D71920] text-white"
                    : "border border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>

        {/* Exam List */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[850px] text-left">
            <thead className="bg-gray-50 text-xs uppercase text-gray-500">
              <tr>
                <th className="px-5 py-4">Date</th>
                <th className="px-5 py-4">Subject</th>
                <th className="px-5 py-4">Exam Type</th>
                <th className="px-5 py-4">Time</th>
                <th className="px-5 py-4">Duration</th>
                <th className="px-5 py-4">Venue</th>
                <th className="px-5 py-4">Status</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {filteredExams.length > 0 ? (
                filteredExams.map((exam) => (
                  <tr
                    key={exam.id}
                    className="transition hover:bg-gray-50"
                  >
                    <td className="px-5 py-5">
                      <div className="flex items-center gap-2 whitespace-nowrap">
                        <CalendarDays
                          size={17}
                          className="text-[#D71920]"
                        />
                        <span className="text-sm font-semibold text-gray-800">
                          {formatDate(exam.date)}
                        </span>
                      </div>
                    </td>

                    <td className="px-5 py-5">
                      <div className="flex items-center gap-2">
                        <BookOpen size={17} className="text-gray-400" />
                        <span className="text-sm font-medium text-gray-800">
                          {exam.subject}
                        </span>
                      </div>
                    </td>

                    <td className="px-5 py-5 text-sm text-gray-600">
                      {exam.examType}
                    </td>

                    <td className="px-5 py-5">
                      <div className="whitespace-nowrap text-sm text-gray-700">
                        <p className="font-medium">{exam.startTime}</p>
                        <p className="text-xs text-gray-400">
                          to {exam.endTime}
                        </p>
                      </div>
                    </td>

                    <td className="px-5 py-5 text-sm text-gray-600">
                      {exam.duration}
                    </td>

                    <td className="px-5 py-5">
                      <div className="flex items-center gap-2 whitespace-nowrap text-sm text-gray-600">
                        <MapPin size={16} className="text-gray-400" />
                        {exam.venue}
                      </div>
                    </td>

                    <td className="px-5 py-5">
                      {exam.status === "Upcoming" ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-orange-50 px-3 py-1.5 text-xs font-semibold text-orange-600">
                          <AlertCircle size={13} />
                          Upcoming
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-green-50 px-3 py-1.5 text-xs font-semibold text-green-600">
                          <CheckCircle2 size={13} />
                          Completed
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-5 py-16 text-center">
                    <CalendarDays
                      size={35}
                      className="mx-auto mb-3 text-gray-300"
                    />
                    <p className="font-semibold text-gray-700">
                      No examinations found
                    </p>
                    <p className="mt-1 text-sm text-gray-400">
                      Try another filter or search term.
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="border-t border-gray-100 px-5 py-4">
          <p className="text-xs text-gray-400">
            Showing {filteredExams.length} of {batchExams.length} examinations
            for {selectedBatch}
          </p>
        </div>
      </div>

      {/* Notice */}
      <div className="mt-5 flex gap-3 rounded-xl border border-yellow-200 bg-yellow-50 p-4">
        <AlertCircle
          size={20}
          className="mt-0.5 shrink-0 text-yellow-600"
        />
        <div>
          <p className="text-sm font-semibold text-gray-800">
            Examination Notice
          </p>
          <p className="mt-1 text-sm text-gray-600">
            Please check your examination dates, starting times and venues
            carefully. Contact the Academic Department if you notice any
            timetable changes.
          </p>
        </div>
      </div>

      <p className="mt-5 text-center text-xs text-gray-400">
        IJSE | Examination Management System
      </p>
    </div>
  );
}

export default ExamTimetable;
