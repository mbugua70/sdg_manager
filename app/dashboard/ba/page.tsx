"use client";

import { useCallback, useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { type ColumnDef } from "@tanstack/react-table";
import { Pencil, Trash2, Plus, ArrowLeft } from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";
import DataTable from "@/components/DataTable";
import Modal from "@/components/Modal";
import ConfirmDialog from "@/components/ConfirmDialog";

interface BA {
  id: string;
  username: string;
  full_name: string;
  created_at: string;
}

function BAPageContent() {
  const searchParams = useSearchParams();
  const [data, setData] = useState<BA[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<BA | null>(null);
  const [deleteItem, setDeleteItem] = useState<BA | null>(null);
  const [confirmSave, setConfirmSave] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [form, setForm] = useState({
    username: "",
    password: "",
    full_name: "",
  });

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch("/api/ba");
      const json = await res.json();
      setData(json);
    } catch {
      toast.error("Failed to load BAs");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (searchParams.get("action") === "add") {
      openAddModal();
    }
  }, [searchParams]);

  const openAddModal = () => {
    setEditItem(null);
    setForm({ username: "", password: "", full_name: "" });
    setModalOpen(true);
  };

  const openEditModal = (item: BA) => {
    setEditItem(item);
    setForm({ username: item.username, password: "", full_name: item.full_name });
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
      const body: Record<string, string> = editItem
        ? { id: editItem.id, username: form.username, full_name: form.full_name }
        : { ...form };

      if (form.password) {
        body.password = form.password;
      }

      const res = await fetch("/api/ba", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error();

      toast.success(editItem ? "BA updated" : "BA created");
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
      const res = await fetch("/api/ba", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: parseInt(deleteItem.id) }),
      });
      if (!res.ok) throw new Error();
      toast.success("BA deleted");
      setDeleteItem(null);
      fetchData();
    } catch {
      toast.error("Failed to delete BA");
    } finally {
      setDeleting(false);
    }
  };

  const columns: ColumnDef<BA, unknown>[] = [
    {
      accessorKey: "full_name",
      header: "Full Name",
      cell: (info) => (
        <span className="font-medium">{info.getValue() as string}</span>
      ),
    },
    {
      accessorKey: "username",
      header: "Username",
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
            className="rounded-lg p-2 text-zinc-500 transition-colors hover:bg-indigo-50 hover:text-indigo-600 dark:hover:bg-indigo-500/10 dark:hover:text-indigo-400"
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
              Business Associates
            </h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Manage BA accounts and credentials
            </p>
          </div>
        </div>
        <button
          onClick={openAddModal}
          className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-indigo-700"
        >
          <Plus className="h-4 w-4" /> Add BA
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-3 border-zinc-200 border-t-indigo-600" />
        </div>
      ) : (
        <DataTable data={data} columns={columns} searchPlaceholder="Search BAs..." />
      )}

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editItem ? "Edit BA" : "Add New BA"}
      >
        <form onSubmit={handleFormSubmit} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Full Name
            </label>
            <input
              type="text"
              value={form.full_name}
              onChange={(e) => setForm({ ...form, full_name: e.target.value })}
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
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
              required
              className="w-full rounded-lg border border-zinc-200 bg-white px-4 py-2.5 text-sm text-zinc-900 outline-none transition-colors focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Password {editItem && <span className="text-zinc-400">(leave blank to keep current)</span>}
            </label>
            <input
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required={!editItem}
              className="w-full rounded-lg border border-zinc-200 bg-white px-4 py-2.5 text-sm text-zinc-900 outline-none transition-colors focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
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
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-700"
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
            ? `Are you sure you want to update "${form.full_name}"?`
            : `Are you sure you want to create BA "${form.full_name}"?`
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
        title="Delete BA"
        message={`Are you sure you want to delete "${deleteItem?.full_name}"? This action cannot be undone.`}
        confirmLabel="Delete"
        loadingLabel="Deleting..."
        variant="danger"
        loading={deleting}
      />
    </div>
  );
}

export default function BAPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-3 border-zinc-200 border-t-indigo-600" />
        </div>
      }
    >
      <BAPageContent />
    </Suspense>
  );
}
