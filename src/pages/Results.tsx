import { useMemo, useState, useEffect } from "react";
import {
  Award,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  Clock,
  GraduationCap,
  LockKeyhole,
  Search,
  TrendingUp,
  XCircle,
} from "lucide-react";
import { getMyResults } from "../services/exam.service";
import { useAuth } from "../hooks/UseAuth";

type ExamResult = {
  id: number;
  subject: string;
  examType: string;
  semester: string;
  examDate: string;
  marks: number;
  totalMarks: number;
  grade: string;
  status: "Passed" | "Failed" | "Pending";
};

function Results() {
  const { user } = useAuth();
  const [results, setResults] = useState<ExamResult[]>([]);
  const [selectedSemester, setSelectedSemester] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMyResults()
      .then((data: any[]) => {
        if (data && Array.isArray(data)) {
          const mapped: ExamResult[] = data.map((r: any, idx: number) => ({
            id: idx + 1,
            subject: r.subject || r.moduleName || r.moduleCode || "Examination",
            examType: r.examType || "Final Examination",
            semester: r.semester || "Semester 1",
            examDate: r.examDate || (r.createdAt ? new Date(r.createdAt).toISOString().slice(0, 10) : ""),
            marks: r.marks ?? r.score ?? 0,
            totalMarks: r.totalMarks || 100,
            grade: r.grade || (r.marks >= 75 ? "A" : r.marks >= 65 ? "B" : r.marks >= 50 ? "C" : r.marks >= 35 ? "S" : "F"),
            status: r.status || (r.marks >= 50 ? "Passed" : "Failed"),
          }));
          setResults(mapped);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filteredResults = useMemo(() => {
    return results.filter((result) => {
      const matchesSemester =
        selectedSemester === "All" ||
        result.semester === selectedSemester;

      const matchesSearch = result.subject
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

      return matchesSemester && matchesSearch;
    });
  }, [results, selectedSemester, searchTerm]);

  const publishedResults = results.filter(
    (result) => result.status !== "Pending"
  );

  const passedCount = publishedResults.filter(
    (result) => result.status === "Passed"
  ).length;

  const failedCount = publishedResults.filter(
    (result) => result.status === "Failed"
  ).length;

  const averageMarks =
    publishedResults.length > 0
      ? Math.round(
          publishedResults.reduce(
            (total, result) => total + result.marks,
            0
          ) / publishedResults.length
        )
      : 0;

  const getGradeColor = (grade: string) => {
    if (grade === "A" || grade === "A+") {
      return "bg-green-50 text-green-700";
    }

    if (grade === "B" || grade === "B+") {
      return "bg-blue-50 text-blue-700";
    }

    if (grade === "C") {
      return "bg-yellow-50 text-yellow-700";
    }

    return "bg-gray-100 text-gray-600";
  };

  const formatDate = (date: string) => {
    if (!date) return "";
    return new Date(date + "T00:00:00").toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const studentDisplayName = user ? `${user.firstName} ${user.lastName}`.trim() : "Student";
  const studentDisplayId = user?.studentId || "STU";
  const studentDisplayBatch = user?.batchNumber || "Assigned Batch";

  return (
    <div className="min-h-screen bg-[#F5F5F5] p-4 md:p-8">
      {/* Header */}
      <div className="mb-7 flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <div className="mb-2 flex items-center gap-2 text-sm text-gray-500">
            <span>Student Portal</span>
            <span>/</span>
            <span className="font-medium text-[#D71920]">
              Examination Results
            </span>
          </div>

          <h1 className="text-2xl font-bold text-[#171717] md:text-3xl">
            My Examination Results
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            Official module exam results recorded and published by the Examination Officer.
          </p>
        </div>

        {/* Student Profile Card */}
        <div className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <div className="rounded-xl bg-red-50 p-3 text-[#D71920]">
            <GraduationCap size={24} />
          </div>

          <div>
            <p className="font-bold text-gray-900">
              {studentDisplayName}
            </p>
            <p className="text-xs text-gray-500">
              {studentDisplayId} · Batch: {studentDisplayBatch}
            </p>
          </div>
        </div>
      </div>

      {/* Privacy Notice */}
      <div className="mb-6 flex gap-3 rounded-xl border border-blue-200 bg-blue-50 p-4">
        <LockKeyhole
          size={20}
          className="mt-0.5 shrink-0 text-blue-600"
        />
        <div>
          <p className="text-sm font-semibold text-blue-900">
            Private Academic Records
          </p>
          <p className="mt-1 text-sm text-blue-800">
            These results are tied to your authenticated student account. You can only view
            your own verified marks.
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="mb-7 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Published Exams</p>
              <h2 className="mt-2 text-3xl font-bold text-gray-900">
                {publishedResults.length}
              </h2>
            </div>
            <div className="rounded-xl bg-red-50 p-3 text-[#D71920]">
              <BookOpen size={24} />
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Average Marks</p>
              <h2 className="mt-2 text-3xl font-bold text-gray-900">
                {averageMarks}%
              </h2>
            </div>
            <div className="rounded-xl bg-blue-50 p-3 text-blue-600">
              <TrendingUp size={24} />
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Passed</p>
              <h2 className="mt-2 text-3xl font-bold text-green-600">
                {passedCount}
              </h2>
            </div>
            <div className="rounded-xl bg-green-50 p-3 text-green-600">
              <CheckCircle2 size={24} />
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Failed</p>
              <h2 className="mt-2 text-3xl font-bold text-red-600">
                {failedCount}
              </h2>
            </div>
            <div className="rounded-xl bg-red-50 p-3 text-red-600">
              <XCircle size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Results Table Section */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        <div className="border-b border-gray-200 p-5">
          <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
            <div>
              <h2 className="text-lg font-bold text-gray-900">
                Module Performance Summary
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                Breakdown of grades and scores by examination module.
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
                placeholder="Search module..."
                className="w-full rounded-lg border border-gray-300 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-[#D71920]"
              />
            </div>
          </div>

          {/* Semester Filter */}
          <div className="mt-5 flex flex-wrap gap-2">
            {["All", "Semester 1", "Semester 2", "Semester 3", "Semester 4"].map(
              (semester) => (
                <button
                  key={semester}
                  onClick={() => setSelectedSemester(semester)}
                  className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                    selectedSemester === semester
                      ? "bg-[#D71920] text-white"
                      : "border border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  {semester}
                </button>
              )
            )}
          </div>
        </div>

        {/* Results List */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[850px] text-left">
            <thead className="bg-gray-50 text-xs uppercase text-gray-500">
              <tr>
                <th className="px-5 py-4">Subject / Module</th>
                <th className="px-5 py-4">Semester</th>
                <th className="px-5 py-4">Exam Type</th>
                <th className="px-5 py-4">Exam Date</th>
                <th className="px-5 py-4">Marks</th>
                <th className="px-5 py-4">Grade</th>
                <th className="px-5 py-4">Status</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {filteredResults.length > 0 ? (
                filteredResults.map((result) => (
                  <tr
                    key={result.id}
                    className="transition hover:bg-gray-50"
                  >
                    <td className="px-5 py-5 font-semibold text-gray-900">
                      <div className="flex items-center gap-2">
                        <BookOpen size={17} className="text-gray-400" />
                        <span>{result.subject}</span>
                      </div>
                    </td>

                    <td className="px-5 py-5 text-sm text-gray-600">
                      {result.semester}
                    </td>

                    <td className="px-5 py-5 text-sm text-gray-600">
                      {result.examType}
                    </td>

                    <td className="px-5 py-5 text-sm text-gray-600">
                      <div className="flex items-center gap-2 whitespace-nowrap">
                        <CalendarDays
                          size={16}
                          className="text-[#D71920]"
                        />
                        <span>{formatDate(result.examDate)}</span>
                      </div>
                    </td>

                    <td className="px-5 py-5 font-bold text-gray-900">
                      {result.status === "Pending" ? "-" : `${result.marks} / ${result.totalMarks}`}
                    </td>

                    <td className="px-5 py-5">
                      <span
                        className={`inline-flex rounded-md px-2.5 py-1 text-xs font-bold ${getGradeColor(
                          result.grade
                        )}`}
                      >
                        {result.grade}
                      </span>
                    </td>

                    <td className="px-5 py-5">
                      {result.status === "Passed" ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-green-50 px-3 py-1.5 text-xs font-semibold text-green-600">
                          <CheckCircle2 size={13} />
                          Passed
                        </span>
                      ) : result.status === "Failed" ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-600">
                          <XCircle size={13} />
                          Failed
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-yellow-50 px-3 py-1.5 text-xs font-semibold text-yellow-600">
                          <Clock size={13} />
                          Pending
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-5 py-16 text-center">
                    <Award
                      size={40}
                      className="mx-auto mb-3 text-gray-300"
                    />
                    <p className="font-semibold text-gray-700">
                      {loading ? "Loading examination results..." : "No examination results published yet"}
                    </p>
                    <p className="mt-1 text-sm text-gray-400 max-w-md mx-auto">
                      {loading
                        ? "Please wait while we fetch your academic records."
                        : "Once the Examination Officer evaluates your exams and enters marks for your batch, your verified results will appear here."}
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="border-t border-gray-100 px-5 py-4">
          <p className="text-xs text-gray-400">
            Showing {filteredResults.length} of {results.length} total results
          </p>
        </div>
      </div>
    </div>
  );
}

export default Results;
