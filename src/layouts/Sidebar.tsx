
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  Building2,
  BookOpen,
  CalendarDays,
  Layers,
  ClipboardList,
  Wallet,
  Settings,
} from "lucide-react";

const menuItems = [
  {
    title: "Dashboard",
    path: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Students",
    path: "/students",
    icon: Users,
  },
  {
    title: "Lecturers",
    path: "/lecturers",
    icon: GraduationCap,
  },
  {
    title: "Faculties",
    path: "/faculties",
    icon: Building2,
  },
  {
    title: "Programs",
    path: "/programs",
    icon: BookOpen,
  },
  {
    title: "Semesters",
    path: "/semesters",
    icon: CalendarDays,
  },
  {
    title: "Modules",
    path: "/modules",
    icon: Layers,
  },
  {
    title: "Enrollments",
    path: "/enrollments",
    icon: ClipboardList,
  },
  {
    title: "Finance",
    path: "/finance",
    icon: Wallet,
  },
];

function Sidebar() {
  return (
    <aside className="fixed left-0 top-0 z-40 flex h-screen w-64 flex-col bg-dark text-white">

      {/* Institute Branding */}
      <div className="border-b border-white/10 px-6 py-6">
        <h1 className="text-3xl font-extrabold tracking-wide">
          IJSE<span className="text-primary">.</span>
        </h1>

        <p className="mt-2 text-xs leading-relaxed text-gray-400">
          Sri Lanka's No. 1 Software Engineering Institute
        </p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-2 overflow-y-auto px-4 py-6">

        <p className="mb-4 px-3 text-xs font-semibold uppercase tracking-widest text-gray-500">
          Main Menu
        </p>

        {menuItems.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-all ${
                  isActive
                    ? "bg-primary text-white shadow-lg shadow-red-900/20"
                    : "text-gray-400 hover:bg-white/10 hover:text-white"
                }`
              }
            >
              <Icon size={19} />
              <span>{item.title}</span>
            </NavLink>
          );
        })}

      </nav>

      {/* Settings */}
      <div className="border-t border-white/10 p-4">
        <NavLink
          to="/settings"
          className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm text-gray-400 hover:bg-white/10 hover:text-white"
        >
          <Settings size={19} />
          Settings
        </NavLink>
      </div>

      {/* Footer */}
      <div className="px-6 pb-5 text-xs text-gray-500">
        IJSE Management System
        <br />
        © 2026 IJSE
      </div>

    </aside>
  );
}

export default Sidebar;
