
import { Bell, Search, UserCircle, ChevronDown } from "lucide-react";

function Navbar() {
  return (
    <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-[#E5E5E5] bg-white px-8">

      {/* Search */}
      <div className="flex w-80 items-center gap-3 rounded-lg border border-[#E5E5E5] bg-[#F5F5F5] px-4 py-2.5 transition focus-within:border-[#D71920] focus-within:bg-white">

        <Search
          size={19}
          className="text-[#737373]"
        />

        <input
          type="text"
          placeholder="Search anything..."
          className="w-full bg-transparent text-sm text-[#171717] outline-none placeholder:text-[#A3A3A3]"
        />

      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-6">

        {/* Notifications */}
        <button
          className="relative rounded-lg p-2 text-[#525252] transition hover:bg-[#D71920]/10 hover:text-[#D71920]"
          aria-label="Notifications"
        >
          <Bell size={21} />

          <span className="absolute right-1 top-1 h-2.5 w-2.5 rounded-full border-2 border-white bg-[#D71920]" />
        </button>

        <div className="h-9 w-px bg-[#E5E5E5]" />

        {/* User Profile */}
        <button className="flex items-center gap-3 rounded-lg px-2 py-2 transition hover:bg-[#F5F5F5]">

          <UserCircle
            size={38}
            className="text-[#D71920]"
          />

          <div className="text-left">
            <p className="text-sm font-bold text-[#171717]">
              Administrator
            </p>

            <p className="text-xs font-medium text-[#737373]">
              Super Admin
            </p>
          </div>

          <ChevronDown
            size={16}
            className="ml-1 text-[#737373]"
          />

        </button>

      </div>

    </header>
  );
}

export default Navbar;
