
import { useState, useEffect, useMemo } from "react";
import {
  LayoutDashboard,
  Layers,
  CalendarDays,
  ClipboardCheck,
  Plus,
  Search,
  Clock,
  BookOpen,
  GraduationCap,
  MoreVertical,
  X,
  Users,
  BarChart3,
  Pencil,
  Trash2,
  AlertTriangle,
  CheckCircle,
  Filter,
} from "lucide-react";
import {
  getBatches,
  createBatch,
  getLectures,
  createLecture,
  getBatchStudents,
  recordAttendance,
} from "../services/academic.service";
import {
  getAllStudents,
  updateStudent,
  deleteStudent,
} from "../services/student.service";

type Tab = "overview" | "batches" | "students" | "timetable" | "attendance" | "reports";

type Batch = {
  id: number;
  name: string;
  course: string;
  startDate: string;
  endDate: string;
  students: number;
  status: "ACTIVE" | "UPCOMING" | "COMPLETED";
};

type Lecture = {
  id: number;
  batch: string;
  subject: string;
  lecturer: string;
  date: string;
  startTime: string;
  endTime: string;
  room: string;
};

type Student = {
  id: number;
  name: string;
  studentId: string;
  status: "PRESENT" | "ABSENT" | "LATE";
};

type DetailedStudent = {
  id: string;
  name: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  course: string;
  batch: string;
  registeredDate: string;
};

