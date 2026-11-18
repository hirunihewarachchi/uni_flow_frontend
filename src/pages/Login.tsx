
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  GraduationCap,
  ArrowRight,
} from "lucide-react";

// API URL
const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:3000/api/v1";

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      // Correct login endpoint
      const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      // Safely read the response
      const responseText = await response.text();

      let data: any;

      try {
        data = responseText ? JSON.parse(responseText) : {};
      } catch {
        throw new Error(
          "Server returned an invalid response. Please check the backend."
        );
      }

      if (!response.ok) {
        throw new Error(
          data.message || "Invalid email or password."
        );
      }

      // Extract token and user
      const token =
        data.data?.token ||
        data.token ||
        data.accessToken;

      const user =
        data.data?.user ||
        data.user;

      if (!token) {
        throw new Error(
          data.message ||
          "Login response did not contain an authentication token."
        );
      }

      // Save authentication information
      localStorage.setItem("token", token);
      localStorage.setItem("ijse_token", token);

      if (user) {
        localStorage.setItem("user", JSON.stringify(user));
        localStorage.setItem("ijse_user", JSON.stringify(user));
      }

      // Remember Me
      if (rememberMe) {
        localStorage.setItem("rememberMe", "true");
      } else {
        localStorage.removeItem("rememberMe");
      }

      // Navigate to dashboard
      navigate("/dashboard");

    } catch (err) {
      console.error("Login error:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Login failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F5F5F5] p-4">
      <div className="grid w-full max-w-5xl overflow-hidden rounded-2xl bg-white shadow-xl md:grid-cols-2">

        {/* Left Side */}
        <div className="hidden flex-col justify-between bg-[#171717] p-10 text-white md:flex">
          <div>
            <h1 className="text-5xl font-black tracking-wider">
              UniFlow<span className="text-[#D71920]">.</span>
            </h1>

            <div className="mt-4 h-1 w-14 rounded-full bg-[#D71920]" />

            <p className="mt-3 text-xs font-medium tracking-wide text-gray-400">
              University Management System
            </p>
          </div>

          <div>
            <GraduationCap
              size={48}
              className="mb-6 text-[#D71920]"
            />

            <h2 className="text-3xl font-bold leading-tight">
              Welcome Back to UniFlow
            </h2>

            <p className="mt-4 text-sm leading-7 text-gray-400">
              Sign in to access your academic information,
              examination results, timetable, finance details
              and AI learning tools.
            </p>
          </div>

          <p className="text-xs text-gray-500">
            UniFlow - University Management System
          </p>
        </div>

        {/* Right Side */}
        <div className="p-7 sm:p-10">

          {/* Mobile Header */}
          <div className="mb-8 md:hidden">
            <h1 className="text-4xl font-black text-[#171717]">
              UniFlow<span className="text-[#D71920]">.</span>
            </h1>

            <p className="mt-2 text-xs font-medium text-gray-500">
              University Management System
            </p>
          </div>

          <p className="text-sm font-semibold text-[#D71920]">
            STUDENT PORTAL
          </p>

          <h2 className="mt-2 text-3xl font-bold text-gray-900">
            Sign In
          </h2>

          <p className="mt-2 text-sm text-gray-500">
            Enter your account details to continue.
          </p>

          {/* Login Form */}
          <form
            onSubmit={handleLogin}
            className="mt-8 space-y-5"
          >

            {/* Email */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Email Address
              </label>

              <div className="relative">
                <Mail
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  size={18}
                />

                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="w-full rounded-lg border border-gray-300 py-3 pl-10 pr-4 text-sm outline-none focus:border-[#D71920] focus:ring-2 focus:ring-red-100"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Password
              </label>

              <div className="relative">
                <LockKeyhole
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  size={18}
                />

                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full rounded-lg border border-gray-300 py-3 pl-10 pr-12 text-sm outline-none focus:border-[#D71920] focus:ring-2 focus:ring-red-100"
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowPassword(!showPassword)
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                >
                  {showPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>
              </div>
            </div>

            {/* Remember Me and Forgot Password */}
            <div className="flex items-center justify-between gap-3 text-sm">
              <label className="flex items-center gap-2 text-gray-600">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) =>
                    setRememberMe(e.target.checked)
                  }
                  className="accent-[#D71920]"
                />
                Remember me
              </label>

              <Link
                to="/forgot-password"
                className="font-semibold text-[#D71920] hover:underline"
              >
                Forgot Password?
              </Link>
            </div>

            {/* Error Message */}
            {error && (
              <p className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
                {error}
              </p>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#D71920] py-3.5 text-sm font-bold text-white transition hover:bg-red-700 disabled:opacity-60"
            >
              {loading ? "Signing in..." : "Sign In"}

              {!loading && <ArrowRight size={18} />}
            </button>
          </form>

          {/* Signup */}
          <div className="mt-8 border-t border-gray-100 pt-6 text-center">
            <p className="text-sm text-gray-500">
              Don't have an account?{" "}

              <Link
                to="/signup"
                className="font-bold text-[#D71920] hover:underline"
              >
                Create Account
              </Link>
            </p>
          </div>

          {/* Back to Website */}
          <Link
            to="/dashboard"
            className="mt-6 block text-center text-xs text-gray-400 hover:text-[#D71920]"
          >
            Back to UniFlow website
          </Link>

        </div>
      </div>
    </div>
  );
}

export default Login;
