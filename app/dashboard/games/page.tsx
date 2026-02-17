"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import { type ColumnDef } from "@tanstack/react-table";
import { Pencil, Trash2, Plus, ArrowLeft, Trophy, X } from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";
import DataTable from "@/components/DataTable";
import Modal from "@/components/Modal";
import ConfirmDialog from "@/components/ConfirmDialog";

interface Game {
  id: string;
  game_name: string;
  created_at: string;
}

interface GamePoint {
  point_id: string;
  team_id: string;
  team_name: string;
  player_id: string;
  username: string;
  full_name: string;
  points: string;
}

function PointsPanel({
  game,
  onClose,
}: {
  game: Game;
  onClose: () => void;
}) {
  const [points, setPoints] = useState<GamePoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [confirmPointEdit, setConfirmPointEdit] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const fetchPoints = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/points?game_id=${game.id}`);
      const json = await res.json();
      setPoints(json);
    } catch {
      toast.error("Failed to load points");
    } finally {
      setLoading(false);
    }
  }, [game.id]);

  useEffect(() => {
    fetchPoints();
  }, [fetchPoints]);

  const startEdit = (point: GamePoint) => {
    setEditingId(point.point_id);
    setEditValue(point.points);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditValue("");
  };

  const requestSaveEdit = (pointId: string) => {
    setConfirmPointEdit(pointId);
  };

  const handleSaveConfirmed = async () => {
    if (!confirmPointEdit) return;
    setSaving(true);
    try {
      const res = await fetch("/api/points", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: parseInt(confirmPointEdit),
          points: parseInt(editValue),
        }),
      });
      if (!res.ok) throw new Error();
      toast.success("Points updated");
      setEditingId(null);
      setConfirmPointEdit(null);
      fetchPoints();
    } catch {
      toast.error("Failed to update points");
    } finally {
      setSaving(false);
    }
  };

  const editingPoint = points.find((p) => p.point_id === confirmPointEdit);

  const pointColumns: ColumnDef<GamePoint, unknown>[] = [
    {
      accessorKey: "team_name",
      header: "Team",
      cell: (info) => (
        <span className="font-medium">{info.getValue() as string}</span>
      ),
    },
    {
      accessorKey: "full_name",
      header: "Submitted By",
      cell: ({ row }) => (
        <div>
          <span className="text-zinc-700 dark:text-zinc-300">
            {row.original.full_name}
          </span>
          <span className="ml-1.5 text-xs text-zinc-400">
            ({row.original.username})
          </span>
        </div>
      ),
    },
    {
      accessorKey: "points",
      header: "Points",
      cell: ({ row }) => {
        const isEditing = editingId === row.original.point_id;
        if (isEditing) {
          return (
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                autoFocus
                className="w-20 rounded-md border border-emerald-300 bg-white px-2 py-1 text-sm text-zinc-900 outline-none focus:ring-2 focus:ring-emerald-500/20 dark:border-emerald-600 dark:bg-zinc-800 dark:text-zinc-100"
                onKeyDown={(e) => {
                  if (e.key === "Enter") requestSaveEdit(row.original.point_id);
                  if (e.key === "Escape") cancelEdit();
                }}
              />
              <button
                onClick={() => requestSaveEdit(row.original.point_id)}
                className="rounded-md bg-emerald-600 px-2 py-1 text-xs font-medium text-white transition-colors hover:bg-emerald-700"
              >
                Save
              </button>
              <button
                onClick={cancelEdit}
                className="rounded-md p-1 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          );
        }
        return (
          <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-0.5 text-sm font-semibold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">
            {row.original.points}
          </span>
        );
      },
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => {
        if (editingId === row.original.point_id) return null;
        return (
          <button
            onClick={() => startEdit(row.original)}
            className="rounded-lg p-2 text-zinc-500 transition-colors hover:bg-emerald-50 hover:text-emerald-600 dark:hover:bg-emerald-500/10 dark:hover:text-emerald-400"
            title="Edit points"
          >
            <Pencil className="h-4 w-4" />
          </button>
        );
      },
    },
  ];

  return (
    <div className="mt-6 rounded-2xl border border-emerald-200 bg-white p-6 dark:border-emerald-500/20 dark:bg-zinc-900">
      <div className="mb-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-emerald-50 p-2 dark:bg-emerald-500/10">
            <Trophy className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">
              Points — {game.game_name}
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Team performance and scores for this game
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="rounded-lg p-2 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800 dark:hover:text-zinc-300"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="h-7 w-7 animate-spin rounded-full border-3 border-zinc-200 border-t-emerald-600" />
        </div>
      ) : points.length === 0 ? (
        <div className="py-12 text-center text-sm text-zinc-500 dark:text-zinc-400">
          No points recorded for this game yet.
        </div>
      ) : (
        <DataTable
          data={points}
          columns={pointColumns}
          searchPlaceholder="Search teams or players..."
        />
      )}

      <ConfirmDialog
        open={!!confirmPointEdit}
        onClose={() => setConfirmPointEdit(null)}
        onConfirm={handleSaveConfirmed}
        title="Confirm Update Points"
        message={`Update points for "${editingPoint?.team_name}" to ${editValue}?`}
        confirmLabel="Update"
        loadingLabel="Updating..."
        variant="info"
        loading={saving}
      />
    </div>
  );
}

function GamesPageContent() {
  const [data, setData] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<Game | null>(null);
  const [deleteItem, setDeleteItem] = useState<Game | null>(null);
  const [confirmSave, setConfirmSave] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [gameName, setGameName] = useState("");
  const [viewPointsGame, setViewPointsGame] = useState<Game | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch("/api/games");
      const json = await res.json();
      setData(json);
    } catch {
      toast.error("Failed to load games");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const openAddModal = () => {
    setEditItem(null);
    setGameName("");
    setModalOpen(true);
  };

  const openEditModal = (item: Game) => {
    setEditItem(item);
    setGameName(item.game_name);
    setModalOpen(true);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setModalOpen(false);
    setConfirmSave(true);
  };

  const handleSaveConfirmed = async () => {
    setSaving(true);
    try {
      const method = editItem ? "PATCH" : "POST";
      const payload = editItem
        ? { id: editItem.id, game_name: gameName }
        : { game_name: gameName };

      const res = await fetch("/api/games", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error();

      toast.success(editItem ? "Game updated" : "Game created");
      setConfirmSave(false);
      fetchData();
    } catch {
      toast.error("Operation failed");
    } finally {
      setSaving(false);
    }
  };

  const handleSaveCancelled = () => {
    setConfirmSave(false);
    setModalOpen(true);
  };

  const handleDelete = async () => {
    if (!deleteItem) return;
    setDeleting(true);
    try {
      const res = await fetch("/api/games", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: parseInt(deleteItem.id) }),
      });
      if (!res.ok) throw new Error();
      toast.success("Game deleted");
      setDeleteItem(null);
      fetchData();
    } catch {
      toast.error("Failed to delete game");
    } finally {
      setDeleting(false);
    }
  };

  const columns: ColumnDef<Game, unknown>[] = [
    {
      accessorKey: "game_name",
      header: "Game Name",
      cell: (info) => (
        <span className="font-medium">{info.getValue() as string}</span>
      ),
    },
    {
      accessorKey: "created_at",
      header: "Created",
      cell: (info) => {
        const date = new Date(info.getValue() as string);
        return date.toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
        });
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <div className="flex gap-2">
          <button
            onClick={() => setViewPointsGame(row.original)}
            className="rounded-lg p-2 text-zinc-500 transition-colors hover:bg-purple-50 hover:text-purple-600 dark:hover:bg-purple-500/10 dark:hover:text-purple-400"
            title="View points"
          >
            <Trophy className="h-4 w-4" />
          </button>
          <button
            onClick={() => openEditModal(row.original)}
            className="rounded-lg p-2 text-zinc-500 transition-colors hover:bg-emerald-50 hover:text-emerald-600 dark:hover:bg-emerald-500/10 dark:hover:text-emerald-400"
            title="Edit game"
          >
            <Pencil className="h-4 w-4" />
          </button>
          <button
            onClick={() => setDeleteItem(row.original)}
            className="rounded-lg p-2 text-zinc-500 transition-colors hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-500/10 dark:hover:text-red-400"
            title="Delete game"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="rounded-lg p-2 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800 dark:hover:text-zinc-300"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">
              Games
            </h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Manage available games
            </p>
          </div>
        </div>
        <button
          onClick={openAddModal}
          className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-emerald-700"
        >
          <Plus className="h-4 w-4" /> Add Game
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-3 border-zinc-200 border-t-emerald-600" />
        </div>
      ) : (
        <DataTable
          data={data}
          columns={columns}
          searchPlaceholder="Search games..."
        />
      )}

      {viewPointsGame && (
        <PointsPanel
          game={viewPointsGame}
          onClose={() => setViewPointsGame(null)}
        />
      )}

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editItem ? "Edit Game" : "Add New Game"}
      >
        <form onSubmit={handleFormSubmit} className="space-y-4">
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
              onClick={() => setModalOpen(false)}
              className="rounded-lg border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-emerald-700"
            >
              {editItem ? "Update" : "Create"}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={confirmSave}
        onClose={handleSaveCancelled}
        onConfirm={handleSaveConfirmed}
        title={editItem ? "Confirm Update" : "Confirm Create"}
        message={
          editItem
            ? `Are you sure you want to update "${gameName}"?`
            : `Are you sure you want to create game "${gameName}"?`
        }
        confirmLabel={editItem ? "Update" : "Create"}
        loadingLabel={editItem ? "Updating..." : "Creating..."}
        variant="info"
        loading={saving}
      />

      <ConfirmDialog
        open={!!deleteItem}
        onClose={() => setDeleteItem(null)}
        onConfirm={handleDelete}
        title="Delete Game"
        message={`Are you sure you want to delete "${deleteItem?.game_name}"? This action cannot be undone.`}
        confirmLabel="Delete"
        loadingLabel="Deleting..."
        variant="danger"
        loading={deleting}
      />
    </div>
  );
}

export default function GamesPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-3 border-zinc-200 border-t-emerald-600" />
        </div>
      }
    >
      <GamesPageContent />
    </Suspense>
  );
}
