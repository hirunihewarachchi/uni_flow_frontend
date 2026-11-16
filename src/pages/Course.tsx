
import { useState, useEffect } from "react";
import {
  BookOpen,
  Clock,
  GraduationCap,
  Code,
  Database,
  Brain,
  ChevronDown,
  ChevronUp,
  Laptop,
  ArrowRight,
  CheckCircle2,
  Layers,
} from "lucide-react";
import { Link } from "react-router-dom";
import { getPublicCourses } from "../services/public.service";

const programs = [
  {
    id: "HDSE",
    title: "Higher Diploma in Software Engineering",
    shortName: "HDSE",
    duration: "2 Years",
    structure: "4 Semesters",
    description:
      "Develop strong software engineering knowledge and practical skills through programming, databases, web development, software engineering, and advanced application development.",
    icon: Code,
    color: "bg-red-50 text-[#D71920]",
    modules: [
      {
        semester: "Semester 1",
        subjects: ["Programming Fundamentals (PRF)", "Database Management Systems (DBMS)"],
      },
      {
        semester: "Semester 2",
        subjects: ["Database Programming", "Object-Oriented Programming (OOP)"],
      },
      {
        semester: "Semester 3",
        subjects: ["Web Development", "Software Engineering (SE)"],
      },
      {
        semester: "Semester 4",
        subjects: ["Rapid Application Development (RAD)", "Advanced Application Development (AAD)"],
      },
    ],
  },
  {
    id: "CMJD",
    title: "Comprehensive Master in Java Development",
    shortName: "CMJD",
    duration: "6 Months",
    structure: "Module-Based Programme",
    description:
      "Build a strong foundation in Java programming, object-oriented development, database technologies, and modern application development.",
    icon: Database,
    color: "bg-blue-50 text-blue-700",
    modules: [
      {
        semester: "Course Modules",
        subjects: [
          "Programming Fundamentals (PRF)",
          "Database Management Systems (DBMS)",
          "Database Programming",
          "Object-Oriented Programming (OOP)",
          "Web Development",
          "Software Engineering (SE)",
          "Rapid Application Development (RAD)",
          "Advanced Application Development (AAD)",
        ],
      },
    ],
  },
  {
    id: "CAME",
    title: "Comprehensive Advanced Master in AI",
    shortName: "CAME",
    duration: "6 Months",
    structure: "AI Module-Based Programme",
    description:
      "Explore Artificial Intelligence, machine learning, data analysis, and modern AI technologies through practical learning and projects.",
    icon: Brain,
    color: "bg-purple-50 text-purple-700",
    modules: [
      {
        semester: "AI Course Modules",
        subjects: [
          "Python Programming for AI",
          "Mathematics and Statistics for AI",
          "Data Science and Data Analysis",
          "Machine Learning",
          "Deep Learning and Neural Networks",
          "Natural Language Processing (NLP)",
          "Computer Vision",
          "Generative AI and Large Language Models",
          "AI Model Development and Deployment",
          "AI Project Development",
        ],
      },
    ],
  },
  {
    id: "FOUNDATION",
    title: "Foundation Programme",
    shortName: "Foundation",
    duration: "6 Months",
    structure: "Module-Based Programme",
    description:
      "Build essential knowledge and practical skills in computing, programming, mathematics, communication, and problem-solving before progressing to advanced IT studies.",
    icon: Laptop,
    color: "bg-green-50 text-green-700",
    modules: [
      {
        semester: "Foundation Modules",
        subjects: [
          "Introduction to Information Technology",
          "Computer Fundamentals",
          "Introduction to Programming",
          "Basic Mathematics for Computing",
          "English Communication Skills",
          "Logical Thinking and Problem Solving",
          "Introduction to Databases",
          "Introduction to Web Technologies",
        ],
      },
    ],
  },
];

