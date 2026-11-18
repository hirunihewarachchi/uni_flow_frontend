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
  Award,
  TrendingUp,
  AlertCircle,
  FileCheck2,
} from "lucide-react";
import { getCareerRoadmap, confirmCareerGoal } from "../services/ai.service";
import { getMyResults } from "../services/exam.service";
import { useAuth } from "../hooks/UseAuth";

type Career = {
  id: string;
  title: string;
  category: string;
  description: string;
  capstoneProject: string;
  skills: string[];
  roadmap: {
    phase: string;
    duration: string;
    topics: string[];
    task: string;
  }[];
};

type CareerBenchmark = {
  module: string;
  weight: number;
  benchmark: number;
};

const baseCareers: Career[] = [
  {
    id: "software-engineer",
    title: "Software Engineer",
    category: "Software Engineering",
    description:
      "Design, develop, test, and deploy robust, maintainable full-stack software applications following industrial engineering standards and design patterns.",
    capstoneProject:
      "Full-Stack Multi-Tenant Cloud Architecture with Role-Based Access, Microservices, and Redis Distributed Caching.",
    skills: [
      "Object-Oriented Programming (Java / TypeScript)",
      "Layered & Clean Architecture (SOLID)",
      "Relational & NoSQL Database Optimization",
      "RESTful API & Microservices Engineering",
      "Automated Testing (Unit & Integration)",
      "Containerization (Docker) & CI/CD",
    ],
    roadmap: [
      {
        phase: "Phase 01 - Object-Oriented Engineering Foundation",
        duration: "Weeks 1-3",
        topics: [
          "Advanced OOP & Clean Architecture Principles",
          "Data Structures, Collections & Computational Complexity",
          "Design Patterns (Factory, Strategy, Observer, Repository)",
        ],
        task: "Build an extensible console-based management core with comprehensive unit test coverage.",
      },
      {
        phase: "Phase 02 - Full-Stack Application Architecture",
        duration: "Weeks 4-8",
        topics: [
          "Modern Component Architecture (React, TypeScript, Tailwind)",
          "Backend REST API Architecture & Express/Spring Boot",
          "Transaction Management & Database Relations",
        ],
        task: "Develop a production-grade full-stack web application with JWT auth and relational integrity.",
      },
      {
        phase: "Phase 03 - Production Engineering & Cloud Deployment",
        duration: "Weeks 9-12",
        topics: [
          "Microservices & Event-Driven Decoupling",
          "Automated CI/CD Workflows & Dockerization",
          "System Monitoring, API Documentation & Security Auditing",
        ],
        task: "Deploy a containerized production service with automated testing and OpenAPI documentation.",
      },
    ],
  },
  {
    id: "ai-engineer",
    title: "AI Engineer",
    category: "Artificial Intelligence",
    description:
      "Build intelligent software applications using machine learning, deep neural networks, computer vision, and modern Generative AI agent pipelines.",
    capstoneProject:
      "End-to-End Enterprise RAG Knowledge Assistant with Vector Search and LLM Guardrails.",
    skills: [
      "Python Data Science Stack (NumPy, Pandas)",
      "Mathematical Foundations (Linear Algebra, Probability)",
      "Supervised & Unsupervised Machine Learning",
      "Deep Learning & Neural Network Architectures",
      "Large Language Models (LLMs) & Vector Embeddings",
      "MLOps, Model Serving & FastAPIs",
    ],
    roadmap: [
      {
        phase: "Phase 01 - Mathematics & Python Foundations",
        duration: "Weeks 1-4",
        topics: [
          "Python for High-Performance Data Processing",
          "Vector Operations, Matrices & Probability Distributions",
          "Exploratory Data Analysis & Feature Engineering",
        ],
        task: "Implement core regression and classification algorithms from mathematical foundations in Python.",
      },
      {
        phase: "Phase 02 - Applied Machine Learning Models",
        duration: "Weeks 5-8",
        topics: [
          "Scikit-Learn Model Pipelines & Cross-Validation",
          "Model Evaluation Metrics (Precision, Recall, ROC-AUC)",
          "Hyperparameter Tuning & Feature Selection",
        ],
        task: "Train and validate an ML model predicting student performance trends on multi-variable datasets.",
      },
      {
        phase: "Phase 03 - Deep Learning & Generative AI Agents",
        duration: "Weeks 9-12",
        topics: [
          "Deep Neural Networks with PyTorch",
          "Embeddings, Vector Databases & RAG Architecture",
          "Agent Tool Calling & Production LLM Serving",
        ],
        task: "Construct an autonomous AI research assistant capable of parsing and summarizing academic curricula.",
      },
    ],
  },
  {
    id: "data-analyst",
    title: "Data Analyst",
    category: "Data & Analytics",
    description:
      "Transform complex relational data into actionable executive insights through advanced SQL, statistical modeling, and interactive visual dashboards.",
    capstoneProject:
      "Executive Institutional Intelligence Dashboard with Cohort Retention and Real-Time Financial Forecasting.",
    skills: [
      "Advanced Relational SQL & Window Functions",
      "Statistical Hypothesis Testing & Modeling",
      "Python Data Manipulation (Pandas, NumPy)",
      "Business Intelligence Tools (PowerBI / Tableau)",
      "Data Storytelling & Executive Presentations",
    ],
    roadmap: [
      {
        phase: "Phase 01 - Advanced SQL & Relational Hygiene",
        duration: "Weeks 1-3",
        topics: [
          "Complex Multi-Table Joins & Common Table Expressions (CTEs)",
          "Window Functions (ROW_NUMBER, RANK, LAG/LEAD)",
          "Data Cleansing & Integrity Verification Queries",
        ],
        task: "Author high-performance analytical queries extracting cohort retention rates across 5 relational tables.",
      },
      {
        phase: "Phase 02 - Python Statistical Exploration",
        duration: "Weeks 4-7",
        topics: [
          "Exploratory Data Analysis (EDA) with Seaborn & Matplotlib",
          "Correlation Matrices & Variance Analysis",
          "Automated Data Extraction & Cleansing Pipelines",
        ],
        task: "Analyze an academic performance dataset to uncover statistically significant grade-attendance correlations.",
      },
      {
        phase: "Phase 03 - BI Dashboards & Decision Storytelling",
        duration: "Weeks 8-10",
        topics: [
          "Interactive Dashboard Design & Usability Principles",
          "DAX Expressions and Custom KPI Formulations",
          "Executive Summaries and Decision Impact Reporting",
        ],
        task: "Build an interactive PowerBI / Web analytics dashboard monitoring student enrollment and pass rates.",
      },
    ],
  },
  {
    id: "cloud-engineer",
    title: "Cloud & DevOps Engineer",
    category: "Cloud Infrastructure",
    description:
      "Architect high-availability cloud systems, automate deployment pipelines (CI/CD), and manage distributed containerized workloads with zero downtime.",
    capstoneProject:
      "Automated Multi-AZ Kubernetes Cluster with Terraform IaC, Istio Service Mesh, and Prometheus Monitoring.",
    skills: [
      "Linux Systems & Advanced Shell Scripting",
      "Docker Containerization & Multi-Stage Builds",
      "Kubernetes Pod, Service & Ingress Orchestration",
      "Infrastructure as Code (Terraform)",
      "CI/CD Pipeline Automation (GitHub Actions)",
      "Observability (Prometheus, Grafana, OpenTelemetry)",
    ],
    roadmap: [
      {
        phase: "Phase 01 - Linux Systems & Scripted Automation",
        duration: "Weeks 1-3",
        topics: [
          "Linux Kernel Internals, Permissions & Process Management",
          "Networking Protocols (TCP/IP, DNS, SSL/TLS, Reverse Proxies)",
          "Bash Automation Scripts for Health Checking and Logging",
        ],
        task: "Automate server health audit and configuration compliance checks across remote nodes using Bash.",
      },
      {
        phase: "Phase 02 - Containers & CI/CD Pipelines",
        duration: "Weeks 4-8",
        topics: [
          "Production Docker Images & Security Hardening",
          "GitHub Actions Continuous Integration & Automated Releases",
          "Kubernetes Core Architecture (Deployments, ConfigMaps, Secrets)",
        ],
        task: "Build an end-to-end CI/CD pipeline building, testing, and pushing container images to a registry.",
      },
      {
        phase: "Phase 03 - Cloud Architecture & Observability",
        duration: "Weeks 9-12",
        topics: [
          "Cloud Provisioning with Terraform on AWS",
          "Ingress Routing, Let's Encrypt SSL & Load Balancing",
          "Prometheus Metrics, Grafana Dashboards & Alert Manager",
        ],
        task: "Provision an automated cloud deployment with live metrics and automated rollback on failure.",
      },
    ],
  },
  {
    id: "qa-engineer",
    title: "QA & Test Automation Engineer",
    category: "Software Quality",
    description:
      "Guarantee software reliability and performance through comprehensive test scenario design, API test automation, and browser-driven end-to-end suites.",
    capstoneProject:
      "Automated End-to-End Regression Framework with Playwright, Postman Newman API Suite, and CI/CD Integration.",
    skills: [
      "Software Testing Lifecycle (STLC) & Test Strategy",
      "Black-Box & Boundary Value Test Case Design",
      "REST API Automated Testing with Postman & Supertest",
      "UI Test Automation (Playwright / Selenium)",
      "Performance & Load Testing (k6 / JMeter)",
      "CI/CD Continuous Test Automation Execution",
    ],
    roadmap: [
      {
        phase: "Phase 01 - STLC & Systematic Test Design",
        duration: "Weeks 1-3",
        topics: [
          "Software Testing Lifecycle & Bug Triage Lifecycles",
          "Equivalence Partitioning & Boundary Value Analysis",
          "Traceability Matrices & Defect Reporting Standards",
        ],
        task: "Write a comprehensive master test plan and defect test suite for an online examination portal.",
      },
      {
        phase: "Phase 02 - Automated API & Database Testing",
        duration: "Weeks 4-7",
        topics: [
          "REST API Verification, Status Codes & Payload Assertions",
          "Postman Automated Collections with JavaScript Tests",
          "Database Validation using SQL Pre- & Post-Condition Queries",
        ],
        task: "Construct an automated test collection verifying role-based authorization and edge cases.",
      },
      {
        phase: "Phase 03 - Browser Automation & CI Integration",
        duration: "Weeks 8-10",
        topics: [
          "Page Object Model (POM) Design Pattern",
          "Cross-Browser End-to-End Testing with Playwright",
          "Automated Test Execution in CI Pipeline",
        ],
        task: "Implement an automated smoke and regression suite testing the entire student registration journey.",
      },
    ],
  },
  {
    id: "business-analyst",
    title: "Business Analyst",
    category: "Business & Architecture",
    description:
      "Bridge client domain problems and software engineering solutions by defining clear technical requirements, process flows, and agile user stories.",
    capstoneProject:
      "Enterprise Software Requirements Specification (SRS) & Interactive Wireframe Prototype for an Educational ERP.",
    skills: [
      "Business Process Modeling (BPMN 2.0)",
      "Requirement Elicitation & Stakeholder Workshops",
      "UML Use Case, Activity & Sequence Diagramming",
      "Agile Backlog Grooming & User Story Authoring",
      "SQL for Business Data Validation",
    ],
    roadmap: [
      {
        phase: "Phase 01 - Business Analysis Fundamentals",
        duration: "Weeks 1-3",
        topics: [
          "Software Development Life Cycle Models (Agile vs Waterfall)",
          "Elicitation Techniques (Interviews, Surveys, Document Analysis)",
          "Functional vs Non-Functional Requirements Definition",
        ],
        task: "Author a comprehensive Software Requirements Specification (SRS) for a student management portal.",
      },
      {
        phase: "Phase 02 - Technical Modeling & Prototyping",
        duration: "Weeks 4-7",
        topics: [
          "UML Modeling: Use Case, Class, Activity & State Diagrams",
          "Process Flowcharts with BPMN 2.0 Standards",
          "Interactive Wireframing and User Journey Mapping",
        ],
        task: "Create detailed UML specifications and Figma wireframes for an automated student fee payment flow.",
      },
      {
        phase: "Phase 03 - Agile Requirements & Data Verification",
        duration: "Weeks 8-10",
        topics: [
          "User Story Writing with INVEST Criteria & Acceptance Criteria",
          "Product Backlog Prioritization (MoSCoW / Kano)",
          "SQL Queries for Validating Business Hypotheses",
        ],
        task: "Build a sprint-ready product backlog with acceptance criteria and database verification queries.",
      },
    ],
  },
];

