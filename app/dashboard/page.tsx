"use client";

import Link from "next/link";
import { Users, Gamepad2, Shield, ArrowRight, Plus } from "lucide-react";

const cards = [
  {
    title: "BA",
    description: "Manage business associates, their accounts and credentials.",
    icon: Users,
    color: "indigo",
    manageHref: "/dashboard/ba",
  },
  {
    title: "Games",
    description: "Manage games available in the system.",
    icon: Gamepad2,
    color: "emerald",
    manageHref: "/dashboard/games",
  },
  {
    title: "Teams",
    description: "Manage teams and their configurations.",
    icon: Shield,
    color: "amber",
    manageHref: "/dashboard/teams",
  },
];

const colorMap: Record<string, { bg: string; icon: string; border: string; btn: string }> = {
  indigo: {
    bg: "bg-indigo-50 dark:bg-indigo-500/10",
    icon: "text-indigo-600 dark:text-indigo-400",
    border: "border-indigo-100 dark:border-indigo-500/20",
    btn: "bg-indigo-600 hover:bg-indigo-700 text-white",
  },
  emerald: {
    bg: "bg-emerald-50 dark:bg-emerald-500/10",
    icon: "text-emerald-600 dark:text-emerald-400",
    border: "border-emerald-100 dark:border-emerald-500/20",
    btn: "bg-emerald-600 hover:bg-emerald-700 text-white",
  },
  amber: {
    bg: "bg-amber-50 dark:bg-amber-500/10",
    icon: "text-amber-600 dark:text-amber-400",
    border: "border-amber-100 dark:border-amber-500/20",
    btn: "bg-amber-600 hover:bg-amber-700 text-white",
  },
};

export default function DashboardPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">
          Dashboard
        </h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Manage your BAs, games, and teams from one place.
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((card) => {
          const colors = colorMap[card.color];
          return (
            <div
              key={card.title}
              className={`rounded-2xl border ${colors.border} bg-white p-6 shadow-sm transition-shadow hover:shadow-md dark:bg-zinc-900`}
            >
              <div
                className={`mb-4 inline-flex rounded-xl ${colors.bg} p-3`}
              >
                <card.icon className={`h-6 w-6 ${colors.icon}`} />
              </div>
              <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">
                {card.title}
              </h2>
              <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                {card.description}
              </p>
              <div className="mt-5 flex gap-3">
                <Link
                  href={card.manageHref}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
                >
                  Manage <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href={`${card.manageHref}?action=add`}
                  className={`inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${colors.btn}`}
                >
                  <Plus className="h-4 w-4" /> Add New
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
