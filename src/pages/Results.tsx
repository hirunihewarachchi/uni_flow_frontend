
import { useMemo, useState } from "react";
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

// DEMO DATA ONLY.
// Replace this with data fetched for the authenticated student.
const currentStudent = {
  studentId: "STU002",
  studentName: "Sample Student",
  batch: "HDSE 75",
  course: "Higher Diploma in Software Engineering",
};

const resultData: ExamResult[] = [
  {
    id: 1,
    subject: "Programming Fundamentals (PRF)",
    examType: "Final Examination",
    semester: "Semester 1",
    examDate: "2026-09-15",
    marks: 85,
    totalMarks: 100,
    grade: "A",
    status: "Passed",
  },
  {
    id: 2,
    subject: "Database Management System",
    examType: "Final Examination",
    semester: "Semester 1",
    examDate: "2026-09-17",
    marks: 72,
    totalMarks: 100,
    grade: "B",
    status: "Passed",
  },
  {
    id: 3,
    subject: "Object Oriented Programming (OOP)",
    examType: "Final Examination",
    semester: "Semester 2",
    examDate: "2026-10-10",
    marks: 68,
    totalMarks: 100,
    grade: "B",
    status: "Passed",
  },
  {
    id: 4,
    subject: "Database Programming",
    examType: "Final Examination",
    semester: "Semester 2",
    examDate: "2026-10-12",
    marks: 78,
    totalMarks: 100,
    grade: "B+",
    status: "Passed",
  },
  {
    id: 5,
    subject: "Web Development",
    examType: "Final Examination",
    semester: "Semester 3",
    examDate: "2026-11-05",
    marks: 0,
    totalMarks: 100,
    grade: "-",
    status: "Pending",
  },
];

