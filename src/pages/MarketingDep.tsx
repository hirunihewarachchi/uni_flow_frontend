
import { useMemo, useState, useEffect } from "react";
import {
  Users,
  UserPlus,
  ClipboardList,
  GraduationCap,
  Search,
  ArrowUpRight,
  Clock,
  XCircle,
  Plus,
  Filter,
  Eye,
  Mail,
  BookOpen,
  KeyRound,
  ShieldCheck,
  Copy,
  Check,
  PhoneCall,
  CheckCircle,
  Pencil,
  Trash2,
  AlertTriangle,
} from "lucide-react";
import {
  getAllStudents,
  registerStudentByMarketing,
  updateStudent,
  deleteStudent,
} from "../services/student.service";
import { getAdmissionRequests, updateAdmissionStatus } from "../services/admission.service";
import { getBatches } from "../services/academic.service";

type Tab = "overview" | "register" | "students" | "requests";

interface Student {
  id: string;
  name: string;
  email: string;
  phone: string;
  course: string;
  batch: string;
  registeredDate: string;
  status: "Active" | "Pending";
}

interface EnrollmentRequest {
  id: string;
  referenceNo?: string;
  name: string;
  email: string;
  phone: string;
  course: string;
  date: string;
  status: "Pending" | "Contacted" | "Approved" | "Registered" | "Rejected";
  dateOfBirth?: string;
  address?: string;
  preferredIntake?: string;
  qualification?: string;
  statement?: string;
  notes?: string;
}

const inputClass =
  "w-full rounded-lg border border-[#E5E5E5] bg-white px-4 py-3 text-sm outline-none transition focus:border-[#D71920] focus:ring-2 focus:ring-[#D71920]/10";

