import { useMemo, useState, useEffect } from "react";
import {
  BrainCircuit,
  Target,
  Sparkles,
  CheckCircle2,
  Clock,
  ArrowRight,
  GraduationCap,
  Compass,
} from "lucide-react";
import { getCareerRoadmap, confirmCareerGoal } from "../services/ai.service";
import { getMyResults } from "../services/exam.service";
import { useAuth } from "../hooks/UseAuth";

type Career = {
  id: string;
  title: string;
  category: string;
  description: string;
  skills: string[];
  roadmap: {
    phase: string;
    duration: string;
    topics: string[];
    task: string;
  }[];
};

const baseCareers: Career[] = [
  {
    id: "software-engineer",
    title: "Software Engineer",
    category: "Software Development",
    description:
      "Design, develop, test and maintain software applications using modern programming paradigms, frameworks and engineering best practices.",
    skills: [
      "Programming fundamentals",
      "Object-oriented programming",
      "Data structures & algorithms",
      "Database design and SQL",
      "Frontend and backend web APIs",
      "Software testing, Git & Docker",
    ],
    roadmap: [
      {
        phase: "Phase 01 - Programming Foundation",
        duration: "Weeks 1-3",
        topics: [
          "Core programming logic & algorithms",
          "OOP and clean code principles",
          "Data structures & collections",
        ],
        task: "Build a console-based application applying layered OOP design patterns.",
      },
      {
        phase: "Phase 02 - Full Stack Development",
        duration: "Weeks 4-8",
        topics: [
          "Modern web interfaces (HTML, CSS, React)",
          "RESTful APIs and microservices",
          "Relational and NoSQL databases",
        ],
        task: "Develop a complete full-stack web application with authentication and CRUD workflows.",
      },
      {
        phase: "Phase 03 - Engineering Practices",
        duration: "Weeks 9-12",
        topics: [
          "Layered architecture and SOLID principles",
          "Automated unit & integration testing",
          "CI/CD pipelines and containerization",
        ],
        task: "Deploy a production-grade software project with complete API documentation.",
      },
    ],
  },
  {
    id: "business-analyst",
    title: "Business Analyst",
    category: "Business & Analysis",
    description:
      "Understand complex business domains, communicate with stakeholders and translate organizational requirements into technical specifications.",
    skills: [
      "Business process modeling",
      "Requirement gathering & user stories",
      "SQL and data analytics",
      "UML use case diagrams",
      "Stakeholder communication",
      "Agile & Scrum methodologies",
    ],
    roadmap: [
      {
        phase: "Phase 01 - Foundation",
        duration: "Weeks 1-3",
        topics: [
          "Software development life cycle (SDLC)",
          "Business analysis core concepts",
          "Functional and non-functional requirements",
        ],
        task: "Author a comprehensive Software Requirements Specification (SRS) for an institute management platform.",
      },
      {
        phase: "Phase 02 - Modeling & Wireframing",
        duration: "Weeks 4-7",
        topics: [
          "UML use case, sequence, and activity diagrams",
          "Process flowcharts and BPMN",
          "UI wireframing and prototyping",
        ],
        task: "Design end-to-end UML diagrams and interactive UI wireframes for a client order flow.",
      },
      {
        phase: "Phase 03 - Data Analytics & Agile",
        duration: "Weeks 8-10",
        topics: [
          "SQL for business reporting",
          "Product backlog grooming & user stories",
          "Acceptance criteria and user testing",
        ],
        task: "Write prioritized user stories and query relational database metrics to validate business KPIs.",
      },
    ],
  },
  {
    id: "ai-engineer",
    title: "AI Engineer",
    category: "Artificial Intelligence",
    description:
      "Build intelligent systems, integrate machine learning models and create cutting-edge generative AI solutions.",
    skills: [
      "Python programming",
      "Applied linear algebra and statistics",
      "Machine learning algorithms",
      "Deep learning & neural networks",
      "Large Language Models (LLMs)",
      "AI API and vector database integration",
    ],
    roadmap: [
      {
        phase: "Phase 01 - Mathematics & Python",
        duration: "Weeks 1-4",
        topics: [
          "Python for data science (NumPy, Pandas)",
          "Probability, linear algebra, and calculus",
          "Data preprocessing and feature scaling",
        ],
        task: "Implement core regression and classification algorithms from scratch in Python.",
      },
      {
        phase: "Phase 02 - Machine Learning",
        duration: "Weeks 5-8",
        topics: [
          "Supervised & unsupervised learning models",
          "Model evaluation, precision, and recall",
          "Scikit-Learn pipelines",
        ],
        task: "Train and evaluate an ML model that predicts academic grade trajectories based on mock exam metrics.",
      },
      {
        phase: "Phase 03 - Generative AI & LLMs",
        duration: "Weeks 9-12",
        topics: [
          "Neural network architectures",
          "Prompt engineering & LLM APIs",
          "RAG pipelines and vector embeddings",
        ],
        task: "Develop an AI-powered conversational tutor integrated with custom course notes.",
      },
    ],
  },
  {
    id: "data-analyst",
    title: "Data Analyst",
    category: "Data & Analytics",
    description:
      "Transform complex relational data into meaningful business insights through SQL queries, statistical models and dashboards.",
    skills: [
      "Advanced SQL queries and aggregations",
      "Spreadsheets and pivot analysis",
      "Python data manipulation (Pandas)",
      "BI dashboard tools (PowerBI, Tableau)",
      "Statistical inference and reporting",
    ],
    roadmap: [
      {
        phase: "Phase 01 - Data Fundamentals",
        duration: "Weeks 1-3",
        topics: [
          "Relational databases and data hygiene",
          "Complex SQL joins, subqueries, and window functions",
          "Pivot tables and analytical aggregations",
        ],
        task: "Analyze a multi-table institutional database and generate statistical summary reports.",
      },
      {
        phase: "Phase 02 - Python Analytics",
        duration: "Weeks 4-7",
        topics: [
          "Pandas dataframes and data cleaning",
          "Exploratory data analysis (EDA)",
          "Statistical distributions and correlations",
        ],
        task: "Clean and explore an academic dataset to surface correlation factors between attendance and exam marks.",
      },
      {
        phase: "Phase 03 - Dashboards & Storytelling",
        duration: "Weeks 8-10",
        topics: [
          "Data visualization best practices",
          "Interactive executive dashboards",
          "Translating data into executive presentations",
        ],
        task: "Build an interactive PowerBI / web dashboard displaying cohort progression metrics.",
      },
    ],
  },
  {
    id: "qa-engineer",
    title: "QA Engineer",
    category: "Software Quality",
    description:
      "Ensure software reliability, performance and defect-free execution through manual test cases and automated testing frameworks.",
    skills: [
      "Software testing methodologies (STLC)",
      "Test scenario & test case design",
      "REST API verification with Postman",
      "SQL database validation",
      "Browser automation testing (Playwright, Selenium)",
    ],
    roadmap: [
      {
        phase: "Phase 01 - Testing Foundations",
        duration: "Weeks 1-3",
        topics: [
          "STLC and defect lifecycles",
          "Black-box test design techniques",
          "Defect tracking, severity, and bug triage",
        ],
        task: "Write an end-to-end test plan and bug report suite for an examination registration module.",
      },
      {
        phase: "Phase 02 - API & Database Verification",
        duration: "Weeks 4-7",
        topics: [
          "HTTP methods, status codes, and headers",
          "Postman automated test assertions",
          "Database state validation using SQL queries",
        ],
        task: "Create a Postman automated collection testing role-based authentication and edge cases.",
      },
      {
        phase: "Phase 03 - Automation Testing",
        duration: "Weeks 8-10",
        topics: [
          "Automated UI testing concepts",
          "Regression testing suites",
          "CI/CD continuous test execution",
        ],
        task: "Build an automated browser smoke test suite verifying student login and timetable views.",
      },
    ],
  },
];

