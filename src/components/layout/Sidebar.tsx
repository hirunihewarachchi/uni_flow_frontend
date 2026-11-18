
import { NavLink, useNavigate } from "react-router-dom";
import type { LucideIcon } from "lucide-react";

import {
  LayoutDashboard,
  BookOpen,
  Building2,
  ClipboardList,
  CalendarDays,
  BrainCircuit,
  Target,
  GraduationCap,
  Users,
  Wallet,
  Award,
  LogIn,
  LogOut,
  UserRound,
  X,
} from "lucide-react";

type UserRole =
  | "STUDENT"
  | "MARKETING"
  | "ACADEMIC"
  | "FINANCE"
  | "EXAM"
  | "EXAM_OFFICER"
  | "ADMIN"
  | "SUPER_ADMIN";

interface SidebarProps {
  isAuthenticated?: boolean;
  userRole?: UserRole | string | null;
  userName?: string;
  isOpen?: boolean;
  onClose?: () => void;
}

type MenuItem = {
  title: string;
  path: string;
  icon: LucideIcon;
};

// Public navigation
const publicMenu: MenuItem[] = [
  { title: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
  { title: "Courses", path: "/courses", icon: BookOpen },
  {
    title: "Departments & Lecturers",
    path: "/departments",
    icon: Building2,
  },
  { title: "Enrollment", path: "/enrollment", icon: ClipboardList },
];

// Student navigation
const studentMenu: MenuItem[] = [
  { title: "Lecture Timetable", path: "/lecture-timetable", icon: CalendarDays },
  { title: "Exam Timetable", path: "/exam-timetable", icon: CalendarDays },
  { title: "Examination Results", path: "/results", icon: Award },
  { title: "Finance & Payments", path: "/finance", icon: Wallet },
];

// AI features
const aiMenu: MenuItem[] = [
  { title: "Fill Skill Gaps", path: "/skill-gaps", icon: BrainCircuit },
  { title: "Career Roadmap", path: "/career-roadmap", icon: Target },
];

function Sidebar({
  isAuthenticated = false,
  userRole = null,
  userName = "UniFlow Member",
  isOpen = false,
  onClose,
}: SidebarProps) {
  const navigate = useNavigate();

  const isStudent = isAuthenticated && userRole === "STUDENT";
  const isMarketing = isAuthenticated && (userRole === "MARKETING" || userRole === "ADMIN" || userRole === "SUPER_ADMIN");
  const isAcademic = isAuthenticated && (userRole === "ACADEMIC" || userRole === "ADMIN" || userRole === "SUPER_ADMIN");
  const isFinance = isAuthenticated && (userRole === "FINANCE" || userRole === "ADMIN" || userRole === "SUPER_ADMIN");
  const isExam = isAuthenticated && (userRole === "EXAM" || userRole === "EXAM_OFFICER" || userRole === "ADMIN" || userRole === "SUPER_ADMIN");
  const isAdmin = isAuthenticated && (userRole === "ADMIN" || userRole === "SUPER_ADMIN");

  // Render navigation links
  const renderMenu = (items: MenuItem[]) =>
    items.map((item) => {
      const Icon = item.icon;

      return (
        <NavLink
          key={item.path}
          to={item.path}
          onClick={() => onClose?.()}
          className={({ isActive }) =>
            `group flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-semibold transition-all duration-200 ${
              isActive
                ? "bg-[#D71920] text-white shadow-lg shadow-red-950/30"
                : "text-[#A3A3A3] hover:bg-white/10 hover:text-white"
            }`
          }
        >
          {({ isActive }) => (
            <>
              <Icon
                size={19}
                strokeWidth={isActive ? 2.5 : 2}
                className={
                  isActive
                    ? "text-white"
                    : "text-[#737373] transition-colors group-hover:text-white"
                }
              />

              <span className="flex-1">{item.title}</span>

              {isActive && (
                <span className="h-1.5 w-1.5 rounded-full bg-white" />
              )}
            </>
          )}
        </NavLink>
      );
    });

  // Logout
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("ijse_token");
    localStorage.removeItem("ijse_user");

    navigate("/login", { replace: true });
    window.location.reload();
  };

  // User role label
  const getRoleName = () => {
    if (isAdmin) return "Administration";
    if (userRole === "EXAM" || userRole === "EXAM_OFFICER") return "Examination Portal";
    if (userRole === "MARKETING" || userRole === "MARKETING_OFFICER") return "Marketing Portal";
    if (userRole === "ACADEMIC" || userRole === "ACADEMIC_OFFICER") return "Academic Portal";
    if (userRole === "FINANCE" || userRole === "FINANCE_OFFICER") return "Finance Portal";
    if (isStudent) return "Student Portal";

    return "UniFlow Member";
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs transition-opacity lg:hidden"
        />
      )}

      <aside
        className={`fixed left-0 top-0 z-40 flex h-screen w-64 flex-col bg-[#171717] text-white transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* BRANDING */}
        <div className="flex shrink-0 items-center justify-between border-b border-white/10 px-6 py-6">
          <div>
            <h1 className="text-3xl font-black tracking-wider lg:text-4xl">
              UniFlow<span className="text-[#D71920]">.</span>
            </h1>

            <div className="mt-2 h-1 w-10 rounded-full bg-[#D71920]" />

            <p className="mt-2 text-[10px] font-medium leading-relaxed tracking-wide text-[#A3A3A3]">
              University Management System
            </p>
          </div>

          {/* Mobile Close Button */}
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-gray-400 hover:bg-white/10 hover:text-white lg:hidden"
            aria-label="Close sidebar"
          >
            <X size={20} />
          </button>
        </div>

      {/* NAVIGATION */}
      <nav className="min-h-0 flex-1 space-y-7 overflow-y-auto px-4 py-7">

        {/* Institute */}
        <div className="space-y-2">
          <p className="mb-4 px-3 text-[10px] font-bold uppercase tracking-[0.2em] text-[#737373]">
            Institute
          </p>

          {renderMenu(publicMenu)}
        </div>

        {/* Marketing Department */}
        {isMarketing && (
          <div className="space-y-2">
            <p className="mb-4 px-3 text-[10px] font-bold uppercase tracking-[0.2em] text-[#737373]">
              Marketing Department
            </p>

            {renderMenu([
              {
                title: "Marketing Management",
                path: "/marketing",
                icon: Users,
              },
            ])}
          </div>
        )}

        {/* Academic Department */}
        {isAcademic && (
          <div className="space-y-2">
            <p className="mb-4 px-3 text-[10px] font-bold uppercase tracking-[0.2em] text-[#737373]">
              Academic Department
            </p>

            {renderMenu([
              {
                title: "Academic Management",
                path: "/academic",
                icon: GraduationCap,
              },
            ])}
          </div>
        )}

        {/* Finance Department */}
        {isFinance && (
          <div className="space-y-2">
            <p className="mb-4 px-3 text-[10px] font-bold uppercase tracking-[0.2em] text-[#737373]">
              Finance Department
            </p>

            {renderMenu([
              {
                title: "Finance Management",
                path: "/finance-management",
                icon: Wallet,
              },
            ])}
          </div>
        )}

        {/* Examination Department */}
        {isExam && (
          <div className="space-y-2">
            <p className="mb-4 px-3 text-[10px] font-bold uppercase tracking-[0.2em] text-[#737373]">
              Examination Department
            </p>

            {renderMenu([
              {
                title: "Exam Timetable & Results",
                path: "/exam-timetable",
                icon: Award,
              },
            ])}
          </div>
        )}

        {/* Administration */}
        {isAdmin && (
          <div className="space-y-2">
            <p className="mb-4 px-3 text-[10px] font-bold uppercase tracking-[0.2em] text-[#737373]">
              Administration
            </p>

            {renderMenu([
              {
                title: "Admin Management",
                path: "/admin",
                icon: Building2,
              },
            ])}
          </div>
        )}

        {/* Student Portal */}
        {isStudent && (
          <>
            <div className="space-y-2">
              <p className="mb-4 px-3 text-[10px] font-bold uppercase tracking-[0.2em] text-[#737373]">
                Student Portal
              </p>

              {renderMenu(studentMenu)}
            </div>

            {/* AI Career Guidance */}
            <div className="space-y-2">
              <div className="mb-4 flex items-center justify-between px-3">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#737373]">
                  AI Career Guidance
                </p>

                <BrainCircuit size={15} className="text-[#D71920]" />
              </div>

              {renderMenu(aiMenu)}
            </div>
          </>
        )}
      </nav>

      {/* BOTTOM AUTHENTICATION SECTION */}
      <div className="shrink-0 border-t border-white/10 bg-[#171717] px-4 py-5">

        {isAuthenticated ? (
          <div className="space-y-4">

            {/* User Profile */}
            <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#D71920]/20">
                <UserRound size={20} className="text-[#D71920]" />
              </div>

              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-white">
                  {userName}
                </p>

                <p className="mt-1 text-[10px] text-[#A3A3A3]">
                  {getRoleName()}
                </p>
              </div>
            </div>

            {/* Sign Out */}
            <button
              type="button"
              onClick={handleLogout}
              className="flex w-full items-center justify-center gap-2 rounded-lg border border-white/10 px-4 py-3 text-sm font-semibold text-[#A3A3A3] transition hover:border-red-500 hover:bg-red-500/10 hover:text-white"
            >
              <LogOut size={18} />
              Sign Out
            </button>
          </div>
        ) : (
          <div className="space-y-4">

            {/* Sign In */}
            <NavLink
              to="/login"
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#D71920] px-4 py-3 text-sm font-bold text-white transition hover:bg-red-700"
            >
              <LogIn size={18} />
              Sign In
            </NavLink>

            {/* Join UniFlow */}
            <div className="border-t border-white/10 pt-4">
              <div className="flex items-center gap-3 px-2">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#D71920]/20">
                  <GraduationCap size={22} className="text-[#D71920]" />
                </div>

                <div>
                  <p className="text-sm font-bold text-white">
                    Join UniFlow
                  </p>

                  <p className="mt-1 text-[10px] text-[#737373]">
                    University Management System
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Copyright */}
        <p className="mt-5 text-center text-[10px] text-[#737373]">
          © 2026 UniFlow. All rights reserved.
        </p>
      </div>
    </aside>
    </>
  );
}

export default Sidebar;
