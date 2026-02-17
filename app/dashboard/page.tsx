"use client";

import { useState } from "react";
import Link from "next/link";
import { Users, Gamepad2, Shield, ArrowRight, Plus } from "lucide-react";
import toast from "react-hot-toast";
import Modal from "@/components/Modal";
import ConfirmDialog from "@/components/ConfirmDialog";

type ActiveModal = "ba" | "game" | "team" | null;

const cards = [
  {
    title: "BA",
    description: "Manage business associates, their accounts and credentials.",
    icon: Users,
    color: "indigo",
    manageHref: "/dashboard/ba",
    modalKey: "ba" as const,
  },
  {
    title: "Games",
    description: "Manage games available in the system.",
    icon: Gamepad2,
    color: "emerald",
    manageHref: "/dashboard/games",
    modalKey: "game" as const,
  },
  {
    title: "Teams",
    description: "Manage teams and their configurations.",
    icon: Shield,
    color: "amber",
    manageHref: "/dashboard/teams",
    modalKey: "team" as const,
  },
];

const colorMap: Record<string, { bg: string; icon: string; border: string; btn: string; input: string }> = {
  indigo: {
    bg: "bg-indigo-50 dark:bg-indigo-500/10",
    icon: "text-indigo-600 dark:text-indigo-400",
    border: "border-indigo-100 dark:border-indigo-500/20",
    btn: "bg-indigo-600 hover:bg-indigo-700 text-white",
    input: "focus:border-indigo-500 focus:ring-indigo-500/20",
  },
  emerald: {
    bg: "bg-emerald-50 dark:bg-emerald-500/10",
    icon: "text-emerald-600 dark:text-emerald-400",
    border: "border-emerald-100 dark:border-emerald-500/20",
    btn: "bg-emerald-600 hover:bg-emerald-700 text-white",
    input: "focus:border-emerald-500 focus:ring-emerald-500/20",
  },
  amber: {
    bg: "bg-amber-50 dark:bg-amber-500/10",
    icon: "text-amber-600 dark:text-amber-400",
    border: "border-amber-100 dark:border-amber-500/20",
    btn: "bg-amber-600 hover:bg-amber-700 text-white",
    input: "focus:border-amber-500 focus:ring-amber-500/20",
  },
};