function Marketing() {
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [students, setStudents] = useState<Student[]>([]);
  const [requests, setRequests] = useState<EnrollmentRequest[]>([]);
  const [batchList, setBatchList] = useState<{ id: string; course: string }[]>([]);
  const [search, setSearch] = useState("");
  const [courseFilter, setCourseFilter] = useState("All");
  const [requestStatusFilter, setRequestStatusFilter] = useState("All");
  const [selectedRequest, setSelectedRequest] =
    useState<EnrollmentRequest | null>(null);
  const [reviewNotes, setReviewNotes] = useState("");

  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [editStudentForm, setEditStudentForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    course: "",
    batch: "",
  });
  const [isUpdatingStudent, setIsUpdatingStudent] = useState(false);

  const [deletingStudent, setDeletingStudent] = useState<Student | null>(null);
  const [isDeletingStudent, setIsDeletingStudent] = useState(false);
  const [studentActionFeedback, setStudentActionFeedback] = useState<string | null>(null);

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    course: "HDSE",
    batch: "",
    password: "",
    address: "",
    admissionRequestId: "",
  });

  const [message, setMessage] = useState("");
  const [regLoading, setRegLoading] = useState(false);
  const [createdCredentials, setCreatedCredentials] = useState<{
    studentId: string;
    institutionalEmail: string;
    initialPassword: string;
  } | null>(null);

  const [copiedField, setCopiedField] = useState<string | null>(null);

  const fetchAllData = async () => {
    try {
      const [stuRes, reqRes, batchRes] = await Promise.allSettled([
        getAllStudents(),
        getAdmissionRequests(),
        getBatches(),
      ]);

      if (stuRes.status === "fulfilled" && stuRes.value) {
        const mapped = stuRes.value.map((s: any) => ({
          id: s.studentId || s.registrationNumber || s._id,
          name: `${s.firstName} ${s.lastName}`.trim(),
          email: s.email,
          phone: s.phone,
          course: s.courseCode || "HDSE",
          batch: s.batchNumber || "HDSE-75",
          registeredDate: s.createdAt ? new Date(s.createdAt).toISOString().slice(0, 10) : "2026-11-15",
          status: "Active",
        }));
        setStudents(mapped);
      }

      if (reqRes.status === "fulfilled" && reqRes.value) {
        const mappedReqs = reqRes.value.map((r: any) => ({
          id: r._id,
          referenceNo: r.referenceNo || `ENQ-${r._id.slice(-4).toUpperCase()}`,
          name: r.fullName,
          email: r.email,
          phone: r.phone,
          course: r.courseCode || r.programInterest || "HDSE",
          date: r.createdAt ? new Date(r.createdAt).toISOString().slice(0, 10) : "2026-11-15",
          status:
            r.status === "PENDING"
              ? "Pending"
              : r.status === "CONTACTED"
              ? "Contacted"
              : r.status === "APPROVED"
              ? "Approved"
              : r.status === "REGISTERED"
              ? "Registered"
              : "Rejected",
          dateOfBirth: r.dateOfBirth,
          address: r.address,
          preferredIntake: r.preferredIntake,
          qualification: r.qualification,
          statement: r.statement,
          notes: r.notes || "",
        }));
        setRequests(mappedReqs);
      }

      if (batchRes.status === "fulfilled" && batchRes.value) {
        const mappedBatches = batchRes.value.map((b: any) => ({
          id: b.batchNumber,
          course: b.courseCode,
        }));
        setBatchList(mappedBatches);
        if (mappedBatches.length > 0) {
          setForm((prev) => ({
            ...prev,
            batch: prev.batch || mappedBatches[0].id
          }));
        }
      }
    } catch (e) {}
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  const filteredBatches = batchList.filter(
    (batch) =>
      !form.course ||
      !batch.course ||
      batch.course.toUpperCase() === form.course.toUpperCase() ||
      batch.id.toUpperCase().startsWith(form.course.toUpperCase())
  );
  const displayBatches = filteredBatches.length > 0 ? filteredBatches : batchList;

  const filteredStudents = useMemo(() => {
    return students.filter((student) => {
      const matchesSearch =
        student.name.toLowerCase().includes(search.toLowerCase()) ||
        student.email.toLowerCase().includes(search.toLowerCase()) ||
        student.id.toLowerCase().includes(search.toLowerCase());

      const matchesCourse =
        courseFilter === "All" || student.course === courseFilter;

      return matchesSearch && matchesCourse;
    });
  }, [students, search, courseFilter]);

  const pendingRequests = requests.filter(
    (request) => request.status === "Pending"
  ).length;

  const registeredToday = students.filter(
    (student) => student.registeredDate === new Date().toISOString().slice(0, 10)
  ).length;

  const handleRegister = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage("");

    if (!form.firstName.trim() || !form.lastName.trim()) {
      setMessage("Please enter the student's full name.");
      return;
    }

    if (!form.course || !form.batch) {
      setMessage("Please select a course and an existing batch.");
      return;
    }

    setRegLoading(true);

    try {
      const res = await registerStudentByMarketing({
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        address: form.address || "Panadura, Sri Lanka",
        courseCode: form.course,
        batchNumber: form.batch,
        totalCourseFee: 250000,
        initialPayment: 50000,
        password: form.password.trim() || undefined,
        admissionRequestId: form.admissionRequestId || undefined,
      });

      const creds = res.data?.credentials || (res as any).credentials;
      if (creds) {
        setCreatedCredentials(creds);
      }

      setMessage(
        "Student registered successfully! Institutional credentials and payment schedule generated."
      );

      setForm({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        course: "HDSE",
        batch: displayBatches[0]?.id || "HDSE-75",
        password: "",
        address: "",
        admissionRequestId: "",
      });

      fetchAllData();
    } catch (err: any) {
      setMessage(
        err.response?.data?.message || err.message || "Student registration failed"
      );
    } finally {
      setRegLoading(false);
    }
  };

  const handleOpenEditStudent = (student: Student) => {
    const parts = student.name.trim().split(" ");
    const firstName = parts[0] || "";
    const lastName = parts.slice(1).join(" ") || "";
    setEditingStudent(student);
    setEditStudentForm({
      firstName,
      lastName,
      email: student.email,
      phone: student.phone,
      course: student.course,
      batch: student.batch,
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
      fetchAllData();
      setTimeout(() => setStudentActionFeedback(null), 3000);
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
      fetchAllData();
      setTimeout(() => setStudentActionFeedback(null), 3000);
    } catch (err: any) {
      alert(err.response?.data?.message || err.message || "Failed to delete student");
    } finally {
      setIsDeletingStudent(false);
    }
  };

  const updateRequestStatus = async (
    requestId: string,
    status: "Pending" | "Contacted" | "Approved" | "Registered" | "Rejected",
    notes?: string
  ) => {
    try {
      await updateAdmissionStatus(
        requestId,
        status.toUpperCase(),
        notes
      );
      setRequests((previous) =>
        previous.map((request) =>
          request.id === requestId
            ? { ...request, status, notes: notes !== undefined ? notes : request.notes }
            : request
        )
      );
      setSelectedRequest(null);
    } catch (e) {}
  };

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const tabs = [
    { id: "overview" as Tab, label: "Overview", icon: ClipboardList },
    { id: "register" as Tab, label: "Register Student", icon: UserPlus },
    { id: "students" as Tab, label: "Manage Students", icon: Users },
    { id: "requests" as Tab, label: "Enrollment Requests", icon: Mail },
  ];

  return (
    <div className="space-y-7">
      {/* Page Heading */}
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#D71920]">
            <span>IJSE</span>
            <span className="text-[#A3A3A3]">/</span>
            <span className="text-[#737373]">Marketing Department</span>
          </div>

          <h1 className="text-2xl font-bold text-[#171717]">
            Marketing Management
          </h1>

          <p className="mt-1 text-sm text-[#737373]">
            Register students, manage batches, and handle enrollment requests.
          </p>
        </div>

        <button
          onClick={() => setActiveTab("register")}
          className="flex items-center justify-center gap-2 rounded-lg bg-[#D71920] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#B9151B]"
        >
          <Plus size={18} />
          Register New Student
        </button>
      </div>

      {/* Navigation */}
      <div className="flex gap-2 overflow-x-auto border-b border-[#E5E5E5] pb-3">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex shrink-0 items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition ${
                active
                  ? "bg-[#D71920] text-white"
                  : "text-[#737373] hover:bg-white hover:text-[#171717]"
              }`}
            >
              <Icon size={17} />
              {tab.label}
              {tab.id === "requests" && pendingRequests > 0 && (
                <span
                  className={`rounded-full px-2 py-0.5 text-xs ${
                    active
                      ? "bg-white/20 text-white"
                      : "bg-[#FEE2E2] text-[#D71920]"
                  }`}
                >
                  {pendingRequests}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Overview */}
      {activeTab === "overview" && (
        <div className="space-y-7">
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              title="Total Students"
              value={students.length}
              icon={Users}
              description="Registered student accounts"
            />
            <StatCard
              title="Active Batches"
              value={batchList.length}
              icon={GraduationCap}
              description="Available batches"
            />
            <StatCard
              title="Pending Requests"
              value={pendingRequests}
              icon={Clock}
              description="Website enrollment requests"
            />
            <StatCard
              title="New Registrations"
              value={registeredToday}
              icon={UserPlus}
              description="Registered today"
            />
          </div>

          <div className="grid gap-6 xl:grid-cols-3">
            {/* Main action */}
            <div className="rounded-xl bg-[#171717] p-7 text-white xl:col-span-2">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white/80">
                    MAIN FUNCTION
                  </span>

                  <h2 className="mt-5 text-2xl font-bold">
                    Student Registration
                  </h2>

                  <p className="mt-2 max-w-lg text-sm leading-6 text-white/60">
                    Register students directly by selecting an existing course
                    and batch. New students can then receive an account
                    activation invitation.
                  </p>

                  <button
                    onClick={() => setActiveTab("register")}
                    className="mt-6 flex items-center gap-2 rounded-lg bg-[#D71920] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#B9151B]"
                  >
                    Register a Student
                    <ArrowUpRight size={17} />
                  </button>
                </div>

                <div className="hidden rounded-xl bg-white/10 p-4 sm:block">
                  <GraduationCap size={38} />
                </div>
              </div>
            </div>

            {/* Optional requests */}
            <div className="rounded-xl border border-[#E5E5E5] bg-white p-6">
              <div className="flex items-center justify-between">
                <div className="rounded-lg bg-[#FEF2F2] p-3 text-[#D71920]">
                  <Mail size={22} />
                </div>
                <span className="rounded-full bg-[#FEF2F2] px-3 py-1 text-xs font-semibold text-[#D71920]">
                  Optional
                </span>
              </div>

              <h3 className="mt-5 font-bold text-[#171717]">
                Enrollment Requests
              </h3>

              <p className="mt-2 text-sm leading-6 text-[#737373]">
                Review inquiries submitted through the public IJSE website.
              </p>

              <div className="mt-5 flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-[#171717]">
                    {pendingRequests}
                  </p>
                  <p className="text-xs text-[#737373]">Awaiting review</p>
                </div>

                <button
                  onClick={() => setActiveTab("requests")}
                  className="text-sm font-semibold text-[#D71920] hover:underline"
                >
                  View requests
                </button>
              </div>
            </div>
          </div>

          {/* Recent students */}
          <div className="overflow-hidden rounded-xl border border-[#E5E5E5] bg-white">
            <div className="flex items-center justify-between border-b border-[#E5E5E5] px-6 py-5">
              <div>
                <h3 className="font-bold text-[#171717]">
                  Recently Registered Students
                </h3>
                <p className="mt-1 text-xs text-[#737373]">
                  Latest student registrations
                </p>
              </div>

              <button
                onClick={() => setActiveTab("students")}
                className="text-sm font-semibold text-[#D71920] hover:underline"
              >
                View all
              </button>
            </div>

            <div className="overflow-x-auto">
              <StudentTable students={students.slice(0, 4)} />
            </div>
          </div>
        </div>
      )}

      {/* Register Student */}
      {activeTab === "register" && (
        <div className="grid items-start gap-6 xl:grid-cols-3">
          <div className="rounded-xl border border-[#E5E5E5] bg-white p-6 xl:col-span-2">
            <div className="mb-6 flex items-center gap-3">
              <div className="rounded-lg bg-[#FEF2F2] p-3 text-[#D71920]">
                <UserPlus size={22} />
              </div>
              <div>
                <h2 className="font-bold text-[#171717]">
                  Register New Student
                </h2>
                <p className="mt-1 text-xs text-[#737373]">
                  Create a student record and assign an existing batch.
                </p>
              </div>
            </div>

            <form onSubmit={handleRegister} className="space-y-5">
              <div className="grid gap-5 sm:grid-cols-2">
                <FormField label="First Name">
                  <input
                    required
                    className={inputClass}
                    placeholder="Enter first name"
                    value={form.firstName}
                    onChange={(e) =>
                      setForm({ ...form, firstName: e.target.value })
                    }
                  />
                </FormField>

                <FormField label="Last Name">
                  <input
                    required
                    className={inputClass}
                    placeholder="Enter last name"
                    value={form.lastName}
                    onChange={(e) =>
                      setForm({ ...form, lastName: e.target.value })
                    }
                  />
                </FormField>

                <FormField label="Email Address">
                  <input
                    required
                    type="email"
                    className={inputClass}
                    placeholder="student@example.com"
                    value={form.email}
                    onChange={(e) =>
                      setForm({ ...form, email: e.target.value })
                    }
                  />
                </FormField>

                <FormField label="Phone Number">
                  <input
                    required
                    type="tel"
                    className={inputClass}
                    placeholder="07XXXXXXXX"
                    value={form.phone}
                    onChange={(e) =>
                      setForm({ ...form, phone: e.target.value })
                    }
                  />
                </FormField>

                <FormField label="Select Course">
                  <select
                    required
                    className={inputClass}
                    value={form.course}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        course: e.target.value,
                        batch: "",
                      })
                    }
                  >
                    <option value="">Choose a course</option>
                    <option value="HDSE">Higher Diploma in Software Engineering</option>
                    <option value="CMJD">CMJD</option>
                    <option value="CAME">CAME</option>
                    <option value="Foundation">Foundation</option>
                  </select>
                </FormField>

                <FormField label="Select Batch">
                  <select
                    required
                    className={inputClass}
                    value={form.batch}
                    disabled={!form.course}
                    onChange={(e) =>
                      setForm({ ...form, batch: e.target.value })
                    }
                  >
                    <option value="">Choose an existing batch</option>
                    {batchList.length === 0 ? (
                      <option value="" disabled>No batches available - Academic Officer must create batches</option>
                    ) : (
                      displayBatches.map((batch) => (
                        <option key={batch.id} value={batch.id}>
                          {batch.id}
                        </option>
                      ))
                    )}
                  </select>
                </FormField>

                <FormField label="Initial Password (Optional)">
                  <input
                    type="text"
                    className={inputClass}
                    placeholder="Leave blank for student ID / student123"
                    value={form.password}
                    onChange={(e) =>
                      setForm({ ...form, password: e.target.value })
                    }
                  />
                </FormField>
              </div>

              {message && (
                <div className="rounded-lg border border-[#E5E5E5] bg-[#F5F5F5] p-4 text-sm text-[#525252]">
                  {message}
                </div>
              )}

              <div className="flex flex-wrap justify-end gap-3 border-t border-[#E5E5E5] pt-5">
                <button
                  type="button"
                  onClick={() => {
                    setForm({
                      firstName: "",
                      lastName: "",
                      email: "",
                      phone: "",
                      course: "",
                      batch: "",
                      password: "",
                      address: "",
                      admissionRequestId: "",
                    });
                    setMessage("");
                  }}
                  className="rounded-lg border border-[#E5E5E5] px-5 py-3 text-sm font-semibold text-[#525252] hover:bg-[#F5F5F5]"
                >
                  Clear Form
                </button>

                <button
                  type="submit"
                  disabled={regLoading}
                  className="flex items-center gap-2 rounded-lg bg-[#D71920] px-5 py-3 text-sm font-semibold text-white hover:bg-[#B9151B] disabled:opacity-50"
                >
                  <UserPlus size={17} />
                  {regLoading ? "Registering..." : "Register Student"}
                </button>
              </div>
            </form>
          </div>

          <div className="space-y-5">
            <div className="rounded-xl border border-[#E5E5E5] bg-white p-6">
              <h3 className="font-bold text-[#171717]">
                Registration Process
              </h3>

              <div className="mt-5 space-y-5">
                <ProcessStep
                  number="01"
                  title="Enter Student Details"
                  description="Add the student's personal and contact information."
                />
                <ProcessStep
                  number="02"
                  title="Assign Course & Batch"
                  description="Select an existing batch created by the Academic Department."
                />
                <ProcessStep
                  number="03"
                  title="Create Account"
                  description="The system creates the student account."
                />
                <ProcessStep
                  number="04"
                  title="Send Invitation"
                  description="The student receives a secure account activation email."
                />
              </div>
            </div>

            <div className="rounded-xl border border-[#E5E5E5] bg-[#F5F5F5] p-5">
              <div className="flex items-center gap-2 text-sm font-bold text-[#171717]">
                <BookOpen size={18} />
                Important
              </div>
              <p className="mt-2 text-sm leading-6 text-[#737373]">
                Marketing officers select existing batches. Batch creation
                and management belong to the Academic Department.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Manage Students */}
      {activeTab === "students" && (
        <div className="overflow-hidden rounded-xl border border-[#E5E5E5] bg-white">
          <div className="border-b border-[#E5E5E5] p-6">
            <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
              <div>
                <h2 className="font-bold text-[#171717]">
                  Registered Students
                </h2>
                <p className="mt-1 text-sm text-[#737373]">
                  Search and manage student registrations.
                </p>
              </div>

              <button
                onClick={() => setActiveTab("register")}
                className="flex items-center justify-center gap-2 rounded-lg bg-[#D71920] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#B9151B]"
              >
                <Plus size={17} />
                Add Student
              </button>
            </div>

            <div className="mt-5 flex flex-col gap-3 sm:flex-row">
              <div className="relative flex-1">
                <Search
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-[#A3A3A3]"
                />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by name, email or student ID..."
                  className={`${inputClass} pl-10`}
                />
              </div>

              <div className="relative sm:w-52">
                <Filter
                  size={17}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-[#737373]"
                />
                <select
                  value={courseFilter}
                  onChange={(e) => setCourseFilter(e.target.value)}
                  className={`${inputClass} pl-10`}
                >
                  <option value="All">All Courses</option>
                  <option value="HDSE">HDSE</option>
                  <option value="CMJD">CMJD</option>
                  <option value="CAME">CAME</option>
                  <option value="Foundation">Foundation</option>
                </select>
              </div>
            </div>
          </div>

          {studentActionFeedback && (
            <div className="mx-6 mt-4 flex items-center gap-2 rounded-lg bg-emerald-50 border border-emerald-200 p-3 text-sm font-semibold text-emerald-800">
              <CheckCircle size={18} className="text-emerald-600 shrink-0" />
              <span>{studentActionFeedback}</span>
            </div>
          )}

          <div className="overflow-x-auto">
            <StudentTable
              students={filteredStudents}
              onEdit={handleOpenEditStudent}
              onDelete={(s) => setDeletingStudent(s)}
            />
          </div>

          <div className="border-t border-[#E5E5E5] px-6 py-4 text-xs text-[#737373]">
            Showing {filteredStudents.length} of {students.length} students
          </div>
        </div>
      )}

      {/* Enrollment Requests Section */}
      {activeTab === "requests" && (
        <div className="overflow-hidden rounded-xl border border-[#E5E5E5] bg-white">
          <div className="border-b border-[#E5E5E5] p-6">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-[#FEF2F2] p-3 text-[#D71920]">
                  <Mail size={22} />
                </div>
                <div>
                  <h2 className="font-bold text-[#171717]">
                    Public Enrollment & Admission Requests
                  </h2>
                  <p className="mt-1 text-sm text-[#737373]">
                    Prospective student inquiries submitted via the public portal enrollment form.
                  </p>
                </div>
              </div>

              {/* Status Filter Tabs */}
              <div className="flex flex-wrap items-center gap-2">
                {["All", "Pending", "Contacted", "Approved", "Registered", "Rejected"].map((st) => (
                  <button
                    key={st}
                    onClick={() => setRequestStatusFilter(st)}
                    className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                      requestStatusFilter === st
                        ? "bg-[#171717] text-white shadow-xs"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    {st}
                    {st === "All"
                      ? ` (${requests.length})`
                      : st === "Pending"
                      ? ` (${requests.filter((r) => r.status === "Pending").length})`
                      : ""}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[850px] text-left text-sm">
              <thead className="bg-[#F5F5F5] text-xs uppercase text-[#737373]">
                <tr>
                  <th className="px-6 py-4">Reference No</th>
                  <th className="px-6 py-4">Applicant</th>
                  <th className="px-6 py-4">Course & Intake</th>
                  <th className="px-6 py-4">Submitted Date</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E5E5]">
                {requests
                  .filter((req) => {
                    const matchesSearch =
                      req.name.toLowerCase().includes(search.toLowerCase()) ||
                      req.email.toLowerCase().includes(search.toLowerCase()) ||
                      req.phone.includes(search) ||
                      (req.referenceNo && req.referenceNo.toLowerCase().includes(search.toLowerCase()));

                    const matchesStatus =
                      requestStatusFilter === "All" ||
                      req.status.toLowerCase() === requestStatusFilter.toLowerCase();

                    return matchesSearch && matchesStatus;
                  })
                  .map((request) => (
                    <tr key={request.id} className="hover:bg-[#FAFAFA]">
                      <td className="px-6 py-4 font-mono font-bold text-[#D71920]">
                        {request.referenceNo || request.id.slice(-6).toUpperCase()}
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-semibold text-[#171717]">
                          {request.name}
                        </p>
                        <p className="mt-0.5 text-xs text-[#737373]">
                          {request.email} · {request.phone}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-semibold text-[#171717]">{request.course}</span>
                        {request.preferredIntake && (
                          <p className="text-xs text-[#737373]">{request.preferredIntake}</p>
                        )}
                      </td>
                      <td className="px-6 py-4 text-[#737373]">
                        {request.date}
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={request.status} />
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => {
                            setSelectedRequest(request);
                            setReviewNotes(request.notes || "");
                          }}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-[#E5E5E5] bg-white px-3 py-1.5 text-xs font-semibold text-[#D71920] hover:border-[#D71920] hover:bg-red-50 transition"
                        >
                          <Eye size={14} />
                          Review & Handle
                        </button>
                      </td>
                    </tr>
                  ))}
                {requests.length === 0 && (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-6 py-12 text-center text-[#737373]"
                    >
                      <Mail size={32} className="mx-auto mb-2 text-gray-300" />
                      <p className="font-semibold text-gray-700">No enrollment requests yet.</p>
                      <p className="text-xs text-gray-500 mt-1">Inquiries submitted via the public enrollment page will automatically appear here.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Comprehensive Request Review & Handle Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-2xl rounded-2xl bg-white p-6 md:p-8 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between border-b border-gray-100 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-extrabold text-[#D71920] bg-red-50 px-2.5 py-1 rounded-md">
                    {selectedRequest.referenceNo || selectedRequest.id}
                  </span>
                  <StatusBadge status={selectedRequest.status} />
                </div>
                <h2 className="text-xl font-bold text-[#171717] mt-2">
                  {selectedRequest.name}
                </h2>
                <p className="text-xs text-[#737373]">
                  Submitted on {selectedRequest.date}
                </p>
              </div>
              <button
                onClick={() => setSelectedRequest(null)}
                className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
              >
                <XCircle size={22} />
              </button>
            </div>

            {/* Applicant Details Grid */}
            <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 rounded-xl bg-gray-50 p-5 text-sm">
              <div>
                <span className="text-xs text-gray-500 font-semibold block">Email Address:</span>
                <a
                  href={`mailto:${selectedRequest.email}`}
                  className="font-medium text-blue-600 hover:underline inline-flex items-center gap-1 mt-0.5"
                >
                  <Mail size={14} />
                  {selectedRequest.email}
                </a>
              </div>

              <div>
                <span className="text-xs text-gray-500 font-semibold block">Phone Number:</span>
                <a
                  href={`tel:${selectedRequest.phone}`}
                  className="font-medium text-emerald-700 hover:underline inline-flex items-center gap-1 mt-0.5"
                >
                  <PhoneCall size={14} />
                  {selectedRequest.phone}
                </a>
              </div>

              <div>
                <span className="text-xs text-gray-500 font-semibold block">Interested Course:</span>
                <span className="font-bold text-gray-900 mt-0.5 block">{selectedRequest.course}</span>
              </div>

              <div>
                <span className="text-xs text-gray-500 font-semibold block">Preferred Intake:</span>
                <span className="font-medium text-gray-800 mt-0.5 block">
                  {selectedRequest.preferredIntake || "Next Available Intake"}
                </span>
              </div>

              <div>
                <span className="text-xs text-gray-500 font-semibold block">Highest Qualification:</span>
                <span className="font-medium text-gray-800 mt-0.5 block">
                  {selectedRequest.qualification || "A/L Completed"}
                </span>
              </div>

              <div>
                <span className="text-xs text-gray-500 font-semibold block">Residential Address:</span>
                <span className="font-medium text-gray-800 mt-0.5 block">
                  {selectedRequest.address || "Not specified"}
                </span>
              </div>

              {selectedRequest.statement && (
                <div className="sm:col-span-2 pt-2 border-t border-gray-200/60">
                  <span className="text-xs text-gray-500 font-semibold block">Applicant's Statement / Inquiry:</span>
                  <p className="mt-1 text-xs text-gray-700 leading-relaxed italic bg-white p-3 rounded-lg border border-gray-200">
                    "{selectedRequest.statement}"
                  </p>
                </div>
              )}
            </div>

            {/* Officer Notes Section */}
            <div className="mt-5 space-y-2">
              <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block">
                Officer Follow-up Notes & Remarks
              </label>
              <textarea
                value={reviewNotes}
                onChange={(e) => setReviewNotes(e.target.value)}
                placeholder="Enter counseling summary, call feedback, or registration notes..."
                rows={3}
                className="w-full rounded-xl border border-gray-300 p-3 text-xs outline-none focus:border-[#D71920] focus:ring-2 focus:ring-red-100"
              />
            </div>

            {/* Handling Action Controls */}
            <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 pt-5">
              <div className="flex items-center gap-2">
                <button
                  onClick={() =>
                    updateRequestStatus(selectedRequest.id, "Rejected", reviewNotes)
                  }
                  className="rounded-xl border border-red-200 bg-red-50/50 px-3.5 py-2.5 text-xs font-semibold text-red-700 hover:bg-red-100 transition"
                >
                  Reject
                </button>
                <button
                  onClick={() =>
                    updateRequestStatus(selectedRequest.id, "Contacted", reviewNotes)
                  }
                  className="rounded-xl border border-blue-200 bg-blue-50 px-3.5 py-2.5 text-xs font-semibold text-blue-700 hover:bg-blue-100 transition inline-flex items-center gap-1.5"
                >
                  <PhoneCall size={13} />
                  Mark Contacted
                </button>
                <button
                  onClick={() =>
                    updateRequestStatus(selectedRequest.id, "Approved", reviewNotes)
                  }
                  className="rounded-xl border border-emerald-200 bg-emerald-50 px-3.5 py-2.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-100 transition inline-flex items-center gap-1.5"
                >
                  <CheckCircle size={13} />
                  Approve Application
                </button>
              </div>

              <button
                onClick={() => {
                  const parts = selectedRequest.name.trim().split(" ");
                  const firstName = parts[0] || "";
                  const lastName = parts.slice(1).join(" ") || parts[0];
                  const matchedCourse = selectedRequest.course || "HDSE";
                  const matchedBatch =
                    batchList.find((b) => b.course.toUpperCase() === matchedCourse.toUpperCase())?.id ||
                    batchList[0]?.id ||
                    "HDSE-75";

                  setForm({
                    firstName,
                    lastName,
                    email: selectedRequest.email,
                    phone: selectedRequest.phone,
                    course: matchedCourse,
                    batch: matchedBatch,
                    password: "",
                    address: selectedRequest.address || "Panadura, Sri Lanka",
                    admissionRequestId: selectedRequest.id,
                  });
                  setSelectedRequest(null);
                  setActiveTab("register");
                }}
                className="rounded-xl bg-[#D71920] px-5 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-red-700 transition inline-flex items-center gap-2"
              >
                <UserPlus size={15} />
                Register This Student (Auto-Fill)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Created Student Credentials Modal */}
      {createdCredentials && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-7 shadow-2xl border border-gray-100">
            <div className="flex items-center gap-3 text-emerald-600 mb-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100">
                <ShieldCheck size={26} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">Student Registered!</h3>
                <p className="text-xs text-gray-500">Official institutional credentials generated</p>
              </div>
            </div>

            <p className="text-xs leading-5 text-gray-600 mb-5">
              The student record has been added to the database with a fee payment schedule. Please share these official login details with the student:
            </p>

            <div className="space-y-3 rounded-xl bg-gray-50 p-4 border border-gray-200 text-xs">
              <div>
                <span className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                  Student ID
                </span>
                <div className="flex items-center justify-between bg-white rounded-lg p-2.5 border border-gray-200">
                  <span className="font-mono font-bold text-gray-800 text-sm">
                    {createdCredentials.studentId}
                  </span>
                  <button
                    onClick={() => copyToClipboard(createdCredentials.studentId, "studentId")}
                    className="text-gray-500 hover:text-[#D71920]"
                  >
                    {copiedField === "studentId" ? <Check size={16} className="text-emerald-600" /> : <Copy size={16} />}
                  </button>
                </div>
              </div>

              <div>
                <span className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                  Institutional Login Identifier
                </span>
                <div className="flex items-center justify-between bg-white rounded-lg p-2.5 border border-gray-200">
                  <span className="font-mono font-bold text-gray-800 text-sm">
                    {createdCredentials.institutionalEmail}
                  </span>
                  <button
                    onClick={() => copyToClipboard(createdCredentials.institutionalEmail, "email")}
                    className="text-gray-500 hover:text-[#D71920]"
                  >
                    {copiedField === "email" ? <Check size={16} className="text-emerald-600" /> : <Copy size={16} />}
                  </button>
                </div>
              </div>

              <div>
                <span className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                  Temporary Initial Password
                </span>
                <div className="flex items-center justify-between bg-white rounded-lg p-2.5 border border-gray-200">
                  <span className="font-mono font-bold text-gray-800 text-sm">
                    {createdCredentials.initialPassword}
                  </span>
                  <button
                    onClick={() => copyToClipboard(createdCredentials.initialPassword, "pw")}
                    className="text-gray-500 hover:text-[#D71920]"
                  >
                    {copiedField === "pw" ? <Check size={16} className="text-emerald-600" /> : <Copy size={16} />}
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-4 rounded-lg bg-amber-50 p-3 border border-amber-200 text-[11px] text-amber-800 flex items-start gap-2">
              <KeyRound size={16} className="shrink-0 mt-0.5 text-amber-600" />
              <span>
                <strong>Mandatory Password Change:</strong> The student will be prompted immediately to set a private password on their first login.
              </span>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setCreatedCredentials(null)}
                className="rounded-lg bg-[#D71920] px-6 py-2.5 text-xs font-bold text-white hover:bg-red-700 transition"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Student Modal */}
      {editingStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <div className="flex items-center gap-2">
                <div className="rounded-lg bg-blue-50 p-2 text-blue-600">
                  <Pencil size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-[#171717]">Edit Student Information</h3>
                  <p className="text-xs text-[#737373] font-mono">ID: {editingStudent.id}</p>
                </div>
              </div>
              <button
                onClick={() => setEditingStudent(null)}
                className="text-gray-400 hover:text-gray-600 text-sm font-bold"
              >
                ✕
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
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Last Name</label>
                  <input
                    type="text"
                    required
                    value={editStudentForm.lastName}
                    onChange={(e) => setEditStudentForm({ ...editStudentForm, lastName: e.target.value })}
                    className={inputClass}
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
                  className={inputClass}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Phone Number</label>
                <input
                  type="text"
                  required
                  value={editStudentForm.phone}
                  onChange={(e) => setEditStudentForm({ ...editStudentForm, phone: e.target.value })}
                  className={inputClass}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Course</label>
                  <select
                    value={editStudentForm.course}
                    onChange={(e) => setEditStudentForm({ ...editStudentForm, course: e.target.value })}
                    className={inputClass}
                  >
                    <option value="HDSE">HDSE</option>
                    <option value="CMJD">CMJD</option>
                    <option value="CAME">CAME</option>
                    <option value="Foundation">Foundation</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Batch</label>
                  <select
                    value={editStudentForm.batch}
                    onChange={(e) => setEditStudentForm({ ...editStudentForm, batch: e.target.value })}
                    className={inputClass}
                  >
                    {displayBatches.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.id}
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
                  className="rounded-lg bg-[#D71920] px-5 py-2 text-xs font-bold text-white hover:bg-[#B9151B] disabled:opacity-50"
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
                <h3 className="font-bold text-[#171717]">Delete Student Record</h3>
                <p className="text-xs text-gray-500">This action cannot be undone.</p>
              </div>
            </div>

            <p className="mt-4 text-sm text-gray-600 leading-relaxed">
              Are you sure you want to permanently delete student <span className="font-bold text-[#171717]">{deletingStudent.name}</span> (<span className="font-mono text-xs">{deletingStudent.id}</span>)? All associated account credentials, academic profiles, and fee schedules will be removed.
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

function StatCard({
  title,
  value,
  icon: Icon,
  description,
}: {
  title: string;
  value: number;
  icon: React.ElementType;
  description: string;
}) {
  return (
    <div className="rounded-xl border border-[#E5E5E5] bg-white p-5">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-[#737373]">{title}</p>
        <div className="rounded-lg bg-[#FEF2F2] p-2.5 text-[#D71920]">
          <Icon size={20} />
        </div>
      </div>
      <p className="mt-4 text-3xl font-bold text-[#171717]">{value}</p>
      <p className="mt-1 text-xs text-[#A3A3A3]">{description}</p>
    </div>
  );
}

function FormField({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block space-y-2">
      <span className="text-sm font-semibold text-[#404040]">{label}</span>
      {children}
    </label>
  );
}

function ProcessStep({
  number,
  title,
  description,
}: {
  number: string;
  title: string;
  description: string;
}) {
  return (
    <div className="flex gap-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#FEF2F2] text-xs font-bold text-[#D71920]">
        {number}
      </div>
      <div>
        <h4 className="text-sm font-semibold text-[#171717]">{title}</h4>
        <p className="mt-1 text-xs leading-5 text-[#737373]">
          {description}
        </p>
      </div>
    </div>
  );
}

function StatusBadge({
  status,
}: {
  status: "Active" | "Pending" | "Contacted" | "Approved" | "Registered" | "Rejected";
}) {
  const styles: Record<string, string> = {
    Active: "bg-emerald-50 text-emerald-700 border border-emerald-200",
    Pending: "bg-amber-50 text-amber-700 border border-amber-200",
    Contacted: "bg-blue-50 text-blue-700 border border-blue-200",
    Approved: "bg-emerald-50 text-emerald-700 border border-emerald-200",
    Registered: "bg-purple-50 text-purple-700 border border-purple-200",
    Rejected: "bg-red-50 text-red-700 border border-red-200",
  };

  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${
        styles[status] || "bg-gray-100 text-gray-700"
      }`}
    >
      {status}
    </span>
  );
}

