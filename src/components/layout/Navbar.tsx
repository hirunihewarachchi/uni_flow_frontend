import { useState, useEffect } from "react";
import { Bell, Search, UserCircle, ChevronDown, CheckCheck } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "../../hooks/UseAuth";
import { getMyNotifications, markNotificationAsRead, markAllNotificationsAsRead } from "../../services/notification.service";

interface NavbarProps {
  onSearch?: (term: string) => void;
}

function Navbar({ onSearch }: NavbarProps) {
  const { user, logout } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  useEffect(() => {
    if (user) {
      getMyNotifications()
        .then((data) => {
          setNotifications(data.notifications || []);
          setUnreadCount(data.unreadCount || 0);
        })
        .catch(() => {});
    }
  }, [user]);

  const handleMarkAllRead = async () => {
    try {
      await markAllNotificationsAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (e) {}
  };

  const handleMarkOne = async (id: string) => {
    try {
      await markNotificationAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((c) => Math.max(0, c - 1));
    } catch (e) {}
  };

  return (
    <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-[#E5E5E5] bg-white px-8">
      {/* Search */}
      <div className="flex w-80 items-center gap-3 rounded-lg border border-[#E5E5E5] bg-[#F5F5F5] px-4 py-2.5 transition focus-within:border-[#D71920] focus-within:bg-white">
        <Search size={19} className="text-[#737373]" />
        <input
          type="text"
          placeholder="Search anything..."
          onChange={(e) => onSearch && onSearch(e.target.value)}
          className="w-full bg-transparent text-sm text-[#171717] outline-none placeholder:text-[#A3A3A3]"
        />
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-6">
        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative rounded-lg p-2 text-[#525252] transition hover:bg-[#D71920]/10 hover:text-[#D71920]"
            aria-label="Notifications"
          >
            <Bell size={21} />
            {unreadCount > 0 && (
              <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#D71920] text-[10px] font-bold text-white">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>

          {/* Notifications Dropdown */}
          {showNotifications && (
            <div className="absolute right-0 mt-3 w-80 sm:w-96 rounded-xl border border-gray-200 bg-white p-4 shadow-2xl z-50">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <h4 className="font-bold text-gray-900 text-sm">Notifications</h4>
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllRead}
                    className="flex items-center gap-1 text-xs text-[#D71920] hover:underline"
                  >
                    <CheckCheck size={14} /> Mark all read
                  </button>
                )}
              </div>

              <div className="mt-3 max-h-72 overflow-y-auto space-y-2">
                {notifications.length === 0 ? (
                  <p className="py-6 text-center text-xs text-gray-400">
                    No notifications right now
                  </p>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n._id}
                      onClick={() => !n.isRead && handleMarkOne(n._id)}
                      className={`cursor-pointer rounded-lg p-2.5 text-xs transition ${
                        n.isRead ? "bg-white text-gray-500" : "bg-red-50 text-gray-900 font-semibold border-l-2 border-[#D71920]"
                      }`}
                    >
                      <p className="font-bold text-gray-800">{n.title}</p>
                      <p className="mt-0.5 text-gray-600 font-normal">{n.message}</p>
                      <span className="mt-1 block text-[10px] text-gray-400">
                        {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        <div className="h-9 w-px bg-[#E5E5E5]" />

        {/* User Profile */}
        {user ? (
          <div className="relative">
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center gap-3 rounded-lg px-2 py-2 transition hover:bg-[#F5F5F5]"
            >
              <UserCircle size={38} className="text-[#D71920]" />
              <div className="text-left">
                <p className="text-sm font-bold text-[#171717]">
                  {user.firstName} {user.lastName}
                </p>
                <p className="text-xs font-medium text-[#737373]">
                  {user.institutionalId || user.role}
                </p>
              </div>
              <ChevronDown size={16} className="ml-1 text-[#737373]" />
            </button>

            {showProfileMenu && (
              <div className="absolute right-0 mt-2 w-48 rounded-xl border border-gray-100 bg-white py-2 shadow-xl z-50">
                <div className="px-4 py-2 border-b border-gray-100">
                  <p className="text-xs text-gray-500 font-medium">Logged in as</p>
                  <p className="text-xs font-bold text-gray-800 truncate">{user.email}</p>
                </div>
                <button
                  onClick={() => {
                    setShowProfileMenu(false);
                    logout();
                  }}
                  className="w-full text-left px-4 py-2 text-xs font-bold text-red-600 hover:bg-red-50"
                >
                  Sign Out
                </button>
              </div>
            )}
          </div>
        ) : (
          <Link
            to="/login"
            className="flex items-center gap-2 rounded-lg bg-[#D71920] px-4 py-2 text-xs font-bold text-white hover:bg-red-700 transition"
          >
            Sign In
          </Link>
        )}
      </div>
    </header>
  );
}

export default Navbar;
