
import { useMemo, useState, useEffect } from "react";
import {
  BrainCircuit,
  BriefcaseBusiness,
  Target,
  TrendingUp,
  Sparkles,
  CheckCircle2,
  BookOpen,
  Code2,
  MessageSquare,
  Lightbulb,
  Clock,
  ArrowRight,
  GraduationCap,
  Award,
  Compass,
} from "lucide-react";
import { getCareerRoadmap, confirmCareerGoal } from "../services/ai.service";

type ModuleResult = {
  module: string;
  mark: number;
};

type Student = {
  id: string;
  name: string;
  batch: string;
  results: ModuleResult[];
};

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

const students: Student[] = [
  {
    id: "STU001",
    name: "Kamal",
    batch: "HDSE 75",
    results: [
      { module: "PRF", mark: 90 },
      { module: "OOP", mark: 75 },
      { module: "DBMS", mark: 40 },
      { module: "Web", mark: 82 },
      { module: "SE", mark: 78 },
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
      { module: "Web", mark: 45 },
      { module: "SE", mark: 48 },
    ],
  },
];

const careers: Career[] = [
  {
    id: "business-analyst",
    title: "Business Analyst",
    category: "Business & Analysis",
    description:
      "Understand business problems, communicate with stakeholders and translate business needs into software requirements.",
    skills: [
      "Business process analysis",
      "Requirement gathering",
      "SQL and database knowledge",
      "Documentation and UML",
      "Communication and presentation",
      "Critical thinking",
    ],
    roadmap: [
      {
        phase: "Phase 01 - Foundation",
        duration: "Weeks 1-3",
        topics: [
          "Understand software development life cycle",
          "Learn business analysis fundamentals",
          "Study requirement types",
        ],
        task: "Write a requirement document for a student management system.",
      },
      {
        phase: "Phase 02 - Technical Knowledge",
        duration: "Weeks 4-6",
        topics: [
          "SQL fundamentals and database relationships",
          "UML use case and activity diagrams",
          "Functional and non-functional requirements",
        ],
        task: "Create use case diagrams and SQL queries for a sample system.",
      },
      {
        phase: "Phase 03 - Practical Skills",
        duration: "Weeks 7-9",
        topics: [
          "Stakeholder communication",
          "Agile and Scrum",
          "User stories and acceptance criteria",
        ],
        task: "Prepare a complete business analysis document for a real-world problem.",
      },
    ],
  },
  {
    id: "ai-engineer",
    title: "AI Engineer",
    category: "Artificial Intelligence",
    description:
      "Build intelligent applications using data, machine learning, deep learning and modern AI technologies.",
    skills: [
      "Python programming",
      "Mathematics and statistics",
      "Data analysis",
      "Machine learning",
      "Deep learning",
      "Generative AI and LLMs",
      "Model integration and deployment",
    ],
    roadmap: [
      {
        phase: "Phase 01 - Programming & Mathematics",
        duration: "Weeks 1-4",
        topics: [
          "Python fundamentals and OOP",
          "NumPy and Pandas",
          "Statistics, probability and linear algebra",
        ],
        task: "Create a Python program that analyzes a student marks dataset.",
      },
      {
        phase: "Phase 02 - Data Analysis & Machine Learning",
        duration: "Weeks 5-8",
        topics: [
          "Data cleaning and visualization",
          "Exploratory data analysis",
          "Supervised and unsupervised learning",
          "Model evaluation",
        ],
        task: "Build a machine learning model that predicts student performance using sample data.",
      },
      {
        phase: "Phase 03 - Deep Learning & Generative AI",
        duration: "Weeks 9-12",
        topics: [
          "Neural networks",
          "Deep learning fundamentals",
          "Natural language processing",
          "Large language models and prompt engineering",
        ],
        task: "Build a simple AI assistant using a suitable model and sample learning data.",
      },
      {
        phase: "Phase 04 - AI Application Development",
        duration: "Weeks 13-16",
        topics: [
          "AI APIs and backend integration",
          "Model deployment",
          "Responsible AI and evaluation",
        ],
        task: "Develop and demonstrate an AI-powered application.",
      },
    ],
  },
  {
    id: "software-engineer",
    title: "Software Engineer",
    category: "Software Development",
    description:
      "Design, develop, test and maintain software applications using programming and engineering practices.",
    skills: [
      "Programming fundamentals",
      "Object-oriented programming",
      "Data structures and algorithms",
      "Database design and SQL",
      "Frontend and backend development",
      "Software testing and Git",
    ],
    roadmap: [
      {
        phase: "Phase 01 - Programming Foundation",
        duration: "Weeks 1-3",
        topics: [
          "Programming logic",
          "OOP and clean code",
          "Data structures and algorithms",
        ],
        task: "Build a console-based Java application using OOP.",
      },
      {
        phase: "Phase 02 - Full Stack Development",
        duration: "Weeks 4-8",
        topics: [
          "HTML, CSS and JavaScript",
          "React fundamentals",
          "Node.js and REST APIs",
          "SQL and MongoDB",
        ],
        task: "Develop a full-stack application with authentication and CRUD.",
      },
      {
        phase: "Phase 03 - Engineering Practices",
        duration: "Weeks 9-12",
        topics: [
          "Software architecture",
          "Unit and integration testing",
          "Git and teamwork",
          "Deployment fundamentals",
        ],
        task: "Complete and deploy a portfolio-quality software project.",
      },
    ],
  },
  {
    id: "data-analyst",
    title: "Data Analyst",
    category: "Data & Analytics",
    description:
      "Transform raw data into meaningful information using analysis, visualization and reporting.",
    skills: [
      "SQL",
      "Excel and spreadsheets",
      "Python for data analysis",
      "Statistics",
      "Data visualization",
      "Communication and reporting",
    ],
    roadmap: [
      {
        phase: "Phase 01 - Data Fundamentals",
        duration: "Weeks 1-3",
        topics: [
          "Data types and data quality",
          "Excel formulas and pivot tables",
          "SQL queries and filtering",
        ],
        task: "Analyze a sample sales dataset using SQL and Excel.",
      },
      {
        phase: "Phase 02 - Python & Statistics",
        duration: "Weeks 4-7",
        topics: [
          "Python basics",
          "Pandas and NumPy",
          "Descriptive statistics",
          "Data cleaning",
        ],
        task: "Clean and analyze a dataset using Python.",
      },
      {
        phase: "Phase 03 - Visualization",
        duration: "Weeks 8-10",
        topics: [
          "Charts and dashboards",
          "Power BI fundamentals",
          "Presenting data insights",
        ],
        task: "Create a dashboard and present three insights from your dataset.",
      },
    ],
  },
  {
    id: "qa-engineer",
    title: "QA Engineer",
    category: "Software Quality",
    description:
      "Ensure software quality by identifying defects, designing tests and validating application behavior.",
    skills: [
      "Testing fundamentals",
      "Test case design",
      "SQL basics",
      "API testing",
      "Automation testing",
      "Analytical thinking",
    ],
    roadmap: [
      {
        phase: "Phase 01 - Testing Foundation",
        duration: "Weeks 1-3",
        topics: [
          "Software testing life cycle",
          "Manual testing",
          "Test cases and bug reports",
        ],
        task: "Write test cases for a student login and registration system.",
      },
      {
        phase: "Phase 02 - Technical Testing",
        duration: "Weeks 4-7",
        topics: [
          "SQL for testers",
          "API testing",
          "Postman fundamentals",
          "Regression testing",
        ],
        task: "Test a REST API and document the results.",
      },
      {
        phase: "Phase 03 - Automation",
        duration: "Weeks 8-10",
        topics: [
          "Automation testing fundamentals",
          "Browser testing",
          "Test reporting",
        ],
        task: "Create an automated test suite for a sample web application.",
      },
    ],
  },
];

