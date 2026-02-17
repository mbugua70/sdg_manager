"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Gamepad2,
  Shield,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/ba", label: "BA", icon: Users },
  { href: "/dashboard/games", label: "Games", icon: Gamepad2 },
  { href: "/dashboard/teams", label: "Teams", icon: Shield },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    toast.success("Logged out");
    router.push("/login");
  };

  const navContent = (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2 px-5 py-6">
        <div className="flex h-9 w-9 items-center justisfy-center  text-white font-bold text-sm">
          SDG
        </div>
        <span className="text-lg font-bold text-zinc-900 dark:text-white">
          Manager
        </span>
      </div>

      <nav className="flex-1 space-y-1 px-3">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/dashboard" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
                isActive
                  ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400"
                  : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
              }`}
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-zinc-200 p-3 dark:border-zinc-700">
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-zinc-600 transition-colors hover:bg-red-50 hover:text-red-600 dark:text-zinc-400 dark:hover:bg-red-500/10 dark:hover:text-red-400"
        >
          <LogOut className="h-5 w-5" />
          Logout
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setMobileOpen(true)}
        className="fixed left-4 top-4 z-40 rounded-lg border border-zinc-200 bg-white p-2 shadow-sm lg:hidden dark:border-zinc-700 dark:bg-zinc-900"
      >
        <Menu className="h-5 w-5 text-zinc-600 dark:text-zinc-300" />
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 transform border-r border-zinc-200 bg-white transition-transform duration-200 lg:hidden dark:border-zinc-800 dark:bg-zinc-900 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <button
          onClick={() => setMobileOpen(false)}
          className="absolute right-3 top-5 rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
        >
          <X className="h-5 w-5" />
        </button>
        {navContent}
      </aside>

      {/* Desktop sidebar */}
      <aside className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:block lg:w-64 lg:border-r lg:border-zinc-200 lg:bg-white dark:lg:border-zinc-800 dark:lg:bg-zinc-900">
        {navContent}
      </aside>
    </>
  );
}
