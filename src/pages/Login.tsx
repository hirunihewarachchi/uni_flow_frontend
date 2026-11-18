import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  GraduationCap,
  ArrowRight,
  ShieldCheck,
  CalendarDays,
  Award,
  BrainCircuit,
  AlertCircle,
  Sparkles,
} from "lucide-react";
import { useAuth } from "../hooks/UseAuth";

function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      const loggedInUser = await login(email, password);

      if (rememberMe) {
        localStorage.setItem("rememberMe", "true");
      } else {
        localStorage.removeItem("rememberMe");
      }

      // Role-based redirect
      const role = loggedInUser.normalizedRole;
      if (role === "ADMIN") {
        navigate("/admin");
      } else if (role === "EXAM") {
        navigate("/exam-timetable");
      } else if (role === "MARKETING") {
        navigate("/marketing");
      } else if (role === "ACADEMIC") {
        navigate("/academic");
      } else if (role === "FINANCE") {
        navigate("/finance-management");
      } else {
        navigate("/dashboard");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Invalid email or password. Please verify your credentials."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-100 via-gray-50 to-gray-200 p-4 sm:p-6 lg:p-8">
      {/* Ambient background decoration */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-32 -left-32 h-96 w-96 rounded-full bg-red-500/10 blur-3xl" />
        <div className="absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-red-600/10 blur-3xl" />
      </div>

      <div className="relative w-full max-w-5xl overflow-hidden rounded-3xl border border-white/80 bg-white/95 shadow-2xl backdrop-blur-xl transition-all md:grid md:grid-cols-2">
        {/* Left Side: Visual Branding Panel (Hidden on small mobile, visible on md+) */}
        <div className="relative hidden flex-col justify-between bg-gradient-to-br from-[#171717] via-[#1f1f1f] to-[#121212] p-8 lg:p-12 text-white md:flex">
          {/* Subtle pattern background */}
          <div className="absolute inset-0 bg-[radial-gradient(#ffffff0a_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />

          {/* Top Brand */}
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-gray-300">
              <Sparkles size={13} className="text-[#D71920]" />
              <span>Institute Academic Management</span>
            </div>

            <h1 className="mt-4 text-4xl font-black tracking-wider lg:text-5xl">
              UniFlow<span className="text-[#D71920]">.</span>
            </h1>

            <div className="mt-3 h-1 w-12 rounded-full bg-[#D71920]" />

            <p className="mt-3 text-xs font-medium tracking-wide text-gray-400">
              Institute of Java & Software Engineering (IJSE)
            </p>
          </div>

          {/* Middle Value Props */}
          <div className="relative z-10 my-8 space-y-5">
            <h2 className="text-2xl font-bold leading-snug lg:text-3xl">
              Comprehensive University Management Portal
            </h2>

            <p className="text-sm leading-relaxed text-gray-400">
              Access your real-time lecture timetable, verified examination grades,
              financial fee schedules, and AI-driven skill development roadmaps.
            </p>

            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-3 text-xs text-gray-300">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-500/10 text-[#D71920]">
                  <CalendarDays size={16} />
                </div>
                <span>Batch-Specific Lecture Timetables</span>
              </div>

              <div className="flex items-center gap-3 text-xs text-gray-300">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-500/10 text-[#D71920]">
                  <Award size={16} />
                </div>
                <span>Official Examination Results & Grading</span>
              </div>

              <div className="flex items-center gap-3 text-xs text-gray-300">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-500/10 text-[#D71920]">
                  <BrainCircuit size={16} />
                </div>
                <span>AI Skill Gap Analysis & Industry Pathways</span>
              </div>
            </div>
          </div>

          {/* Bottom Security Badge */}
          <div className="relative z-10 flex items-center justify-between border-t border-white/10 pt-4 text-[11px] text-gray-500">
            <div className="flex items-center gap-1.5 text-gray-400">
              <ShieldCheck size={15} className="text-[#D71920]" />
              <span>Secured Institutional Gateway</span>
            </div>
            <span>IJSE UniFlow v2.0</span>
          </div>
        </div>

        {/* Right Side: Authentication Form */}
        <div className="flex flex-col justify-between p-6 sm:p-10 lg:p-12">
          {/* Top Form Header */}
          <div>
            {/* Mobile Header Branding */}
            <div className="mb-6 md:hidden">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-black text-[#171717]">
                    UniFlow<span className="text-[#D71920]">.</span>
                  </h1>
                  <p className="text-xs font-semibold text-gray-500">
                    IJSE Academic Portal
                  </p>
                </div>
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-50 text-[#D71920]">
                  <GraduationCap size={24} />
                </div>
              </div>
            </div>

            <div className="inline-block rounded-full bg-red-50 px-3 py-1 text-xs font-bold uppercase tracking-wider text-[#D71920]">
              Sign In
            </div>

            <h2 className="mt-3 text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
              Welcome back
            </h2>

            <p className="mt-1.5 text-xs text-gray-500 sm:text-sm">
              Please enter your institutional credentials to access your portal.
            </p>

            {/* Error Banner */}
            {error && (
              <div className="mt-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50/90 p-4 text-xs sm:text-sm text-red-700">
                <AlertCircle size={18} className="mt-0.5 shrink-0 text-red-600" />
                <span className="leading-snug">{error}</span>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleLogin} className="mt-6 space-y-4 sm:space-y-5">
              {/* Email / Institutional Identifier */}
              <div>
                <label className="mb-1.5 block text-xs font-bold text-gray-700 uppercase tracking-wide">
                  Email or Institutional Identifier
                </label>

                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-400">
                    <Mail size={18} />
                  </div>

                  <input
                    type="text"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. hirunihdse75@ijse.com or student@gmail.com"
                    className="w-full rounded-xl border border-gray-300 bg-gray-50/50 py-3 pl-10 pr-4 text-sm font-medium text-gray-900 transition-all outline-none focus:border-[#D71920] focus:bg-white focus:ring-4 focus:ring-red-500/10 placeholder:text-gray-400"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="mb-1.5 block text-xs font-bold text-gray-700 uppercase tracking-wide">
                  Password
                </label>

                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-400">
                    <LockKeyhole size={18} />
                  </div>

                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your account password"
                    className="w-full rounded-xl border border-gray-300 bg-gray-50/50 py-3 pl-10 pr-12 text-sm font-medium text-gray-900 transition-all outline-none focus:border-[#D71920] focus:bg-white focus:ring-4 focus:ring-red-500/10 placeholder:text-gray-400"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-gray-400 transition hover:text-gray-700"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* Remember Me and Forgot Password */}
              <div className="flex items-center justify-between text-xs sm:text-sm">
                <label className="flex items-center gap-2 cursor-pointer select-none text-gray-600 hover:text-gray-900">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 accent-[#D71920] focus:ring-[#D71920]"
                  />
                  <span>Remember me</span>
                </label>

                <Link
                  to="/forgot-password"
                  className="font-semibold text-[#D71920] hover:underline"
                >
                  Forgot Password?
                </Link>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="group relative flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#D71920] to-[#b3141a] py-3.5 text-sm font-bold text-white shadow-lg shadow-red-600/20 transition-all duration-200 hover:from-[#c2141a] hover:to-[#991015] hover:shadow-red-600/30 active:scale-[0.99] disabled:opacity-60"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Signing in...
                  </span>
                ) : (
                  <>
                    <span>Sign in to UniFlow</span>
                    <ArrowRight size={17} className="transition-transform group-hover:translate-x-1" />
                  </>
                )}
              </button>
            </form>

            {/* Institutional Provisioning Notice (Replaces Create Account field) */}
            <div className="mt-8 rounded-xl border border-gray-200/80 bg-gray-50/80 p-4 text-center">
              <div className="flex items-center justify-center gap-1.5 text-xs font-semibold text-gray-700">
                <ShieldCheck size={16} className="text-[#D71920]" />
                <span>Institutional Registration Only</span>
              </div>
              <p className="mt-1 text-[11px] leading-relaxed text-gray-500">
                Accounts are officially created and enrolled by IJSE Academic & Marketing Departments.
                For enrollment queries, please contact your IJSE campus office.
              </p>
            </div>
          </div>

          {/* Bottom Back Link */}
          <div className="mt-8 border-t border-gray-100 pt-5 text-center">
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-1 text-xs font-semibold text-gray-400 transition hover:text-[#D71920]"
            >
              <span>← Back to UniFlow Public Portal</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