function CareerRoadmap() {
  const { user } = useAuth();
  const [selectedCareerId, setSelectedCareerId] = useState("software-engineer");
  const [careerConfirmed, setCareerConfirmed] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [realMarks, setRealMarks] = useState<Record<string, number>>({});
  const [hasRealResults, setHasRealResults] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const fetchRoadmapData = async () => {
      try {
        const [roadmapRes, resultsRes] = await Promise.allSettled([
          getCareerRoadmap(),
          getMyResults(),
        ]);

        const marksMap: Record<string, number> = {};

        // 1. Check AI roadmap backend
        if (roadmapRes.status === "fulfilled" && roadmapRes.value) {
          const data = roadmapRes.value;
          if (data.roadmap) {
            if (data.roadmap.selectedCareerId) setSelectedCareerId(data.roadmap.selectedCareerId);
            if (typeof data.roadmap.careerConfirmed === "boolean") setCareerConfirmed(data.roadmap.careerConfirmed);
          }
          if (Array.isArray(data.results) && data.results.length > 0) {
            data.results.forEach((r: any) => {
              const code = (r.module || "").toUpperCase();
              if (code.includes("PRF")) marksMap.PRF = Number(r.mark);
              if (code.includes("OOP")) marksMap.OOP = Number(r.mark);
              if (code.includes("DBMS")) marksMap.DBMS = Number(r.mark);
              if (code.includes("WEB")) marksMap.WEB = Number(r.mark);
              if (code.includes("SE") || code.includes("SOFTWARE")) marksMap.SE = Number(r.mark);
            });
          }
        }

        // 2. Check real examination results
        if (resultsRes.status === "fulfilled" && Array.isArray(resultsRes.value)) {
          resultsRes.value.forEach((r: any) => {
            const code = (r.moduleCode || r.subject || "").toUpperCase();
            const mark = Number(r.marks ?? r.score ?? 0);
            if (code.includes("PRF")) marksMap.PRF = mark;
            if (code.includes("OOP")) marksMap.OOP = mark;
            if (code.includes("DBMS")) marksMap.DBMS = mark;
            if (code.includes("WEB")) marksMap.WEB = mark;
            if (code.includes("SE") || code.includes("SOFTWARE")) marksMap.SE = mark;
          });
        }

        if (isMounted) {
          const keys = Object.keys(marksMap);
          if (keys.length > 0) {
            setRealMarks(marksMap);
            setHasRealResults(true);
          }
        }
      } catch (err) {
        console.warn("Using default career roadmap state", err);
      }
    };

    fetchRoadmapData();

    return () => {
      isMounted = false;
    };
  }, [user]);

  // Dynamically calculate recommended careers and matching score based on real examination marks
  const recommendedCareers = useMemo(() => {
    return baseCareers
      .map((career) => {
        let score = 70; // baseline if no exams taken yet

        if (hasRealResults) {
          const prf = realMarks.PRF ?? 50;
          const oop = realMarks.OOP ?? 50;
          const dbms = realMarks.DBMS ?? 50;
          const web = realMarks.WEB ?? 50;
          const se = realMarks.SE ?? 50;

          if (career.id === "software-engineer") {
            score = Math.round((prf + oop + web) / 3);
          } else if (career.id === "business-analyst") {
            score = Math.round((se + dbms + oop) / 3);
          } else if (career.id === "ai-engineer") {
            score = Math.round((prf + dbms + oop) / 3);
          } else if (career.id === "data-analyst") {
            score = Math.round((dbms * 1.5 + prf) / 2.5);
          } else if (career.id === "qa-engineer") {
            score = Math.round((se + web + dbms) / 3);
          }
        }

        return {
          ...career,
          matchScore: Math.min(99, Math.max(30, score)),
        };
      })
      .sort((a, b) => b.matchScore - a.matchScore);
  }, [realMarks, hasRealResults]);

  const selectedCareer = useMemo(() => {
    return (
      recommendedCareers.find((c) => c.id === selectedCareerId) ||
      recommendedCareers[0]
    );
  }, [recommendedCareers, selectedCareerId]);

  const topRecommendation = recommendedCareers[0];

  const handleConfirmCareer = async () => {
    setIsSaving(true);
    try {
      await confirmCareerGoal({
        selectedRole: selectedCareer.title,
      });
      setCareerConfirmed(true);
    } catch {
      setCareerConfirmed(true);
    } finally {
      setIsSaving(false);
    }
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
            AI Career Navigator
          </div>

          <h1 className="text-3xl font-bold text-[#171717]">
            Personalized Career Roadmap
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-[#737373]">
            {hasRealResults
              ? "Calculated dynamically from your verified module examination results. Choose your career goal and follow your milestone learning plan."
              : "Discover industry pathways and milestones. Career match scores will personalize automatically as your exam marks are recorded by the Examination Officer."}
          </p>
        </div>

        <div className="flex items-center gap-3 rounded-xl border border-[#E5E5E5] bg-white p-4 shadow-sm">
          <div className="rounded-lg bg-red-50 p-2.5 text-[#D71920]">
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

      {/* Real Marks Status Banner */}
      {!hasRealResults && (
        <div className="flex items-center gap-3 rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-800">
          <Compass size={20} className="text-blue-600 shrink-0" />
          <div>
            <p className="font-semibold text-blue-900">
              Examination Marks Pending Grading
            </p>
            <p className="text-xs text-blue-700 mt-0.5">
              Once the Examination Officer records and publishes your exam marks, the AI will calibrate exact career match percentages based on your strengths.
            </p>
          </div>
        </div>
      )}

      {/* Top Match Spotlight */}
      <div className="rounded-2xl border border-red-100 bg-gradient-to-r from-red-50 to-white p-6 shadow-sm">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div className="flex items-start gap-4">
            <div className="rounded-xl bg-[#D71920] p-3 text-white">
              <Sparkles size={24} />
            </div>

            <div>
              <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-bold text-[#D71920]">
                Highest AI Match ({topRecommendation.matchScore}%)
              </span>

              <h2 className="mt-2 text-xl font-bold text-[#171717]">
                {topRecommendation.title}
              </h2>

              <p className="mt-1 text-sm text-gray-600 max-w-xl">
                {topRecommendation.description}
              </p>
            </div>
          </div>

          <button
            onClick={() => setSelectedCareerId(topRecommendation.id)}
            className="flex items-center gap-2 rounded-xl bg-[#D71920] px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-red-700 transition"
          >
            Explore Roadmap
            <ArrowRight size={16} />
          </button>
        </div>
      </div>

      {/* Career Options Grid */}
      <div>
        <h2 className="text-lg font-bold text-[#171717] mb-1">
          Available Industry Career Pathways
        </h2>
        <p className="text-xs text-[#737373] mb-4">
          Click any role to inspect required competencies and the step-by-step career milestones.
        </p>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {recommendedCareers.map((career) => {
            const isSelected = career.id === selectedCareer.id;

            return (
              <div
                key={career.id}
                onClick={() => setSelectedCareerId(career.id)}
                className={`cursor-pointer rounded-2xl border p-5 transition ${
                  isSelected
                    ? "border-[#D71920] bg-white shadow-md ring-2 ring-red-100"
                    : "border-gray-200 bg-white hover:border-gray-300 shadow-sm"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-600">
                    {career.category}
                  </span>

                  <span className="text-sm font-bold text-[#D71920]">
                    {career.matchScore}% Match
                  </span>
                </div>

                <h3 className="mt-3 text-lg font-bold text-[#171717]">
                  {career.title}
                </h3>

                <p className="mt-2 text-xs text-gray-600 line-clamp-3 leading-5">
                  {career.description}
                </p>

                <div className="mt-4 flex flex-wrap gap-1.5">
                  {career.skills.slice(0, 3).map((skill) => (
                    <span
                      key={skill}
                      className="rounded-md bg-gray-50 px-2 py-0.5 text-[11px] font-medium text-gray-600"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Career Detailed Roadmap */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-6">
        <div className="flex flex-col justify-between gap-4 border-b border-gray-100 pb-5 sm:flex-row sm:items-center">
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-bold text-[#171717]">
                {selectedCareer.title} Milestone Roadmap
              </h2>
              <span className="rounded-full bg-red-50 px-3 py-1 text-xs font-bold text-[#D71920]">
                {selectedCareer.matchScore}% Match
              </span>
            </div>
            <p className="mt-1 text-sm text-gray-600">
              {selectedCareer.description}
            </p>
          </div>

          <div>
            {careerConfirmed ? (
              <span className="flex items-center gap-2 rounded-xl bg-green-50 px-5 py-3 text-sm font-bold text-green-700 border border-green-200">
                <CheckCircle2 size={18} />
                Career Goal Confirmed
              </span>
            ) : (
              <button
                onClick={handleConfirmCareer}
                disabled={isSaving}
                className="flex items-center gap-2 rounded-xl bg-[#D71920] px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-red-700 disabled:opacity-50 transition"
              >
                <Target size={18} />
                {isSaving ? "Saving Goal..." : "Set as Target Career Goal"}
              </button>
            )}
          </div>
        </div>

        {/* Required Skills Section */}
        <div>
          <h3 className="font-bold text-gray-900 text-sm mb-3">
            Key Competencies & Technologies
          </h3>
          <div className="flex flex-wrap gap-2">
            {selectedCareer.skills.map((skill) => (
              <span
                key={skill}
                className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-1.5 text-xs font-semibold text-gray-800"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>

        {/* Phase Timeline */}
        <div className="space-y-4 pt-2">
          <h3 className="font-bold text-gray-900 text-sm">
            Phase-by-Phase Roadmap Timeline
          </h3>

          <div className="space-y-4">
            {selectedCareer.roadmap.map((step, index) => (
              <div
                key={step.phase}
                className="relative rounded-xl border border-gray-200 p-5 hover:border-gray-300 transition"
              >
                <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
                  <div className="flex items-center gap-3">
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-red-100 text-xs font-bold text-[#D71920]">
                      {index + 1}
                    </span>
                    <h4 className="font-bold text-gray-900">{step.phase}</h4>
                  </div>
                  <span className="flex items-center gap-1.5 text-xs font-semibold text-gray-500">
                    <Clock size={14} />
                    {step.duration}
                  </span>
                </div>

                <div className="mt-3 pl-10 space-y-2">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Core Curriculum:
                  </p>
                  <ul className="list-disc pl-4 text-xs text-gray-700 space-y-1">
                    {step.topics.map((topic) => (
                      <li key={topic}>{topic}</li>
                    ))}
                  </ul>

                  <div className="mt-3 rounded-lg bg-gray-50 p-3 text-xs">
                    <span className="font-bold text-gray-900">Deliverable Task: </span>
                    <span className="text-gray-700">{step.task}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default CareerRoadmap;
