
import { useState, useEffect } from "react";
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
} from "lucide-react";
import {
  getBatches,
  createBatch,
  getLectures,
  createLecture,
  getBatchStudents,
  recordAttendance,
} from "../services/academic.service";

type Tab = "overview" | "batches" | "timetable" | "attendance" | "reports";

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

function AcademicDep() {
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [batches, setBatches] = useState<Batch[]>([]);
  const [lectures, setLectures] = useState<Lecture[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
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
    { id: "timetable", label: "Timetable", icon: CalendarDays },
    { id: "attendance", label: "Attendance", icon: ClipboardCheck },
    { id: "reports", label: "Reports", icon: BookOpen },
  ] as const;

  const fetchAcademicData = async () => {
    try {
      const [batchRes, lecRes] = await Promise.allSettled([
        getBatches(),
        getLectures(),
      ]);

      let loadedBatches: Batch[] = [];
      if (batchRes.status === "fulfilled" && Array.isArray(batchRes.value)) {
        loadedBatches = batchRes.value.map((b: any, idx: number) => ({
          id: idx + 1,
          name: b.batchNumber,
          course: b.courseName || b.courseCode,
          startDate: b.startDate,
          endDate: b.endDate,
          students: 0,
          status: b.status === "ACTIVE" ? "ACTIVE" : "UPCOMING",
        }));
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
    </div>
  );
}

export default AcademicDep;
