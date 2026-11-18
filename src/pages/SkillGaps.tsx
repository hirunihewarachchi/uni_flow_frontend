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
  Crown,
  ExternalLink,
  Target,
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
  difficulty: "Beginner" | "Intermediate" | "Advanced" | "Honors";
  duration: string;
  deliverable?: string;
  completed?: boolean;
};

type ResourceLink = {
  title: string;
  type: string;
  url: string;
};

// Remediation assignments for marks < 75%
const remedialModuleAssignments: Record<string, Assignment[]> = {
  PRF: [
    {
      title: "Programming Fundamentals Practice",
      description: "Solve beginner programming problems using variables, conditions, loops, and reusable methods.",
      difficulty: "Beginner",
      duration: "45 minutes",
      deliverable: "GitHub Gist or console project with 5 core logic problems",
    },
    {
      title: "Array and Method Exercises",
      description: "Complete programming exercises using single and multidimensional arrays and modular methods.",
      difficulty: "Intermediate",
      duration: "60 minutes",
      deliverable: "Array manipulation algorithms (bubble sort, linear & binary search)",
    },
  ],
  OOP: [
    {
      title: "OOP Concepts Assignment",
      description: "Create a small application demonstrating classes, objects, constructors, and encapsulation.",
      difficulty: "Beginner",
      duration: "60 minutes",
      deliverable: "Domain model class diagram with private fields and getter/setter validation",
    },
    {
      title: "Inheritance and Polymorphism",
      description: "Build an application using inheritance, abstract classes, interfaces, and polymorphism.",
      difficulty: "Intermediate",
      duration: "90 minutes",
      deliverable: "Polymorphic payment processing hierarchy with unit test assertions",
    },
  ],
  DBMS: [
    {
      title: "SQL Fundamentals & Schema Design",
      description: "Practice SELECT, INSERT, UPDATE, DELETE, WHERE, and ORDER BY queries on relational tables.",
      difficulty: "Beginner",
      duration: "45 minutes",
      deliverable: "Working SQL script creating normalized 3NF student and enrollment tables",
    },
    {
      title: "JOIN and Aggregate Queries",
      description: "Solve reporting queries using INNER JOIN, LEFT JOIN, GROUP BY, and aggregate functions.",
      difficulty: "Intermediate",
      duration: "60 minutes",
      deliverable: "Multi-table query script generating monthly financial & batch analytics",
    },
  ],
  WEB: [
    {
      title: "Responsive Web Layouts",
      description: "Build responsive layouts using modern HTML5, CSS Grid, and Flexbox with mobile-first break points.",
      difficulty: "Beginner",
      duration: "45 minutes",
      deliverable: "Single-page responsive institutional portal homepage",
    },
    {
      title: "REST API Integration & Async DOM",
      description: "Build an interactive frontend that connects to backend APIs using async/await, fetch, and error handlers.",
      difficulty: "Intermediate",
      duration: "60 minutes",
      deliverable: "Dynamic search and filter widget consuming real JSON endpoints",
    },
  ],
  SE: [
    {
      title: "Software Requirements Specification",
      description: "Write functional and non-functional requirements with UML use case diagrams and acceptance criteria.",
      difficulty: "Beginner",
      duration: "60 minutes",
      deliverable: "Complete SRS document for an examination management module",
    },
    {
      title: "Layered Architecture Design",
      description: "Implement a 3-tier layered architecture application strictly complying with SOLID design principles.",
      difficulty: "Intermediate",
      duration: "90 minutes",
      deliverable: "Decoupled Controller-Service-DAO layer implementation",
    },
  ],
};