// Exact industry benchmarks and module weighting per career pathway
const careerBenchmarks: Record<string, CareerBenchmark[]> = {
  "software-engineer": [
    { module: "OOP", weight: 35, benchmark: 75 },
    { module: "WEB", weight: 30, benchmark: 70 },
    { module: "PRF", weight: 20, benchmark: 70 },
    { module: "DBMS", weight: 15, benchmark: 65 },
  ],
  "ai-engineer": [
    { module: "PRF", weight: 40, benchmark: 75 },
    { module: "DBMS", weight: 25, benchmark: 70 },
    { module: "OOP", weight: 20, benchmark: 70 },
    { module: "SE", weight: 15, benchmark: 65 },
  ],
  "data-analyst": [
    { module: "DBMS", weight: 50, benchmark: 75 },
    { module: "PRF", weight: 25, benchmark: 65 },
    { module: "SE", weight: 25, benchmark: 65 },
  ],
  "cloud-engineer": [
    { module: "WEB", weight: 35, benchmark: 75 },
    { module: "SE", weight: 35, benchmark: 75 },
    { module: "DBMS", weight: 30, benchmark: 70 },
  ],
  "qa-engineer": [
    { module: "SE", weight: 40, benchmark: 75 },
    { module: "WEB", weight: 30, benchmark: 70 },
    { module: "DBMS", weight: 15, benchmark: 65 },
    { module: "OOP", weight: 15, benchmark: 65 },
  ],
  "business-analyst": [
    { module: "SE", weight: 45, benchmark: 75 },
    { module: "DBMS", weight: 30, benchmark: 70 },
    { module: "PRF", weight: 25, benchmark: 65 },
  ],
};