function StudentTable({
  students,
  onEdit,
  onDelete,
}: {
  students: Student[];
  onEdit?: (s: Student) => void;
  onDelete?: (s: Student) => void;
}) {
  return (
    <table className="w-full min-w-[850px] text-left text-sm">
      <thead className="bg-[#F5F5F5] text-xs uppercase text-[#737373]">
        <tr>
          <th className="px-6 py-4">Student</th>
          <th className="px-6 py-4">Student ID</th>
          <th className="px-6 py-4">Course</th>
          <th className="px-6 py-4">Batch</th>
          <th className="px-6 py-4">Registered Date</th>
          <th className="px-6 py-4 text-right">Actions</th>
        </tr>
      </thead>

      <tbody className="divide-y divide-[#E5E5E5]">
        {students.map((student) => (
          <tr key={student.id} className="hover:bg-[#FAFAFA]">
            <td className="px-6 py-4">
              <p className="font-semibold text-[#171717]">
                {student.name}
              </p>
              <p className="mt-1 text-xs text-[#737373]">
                {student.email} · {student.phone}
              </p>
            </td>
            <td className="px-6 py-4 font-medium text-[#525252]">
              {student.id}
            </td>
            <td className="px-6 py-4 text-[#525252]">{student.course}</td>
            <td className="px-6 py-4 text-[#525252]">{student.batch}</td>
            <td className="px-6 py-4 text-[#737373]">
              {student.registeredDate}
            </td>
            <td className="px-6 py-4 text-right space-x-2">
              <button
                onClick={() => onEdit?.(student)}
                className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 hover:border-blue-500 hover:text-blue-600 transition"
                title="Edit Student"
              >
                <Pencil size={13} />
                Edit
              </button>
              <button
                onClick={() => onDelete?.(student)}
                className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-white px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50 transition"
                title="Delete Student"
              >
                <Trash2 size={13} />
                Delete
              </button>
            </td>
          </tr>
        ))}

        {students.length === 0 && (
          <tr>
            <td colSpan={6} className="px-6 py-10 text-center text-[#737373]">
              No students found.
            </td>
          </tr>
        )}
      </tbody>
    </table>
  );
}

export default Marketing;