function Course() {
  const [courseList, setCourseList] = useState(programs);
  const [selectedProgram, setSelectedProgram] = useState("HDSE");
  const [expandedSections, setExpandedSections] = useState<string[]>([
    "HDSE-Semester 1",
  ]);

  useEffect(() => {
    getPublicCourses()
      .then((data: any[]) => {
        if (data && data.length > 0) {
          const merged = data.map((c) => {
            const existing = programs.find((p) => p.id === c.id);
            return {
              id: c.id,
              title: c.title || existing?.title || c.id,
              shortName: c.shortName || existing?.shortName || c.id,
              duration: c.duration || existing?.duration || "N/A",
              structure: c.structure || existing?.structure || "N/A",
              description: c.description || existing?.description || "",
              icon: existing?.icon || Code,
              color: existing?.color || "bg-red-50 text-[#D71920]",
              modules: c.modules && c.modules.length > 0 ? c.modules : existing?.modules || [],
            };
          });
          setCourseList(merged);
        }
      })
      .catch(() => {});
  }, []);

  const selectedCourse = courseList.find(
    (program) => program.id === selectedProgram
  );

  const toggleSection = (section: string) => {
    setExpandedSections((previous) =>
      previous.includes(section)
        ? previous.filter((item) => item !== section)
        : [...previous, section]
    );
  };

  return (
    <div className="space-y-10">

      {/* Page Heading */}
      <section className="relative overflow-hidden rounded-2xl bg-[#171717] px-8 py-12 text-white md:px-12">
        <div className="relative z-10 max-w-3xl">
          <span className="mb-4 inline-block rounded-full bg-[#D71920] px-4 py-1.5 text-xs font-bold uppercase tracking-wider">
            IJSE Academic Programmes
          </span>

          <h1 className="mb-4 text-3xl font-extrabold leading-tight md:text-5xl">
            Build Your Future in
            <span className="block text-[#D71920]">
              Software Engineering
            </span>
          </h1>

          <p className="max-w-2xl text-sm leading-7 text-gray-300 md:text-base">
            Discover professional IT education programmes designed to
            develop your technical knowledge, practical skills, and
            future career opportunities.
          </p>

          <Link
            to="/enrollment"
            className="mt-7 inline-flex items-center gap-2 rounded-lg bg-[#D71920] px-6 py-3 text-sm font-bold text-white transition hover:bg-red-700"
          >
            Enroll Now <ArrowRight size={17} />
          </Link>
        </div>

        <GraduationCap
          size={190}
          className="absolute -bottom-8 -right-5 text-white/5"
        />
      </section>

      {/* Overview */}
      <section className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        {[
          {
            label: "Available Programmes",
            value: "04",
            icon: GraduationCap,
          },
          {
            label: "Learning Opportunities",
            value: "Multiple",
            icon: BookOpen,
          },
          {
            label: "Practical Learning",
            value: "Career Focused",
            icon: Laptop,
          },
        ].map((item) => {
          const Icon = item.icon;

          return (
            <div
              key={item.label}
              className="rounded-xl border border-[#E5E5E5] bg-white p-6 shadow-sm"
            >
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-lg bg-red-50 text-[#D71920]">
                <Icon size={23} />
              </div>

              <p className="text-sm text-gray-500">{item.label}</p>
              <h3 className="mt-1 text-xl font-extrabold text-[#171717]">
                {item.value}
              </h3>
            </div>
          );
        })}
      </section>

      {/* Programme Selection */}
      <section>
        <div className="mb-6">
          <h2 className="text-2xl font-extrabold text-[#171717]">
            Our Programmes
          </h2>
          <p className="mt-2 text-sm text-gray-500">
            Select a programme to explore its duration, structure, and modules.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {courseList.map((program) => {
            const Icon = program.icon;
            const active = selectedProgram === program.id;

            return (
              <button
                key={program.id}
                onClick={() => setSelectedProgram(program.id)}
                className={`rounded-xl border p-5 text-left transition ${
                  active
                    ? "border-[#D71920] bg-red-50 shadow-md"
                    : "border-[#E5E5E5] bg-white hover:border-[#D71920]"
                }`}
              >
                <div
                  className={`mb-4 flex h-12 w-12 items-center justify-center rounded-xl ${program.color}`}
                >
                  <Icon size={25} />
                </div>

                <h3 className="text-lg font-extrabold text-[#171717]">
                  {program.shortName}
                </h3>

                <p className="mt-2 min-h-10 text-xs leading-5 text-gray-500">
                  {program.title}
                </p>

                <div className="mt-4 flex items-center justify-between">
                  <span className="text-xs font-bold text-[#D71920]">
                    {program.duration}
                  </span>

                  {active && (
                    <CheckCircle2 size={19} className="text-[#D71920]" />
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* Selected Programme Details */}
      {selectedCourse && (
        <section className="overflow-hidden rounded-2xl border border-[#E5E5E5] bg-white shadow-sm">

          {/* Programme Header */}
          <div className="border-b border-[#E5E5E5] p-6 md:p-8">
            <div className="flex flex-col justify-between gap-5 md:flex-row md:items-center">
              <div>
                <span className="rounded-md bg-red-50 px-3 py-1 text-xs font-bold text-[#D71920]">
                  {selectedCourse.shortName}
                </span>

                <h2 className="mt-4 text-2xl font-extrabold text-[#171717]">
                  {selectedCourse.title}
                </h2>

                <p className="mt-3 max-w-3xl text-sm leading-7 text-gray-500">
                  {selectedCourse.description}
                </p>
              </div>

              <div className="flex shrink-0 gap-3">
                <div className="rounded-lg bg-gray-50 p-4">
                  <Clock className="mb-2 text-[#D71920]" size={22} />
                  <p className="text-xs text-gray-500">Duration</p>
                  <p className="mt-1 font-bold">{selectedCourse.duration}</p>
                </div>

                <div className="rounded-lg bg-gray-50 p-4">
                  <Layers className="mb-2 text-[#D71920]" size={22} />
                  <p className="text-xs text-gray-500">Structure</p>
                  <p className="mt-1 text-sm font-bold">
                    {selectedCourse.structure}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Modules */}
          <div className="p-6 md:p-8">
            <div className="mb-6">
              <h3 className="text-xl font-extrabold text-[#171717]">
                Course Modules
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Explore the subjects included in this programme.
              </p>
            </div>

            <div className="space-y-4">
              {selectedCourse.modules.map((moduleGroup, index) => {
                const sectionId =
                  `${selectedCourse.id}-${moduleGroup.semester}`;

                const isExpanded = expandedSections.includes(sectionId);

                return (
                  <div
                    key={sectionId}
                    className="overflow-hidden rounded-xl border border-[#E5E5E5]"
                  >
                    <button
                      onClick={() => toggleSection(sectionId)}
                      className="flex w-full items-center justify-between bg-gray-50 px-5 py-4 text-left transition hover:bg-red-50"
                    >
                      <div className="flex items-center gap-3">
                        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#D71920] text-sm font-bold text-white">
                          {selectedCourse.id === "HDSE" ? index + 1 : <BookOpen size={18} />}
                        </span>

                        <div>
                          <h4 className="font-bold text-[#171717]">
                            {moduleGroup.semester}
                          </h4>
                          <p className="mt-1 text-xs text-gray-500">
                            {moduleGroup.subjects.length} Modules
                          </p>
                        </div>
                      </div>

                      {isExpanded ? (
                        <ChevronUp className="text-[#D71920]" />
                      ) : (
                        <ChevronDown className="text-gray-500" />
                      )}
                    </button>

                    {isExpanded && (
                      <div className="space-y-3 p-5">
                        {moduleGroup.subjects.map((subject, subjectIndex) => (
                          <div
                            key={subjectIndex}
                            className="flex items-center gap-3 rounded-lg border border-gray-100 p-4"
                          >
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-red-50 text-[#D71920]">
                              <BookOpen size={16} />
                            </div>

                            <span className="text-sm font-medium text-gray-700">
                              {subject}
                            </span>

                            <CheckCircle2
                              size={17}
                              className="ml-auto shrink-0 text-gray-300"
                            />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="mt-8 flex flex-col items-center justify-between gap-4 rounded-xl bg-[#171717] p-6 text-white sm:flex-row">
              <div>
                <h3 className="text-lg font-bold">
                  Interested in {selectedCourse.shortName}?
                </h3>
                <p className="mt-1 text-sm text-gray-400">
                  Start your learning journey with IJSE.
                </p>
              </div>

              <Link
                to="/enrollment"
                className="inline-flex items-center gap-2 rounded-lg bg-[#D71920] px-6 py-3 text-sm font-bold text-white transition hover:bg-red-700"
              >
                Apply Now <ArrowRight size={17} />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Bottom Information */}
      <section className="rounded-xl border border-[#E5E5E5] bg-white p-6">
        <h3 className="font-extrabold text-[#171717]">
          Choose the Right Programme for Your Future
        </h3>

        <p className="mt-2 text-sm leading-7 text-gray-500">
          Explore the available IJSE programmes and select the learning
          pathway that matches your educational goals and career interests.
          Contact the institute for official syllabus, entry requirements,
          and programme details.
        </p>
      </section>

    </div>
  );
}

export default Course;