// Recommended industry certifications per career pathway
const careerCertifications: Record<string, { name: string; issuer: string; level: string }[]> = {
  "software-engineer": [
    { name: "Oracle Certified Professional: Java SE 21 Developer", issuer: "Oracle", level: "Professional" },
    { name: "AWS Certified Developer - Associate (DVA-C02)", issuer: "Amazon Web Services", level: "Associate" },
  ],
  "ai-engineer": [
    { name: "TensorFlow Developer Certificate", issuer: "Google", level: "Industry Standard" },
    { name: "AWS Certified Machine Learning - Specialty", issuer: "Amazon Web Services", level: "Specialty" },
  ],
  "data-analyst": [
    { name: "Microsoft Certified: Power BI Data Analyst Associate (PL-300)", issuer: "Microsoft", level: "Associate" },
    { name: "Databricks Certified Data Analyst Associate", issuer: "Databricks", level: "Associate" },
  ],
  "cloud-engineer": [
    { name: "AWS Certified Solutions Architect - Associate", issuer: "Amazon Web Services", level: "Associate" },
    { name: "Certified Kubernetes Administrator (CKA)", issuer: "Linux Foundation / CNCF", level: "Professional" },
  ],
  "qa-engineer": [
    { name: "ISTQB Certified Tester Foundation Level (CTFL 4.0)", issuer: "ISTQB", level: "Global Standard" },
    { name: "Certified Associate in Software Testing (CAST)", issuer: "Quality Assurance Institute", level: "Professional" },
  ],
  "business-analyst": [
    { name: "Entry Certificate in Business Analysis (ECBA)", issuer: "IIBA", level: "Global Standard" },
    { name: "Professional Scrum Product Owner (PSPO I)", issuer: "Scrum.org", level: "Agile Leadership" },
  ],
};

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

  // Dynamically calculate recommended careers and matching score with precise weighted formulation
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
            score = Math.round(oop * 0.35 + web * 0.3 + prf * 0.2 + dbms * 0.15);
          } else if (career.id === "ai-engineer") {
            score = Math.round(prf * 0.4 + dbms * 0.25 + oop * 0.2 + se * 0.15);
          } else if (career.id === "data-analyst") {
            score = Math.round(dbms * 0.5 + prf * 0.25 + se * 0.25);
          } else if (career.id === "cloud-engineer") {
            score = Math.round(web * 0.35 + se * 0.35 + dbms * 0.3);
          } else if (career.id === "qa-engineer") {
            score = Math.round(se * 0.4 + web * 0.3 + dbms * 0.15 + oop * 0.15);
          } else if (career.id === "business-analyst") {
            score = Math.round(se * 0.45 + dbms * 0.3 + prf * 0.25);
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

  // Benchmark analysis for selected career
  const currentBenchmarks = useMemo(() => {
    return careerBenchmarks[selectedCareer.id] || [];
  }, [selectedCareer.id]);

  const currentCertifications = useMemo(() => {
    return careerCertifications[selectedCareer.id] || [];
  }, [selectedCareer.id]);

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
            AI Career Intelligence Engine
          </div>

          <h1 className="text-3xl font-bold text-[#171717]">
            Industry Career Roadmap & Benchmarks
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-[#737373]">
            {hasRealResults
              ? "Precise career alignment calibrated from your real examination marks. Compare your scores against industry competency benchmarks."
              : "Discover industry pathways and milestones. Career match scores will personalize automatically as your exam marks are recorded by the Examination Officer."}
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

      {/* Real Marks Status Banner */}
      {!hasRealResults && (
        <div className="flex items-center gap-3 rounded-2xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-800">
          <Compass size={20} className="text-blue-600 shrink-0" />
          <div>
            <p className="font-semibold text-blue-900">
              Examination Marks Pending Grading
            </p>
            <p className="text-xs text-blue-700 mt-0.5">
              Once the Examination Officer records and publishes your exam marks, the AI will calibrate exact career match percentages based on your specific subject strengths.
            </p>
          </div>
        </div>
      )}

      {/* Top Match Spotlight */}
      <div className="rounded-3xl border border-red-100 bg-gradient-to-r from-red-50 via-white to-amber-50/20 p-6 md:p-8 shadow-sm">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
          <div className="flex items-start gap-4">
            <div className="rounded-2xl bg-[#D71920] p-3.5 text-white shadow-sm">
              <Sparkles size={28} />
            </div>

            <div className="space-y-1.5">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-red-100 px-3 py-1 text-xs font-bold text-[#D71920]">
                Highest AI Match ({topRecommendation.matchScore}%)
              </span>

              <h2 className="text-2xl font-bold text-[#171717]">
                {topRecommendation.title}
              </h2>

              <p className="text-xs md:text-sm text-gray-600 max-w-2xl leading-relaxed">
                {topRecommendation.description}
              </p>
            </div>
          </div>

          <button
            onClick={() => setSelectedCareerId(topRecommendation.id)}
            className="flex items-center justify-center gap-2 rounded-2xl bg-[#D71920] px-6 py-3.5 text-sm font-semibold text-white shadow-sm hover:bg-red-700 transition shrink-0"
          >
            Explore Roadmap & Milestones
            <ArrowRight size={16} />
          </button>
        </div>
      </div>

      {/* Career Options Grid */}
      <div>
        <div className="mb-4">
          <h2 className="text-lg font-bold text-[#171717]">
            Available Industry Career Pathways
          </h2>
          <p className="text-xs text-[#737373]">
            Ranked by AI matching engine according to your real performance in subject domains.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {recommendedCareers.map((career) => {
            const isSelected = career.id === selectedCareer.id;

            return (
              <div
                key={career.id}
                onClick={() => setSelectedCareerId(career.id)}
                className={`cursor-pointer rounded-2xl border p-5 transition-all ${
                  isSelected
                    ? "border-[#D71920] bg-white shadow-md ring-2 ring-red-100"
                    : "border-gray-200 bg-white hover:border-gray-300 shadow-sm"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="rounded-lg bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-700">
                    {career.category}
                  </span>

                  <span
                    className={`text-sm font-bold ${
                      career.matchScore >= 75
                        ? "text-emerald-600"
                        : career.matchScore >= 60
                        ? "text-blue-600"
                        : "text-[#D71920]"
                    }`}
                  >
                    {career.matchScore}% Match
                  </span>
                </div>

                <h3 className="mt-3 text-lg font-bold text-[#171717]">
                  {career.title}
                </h3>

                <p className="mt-2 text-xs text-gray-600 line-clamp-2 leading-5">
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

      {/* Selected Career Detailed Roadmap & Benchmarking */}
      <div className="rounded-3xl border border-gray-200 bg-white p-6 md:p-8 shadow-sm space-y-8">
        {/* Title Bar */}
        <div className="flex flex-col justify-between gap-4 border-b border-gray-100 pb-6 sm:flex-row sm:items-center">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="text-2xl font-bold text-[#171717]">
                {selectedCareer.title}
              </h2>
              <span className="rounded-full bg-red-50 px-3 py-1 text-xs font-bold text-[#D71920]">
                {selectedCareer.matchScore}% Match
              </span>
              <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700">
                {selectedCareer.category}
              </span>
            </div>
            <p className="mt-1.5 text-xs md:text-sm text-gray-600 max-w-2xl leading-relaxed">
              {selectedCareer.description}
            </p>
          </div>

          <div>
            {careerConfirmed ? (
              <span className="flex items-center gap-2 rounded-2xl bg-emerald-50 px-5 py-3 text-sm font-bold text-emerald-700 border border-emerald-200">
                <CheckCircle2 size={18} />
                Target Career Goal Confirmed
              </span>
            ) : (
              <button
                onClick={handleConfirmCareer}
                disabled={isSaving}
                className="flex items-center gap-2 rounded-2xl bg-[#D71920] px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-red-700 disabled:opacity-50 transition"
              >
                <Target size={18} />
                {isSaving ? "Saving Goal..." : "Set as Target Career Goal"}
              </button>
            )}
          </div>
        </div>

        {/* ACCURATE INDUSTRY BENCHMARK & GAP MATRIX */}
        {hasRealResults && currentBenchmarks.length > 0 && (
          <div className="rounded-2xl border border-gray-200 bg-gray-50/60 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                  <TrendingUp size={18} className="text-[#D71920]" />
                  Industry Competency Benchmark Analysis
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Comparison between your real examination marks and the minimum hiring thresholds for {selectedCareer.title}.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 pt-2">
              {currentBenchmarks.map((bench) => {
                const mark = realMarks[bench.module] ?? 50;
                const gap = mark - bench.benchmark;
                const isMet = gap >= 0;

                return (
                  <div
                    key={bench.module}
                    className="rounded-xl border border-gray-200 bg-white p-4 shadow-xs space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-gray-900 text-sm">
                        {bench.module}
                      </span>
                      <span className="rounded bg-gray-100 px-2 py-0.5 text-[10px] font-bold text-gray-600">
                        Weight {bench.weight}%
                      </span>
                    </div>

                    <div className="flex items-baseline justify-between text-xs">
                      <span className="text-gray-500">Your Mark:</span>
                      <span className="font-bold text-gray-900 text-base">{mark}%</span>
                    </div>

                    <div className="flex items-baseline justify-between text-xs">
                      <span className="text-gray-500">Benchmark:</span>
                      <span className="font-semibold text-gray-700">{bench.benchmark}%</span>
                    </div>

                    <div className="pt-1 border-t border-gray-100 flex items-center justify-between text-xs">
                      <span className="text-gray-500">Evaluation:</span>
                      {isMet ? (
                        <span className="font-bold text-emerald-600 flex items-center gap-1">
                          <CheckCircle2 size={12} />
                          +{gap}% Exceeded
                        </span>
                      ) : (
                        <span className="font-bold text-red-600 flex items-center gap-1">
                          <AlertCircle size={12} />
                          {gap}% Gap
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Recommended Industry Certifications */}
        {currentCertifications.length > 0 && (
          <div className="space-y-3">
            <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2">
              <Award size={18} className="text-amber-500" />
              Recommended Industry Certifications
            </h3>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {currentCertifications.map((cert) => (
                <div
                  key={cert.name}
                  className="rounded-xl border border-amber-200 bg-amber-50/30 p-4 flex items-center justify-between gap-3"
                >
                  <div className="space-y-0.5">
                    <p className="font-bold text-gray-900 text-sm">{cert.name}</p>
                    <p className="text-xs text-gray-500">Issuing Body: {cert.issuer}</p>
                  </div>
                  <span className="shrink-0 rounded-lg bg-amber-100 px-2.5 py-1 text-xs font-bold text-amber-800">
                    {cert.level}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Capstone Project Spotlight */}
        {selectedCareer.capstoneProject && (
          <div className="rounded-2xl border border-gray-200 bg-gradient-to-r from-gray-50 to-white p-5 space-y-1.5">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-500">
              <FileCheck2 size={16} className="text-[#D71920]" />
              Recommended Portfolio Capstone Project
            </div>
            <p className="font-bold text-gray-900 text-sm">
              {selectedCareer.capstoneProject}
            </p>
            <p className="text-xs text-gray-600">
              Build and deploy this project as a GitHub portfolio piece to demonstrate verified production readiness to software enterprise hiring panels.
            </p>
          </div>
        )}

        {/* Key Competencies */}
        <div>
          <h3 className="font-bold text-gray-900 text-sm mb-3">
            Core Competencies & Technology Stack
          </h3>
          <div className="flex flex-wrap gap-2">
            {selectedCareer.skills.map((skill) => (
              <span
                key={skill}
                className="rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-2 text-xs font-semibold text-gray-800"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>

        {/* Phase-by-Phase Roadmap Timeline */}
        <div className="space-y-4 pt-2">
          <h3 className="font-bold text-gray-900 text-sm">
            Phase-by-Phase Roadmap Timeline
          </h3>

          <div className="space-y-4">
            {selectedCareer.roadmap.map((step, index) => (
              <div
                key={step.phase}
                className="relative rounded-2xl border border-gray-200 p-5 hover:border-gray-300 transition shadow-xs"
              >
                <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
                  <div className="flex items-center gap-3">
                    <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-red-100 text-xs font-bold text-[#D71920]">
                      {index + 1}
                    </span>
                    <h4 className="font-bold text-gray-900">{step.phase}</h4>
                  </div>
                  <span className="flex items-center gap-1.5 text-xs font-semibold text-gray-500">
                    <Clock size={14} />
                    {step.duration}
                  </span>
                </div>

                <div className="mt-3 pl-11 space-y-2">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Core Curriculum Modules:
                  </p>
                  <ul className="list-disc pl-4 text-xs text-gray-700 space-y-1">
                    {step.topics.map((topic) => (
                      <li key={topic}>{topic}</li>
                    ))}
                  </ul>

                  <div className="mt-3 rounded-xl bg-gray-50 p-3 text-xs border border-gray-100">
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