
import { useMemo, useState, useEffect } from "react";
import {
  BrainCircuit,
  Target,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  BookOpen,
  ClipboardList,
  Clock,
  Lightbulb,
  GraduationCap,
  Sparkles,
  PlayCircle,
  RefreshCw,
} from "lucide-react";
import { getSkillGapAnalysis, toggleAssignment } from "../services/ai.service";

type ModuleResult = {
  module: string;
  mark: number;
};

type Assignment = {
  title: string;
  description: string;
  difficulty: string;
  duration: string;
};

type Student = {
  id: string;
  name: string;
  batch: string;
  results: ModuleResult[];
};

const demoStudents: Student[] = [
  {
    id: "STU001",
    name: "Kamal",
    batch: "HDSE 75",
    results: [
      { module: "PRF", mark: 90 },
      { module: "OOP", mark: 75 },
      { module: "DBMS", mark: 40 },
    ],
  },
  {
    id: "STU002",
    name: "Hiruni",
    batch: "HDSE 75",
    results: [
      { module: "PRF", mark: 50 },
      { module: "OOP", mark: 40 },
      { module: "DBMS", mark: 32 },
    ],
  },
];

const assignments: Record<string, Assignment[]> = {
  PRF: [
    {
      title: "Programming Fundamentals Practice",
      description:
        "Solve beginner programming problems using variables, conditions, loops and methods.",
      difficulty: "Beginner",
      duration: "45 minutes",
    },
    {
      title: "Array and Method Exercises",
      description:
        "Complete programming exercises using arrays, methods and basic problem solving.",
      difficulty: "Intermediate",
      duration: "60 minutes",
    },
  ],
  OOP: [
    {
      title: "OOP Concepts Assignment",
      description:
        "Create a small Java application demonstrating classes, objects, constructors and encapsulation.",
      difficulty: "Beginner",
      duration: "60 minutes",
    },
    {
      title: "Inheritance and Polymorphism",
      description:
        "Build a simple application using inheritance, method overriding and polymorphism.",
      difficulty: "Intermediate",
      duration: "90 minutes",
    },
  ],
  DBMS: [
    {
      title: "SQL Fundamentals",
      description:
        "Practice SELECT, INSERT, UPDATE, DELETE, WHERE and ORDER BY queries.",
      difficulty: "Beginner",
      duration: "45 minutes",
    },
    {
      title: "Database Relationships",
      description:
        "Design student and course tables with primary keys, foreign keys and relationships.",
      difficulty: "Intermediate",
      duration: "60 minutes",
    },
    {
      title: "JOIN and Aggregate Queries",
      description:
        "Solve SQL problems using INNER JOIN, LEFT JOIN, GROUP BY and aggregate functions.",
      difficulty: "Advanced",
      duration: "90 minutes",
    },
  ],
};

function getLevel(mark: number) {
  if (mark >= 75) return "Strong";
  if (mark >= 50) return "Moderate";
  return "Needs Improvement";
}

function getColor(mark: number) {
  if (mark >= 75) return "bg-green-500";
  if (mark >= 50) return "bg-amber-500";
  return "bg-[#D71920]";
}