export default function DashboardPage() {
  const [activeModal, setActiveModal] = useState<ActiveModal>(null);
  const [confirmSave, setConfirmSave] = useState(false);
  const [saving, setSaving] = useState(false);

  // BA form
  const [baForm, setBaForm] = useState({ username: "", password: "", full_name: "" });
  // Game form
  const [gameName, setGameName] = useState("");
  // Team form
  const [teamName, setTeamName] = useState("");

  const openModal = (key: ActiveModal) => {
    setBaForm({ username: "", password: "", full_name: "" });
    setGameName("");
    setTeamName("");
    setActiveModal(key);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setActiveModal(null);
    setConfirmSave(true);
  };

  const confirmLabel = () => {
    if (activeModal === "ba" || confirmSave) return "Create";
    return "Create";
  };

  const confirmMessage = () => {
    switch (pendingType) {
      case "ba": return `Are you sure you want to create BA "${baForm.full_name}"?`;
      case "game": return `Are you sure you want to create game "${gameName}"?`;
      case "team": return `Are you sure you want to create team "${teamName}"?`;
      default: return "";
    }
  };

  // Track which type we're confirming since activeModal gets cleared
  const [pendingType, setPendingType] = useState<ActiveModal>(null);

  const handleFormSubmitWithType = (e: React.FormEvent, type: ActiveModal) => {
    e.preventDefault();
    setPendingType(type);
    setActiveModal(null);
    setConfirmSave(true);
  };

  const handleSaveConfirmed = async () => {
    setSaving(true);
    try {
      let endpoint = "";
      let body = {};

      switch (pendingType) {
        case "ba":
          endpoint = "/api/ba";
          body = baForm;
          break;
        case "game":
          endpoint = "/api/games";
          body = { game_name: gameName };
          break;
        case "team":
          endpoint = "/api/teams";
          body = { team_name: teamName };
          break;
      }

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error();

      const labels = { ba: "BA", game: "Game", team: "Team" };
      toast.success(`${labels[pendingType!]} created`);
      setConfirmSave(false);
      setPendingType(null);
    } catch {
      toast.error("Failed to create. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleSaveCancelled = () => {
    setConfirmSave(false);
    setActiveModal(pendingType);
  };

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
              <div className={`mb-4 inline-flex rounded-xl ${colors.bg} p-3`}>
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
                <button
                  onClick={() => openModal(card.modalKey)}
                  className={`inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${colors.btn}`}
                >
                  <Plus className="h-4 w-4" /> Add New
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* BA Creation Modal */}
      <Modal
        open={activeModal === "ba"}
        onClose={() => setActiveModal(null)}
        title="Add New BA"
      >
        <form onSubmit={(e) => handleFormSubmitWithType(e, "ba")} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Full Name
            </label>
            <input
              type="text"
              value={baForm.full_name}
              onChange={(e) => setBaForm({ ...baForm, full_name: e.target.value })}
              required
              className="w-full rounded-lg border border-zinc-200 bg-white px-4 py-2.5 text-sm text-zinc-900 outline-none transition-colors focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Username / Email
            </label>
            <input
              type="text"
              value={baForm.username}
              onChange={(e) => setBaForm({ ...baForm, username: e.target.value })}
              required
              className="w-full rounded-lg border border-zinc-200 bg-white px-4 py-2.5 text-sm text-zinc-900 outline-none transition-colors focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Password
            </label>
            <input
              type="password"
              value={baForm.password}
              onChange={(e) => setBaForm({ ...baForm, password: e.target.value })}
              required
              className="w-full rounded-lg border border-zinc-200 bg-white px-4 py-2.5 text-sm text-zinc-900 outline-none transition-colors focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setActiveModal(null)}
              className="rounded-lg border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-700"
            >
              Create
            </button>
          </div>
        </form>
      </Modal>

      {/* Game Creation Modal */}
      <Modal
        open={activeModal === "game"}
        onClose={() => setActiveModal(null)}
        title="Add New Game"
      >
        <form onSubmit={(e) => handleFormSubmitWithType(e, "game")} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Game Name
            </label>
            <input
              type="text"
              value={gameName}
              onChange={(e) => setGameName(e.target.value)}
              required
              placeholder="e.g. Football"
              className="w-full rounded-lg border border-zinc-200 bg-white px-4 py-2.5 text-sm text-zinc-900 outline-none transition-colors focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setActiveModal(null)}
              className="rounded-lg border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-emerald-700"
            >
              Create
            </button>
          </div>
        </form>
      </Modal>

      {/* Team Creation Modal */}
      <Modal
        open={activeModal === "team"}
        onClose={() => setActiveModal(null)}
        title="Add New Team"
      >
        <form onSubmit={(e) => handleFormSubmitWithType(e, "team")} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Team Name
            </label>
            <input
              type="text"
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              required
              placeholder="e.g. Team Alpha"
              className="w-full rounded-lg border border-zinc-200 bg-white px-4 py-2.5 text-sm text-zinc-900 outline-none transition-colors focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setActiveModal(null)}
              className="rounded-lg border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-amber-700"
            >
              Create
            </button>
          </div>
        </form>
      </Modal>

      {/* Confirm Create Dialog */}
      <ConfirmDialog
        open={confirmSave}
        onClose={handleSaveCancelled}
        onConfirm={handleSaveConfirmed}
        title="Confirm Create"
        message={confirmMessage()}
        confirmLabel="Create"
        loadingLabel="Creating..."
        variant="info"
        loading={saving}
      />
    </div>
  );
}