function AcademicDep() {
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [batches, setBatches] = useState<Batch[]>([]);
  const [lectures, setLectures] = useState<Lecture[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [allStudentsList, setAllStudentsList] = useState<DetailedStudent[]>([]);
  const [studentSearch, setStudentSearch] = useState("");
  const [studentBatchFilter, setStudentBatchFilter] = useState("All");
  const [editingStudent, setEditingStudent] = useState<DetailedStudent | null>(null);
  const [editStudentForm, setEditStudentForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    course: "",
    batch: "",
  });
  const [isUpdatingStudent, setIsUpdatingStudent] = useState(false);
  const [deletingStudent, setDeletingStudent] = useState<DetailedStudent | null>(null);
  const [isDeletingStudent, setIsDeletingStudent] = useState(false);
  const [studentActionFeedback, setStudentActionFeedback] = useState<string | null>(null);
  const [showBatchModal, setShowBatchModal] = useState(false);
  const [showLectureModal, setShowLectureModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBatch, setSelectedBatch] = useState("");
  const [attendanceMsg, setAttendanceMsg] = useState("");

  const [batchForm, setBatchForm] = useState({
    name: "",
    course: "Higher Diploma in Software Engineering",
    startDate: "",
    endDate: "",
  });

  const [lectureForm, setLectureForm] = useState({
    batch: "",
    subject: "",
    lecturer: "Mr. Niroth Samarawickrama",
    date: "",
    startTime: "09:00",
    endTime: "12:00",
    room: "Lab 01",
  });

  const navItems = [
    { id: "overview", label: "Overview", icon: LayoutDashboard },
    { id: "batches", label: "Batch Management", icon: Layers },
    { id: "students", label: "Students & Batch Analytics", icon: Users },
    { id: "timetable", label: "Timetable", icon: CalendarDays },
    { id: "attendance", label: "Attendance", icon: ClipboardCheck },
    { id: "reports", label: "Reports", icon: BookOpen },
  ] as const;

  const fetchAcademicData = async () => {
    try {
      const [batchRes, lecRes, stuRes] = await Promise.allSettled([
        getBatches(),
        getLectures(),
        getAllStudents(),
      ]);

      let loadedStudents: DetailedStudent[] = [];
      if (stuRes.status === "fulfilled" && Array.isArray(stuRes.value)) {
        loadedStudents = stuRes.value.map((s: any) => ({
          id: s.studentId || s.registrationNumber || s._id,
          name: `${s.firstName} ${s.lastName}`.trim(),
          firstName: s.firstName || "",
          lastName: s.lastName || "",
          email: s.email,
          phone: s.phone,
          course: s.courseCode || "HDSE",
          batch: s.batchNumber || "HDSE-75",
          registeredDate: s.createdAt ? new Date(s.createdAt).toISOString().slice(0, 10) : "2026-11-15",
        }));
        setAllStudentsList(loadedStudents);
      }

      let loadedBatches: Batch[] = [];
      if (batchRes.status === "fulfilled" && Array.isArray(batchRes.value)) {
        loadedBatches = batchRes.value.map((b: any, idx: number) => {
          const studentCount = loadedStudents.filter((s) => s.batch === b.batchNumber).length;
          return {
            id: idx + 1,
            name: b.batchNumber,
            course: b.courseName || b.courseCode,
            startDate: b.startDate,
            endDate: b.endDate,
            students: studentCount,
            status: b.status === "ACTIVE" ? "ACTIVE" : "UPCOMING",
          };
        });
        setBatches(loadedBatches);
        if (loadedBatches.length > 0) {
          setSelectedBatch((prev) => prev || loadedBatches[0].name);
          setLectureForm((prev) => ({
            ...prev,
            batch: prev.batch || loadedBatches[0].name
          }));
        }
      }

      if (lecRes.status === "fulfilled" && Array.isArray(lecRes.value)) {
        const mappedLectures: Lecture[] = lecRes.value.map((l: any, idx: number) => ({
          id: idx + 1,
          batch: l.batchNumber,
          subject: l.subject || l.moduleName || l.moduleCode,
          lecturer: l.lecturer || l.lecturerName,
          date: l.date,
          startTime: l.startTime,
          endTime: l.endTime,
          room: l.room || l.hallNumber,
        }));
        setLectures(mappedLectures);
      }
    } catch (e) {}
  };

  const fetchBatchStudents = async (batchNo: string) => {
    try {
      const stuList = await getBatchStudents(batchNo);
      if (stuList && stuList.length > 0) {
        const mapped: Student[] = stuList.map((s: any, idx: number) => ({
          id: idx + 1,
          name: `${s.firstName} ${s.lastName}`.trim(),
          studentId: s.studentId || s.registrationNumber || `STU-${idx + 1}`,
          status: "PRESENT",
        }));
        setStudents(mapped);
      }
    } catch (e) {}
  };

  useEffect(() => {
    fetchAcademicData();
  }, []);

  useEffect(() => {
    if (selectedBatch) {
      fetchBatchStudents(selectedBatch);
    }
  }, [selectedBatch]);

  const presentCount = students.filter((s) => s.status === "PRESENT").length;
  const absentCount = students.filter((s) => s.status === "ABSENT").length;
  const lateCount = students.filter((s) => s.status === "LATE").length;

  const attendancePercentage = students.length
    ? Math.round((presentCount / students.length) * 100)
    : 0;

  const addBatch = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const code = batchForm.name.toUpperCase().startsWith("CMJD")
        ? "CMJD"
        : batchForm.name.toUpperCase().startsWith("CAME")
        ? "CAME"
        : "HDSE";

      await createBatch({
        batchNumber: batchForm.name.trim(),
        courseCode: code,
        courseName: batchForm.course,
        startDate: batchForm.startDate,
        endDate: batchForm.endDate,
        status: "ACTIVE",
      });

      const newBatch: Batch = {
        id: Date.now(),
        name: batchForm.name.trim(),
        course: batchForm.course,
        startDate: batchForm.startDate,
        endDate: batchForm.endDate,
        students: 0,
        status: "ACTIVE",
      };

      setBatches([newBatch, ...batches]);
      setSelectedBatch((prev) => prev || newBatch.name);
      setLectureForm((prev) => ({
        ...prev,
        batch: prev.batch || newBatch.name
      }));
      setShowBatchModal(false);
      setBatchForm({
        name: "",
        course: "Higher Diploma in Software Engineering",
        startDate: "",
        endDate: "",
      });
    } catch (err: any) {
      alert(err.response?.data?.message || err.message || "Failed to create batch");
    }
  };

  const addLecture = async (e: React.FormEvent) => {
    e.preventDefault();

    const targetBatch = lectureForm.batch || selectedBatch || (batches[0]?.name || "");
    if (!targetBatch) {
      alert("Please select or create a batch first.");
      return;
    }

    try {
      await createLecture({
        batchNumber: targetBatch,
        courseCode: targetBatch.startsWith("CMJD") ? "CMJD" : "HDSE",
        moduleCode: "PRF",
        moduleName: lectureForm.subject,
        lecturerId: "60c72b2f9b1d8b2bad000001",
        lecturerName: lectureForm.lecturer,
        hallNumber: lectureForm.room,
        date: lectureForm.date,
        startTime: lectureForm.startTime,
        endTime: lectureForm.endTime,
      });

      const newLecture: Lecture = {
        id: Date.now(),
        batch: targetBatch,
        subject: lectureForm.subject,
        lecturer: lectureForm.lecturer,
        date: lectureForm.date,
        startTime: lectureForm.startTime,
        endTime: lectureForm.endTime,
        room: lectureForm.room,
      };

      setLectures([newLecture, ...lectures]);
      setShowLectureModal(false);
      setLectureForm({
        batch: selectedBatch || (batches[0]?.name || ""),
        subject: "",
        lecturer: "Mr. Niroth Samarawickrama",
        date: "",
        startTime: "09:00",
        endTime: "12:00",
        room: "Lab 01",
      });
    } catch (err: any) {
      alert(err.response?.data?.message || err.message || "Failed to schedule lecture");
    }
  };

  const handleSaveAttendance = async () => {
    try {
      const records = students.map((s) => ({
        studentId: s.studentId,
        studentName: s.name,
        status: s.status,
      }));

      await recordAttendance({
        lectureScheduleId: "60c72b2f9b1d8b2bad000001",
        batchNumber: selectedBatch,
        records,
      });

      setAttendanceMsg("Attendance successfully recorded and saved to database!");
      setTimeout(() => setAttendanceMsg(""), 4000);
    } catch (err: any) {
      alert(err.response?.data?.message || err.message || "Failed to save attendance");
    }
  };

  const updateAttendance = (id: number, status: Student["status"]) => {
    setStudents(
      students.map((student) =>
        student.id === id ? { ...student, status } : student
      )
    );
  };

  const handleOpenEditStudent = (s: DetailedStudent) => {
    setEditingStudent(s);
    setEditStudentForm({
      firstName: s.firstName,
      lastName: s.lastName,
      email: s.email,
      phone: s.phone,
      course: s.course,
      batch: s.batch,
    });
  };

  const handleSaveStudentEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStudent) return;
    setIsUpdatingStudent(true);
    setStudentActionFeedback(null);
    try {
      await updateStudent(editingStudent.id, {
        firstName: editStudentForm.firstName.trim(),
        lastName: editStudentForm.lastName.trim(),
        email: editStudentForm.email.trim(),
        phone: editStudentForm.phone.trim(),
        courseCode: editStudentForm.course,
        batchNumber: editStudentForm.batch,
      });
      setStudentActionFeedback(`Student ${editStudentForm.firstName} ${editStudentForm.lastName} updated successfully!`);
      setEditingStudent(null);
      await fetchAcademicData();
      setTimeout(() => setStudentActionFeedback(null), 3500);
    } catch (err: any) {
      alert(err.response?.data?.message || err.message || "Failed to update student");
    } finally {
      setIsUpdatingStudent(false);
    }
  };

  const handleConfirmDeleteStudent = async () => {
    if (!deletingStudent) return;
    setIsDeletingStudent(true);
    try {
      await deleteStudent(deletingStudent.id);
      setStudentActionFeedback(`Student ${deletingStudent.name} (${deletingStudent.id}) permanently deleted.`);
      setDeletingStudent(null);
      await fetchAcademicData();
      setTimeout(() => setStudentActionFeedback(null), 3500);
    } catch (err: any) {
      alert(err.response?.data?.message || err.message || "Failed to delete student");
    } finally {
      setIsDeletingStudent(false);
    }
  };

  const filteredDetailedStudents = useMemo(() => {
    return allStudentsList.filter((s) => {
      const q = studentSearch.toLowerCase();
      const matchesSearch =
        s.name.toLowerCase().includes(q) ||
        s.email.toLowerCase().includes(q) ||
        s.id.toLowerCase().includes(q) ||
        s.phone.includes(q);
      const matchesBatch =
        studentBatchFilter === "All" || s.batch === studentBatchFilter;
      return matchesSearch && matchesBatch;
    });
  }, [allStudentsList, studentSearch, studentBatchFilter]);

  const filteredBatches = batches.filter(
    (batch) =>
      batch.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      batch.course.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredLectures = lectures.filter(
    (lecture) => lecture.batch === selectedBatch
  );

  const statusStyle = (status: string) => {
    if (status === "ACTIVE" || status === "PRESENT")
      return "bg-green-100 text-green-700";
    if (status === "UPCOMING" || status === "LATE")
      return "bg-yellow-100 text-yellow-700";
    if (status === "ABSENT") return "bg-red-100 text-red-700";
    return "bg-gray-100 text-gray-600";
  };

  const inputStyle =
    "w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-red-500";

  return (
    <div className="space-y-7">
      {/* Page Header */}
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wider text-red-600">
            IJSE / Academic Department
          </p>
          <h1 className="mt-1 text-3xl font-bold text-gray-900">
            Academic Management
          </h1>
          <p className="mt-2 text-sm text-gray-500">
            Manage batches, lecture schedules and student attendance.
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => {
              setLectureForm((prev) => ({
                ...prev,
                batch: prev.batch || selectedBatch || (batches[0]?.name || ""),
              }));
              setShowLectureModal(true);
            }}
            className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50"
          >
            <CalendarDays size={17} />
            Add Lecture
          </button>
          <button
            onClick={() => setShowBatchModal(true)}
            className="flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-700"
          >
            <Plus size={18} />
            Create Batch
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex gap-2 overflow-x-auto border-b border-gray-200">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex shrink-0 items-center gap-2 border-b-2 px-4 py-3 text-sm font-semibold ${
                activeTab === item.id
                  ? "border-red-600 text-red-600"
                  : "border-transparent text-gray-500 hover:text-gray-900"
              }`}
            >
              <Icon size={17} />
              {item.label}
            </button>
          );
        })}
      </div>

      {/* Overview */}
      {activeTab === "overview" && (
        <div className="space-y-7">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {[
              {
                label: "Total Batches",
                value: batches.length,
                icon: Layers,
                color: "bg-red-50 text-red-600",
              },
              {
                label: "Active Students",
                value: batches.reduce((sum, b) => sum + b.students, 0),
                icon: GraduationCap,
                color: "bg-blue-50 text-blue-600",
              },
              {
                label: "Scheduled Lectures",
                value: lectures.length,
                icon: CalendarDays,
                color: "bg-purple-50 text-purple-600",
              },
              {
                label: "Attendance Rate",
                value: `${attendancePercentage}%`,
                icon: ClipboardCheck,
                color: "bg-green-50 text-green-600",
              },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.label}
                  className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500">{item.label}</p>
                      <h2 className="mt-2 text-3xl font-bold text-gray-900">
                        {item.value}
                      </h2>
                    </div>
                    <div className={`rounded-xl p-3 ${item.color}`}>
                      <Icon size={23} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Batch Distribution Graph in Overview */}
          <BatchDistributionGraph
            batches={batches}
            students={allStudentsList}
            onSelectBatch={(batchName) => {
              setStudentBatchFilter(batchName);
              setActiveTab("students");
            }}
          />

          <div className="grid gap-6 xl:grid-cols-2">
            <section className="rounded-xl border border-gray-200 bg-white p-5">
              <div className="mb-5 flex items-center justify-between">
                <h2 className="font-bold text-gray-900">Recent Batches</h2>
                <button
                  onClick={() => setActiveTab("batches")}
                  className="text-sm font-semibold text-red-600"
                >
                  View All
                </button>
              </div>

              <div className="space-y-4">
                {batches.length === 0 ? (
                  <p className="p-4 text-center text-sm text-gray-500">
                    No batches created yet. Click 'Create Batch' to get started.
                  </p>
                ) : (
                  batches.slice(0, 4).map((batch) => (
                    <div
                      key={batch.id}
                      className="flex items-center justify-between gap-3 border-b border-gray-100 pb-4 last:border-0"
                    >
                      <div>
                        <p className="font-semibold text-gray-900">
                          {batch.name}
                        </p>
                        <p className="mt-1 text-xs text-gray-500">
                          {batch.course}
                        </p>
                      </div>
                      <div className="text-right">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${statusStyle(
                            batch.status
                          )}`}
                        >
                          {batch.status}
                        </span>
                        <p className="mt-2 text-xs text-gray-500">
                          {batch.students} Students
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </section>

            <section className="rounded-xl border border-gray-200 bg-white p-5">
              <div className="mb-5 flex items-center justify-between">
                <h2 className="font-bold text-gray-900">Upcoming Lectures</h2>
                <button
                  onClick={() => setActiveTab("timetable")}
                  className="text-sm font-semibold text-red-600"
                >
                  View Timetable
                </button>
              </div>

              <div className="space-y-4">
                {lectures.length === 0 ? (
                  <p className="p-4 text-center text-sm text-gray-500">
                    No lectures scheduled yet. Click 'Add Lecture' to add one.
                  </p>
                ) : (
                  lectures.slice(0, 4).map((lecture) => (
                    <div
                      key={lecture.id}
                      className="flex gap-4 border-b border-gray-100 pb-4 last:border-0"
                    >
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-red-50 text-red-600">
                        <CalendarDays size={21} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-gray-900">
                          {lecture.subject}
                        </p>
                        <p className="mt-1 text-xs text-gray-500">
                          {lecture.batch} · {lecture.lecturer}
                        </p>
                        <p className="mt-1 text-xs text-gray-500">
                          {lecture.date} · {lecture.startTime} - {lecture.endTime}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </section>
          </div>
        </div>
      )}

      {/* Batch Management */}
      {activeTab === "batches" && (
        <section className="rounded-xl border border-gray-200 bg-white p-5">
          <div className="mb-5 flex flex-col justify-between gap-4 md:flex-row md:items-center">
            <div>
              <h2 className="text-lg font-bold text-gray-900">
                Batch Management
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                Create and manage IJSE student batches.
              </p>
            </div>

            <button
              onClick={() => setShowBatchModal(true)}
              className="flex items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white"
            >
              <Plus size={17} /> Create New Batch
            </button>
          </div>

          <div className="relative mb-5 max-w-sm">
            <Search
              size={17}
              className="absolute left-3 top-3 text-gray-400"
            />
            <input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search batches..."
              className={`${inputStyle} pl-10`}
            />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[750px] text-left text-sm">
              <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                <tr>
                  <th className="px-4 py-3">Batch</th>
                  <th className="px-4 py-3">Course</th>
                  <th className="px-4 py-3">Start Date</th>
                  <th className="px-4 py-3">Students</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredBatches.map((batch) => (
                  <tr key={batch.id} className="border-b border-gray-100">
                    <td className="px-4 py-4 font-bold text-gray-900">
                      {batch.name}
                    </td>
                    <td className="px-4 py-4 text-gray-600">
                      {batch.course}
                    </td>
                    <td className="px-4 py-4 text-gray-600">
                      {batch.startDate}
                    </td>
                    <td className="px-4 py-4 text-gray-600">
                      {batch.students}
                    </td>
                    <td className="px-4 py-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${statusStyle(
                          batch.status
                        )}`}
                      >
                        {batch.status}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <button className="rounded-lg p-2 text-gray-500 hover:bg-gray-100">
                        <MoreVertical size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Students & Batch Analytics */}
      {activeTab === "students" && (
        <div className="space-y-6">
          {/* Batch-wise student distribution graph */}
          <BatchDistributionGraph
            batches={batches}
            students={allStudentsList}
            onSelectBatch={(batchName) => {
              setStudentBatchFilter(batchName);
            }}
          />

          {/* Student action feedback banner */}
          {studentActionFeedback && (
            <div className="flex items-center gap-2 rounded-xl bg-emerald-50 border border-emerald-200 p-4 text-sm font-semibold text-emerald-800 shadow-xs">
              <CheckCircle size={18} className="text-emerald-600 shrink-0" />
              <span>{studentActionFeedback}</span>
            </div>
          )}

          {/* All Students Details Management Table */}
          <section className="rounded-xl border border-gray-200 bg-white shadow-xs overflow-hidden">
            <div className="border-b border-gray-200 p-5">
              <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <div>
                  <h2 className="text-lg font-bold text-gray-900">
                    All Enrolled Students Details
                  </h2>
                  <p className="mt-1 text-xs text-gray-500">
                    Complete student roster across all cohorts with academic modification and deletion capabilities.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="rounded-lg bg-gray-100 px-3 py-1 text-xs font-bold text-gray-700">
                    Total: {allStudentsList.length} Students
                  </span>
                </div>
              </div>

              {/* Filters & Search */}
              <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                <div className="relative flex-1">
                  <Search
                    size={17}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  />
                  <input
                    value={studentSearch}
                    onChange={(e) => setStudentSearch(e.target.value)}
                    placeholder="Search by student name, email, phone or ID..."
                    className={`${inputStyle} pl-10`}
                  />
                </div>

                <div className="relative sm:w-56">
                  <Filter
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  />
                  <select
                    value={studentBatchFilter}
                    onChange={(e) => setStudentBatchFilter(e.target.value)}
                    className={`${inputStyle} pl-9`}
                  >
                    <option value="All">All Batches</option>
                    {batches.map((b) => (
                      <option key={b.id} value={b.name}>
                        {b.name} ({allStudentsList.filter((s) => s.batch === b.name).length})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[850px] text-left text-sm">
                <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                  <tr>
                    <th className="px-6 py-4">Student</th>
                    <th className="px-6 py-4">Student ID</th>
                    <th className="px-6 py-4">Course</th>
                    <th className="px-6 py-4">Batch</th>
                    <th className="px-6 py-4">Enrolled Date</th>
                    <th className="px-6 py-4 text-right">Academic Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredDetailedStudents.map((s) => (
                    <tr key={s.id} className="hover:bg-gray-50/70 transition">
                      <td className="px-6 py-4">
                        <p className="font-semibold text-gray-900">{s.name}</p>
                        <p className="mt-0.5 text-xs text-gray-500">{s.email} · {s.phone}</p>
                      </td>
                      <td className="px-6 py-4 font-mono font-medium text-gray-700">
                        {s.id}
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex rounded-md bg-blue-50 px-2 py-1 text-xs font-semibold text-blue-700 border border-blue-100">
                          {s.course}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex rounded-md bg-gray-100 px-2.5 py-1 text-xs font-bold text-gray-800">
                          {s.batch}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-xs text-gray-500">
                        {s.registeredDate}
                      </td>
                      <td className="px-6 py-4 text-right space-x-2">
                        <button
                          onClick={() => handleOpenEditStudent(s)}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 hover:border-blue-500 hover:text-blue-600 transition shadow-2xs"
                          title="Update Student"
                        >
                          <Pencil size={13} />
                          Update
                        </button>
                        <button
                          onClick={() => setDeletingStudent(s)}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-white px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50 transition shadow-2xs"
                          title="Delete Student"
                        >
                          <Trash2 size={13} />
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}

                  {filteredDetailedStudents.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-sm text-gray-500">
                        No students found matching current filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="border-t border-gray-100 px-6 py-3.5 text-xs text-gray-500 flex justify-between items-center">
              <span>Showing {filteredDetailedStudents.length} of {allStudentsList.length} students</span>
              {studentBatchFilter !== "All" && (
                <button
                  onClick={() => setStudentBatchFilter("All")}
                  className="text-red-600 hover:underline font-semibold"
                >
                  Clear batch filter
                </button>
              )}
            </div>
          </section>
        </div>
      )}

      {/* Timetable */}
      {activeTab === "timetable" && (
        <section className="rounded-xl border border-gray-200 bg-white p-5">
          <div className="mb-5 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <h2 className="text-lg font-bold text-gray-900">
                Lecture Timetable
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                Manage lecture schedules for each batch.
              </p>
            </div>
            <button
              onClick={() => {
                setLectureForm((prev) => ({
                  ...prev,
                  batch: prev.batch || selectedBatch || (batches[0]?.name || ""),
                }));
                setShowLectureModal(true);
              }}
              className="flex items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white"
            >
              <Plus size={17} /> Add Lecture
            </button>
          </div>

          <div className="mb-5 max-w-xs">
            <label className="mb-2 block text-sm font-semibold text-gray-700">
              Select Batch
            </label>
            <select
              value={selectedBatch}
              onChange={(e) => setSelectedBatch(e.target.value)}
              className={inputStyle}
            >
              {batches.map((batch) => (
                <option key={batch.id} value={batch.name}>
                  {batch.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-3">
            {filteredLectures.length === 0 ? (
              <p className="rounded-lg bg-gray-50 p-6 text-center text-sm text-gray-500">
                No lectures scheduled for this batch.
              </p>
            ) : (
              filteredLectures.map((lecture) => (
                <div
                  key={lecture.id}
                  className="flex flex-col justify-between gap-4 rounded-xl border border-gray-200 p-4 md:flex-row md:items-center"
                >
                  <div className="flex items-center gap-4">
                    <div className="rounded-xl bg-red-50 p-3 text-red-600">
                      <BookOpen size={22} />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">
                        {lecture.subject}
                      </h3>
                      <p className="mt-1 text-sm text-gray-500">
                        {lecture.lecturer} · {lecture.room}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                    <span className="flex items-center gap-2">
                      <CalendarDays size={16} /> {lecture.date}
                    </span>
                    <span className="flex items-center gap-2">
                      <Clock size={16} />
                      {lecture.startTime} - {lecture.endTime}
                    </span>
                    <span className="rounded-full bg-gray-100 px-3 py-1 font-semibold">
                      {lecture.batch}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      )}

      {/* Attendance */}
      {activeTab === "attendance" && (
        <section className="rounded-xl border border-gray-200 bg-white p-5">
          <div className="mb-5">
            <h2 className="text-lg font-bold text-gray-900">
              Student Attendance
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Mark attendance for students in a selected batch.
            </p>
          </div>

          <div className="mb-6 grid gap-4 sm:grid-cols-3">
            <div className="rounded-lg bg-green-50 p-4">
              <p className="text-sm text-green-700">Present</p>
              <p className="mt-1 text-2xl font-bold text-green-800">
                {presentCount}
              </p>
            </div>
            <div className="rounded-lg bg-red-50 p-4">
              <p className="text-sm text-red-700">Absent</p>
              <p className="mt-1 text-2xl font-bold text-red-800">
                {absentCount}
              </p>
            </div>
            <div className="rounded-lg bg-yellow-50 p-4">
              <p className="text-sm text-yellow-700">Late</p>
              <p className="mt-1 text-2xl font-bold text-yellow-800">
                {lateCount}
              </p>
            </div>
          </div>

          <div className="mb-5 grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Select Batch
              </label>
              <select
                value={selectedBatch}
                onChange={(e) => setSelectedBatch(e.target.value)}
                className={inputStyle}
              >
                {batches.map((batch) => (
                  <option key={batch.id} value={batch.name}>
                    {batch.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Select Lecture
              </label>
              <select className={inputStyle}>
                {filteredLectures.map((lecture) => (
                  <option key={lecture.id} value={lecture.id}>
                    {lecture.subject} - {lecture.date}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[650px] text-left text-sm">
              <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                <tr>
                  <th className="px-4 py-3">Student ID</th>
                  <th className="px-4 py-3">Student Name</th>
                  <th className="px-4 py-3">Attendance Status</th>
                </tr>
              </thead>
              <tbody>
                {students.map((student) => (
                  <tr key={student.id} className="border-b border-gray-100">
                    <td className="px-4 py-4 font-semibold text-gray-700">
                      {student.studentId}
                    </td>
                    <td className="px-4 py-4 text-gray-900">
                      {student.name}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex flex-wrap gap-2">
                        {(["PRESENT", "ABSENT", "LATE"] as const).map(
                          (status) => (
                            <button
                              key={status}
                              onClick={() =>
                                updateAttendance(student.id, status)
                              }
                              className={`rounded-lg px-3 py-2 text-xs font-semibold ${
                                student.status === status
                                  ? statusStyle(status)
                                  : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                              }`}
                            >
                              {status}
                            </button>
                          )
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {attendanceMsg && (
            <div className="mt-4 rounded-lg bg-emerald-50 border border-emerald-200 p-3 text-xs font-semibold text-emerald-800">
              {attendanceMsg}
            </div>
          )}

          <div className="mt-5 flex justify-end">
            <button
              onClick={handleSaveAttendance}
              className="rounded-lg bg-red-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-red-700"
            >
              Save Attendance
            </button>
          </div>
        </section>
      )}

      {/* Reports */}
      {activeTab === "reports" && (
        <section className="space-y-5">
          <div className="rounded-xl border border-gray-200 bg-white p-5">
            <h2 className="text-lg font-bold text-gray-900">
              Attendance Summary
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Current sample attendance summary.
            </p>

            <div className="mt-6 grid gap-5 sm:grid-cols-2">
              <div>
                <p className="text-sm text-gray-500">Attendance Rate</p>
                <p className="mt-2 text-4xl font-bold text-gray-900">
                  {attendancePercentage}%
                </p>
                <div className="mt-3 h-3 overflow-hidden rounded-full bg-gray-100">
                  <div
                    className="h-full rounded-full bg-green-500"
                    style={{ width: `${attendancePercentage}%` }}
                  />
                </div>
              </div>
              <div className="space-y-3">
                <p className="text-sm text-gray-500">Attendance Breakdown</p>
                <p className="text-sm font-semibold text-green-700">
                  Present: {presentCount}
                </p>
                <p className="text-sm font-semibold text-red-700">
                  Absent: {absentCount}
                </p>
                <p className="text-sm font-semibold text-yellow-700">
                  Late: {lateCount}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-5">
            <h2 className="mb-4 font-bold text-gray-900">
              Batch Attendance Overview
            </h2>
            {batches.map((batch) => (
              <div
                key={batch.id}
                className="flex items-center justify-between border-b border-gray-100 py-4 last:border-0"
              >
                <div>
                  <p className="font-semibold text-gray-900">{batch.name}</p>
                  <p className="mt-1 text-xs text-gray-500">
                    {batch.students} registered students
                  </p>
                </div>
                <span className="text-sm font-semibold text-gray-600">
                  {batch.status}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Create Batch Modal */}
      {showBatchModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  Create New Batch
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  Enter the new batch details.
                </p>
              </div>
              <button
                onClick={() => setShowBatchModal(false)}
                className="rounded-lg p-2 text-gray-500 hover:bg-gray-100"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={addBatch} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-gray-700">
                  Batch Name
                </label>
                <input
                  required
                  value={batchForm.name}
                  onChange={(e) =>
                    setBatchForm({ ...batchForm, name: e.target.value })
                  }
                  placeholder="e.g. GDSE 77"
                  className={inputStyle}
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-semibold text-gray-700">
                  Course
                </label>
                <select
                  value={batchForm.course}
                  onChange={(e) =>
                    setBatchForm({ ...batchForm, course: e.target.value })
                  }
                  className={inputStyle}
                >
                  <option>Graduate Diploma in Software Engineering</option>
                  <option>Comprehensive Master in Java Development</option>
                  <option>Advanced Certificate in Software Engineering</option>
                </select>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-gray-700">
                    Start Date
                  </label>
                  <input
                    required
                    type="date"
                    value={batchForm.startDate}
                    onChange={(e) =>
                      setBatchForm({ ...batchForm, startDate: e.target.value })
                    }
                    className={inputStyle}
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-gray-700">
                    End Date
                  </label>
                  <input
                    required
                    type="date"
                    min={batchForm.startDate || undefined}
                    value={batchForm.endDate}
                    onChange={(e) =>
                      setBatchForm({ ...batchForm, endDate: e.target.value })
                    }
                    className={inputStyle}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowBatchModal(false)}
                  className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-semibold text-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-red-600 px-5 py-2.5 text-sm font-semibold text-white"
                >
                  Create Batch
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Lecture Modal */}
      {showLectureModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-xl rounded-2xl bg-white p-6 shadow-xl">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  Schedule a Lecture
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  Add a lecture to a batch timetable.
                </p>
              </div>
              <button
                onClick={() => setShowLectureModal(false)}
                className="rounded-lg p-2 text-gray-500 hover:bg-gray-100"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={addLecture} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-gray-700">
                  Batch
                </label>
                <select
                  value={lectureForm.batch}
                  onChange={(e) =>
                    setLectureForm({ ...lectureForm, batch: e.target.value })
                  }
                  className={inputStyle}
                >
                  {batches.map((batch) => (
                    <option key={batch.id} value={batch.name}>
                      {batch.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-gray-700">
                    Subject
                  </label>
                  <input
                    required
                    value={lectureForm.subject}
                    onChange={(e) =>
                      setLectureForm({
                        ...lectureForm,
                        subject: e.target.value,
                      })
                    }
                    placeholder="Subject name"
                    className={inputStyle}
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-gray-700">
                    Lecturer
                  </label>
                  <input
                    required
                    value={lectureForm.lecturer}
                    onChange={(e) =>
                      setLectureForm({
                        ...lectureForm,
                        lecturer: e.target.value,
                      })
                    }
                    placeholder="Lecturer name"
                    className={inputStyle}
                  />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-semibold text-gray-700">
                  Lecture Date
                </label>
                <input
                  required
                  type="date"
                  value={lectureForm.date}
                  onChange={(e) =>
                    setLectureForm({ ...lectureForm, date: e.target.value })
                  }
                  className={inputStyle}
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-gray-700">
                    Start Time
                  </label>
                  <input
                    required
                    type="time"
                    value={lectureForm.startTime}
                    onChange={(e) =>
                      setLectureForm({
                        ...lectureForm,
                        startTime: e.target.value,
                      })
                    }
                    className={inputStyle}
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-gray-700">
                    End Time
                  </label>
                  <input
                    required
                    type="time"
                    value={lectureForm.endTime}
                    onChange={(e) =>
                      setLectureForm({
                        ...lectureForm,
                        endTime: e.target.value,
                      })
                    }
                    className={inputStyle}
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-gray-700">
                    Classroom
                  </label>
                  <input
                    required
                    value={lectureForm.room}
                    onChange={(e) =>
                      setLectureForm({ ...lectureForm, room: e.target.value })
                    }
                    placeholder="Lab 01"
                    className={inputStyle}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowLectureModal(false)}
                  className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-semibold text-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-red-600 px-5 py-2.5 text-sm font-semibold text-white"
                >
                  Add to Timetable
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Student Modal for Academic Officers */}
      {editingStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <div className="flex items-center gap-2">
                <div className="rounded-lg bg-red-50 p-2 text-red-600">
                  <Pencil size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">Academic Update: Student Record</h3>
                  <p className="text-xs text-gray-500 font-mono">ID: {editingStudent.id}</p>
                </div>
              </div>
              <button
                onClick={() => setEditingStudent(null)}
                className="text-gray-400 hover:text-gray-600 font-bold"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveStudentEdit} className="mt-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">First Name</label>
                  <input
                    type="text"
                    required
                    value={editStudentForm.firstName}
                    onChange={(e) => setEditStudentForm({ ...editStudentForm, firstName: e.target.value })}
                    className={inputStyle}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Last Name</label>
                  <input
                    type="text"
                    required
                    value={editStudentForm.lastName}
                    onChange={(e) => setEditStudentForm({ ...editStudentForm, lastName: e.target.value })}
                    className={inputStyle}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={editStudentForm.email}
                  onChange={(e) => setEditStudentForm({ ...editStudentForm, email: e.target.value })}
                  className={inputStyle}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Phone Number</label>
                <input
                  type="text"
                  required
                  value={editStudentForm.phone}
                  onChange={(e) => setEditStudentForm({ ...editStudentForm, phone: e.target.value })}
                  className={inputStyle}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Course</label>
                  <select
                    value={editStudentForm.course}
                    onChange={(e) => setEditStudentForm({ ...editStudentForm, course: e.target.value })}
                    className={inputStyle}
                  >
                    <option value="HDSE">HDSE</option>
                    <option value="CMJD">CMJD</option>
                    <option value="CAME">CAME</option>
                    <option value="Foundation">Foundation</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Batch Assignment</label>
                  <select
                    value={editStudentForm.batch}
                    onChange={(e) => setEditStudentForm({ ...editStudentForm, batch: e.target.value })}
                    className={inputStyle}
                  >
                    {batches.map((b) => (
                      <option key={b.id} value={b.name}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setEditingStudent(null)}
                  className="rounded-lg border border-gray-200 px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdatingStudent}
                  className="rounded-lg bg-red-600 px-5 py-2 text-xs font-bold text-white hover:bg-red-700 disabled:opacity-50"
                >
                  {isUpdatingStudent ? "Saving Changes..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Student Confirmation Modal */}
      {deletingStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-center gap-3 text-red-600">
              <div className="rounded-full bg-red-50 p-3">
                <AlertTriangle size={24} />
              </div>
              <div>
                <h3 className="font-bold text-gray-900">Delete Student Record</h3>
                <p className="text-xs text-gray-500">Academic Department Administrator action</p>
              </div>
            </div>

            <p className="mt-4 text-sm text-gray-600 leading-relaxed">
              Are you sure you want to permanently delete student <span className="font-bold text-gray-900">{deletingStudent.name}</span> (<span className="font-mono text-xs">{deletingStudent.id}</span>)? The student's academic profile and login account will be deleted permanently.
            </p>

            <div className="mt-6 flex justify-end gap-3 pt-3 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setDeletingStudent(null)}
                className="rounded-lg border border-gray-200 px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteStudent}
                disabled={isDeletingStudent}
                className="rounded-lg bg-red-600 px-5 py-2 text-xs font-bold text-white hover:bg-red-700 disabled:opacity-50"
              >
                {isDeletingStudent ? "Deleting..." : "Permanently Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function BatchDistributionGraph({
  batches,
  students,
  onSelectBatch,
}: {
  batches: Batch[];
  students: DetailedStudent[];
  onSelectBatch?: (batchName: string) => void;
}) {
  const batchStatsMap = new Map<string, { count: number; course: string; status: string }>();

  batches.forEach((b) => {
    batchStatsMap.set(b.name, {
      count: 0,
      course: b.course,
      status: b.status,
    });
  });

  students.forEach((s) => {
    const bName = s.batch || "Unassigned";
    const existing = batchStatsMap.get(bName);
    if (existing) {
      existing.count += 1;
    } else {
      batchStatsMap.set(bName, {
        count: 1,
        course: s.course || "General",
        status: "ACTIVE",
      });
    }
  });

  const batchList = Array.from(batchStatsMap.entries()).map(([name, data]) => ({
    name,
    ...data,
  }));

  const totalEnrolled = students.length;
  const maxCount = Math.max(...batchList.map((b) => b.count), 10);
  const targetBatchCapacity = 35;

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-xs">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center border-b border-gray-100 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <div className="rounded-lg bg-red-50 p-2 text-red-600">
              <BarChart3 size={20} />
            </div>
            <h3 className="font-bold text-gray-900 text-lg">
              Batch-Wise Student Distribution Graph
            </h3>
          </div>
          <p className="mt-1 text-xs text-gray-500">
            Real-time student headcount and enrollment concentration across all academic batches.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-gray-50 px-3 py-1.5 border border-gray-200 text-xs">
            <span className="text-gray-500">Total Enrolled: </span>
            <strong className="text-gray-900 font-bold">{totalEnrolled} Students</strong>
          </div>
          <div className="rounded-lg bg-red-50 px-3 py-1.5 border border-red-100 text-xs text-red-700 font-semibold">
            {batchList.length} Cohorts
          </div>
        </div>
      </div>

      {/* Bar Chart Visualization */}
      <div className="mt-6">
        {batchList.length === 0 ? (
          <div className="py-12 text-center text-sm text-gray-400">
            No batch data available to chart.
          </div>
        ) : (
          <div className="space-y-6">
            {/* Visual Column Bars */}
            <div className="pt-6 pb-2 px-2">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 items-end min-h-[200px]">
                {batchList.map((item) => {
                  const percentageOfMax = Math.round((item.count / maxCount) * 100);
                  const isCapacityHigh = item.count >= targetBatchCapacity;

                  return (
                    <div
                      key={item.name}
                      onClick={() => onSelectBatch?.(item.name)}
                      className="group flex flex-col items-center cursor-pointer transition hover:-translate-y-1"
                    >
                      {/* Count tooltip pill */}
                      <div className="mb-2 transition group-hover:scale-105">
                        <span className="inline-flex items-center rounded-md bg-gray-900 px-2 py-0.5 text-[11px] font-bold text-white shadow-xs">
                          {item.count}
                        </span>
                      </div>

                      {/* Bar Container */}
                      <div className="w-full max-w-[58px] h-36 bg-gray-100 rounded-t-xl flex flex-col justify-end p-1 relative overflow-hidden group-hover:bg-red-50">
                        {/* Target capacity dashed guide */}
                        <div
                          className="absolute w-full border-t border-dashed border-gray-300 left-0 z-0 pointer-events-none"
                          style={{
                            bottom: `${Math.min(100, Math.round((targetBatchCapacity / maxCount) * 100))}%`,
                          }}
                          title="Target Capacity: 35"
                        />

                        {/* Animated/Colored Bar */}
                        <div
                          className={`w-full rounded-t-lg transition-all duration-500 ease-out ${
                            isCapacityHigh
                              ? "bg-gradient-to-t from-red-700 to-red-500 shadow-md"
                              : item.count > 0
                              ? "bg-gradient-to-t from-red-600 to-rose-400"
                              : "bg-gray-200"
                          }`}
                          style={{
                            height: `${Math.max(percentageOfMax, item.count > 0 ? 12 : 4)}%`,
                          }}
                        />
                      </div>

                      {/* Batch Label */}
                      <div className="mt-2.5 text-center">
                        <p className="text-xs font-bold text-gray-800 group-hover:text-red-600 transition truncate max-w-[80px]" title={item.name}>
                          {item.name}
                        </p>
                        <p className="text-[10px] text-gray-400 truncate max-w-[80px]">
                          {item.count} stu
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Horizontal Percentage Breakdown & Progress Bars */}
            <div className="mt-6 pt-5 border-t border-gray-100 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {batchList.map((item) => {
                const ratio = totalEnrolled > 0 ? Math.round((item.count / totalEnrolled) * 100) : 0;
                return (
                  <div
                    key={item.name}
                    onClick={() => onSelectBatch?.(item.name)}
                    className="flex flex-col justify-between p-3 rounded-lg border border-gray-100 bg-gray-50/70 hover:bg-white hover:border-gray-200 hover:shadow-xs cursor-pointer transition"
                  >
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="font-bold text-gray-800">{item.name}</span>
                      <span className="font-semibold text-gray-600">{item.count} / {totalEnrolled} ({ratio}%)</span>
                    </div>
                    <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-red-600 h-full rounded-full transition-all duration-300"
                        style={{ width: `${ratio}%` }}
                      />
                    </div>
                    <p className="mt-1 text-[11px] text-gray-400 truncate">{item.course}</p>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AcademicDep;