// High-Level Honors assignments for high achievers (marks >= 75%)
const honorsModuleAssignments: Record<string, Assignment[]> = {
  PRF: [
    {
      title: "Honors Challenge: Bare-Metal Memory Allocator & Cache Simulator",
      description: "Implement an arena-based memory allocation pool and cache-aware data structure simulating low-level JVM memory management without external collections.",
      difficulty: "Honors",
      duration: "120 minutes",
      deliverable: "Custom Arena Allocator with micro-benchmarking tests comparing heap allocation latency",
    },
    {
      title: "Advanced Dynamic Programming & Bit Manipulation Suite",
      description: "Author solutions to hard-tier competitive algorithmic challenges: bitmask DP, graph cycle elimination, and segment tree range queries.",
      difficulty: "Advanced",
      duration: "90 minutes",
      deliverable: "Optimized Java/C++ solution suite with O(N log N) asymptotic time guarantees",
    },
  ],
  OOP: [
    {
      title: "Honors Challenge: Custom Reflection-Based IoC & Dependency Injection Framework",
      description: "Architect a custom Inversion-of-Control container supporting @Component, @Autowired, Singleton/Prototype lifecycle scopes, and circular dependency graph resolution.",
      difficulty: "Honors",
      duration: "150 minutes",
      deliverable: "Zero-dependency lightweight DI framework with comprehensive test suite",
    },
    {
      title: "Enterprise Architecture: Event-Driven CQRS & Domain-Driven Design (DDD)",
      description: "Implement an enterprise banking core featuring domain aggregate roots, immutable event streams, and separate read/write data pipelines.",
      difficulty: "Advanced",
      duration: "120 minutes",
      deliverable: "Event-sourced domain model handling concurrent transactional balance updates",
    },
  ],
  DBMS: [
    {
      title: "Honors Challenge: Storage Engine Internals & B+ Tree Index Engine",
      description: "Implement an in-memory B+ Tree storage engine with Write-Ahead Logging (WAL), page buffer management, and ACID crash-recovery simulation.",
      difficulty: "Honors",
      duration: "180 minutes",
      deliverable: "Working B+ tree node splitting/merging algorithms with concurrent read locks",
    },
    {
      title: "Enterprise Challenge: Distributed Horizontal Sharding & EXPLAIN Query Tuning",
      description: "Design a horizontally partitioned database router with read-replica replication, deadlock detection, and sub-millisecond query plan optimization.",
      difficulty: "Advanced",
      duration: "120 minutes",
      deliverable: "Sharding configuration script and query optimization benchmark report",
    },
  ],
  WEB: [
    {
      title: "Honors Challenge: Reactive Virtual DOM & Reconciler from Scratch",
      description: "Construct a lightweight reactive UI framework featuring a custom Virtual DOM tree diffing reconciler, batching scheduler, and reactive hooks.",
      difficulty: "Honors",
      duration: "150 minutes",
      deliverable: "Minified 5KB reactive library capable of rendering dynamic interactive counter grids",
    },
    {
      title: "Production Challenge: Real-Time CRDT Collaborative Multi-User Canvas",
      description: "Build a distributed collaborative editor using Conflict-Free Replicated Data Types (CRDTs), WebSockets, and WebRTC fallback channels.",
      difficulty: "Advanced",
      duration: "120 minutes",
      deliverable: "Multiplayer synchronized drawing canvas supporting offline reconciliation",
    },
  ],
  SE: [
    {
      title: "Honors Challenge: Chaos Engineering & Distributed Resilience Blueprint",
      description: "Author a mission-critical distributed systems architecture blueprint and execute automated Chaos Engineering failure injection scenarios.",
      difficulty: "Honors",
      duration: "180 minutes",
      deliverable: "Chaos testing test suite verifying split-brain network partition survival",
    },
    {
      title: "Enterprise Challenge: Zero-Downtime Microservices Mesh & Istio Routing",
      description: "Deploy a resilient microservices mesh with automated canary routing, distributed OpenTelemetry tracing, and circuit breakers.",
      difficulty: "Advanced",
      duration: "120 minutes",
      deliverable: "Kubernetes manifest definitions with Istio VirtualService and telemetry exporter",
    },
  ],
};

