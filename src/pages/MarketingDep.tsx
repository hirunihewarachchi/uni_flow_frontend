
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
} from "lucide-react";
import { getAllStudents, registerStudentByMarketing } from "../services/student.service";
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
  name: string;
  email: string;
  phone: string;
  course: string;
  date: string;
  status: "Pending" | "Approved" | "Rejected";
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
  const [selectedRequest, setSelectedRequest] =
    useState<EnrollmentRequest | null>(null);

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    course: "HDSE",
    batch: "",
    password: "",
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
          status: s.status === "ACTIVE" ? "Active" : "Pending",
        }));
        if (mapped.length > 0) setStudents(mapped);
      }

      if (reqRes.status === "fulfilled" && reqRes.value) {
        const mappedReqs = reqRes.value.map((r: any) => ({
          id: r._id,
          name: r.fullName,
          email: r.email,
          phone: r.phone,
          course: r.programInterest,
          date: r.createdAt ? new Date(r.createdAt).toISOString().slice(0, 10) : "2026-11-15",
          status: r.status === "PENDING" ? "Pending" : r.status === "APPROVED" ? "Approved" : "Rejected",
        }));
        if (mappedReqs.length > 0) setRequests(mappedReqs);
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
        address: "Panadura, Sri Lanka",
        courseCode: form.course,
        batchNumber: form.batch,
        totalCourseFee: 250000,
        initialPayment: 50000,
        password: form.password.trim() || undefined,
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
        batch: "HDSE-75",
        password: "",
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

  const updateRequestStatus = async (
    requestId: string,
    status: "Approved" | "Rejected"
  ) => {
    try {
      await updateAdmissionStatus(
        requestId,
        status === "Approved" ? "APPROVED" : "REJECTED"
      );
      setRequests((previous) =>
        previous.map((request) =>
          request.id === requestId ? { ...request, status } : request
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

          <div className="overflow-x-auto">
            <StudentTable students={filteredStudents} />
          </div>

          <div className="border-t border-[#E5E5E5] px-6 py-4 text-xs text-[#737373]">
            Showing {filteredStudents.length} of {students.length} students
          </div>
        </div>
      )}

      {/* Optional Enrollment Requests */}
      {activeTab === "requests" && (
        <div className="overflow-hidden rounded-xl border border-[#E5E5E5] bg-white">
          <div className="border-b border-[#E5E5E5] p-6">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-[#FEF2F2] p-3 text-[#D71920]">
                <Mail size={22} />
              </div>
              <div>
                <h2 className="font-bold text-[#171717]">
                  Website Enrollment Requests
                </h2>
                <p className="mt-1 text-sm text-[#737373]">
                  Optional inquiries submitted by prospective students.
                </p>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[850px] text-left text-sm">
              <thead className="bg-[#F5F5F5] text-xs uppercase text-[#737373]">
                <tr>
                  <th className="px-6 py-4">Request ID</th>
                  <th className="px-6 py-4">Student</th>
                  <th className="px-6 py-4">Course</th>
                  <th className="px-6 py-4">Submitted Date</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E5E5]">
                {requests.map((request) => (
                  <tr key={request.id} className="hover:bg-[#FAFAFA]">
                    <td className="px-6 py-4 font-semibold text-[#171717]">
                      {request.id}
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-semibold text-[#171717]">
                        {request.name}
                      </p>
                      <p className="mt-1 text-xs text-[#737373]">
                        {request.email}
                      </p>
                    </td>
                    <td className="px-6 py-4 text-[#525252]">
                      {request.course}
                    </td>
                    <td className="px-6 py-4 text-[#737373]">
                      {request.date}
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={request.status} />
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => setSelectedRequest(request)}
                        className="flex items-center gap-2 font-semibold text-[#D71920] hover:underline"
                      >
                        <Eye size={16} />
                        Review
                      </button>
                    </td>
                  </tr>
                ))}
                {requests.length === 0 && (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-6 py-10 text-center text-[#737373]"
                    >
                      No enrollment requests found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Request Review Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-lg font-bold text-[#171717]">
                  Review Enrollment Request
                </h2>
                <p className="mt-1 text-sm text-[#737373]">
                  {selectedRequest.id}
                </p>
              </div>
              <button
                onClick={() => setSelectedRequest(null)}
                className="rounded-lg p-2 text-[#737373] hover:bg-[#F5F5F5]"
              >
                <XCircle size={20} />
              </button>
            </div>

            <div className="mt-6 space-y-4 rounded-lg bg-[#F5F5F5] p-4 text-sm">
              <p>
                <strong>Name:</strong> {selectedRequest.name}
              </p>
              <p>
                <strong>Email:</strong> {selectedRequest.email}
              </p>
              <p>
                <strong>Phone:</strong> {selectedRequest.phone}
              </p>
              <p>
                <strong>Interested Course:</strong> {selectedRequest.course}
              </p>
              <p>
                <strong>Submitted:</strong> {selectedRequest.date}
              </p>
            </div>

            <p className="mt-4 text-xs leading-5 text-[#737373]">
              Approving this request does not create a student login account.
              You can use the request details to register the student
              separately.
            </p>

            <div className="mt-6 flex flex-wrap justify-end gap-3">
              <button
                onClick={() =>
                  updateRequestStatus(selectedRequest.id, "Rejected")
                }
                className="rounded-lg border border-[#E5E5E5] px-4 py-2.5 text-sm font-semibold text-[#525252] hover:bg-[#F5F5F5]"
              >
                Reject
              </button>

              <button
                onClick={() => {
                  setForm({
                    firstName: selectedRequest.name.split(" ")[0] || "",
                    lastName: selectedRequest.name
                      .split(" ")
                      .slice(1)
                      .join(" "),
                    email: selectedRequest.email,
                    phone: selectedRequest.phone,
                    course: selectedRequest.course,
                    batch: "",
                    password: "",
                  });
                  setSelectedRequest(null);
                  setActiveTab("register");
                }}
                className="rounded-lg bg-[#D71920] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#B9151B]"
              >
                Register This Student
              </button>

              <button
                onClick={() =>
                  updateRequestStatus(selectedRequest.id, "Approved")
                }
                className="rounded-lg border border-[#E5E5E5] px-4 py-2.5 text-sm font-semibold text-[#525252] hover:bg-[#F5F5F5]"
              >
                Mark Reviewed
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
  status: "Active" | "Pending" | "Approved" | "Rejected";
}) {
  const styles = {
    Active: "bg-green-50 text-green-700",
    Pending: "bg-amber-50 text-amber-700",
    Approved: "bg-green-50 text-green-700",
    Rejected: "bg-red-50 text-red-700",
  };

  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${styles[status]}`}
    >
      {status}
    </span>
  );
}

function StudentTable({ students }: { students: Student[] }) {
  return (
    <table className="w-full min-w-[850px] text-left text-sm">
      <thead className="bg-[#F5F5F5] text-xs uppercase text-[#737373]">
        <tr>
          <th className="px-6 py-4">Student</th>
          <th className="px-6 py-4">Student ID</th>
          <th className="px-6 py-4">Course</th>
          <th className="px-6 py-4">Batch</th>
          <th className="px-6 py-4">Registered Date</th>
          <th className="px-6 py-4">Status</th>
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
                {student.email}
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
            <td className="px-6 py-4">
              <StatusBadge status={student.status} />
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
