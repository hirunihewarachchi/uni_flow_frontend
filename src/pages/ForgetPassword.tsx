
import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Mail,
  ArrowLeft,
  LockKeyhole,
  GraduationCap,
  CheckCircle2,
} from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to process your request.");
      }

      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Request failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F5F5F5] p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-7 shadow-xl sm:p-10">

        <div className="mb-8 text-center">
          <h1 className="text-4xl font-black text-[#171717]">
            IJSE<span className="text-[#D71920]">.</span>
          </h1>
          <div className="mx-auto mt-3 h-1 w-12 rounded-full bg-[#D71920]" />
        </div>

        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 text-[#D71920]">
          <LockKeyhole size={30} />
        </div>

        <h2 className="text-center text-2xl font-bold text-gray-900">
          Forgot Password?
        </h2>

        <p className="mt-2 text-center text-sm leading-6 text-gray-500">
          Enter the email address connected to your account. If the account
          exists, we will send password-reset instructions.
        </p>

        {success ? (
          <div className="mt-7 rounded-xl border border-green-200 bg-green-50 p-5 text-center">
            <CheckCircle2 size={30} className="mx-auto text-green-600" />
            <p className="mt-3 font-semibold text-green-800">
              Request submitted
            </p>
            <p className="mt-2 text-sm text-green-700">
              If an account matches that email, password-reset instructions
              will be sent.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-7 space-y-5">
            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your registered email"
                  className="w-full rounded-lg border border-gray-300 py-3 pl-10 pr-4 text-sm outline-none focus:border-[#D71920]"
                />
              </div>
            </div>

            {error && (
              <p className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-[#D71920] py-3.5 text-sm font-bold text-white transition hover:bg-red-700 disabled:opacity-60"
            >
              {loading ? "Sending Request..." : "Send Reset Instructions"}
            </button>
          </form>
        )}

        <Link
          to="/login"
          className="mt-7 flex items-center justify-center gap-2 text-sm font-semibold text-gray-600 hover:text-[#D71920]"
        >
          <ArrowLeft size={17} />
          Back to Sign In
        </Link>

        <p className="mt-8 text-center text-xs text-gray-400">
          <GraduationCap size={15} className="mr-1 inline" />
          IJSE Student Portal
        </p>
      </div>
    </div>
  );
}

export default ForgotPassword;
