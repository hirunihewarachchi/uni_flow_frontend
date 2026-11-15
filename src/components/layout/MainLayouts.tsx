
import { Outlet } from "react-router-dom";

import Sidebar from "./Sidebar";
import Navbar from "./Navbar";

function MainLayouts() {
  return (
    <div className="flex min-h-screen bg-[#F5F5F5] font-sans text-[#171717]">

      {/* Sidebar */}
      <Sidebar />

      {/* Main Section */}
      <div className="ml-64 flex min-h-screen flex-1 flex-col">

        {/* Navbar */}
        <Navbar />

        {/* Page Content */}
        <main className="mx-auto w-full max-w-[1600px] flex-1 px-8 py-8">
          <Outlet />
        </main>

        {/* Footer */}
        <footer className="border-t border-[#E5E5E5] bg-white px-8 py-5">

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

    </div>
  );
}

export default MainLayouts;
