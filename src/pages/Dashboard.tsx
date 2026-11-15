
import {
  Users,
  GraduationCap,
  BookOpen,
  Layers,
  ArrowUpRight,
  Clock,
} from "lucide-react";

const statistics = [
  {
    title: "Total Students",
    value: "1,250",
    description: "Registered students",
    icon: Users,
  },
  {
    title: "Total Lecturers",
    value: "48",
    description: "Academic staff",
    icon: GraduationCap,
  },
  {
    title: "Programs",
    value: "12",
    description: "Available programs",
    icon: BookOpen,
  },
  {
    title: "Modules",
    value: "36",
    description: "Academic modules",
    icon: Layers,
  },
];

function Dashboard() {
  return (
    <div className="space-y-8">

      {/* Page Heading */}
      <div className="border-l-4 border-[#D71920] pl-4">
        <h1 className="text-3xl font-extrabold tracking-tight text-[#171717]">
          Dashboard
        </h1>

        <p className="mt-2 text-sm text-[#737373]">
          Welcome to IJSE Management System.
          Here's an overview of your institute.
        </p>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">

        {statistics.map((item) => {
          const Icon = item.icon;

          return (
            <div
              key={item.title}
              className="group rounded-xl border border-[#E5E5E5] bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-[#D71920] hover:shadow-lg"
            >
              <div className="flex items-center justify-between">

                <div className="rounded-xl bg-[#D71920]/10 p-3 transition-colors group-hover:bg-[#D71920]">
                  <Icon
                    size={24}
                    className="text-[#D71920] transition-colors group-hover:text-white"
                  />
                </div>

                <ArrowUpRight
                  size={20}
                  className="text-[#A3A3A3] transition-colors group-hover:text-[#D71920]"
                />

              </div>

              <h2 className="mt-6 text-3xl font-extrabold text-[#171717]">
                {item.value}
              </h2>

              <p className="mt-2 font-bold text-[#262626]">
                {item.title}
              </p>

              <p className="mt-1 text-xs text-[#737373]">
                {item.description}
              </p>

              <div className="mt-5 h-1 w-10 rounded-full bg-[#D71920] transition-all group-hover:w-full" />
            </div>
          );
        })}

      </div>

      {/* Recent Activities and Institute Information */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">

        {/* Recent Activities */}
        <div className="rounded-xl border border-[#E5E5E5] bg-white p-6 shadow-sm xl:col-span-2">

          <div className="flex items-center justify-between border-b border-[#E5E5E5] pb-4">

            <div>
              <h2 className="text-lg font-extrabold text-[#171717]">
                Recent Activities
              </h2>

              <p className="mt-1 text-xs text-[#737373]">
                Latest institute updates
              </p>
            </div>

            <button className="text-sm font-bold text-[#D71920] transition hover:text-[#B5121B]">
              View All
            </button>

          </div>

          <div className="mt-6 space-y-6">

            {[
              {
                title: "Student Management",
                detail: "Student registration module is ready.",
                time: "Recently updated",
              },
              {
                title: "Academic Management",
                detail: "Academic module setup is in progress.",
                time: "Development",
              },
              {
                title: "System Development",
                detail: "IJSE frontend development started.",
                time: "In progress",
              },
            ].map((activity) => (

              <div
                key={activity.title}
                className="flex items-start gap-4 border-b border-[#F0F0F0] pb-5 last:border-0 last:pb-0"
              >

                <div className="rounded-full bg-[#D71920]/10 p-3">
                  <Clock
                    size={19}
                    className="text-[#D71920]"
                  />
                </div>

                <div className="flex-1">

                  <h3 className="text-sm font-bold text-[#171717]">
                    {activity.title}
                  </h3>

                  <p className="mt-1 text-sm text-[#737373]">
                    {activity.detail}
                  </p>

                  <p className="mt-2 text-xs font-medium text-[#A3A3A3]">
                    {activity.time}
                  </p>

                </div>

              </div>
            ))}

          </div>
        </div>

        {/* Institute Information */}
        <div className="relative overflow-hidden rounded-xl bg-[#171717] p-7 text-white shadow-lg">

          {/* Red Decorative Accent */}
          <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full border-[25px] border-[#D71920]/20" />

          <div className="relative flex h-full flex-col justify-between gap-8">

            <div>

              <p className="text-xs font-bold tracking-[0.2em] text-[#A3A3A3]">
                INSTITUTE
              </p>

              <h2 className="mt-4 text-4xl font-black tracking-wide">
                IJSE<span className="text-[#D71920]">.</span>
              </h2>

              <div className="mt-4 h-1 w-14 rounded-full bg-[#D71920]" />

              <p className="mt-4 text-sm leading-relaxed text-[#D4D4D4]">
                Sri Lanka's No. 1 Software Engineering Institute
              </p>

            </div>

            <div className="border-t border-white/10 pt-5">

              <p className="text-xs font-medium text-[#A3A3A3]">
                MANAGEMENT SYSTEM
              </p>

              <p className="mt-2 text-lg font-bold text-white">
                Academic Year 2026
              </p>

              <p className="mt-2 text-xs text-[#737373]">
                Empowering Future Software Engineers
              </p>

            </div>

          </div>
        </div>

      </div>

    </div>
  );
}

export default Dashboard;