// Curated learning and documentation resources
const moduleResources: Record<string, ResourceLink[]> = {
  PRF: [
    { title: "Java SE 21 Language Specification & Core Algorithms", type: "Documentation", url: "https://docs.oracle.com/en/java/" },
    { title: "LeetCode Algorithmic Problem Solving Patterns", type: "Practice Platform", url: "https://leetcode.com/explore/" },
  ],
  OOP: [
    { title: "Refactoring.Guru: Clean Code & GoF Design Patterns", type: "Architecture Reference", url: "https://refactoring.guru/design-patterns" },
    { title: "Martin Fowler: Inversion of Control Containers and the DI Pattern", type: "Technical Whitepaper", url: "https://martinfowler.com/articles/injection.html" },
  ],
  DBMS: [
    { title: "Use The Index, Luke! A Guide to Database Performance", type: "Tuning Guide", url: "https://use-the-index-luke.com/" },
    { title: "PostgreSQL Architecture & Internals Manual", type: "Official Docs", url: "https://www.postgresql.org/docs/current/internals.html" },
  ],
  WEB: [
    { title: "MDN Web Docs: Web APIs, DOM & Advanced JavaScript", type: "Official Reference", url: "https://developer.mozilla.org/" },
    { title: "React Virtual DOM and Reconciliation Architecture", type: "Technical Guide", url: "https://react.dev/learn" },
  ],
  SE: [
    { title: "Martin Fowler: Microservice Architecture & Patterns", type: "Architecture Guide", url: "https://martinfowler.com/microservices/" },
    { title: "The Twelve-Factor App Methodology for Cloud Systems", type: "Industry Standard", url: "https://12factor.net/" },
  ],
};

function getLevel(mark: number) {
  if (mark >= 75) return "Honors Mastery (≥75%)";
  if (mark >= 50) return "Moderate (50-74%)";
  return "Needs Improvement (<50%)";
}

function getColor(mark: number) {
  if (mark >= 75) return "bg-emerald-500";
  if (mark >= 50) return "bg-amber-500";
  return "bg-[#D71920]";
}

function getModuleKey(name: string): string {
  const upper = name.toUpperCase();
  if (upper.includes("PRF")) return "PRF";
  if (upper.includes("OOP")) return "OOP";
  if (upper.includes("DBMS")) return "DBMS";
  if (upper.includes("WEB")) return "WEB";
  return "SE";
}

