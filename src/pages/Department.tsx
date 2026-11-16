
import { useMemo, useState, useEffect } from "react";
import {
  Search,
  Users,
  GraduationCap,
  BriefcaseBusiness,
  BookOpen,
  Wallet,
  ClipboardList,
  UserRound,
  Mail,
  Building2,
  ArrowRight,
} from "lucide-react";
import { getPublicDepartments } from "../services/public.service";

type StaffMember = {
  name: string;
  position: string;
  email: string;
};

type Department = {
  id: string;
  name: string;
  description: string;
  icon: typeof Users;
  color: string;
  lecturers: StaffMember[];
};

const initialLeadership: StaffMember[] = [
  {
    name: "Mr. Sanjeewa Samarasinghe",
    position: "Founder of IJSE",
    email: "founder@ijse.lk",
  },
  {
    name: "Dr. Prasanna Fernando",
    position: "Chief Executive Officer",
    email: "ceo@ijse.lk",
  },
];

const departments: Department[] = [
  {
    id: "marketing",
    name: "Marketing Department",
    description:
      "Handles student inquiries, programme information, registrations, and student enrollment.",
    icon: BriefcaseBusiness,
    color: "bg-red-50 text-[#D71920]",
    lecturers: [
      {
        name: "Add Staff Name",
        position: "Marketing Officer",
        email: "Add official email",
      },
    ],
  },
  {
    id: "academic",
    name: "Academic Department",
    description:
      "Coordinates academic programmes, teaching activities, lecturers, and student learning.",
    icon: GraduationCap,
    color: "bg-blue-50 text-blue-700",
    lecturers: [
      {
        name: "Add Lecturer Name",
        position: "Academic Lecturer",
        email: "Add official email",
      },
      {
        name: "Add Lecturer Name",
        position: "Academic Lecturer",
        email: "Add official email",
      },
    ],
  },
  {
    id: "exam",
    name: "Exam Department",
    description:
      "Manages examinations, assessments, student results, and examination-related activities.",
    icon: ClipboardList,
    color: "bg-purple-50 text-purple-700",
    lecturers: [
      {
        name: "Add Staff Name",
        position: "Examination Officer",
        email: "Add official email",
      },
    ],
  },
  {
    id: "finance",
    name: "Finance Department",
    description:
      "Handles programme payments, financial records, student fee information, and related services.",
    icon: Wallet,
    color: "bg-green-50 text-green-700",
    lecturers: [
      {
        name: "Add Staff Name",
        position: "Finance Officer",
        email: "Add official email",
      },
    ],
  },
];

