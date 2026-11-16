
import { useMemo, useState, useEffect, type FormEvent } from "react";
import {
  LayoutDashboard,
  Users,
  Globe,
  BookOpen,
  Megaphone,
  Settings,
  History,
  Plus,
  Search,
  Edit,
  Trash2,
  UserCheck,
  UserX,
  KeyRound,
  Eye,
  EyeOff,
  Save,
  X,
  ShieldCheck,
  GraduationCap,
  Wallet,
  Building2,
  Phone,
  Mail,
  MapPin,
  Copy,
  Check,
  Sparkles,
} from "lucide-react";
import {
  getStaff,
  createStaff,
  toggleStaffStatus as toggleStaffStatusApi,
  resetStaffPassword as resetStaffPasswordApi,
  deleteStaff as deleteStaffApi,
  getWebsiteContent,
  updateWebsiteContent,
  getAnnouncements,
  createAnnouncement,
} from "../services/admin.service";

type AdminTab =
  | "overview"
  | "staff"
  | "website"
  | "courses"
  | "announcements"
  | "settings"
  | "activity";

type OfficerRole = "MARKETING" | "ACADEMIC" | "FINANCE";

type Staff = {
  id: string | number;
  name: string;
  email: string;
  role: OfficerRole;
  phone: string;
  status: "ACTIVE" | "INACTIVE";
};

type Course = {
  id: number;
  name: string;
  code: string;
  description: string;
  duration: string;
  status: "PUBLISHED" | "DRAFT";
};

type Announcement = {
  id: number;
  title: string;
  description: string;
  date: string;
  status: "PUBLISHED" | "DRAFT";
};

const initialStaff: Staff[] = [
  {
    id: 1,
    name: "Nimal Perera",
    email: "marketing@ijse.lk",
    role: "MARKETING",
    phone: "0771234567",
    status: "ACTIVE",
  },
  {
    id: 2,
    name: "Kasun Silva",
    email: "academic@ijse.lk",
    role: "ACADEMIC",
    phone: "0711234567",
    status: "ACTIVE",
  },
  {
    id: 3,
    name: "Amali Fernando",
    email: "finance@ijse.lk",
    role: "FINANCE",
    phone: "0761234567",
    status: "INACTIVE",
  },
];

const initialCourses: Course[] = [
  {
    id: 1,
    name: "Graduate Diploma in Software Engineering",
    code: "GDSE",
    description: "Comprehensive software engineering program.",
    duration: "2 Years",
    status: "PUBLISHED",
  },
  {
    id: 2,
    name: "Advanced Certificate in Computing",
    code: "ACC",
    description: "Foundation program for computing students.",
    duration: "6 Months",
    status: "PUBLISHED",
  },
];

const initialAnnouncements: Announcement[] = [
  {
    id: 1,
    title: "New GDSE Intake",
    description: "Applications are now open for the upcoming intake.",
    date: "2026-11-15",
    status: "PUBLISHED",
  },
];

