import { useMemo, useState, useEffect } from "react";
import {
  BrainCircuit,
  AlertTriangle,
  CheckCircle2,
  BookOpen,
  GraduationCap,
  Sparkles,
  RefreshCw,
  Award,
} from "lucide-react";
import { getSkillGapAnalysis } from "../services/ai.service";
import { getMyResults } from "../services/exam.service";
import { useAuth } from "../hooks/UseAuth";

type ModuleResult = {
  module: string;
  mark: number;
};

type Assignment = {
  id?: string;
  title: string;
  description: string;
  difficulty: string;
  duration: string;
  completed?: boolean;
};

const defaultModuleAssignments: Record<string, Assignment[]> = {
  PRF: [
    {
      title: "Programming Fundamentals Practice",
      description: "Solve beginner programming problems using variables, conditions, loops, and methods.",
      difficulty: "Beginner",
      duration: "45 minutes",
    },
    {
      title: "Array and Method Exercises",
      description: "Complete programming exercises using single and multidimensional arrays and reusable methods.",
      difficulty: "Intermediate",
      duration: "60 minutes",
    },
  ],
  OOP: [
    {
      title: "OOP Concepts Assignment",
      description: "Create a small application demonstrating classes, objects, constructors, and encapsulation.",
      difficulty: "Beginner",
      duration: "60 minutes",
    },
    {
      title: "Inheritance and Polymorphism",
      description: "Build an application using inheritance, abstract classes, interfaces, and polymorphism.",
      difficulty: "Intermediate",
      duration: "90 minutes",
    },
  ],
  DBMS: [
    {
      title: "SQL Fundamentals",
      description: "Practice SELECT, INSERT, UPDATE, DELETE, WHERE, and ORDER BY queries.",
      difficulty: "Beginner",
      duration: "45 minutes",
    },
    {
      title: "Database Relationships & Keys",
      description: "Design relational tables with primary keys, foreign keys, and normalized schemas.",
      difficulty: "Intermediate",
      duration: "60 minutes",
    },
    {
      title: "JOIN and Aggregate Queries",
      description: "Solve reporting queries using INNER JOIN, LEFT JOIN, GROUP BY, and aggregate functions.",
      difficulty: "Advanced",
      duration: "90 minutes",
    },
  ],
  WEB: [
    {
      title: "Responsive Web Layouts",
      description: "Build responsive layouts using modern HTML5, CSS Grid, and Flexbox.",
      difficulty: "Beginner",
      duration: "45 minutes",
    },
    {
      title: "REST API Integration",
      description: "Build an interactive frontend that connects to backend APIs using async/await and fetch.",
      difficulty: "Intermediate",
      duration: "60 minutes",
    },
  ],
  SE: [
    {
      title: "Software Requirements Specification",
      description: "Write functional and non-functional requirements with UML use case diagrams.",
      difficulty: "Beginner",
      duration: "60 minutes",
    },
    {
      title: "Layered Architecture Design",
      description: "Implement a 3-tier layered architecture application following SOLID design principles.",
      difficulty: "Intermediate",
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
  const { user } = useAuth();
  const [completedAssignments, setCompletedAssignments] = useState<string[]>([]);
  const [moduleResults, setModuleResults] = useState<ModuleResult[]>([]);
  const [aiSummary, setAiSummary] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    const loadData = async () => {
      try {
        const [gapRes, resultsRes] = await Promise.allSettled([
          getSkillGapAnalysis(),
          getMyResults(),
        ]);

        let resultsList: ModuleResult[] = [];

        // 1. Process AI backend response
        if (gapRes.status === "fulfilled" && gapRes.value) {
          const gapData = gapRes.value;
          if (gapData.hasSufficientData && gapData.record) {
            setAiSummary(gapData.record.analysisSummary || "");
            if (Array.isArray(gapData.record.modules)) {
              resultsList = gapData.record.modules.map((m: any) => ({
                module: m.module,
                mark: m.mark,
              }));
            }
          }
        }

        // 2. If AI response has no modules yet, fallback to real exam results
        if (resultsList.length === 0 && resultsRes.status === "fulfilled" && Array.isArray(resultsRes.value)) {
          resultsList = resultsRes.value.map((r: any) => ({
            module: r.moduleCode || r.subject || "Module",
            mark: Number(r.marks ?? r.score ?? 0),
          }));
        }

        if (isMounted) {
          setModuleResults(resultsList);
        }
      } catch {
        // ignore
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, [user]);

  const weakModules = useMemo(
    () =>
      moduleResults
        .filter((item) => item.mark < 75)
        .sort((a, b) => a.mark - b.mark),
    [moduleResults]
  );

  const average = useMemo(
    () =>
      moduleResults.length > 0
        ? Math.round(moduleResults.reduce((sum, item) => sum + item.mark, 0) / moduleResults.length)
        : 0,
    [moduleResults]
  );

  const strongCount = useMemo(
    () => moduleResults.filter((item) => item.mark >= 75).length,
    [moduleResults]
  );

  const handleComplete = (assignmentKey: string) => {
    setCompletedAssignments((previous) =>
      previous.includes(assignmentKey)
        ? previous.filter((item) => item !== assignmentKey)
        : [...previous, assignmentKey]
    );
  };

  const studentName = user ? `${user.firstName} ${user.lastName}`.trim() : "Student";
  const studentId = user?.studentId || "Student";
  const studentBatch = user?.batchNumber || "Assigned Batch";

  return (
    <div className="mx-auto max-w-7xl space-y-8 p-4 md:p-8">
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
            Personalized learning insights and exercise recommendations generated from your
            official examination results recorded by the Examination Officer.
          </p>
        </div>

        <div className="flex items-center gap-3 rounded-xl border border-[#E5E5E5] bg-white p-4 shadow-sm">
          <div className="rounded-lg bg-red-50 p-2.5 text-[#D71920]">
            <GraduationCap size={24} />
          </div>

          <div>
            <p className="text-xs font-semibold text-[#737373]">Your Student Profile</p>
            <p className="text-sm font-bold text-[#171717]">
              {studentName} ({studentId})
            </p>
            <p className="text-xs text-red-600 font-semibold">
              Batch: {studentBatch}
            </p>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="rounded-2xl border border-gray-200 bg-white p-16 text-center shadow-sm">
          <RefreshCw className="mx-auto mb-3 animate-spin text-red-600" size={32} />
          <p className="text-base font-bold text-gray-800">
            Analyzing Examination Records...
          </p>
          <p className="mt-1 text-sm text-gray-500">
            Connecting to Examination Department records to compute your skill profile.
          </p>
        </div>
      ) : moduleResults.length === 0 ? (
        <div className="rounded-2xl border border-gray-200 bg-white p-12 text-center shadow-sm">
          <Award className="mx-auto mb-3 text-gray-300" size={48} />
          <h2 className="text-xl font-bold text-gray-800">
            No Examination Results Available Yet
          </h2>
          <p className="mt-2 text-sm text-gray-500 max-w-lg mx-auto">
            Your AI Skill Gap Analysis is computed directly from your real examination marks.
            Once the Examination Officer records and publishes marks for your batch ({studentBatch}),
            your skill evaluations, strengths, and personalized exercises will appear here.
          </p>
        </div>
      ) : (
        <>
          {/* Student Overview Cards */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-xl border border-[#E5E5E5] bg-white p-5 shadow-sm">
              <p className="text-xs font-semibold text-[#737373]">Student Account</p>
              <h2 className="mt-2 text-xl font-bold text-[#171717]">{studentName}</h2>
              <p className="mt-1 text-xs text-[#737373]">{studentId} · {studentBatch}</p>
            </div>

            <div className="rounded-xl border border-[#E5E5E5] bg-white p-5 shadow-sm">
              <p className="text-xs font-semibold text-[#737373]">Academic Average</p>
              <div className="mt-2 flex items-end gap-1">
                <h2 className="text-3xl font-bold text-[#171717]">{average}%</h2>
                <span className="mb-1 text-xs text-[#737373]">/ 100</span>
              </div>
              <p className="mt-1 text-xs text-[#737373]">Across {moduleResults.length} evaluated modules</p>
            </div>

            <div className="rounded-xl border border-[#E5E5E5] bg-white p-5 shadow-sm">
              <p className="text-xs font-semibold text-[#737373]">Mastered Modules (≥75%)</p>
              <h2 className="mt-2 text-3xl font-bold text-green-600">{strongCount}</h2>
              <p className="mt-1 text-xs text-[#737373]">Demonstrated high proficiency</p>
            </div>

            <div className="rounded-xl border border-[#E5E5E5] bg-white p-5 shadow-sm">
              <p className="text-xs font-semibold text-[#737373]">Modules Requiring Focus (&lt;75%)</p>
              <h2 className="mt-2 text-3xl font-bold text-[#D71920]">{weakModules.length}</h2>
              <p className="mt-1 text-xs text-[#737373]">Priority improvement areas</p>
            </div>
          </div>

          {/* AI Recommendation Banner */}
          <div className="rounded-2xl border border-red-100 bg-gradient-to-r from-red-50 to-white p-6 shadow-sm">
            <div className="flex items-start gap-4">
              <div className="rounded-xl bg-[#D71920] p-3 text-white">
                <Sparkles size={24} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-[#171717]">
                  AI Academic Mentor Evaluation
                </h3>
                <p className="mt-2 text-sm leading-6 text-gray-700">
                  {aiSummary ||
                    (weakModules.length > 0
                      ? `Based on your exam scores, your lowest performance is in ${weakModules[0].module} (${weakModules[0].mark}%). Focus on the targeted practice assignments below to boost your comprehension and exam readiness.`
                      : `Excellent performance! All your published module scores are above 75%. Keep up the strong consistency.`)}
                </p>
              </div>
            </div>
          </div>

          {/* Performance Breakdown Table */}
          <div className="rounded-2xl border border-[#E5E5E5] bg-white p-6 shadow-sm">
            <h2 className="text-lg font-bold text-[#171717]">
              Module Scores & Skill Levels
            </h2>
            <p className="mt-1 text-xs text-[#737373]">
              Breakdown of your real marks entered by the Examination Officer.
            </p>

            <div className="mt-6 space-y-4">
              {moduleResults.map((result) => (
                <div
                  key={result.module}
                  className="rounded-xl border border-[#E5E5E5] p-4 transition hover:border-gray-300"
                >
                  <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                    <div>
                      <div className="flex items-center gap-2">
                        <BookOpen size={18} className="text-[#D71920]" />
                        <h3 className="font-bold text-[#171717]">{result.module}</h3>
                      </div>
                      <p className="mt-1 text-xs text-[#737373]">
                        Proficiency Assessment:{" "}
                        <span className="font-semibold text-gray-800">
                          {getLevel(result.mark)}
                        </span>
                      </p>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <span className="text-lg font-bold text-[#171717]">
                          {result.mark}%
                        </span>
                        <p className="text-[10px] uppercase font-semibold text-gray-400">
                          Exam Score
                        </p>
                      </div>

                      <div className="h-3 w-32 rounded-full bg-gray-100 overflow-hidden">
                        <div
                          className={`h-full ${getColor(result.mark)} rounded-full`}
                          style={{ width: `${result.mark}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Targeted Improvement Exercises */}
          {weakModules.length > 0 && (
            <div className="rounded-2xl border border-[#E5E5E5] bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                <div>
                  <h2 className="text-lg font-bold text-[#171717]">
                    Personalized Skill-Gap Assignments
                  </h2>
                  <p className="mt-1 text-xs text-[#737373]">
                    Practical exercises designed to bridge concepts in your lowest-scoring modules.
                  </p>
                </div>
                <span className="rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-700">
                  {completedAssignments.length} Completed
                </span>
              </div>

              <div className="mt-6 space-y-6">
                {weakModules.map((item) => {
                  const rawCode = item.module.toUpperCase();
                  const key = rawCode.includes("PRF")
                    ? "PRF"
                    : rawCode.includes("OOP")
                    ? "OOP"
                    : rawCode.includes("DBMS")
                    ? "DBMS"
                    : rawCode.includes("WEB")
                    ? "WEB"
                    : "SE";
                  const tasks = defaultModuleAssignments[key] || defaultModuleAssignments["PRF"];

                  return (
                    <div key={item.module} className="space-y-3">
                      <div className="flex items-center gap-2">
                        <AlertTriangle size={17} className="text-[#D71920]" />
                        <h3 className="font-bold text-[#171717]">
                          {item.module} ({item.mark}%) — Recommended Practice
                        </h3>
                      </div>

                      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                        {tasks.map((task, index) => {
                          const taskKey = `${item.module}-${index}`;
                          const isDone = completedAssignments.includes(taskKey);

                          return (
                            <div
                              key={taskKey}
                              onClick={() => handleComplete(taskKey)}
                              className={`cursor-pointer rounded-xl border p-4 transition ${
                                isDone
                                  ? "border-green-300 bg-green-50/50"
                                  : "border-gray-200 bg-white hover:border-[#D71920]"
                              }`}
                            >
                              <div className="flex items-start justify-between gap-3">
                                <div className="space-y-1">
                                  <p className="font-semibold text-gray-900 text-sm">
                                    {task.title}
                                  </p>
                                  <p className="text-xs text-gray-600 line-clamp-2">
                                    {task.description}
                                  </p>
                                </div>
                                {isDone ? (
                                  <CheckCircle2 size={18} className="text-green-600 shrink-0 mt-0.5" />
                                ) : (
                                  <div className="h-4 w-4 rounded-full border border-gray-300 shrink-0 mt-0.5" />
                                )}
                              </div>
                              <div className="mt-3 flex items-center gap-3 text-[11px] text-gray-500 font-medium">
                                <span className="rounded bg-gray-100 px-2 py-0.5">{task.difficulty}</span>
                                <span>{task.duration}</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default SkillGaps;