function StaffCard({ person }: { person: StaffMember }) {
  const initials = person.name
    .split(" ")
    .filter((word) => word.length > 0)
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();

  return (
    <div className="group rounded-xl border border-[#E5E5E5] bg-white p-5 transition hover:-translate-y-1 hover:border-[#D71920] hover:shadow-md">
      <div className="flex items-center gap-4">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[#171717] text-lg font-bold text-white">
          {initials || <UserRound size={25} />}
        </div>

        <div className="min-w-0">
          <h4 className="font-bold text-[#171717]">
            {person.name}
          </h4>

          <p className="mt-1 text-xs font-medium text-[#D71920]">
            {person.position}
          </p>
        </div>
      </div>

      <div className="mt-5 flex items-center gap-2 border-t border-gray-100 pt-4 text-xs text-gray-500">
        <Mail size={15} className="shrink-0 text-[#D71920]" />
        <span className="truncate">{person.email}</span>
      </div>
    </div>
  );
}

function Department() {
  const [deptList, setDeptList] = useState(departments);
  const [leadershipList, setLeadershipList] = useState(initialLeadership);
  const [selectedDepartment, setSelectedDepartment] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    getPublicDepartments()
      .then((data) => {
        if (data?.leadership && data.leadership.length > 0) {
          setLeadershipList(data.leadership);
        }
        if (data?.departments && data.departments.length > 0) {
          const merged = departments.map((d) => {
            const serverDept = data.departments.find((sd: any) => sd.id === d.id);
            if (serverDept && serverDept.lecturers && serverDept.lecturers.length > 0) {
              return { ...d, lecturers: serverDept.lecturers };
            }
            return d;
          });
          setDeptList(merged);
        }
      })
      .catch(() => {});
  }, []);

  const filteredDepartments = useMemo(() => {
    return deptList.filter((department) => {
      const matchesDepartment =
        selectedDepartment === "all" ||
        selectedDepartment === department.id;

      const searchContent = [
        department.name,
        department.description,
        ...department.lecturers.flatMap((person) => [
          person.name,
          person.position,
        ]),
      ]
        .join(" ")
        .toLowerCase();

      const matchesSearch = searchContent.includes(
        searchTerm.toLowerCase()
      );

      return matchesDepartment && matchesSearch;
    });
  }, [deptList, selectedDepartment, searchTerm]);

  const totalStaff = deptList.reduce(
    (total, department) => total + department.lecturers.length,
    0
  );

  return (
    <div className="space-y-10">

      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-2xl bg-[#171717] px-8 py-12 text-white md:px-12">
        <div className="relative z-10 max-w-3xl">
          <span className="inline-block rounded-full bg-[#D71920] px-4 py-1.5 text-xs font-bold uppercase tracking-wider">
            Meet Our People
          </span>

          <h1 className="mt-5 text-3xl font-extrabold leading-tight md:text-5xl">
            Departments &
            <span className="block text-[#D71920]">
              Lecturers
            </span>
          </h1>

          <p className="mt-5 max-w-2xl text-sm leading-7 text-gray-300 md:text-base">
            Discover the people behind IJSE. Meet our leadership,
            explore our departments, and learn about the teams
            supporting our students throughout their educational journey.
          </p>
        </div>

        <Users
          size={190}
          className="absolute -bottom-8 -right-5 text-white/5"
        />
      </section>

      {/* Overview Cards */}
      <section className="grid grid-cols-1 gap-5 sm:grid-cols-3">

        <div className="rounded-xl border border-[#E5E5E5] bg-white p-6 shadow-sm">
          <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-lg bg-red-50 text-[#D71920]">
            <Building2 size={23} />
          </div>

          <p className="text-sm text-gray-500">
            Departments
          </p>

          <h3 className="mt-1 text-2xl font-extrabold text-[#171717]">
            04
          </h3>
        </div>

        <div className="rounded-xl border border-[#E5E5E5] bg-white p-6 shadow-sm">
          <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-lg bg-red-50 text-[#D71920]">
            <Users size={23} />
          </div>

          <p className="text-sm text-gray-500">
            Staff Profiles
          </p>

          <h3 className="mt-1 text-2xl font-extrabold text-[#171717]">
            {totalStaff}
          </h3>
          <p className="mt-1 text-xs text-gray-400">
            Placeholder profiles currently displayed
          </p>
        </div>

        <div className="rounded-xl border border-[#E5E5E5] bg-white p-6 shadow-sm">
          <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-lg bg-red-50 text-[#D71920]">
            <GraduationCap size={23} />
          </div>

          <p className="text-sm text-gray-500">
            Leadership Profiles
          </p>

          <h3 className="mt-1 text-2xl font-extrabold text-[#171717]">
            02
          </h3>
        </div>
      </section>

      {/* Leadership */}
      <section>
        <div className="mb-6">
          <span className="text-xs font-bold uppercase tracking-wider text-[#D71920]">
            Our Leadership
          </span>

          <h2 className="mt-2 text-2xl font-extrabold text-[#171717]">
            Meet Our Leadership
          </h2>

          <p className="mt-2 text-sm text-gray-500">
            The leadership team guiding IJSE towards excellence in IT education.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          {leadershipList.map((person, index) => (
            <div
              key={person.position}
              className="flex flex-col gap-5 rounded-xl border border-[#E5E5E5] bg-white p-6 shadow-sm transition hover:border-[#D71920] sm:flex-row sm:items-center"
            >
              <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-[#171717] text-2xl font-extrabold text-white">
                {index === 0 ? "F" : "CEO"}
              </div>

              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#D71920]">
                  {person.position}
                </span>

                <h3 className="mt-2 text-xl font-extrabold text-[#171717]">
                  {person.name}
                </h3>

                <p className="mt-2 text-sm text-gray-500">
                  {person.email}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Department Directory */}
      <section>
        <div className="mb-6">
          <span className="text-xs font-bold uppercase tracking-wider text-[#D71920]">
            Explore IJSE
          </span>

          <h2 className="mt-2 text-2xl font-extrabold text-[#171717]">
            Our Departments
          </h2>

          <p className="mt-2 text-sm text-gray-500">
            Explore the different teams and their responsibilities.
          </p>
        </div>

        {/* Search */}
        <div className="mb-5 flex items-center gap-3 rounded-xl border border-[#E5E5E5] bg-white px-4 py-3">
          <Search size={19} className="text-gray-400" />

          <input
            type="text"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Search departments or staff..."
            className="w-full bg-transparent text-sm outline-none placeholder:text-gray-400"
          />
        </div>

        {/* Department Filters */}
        <div className="mb-7 flex flex-wrap gap-2">
          {[
            { id: "all", label: "All Departments" },
            { id: "marketing", label: "Marketing" },
            { id: "academic", label: "Academic" },
            { id: "exam", label: "Exam" },
            { id: "finance", label: "Finance" },
          ].map((filter) => (
            <button
              key={filter.id}
              onClick={() => setSelectedDepartment(filter.id)}
              className={`rounded-lg px-4 py-2.5 text-xs font-bold transition ${
                selectedDepartment === filter.id
                  ? "bg-[#D71920] text-white"
                  : "border border-[#E5E5E5] bg-white text-gray-600 hover:border-[#D71920] hover:text-[#D71920]"
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>

        {/* Department Cards */}
        <div className="space-y-6">
          {filteredDepartments.map((department) => {
            const Icon = department.icon;

            return (
              <div
                key={department.id}
                className="overflow-hidden rounded-2xl border border-[#E5E5E5] bg-white shadow-sm"
              >
                {/* Department Heading */}
                <div className="flex flex-col justify-between gap-4 border-b border-[#E5E5E5] p-6 sm:flex-row sm:items-center">
                  <div className="flex items-center gap-4">
                    <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-xl ${department.color}`}>
                      <Icon size={27} />
                    </div>

                    <div>
                      <h3 className="text-lg font-extrabold text-[#171717]">
                        {department.name}
                      </h3>

                      <p className="mt-1 text-xs text-gray-500">
                        {department.lecturers.length} staff profiles
                      </p>
                    </div>
                  </div>

                  <span className="w-fit rounded-full bg-gray-100 px-4 py-2 text-xs font-bold text-gray-600">
                    {department.id.toUpperCase()}
                  </span>
                </div>

                {/* Description */}
                <div className="px-6 pt-5">
                  <p className="max-w-3xl text-sm leading-7 text-gray-500">
                    {department.description}
                  </p>
                </div>

                {/* Staff */}
                <div className="p-6">
                  <div className="mb-4 flex items-center gap-2">
                    <BookOpen size={17} className="text-[#D71920]" />

                    <h4 className="text-sm font-bold text-[#171717]">
                      Department Staff
                    </h4>
                  </div>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    {department.lecturers.map((person, index) => (
                      <StaffCard
                        key={`${department.id}-${index}`}
                        person={person}
                      />
                    ))}
                  </div>
                </div>
              </div>
            );
          })}

          {filteredDepartments.length === 0 && (
            <div className="rounded-xl border border-dashed border-gray-300 bg-white p-12 text-center">
              <Search size={35} className="mx-auto text-gray-300" />

              <h3 className="mt-4 font-bold text-[#171717]">
                No departments found
              </h3>

              <p className="mt-2 text-sm text-gray-500">
                Try another search term or select a different department.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="flex flex-col items-center justify-between gap-5 rounded-2xl bg-[#171717] p-8 text-center text-white md:flex-row md:text-left">
        <div>
          <h3 className="text-xl font-extrabold">
            Want to become part of IJSE?
          </h3>

          <p className="mt-2 text-sm text-gray-400">
            Explore our programmes and take the next step in your IT career.
          </p>
        </div>

        <a
          href="/enrollment"
          className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-[#D71920] px-6 py-3 text-sm font-bold text-white transition hover:bg-red-700"
        >
          Apply Now <ArrowRight size={17} />
        </a>
      </section>

    </div>
  );
}

export default Department;
