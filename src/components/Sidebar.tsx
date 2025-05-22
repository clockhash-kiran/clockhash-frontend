"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Folder,
  ShieldCheck,
  History,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Projects", href: "/dashboard/projects", icon: Folder },
  { label: "Scans", href: "/dashboard/scans", icon: ShieldCheck },
  { label: "History", href: "/dashboard/history", icon: History },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Handle screen resize
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth < 768) {
        setCollapsed(true);
      }
    };

    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  // Persist collapsed state in localStorage
  useEffect(() => {
    const savedCollapsed = localStorage.getItem("sidebarCollapsed");
    if (savedCollapsed !== null) {
      setCollapsed(JSON.parse(savedCollapsed));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("sidebarCollapsed", JSON.stringify(collapsed));
  }, [collapsed]);

  return (
    <aside
      className={`h-full bg-black border-r border-gray-800 transition-all duration-300 ${
        collapsed ? "w-16" : "w-64"
      } flex flex-col`}
    >
      {/* Collapse toggle button */}
      <div className="border-t border-gray-800 p-2">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="flex items-center justify-center w-full px-3 py-2 rounded-md text-gray-400 hover:bg-gray-800/50 hover:text-white transition-colors"
        >
          {collapsed ? (
            <ChevronRight size={18} />
          ) : (
            <>
              <ChevronLeft size={18} className="mr-2" />
              <span>Collapse</span>
            </>
          )}
        </button>
      </div>
      <div className="flex-1 overflow-y-auto scrollbar-hide">
        <nav className="mt-2 px-2">
          {navItems.map(({ label, href, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              prefetch={true}
              className={`flex items-center px-3 py-2 rounded-md my-1 group transition-colors
                ${
                  pathname === href
                    ? "bg-gray-800 text-white"
                    : "text-gray-400 hover:bg-gray-800/50 hover:text-white"
                }
              `}
            >
              <Icon className={`w-5 h-5 ${collapsed ? "mx-auto" : "mr-3"}`} />
              {!collapsed && <span>{label}</span>}

              {/* Tooltip for collapsed state */}
              {collapsed && (
                <div className="absolute left-16 scale-0 px-2 py-1 ml-4 text-xs text-white bg-gray-800 rounded-md group-hover:scale-100 transition-transform origin-left z-50">
                  {label}
                </div>
              )}
            </Link>
          ))}
        </nav>
      </div>
    </aside>
  );
}
