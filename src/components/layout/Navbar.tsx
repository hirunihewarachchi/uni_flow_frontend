
import { useState, useEffect } from "react";
import {
  Bell,
  Search,
  UserCircle,
  ChevronDown,
  CheckCheck,
  LogOut,
  GraduationCap,
  X,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "../../hooks/UseAuth";
import {
  getMyNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from "../../services/notification.service";

interface NavbarProps {
  onSearch?: (term: string) => void;
}

function Navbar({ onSearch }: NavbarProps) {
  const { user, logout } = useAuth();

  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

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

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    onSearch?.(value);
  };

  return (
    <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-gray-200/80 bg-white/95 px-4 backdrop-blur-md sm:px-6 lg:px-8">
      {/* Search */}
      <div className="flex w-full max-w-md items-center gap-3 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 transition-all duration-200 focus-within:border-[#D71920] focus-within:bg-white focus-within:shadow-[0_0_0_3px_rgba(215,25,32,0.08)]">
        <Search size={19} className="shrink-0 text-gray-400" />

        <input
          type="text"
          value={searchTerm}
          placeholder="Search anything..."
          onChange={(e) => handleSearch(e.target.value)}
          className="w-full bg-transparent text-sm text-gray-800 outline-none placeholder:text-gray-400"
        />

        {searchTerm && (
          <button
            onClick={() => handleSearch("")}
            className="text-gray-400 transition hover:text-[#D71920]"
            aria-label="Clear search"
          >
            <X size={16} />
          </button>
        )}

        <span className="hidden rounded-md border border-gray-200 bg-white px-2 py-1 text-[10px] font-medium text-gray-400 sm:block">
          SEARCH
        </span>
      </div>

      {/* Right Actions */}
      <div className="ml-4 flex shrink-0 items-center gap-3 sm:gap-5">

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => {
              setShowNotifications(!showNotifications);
              setShowProfileMenu(false);
            }}
            className={`relative flex h-11 w-11 items-center justify-center rounded-xl transition-all duration-200 ${
              showNotifications
                ? "bg-red-50 text-[#D71920]"
                : "text-gray-500 hover:bg-gray-100 hover:text-[#D71920]"
            }`}
            aria-label="Notifications"
          >
            <Bell size={21} />

            {unreadCount > 0 && (
              <>
                <span className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full border-2 border-white bg-[#D71920]" />
                <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#D71920] px-1 text-[10px] font-bold text-white shadow-sm">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              </>
            )}
          </button>

          {/* Notifications Dropdown */}
          {showNotifications && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setShowNotifications(false)}
              />

              <div className="absolute right-0 z-50 mt-3 w-[min(360px,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-2xl">
                <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
                  <div>
                    <h4 className="text-sm font-extrabold text-gray-900">
                      Notifications
                    </h4>
                    <p className="mt-1 text-[11px] text-gray-400">
                      {unreadCount} unread notifications
                    </p>
                  </div>

                  {unreadCount > 0 && (
                    <button
                      onClick={handleMarkAllRead}
                      className="flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-xs font-semibold text-[#D71920] transition hover:bg-red-50"
                    >
                      <CheckCheck size={15} />
                      Mark all read
                    </button>
                  )}
                </div>

                <div className="max-h-80 space-y-1 overflow-y-auto p-3">
                  {notifications.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-10 text-center">
                      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-gray-50">
                        <Bell size={22} className="text-gray-300" />
                      </div>
                      <p className="text-sm font-semibold text-gray-600">
                        All caught up!
                      </p>
                      <p className="mt-1 text-xs text-gray-400">
                        No notifications right now.
                      </p>
                    </div>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n._id}
                        onClick={() => !n.isRead && handleMarkOne(n._id)}
                        className={`cursor-pointer rounded-xl p-3 transition ${
                          n.isRead
                            ? "hover:bg-gray-50"
                            : "border border-red-100 bg-red-50/70 hover:bg-red-50"
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div
                            className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                              n.isRead
                                ? "bg-gray-100 text-gray-500"
                                : "bg-white text-[#D71920]"
                            }`}
                          >
                            <Bell size={15} />
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="flex items-start justify-between gap-2">
                              <p className="text-xs font-bold text-gray-800">
                                {n.title}
                              </p>

                              {!n.isRead && (
                                <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-[#D71920]" />
                              )}
                            </div>

                            <p className="mt-1 text-xs leading-5 text-gray-500">
                              {n.message}
                            </p>

                            <span className="mt-2 block text-[10px] text-gray-400">
                              {new Date(n.createdAt).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <div className="border-t border-gray-100 bg-gray-50 px-5 py-3">
                  <p className="text-center text-[10px] font-medium text-gray-400">
                    UniFlow Notification Center
                  </p>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Divider */}
        <div className="hidden h-9 w-px bg-gray-200 sm:block" />

        {/* User Profile */}
        {user ? (
          <div className="relative">
            <button
              onClick={() => {
                setShowProfileMenu(!showProfileMenu);
                setShowNotifications(false);
              }}
              className={`flex items-center gap-2 rounded-xl p-2 transition-all duration-200 sm:gap-3 ${
                showProfileMenu
                  ? "bg-gray-100"
                  : "hover:bg-gray-50"
              }`}
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#D71920] to-[#990F16] text-white shadow-sm">
                {user.firstName ? (
                  <span className="text-sm font-extrabold">
                    {user.firstName.charAt(0).toUpperCase()}
                  </span>
                ) : (
                  <UserCircle size={25} />
                )}
              </div>

              <div className="hidden text-left sm:block">
                <p className="max-w-36 truncate text-sm font-bold text-gray-800">
                  {user.firstName} {user.lastName}
                </p>
                <p className="mt-0.5 text-[11px] font-medium text-gray-400">
                  {user.institutionalId || user.role}
                </p>
              </div>

              <ChevronDown
                size={16}
                className={`hidden text-gray-400 transition-transform sm:block ${
                  showProfileMenu ? "rotate-180" : ""
                }`}
              />
            </button>

            {/* Profile Dropdown */}
            {showProfileMenu && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowProfileMenu(false)}
                />

                <div className="absolute right-0 z-50 mt-3 w-64 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-2xl">
                  <div className="bg-[#171717] p-5 text-white">
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#D71920]">
                        <GraduationCap size={24} />
                      </div>

                      <div className="min-w-0">
                        <p className="truncate text-sm font-bold">
                          {user.firstName} {user.lastName}
                        </p>
                        <p className="mt-1 text-[10px] font-medium uppercase tracking-wider text-gray-400">
                          {user.role}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="border-b border-gray-100 px-4 py-3">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                      Logged in as
                    </p>
                    <p className="mt-1 truncate text-xs font-semibold text-gray-700">
                      {user.email}
                    </p>
                  </div>

                  <div className="p-2">
                    <button
                      onClick={() => {
                        setShowProfileMenu(false);
                        logout();
                      }}
                      className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-xs font-bold text-red-600 transition hover:bg-red-50"
                    >
                      <LogOut size={17} />
                      Sign Out
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        ) : (
          <Link
            to="/login"
            className="flex items-center gap-2 rounded-xl bg-[#D71920] px-5 py-3 text-xs font-bold text-white shadow-sm transition hover:bg-red-700 hover:shadow-md"
          >
            Sign In
          </Link>
        )}
      </div>
    </header>
  );
}

export default Navbar;
