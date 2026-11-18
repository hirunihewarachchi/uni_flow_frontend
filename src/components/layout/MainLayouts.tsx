import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import { useAuth } from "../../hooks/UseAuth";
import { firstLoginPasswordChange } from "../../services/auth.service";
import { KeyRound, ShieldAlert } from "lucide-react";

function MainLayouts() {
  const { user, updateCurrentUser } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // First login password change modal state
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pwError, setPwError] = useState("");
  const [pwLoading, setPwLoading] = useState(false);

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwError("");

    if (!newPassword || newPassword.length < 6) {
      setPwError("New password must be at least 6 characters long.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPwError("Passwords do not match.");
      return;
    }

    try {
      setPwLoading(true);
      await firstLoginPasswordChange(newPassword);
      updateCurrentUser({ mustChangePassword: false });
    } catch (err: any) {
      setPwError(err.response?.data?.message || err.message || "Failed to update password");
    } finally {
      setPwLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#F5F5F5] font-sans text-[#171717]">
      {/* Sidebar with connected user session */}
      <Sidebar
        isAuthenticated={!!user}
        userRole={user?.normalizedRole || user?.role || null}
        userName={user ? `${user.firstName} ${user.lastName}` : "IJSE Member"}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main Section */}
      <div className="flex min-h-screen flex-1 flex-col transition-all duration-300 lg:ml-64">
        {/* Navbar */}
        <Navbar onToggleSidebar={() => setSidebarOpen((prev) => !prev)} />

        {/* Page Content */}
        <main className="mx-auto w-full max-w-[1600px] flex-1 px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
          <Outlet />
        </main>

        {/* Footer */}
        <footer className="border-t border-[#E5E5E5] bg-white px-4 py-4 sm:px-8 sm:py-5">
          <div className="flex flex-col items-center justify-between gap-2 sm:flex-row">
            <p className="text-xs text-[#737373]">
              © 2026 <span className="font-bold text-[#171717]">IJSE</span>.
              All rights reserved.
            </p>

            <p className="text-xs font-medium text-[#737373]">
              Sri Lanka's No. 1 Software Engineering Institute
            </p>
          </div>
        </footer>
      </div>

      {/* Mandatory First Login Password Change Modal */}
      {user?.mustChangePassword && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl border border-gray-100">
            <div className="flex items-center gap-3 text-[#D71920] mb-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                <KeyRound size={24} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">Change Temporary Password</h3>
                <p className="text-xs text-gray-500">Security requirement for first login</p>
              </div>
            </div>

            <p className="text-sm text-gray-600 mb-6">
              Welcome <span className="font-semibold text-gray-900">{user.firstName}</span>!
              Because this is your first time logging in with your generated institutional credentials, you must set a secure personal password.
            </p>

            {pwError && (
              <div className="mb-4 flex items-center gap-2 rounded-lg bg-red-50 p-3 text-xs text-red-600 border border-red-200">
                <ShieldAlert size={16} className="shrink-0" />
                <span>{pwError}</span>
              </div>
            )}

            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  New Password
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter at least 6 characters"
                  required
                  className="w-full rounded-lg border border-gray-300 p-2.5 text-sm focus:border-[#D71920] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                  required
                  className="w-full rounded-lg border border-gray-300 p-2.5 text-sm focus:border-[#D71920] focus:outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={pwLoading}
                className="w-full mt-4 flex items-center justify-center gap-2 rounded-lg bg-[#D71920] py-3 text-sm font-bold text-white hover:bg-red-700 transition disabled:opacity-50"
              >
                {pwLoading ? "Updating..." : "Set New Password & Continue"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default MainLayouts;
