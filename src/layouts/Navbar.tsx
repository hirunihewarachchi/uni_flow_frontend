
import { Bell, Search, UserCircle } from "lucide-react";

function Navbar() {
  return (
    <header className="flex h-20 items-center justify-between border-b border-gray-200 bg-white px-8">

      {/* Search */}
      <div className="flex w-80 items-center gap-3 rounded-lg bg-gray-100 px-4 py-2.5">
        <Search size={18} className="text-gray-400" />

        <input
          type="text"
          placeholder="Search anything..."
          className="w-full bg-transparent text-sm outline-none placeholder:text-gray-400"
        />
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-6">

        <button className="relative text-gray-500 hover:text-primary">
          <Bell size={21} />

          <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full border-2 border-white bg-primary" />
        </button>

        <div className="h-8 w-px bg-gray-200" />

        {/* User Profile */}
        <div className="flex items-center gap-3">
          <UserCircle size={38} className="text-gray-500" />

          <div>
            <p className="text-sm font-semibold text-dark">
              Administrator
            </p>

            <p className="text-xs text-gray-500">
              Super Admin
            </p>
          </div>
        </div>

      </div>
    </header>
  );
}

export default Navbar;