function Admin() {
  const [activeTab, setActiveTab] = useState<AdminTab>("overview");

  const [staff, setStaff] = useState<Staff[]>(initialStaff);
  const [courses, setCourses] = useState<Course[]>(initialCourses);
  const [announcements, setAnnouncements] =
    useState<Announcement[]>(initialAnnouncements);

  useEffect(() => {
    getStaff()
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setStaff(
            data.map((s: any, idx: number) => ({
              id: s.id || s._id || String(idx + 1),
              name: s.fullName || s.name || s.username || "Staff Member",
              email: s.email,
              phone: s.phone || "0771234567",
              role: (s.role?.replace("_OFFICER", "") || "MARKETING") as OfficerRole,
              status: s.isActive === false ? "INACTIVE" : "ACTIVE",
              joinedDate: s.createdAt ? new Date(s.createdAt).toISOString().slice(0, 10) : "2026-01-01",
            }))
          );
        }
      })
      .catch((err) => console.warn("Failed to load staff list", err));

    getWebsiteContent()
      .then((data) => {
        if (data) setWebsite((prev) => ({ ...prev, ...data }));
      })
      .catch((err) => console.warn("Failed to load website content", err));

    getAnnouncements()
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setAnnouncements(
            data.map((a: any, idx: number) => ({
              id: a._id || idx + 1,
              title: a.title,
              description: a.content || a.description || "",
              date: a.createdAt ? new Date(a.createdAt).toISOString().slice(0, 10) : "2026-11-15",
              status: (a.isPublished ? "PUBLISHED" : "DRAFT") as "PUBLISHED" | "DRAFT",
            }))
          );
        }
      })
      .catch((err) => console.warn("Failed to load announcements", err));
  }, []);

  const [staffSearch, setStaffSearch] = useState("");
  const [staffRoleFilter, setStaffRoleFilter] = useState("ALL");

  const [showStaffModal, setShowStaffModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showCourseModal, setShowCourseModal] = useState(false);
  const [showAnnouncementModal, setShowAnnouncementModal] = useState(false);

  const [editingStaff, setEditingStaff] = useState<Staff | null>(null);
  const [resetStaff, setResetStaff] = useState<Staff | null>(null);

  const [temporaryPassword, setTemporaryPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [staffLoading, setStaffLoading] = useState(false);
  const [createdCredentials, setCreatedCredentials] = useState<{
    name: string;
    email: string;
    temporaryPassword: string;
    role: string;
  } | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);


  const [website, setWebsite] = useState({
    instituteName: "IJSE",
    tagline: "Sri Lanka's No. 1 Software Engineering Institute",
    heroTitle: "Build Your Future in Software Engineering",
    heroDescription:
      "Start your journey towards becoming a professional software engineer.",
    aboutTitle: "About IJSE",
    aboutDescription:
      "IJSE provides professional software engineering education and industry-focused training.",
    email: "info@ijse.lk",
    phone: "+94 11 234 5678",
    address: "Sri Lanka",
  });

  const [staffForm, setStaffForm] = useState({
    name: "",
    email: "",
    phone: "",
    role: "MARKETING" as OfficerRole,
  });

  const [courseForm, setCourseForm] = useState({
    name: "",
    code: "",
    description: "",
    duration: "",
  });

  const [announcementForm, setAnnouncementForm] = useState({
    title: "",
    description: "",
  });

  const [editingCourseId, setEditingCourseId] = useState<number | null>(null);

  const [message, setMessage] = useState("");

  const filteredStaff = useMemo(() => {
    return staff.filter((person) => {
      const matchesSearch =
        person.name.toLowerCase().includes(staffSearch.toLowerCase()) ||
        person.email.toLowerCase().includes(staffSearch.toLowerCase());

      const matchesRole =
        staffRoleFilter === "ALL" || person.role === staffRoleFilter;

      return matchesSearch && matchesRole;
    });
  }, [staff, staffSearch, staffRoleFilter]);

  const activeStaff = staff.filter(
    (person) => person.status === "ACTIVE"
  ).length;

  const showMessage = (text: string) => {
    setMessage(text);
    window.setTimeout(() => setMessage(""), 3000);
  };

  const tabs: {
    id: AdminTab;
    label: string;
    icon: typeof LayoutDashboard;
  }[] = [
    { id: "overview", label: "Overview", icon: LayoutDashboard },
    { id: "staff", label: "Staff Management", icon: Users },
    { id: "website", label: "Website Editor", icon: Globe },
    { id: "courses", label: "Course Management", icon: BookOpen },
    { id: "announcements", label: "Announcements", icon: Megaphone },
    { id: "settings", label: "Settings", icon: Settings },
    { id: "activity", label: "Activity Logs", icon: History },
  ];

  const openNewStaff = () => {
    setEditingStaff(null);
    setStaffForm({
      name: "",
      email: "",
      phone: "",
      role: "MARKETING",
    });
    setTemporaryPassword("");
    setShowPassword(false);
    setShowStaffModal(true);
  };

  const autoGenerateEmail = () => {
    const cleanName = staffForm.name.trim().toLowerCase().split(" ")[0] || "officer";
    const dept = staffForm.role.toLowerCase();
    const generated = `${cleanName}.${dept}@ijse.lk`;
    setStaffForm({ ...staffForm, email: generated });
  };

  const autoGeneratePassword = () => {
    const num = Math.floor(1000 + Math.random() * 9000);
    const pass = `Staff@${num}!`;
    setTemporaryPassword(pass);
  };

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    window.setTimeout(() => setCopiedField(null), 2000);
  };

  const openEditStaff = (person: Staff) => {
    setEditingStaff(person);
    setStaffForm({
      name: person.name,
      email: person.email,
      phone: person.phone,
      role: person.role,
    });
    setShowStaffModal(true);
  };

  const handleStaffSubmit = async (event: FormEvent) => {
    event.preventDefault();

    if (editingStaff) {
      setStaff((previous) =>
        previous.map((person) =>
          person.id === editingStaff.id
            ? { ...person, ...staffForm }
            : person
        )
      );
      showMessage("Staff details updated.");
      setShowStaffModal(false);
    } else {
      if (staff.some((person) => person.email.toLowerCase() === staffForm.email.toLowerCase().trim())) {
        showMessage("This email address already exists.");
        return;
      }

      if (temporaryPassword.length < 8) {
        showMessage("Temporary password must have at least 8 characters.");
        return;
      }

      setStaffLoading(true);
      try {
        const nameParts = staffForm.name.trim().split(" ");
        const firstName = nameParts[0] || "Staff";
        const lastName = nameParts.slice(1).join(" ") || "Member";
        const res = await createStaff({
          firstName,
          lastName,
          email: staffForm.email.trim().toLowerCase(),
          phone: staffForm.phone.trim(),
          role: staffForm.role,
          password: temporaryPassword,
        });

        const newOfficer: Staff = {
          id: res?.id || res?._id || Date.now(),
          name: res?.name || `${firstName} ${lastName}`.trim(),
          email: res?.email || staffForm.email.trim().toLowerCase(),
          phone: res?.phone || staffForm.phone.trim(),
          role: staffForm.role,
          status: "ACTIVE",
        };

        setStaff((previous) => [newOfficer, ...previous]);
        setCreatedCredentials({
          name: newOfficer.name,
          email: newOfficer.email,
          temporaryPassword: temporaryPassword,
          role: staffForm.role,
        });
        showMessage("Officer account created successfully! Credentials generated.");
        setShowStaffModal(false);
      } catch (err: any) {
        showMessage(err.response?.data?.message || err.message || "Failed to create officer account in database");
      } finally {
        setStaffLoading(false);
      }
    }
  };

  const toggleStaffStatus = async (id: string | number) => {
    try {
      const res = await toggleStaffStatusApi(String(id));
      const newStatus = res?.status || "ACTIVE";
      setStaff((previous) =>
        previous.map((person) =>
          person.id === id
            ? {
                ...person,
                status: newStatus,
              }
            : person
        )
      );
      showMessage(`Staff account status updated to ${newStatus}.`);
    } catch (err: any) {
      showMessage(err.response?.data?.message || err.message || "Failed to update staff status");
    }
  };

  const handlePasswordReset = async (event: FormEvent) => {
    event.preventDefault();

    if (!resetStaff) return;

    if (newPassword.length < 8) {
      showMessage("Password must have at least 8 characters.");
      return;
    }

    try {
      await resetStaffPasswordApi(String(resetStaff.id), newPassword);
      setCreatedCredentials({
        name: resetStaff.name,
        email: resetStaff.email,
        temporaryPassword: newPassword,
        role: resetStaff.role,
      });
      showMessage(`Password reset successfully for ${resetStaff.email}!`);
      setShowPasswordModal(false);
      setResetStaff(null);
      setNewPassword("");
    } catch (err: any) {
      showMessage(err.response?.data?.message || err.message || "Failed to reset password on server");
    }
  };

  const handleDeleteStaff = async (id: string | number) => {
    if (!window.confirm("Are you sure you want to delete this officer account?")) return;
    try {
      await deleteStaffApi(String(id));
      setStaff((previous) => previous.filter((person) => person.id !== id));
      showMessage("Staff member deleted successfully from database.");
    } catch (err: any) {
      showMessage(err.response?.data?.message || err.message || "Failed to delete staff member");
    }
  };


  const handleCourseSubmit = (event: FormEvent) => {
    event.preventDefault();

    if (editingCourseId !== null) {
      setCourses((previous) =>
        previous.map((course) =>
          course.id === editingCourseId
            ? { ...course, ...courseForm }
            : course
        )
      );
    } else {
      setCourses((previous) => [
        ...previous,
        {
          id: Date.now(),
          ...courseForm,
          status: "DRAFT",
        },
      ]);
    }

    setShowCourseModal(false);
    setEditingCourseId(null);
    setCourseForm({
      name: "",
      code: "",
      description: "",
      duration: "",
    });
    showMessage("Course saved.");
  };

  const handleAnnouncementSubmit = async (event: FormEvent) => {
    event.preventDefault();

    try {
      await createAnnouncement({
        title: announcementForm.title,
        content: announcementForm.description,
        status: "DRAFT",
      });
    } catch (err) {
      console.warn("Could not save announcement to backend", err);
    }

    setAnnouncements((previous) => [
      ...previous,
      {
        id: Date.now(),
        ...announcementForm,
        date: new Date().toISOString().slice(0, 10),
        status: "DRAFT",
      },
    ]);

    setAnnouncementForm({ title: "", description: "" });
    setShowAnnouncementModal(false);
    showMessage("Announcement created as draft.");
  };

  const toggleCourseStatus = (id: number) => {
    setCourses((previous) =>
      previous.map((course) =>
        course.id === id
          ? {
              ...course,
              status:
                course.status === "PUBLISHED" ? "DRAFT" : "PUBLISHED",
            }
          : course
      )
    );
  };

  const toggleAnnouncementStatus = (id: number) => {
    setAnnouncements((previous) =>
      previous.map((item) =>
        item.id === id
          ? {
              ...item,
              status:
                item.status === "PUBLISHED" ? "DRAFT" : "PUBLISHED",
            }
          : item
      )
    );
  };

  const deleteCourse = (id: number) => {
    if (!window.confirm("Delete this course?")) return;
    setCourses((previous) => previous.filter((item) => item.id !== id));
    showMessage("Course deleted.");
  };

  const deleteAnnouncement = (id: number) => {
    if (!window.confirm("Delete this announcement?")) return;
    setAnnouncements((previous) =>
      previous.filter((item) => item.id !== id)
    );
    showMessage("Announcement deleted.");
  };

  const cardClass =
    "rounded-xl border border-gray-200 bg-white p-5 shadow-sm";
  const labelClass =
    "mb-2 block text-xs font-bold uppercase tracking-wide text-gray-500";
  const inputClass =
    "w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none transition focus:border-[#D71920] focus:ring-2 focus:ring-red-100";
  const primaryButton =
    "inline-flex items-center justify-center gap-2 rounded-lg bg-[#D71920] px-4 py-2.5 text-sm font-bold text-white transition hover:bg-red-700";
  const secondaryButton =
    "inline-flex items-center justify-center gap-2 rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50";

  const StatCard = ({
    title,
    value,
    icon: Icon,
    detail,
  }: {
    title: string;
    value: string | number;
    icon: typeof Users;
    detail: string;
  }) => (
    <div className={cardClass}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <h3 className="mt-2 text-3xl font-black text-gray-900">
            {value}
          </h3>
          <p className="mt-2 text-xs text-gray-500">{detail}</p>
        </div>
        <div className="rounded-xl bg-red-50 p-3">
          <Icon size={24} className="text-[#D71920]" />
        </div>
      </div>
    </div>
  );

  const Status = ({ value }: { value: string }) => (
    <span
      className={`rounded-full px-3 py-1 text-[10px] font-bold ${
        value === "ACTIVE" || value === "PUBLISHED"
          ? "bg-green-100 text-green-700"
          : value === "INACTIVE"
            ? "bg-red-100 text-red-700"
            : "bg-yellow-100 text-yellow-700"
      }`}
    >
      {value}
    </span>
  );

  const Modal = ({
    title,
    onClose,
    children,
  }: {
    title: string;
    onClose: () => void;
    children: React.ReactNode;
  }) => (
    <div className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-black/50 p-4">
      <div className="my-auto w-full max-w-xl rounded-2xl bg-white p-6 shadow-2xl">
        <div className="mb-6 flex items-center justify-between">
          <h3 className="text-xl font-black text-gray-900">{title}</h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-gray-500 hover:bg-gray-100"
          >
            <X size={20} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F5F5F5] p-5 md:p-8">
      {/* Header */}
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#D71920]">
            <ShieldCheck size={16} />
            IJSE Administration
          </div>
          <h1 className="text-3xl font-black text-gray-900">
            Admin Dashboard
          </h1>
          <p className="mt-2 text-sm text-gray-500">
            Manage staff, website content and institute operations.
          </p>
        </div>

        <div className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100">
            <ShieldCheck className="text-[#D71920]" />
          </div>
          <div>
            <p className="text-sm font-bold text-gray-900">Administrator</p>
            <p className="text-xs text-gray-500">System Admin</p>
          </div>
        </div>
      </div>

      {/* Notification */}
      {message && (
        <div className="mb-5 flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm font-semibold text-green-700">
          <ShieldCheck size={18} />
          {message}
        </div>
      )}

      {/* Navigation tabs */}
      <div className="mb-8 flex gap-2 overflow-x-auto rounded-xl border border-gray-200 bg-white p-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex shrink-0 items-center gap-2 rounded-lg px-4 py-3 text-sm font-semibold transition ${
                activeTab === tab.id
                  ? "bg-[#D71920] text-white"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              <Icon size={17} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* OVERVIEW */}
      {activeTab === "overview" && (
        <div className="space-y-8">
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              title="Total Staff"
              value={staff.length}
              icon={Users}
              detail="Department officer accounts"
            />
            <StatCard
              title="Active Staff"
              value={activeStaff}
              icon={UserCheck}
              detail="Currently active accounts"
            />
            <StatCard
              title="Courses"
              value={courses.length}
              icon={BookOpen}
              detail="Available course records"
            />
            <StatCard
              title="Announcements"
              value={announcements.length}
              icon={Megaphone}
              detail="Public announcement records"
            />
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <div className={cardClass}>
              <div className="mb-5 flex items-center justify-between">
                <h2 className="font-bold text-gray-900">
                  Department Accounts
                </h2>
                <button
                  type="button"
                  onClick={() => setActiveTab("staff")}
                  className="text-xs font-bold text-[#D71920]"
                >
                  Manage Staff →
                </button>
              </div>

              {[
                {
                  role: "Marketing Department",
                  icon: Users,
                  count: staff.filter((s) => s.role === "MARKETING").length,
                },
                {
                  role: "Academic Department",
                  icon: GraduationCap,
                  count: staff.filter((s) => s.role === "ACADEMIC").length,
                },
                {
                  role: "Finance Department",
                  icon: Wallet,
                  count: staff.filter((s) => s.role === "FINANCE").length,
                },
              ].map((department) => {
                const Icon = department.icon;

                return (
                  <div
                    key={department.role}
                    className="flex items-center justify-between border-b border-gray-100 py-4 last:border-0"
                  >
                    <div className="flex items-center gap-3">
                      <div className="rounded-lg bg-red-50 p-2">
                        <Icon className="text-[#D71920]" size={20} />
                      </div>
                      <span className="text-sm font-semibold text-gray-700">
                        {department.role}
                      </span>
                    </div>
                    <span className="font-black text-gray-900">
                      {department.count}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className={cardClass}>
              <h2 className="mb-5 font-bold text-gray-900">
                Quick Actions
              </h2>
              <div className="grid gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={openNewStaff}
                  className="flex items-center gap-3 rounded-xl border border-gray-200 p-4 text-left transition hover:border-red-300 hover:bg-red-50"
                >
                  <Users className="text-[#D71920]" />
                  <span className="text-sm font-semibold">Create Officer</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("website")}
                  className="flex items-center gap-3 rounded-xl border border-gray-200 p-4 text-left transition hover:border-red-300 hover:bg-red-50"
                >
                  <Globe className="text-[#D71920]" />
                  <span className="text-sm font-semibold">Edit Website</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEditingCourseId(null);
                    setCourseForm({
                      name: "",
                      code: "",
                      description: "",
                      duration: "",
                    });
                    setShowCourseModal(true);
                  }}
                  className="flex items-center gap-3 rounded-xl border border-gray-200 p-4 text-left transition hover:border-red-300 hover:bg-red-50"
                >
                  <BookOpen className="text-[#D71920]" />
                  <span className="text-sm font-semibold">Add Course</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowAnnouncementModal(true)}
                  className="flex items-center gap-3 rounded-xl border border-gray-200 p-4 text-left transition hover:border-red-300 hover:bg-red-50"
                >
                  <Megaphone className="text-[#D71920]" />
                  <span className="text-sm font-semibold">New Announcement</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* STAFF MANAGEMENT */}
      {activeTab === "staff" && (
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-black text-gray-900">
                Department Officers
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                Create and manage Marketing, Academic and Finance accounts.
              </p>
            </div>
            <button type="button" onClick={openNewStaff} className={primaryButton}>
              <Plus size={18} /> Create Officer
            </button>
          </div>

          <div className={cardClass}>
            <div className="mb-5 flex flex-wrap gap-3">
              <div className="relative min-w-[220px] flex-1">
                <Search
                  size={17}
                  className="absolute left-3 top-3 text-gray-400"
                />
                <input
                  value={staffSearch}
                  onChange={(event) => setStaffSearch(event.target.value)}
                  placeholder="Search name or email..."
                  className={`${inputClass} pl-10`}
                />
              </div>

              <select
                value={staffRoleFilter}
                onChange={(event) => setStaffRoleFilter(event.target.value)}
                className={inputClass + " max-w-[210px]"}
              >
                <option value="ALL">All Departments</option>
                <option value="MARKETING">Marketing</option>
                <option value="ACADEMIC">Academic</option>
                <option value="FINANCE">Finance</option>
              </select>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[850px] text-left">
                <thead>
                  <tr className="border-b border-gray-200 text-xs uppercase text-gray-500">
                    <th className="px-3 py-4">Officer</th>
                    <th className="px-3 py-4">Department</th>
                    <th className="px-3 py-4">Status</th>
                    <th className="px-3 py-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStaff.map((person) => (
                    <tr key={person.id} className="border-b border-gray-100">
                      <td className="px-3 py-4">
                        <p className="font-bold text-gray-900">
                          {person.name}
                        </p>
                        <p className="mt-1 text-xs text-gray-500">
                          {person.email}
                        </p>
                        <p className="mt-1 text-xs text-gray-400">
                          {person.phone}
                        </p>
                      </td>
                      <td className="px-3 py-4 text-sm font-semibold text-gray-700">
                        {person.role}
                      </td>
                      <td className="px-3 py-4">
                        <Status value={person.status} />
                      </td>
                      <td className="px-3 py-4">
                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            title="Edit officer"
                            onClick={() => openEditStaff(person)}
                            className="rounded-lg border p-2 text-gray-600 hover:bg-gray-100"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            type="button"
                            title="Reset password"
                            onClick={() => {
                              setResetStaff(person);
                              setNewPassword("");
                              setShowPasswordModal(true);
                            }}
                            className="rounded-lg border p-2 text-blue-600 hover:bg-blue-50"
                          >
                            <KeyRound size={16} />
                          </button>
                          <button
                            type="button"
                            title="Activate or deactivate"
                            onClick={() => toggleStaffStatus(person.id)}
                            className="rounded-lg border p-2 text-gray-600 hover:bg-gray-100"
                          >
                            {person.status === "ACTIVE" ? (
                              <UserX size={16} />
                            ) : (
                              <UserCheck size={16} />
                            )}
                          </button>
                          <button
                            type="button"
                            title="Delete staff account"
                            onClick={() => handleDeleteStaff(person.id)}
                            className="rounded-lg border p-2 text-red-600 hover:bg-red-50"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredStaff.length === 0 && (
                    <tr>
                      <td
                        colSpan={4}
                        className="py-10 text-center text-sm text-gray-500"
                      >
                        No officer accounts found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* WEBSITE EDITOR */}
      {activeTab === "website" && (
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-black text-gray-900">
              Public Website Editor
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Update the content displayed to visitors on the IJSE website.
            </p>
          </div>

          <div className="grid gap-6 xl:grid-cols-2">
            <div className={cardClass}>
              <div className="mb-5 flex items-center gap-3">
                <Globe className="text-[#D71920]" />
                <h3 className="font-bold text-gray-900">Home Page Content</h3>
              </div>

              <form
                onSubmit={async (event) => {
                  event.preventDefault();
                  try {
                    await updateWebsiteContent(website);
                  } catch (err) {
                    console.warn("Could not save website content to backend", err);
                  }
                  showMessage("Home page content saved.");
                }}
                className="space-y-4"
              >
                <div>
                  <label className={labelClass}>Institute Name</label>
                  <input
                    className={inputClass}
                    value={website.instituteName}
                    onChange={(e) =>
                      setWebsite({ ...website, instituteName: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className={labelClass}>Tagline</label>
                  <input
                    className={inputClass}
                    value={website.tagline}
                    onChange={(e) =>
                      setWebsite({ ...website, tagline: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className={labelClass}>Hero Heading</label>
                  <input
                    className={inputClass}
                    value={website.heroTitle}
                    onChange={(e) =>
                      setWebsite({ ...website, heroTitle: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className={labelClass}>Hero Description</label>
                  <textarea
                    rows={4}
                    className={inputClass}
                    value={website.heroDescription}
                    onChange={(e) =>
                      setWebsite({
                        ...website,
                        heroDescription: e.target.value,
                      })
                    }
                  />
                </div>
                <button className={primaryButton} type="submit">
                  <Save size={17} /> Save Home Page
                </button>
              </form>
            </div>

            <div className={cardClass}>
              <div className="mb-5 flex items-center gap-3">
                <Building2 className="text-[#D71920]" />
                <h3 className="font-bold text-gray-900">About IJSE</h3>
              </div>

              <form
                onSubmit={(event) => {
                  event.preventDefault();
                  showMessage("About page content saved in this demo.");
                }}
                className="space-y-4"
              >
                <div>
                  <label className={labelClass}>Section Heading</label>
                  <input
                    className={inputClass}
                    value={website.aboutTitle}
                    onChange={(e) =>
                      setWebsite({ ...website, aboutTitle: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className={labelClass}>About Description</label>
                  <textarea
                    rows={6}
                    className={inputClass}
                    value={website.aboutDescription}
                    onChange={(e) =>
                      setWebsite({
                        ...website,
                        aboutDescription: e.target.value,
                      })
                    }
                  />
                </div>
                <button className={primaryButton} type="submit">
                  <Save size={17} /> Save About Page
                </button>
              </form>
            </div>

            <div className={cardClass}>
              <div className="mb-5 flex items-center gap-3">
                <Phone className="text-[#D71920]" />
                <h3 className="font-bold text-gray-900">Contact Information</h3>
              </div>

              <form
                onSubmit={(event) => {
                  event.preventDefault();
                  showMessage("Contact information saved in this demo.");
                }}
                className="space-y-4"
              >
                <div>
                  <label className={labelClass}>Email Address</label>
                  <input
                    type="email"
                    className={inputClass}
                    value={website.email}
                    onChange={(e) =>
                      setWebsite({ ...website, email: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className={labelClass}>Phone Number</label>
                  <input
                    className={inputClass}
                    value={website.phone}
                    onChange={(e) =>
                      setWebsite({ ...website, phone: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className={labelClass}>Institute Address</label>
                  <textarea
                    rows={3}
                    className={inputClass}
                    value={website.address}
                    onChange={(e) =>
                      setWebsite({ ...website, address: e.target.value })
                    }
                  />
                </div>
                <button className={primaryButton} type="submit">
                  <Save size={17} /> Save Contact Details
                </button>
              </form>
            </div>

            <div className={cardClass}>
              <h3 className="mb-4 font-bold text-gray-900">Website Preview</h3>
              <div className="rounded-xl bg-[#171717] p-6 text-white">
                <p className="text-2xl font-black">
                  {website.instituteName}
                  <span className="text-[#D71920]">.</span>
                </p>
                <p className="mt-2 text-xs text-gray-400">
                  {website.tagline}
                </p>
                <div className="my-5 h-px bg-white/10" />
                <h4 className="text-2xl font-black">{website.heroTitle}</h4>
                <p className="mt-3 text-sm text-gray-300">
                  {website.heroDescription}
                </p>
                <button
                  type="button"
                  className="mt-5 rounded-lg bg-[#D71920] px-4 py-2 text-sm font-bold"
                >
                  Explore Courses
                </button>
              </div>
              <p className="mt-3 text-xs text-gray-500">
                Preview only. Saving this form does not yet publish changes to
                the live website.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* COURSE MANAGEMENT */}
      {activeTab === "courses" && (
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-black text-gray-900">
                Course Management
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                Manage the courses displayed on the public website.
              </p>
            </div>
            <button
              type="button"
              className={primaryButton}
              onClick={() => {
                setEditingCourseId(null);
                setCourseForm({
                  name: "",
                  code: "",
                  description: "",
                  duration: "",
                });
                setShowCourseModal(true);
              }}
            >
              <Plus size={18} /> Add Course
            </button>
          </div>

          <div className={cardClass}>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[750px] text-left">
                <thead>
                  <tr className="border-b text-xs uppercase text-gray-500">
                    <th className="px-3 py-4">Course</th>
                    <th className="px-3 py-4">Code</th>
                    <th className="px-3 py-4">Duration</th>
                    <th className="px-3 py-4">Status</th>
                    <th className="px-3 py-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {courses.map((course) => (
                    <tr key={course.id} className="border-b border-gray-100">
                      <td className="px-3 py-4">
                        <p className="font-bold text-gray-900">{course.name}</p>
                        <p className="mt-1 text-xs text-gray-500">
                          {course.description}
                        </p>
                      </td>
                      <td className="px-3 py-4 text-sm">{course.code}</td>
                      <td className="px-3 py-4 text-sm">{course.duration}</td>
                      <td className="px-3 py-4">
                        <Status value={course.status} />
                      </td>
                      <td className="px-3 py-4">
                        <div className="flex gap-2">
                          <button
                            type="button"
                            title="Edit course"
                            className="rounded-lg border p-2 hover:bg-gray-100"
                            onClick={() => {
                              setEditingCourseId(course.id);
                              setCourseForm({
                                name: course.name,
                                code: course.code,
                                description: course.description,
                                duration: course.duration,
                              });
                              setShowCourseModal(true);
                            }}
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            type="button"
                            title="Publish or unpublish"
                            className="rounded-lg border p-2 hover:bg-gray-100"
                            onClick={() => toggleCourseStatus(course.id)}
                          >
                            <Eye size={16} />
                          </button>
                          <button
                            type="button"
                            title="Delete course"
                            className="rounded-lg border p-2 text-red-600 hover:bg-red-50"
                            onClick={() => deleteCourse(course.id)}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ANNOUNCEMENTS */}
      {activeTab === "announcements" && (
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-black text-gray-900">
                Public Announcements
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                Publish notices and updates for website visitors.
              </p>
            </div>
            <button
              type="button"
              className={primaryButton}
              onClick={() => setShowAnnouncementModal(true)}
            >
              <Plus size={18} /> New Announcement
            </button>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            {announcements.map((item) => (
              <div key={item.id} className={cardClass}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-bold text-gray-900">{item.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-gray-600">
                      {item.description}
                    </p>
                    <p className="mt-3 text-xs text-gray-400">{item.date}</p>
                  </div>
                  <Status value={item.status} />
                </div>
                <div className="mt-5 flex gap-2 border-t border-gray-100 pt-4">
                  <button
                    type="button"
                    className={secondaryButton}
                    onClick={() => toggleAnnouncementStatus(item.id)}
                  >
                    <Eye size={16} />
                    {item.status === "PUBLISHED" ? "Unpublish" : "Publish"}
                  </button>
                  <button
                    type="button"
                    className="rounded-lg border border-red-200 px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                    onClick={() => deleteAnnouncement(item.id)}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
            {announcements.length === 0 && (
              <div className={cardClass}>
                <p className="text-sm text-gray-500">
                  No announcements created yet.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* SETTINGS */}
      {activeTab === "settings" && (
        <div className="grid gap-6 lg:grid-cols-2">
          <div className={cardClass}>
            <h2 className="mb-2 font-bold text-gray-900">
              Institute Settings
            </h2>
            <p className="mb-5 text-sm text-gray-500">
              General institute information and system preferences.
            </p>
            <div className="space-y-4">
              <div className="flex items-center gap-3 rounded-lg bg-gray-50 p-4">
                <Building2 className="text-[#D71920]" />
                <div>
                  <p className="text-sm font-bold">Institute Profile</p>
                  <p className="text-xs text-gray-500">
                    Manage institute name and contact information in Website
                    Editor.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-lg bg-gray-50 p-4">
                <Mail className="text-[#D71920]" />
                <div>
                  <p className="text-sm font-bold">Official Email</p>
                  <p className="text-xs text-gray-500">{website.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-lg bg-gray-50 p-4">
                <MapPin className="text-[#D71920]" />
                <div>
                  <p className="text-sm font-bold">Institute Address</p>
                  <p className="text-xs text-gray-500">{website.address}</p>
                </div>
              </div>
            </div>
          </div>

          <div className={cardClass}>
            <h2 className="mb-2 font-bold text-gray-900">
              Security Guidelines
            </h2>
            <ul className="space-y-3 text-sm text-gray-600">
              <li>• Only authorized administrators should create officer accounts.</li>
              <li>• Require password changes after temporary credentials are issued.</li>
              <li>• Record administrative actions in an audit log.</li>
              <li>• Use backend role authorization for every admin operation.</li>
              <li>• Never store passwords as plain text.</li>
            </ul>
          </div>
        </div>
      )}

      {/* ACTIVITY LOGS */}
      {activeTab === "activity" && (
        <div className={cardClass}>
          <div className="mb-5 flex items-center gap-3">
            <History className="text-[#D71920]" />
            <div>
              <h2 className="font-bold text-gray-900">Activity Logs</h2>
              <p className="text-xs text-gray-500">
                Administrative activity tracking.
              </p>
            </div>
          </div>
          <div className="rounded-lg border border-dashed border-gray-300 p-8 text-center">
            <History size={32} className="mx-auto text-gray-400" />
            <p className="mt-3 font-semibold text-gray-700">
              No connected audit logs
            </p>
            <p className="mt-1 text-sm text-gray-500">
              Activity history will appear here after backend integration.
            </p>
          </div>
        </div>
      )}

      {/* CREATE / EDIT OFFICER MODAL */}
      {showStaffModal && (
        <Modal
          title={editingStaff ? "Edit Officer Account" : "Create Officer Account"}
          onClose={() => setShowStaffModal(false)}
        >
          <form onSubmit={handleStaffSubmit} className="space-y-4">
            <div>
              <label className={labelClass}>Full Name</label>
              <input
                required
                className={inputClass}
                value={staffForm.name}
                onChange={(e) =>
                  setStaffForm({ ...staffForm, name: e.target.value })
                }
                placeholder="Enter officer name (e.g. Sarath Perera)"
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className={labelClass}>Email Address</label>
                <button
                  type="button"
                  onClick={autoGenerateEmail}
                  className="flex items-center gap-1 text-xs text-[#D71920] font-semibold hover:underline"
                >
                  <Sparkles size={12} /> Auto-Generate
                </button>
              </div>
              <input
                required
                type="email"
                className={inputClass}
                value={staffForm.email}
                onChange={(e) =>
                  setStaffForm({ ...staffForm, email: e.target.value })
                }
                placeholder="officer@ijse.lk"
              />
            </div>
            <div>
              <label className={labelClass}>Phone Number</label>
              <input
                required
                className={inputClass}
                value={staffForm.phone}
                onChange={(e) =>
                  setStaffForm({ ...staffForm, phone: e.target.value })
                }
                placeholder="07XXXXXXXX"
              />
            </div>
            <div>
              <label className={labelClass}>Department Role</label>
              <select
                className={inputClass}
                value={staffForm.role}
                onChange={(e) =>
                  setStaffForm({
                    ...staffForm,
                    role: e.target.value as OfficerRole,
                  })
                }
              >
                <option value="MARKETING">Marketing Officer</option>
                <option value="ACADEMIC">Academic Officer</option>
                <option value="FINANCE">Finance Officer</option>
              </select>
            </div>
            {!editingStaff && (
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className={labelClass}>Temporary Password</label>
                  <button
                    type="button"
                    onClick={autoGeneratePassword}
                    className="flex items-center gap-1 text-xs text-[#D71920] font-semibold hover:underline"
                  >
                    <Sparkles size={12} /> Auto-Generate
                  </button>
                </div>
                <div className="relative">
                  <input
                    required
                    minLength={8}
                    type={showPassword ? "text" : "password"}
                    className={inputClass + " pr-10"}
                    value={temporaryPassword}
                    onChange={(e) => setTemporaryPassword(e.target.value)}
                    placeholder="At least 8 characters (e.g. Staff@123)"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                <p className="mt-2 text-xs text-gray-500">
                  Securely stored in MongoDB. The officer can immediately sign in at /login with this password.
                </p>
              </div>
            )}
            <div className="flex justify-end gap-3 pt-3">
              <button
                type="button"
                className={secondaryButton}
                onClick={() => setShowStaffModal(false)}
              >
                Cancel
              </button>
              <button type="submit" disabled={staffLoading} className={primaryButton}>
                <Save size={17} />
                {staffLoading ? "Saving..." : editingStaff ? "Save Changes" : "Create Account"}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* CREATED / RESET STAFF CREDENTIALS MODAL */}
      {createdCredentials && (
        <Modal
          title="Staff Account Credentials"
          onClose={() => setCreatedCredentials(null)}
        >
          <div className="space-y-4">
            <div className="rounded-xl border border-green-200 bg-green-50 p-4 text-center">
              <ShieldCheck size={36} className="mx-auto text-green-600 mb-2" />
              <h3 className="font-bold text-green-900 text-base">Account Ready for Sign In</h3>
              <p className="text-xs text-green-700 mt-1">
                This staff member can now log in to the UniFlow system at <strong>/login</strong>.
              </p>
            </div>

            <div className="space-y-3 rounded-xl border border-gray-100 bg-gray-50 p-4">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Officer Name</span>
                <p className="font-bold text-gray-900">{createdCredentials.name}</p>
              </div>

              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Department Role</span>
                <p className="text-sm font-semibold text-gray-700">{createdCredentials.role} Officer</p>
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Login Email</span>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(createdCredentials.email, "email")}
                    className="flex items-center gap-1 text-xs text-[#D71920] hover:underline"
                  >
                    {copiedField === "email" ? <Check size={13} className="text-green-600" /> : <Copy size={13} />}
                    {copiedField === "email" ? "Copied" : "Copy Email"}
                  </button>
                </div>
                <div className="mt-1 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-mono font-medium text-gray-800">
                  {createdCredentials.email}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Temporary Password</span>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(createdCredentials.temporaryPassword, "password")}
                    className="flex items-center gap-1 text-xs text-[#D71920] hover:underline"
                  >
                    {copiedField === "password" ? <Check size={13} className="text-green-600" /> : <Copy size={13} />}
                    {copiedField === "password" ? "Copied" : "Copy Password"}
                  </button>
                </div>
                <div className="mt-1 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-mono font-bold text-red-600">
                  {createdCredentials.temporaryPassword}
                </div>
              </div>
            </div>

            <p className="text-xs text-gray-500">
              Please share these credentials securely with the staff member. They will be prompted to set their permanent password upon logging in.
            </p>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                className={primaryButton}
                onClick={() => setCreatedCredentials(null)}
              >
                Done
              </button>
            </div>
          </div>
        </Modal>
      )}


      {/* PASSWORD RESET MODAL */}
      {showPasswordModal && resetStaff && (
        <Modal
          title="Reset Officer Password"
          onClose={() => setShowPasswordModal(false)}
        >
          <form onSubmit={handlePasswordReset} className="space-y-4">
            <p className="text-sm text-gray-600">
              Resetting password for{" "}
              <strong>{resetStaff.name}</strong> ({resetStaff.email}).
            </p>
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className={labelClass}>New Temporary Password</label>
                <button
                  type="button"
                  onClick={() => {
                    const num = Math.floor(1000 + Math.random() * 9000);
                    setNewPassword(`Staff@${num}!`);
                  }}
                  className="flex items-center gap-1 text-xs text-[#D71920] font-semibold hover:underline"
                >
                  <Sparkles size={12} /> Auto-Generate
                </button>
              </div>
              <div className="relative">
                <input
                  required
                  minLength={8}
                  type={showPassword ? "text" : "password"}
                  className={inputClass + " pr-10"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter a new temporary password (min 8 chars)"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                className={secondaryButton}
                onClick={() => setShowPasswordModal(false)}
              >
                Cancel
              </button>
              <button type="submit" className={primaryButton}>
                <KeyRound size={17} /> Reset Password
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* ADD / EDIT COURSE MODAL */}
      {showCourseModal && (
        <Modal
          title={editingCourseId !== null ? "Edit Course" : "Add New Course"}
          onClose={() => setShowCourseModal(false)}
        >
          <form onSubmit={handleCourseSubmit} className="space-y-4">
            <div>
              <label className={labelClass}>Course Name</label>
              <input
                required
                className={inputClass}
                value={courseForm.name}
                onChange={(e) =>
                  setCourseForm({ ...courseForm, name: e.target.value })
                }
              />
            </div>
            <div>
              <label className={labelClass}>Course Code</label>
              <input
                required
                className={inputClass}
                value={courseForm.code}
                onChange={(e) =>
                  setCourseForm({ ...courseForm, code: e.target.value })
                }
              />
            </div>
            <div>
              <label className={labelClass}>Description</label>
              <textarea
                required
                rows={3}
                className={inputClass}
                value={courseForm.description}
                onChange={(e) =>
                  setCourseForm({
                    ...courseForm,
                    description: e.target.value,
                  })
                }
              />
            </div>
            <div>
              <label className={labelClass}>Duration</label>
              <input
                required
                className={inputClass}
                value={courseForm.duration}
                onChange={(e) =>
                  setCourseForm({ ...courseForm, duration: e.target.value })
                }
                placeholder="e.g. 2 Years"
              />
            </div>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                className={secondaryButton}
                onClick={() => setShowCourseModal(false)}
              >
                Cancel
              </button>
              <button type="submit" className={primaryButton}>
                <Save size={17} /> Save Course
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* NEW ANNOUNCEMENT MODAL */}
      {showAnnouncementModal && (
        <Modal
          title="Create Announcement"
          onClose={() => setShowAnnouncementModal(false)}
        >
          <form onSubmit={handleAnnouncementSubmit} className="space-y-4">
            <div>
              <label className={labelClass}>Announcement Title</label>
              <input
                required
                className={inputClass}
                value={announcementForm.title}
                onChange={(e) =>
                  setAnnouncementForm({
                    ...announcementForm,
                    title: e.target.value,
                  })
                }
              />
            </div>
            <div>
              <label className={labelClass}>Description</label>
              <textarea
                required
                rows={5}
                className={inputClass}
                value={announcementForm.description}
                onChange={(e) =>
                  setAnnouncementForm({
                    ...announcementForm,
                    description: e.target.value,
                  })
                }
              />
            </div>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                className={secondaryButton}
                onClick={() => setShowAnnouncementModal(false)}
              >
                Cancel
              </button>
              <button type="submit" className={primaryButton}>
                <Save size={17} /> Create Draft
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}

export default Admin;