function SkillGaps() {
  const [selectedStudentId, setSelectedStudentId] = useState("STU002");
  const [completedAssignments, setCompletedAssignments] = useState<string[]>([]);
  const [liveGaps, setLiveGaps] = useState<any[]>([]);

  useEffect(() => {
    getSkillGapAnalysis()
      .then((data) => {
        if (data && data.length > 0) {
          setLiveGaps(data);
          const completed = data.flatMap((g: any) =>
            (g.assignedExercises || [])
              .filter((ex: any) => ex.isCompleted)
              .map((ex: any) => `${g.moduleCode}-${ex.title}`)
          );
          setCompletedAssignments(completed);
        }
      })
      .catch(() => {});
  }, []);

  const student = demoStudents.find(
    (item) => item.id === selectedStudentId
  )!;

  const weakModules = useMemo(
    () =>
      student.results
        .filter((item) => item.mark < 75)
        .sort((a, b) => a.mark - b.mark),
    [student]
  );

  const average = Math.round(
    student.results.reduce((sum, item) => sum + item.mark, 0) /
      student.results.length
  );

  const strongCount = student.results.filter(
    (item) => item.mark >= 75
  ).length;

  const handleStudentChange = (id: string) => {
    setSelectedStudentId(id);
    setCompletedAssignments([]);
  };

  const handleComplete = (assignmentId: string, moduleCode?: string, title?: string) => {
    const isNowCompleted = !completedAssignments.includes(assignmentId);
    setCompletedAssignments((previous) =>
      previous.includes(assignmentId)
        ? previous.filter((item) => item !== assignmentId)
        : [...previous, assignmentId]
    );

    if (liveGaps.length > 0 && moduleCode && title) {
      const gap = liveGaps.find((g) => g.moduleCode === moduleCode);
      if (gap) {
        toggleAssignment({
          skillId: gap._id,
          assignmentTitle: title,
          isCompleted: isNowCompleted,
        }).catch(() => {});
      }
    }
  };

  return (
    <div className="mx-auto max-w-7xl space-y-8">

      {/* Header */}
      <div className="flex flex-col justify-between gap-5 md:flex-row md:items-center">
        <div>
          <div className="mb-2 flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-[#D71920]">
            <BrainCircuit size={18} />
            AI Learning Assistant
          </div>

          <h1 className="text-3xl font-bold text-[#171717]">
            Skill Gap Analysis
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-[#737373]">
            Analyze your examination performance, discover knowledge gaps
            and follow an AI-generated learning roadmap to improve your skills.
          </p>
        </div>

        <div className="flex items-center gap-3 rounded-xl border border-[#E5E5E5] bg-white p-3">
          <div className="rounded-lg bg-red-50 p-2 text-[#D71920]">
            <GraduationCap size={22} />
          </div>

          <div>
            <p className="text-xs text-[#737373]">Student Profile</p>
            <p className="text-sm font-bold text-[#171717]">
              {student.batch}
            </p>
          </div>
        </div>
      </div>

      {/* Demo Student Selector */}
      <div className="flex flex-col gap-3 rounded-xl border border-[#E5E5E5] bg-white p-5 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm font-bold text-[#171717]">
            Student Performance Preview
          </p>
          <p className="mt-1 text-xs text-[#737373]">
            Switch profiles to see how individual learning roadmaps change.
          </p>
        </div>

        <select
          value={selectedStudentId}
          onChange={(e) => handleStudentChange(e.target.value)}
          className="rounded-lg border border-[#E5E5E5] bg-white px-4 py-3 text-sm font-medium outline-none focus:border-[#D71920]"
        >
          {demoStudents.map((item) => (
            <option key={item.id} value={item.id}>
              {item.name} - {item.id}
            </option>
          ))}
        </select>
      </div>

      {/* Student Overview */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-4">

        <div className="rounded-xl border border-[#E5E5E5] bg-white p-5">
          <p className="text-xs font-medium text-[#737373]">
            Student Name
          </p>
          <h2 className="mt-3 text-xl font-bold text-[#171717]">
            {student.name}
          </h2>
          <p className="mt-1 text-xs text-[#737373]">
            {student.id}
          </p>
        </div>

        <div className="rounded-xl border border-[#E5E5E5] bg-white p-5">
          <p className="text-xs font-medium text-[#737373]">
            Average Marks
          </p>
          <div className="mt-2 flex items-end gap-1">
            <h2 className="text-3xl font-bold text-[#171717]">
              {average}
            </h2>
            <span className="mb-1 text-sm text-[#737373]">/ 100</span>
          </div>
          <p className="mt-1 text-xs text-[#737373]">
            Across {student.results.length} modules
          </p>
        </div>

        <div className="rounded-xl border border-[#E5E5E5] bg-white p-5">
          <p className="text-xs font-medium text-[#737373]">
            Strong Modules
          </p>
          <h2 className="mt-2 text-3xl font-bold text-green-600">
            {strongCount}
          </h2>
          <p className="mt-1 text-xs text-[#737373]">
            Marks of 75 or above
          </p>
        </div>

        <div className="rounded-xl border border-[#E5E5E5] bg-white p-5">
          <p className="text-xs font-medium text-[#737373]">
            Improvement Areas
          </p>
          <h2 className="mt-2 text-3xl font-bold text-[#D71920]">
            {weakModules.length}
          </h2>
          <p className="mt-1 text-xs text-[#737373]">
            Modules below 75
          </p>
        </div>

      </div>

      {/* Performance Analysis */}
      <section className="rounded-xl border border-[#E5E5E5] bg-white p-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-[#171717]">
              Examination Performance
            </h2>
            <p className="mt-1 text-sm text-[#737373]">
              Individual module results and skill levels
            </p>
          </div>
          <TrendingUp className="text-[#D71920]" size={24} />
        </div>

        <div className="space-y-6">
          {student.results.map((result) => (
            <div key={result.module}>
              <div className="mb-2 flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-[#171717]">
                    {result.module}
                  </p>
                  <p className="mt-1 text-xs text-[#737373]">
                    {getLevel(result.mark)}
                  </p>
                </div>

                <span className="text-lg font-bold text-[#171717]">
                  {result.mark}%
                </span>
              </div>

              <div className="h-3 overflow-hidden rounded-full bg-[#EEEEEE]">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${getColor(result.mark)}`}
                  style={{ width: `${result.mark}%` }}
                />
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 flex flex-wrap gap-4 border-t border-[#EEEEEE] pt-5">
          <span className="flex items-center gap-2 text-xs text-[#737373]">
            <span className="h-2.5 w-2.5 rounded-full bg-green-500" />
            Strong: 75-100
          </span>
          <span className="flex items-center gap-2 text-xs text-[#737373]">
            <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
            Moderate: 50-74
          </span>
          <span className="flex items-center gap-2 text-xs text-[#737373]">
            <span className="h-2.5 w-2.5 rounded-full bg-[#D71920]" />
            Needs Improvement: 0-49
          </span>
        </div>
      </section>

      {/* AI Analysis */}
      <section className="overflow-hidden rounded-xl bg-[#171717] text-white">
        <div className="flex flex-col gap-5 p-6 md:flex-row md:items-start">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#D71920]">
            <Sparkles size={25} />
          </div>

          <div className="flex-1">
            <p className="text-xs font-bold uppercase tracking-widest text-red-300">
              AI Performance Analysis
            </p>

            <h2 className="mt-2 text-xl font-bold">
              Personalized Analysis for {student.name}
            </h2>

            {weakModules.length === 0 ? (
              <p className="mt-3 text-sm leading-6 text-gray-300">
                Excellent performance! Your current marks meet the strong
                performance target in all displayed modules. Continue
                practising to maintain your knowledge.
              </p>
            ) : (
              <p className="mt-3 text-sm leading-6 text-gray-300">
                {student.name}, your results show that{" "}
                {weakModules.map((item) => item.module).join(", ")}{" "}
                {weakModules.length === 1 ? "needs" : "need"} more attention.
                {weakModules[0].module} is currently your highest-priority
                improvement area with {weakModules[0].mark} marks.
                Follow the learning activities below to strengthen your
                understanding.
              </p>
            )}

            <div className="mt-5 flex flex-wrap gap-3">
              <div className="rounded-lg bg-white/10 px-4 py-2 text-xs">
                <span className="text-gray-400">Priority modules: </span>
                <strong>{weakModules.length}</strong>
              </div>

              <div className="rounded-lg bg-white/10 px-4 py-2 text-xs">
                <span className="text-gray-400">Learning plan: </span>
                <strong>Personalized</strong>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Learning Roadmap */}
      <section>
        <div className="mb-5">
          <div className="flex items-center gap-2">
            <Target className="text-[#D71920]" size={23} />
            <h2 className="text-xl font-bold text-[#171717]">
              Your Personalized Learning Roadmap
            </h2>
          </div>
          <p className="mt-2 text-sm text-[#737373]">
            Follow these steps to improve your weakest modules first.
          </p>
        </div>

        {weakModules.length === 0 ? (
          <div className="rounded-xl border border-green-200 bg-green-50 p-6 text-sm text-green-800">
            You have no priority modules based on the current target.
            Continue revising and practising.
          </div>
        ) : (
          <div className="space-y-5">
            {weakModules.map((result, index) => {
              const tasks = assignments[result.module] || [];

              return (
                <div
                  key={result.module}
                  className="overflow-hidden rounded-xl border border-[#E5E5E5] bg-white"
                >
                  <div className="flex flex-col gap-4 border-b border-[#EEEEEE] p-5 md:flex-row md:items-center md:justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-red-50 font-bold text-[#D71920]">
                        {index + 1}
                      </div>

                      <div>
                        <h3 className="font-bold text-[#171717]">
                          {result.module} Improvement Plan
                        </h3>
                        <p className="mt-1 text-xs text-[#737373]">
                          Current examination mark: {result.mark}/100
                        </p>
                      </div>
                    </div>

                    <span className="w-fit rounded-full bg-red-50 px-3 py-1.5 text-xs font-bold text-[#D71920]">
                      {result.mark < 50
                        ? "High Priority"
                        : "Improvement Needed"}
                    </span>
                  </div>

                  <div className="space-y-5 p-5">

                    <div className="flex gap-3">
                      <Lightbulb
                        size={20}
                        className="shrink-0 text-amber-500"
                      />
                      <div>
                        <p className="text-sm font-bold text-[#171717]">
                          Recommended Focus
                        </p>
                        <p className="mt-1 text-sm leading-6 text-[#737373]">
                          {result.module === "DBMS"
                            ? "Strengthen SQL queries, database design, keys, relationships and JOIN operations."
                            : result.module === "OOP"
                              ? "Revise classes, objects, constructors, encapsulation, inheritance and polymorphism."
                              : "Practise programming logic, variables, conditions, loops, arrays and methods."}
                        </p>
                      </div>
                    </div>

                    <div>
                      <div className="mb-3 flex items-center gap-2">
                        <ClipboardList
                          size={19}
                          className="text-[#D71920]"
                        />
                        <h4 className="text-sm font-bold text-[#171717]">
                          Recommended Assignments
                        </h4>
                      </div>

                      <div className="space-y-3">
                        {tasks.map((task, taskIndex) => {
                          const taskId =
                            `${student.id}-${result.module}-${taskIndex}`;

                          const completed =
                            completedAssignments.includes(taskId);

                          return (
                            <div
                              key={taskId}
                              className="rounded-lg border border-[#EEEEEE] p-4"
                            >
                              <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                                <div className="flex gap-3">
                                  <div className="mt-1 text-[#D71920]">
                                    <BookOpen size={19} />
                                  </div>

                                  <div>
                                    <p className="text-sm font-bold text-[#171717]">
                                      {task.title}
                                    </p>
                                    <p className="mt-1 text-xs leading-5 text-[#737373]">
                                      {task.description}
                                    </p>

                                    <div className="mt-3 flex flex-wrap gap-3 text-xs text-[#737373]">
                                      <span>{task.difficulty}</span>
                                      <span className="flex items-center gap-1">
                                        <Clock size={13} />
                                        {task.duration}
                                      </span>
                                    </div>
                                  </div>
                                </div>

                                <button
                                  type="button"
                                  onClick={() => handleComplete(taskId, result.module, task.title)}
                                  className={`flex shrink-0 items-center justify-center gap-2 rounded-lg px-3 py-2 text-xs font-bold transition ${
                                    completed
                                      ? "bg-green-50 text-green-700"
                                      : "bg-[#D71920] text-white hover:bg-[#B9151B]"
                                  }`}
                                >
                                  {completed ? (
                                    <>
                                      <CheckCircle2 size={15} />
                                      Completed
                                    </>
                                  ) : (
                                    <>
                                      <PlayCircle size={15} />
                                      Mark Complete
                                    </>
                                  )}
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Progress */}
      <section className="rounded-xl border border-[#E5E5E5] bg-white p-6">
        <div className="flex items-center gap-2">
          <TrendingUp size={21} className="text-[#D71920]" />
          <h2 className="text-lg font-bold text-[#171717]">
            Assignment Progress
          </h2>
        </div>

        <p className="mt-2 text-sm text-[#737373]">
          Track your completed learning activities in this demonstration.
        </p>

        <div className="mt-5">
          <div className="mb-2 flex justify-between text-sm">
            <span className="font-medium text-[#525252]">
              Completed assignments
            </span>
            <span className="font-bold text-[#171717]">
              {completedAssignments.length}/
              {weakModules.reduce(
                (total, result) =>
                  total + (assignments[result.module]?.length || 0),
                0
              )}
            </span>
          </div>

          <div className="h-3 overflow-hidden rounded-full bg-[#EEEEEE]">
            <div
              className="h-full rounded-full bg-green-500 transition-all duration-500"
              style={{
                width: `${
                  weakModules.reduce(
                    (total, result) =>
                      total + (assignments[result.module]?.length || 0),
                    0
                  ) === 0
                    ? 0
                    : (completedAssignments.length /
                        weakModules.reduce(
                          (total, result) =>
                            total + (assignments[result.module]?.length || 0),
                          0
                        )) *
                      100
                }%`,
              }}
            />
          </div>
        </div>

        <button
          type="button"
          onClick={() => setCompletedAssignments([])}
          className="mt-5 flex items-center gap-2 text-xs font-semibold text-[#737373] transition hover:text-[#D71920]"
        >
          <RefreshCw size={14} />
          Reset demonstration progress
        </button>
      </section>

      {/* Footer Note */}
      <div className="flex gap-3 rounded-xl border border-blue-100 bg-blue-50 p-4">
        <AlertTriangle
          size={19}
          className="shrink-0 text-blue-600"
        />
        <p className="text-xs leading-5 text-blue-800">
          This is a frontend demonstration using sample examination marks
          and predefined assignments. Real student results, AI-generated
          recommendations and saved progress will be connected to the
          backend later.
        </p>
      </div>

    </div>
  );
}

export default SkillGaps;