function CareerRoadmap() {
  const [studentId, setStudentId] = useState("STU002");
  const [selectedCareerId, setSelectedCareerId] = useState("business-analyst");
  const [careerConfirmed, setCareerConfirmed] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchRoadmap = async () => {
      try {
        const data = await getCareerRoadmap();
        if (data) {
          if (data.selectedCareerId) setSelectedCareerId(data.selectedCareerId);
          if (typeof data.careerConfirmed === "boolean") setCareerConfirmed(data.careerConfirmed);
        }
      } catch (err) {
        console.warn("Using default career roadmap state", err);
      }
    };

    fetchRoadmap();
  }, []);

  const student = students.find((item) => item.id === studentId)!;

  const average = Math.round(
    student.results.reduce((sum, item) => sum + item.mark, 0) /
      student.results.length
  );

  const recommendedCareers = useMemo(() => {
    const marks = Object.fromEntries(
      student.results.map((item) => [item.module, item.mark])
    );

    const scores: Record<string, number> = {
      "business-analyst":
        ((marks.SE || 0) + (marks.DBMS || 0) + (marks.OOP || 0)) / 3,
      "ai-engineer":
        ((marks.PRF || 0) + (marks.DBMS || 0) + (marks.OOP || 0)) / 3,
      "software-engineer":
        ((marks.PRF || 0) + (marks.OOP || 0) + (marks.Web || 0)) / 3,
      "data-analyst":
        ((marks.DBMS || 0) + (marks.PRF || 0)) / 2,
      "qa-engineer":
        ((marks.SE || 0) + (marks.Web || 0) + (marks.DBMS || 0)) / 3,
    };

    return [...careers]
      .map((career) => ({
        ...career,
        matchScore: Math.round(scores[career.id] || 0),
      }))
      .sort((a, b) => b.matchScore - a.matchScore);
  }, [student]);

  const selectedCareer = careers.find(
    (career) => career.id === selectedCareerId
  )!;

  const topRecommendation = recommendedCareers[0];

  const selectCareer = (careerId: string) => {
    setSelectedCareerId(careerId);
    setCareerConfirmed(false);
  };

  const handleConfirmCareer = async () => {
    setIsSaving(true);
    try {
      await confirmCareerGoal({
        selectedRole: selectedCareer.title,
      });
      setCareerConfirmed(true);
    } catch (err) {
      console.warn("Could not record goal to server, using local state", err);
      setCareerConfirmed(true);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl space-y-8">

      {/* Header */}
      <div className="flex flex-col justify-between gap-5 md:flex-row md:items-center">
        <div>
          <div className="mb-2 flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-[#D71920]">
            <BrainCircuit size={18} />
            AI Career Assistant
          </div>

          <h1 className="text-3xl font-bold text-[#171717]">
            Career Roadmap
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-[#737373]">
            Discover career opportunities based on your academic performance,
            choose your dream job and receive a personalized career development plan.
          </p>
        </div>

        <div className="flex items-center gap-3 rounded-xl border border-[#E5E5E5] bg-white p-3">
          <GraduationCap className="text-[#D71920]" size={25} />
          <div>
            <p className="text-xs text-[#737373]">Student Batch</p>
            <p className="text-sm font-bold text-[#171717]">{student.batch}</p>
          </div>
        </div>
      </div>

      {/* Student Selector */}
      <section className="flex flex-col gap-4 rounded-xl border border-[#E5E5E5] bg-white p-5 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="font-bold text-[#171717]">
            Student Academic Profile
          </h2>
          <p className="mt-1 text-xs text-[#737373]">
            Demonstration only: switch profiles to compare career suggestions.
          </p>
        </div>

        <select
          value={studentId}
          onChange={(e) => {
            setStudentId(e.target.value);
            setCareerConfirmed(false);
          }}
          className="rounded-lg border border-[#E5E5E5] bg-white px-4 py-3 text-sm outline-none focus:border-[#D71920]"
        >
          {students.map((item) => (
            <option key={item.id} value={item.id}>
              {item.name} - {item.id}
            </option>
          ))}
        </select>
      </section>

      {/* Student Summary */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
        <div className="rounded-xl border border-[#E5E5E5] bg-white p-5">
          <p className="text-xs text-[#737373]">Student</p>
          <h2 className="mt-2 text-xl font-bold text-[#171717]">
            {student.name}
          </h2>
          <p className="mt-1 text-xs text-[#737373]">{student.id}</p>
        </div>

        <div className="rounded-xl border border-[#E5E5E5] bg-white p-5">
          <p className="text-xs text-[#737373]">Academic Average</p>
          <h2 className="mt-2 text-3xl font-bold text-[#171717]">
            {average}%
          </h2>
          <p className="mt-1 text-xs text-[#737373]">
            Based on {student.results.length} modules
          </p>
        </div>

        <div className="rounded-xl border border-[#E5E5E5] bg-white p-5">
          <p className="text-xs text-[#737373]">Career Options</p>
          <h2 className="mt-2 text-3xl font-bold text-[#D71920]">
            {careers.length}
          </h2>
          <p className="mt-1 text-xs text-[#737373]">
            Available career pathways
          </p>
        </div>
      </div>

      {/* Exam Results */}
      <section className="rounded-xl border border-[#E5E5E5] bg-white p-6">
        <div className="mb-5 flex items-center gap-2">
          <TrendingUp size={21} className="text-[#D71920]" />
          <h2 className="text-lg font-bold text-[#171717]">
            Your Academic Performance
          </h2>
        </div>

        <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
          {student.results.map((result) => (
            <div key={result.module} className="rounded-lg bg-[#F8F8F8] p-4">
              <p className="text-xs text-[#737373]">{result.module}</p>
              <p className="mt-2 text-2xl font-bold text-[#171717]">
                {result.mark}
                <span className="text-xs font-medium text-[#737373]">/100</span>
              </p>
              <div className="mt-3 h-1.5 rounded-full bg-[#E5E5E5]">
                <div
                  className="h-1.5 rounded-full bg-[#D71920]"
                  style={{ width: `${result.mark}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* AI Recommendation */}
      <section className="overflow-hidden rounded-xl bg-[#171717] text-white">
        <div className="flex flex-col gap-5 p-6 md:flex-row md:items-start">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#D71920]">
            <Sparkles size={25} />
          </div>

          <div className="flex-1">
            <p className="text-xs font-bold uppercase tracking-widest text-red-300">
              AI Career Recommendation
            </p>
            <h2 className="mt-2 text-xl font-bold">
              {student.name}, explore your career opportunities
            </h2>
            <p className="mt-2 text-sm leading-6 text-gray-300">
              Based on the demonstration marks, your strongest matching
              academic areas suggest starting with{" "}
              <strong className="text-white">{topRecommendation.title}</strong>.
              This is a guidance suggestion, not a final decision or a guarantee
              of career suitability.
            </p>

            <div className="mt-5 flex flex-wrap items-center gap-3">
              <span className="rounded-lg bg-white/10 px-4 py-2 text-xs">
                Suggested career:{" "}
                <strong>{topRecommendation.title}</strong>
              </span>
              <span className="rounded-lg bg-white/10 px-4 py-2 text-xs">
                Academic match indicator:{" "}
                <strong>{topRecommendation.matchScore}%</strong>
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Career Choices */}
      <section>
        <div className="mb-5">
          <div className="flex items-center gap-2">
            <Compass size={22} className="text-[#D71920]" />
            <h2 className="text-xl font-bold text-[#171717]">
              Choose Your Desired Career
            </h2>
          </div>
          <p className="mt-2 text-sm text-[#737373]">
            The AI can suggest a career, but the final choice belongs to you.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {recommendedCareers.map((career, index) => {
            const selected = selectedCareerId === career.id;
            const recommended = index === 0;

            return (
              <button
                type="button"
                key={career.id}
                onClick={() => selectCareer(career.id)}
                className={`relative rounded-xl border bg-white p-5 text-left transition hover:-translate-y-0.5 hover:shadow-md ${
                  selected
                    ? "border-[#D71920] ring-2 ring-red-100"
                    : "border-[#E5E5E5]"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="rounded-lg bg-red-50 p-3 text-[#D71920]">
                    <BriefcaseBusiness size={22} />
                  </div>

                  {recommended && (
                    <span className="rounded-full bg-green-50 px-3 py-1 text-[10px] font-bold text-green-700">
                      AI SUGGESTED
                    </span>
                  )}

                  {selected && (
                    <CheckCircle2
                      size={20}
                      className="absolute right-4 top-14 text-[#D71920]"
                    />
                  )}
                </div>

                <h3 className="mt-4 font-bold text-[#171717]">
                  {career.title}
                </h3>
                <p className="mt-1 text-xs font-medium text-[#D71920]">
                  {career.category}
                </p>
                <p className="mt-3 min-h-12 text-xs leading-5 text-[#737373]">
                  {career.description}
                </p>

                <div className="mt-4 flex items-center justify-between border-t border-[#EEEEEE] pt-4">
                  <span className="text-xs text-[#737373]">
                    Academic match indicator
                  </span>
                  <strong className="text-sm text-[#171717]">
                    {career.matchScore}%
                  </strong>
                </div>

                <div className="mt-3 h-1.5 rounded-full bg-[#EEEEEE]">
                  <div
                    className="h-1.5 rounded-full bg-[#D71920]"
                    style={{ width: `${career.matchScore}%` }}
                  />
                </div>

                <p className="mt-4 flex items-center gap-2 text-xs font-bold text-[#D71920]">
                  {selected ? "Selected career" : "Choose this career"}
                  <ArrowRight size={15} />
                </p>
              </button>
            );
          })}
        </div>
      </section>

      {/* Selected Career Roadmap */}
      <section className="overflow-hidden rounded-xl border border-[#E5E5E5] bg-white">
        <div className="bg-[#171717] p-6 text-white">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-[#D71920] p-3">
              <Target size={23} />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-red-300">
                Your Selected Career
              </p>
              <h2 className="mt-1 text-2xl font-bold">
                {selectedCareer.title}
              </h2>
            </div>
          </div>

          <p className="mt-4 max-w-3xl text-sm leading-6 text-gray-300">
            {selectedCareer.description}
          </p>

          <button
            type="button"
            onClick={handleConfirmCareer}
            disabled={isSaving}
            className="mt-5 flex items-center gap-2 rounded-lg bg-[#D71920] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#B9151B] disabled:opacity-50"
          >
            {isSaving ? (
              <span>Saving...</span>
            ) : careerConfirmed ? (
              <>
                <CheckCircle2 size={17} />
                Career Goal Selected
              </>
            ) : (
              <>
                Confirm My Career Goal
                <ArrowRight size={17} />
              </>
            )}
          </button>

          {careerConfirmed && (
            <p className="mt-3 text-xs text-green-300">
              Your chosen career goal is confirmed in this UI demonstration.
            </p>
          )}
        </div>

        <div className="space-y-7 p-6">

          {/* Skills Required */}
          <div>
            <div className="mb-4 flex items-center gap-2">
              <Award size={21} className="text-[#D71920]" />
              <h3 className="font-bold text-[#171717]">
                Skills & Qualities You Need
              </h3>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {selectedCareer.skills.map((skill) => (
                <div
                  key={skill}
                  className="flex items-center gap-3 rounded-lg border border-[#EEEEEE] p-3"
                >
                  <CheckCircle2
                    size={17}
                    className="shrink-0 text-[#D71920]"
                  />
                  <span className="text-sm text-[#404040]">{skill}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Learning Phases */}
          <div className="border-t border-[#EEEEEE] pt-6">
            <div className="mb-5 flex items-center gap-2">
              <BookOpen size={21} className="text-[#D71920]" />
              <h3 className="font-bold text-[#171717]">
                Step-by-Step Career Development Roadmap
              </h3>
            </div>

            <div className="space-y-5">
              {selectedCareer.roadmap.map((phase, index) => (
                <div key={phase.phase} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-red-50 text-sm font-bold text-[#D71920]">
                      {index + 1}
                    </div>
                    {index !== selectedCareer.roadmap.length - 1 && (
                      <div className="mt-2 min-h-16 w-px flex-1 bg-[#E5E5E5]" />
                    )}
                  </div>

                  <div className="flex-1 rounded-xl border border-[#EEEEEE] p-5">
                    <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
                      <h4 className="font-bold text-[#171717]">
                        {phase.phase}
                      </h4>
                      <span className="flex items-center gap-1 text-xs text-[#737373]">
                        <Clock size={14} />
                        {phase.duration}
                      </span>
                    </div>

                    <ul className="mt-4 space-y-2">
                      {phase.topics.map((topic) => (
                        <li
                          key={topic}
                          className="flex items-start gap-2 text-sm text-[#525252]"
                        >
                          <CheckCircle2
                            size={16}
                            className="mt-0.5 shrink-0 text-green-600"
                          />
                          {topic}
                        </li>
                      ))}
                    </ul>

                    <div className="mt-4 rounded-lg bg-[#F8F8F8] p-4">
                      <p className="flex items-center gap-2 text-xs font-bold text-[#D71920]">
                        <Lightbulb size={15} />
                        Practical Assignment
                      </p>
                      <p className="mt-2 text-sm leading-5 text-[#525252]">
                        {phase.task}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Career Qualities */}
          <div className="grid grid-cols-1 gap-4 border-t border-[#EEEEEE] pt-6 md:grid-cols-2">
            <div className="rounded-xl bg-[#F8F8F8] p-5">
              <div className="flex items-center gap-2">
                <MessageSquare size={19} className="text-[#D71920]" />
                <h4 className="font-bold text-[#171717]">
                  Professional Qualities
                </h4>
              </div>
              <p className="mt-2 text-sm leading-6 text-[#737373]">
                Develop communication, teamwork, time management,
                adaptability and professional ethics alongside technical skills.
              </p>
            </div>

            <div className="rounded-xl bg-[#F8F8F8] p-5">
              <div className="flex items-center gap-2">
                <Code2 size={19} className="text-[#D71920]" />
                <h4 className="font-bold text-[#171717]">
                  Portfolio & Experience
                </h4>
              </div>
              <p className="mt-2 text-sm leading-6 text-[#737373]">
                Build practical projects, document your work, practise
                explaining your decisions and prepare for interviews.
              </p>
            </div>
          </div>

        </div>
      </section>

      {/* Final Note */}
      <div className="flex gap-3 rounded-xl border border-blue-100 bg-blue-50 p-4">
        <Lightbulb size={19} className="shrink-0 text-blue-600" />
        <p className="text-xs leading-5 text-blue-800">
          This is a UI demonstration using sample marks and predefined
          career roadmaps. Academic match indicators are illustrative,
          not validated predictions. Real recommendations should also
          consider student interests, goals, skills and career preferences.
          Students should always make their own final career decisions.
        </p>
      </div>

    </div>
  );
}

export default CareerRoadmap;
