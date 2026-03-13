"use client";

import { usePathname } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";

export default function Header() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user } = useAuth();
  const roleLabel = user?.role?.replace("_", " ").toUpperCase() ?? "ADMIN";

  
  const getPageTitle = () => {
    if (pathname === "/dashboard" || pathname === "/")
      return "Dashboard Overview";
    const segments = pathname.split("/").filter(Boolean);
    if (segments.length > 0) {
      const title = segments[0].replace("-", " ");
      return title.charAt(0).toUpperCase() + title.slice(1);
    }

    return "Admin Panel";
  };

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 sticky top-0 z-10 w-full">
      <div className="flex items-center gap-4">
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden text-gray-500 hover:text-gray-900"
        >
          <span className="text-lg font-bold">☰</span>
        </button>

        <h2 className="text-lg font-medium text-gray-900">{getPageTitle()}</h2>
      </div>

      <div className="flex items-center">
        <div className="px-3 py-1 bg-gray-100 rounded-md text-xs font-medium text-gray-600 tracking-wider">
          {roleLabel}
        </div>
      </div>
    </header>
  );
}