function SkillGaps() {
  const { user } = useAuth();
  const [completedAssignments, setCompletedAssignments] = useState<string[]>([]);
  const [moduleResults, setModuleResults] = useState<ModuleResult[]>([]);
  const [aiSummary, setAiSummary] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [filterTrack, setFilterTrack] = useState<"all" | "honors" | "remedial">("all");

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
                mark: Number(m.mark),
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

  const strongModules = useMemo(
    () =>
      moduleResults
        .filter((item) => item.mark >= 75)
        .sort((a, b) => b.mark - a.mark),
    [moduleResults]
  );

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

  // Total possible assignments across all modules
  const totalAssignmentsCount = useMemo(() => {
    return moduleResults.reduce((acc, item) => {
      const key = getModuleKey(item.module);
      const isHonors = item.mark >= 75;
      const count = isHonors
        ? (honorsModuleAssignments[key] || []).length
        : (remedialModuleAssignments[key] || []).length;
      return acc + count;
    }, 0);
  }, [moduleResults]);

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

  // Filter modules based on active tab
  const displayedModules = useMemo(() => {
    if (filterTrack === "honors") return strongModules;
    if (filterTrack === "remedial") return weakModules;
    return moduleResults;
  }, [filterTrack, strongModules, weakModules, moduleResults]);

  const progressPercent = totalAssignmentsCount > 0
    ? Math.min(100, Math.round((completedAssignments.length / totalAssignmentsCount) * 100))
    : 0;

  return (
    <div className="mx-auto max-w-7xl space-y-8 p-4 md:p-8">
      {/* Header */}
      <div className="flex flex-col justify-between gap-5 md:flex-row md:items-center">
        <div>
          <div className="mb-2 flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-[#D71920]">
            <BrainCircuit size={18} />
            AI Adaptive Learning Engine
          </div>

          <h1 className="text-3xl font-bold text-[#171717]">
            Skill Gap & Honors Guidance
          </h1>

          <p className="mt-2 max-w-3xl text-sm leading-6 text-[#737373]">
            Adaptive, multi-tiered learning guidance computed from your real examination marks. High achievers
            (&ge;75%) receive enterprise-grade honors challenges, while developing areas receive targeted remedial practice.
          </p>
        </div>

        <div className="flex items-center gap-3 rounded-2xl border border-[#E5E5E5] bg-white p-4 shadow-sm">
          <div className="rounded-xl bg-red-50 p-3 text-[#D71920]">
            <GraduationCap size={24} />
          </div>

          <div>
            <p className="text-xs font-semibold text-[#737373]">Student Profile</p>
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
            Analyzing Examination Records & Generating Guidance...
          </p>
          <p className="mt-1 text-sm text-gray-500">
            Fetching verified marks from the Examination Department to build your personalized skill roadmap.
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
            your skill evaluations, strengths, honors challenges, and personalized exercises will appear here.
          </p>
        </div>
      ) : (
        <>
          {/* Key Metric Overview Cards */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl border border-[#E5E5E5] bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between text-xs font-semibold text-[#737373]">
                <span>Academic Average</span>
                <Target size={16} className="text-gray-400" />
              </div>
              <div className="mt-2 flex items-end gap-1">
                <h2 className="text-3xl font-bold text-[#171717]">{average}%</h2>
                <span className="mb-1 text-xs text-[#737373]">/ 100</span>
              </div>
              <p className="mt-1 text-xs text-[#737373]">Across {moduleResults.length} evaluated subjects</p>
            </div>

            <div className="rounded-2xl border border-emerald-100 bg-gradient-to-br from-emerald-50/50 to-white p-5 shadow-sm">
              <div className="flex items-center justify-between text-xs font-semibold text-emerald-700">
                <span>Honors Mastery (≥75%)</span>
                <Crown size={16} className="text-emerald-600" />
              </div>
              <h2 className="mt-2 text-3xl font-bold text-emerald-600">{strongModules.length}</h2>
              <p className="mt-1 text-xs text-emerald-800/80">Qualified for High-Level Challenges</p>
            </div>

            <div className="rounded-2xl border border-red-100 bg-gradient-to-br from-red-50/50 to-white p-5 shadow-sm">
              <div className="flex items-center justify-between text-xs font-semibold text-red-700">
                <span>Remediation Areas (&lt;75%)</span>
                <AlertTriangle size={16} className="text-[#D71920]" />
              </div>
              <h2 className="mt-2 text-3xl font-bold text-[#D71920]">{weakModules.length}</h2>
              <p className="mt-1 text-xs text-red-800/80">Priority skill gaps to reinforce</p>
            </div>

            <div className="rounded-2xl border border-[#E5E5E5] bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between text-xs font-semibold text-[#737373]">
                <span>Task Completion</span>
                <CheckCircle2 size={16} className="text-green-600" />
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <h2 className="text-3xl font-bold text-[#171717]">{completedAssignments.length}</h2>
                <span className="text-xs text-gray-500">/ {totalAssignmentsCount} completed</span>
              </div>
              <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-gray-100">
                <div
                  className="h-full bg-emerald-500 transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          </div>

          {/* AI Academic Mentor Evaluation Banner */}
          <div className="rounded-2xl border border-red-100 bg-gradient-to-r from-red-50 via-white to-amber-50/30 p-6 shadow-sm">
            <div className="flex items-start gap-4">
              <div className="rounded-2xl bg-[#D71920] p-3 text-white shadow-sm">
                <Sparkles size={24} />
              </div>
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-lg font-bold text-[#171717]">
                    AI Academic Mentor Evaluation
                  </h3>
                  {strongModules.length > 0 && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-bold text-emerald-800">
                      <Crown size={12} /> Honors Track Active
                    </span>
                  )}
                </div>
                <p className="text-sm leading-6 text-gray-700">
                  {aiSummary ||
                    (strongModules.length > 0 && weakModules.length > 0
                      ? `Great balance! You have achieved honors mastery (≥75%) in ${strongModules.map((m) => m.module).join(", ")}, unlocking high-level architectural assignments. For ${weakModules.map((m) => m.module).join(", ")}, follow the targeted practice roadmaps below.`
                      : strongModules.length > 0
                      ? `Outstanding achievement! You have scored ≥75% across all modules. You have been granted full access to advanced enterprise-scale honors assignments.`
                      : `You have identified growth areas. Follow the foundational practice roadmaps below, prioritizing ${weakModules[0]?.module || "core modules"} (${weakModules[0]?.mark || 0}%), to elevate your understanding.`)}
                </p>
              </div>
            </div>
          </div>

          {/* Performance Breakdown Table */}
          <div className="rounded-2xl border border-[#E5E5E5] bg-white p-6 shadow-sm">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
              <div>
                <h2 className="text-lg font-bold text-[#171717]">
                  Module Scores & Proficiency Levels
                </h2>
                <p className="mt-1 text-xs text-[#737373]">
                  Verified results entered by the Examination Officer with level-specific learning tracks.
                </p>
              </div>

              {/* Track filter pills */}
              <div className="inline-flex rounded-xl bg-gray-100 p-1 text-xs font-semibold">
                <button
                  onClick={() => setFilterTrack("all")}
                  className={`rounded-lg px-3 py-1.5 transition ${
                    filterTrack === "all"
                      ? "bg-white text-gray-900 shadow-sm"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  All ({moduleResults.length})
                </button>
                <button
                  onClick={() => setFilterTrack("honors")}
                  className={`flex items-center gap-1 rounded-lg px-3 py-1.5 transition ${
                    filterTrack === "honors"
                      ? "bg-emerald-600 text-white shadow-sm"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  <Crown size={13} />
                  Honors Track ({strongModules.length})
                </button>
                <button
                  onClick={() => setFilterTrack("remedial")}
                  className={`flex items-center gap-1 rounded-lg px-3 py-1.5 transition ${
                    filterTrack === "remedial"
                      ? "bg-[#D71920] text-white shadow-sm"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  <AlertTriangle size={13} />
                  Remediation ({weakModules.length})
                </button>
              </div>
            </div>

            <div className="mt-6 space-y-4">
              {displayedModules.map((result) => {
                const isHonors = result.mark >= 75;

                return (
                  <div
                    key={result.module}
                    className={`rounded-2xl border p-5 transition ${
                      isHonors
                        ? "border-emerald-200 bg-gradient-to-r from-emerald-50/20 via-white to-white hover:border-emerald-300"
                        : "border-[#E5E5E5] hover:border-gray-300"
                    }`}
                  >
                    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <BookOpen
                            size={18}
                            className={isHonors ? "text-emerald-600" : "text-[#D71920]"}
                          />
                          <h3 className="font-bold text-[#171717]">{result.module}</h3>
                          {isHonors && (
                            <span className="inline-flex items-center gap-1 rounded-md bg-emerald-100 px-2 py-0.5 text-[11px] font-bold text-emerald-800">
                              <Crown size={12} /> Honors Tier
                            </span>
                          )}
                        </div>

                        <p className="text-xs text-[#737373]">
                          Status:{" "}
                          <span
                            className={`font-semibold ${
                              isHonors ? "text-emerald-700" : result.mark >= 50 ? "text-amber-700" : "text-red-600"
                            }`}
                          >
                            {getLevel(result.mark)}
                          </span>
                          {" · "}
                          {isHonors
                            ? "Assigned to High-Level Honors & Architecture Challenges"
                            : "Assigned to Targeted Foundational Practice"}
                        </p>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <span
                            className={`text-2xl font-bold ${
                              isHonors ? "text-emerald-700" : result.mark >= 50 ? "text-amber-600" : "text-[#D71920]"
                            }`}
                          >
                            {result.mark}%
                          </span>
                          <p className="text-[10px] uppercase font-semibold text-gray-400">
                            Exam Score
                          </p>
                        </div>

                        <div className="h-3 w-32 rounded-full bg-gray-100 overflow-hidden">
                          <div
                            className={`h-full ${getColor(result.mark)} rounded-full transition-all duration-500`}
                            style={{ width: `${result.mark}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* DUAL-TRACK SECTION: Honors Challenges & Remedial Assignments */}
          <div className="space-y-8">
            {/* 1. HIGH-LEVEL HONORS TRACK (>= 75%) */}
            {strongModules.length > 0 && (filterTrack === "all" || filterTrack === "honors") && (
              <div className="rounded-3xl border-2 border-emerald-300 bg-gradient-to-b from-emerald-50/40 via-white to-white p-6 md:p-8 shadow-sm">
                <div className="flex flex-col justify-between gap-4 border-b border-emerald-100 pb-5 md:flex-row md:items-center">
                  <div>
                    <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800 mb-2">
                      <Crown size={14} className="text-emerald-700" />
                      ADVANCED MASTERY TRACK (MARKS &ge; 75%)
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">
                      High-Level Honors Assignments & Architecture Challenges
                    </h2>
                    <p className="mt-1 text-xs md:text-sm text-gray-600 max-w-3xl">
                      Congratulations on achieving over 75% in these subjects. Rather than repetitive basics, you are
                      guided with industry-grade architectural challenges, internal system mechanics, and production-scale problems.
                    </p>
                  </div>

                  <div className="rounded-2xl border border-emerald-200 bg-white px-4 py-2.5 text-right shadow-xs">
                    <span className="text-xs text-gray-500 font-semibold block">Honors Qualified</span>
                    <span className="text-lg font-bold text-emerald-700">{strongModules.length} Subjects</span>
                  </div>
                </div>

                <div className="mt-6 space-y-8">
                  {strongModules.map((item) => {
                    const key = getModuleKey(item.module);
                    const tasks = honorsModuleAssignments[key] || honorsModuleAssignments["PRF"];
                    const resources = moduleResources[key] || [];

                    return (
                      <div key={item.module} className="rounded-2xl border border-emerald-100 bg-white p-6 shadow-xs">
                        <div className="flex flex-col justify-between gap-3 border-b border-gray-100 pb-4 sm:flex-row sm:items-center">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
                              <Crown size={20} />
                            </div>
                            <div>
                              <h3 className="font-bold text-gray-900 text-base">
                                {item.module} ({item.mark}%) — Honors Architecture Track
                              </h3>
                              <p className="text-xs text-emerald-700 font-medium">
                                Level: High Proficiency · Enterprise Scope
                              </p>
                            </div>
                          </div>

                          {resources.length > 0 && (
                            <div className="flex flex-wrap gap-2 text-xs">
                              {resources.map((res, i) => (
                                <a
                                  key={i}
                                  href={res.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-gray-50 px-2.5 py-1 text-gray-700 hover:border-emerald-500 hover:text-emerald-700 transition"
                                >
                                  <BookOpen size={12} />
                                  <span>{res.title}</span>
                                  <ExternalLink size={10} className="text-gray-400" />
                                </a>
                              ))}
                            </div>
                          )}
                        </div>

                        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                          {tasks.map((task, index) => {
                            const taskKey = `honors-${item.module}-${index}`;
                            const isDone = completedAssignments.includes(taskKey);

                            return (
                              <div
                                key={taskKey}
                                onClick={() => handleComplete(taskKey)}
                                className={`group cursor-pointer rounded-2xl border p-5 transition-all ${
                                  isDone
                                    ? "border-emerald-300 bg-emerald-50/50 shadow-xs"
                                    : "border-gray-200 bg-white hover:border-emerald-500 hover:shadow-sm"
                                }`}
                              >
                                <div className="flex items-start justify-between gap-3">
                                  <div className="space-y-1.5">
                                    <div className="flex items-center gap-2">
                                      <span className="rounded-md bg-emerald-100 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-emerald-800">
                                        {task.difficulty}
                                      </span>
                                      <span className="text-xs text-gray-400">· {task.duration}</span>
                                    </div>

                                    <h4 className="font-bold text-gray-900 text-sm group-hover:text-emerald-700 transition">
                                      {task.title}
                                    </h4>

                                    <p className="text-xs text-gray-600 leading-5">
                                      {task.description}
                                    </p>

                                    {task.deliverable && (
                                      <div className="mt-2 rounded-lg bg-gray-50 p-2.5 text-[11px] text-gray-700 border border-gray-100">
                                        <span className="font-bold text-gray-900">Senior Deliverable: </span>
                                        {task.deliverable}
                                      </div>
                                    )}
                                  </div>

                                  <div className="shrink-0 mt-1">
                                    {isDone ? (
                                      <CheckCircle2 size={22} className="text-emerald-600" />
                                    ) : (
                                      <div className="h-5 w-5 rounded-full border-2 border-gray-300 group-hover:border-emerald-500 transition" />
                                    )}
                                  </div>
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

            {/* 2. TARGETED REMEDIATION TRACK (< 75%) */}
            {weakModules.length > 0 && (filterTrack === "all" || filterTrack === "remedial") && (
              <div className="rounded-3xl border border-red-200 bg-white p-6 md:p-8 shadow-sm">
                <div className="flex flex-col justify-between gap-4 border-b border-gray-100 pb-5 md:flex-row md:items-center">
                  <div>
                    <div className="inline-flex items-center gap-1.5 rounded-full bg-red-100 px-3 py-1 text-xs font-bold text-red-800 mb-2">
                      <AlertTriangle size={14} className="text-[#D71920]" />
                      TARGETED REMEDIATION TRACK (MARKS &lt; 75%)
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">
                      Personalized Foundational Practice & Gap Filling
                    </h2>
                    <p className="mt-1 text-xs md:text-sm text-gray-600 max-w-3xl">
                      Targeted exercises designed to bridge concept gaps in your lower-scoring subjects. Complete
                      these hands-on problems to build solid confidence for the next examination phase.
                    </p>
                  </div>

                  <div className="rounded-2xl border border-red-200 bg-red-50/50 px-4 py-2.5 text-right shadow-xs">
                    <span className="text-xs text-gray-500 font-semibold block">Focus Areas</span>
                    <span className="text-lg font-bold text-[#D71920]">{weakModules.length} Subjects</span>
                  </div>
                </div>

                <div className="mt-6 space-y-8">
                  {weakModules.map((item) => {
                    const key = getModuleKey(item.module);
                    const tasks = remedialModuleAssignments[key] || remedialModuleAssignments["PRF"];
                    const resources = moduleResources[key] || [];

                    return (
                      <div key={item.module} className="rounded-2xl border border-gray-200 bg-white p-6 shadow-xs">
                        <div className="flex flex-col justify-between gap-3 border-b border-gray-100 pb-4 sm:flex-row sm:items-center">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-100 text-[#D71920]">
                              <AlertTriangle size={20} />
                            </div>
                            <div>
                              <h3 className="font-bold text-gray-900 text-base">
                                {item.module} ({item.mark}%) — Recommended Remedial Practice
                              </h3>
                              <p className="text-xs text-red-600 font-medium">
                                Priority Gap · Target: ≥75% in next evaluation
                              </p>
                            </div>
                          </div>

                          {resources.length > 0 && (
                            <div className="flex flex-wrap gap-2 text-xs">
                              {resources.map((res, i) => (
                                <a
                                  key={i}
                                  href={res.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-gray-50 px-2.5 py-1 text-gray-700 hover:border-red-500 hover:text-red-700 transition"
                                >
                                  <BookOpen size={12} />
                                  <span>{res.title}</span>
                                  <ExternalLink size={10} className="text-gray-400" />
                                </a>
                              ))}
                            </div>
                          )}
                        </div>

                        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                          {tasks.map((task, index) => {
                            const taskKey = `remedial-${item.module}-${index}`;
                            const isDone = completedAssignments.includes(taskKey);

                            return (
                              <div
                                key={taskKey}
                                onClick={() => handleComplete(taskKey)}
                                className={`group cursor-pointer rounded-2xl border p-5 transition-all ${
                                  isDone
                                    ? "border-green-300 bg-green-50/50 shadow-xs"
                                    : "border-gray-200 bg-white hover:border-[#D71920] hover:shadow-sm"
                                }`}
                              >
                                <div className="flex items-start justify-between gap-3">
                                  <div className="space-y-1.5">
                                    <div className="flex items-center gap-2">
                                      <span className="rounded-md bg-gray-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-gray-700">
                                        {task.difficulty}
                                      </span>
                                      <span className="text-xs text-gray-400">· {task.duration}</span>
                                    </div>

                                    <h4 className="font-bold text-gray-900 text-sm group-hover:text-[#D71920] transition">
                                      {task.title}
                                    </h4>

                                    <p className="text-xs text-gray-600 leading-5">
                                      {task.description}
                                    </p>

                                    {task.deliverable && (
                                      <div className="mt-2 rounded-lg bg-gray-50 p-2.5 text-[11px] text-gray-700 border border-gray-100">
                                        <span className="font-bold text-gray-900">Deliverable: </span>
                                        {task.deliverable}
                                      </div>
                                    )}
                                  </div>

                                  <div className="shrink-0 mt-1">
                                    {isDone ? (
                                      <CheckCircle2 size={22} className="text-green-600" />
                                    ) : (
                                      <div className="h-5 w-5 rounded-full border-2 border-gray-300 group-hover:border-[#D71920] transition" />
                                    )}
                                  </div>
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
          </div>
        </>
      )}
    </div>
  );
}

export default SkillGaps;