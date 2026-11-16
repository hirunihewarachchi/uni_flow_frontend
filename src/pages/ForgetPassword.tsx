import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Mail,
  ArrowLeft,
  LockKeyhole,
  GraduationCap,
  CheckCircle2,
  KeyRound,
  Eye,
  EyeOff,
  ShieldCheck,
  RotateCcw,
  Sparkles,
} from "lucide-react";
import { forgotPassword, resetPasswordWithCode } from "../services/auth.service";

type RecoveryStep = "REQUEST_CODE" | "ENTER_CODE" | "SUCCESS";

function ForgotPassword() {
  const navigate = useNavigate();

  const [step, setStep] = useState<RecoveryStep>("REQUEST_CODE");
  const [identifier, setIdentifier] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [maskedEmail, setMaskedEmail] = useState("");
  const [previewCode, setPreviewCode] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState("");
  const [infoMessage, setInfoMessage] = useState("");

  // Step 1: Request Recovery Code
  const handleRequestCode = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setInfoMessage("");
    setLoading(true);

    try {
      const res = await forgotPassword(identifier.trim());

      setMaskedEmail(res.realEmailMasked || res.realEmail || identifier);
      if (res.previewCode) {
        setPreviewCode(res.previewCode);
      }
      setStep("ENTER_CODE");
      setInfoMessage(
        res.message ||
          "A 6-digit recovery code has been sent to your registered email address."
      );
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Unable to send recovery code. Please check your email or ID."
      );
    } finally {
      setLoading(false);
    }
  };

  // Resend code handler
  const handleResendCode = async () => {
    setError("");
    setResending(true);
    try {
      const res = await forgotPassword(identifier.trim());
      if (res.previewCode) {
        setPreviewCode(res.previewCode);
      }
      setInfoMessage("A fresh recovery code has been sent to your email!");
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to resend recovery code."
      );
    } finally {
      setResending(false);
    }
  };

  // Step 2: Verify Recovery Code and Reset Password
  const handleResetPassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    if (code.trim().length !== 6) {
      setError("Please enter the complete 6-digit recovery code.");
      return;
    }

    if (newPassword.length < 6) {
      setError("New password must contain at least 6 characters.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      await resetPasswordWithCode(identifier.trim(), code.trim(), newPassword);
      setStep("SUCCESS");
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Password reset failed. Please ensure the code is correct."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F5F5F5] p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-7 shadow-xl sm:p-10">

        {/* IJSE Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-black text-[#171717]">
            IJSE<span className="text-[#D71920]">.</span>
          </h1>
          <div className="mx-auto mt-3 h-1 w-12 rounded-full bg-[#D71920]" />
        </div>

        {/* STEP 1: REQUEST CODE */}
        {step === "REQUEST_CODE" && (
          <>
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 text-[#D71920]">
              <LockKeyhole size={30} />
            </div>

            <h2 className="text-center text-2xl font-bold text-gray-900">
              Forgot Password?
            </h2>

            <p className="mt-2 text-center text-sm leading-6 text-gray-500">
              Enter your registered personal email address or your institutional
              login identifier (e.g.{" "}
              <code className="rounded bg-gray-100 px-1 py-0.5 text-xs text-red-600">
                name,batch@ijse.com
              </code>
              ). We will send a 6-digit recovery code to your real email address.
            </p>

            <form onSubmit={handleRequestCode} className="mt-7 space-y-5">
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Email or Login Identifier
                </label>
                <div className="relative">
                  <Mail
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    size={18}
                  />
                  <input
                    type="text"
                    required
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="e.g. hiruni,hdse75@ijse.com or student@gmail.com"
                    className="w-full rounded-lg border border-gray-300 py-3 pl-10 pr-4 text-sm outline-none focus:border-[#D71920] focus:ring-2 focus:ring-red-100"
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
                {loading ? "Sending Recovery Code..." : "Send Recovery Code"}
              </button>
            </form>
          </>
        )}

        {/* STEP 2: ENTER CODE & NEW PASSWORD */}
        {step === "ENTER_CODE" && (
          <>
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 text-[#D71920]">
              <KeyRound size={30} />
            </div>

            <h2 className="text-center text-2xl font-bold text-gray-900">
              Enter Recovery Code
            </h2>

            <p className="mt-2 text-center text-sm leading-6 text-gray-500">
              A 6-digit code has been sent to your registered email address:
              <br />
              <strong className="text-gray-800">{maskedEmail}</strong>
            </p>

            {/* Development helper banner when email server is local */}
            {previewCode && (
              <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles size={16} className="text-amber-600 shrink-0" />
                  <span>
                    Test Code: <strong>{previewCode}</strong>
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setCode(previewCode)}
                  className="rounded bg-amber-200 px-2 py-0.5 font-bold text-amber-900 hover:bg-amber-300"
                >
                  Auto-Fill
                </button>
              </div>
            )}

            {infoMessage && (
              <div className="mt-3 rounded-lg border border-green-200 bg-green-50 p-2.5 text-xs text-green-700">
                {infoMessage}
              </div>
            )}

            {error && (
              <p className="mt-3 rounded-lg bg-red-50 p-3 text-sm text-red-600">
                {error}
              </p>
            )}

            <form onSubmit={handleResetPassword} className="mt-6 space-y-4">
              <div>
                <label className="mb-1 block text-sm font-semibold text-gray-700">
                  6-Digit Recovery Code
                </label>
                <input
                  type="text"
                  required
                  maxLength={6}
                  value={code}
                  onChange={(e) =>
                    setCode(e.target.value.replace(/\D/g, "").slice(0, 6))
                  }
                  placeholder="123456"
                  className="w-full rounded-lg border border-gray-300 py-3 text-center text-2xl font-extrabold tracking-[0.4em] outline-none focus:border-[#D71920] focus:ring-2 focus:ring-red-100"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-semibold text-gray-700">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    minLength={6}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password (min. 6 chars)"
                    className="w-full rounded-lg border border-gray-300 py-2.5 pl-3 pr-10 text-sm outline-none focus:border-[#D71920] focus:ring-2 focus:ring-red-100"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="mb-1 block text-sm font-semibold text-gray-700">
                  Confirm New Password
                </label>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  minLength={6}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                  className="w-full rounded-lg border border-gray-300 py-2.5 px-3 text-sm outline-none focus:border-[#D71920] focus:ring-2 focus:ring-red-100"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-lg bg-[#D71920] py-3.5 text-sm font-bold text-white transition hover:bg-red-700 disabled:opacity-60"
              >
                {loading ? "Resetting Password..." : "Reset Password"}
              </button>

              <div className="flex items-center justify-between pt-2 text-xs">
                <button
                  type="button"
                  disabled={resending}
                  onClick={handleResendCode}
                  className="flex items-center gap-1 font-semibold text-[#D71920] hover:underline disabled:opacity-50"
                >
                  <RotateCcw size={13} />
                  {resending ? "Sending..." : "Resend Code"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setStep("REQUEST_CODE");
                    setCode("");
                    setError("");
                  }}
                  className="text-gray-500 hover:text-gray-800"
                >
                  Change Email / ID
                </button>
              </div>
            </form>
          </>
        )}

        {/* STEP 3: SUCCESS */}
        {step === "SUCCESS" && (
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-green-50 text-green-600">
              <CheckCircle2 size={36} />
            </div>

            <h2 className="text-2xl font-bold text-gray-900">
              Password Reset Complete!
            </h2>

            <p className="mt-3 text-sm leading-6 text-gray-600">
              Your password has been successfully updated. You can now use your
              new password to sign in to your IJSE UniFlow student account.
            </p>

            <button
              type="button"
              onClick={() => navigate("/login")}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-lg bg-[#D71920] py-3.5 text-sm font-bold text-white transition hover:bg-red-700"
            >
              <ShieldCheck size={18} />
              Sign In to Your Account
            </button>
          </div>
        )}

        {/* Back to Sign In Link */}
        {step !== "SUCCESS" && (
          <Link
            to="/login"
            className="mt-7 flex items-center justify-center gap-2 text-sm font-semibold text-gray-600 hover:text-[#D71920]"
          >
            <ArrowLeft size={17} />
            Back to Sign In
          </Link>
        )}

        <p className="mt-8 text-center text-xs text-gray-400">
          <GraduationCap size={15} className="mr-1 inline" />
          IJSE Student Portal
        </p>
      </div>
    </div>
  );
}

export default ForgotPassword;