function Results() {
  const [selectedSemester, setSelectedSemester] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");

  const filteredResults = useMemo(() => {
    return resultData.filter((result) => {
      const matchesSemester =
        selectedSemester === "All" ||
        result.semester === selectedSemester;

      const matchesSearch = result.subject
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

      return matchesSemester && matchesSearch;
    });
  }, [selectedSemester, searchTerm]);

  const publishedResults = resultData.filter(
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
    return new Date(date + "T00:00:00").toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-[#F5F5F5] p-4 md:p-8">

      {/* Header */}
      <div className="mb-7">
        <div className="mb-2 flex items-center gap-2 text-sm text-gray-500">
          <span>Academic</span>
          <span>/</span>
          <span className="font-medium text-[#D71920]">
            Examination Results
          </span>
        </div>

        <h1 className="text-2xl font-bold text-[#171717] md:text-3xl">
          My Examination Results
        </h1>

        <p className="mt-2 text-sm text-gray-500">
          View your personal examination performance and academic progress.
        </p>
      </div>

      {/* Student Information */}
      <div className="mb-6 rounded-xl border border-gray-200 bg-white p-5">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-red-50 text-[#D71920]">
              <GraduationCap size={30} />
            </div>

            <div>
              <h2 className="text-lg font-bold text-gray-900">
                {currentStudent.studentName}
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                Student ID: {currentStudent.studentId}
              </p>
              <p className="mt-1 text-xs text-gray-400">
                {currentStudent.course}
              </p>
            </div>
          </div>

          <div className="rounded-lg bg-gray-50 px-5 py-3">
            <p className="text-xs text-gray-500">Registered Batch</p>
            <p className="mt-1 text-lg font-bold text-[#D71920]">
              {currentStudent.batch}
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
            These results belong to your student account. You can only view
            your own examination records. Other students' results are not
            accessible from this page.
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

      {/* Performance Overview */}
      <div className="mb-7 rounded-xl border border-gray-200 bg-white p-5">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h2 className="font-bold text-gray-900">
              Academic Performance
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Your published examination results
            </p>
          </div>

          <Award className="text-[#D71920]" size={27} />
        </div>

        <div className="mb-2 flex items-center justify-between text-sm">
          <span className="font-medium text-gray-700">
            Overall Average
          </span>
          <span className="font-bold text-[#D71920]">
            {averageMarks}%
          </span>
        </div>

        <div className="h-3 overflow-hidden rounded-full bg-gray-100">
          <div
            className="h-full rounded-full bg-[#D71920] transition-all"
            style={{ width: `${averageMarks}%` }}
          />
        </div>

        <p className="mt-3 text-xs text-gray-400">
          Average is calculated using published examination marks only.
        </p>
      </div>

      {/* Results Table */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">

        <div className="flex flex-col justify-between gap-4 border-b border-gray-200 p-5 lg:flex-row lg:items-center">
          <div>
            <h2 className="text-lg font-bold text-gray-900">
              My Results
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Examination results for {currentStudent.batch}
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative">
              <Search
                size={17}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search subject..."
                className="w-full rounded-lg border border-gray-300 py-2.5 pl-9 pr-3 text-sm outline-none focus:border-[#D71920] sm:w-60"
              />
            </div>

            <select
              value={selectedSemester}
              onChange={(e) => setSelectedSemester(e.target.value)}
              className="rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-[#D71920]"
            >
              <option value="All">All Semesters</option>
              <option value="Semester 1">Semester 1</option>
              <option value="Semester 2">Semester 2</option>
              <option value="Semester 3">Semester 3</option>
              <option value="Semester 4">Semester 4</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px] text-left">
            <thead className="bg-gray-50 text-xs uppercase text-gray-500">
              <tr>
                <th className="px-5 py-4">Subject</th>
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
                  <tr key={result.id} className="transition hover:bg-gray-50">

                    <td className="px-5 py-5">
                      <div className="flex items-center gap-2">
                        <BookOpen size={17} className="text-[#D71920]" />
                        <span className="text-sm font-semibold text-gray-800">
                          {result.subject}
                        </span>
                      </div>
                    </td>

                    <td className="px-5 py-5 text-sm text-gray-600">
                      {result.semester}
                    </td>

                    <td className="px-5 py-5 text-sm text-gray-600">
                      {result.examType}
                    </td>

                    <td className="px-5 py-5">
                      <div className="flex items-center gap-2 whitespace-nowrap text-sm text-gray-600">
                        <CalendarDays size={16} className="text-gray-400" />
                        {formatDate(result.examDate)}
                      </div>
                    </td>

                    <td className="px-5 py-5">
                      {result.status === "Pending" ? (
                        <span className="text-sm text-gray-400">Not published</span>
                      ) : (
                        <span className="text-sm font-bold text-gray-900">
                          {result.marks}/{result.totalMarks}
                        </span>
                      )}
                    </td>

                    <td className="px-5 py-5">
                      <span className={`rounded-lg px-3 py-1.5 text-xs font-bold ${getGradeColor(result.grade)}`}>
                        {result.grade}
                      </span>
                    </td>

                    <td className="px-5 py-5">
                      {result.status === "Passed" && (
                        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-green-600">
                          <CheckCircle2 size={15} />
                          Passed
                        </span>
                      )}

                      {result.status === "Failed" && (
                        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-red-600">
                          <XCircle size={15} />
                          Failed
                        </span>
                      )}

                      {result.status === "Pending" && (
                        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-orange-600">
                          <Clock size={15} />
                          Pending
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-5 py-16 text-center">
                    <BookOpen
                      size={35}
                      className="mx-auto mb-3 text-gray-300"
                    />
                    <p className="font-semibold text-gray-700">
                      No results found
                    </p>
                    <p className="mt-1 text-sm text-gray-400">
                      No examination records match your search.
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="border-t border-gray-100 px-5 py-4">
          <p className="text-xs text-gray-400">
            Showing {filteredResults.length} of {resultData.length} records
          </p>
        </div>
      </div>

      {/* Footer Notice */}
      <div className="mt-5 rounded-xl border border-gray-200 bg-white p-4">
        <p className="text-sm font-semibold text-gray-800">
          Need help with your results?
        </p>
        <p className="mt-1 text-sm text-gray-500">
          Contact the Examination Department if you have questions about
          your marks or examination records.
        </p>
      </div>

      <p className="mt-5 text-center text-xs text-gray-400">
        IJSE | Student Academic Portal
      </p>
    </div>
  );
}

export default Results;
