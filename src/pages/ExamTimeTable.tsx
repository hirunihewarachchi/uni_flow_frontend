import { useMemo, useState, useEffect, useContext } from "react";
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
  Plus,
  X,
  Award,
  Save,
  Check,
} from "lucide-react";
import { AuthContext } from "../context/AuthContext";
import { getExamTimetable, createExamSchedule, enterMarks } from "../services/exam.service";
import { getBatches, getBatchStudents } from "../services/academic.service";

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

type StudentRow = {
  studentId: string;
  studentName: string;
  marks: string; // string for input editing
};

function calculateGrade(marks: number) {
  if (marks >= 75) return "A";
  if (marks >= 65) return "B";
  if (marks >= 50) return "C";
  if (marks >= 35) return "S";
  return "F";
}

function ExamTimetable() {
  const auth = useContext(AuthContext);
  const user = auth?.user;

  const role = (user?.role || user?.normalizedRole || "").toUpperCase();
  const isExamOfficer = role === "EXAM" || role === "EXAM_OFFICER" || role === "ADMIN" || role === "SUPER_ADMIN";
  const isStudent = role === "STUDENT";

  const [activeTab, setActiveTab] = useState<"timetable" | "results">("timetable");

  // Timetable state
  const [exams, setExams] = useState<Exam[]>([]);
  const [batches, setBatches] = useState<string[]>([]);
  const [selectedBatch, setSelectedBatch] = useState<string>("");
  const [activeFilter, setActiveFilter] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [scheduleForm, setScheduleForm] = useState({
    batchNumber: "",
    subject: "",
    examType: "Final Examination",
    date: "",
    startTime: "09:00 AM",
    endTime: "12:00 PM",
    duration: "3 Hours",
    venue: "Lab 01",
  });

  // Results Entry state
  const [resultsBatch, setResultsBatch] = useState<string>("");
  const [resultsSubject, setResultsSubject] = useState<string>("Programming Fundamentals (PRF)");
  const [resultsModuleCode, setResultsModuleCode] = useState<string>("PRF");
  const [resultsSemester, setResultsSemester] = useState<string>("Semester 1");
  const [resultsExamType, setResultsExamType] = useState<string>("Final Examination");
  const [resultsDate, setResultsDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [publishImmediately, setPublishImmediately] = useState<boolean>(true);
  const [batchStudents, setBatchStudents] = useState<StudentRow[]>([]);
  const [loadingStudents, setLoadingStudents] = useState<boolean>(false);
  const [savingResults, setSavingResults] = useState<boolean>(false);
  const [resultsSuccessMsg, setResultsSuccessMsg] = useState<string>("");

  const standardModules = [
    { name: "Programming Fundamentals (PRF)", code: "PRF", semester: "Semester 1" },
    { name: "Database Management System (DBMS)", code: "DBMS", semester: "Semester 1" },
    { name: "Object Oriented Programming (OOP)", code: "OOP", semester: "Semester 2" },
    { name: "Web Development (Web)", code: "WEB", semester: "Semester 2" },
    { name: "Software Engineering (SE)", code: "SE", semester: "Semester 3" },
    { name: "Enterprise Application Development (EAD)", code: "EAD", semester: "Semester 4" },
  ];

  const fetchTimetableData = async () => {
    try {
      const [examRes, batchRes] = await Promise.allSettled([
        getExamTimetable(),
        getBatches(),
      ]);

      let distinctBatches: string[] = [];

      if (batchRes.status === "fulfilled" && Array.isArray(batchRes.value)) {
        distinctBatches = batchRes.value.map((b: any) => b.batchNumber).filter(Boolean);
      }

      if (examRes.status === "fulfilled" && examRes.value) {
        const res = examRes.value;
        const rawExams = Array.isArray(res) ? res : (res.data || []);

        if (res.availableBatches && Array.isArray(res.availableBatches)) {
          distinctBatches = Array.from(new Set([...distinctBatches, ...res.availableBatches]));
        }

        const mapped: Exam[] = rawExams.map((e: any, idx: number) => ({
          id: idx + 1,
          batch: e.batchNumber,
          subject: e.subject || (e.moduleName ? `${e.moduleName} (${e.moduleCode})` : "Examination"),
          examType: e.examType || e.type || "Final Examination",
          date: e.date,
          startTime: e.startTime || e.time?.split("-")[0] || "09:00 AM",
          endTime: e.endTime || e.time?.split("-")[1] || "12:00 PM",
          duration: e.duration || "3 Hours",
          venue: e.venue || e.hall || "Hall A",
          status: e.status || "Upcoming",
        }));
        setExams(mapped);

        // Student batch assignment
        if (isStudent) {
          const studentBatch = user?.batchNumber || (res.batchNumber !== "ALL" ? res.batchNumber : (distinctBatches[0] || ""));
          setSelectedBatch(studentBatch);
        } else {
          setBatches(distinctBatches);
          setSelectedBatch((prev) => prev || (distinctBatches[0] || "ALL"));
          setScheduleForm((prev) => ({
            ...prev,
            batchNumber: prev.batchNumber || (distinctBatches[0] || ""),
          }));
          setResultsBatch((prev) => prev || (distinctBatches[0] || ""));
        }
      } else {
        setBatches(distinctBatches);
        if (isStudent) {
          setSelectedBatch(user?.batchNumber || "");
        } else if (distinctBatches.length > 0) {
          setSelectedBatch((prev) => prev || distinctBatches[0]);
          setScheduleForm((prev) => ({
            ...prev,
            batchNumber: prev.batchNumber || distinctBatches[0],
          }));
          setResultsBatch((prev) => prev || distinctBatches[0]);
        }
      }
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    fetchTimetableData();
  }, [user]);

  // Load students for Results Entry whenever resultsBatch changes
  useEffect(() => {
    if (!resultsBatch || isStudent) return;

    let isMounted = true;
    setLoadingStudents(true);
    setResultsSuccessMsg("");

    getBatchStudents(resultsBatch)
      .then((students: any[]) => {
        if (!isMounted) return;
        if (students && Array.isArray(students)) {
          const rows: StudentRow[] = students.map((s: any) => ({
            studentId: s.studentId || s.registrationNumber || `STU-${s._id.slice(-5)}`,
            studentName: `${s.firstName || ""} ${s.lastName || ""}`.trim() || "Student",
            marks: "75", // default sensible starting grade
          }));
          setBatchStudents(rows);
        } else {
          setBatchStudents([]);
        }
      })
      .catch(() => {
        if (isMounted) setBatchStudents([]);
      })
      .finally(() => {
        if (isMounted) setLoadingStudents(false);
      });

    return () => {
      isMounted = false;
    };
  }, [resultsBatch, isStudent]);

  // Handle scheduling exam
  const handleScheduleExam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!scheduleForm.batchNumber) {
      alert("Please select a batch to assign this exam.");
      return;
    }

    try {
      setSubmitting(true);
      await createExamSchedule({
        batchNumber: scheduleForm.batchNumber,
        subject: scheduleForm.subject,
        examType: scheduleForm.examType,
        date: scheduleForm.date,
        startTime: scheduleForm.startTime,
        endTime: scheduleForm.endTime,
        duration: scheduleForm.duration,
        venue: scheduleForm.venue,
      });

      alert("Examination scheduled successfully!");
      setShowScheduleModal(false);
      setScheduleForm({
        batchNumber: selectedBatch && selectedBatch !== "ALL" ? selectedBatch : (batches[0] || ""),
        subject: "",
        examType: "Final Examination",
        date: "",
        startTime: "09:00 AM",
        endTime: "12:00 PM",
        duration: "3 Hours",
        venue: "Lab 01",
      });
      fetchTimetableData();
    } catch (err: any) {
      alert(err.response?.data?.message || err.message || "Failed to schedule examination");
    } finally {
      setSubmitting(false);
    }
  };

  // Handle saving batch marks
  const handleSaveMarks = async () => {
    if (!resultsBatch) {
      alert("Please choose a target batch.");
      return;
    }
    if (!resultsSubject.trim()) {
      alert("Please enter or select a module name.");
      return;
    }
    if (batchStudents.length === 0) {
      alert("No students to record marks for in this batch.");
      return;
    }

    try {
      setSavingResults(true);
      setResultsSuccessMsg("");

      const records = batchStudents.map((s) => ({
        studentId: s.studentId,
        studentName: s.studentName,
        marks: Math.max(0, Math.min(100, Number(s.marks || 0))),
      }));

      await enterMarks({
        batchNumber: resultsBatch,
        subject: resultsSubject,
        moduleCode: resultsModuleCode,
        semester: resultsSemester,
        examType: resultsExamType,
        examDate: resultsDate,
        publish: publishImmediately,
        records,
      });

      setResultsSuccessMsg(`Successfully saved and published examination marks for ${batchStudents.length} students in ${resultsBatch}!`);
    } catch (err: any) {
      alert(err.response?.data?.message || err.message || "Failed to save examination marks");
    } finally {
      setSavingResults(false);
    }
  };

  // Filter exams strictly by batch
  const batchExams = useMemo(() => {
    if (isStudent) {
      const studentBatchNorm = (user?.batchNumber || selectedBatch || "").replace(/[- ]+/g, "").toUpperCase();
      if (!studentBatchNorm) return [];
      return exams.filter(
        (exam) => exam.batch.replace(/[- ]+/g, "").toUpperCase() === studentBatchNorm
      );
    }

    if (!selectedBatch || selectedBatch === "ALL") {
      return exams;
    }

    const targetNorm = selectedBatch.replace(/[- ]+/g, "").toUpperCase();
    return exams.filter(
      (exam) => exam.batch.replace(/[- ]+/g, "").toUpperCase() === targetNorm
    );
  }, [exams, selectedBatch, isStudent, user]);

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
    if (!date) return "";
    return new Date(date + "T00:00:00").toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // Metrics for Results tab
  const validMarks = batchStudents.map((s) => Number(s.marks || 0));
  const batchAverage = validMarks.length > 0 ? Math.round(validMarks.reduce((a, b) => a + b, 0) / validMarks.length) : 0;
  const batchPassedCount = validMarks.filter((m) => m >= 50).length;
  const batchPassRate = validMarks.length > 0 ? Math.round((batchPassedCount / validMarks.length) * 100) : 0;

  return (
    <div className="min-h-screen bg-[#F5F5F5] p-4 md:p-8">
      {/* Page Heading */}
      <div className="mb-7 flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <div className="mb-2 flex items-center gap-2 text-sm text-gray-500">
            <span>Examination Department</span>
            <span>/</span>
            <span className="font-medium text-[#D71920]">
              {isExamOfficer ? "Exam & Results Portal" : "Exam Timetable"}
            </span>
          </div>

          <h1 className="text-2xl font-bold text-[#171717] md:text-3xl">
            {isExamOfficer ? "Examination & Grading Management" : "Examination Timetable"}
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            {isStudent
              ? "View scheduled examinations for your enrolled batch."
              : "Schedule exams and enter module results batch-wise for students."}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {isExamOfficer && activeTab === "timetable" && (
            <button
              onClick={() => setShowScheduleModal(true)}
              className="flex items-center gap-2 rounded-xl bg-[#D71920] px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-red-700 transition"
            >
              <Plus size={18} />
              Schedule Exam
            </button>
          )}

          <div className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-3">
            <GraduationCap className="text-[#D71920]" size={22} />
            <div>
              <p className="text-xs text-gray-500">
                {isStudent ? "Your Batch" : "Selected Batch"}
              </p>
              <p className="font-semibold text-gray-800">
                {selectedBatch || (isStudent ? "No Batch Assigned" : "All Batches")}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs for Exam Officer */}
      {isExamOfficer && (
        <div className="mb-6 flex gap-3 border-b border-gray-200">
          <button
            onClick={() => setActiveTab("timetable")}
            className={`flex items-center gap-2 border-b-2 px-5 py-3 text-sm font-semibold transition ${
              activeTab === "timetable"
                ? "border-[#D71920] text-[#D71920]"
                : "border-transparent text-gray-500 hover:text-gray-900"
            }`}
          >
            <CalendarDays size={18} />
            Exam Timetable
          </button>

          <button
            onClick={() => setActiveTab("results")}
            className={`flex items-center gap-2 border-b-2 px-5 py-3 text-sm font-semibold transition ${
              activeTab === "results"
                ? "border-[#D71920] text-[#D71920]"
                : "border-transparent text-gray-500 hover:text-gray-900"
            }`}
          >
            <Award size={18} />
            Enter & Publish Results
          </button>
        </div>
      )}

      {/* TAB 1: EXAM TIMETABLE */}
      {activeTab === "timetable" && (
        <>
          {/* Batch Selector (For Exam Officer / Admin only) */}
          {!isStudent && (
            <div className="mb-6 rounded-xl border border-gray-200 bg-white p-5">
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users size={19} className="text-[#D71920]" />
                  <h2 className="font-semibold text-gray-800">
                    Select Available Batch
                  </h2>
                </div>
                <span className="text-xs font-semibold uppercase tracking-wider text-red-600 bg-red-50 px-2.5 py-1 rounded-full">
                  Exam Officer View
                </span>
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
                <option value="ALL">All Batches</option>
                {batches.map((batch) => (
                  <option key={batch} value={batch}>
                    {batch}
                  </option>
                ))}
              </select>

              <p className="mt-2 text-xs text-gray-400">
                Select a batch to inspect and schedule examinations. Batches are created by the Academic Department.
              </p>
            </div>
          )}

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
                    {isStudent
                      ? `Your Examination Schedule (${selectedBatch || "No Batch"})`
                      : `${selectedBatch === "ALL" || !selectedBatch ? "All Batches" : selectedBatch} Examination Schedule`}
                  </h2>
                  <p className="mt-1 text-sm text-gray-500">
                    Examination dates, times and allocated venues.
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
                    <th className="px-5 py-4">Batch</th>
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
                        <td className="px-5 py-5 font-semibold text-gray-700">
                          <span className="rounded-md bg-gray-100 px-2 py-1 text-xs">
                            {exam.batch}
                          </span>
                        </td>

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
                      <td colSpan={8} className="px-5 py-16 text-center">
                        <CalendarDays
                          size={35}
                          className="mx-auto mb-3 text-gray-300"
                        />
                        <p className="font-semibold text-gray-700">
                          No examinations scheduled
                        </p>
                        <p className="mt-1 text-sm text-gray-400">
                          {isStudent
                            ? `No examinations scheduled for batch ${selectedBatch || "assigned to you"}.`
                            : "No examinations found for this selection. Click 'Schedule Exam' to assign an exam."}
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
              </p>
            </div>
          </div>
        </>
      )}

      {/* TAB 2: ENTER & PUBLISH RESULTS (EXAM OFFICER ONLY) */}
      {isExamOfficer && activeTab === "results" && (
        <div className="space-y-6">
          {/* Header Card */}
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center gap-3">
              <div className="rounded-xl bg-red-50 p-3 text-[#D71920]">
                <Award size={24} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">
                  Record & Publish Examination Results
                </h2>
                <p className="text-xs text-gray-500">
                  Select a student batch and module, enter individual scores, and publish marks directly to students.
                </p>
              </div>
            </div>

            {resultsSuccessMsg && (
              <div className="mb-5 flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-800">
                <CheckCircle2 size={18} className="text-green-600 shrink-0" />
                <span>{resultsSuccessMsg}</span>
              </div>
            )}

            {/* Selection Grid */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-gray-700">
                  Target Batch *
                </label>
                <select
                  value={resultsBatch}
                  onChange={(e) => setResultsBatch(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-red-600"
                >
                  <option value="">Select a batch</option>
                  {batches.map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold text-gray-700">
                  Module / Subject *
                </label>
                <select
                  value={resultsSubject}
                  onChange={(e) => {
                    setResultsSubject(e.target.value);
                    const match = standardModules.find((m) => m.name === e.target.value);
                    if (match) {
                      setResultsModuleCode(match.code);
                      setResultsSemester(match.semester);
                    }
                  }}
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-red-600"
                >
                  {standardModules.map((m) => (
                    <option key={m.code} value={m.name}>
                      {m.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold text-gray-700">
                  Module Code
                </label>
                <input
                  value={resultsModuleCode}
                  onChange={(e) => setResultsModuleCode(e.target.value)}
                  placeholder="e.g. PRF, OOP, DBMS"
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-red-600"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold text-gray-700">
                  Semester
                </label>
                <select
                  value={resultsSemester}
                  onChange={(e) => setResultsSemester(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-red-600"
                >
                  <option value="Semester 1">Semester 1</option>
                  <option value="Semester 2">Semester 2</option>
                  <option value="Semester 3">Semester 3</option>
                  <option value="Semester 4">Semester 4</option>
                </select>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold text-gray-700">
                  Exam Type
                </label>
                <select
                  value={resultsExamType}
                  onChange={(e) => setResultsExamType(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-red-600"
                >
                  <option value="Final Examination">Final Examination</option>
                  <option value="Mid Examination">Mid Examination</option>
                  <option value="Practical Examination">Practical Examination</option>
                  <option value="Assignment / Project">Assignment / Project</option>
                </select>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold text-gray-700">
                  Exam Date
                </label>
                <input
                  type="date"
                  value={resultsDate}
                  onChange={(e) => setResultsDate(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-red-600"
                />
              </div>
            </div>
          </div>

          {/* Quick Metrics */}
          {batchStudents.length > 0 && (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <div className="rounded-xl border border-gray-200 bg-white p-4">
                <p className="text-xs text-gray-500">Enrolled Students</p>
                <p className="mt-1 text-2xl font-bold text-gray-900">{batchStudents.length}</p>
              </div>
              <div className="rounded-xl border border-gray-200 bg-white p-4">
                <p className="text-xs text-gray-500">Class Average</p>
                <p className="mt-1 text-2xl font-bold text-blue-600">{batchAverage}%</p>
              </div>
              <div className="rounded-xl border border-gray-200 bg-white p-4">
                <p className="text-xs text-gray-500">Passing Students</p>
                <p className="mt-1 text-2xl font-bold text-green-600">{batchPassedCount}</p>
              </div>
              <div className="rounded-xl border border-gray-200 bg-white p-4">
                <p className="text-xs text-gray-500">Pass Rate</p>
                <p className="mt-1 text-2xl font-bold text-purple-600">{batchPassRate}%</p>
              </div>
            </div>
          )}

          {/* Student Marks Entry Table */}
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
            <div className="flex flex-col justify-between gap-3 border-b border-gray-200 p-5 sm:flex-row sm:items-center">
              <div>
                <h3 className="font-bold text-gray-900">
                  {resultsBatch ? `Enrolled Students in ${resultsBatch}` : "Select a batch above"}
                </h3>
                <p className="text-xs text-gray-500">
                  Enter student marks (0 to 100). Grades and status calculate automatically.
                </p>
              </div>

              {batchStudents.length > 0 && (
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 text-xs font-semibold text-gray-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={publishImmediately}
                      onChange={(e) => setPublishImmediately(e.target.checked)}
                      className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                    />
                    Publish immediately to students
                  </label>

                  <button
                    onClick={handleSaveMarks}
                    disabled={savingResults}
                    className="flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50 transition"
                  >
                    <Save size={16} />
                    {savingResults ? "Saving..." : "Save & Publish Marks"}
                  </button>
                </div>
              )}
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[700px] text-left">
                <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                  <tr>
                    <th className="px-5 py-3 w-16">#</th>
                    <th className="px-5 py-3">Student ID</th>
                    <th className="px-5 py-3">Student Name</th>
                    <th className="px-5 py-3 w-40">Score / Marks (100)</th>
                    <th className="px-5 py-3 w-28">Grade</th>
                    <th className="px-5 py-3 w-32">Status</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100">
                  {loadingStudents ? (
                    <tr>
                      <td colSpan={6} className="px-5 py-12 text-center text-sm text-gray-500">
                        Loading enrolled students in {resultsBatch}...
                      </td>
                    </tr>
                  ) : batchStudents.length > 0 ? (
                    batchStudents.map((student, idx) => {
                      const num = Math.max(0, Math.min(100, Number(student.marks || 0)));
                      const grade = calculateGrade(num);
                      const isPassed = num >= 50;

                      return (
                        <tr key={student.studentId} className="hover:bg-gray-50">
                          <td className="px-5 py-4 text-xs font-bold text-gray-400">
                            {idx + 1}
                          </td>

                          <td className="px-5 py-4 font-semibold text-gray-800">
                            {student.studentId}
                          </td>

                          <td className="px-5 py-4 font-medium text-gray-900">
                            {student.studentName}
                          </td>

                          <td className="px-5 py-4">
                            <input
                              type="number"
                              min="0"
                              max="100"
                              value={student.marks}
                              onChange={(e) => {
                                const val = e.target.value;
                                setBatchStudents((prev) =>
                                  prev.map((s, i) =>
                                    i === idx ? { ...s, marks: val } : s
                                  )
                                );
                              }}
                              className="w-28 rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-bold text-gray-900 outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600"
                            />
                          </td>

                          <td className="px-5 py-4">
                            <span
                              className={`inline-flex rounded-md px-2.5 py-1 text-xs font-bold ${
                                grade === "A"
                                  ? "bg-green-100 text-green-700"
                                  : grade === "B"
                                  ? "bg-blue-100 text-blue-700"
                                  : grade === "C"
                                  ? "bg-yellow-100 text-yellow-700"
                                  : "bg-red-100 text-red-700"
                              }`}
                            >
                              Grade {grade}
                            </span>
                          </td>

                          <td className="px-5 py-4">
                            {isPassed ? (
                              <span className="inline-flex items-center gap-1 text-xs font-semibold text-green-600">
                                <Check size={14} /> Passed
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-xs font-semibold text-red-600">
                                <X size={14} /> Failed
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={6} className="px-5 py-16 text-center">
                        <Users size={36} className="mx-auto mb-2 text-gray-300" />
                        <p className="font-semibold text-gray-700">
                          {resultsBatch ? "No students enrolled in this batch" : "No batch selected"}
                        </p>
                        <p className="mt-1 text-xs text-gray-400">
                          {resultsBatch
                            ? `Students registered under ${resultsBatch} by Marketing will appear here automatically.`
                            : "Select a batch from the dropdown above to view students."}
                        </p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Schedule Exam Modal (Exam Officer only) */}
      {showScheduleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
            <div className="mb-5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="rounded-lg bg-red-50 p-2 text-red-600">
                  <Award size={20} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    Schedule Examination
                  </h2>
                  <p className="text-xs text-gray-500">
                    Assign an exam to an available batch
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowScheduleModal(false)}
                className="rounded-lg p-2 text-gray-500 hover:bg-gray-100"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleScheduleExam} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-gray-700">
                  Target Batch *
                </label>
                {batches.length === 0 ? (
                  <p className="rounded-lg bg-red-50 p-2 text-xs text-red-600">
                    No academic batches found. Please ensure the Academic Department has created batches.
                  </p>
                ) : (
                  <select
                    required
                    value={scheduleForm.batchNumber}
                    onChange={(e) =>
                      setScheduleForm({ ...scheduleForm, batchNumber: e.target.value })
                    }
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-red-600"
                  >
                    <option value="">Select a batch</option>
                    {batches.map((b) => (
                      <option key={b} value={b}>
                        {b}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold text-gray-700">
                  Subject / Module Name *
                </label>
                <input
                  required
                  placeholder="e.g. Programming Fundamentals (PRF)"
                  value={scheduleForm.subject}
                  onChange={(e) =>
                    setScheduleForm({ ...scheduleForm, subject: e.target.value })
                  }
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-red-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-gray-700">
                    Exam Type *
                  </label>
                  <select
                    value={scheduleForm.examType}
                    onChange={(e) =>
                      setScheduleForm({ ...scheduleForm, examType: e.target.value })
                    }
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-red-600"
                  >
                    <option value="Final Examination">Final Examination</option>
                    <option value="Mid Examination">Mid Examination</option>
                    <option value="Practical Examination">Practical Examination</option>
                    <option value="Assignment / Project">Assignment / Project</option>
                  </select>
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-gray-700">
                    Exam Date *
                  </label>
                  <input
                    required
                    type="date"
                    value={scheduleForm.date}
                    onChange={(e) =>
                      setScheduleForm({ ...scheduleForm, date: e.target.value })
                    }
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-red-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-gray-700">
                    Start Time *
                  </label>
                  <input
                    required
                    placeholder="09:00 AM"
                    value={scheduleForm.startTime}
                    onChange={(e) =>
                      setScheduleForm({ ...scheduleForm, startTime: e.target.value })
                    }
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-red-600"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-gray-700">
                    End Time *
                  </label>
                  <input
                    required
                    placeholder="12:00 PM"
                    value={scheduleForm.endTime}
                    onChange={(e) =>
                      setScheduleForm({ ...scheduleForm, endTime: e.target.value })
                    }
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-red-600"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-gray-700">
                    Duration
                  </label>
                  <input
                    placeholder="3 Hours"
                    value={scheduleForm.duration}
                    onChange={(e) =>
                      setScheduleForm({ ...scheduleForm, duration: e.target.value })
                    }
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-red-600"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold text-gray-700">
                  Venue / Hall *
                </label>
                <input
                  required
                  placeholder="e.g. Lab 01, Hall A"
                  value={scheduleForm.venue}
                  onChange={(e) =>
                    setScheduleForm({ ...scheduleForm, venue: e.target.value })
                  }
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-red-600"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowScheduleModal(false)}
                  className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || batches.length === 0}
                  className="rounded-lg bg-red-600 px-5 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50"
                >
                  {submitting ? "Scheduling..." : "Schedule Examination"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Notice */}
      <div className="mt-5 flex gap-3 rounded-xl border border-yellow-200 bg-yellow-50 p-4">
        <AlertCircle
          size={20}
          className="mt-0.5 shrink-0 text-yellow-600"
        />
        <div>
          <p className="text-sm font-semibold text-gray-800">
            Examination Department Notice
          </p>
          <p className="mt-1 text-sm text-gray-600">
            Please check examination schedules and marks carefully. Only authorized Examination Officers can assign exams and record student grades.
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
