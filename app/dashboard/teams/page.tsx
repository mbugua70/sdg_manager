"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { type ColumnDef } from "@tanstack/react-table";
import { Pencil, Trash2, Plus, ArrowLeft, ImageIcon } from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";
import DataTable from "@/components/DataTable";
import Modal from "@/components/Modal";
import ConfirmDialog from "@/components/ConfirmDialog";

interface Team {
  id: string;
  team_name: string;
  logo_url: string | null;
  created_at: string;
}

function TeamsPageContent() {
  const [data, setData] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<Team | null>(null);
  const [deleteItem, setDeleteItem] = useState<Team | null>(null);
  const [confirmSave, setConfirmSave] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [teamName, setTeamName] = useState("");
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch("/api/teams");
      const json = await res.json();
      setData(json);
    } catch {
      toast.error("Failed to load teams");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const openAddModal = () => {
    setEditItem(null);
    setTeamName("");
    setLogoFile(null);
    setLogoPreview(null);
    setModalOpen(true);
  };

  const openEditModal = (item: Team) => {
    setEditItem(item);
    setTeamName(item.team_name);
    setLogoFile(null);
    setLogoPreview(item.logo_url);
    setModalOpen(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setLogoFile(file);
    if (file) {
      setLogoPreview(URL.createObjectURL(file));
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setModalOpen(false);
    setConfirmSave(true);
  };

  const handleSaveConfirmed = async () => {
    setSaving(true);
    try {
      const method = "POST";
      const fd = new FormData();
      if (editItem) fd.append("id", editItem.id);
      fd.append("team_name", teamName);
      if (logoFile) fd.append("logo", logoFile);

      const res = await fetch("/api/teams", { method, body: fd });
      if (!res.ok) throw new Error();

      toast.success(editItem ? "Team updated" : "Team created");
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
      const res = await fetch("/api/teams", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: parseInt(deleteItem.id) }),
      });
      if (!res.ok) throw new Error();
      toast.success("Team deleted");
      setDeleteItem(null);
      fetchData();
    } catch {
      toast.error("Failed to delete team");
    } finally {
      setDeleting(false);
    }
  };

  const columns: ColumnDef<Team, unknown>[] = [
    {
      id: "logo",
      header: "Logo",
      cell: ({ row }) =>
        row.original.logo_url ? (
          <img
            src={row.original.logo_url}
            alt={row.original.team_name}
            className="h-9 w-9 rounded-full object-cover"
          />
        ) : (
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800">
            <ImageIcon className="h-4 w-4 text-zinc-400" />
          </div>
        ),
    },
    {
      accessorKey: "team_name",
      header: "Team Name",
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
            onClick={() => openEditModal(row.original)}
            className="rounded-lg p-2 text-zinc-500 transition-colors hover:bg-amber-50 hover:text-amber-600 dark:hover:bg-amber-500/10 dark:hover:text-amber-400"
          >
            <Pencil className="h-4 w-4" />
          </button>
          <button
            onClick={() => setDeleteItem(row.original)}
            className="rounded-lg p-2 text-zinc-500 transition-colors hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-500/10 dark:hover:text-red-400"
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
              Teams
            </h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Manage team configurations
            </p>
          </div>
        </div>
        <button
          onClick={openAddModal}
          className="inline-flex items-center gap-2 rounded-lg bg-amber-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-amber-700"
        >
          <Plus className="h-4 w-4" /> Add Team
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-3 border-zinc-200 border-t-amber-600" />
        </div>
      ) : (
        <DataTable data={data} columns={columns} searchPlaceholder="Search teams..." />
      )}

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editItem ? "Edit Team" : "Add New Team"}
      >
        <form onSubmit={handleFormSubmit} className="space-y-4">
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

          <div>
            <label className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Logo
            </label>
            {logoPreview && (
              <img
                src={logoPreview}
                alt="Logo preview"
                className="mb-2 h-16 w-16 rounded-full object-cover"
              />
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="w-full rounded-lg border border-zinc-200 bg-white px-4 py-2 text-sm text-zinc-900 outline-none transition-colors focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 file:mr-3 file:rounded-md file:border-0 file:bg-amber-50 file:px-3 file:py-1 file:text-xs file:font-medium file:text-amber-700 dark:file:bg-amber-500/10 dark:file:text-amber-400"
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
              className="rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-amber-700"
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
            ? `Are you sure you want to update "${teamName}"?`
            : `Are you sure you want to create team "${teamName}"?`
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
        title="Delete Team"
        message={`Are you sure you want to delete "${deleteItem?.team_name}"? This action cannot be undone.`}
        confirmLabel="Delete"
        loadingLabel="Deleting..."
        variant="danger"
        loading={deleting}
      />
    </div>
  );
}

export default function TeamsPage() {
  return <TeamsPageContent />;
}
