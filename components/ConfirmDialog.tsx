"use client";

import Modal from "./Modal";
import { AlertTriangle, Info } from "lucide-react";

type Variant = "danger" | "info";

interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  loading?: boolean;
  confirmLabel?: string;
  loadingLabel?: string;
  variant?: Variant;
}

const variantStyles: Record<
  Variant,
  { iconBg: string; iconColor: string; btnBg: string; btnHover: string }
> = {
  danger: {
    iconBg: "bg-red-100 dark:bg-red-900/30",
    iconColor: "text-red-600 dark:text-red-400",
    btnBg: "bg-red-600",
    btnHover: "hover:bg-red-700",
  },
  info: {
    iconBg: "bg-indigo-100 dark:bg-indigo-900/30",
    iconColor: "text-indigo-600 dark:text-indigo-400",
    btnBg: "bg-indigo-600",
    btnHover: "hover:bg-indigo-700",
  },
};

export default function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  message,
  loading,
  confirmLabel = "Delete",
  loadingLabel = "Deleting...",
  variant = "danger",
}: ConfirmDialogProps) {
  const styles = variantStyles[variant];
  const Icon = variant === "danger" ? AlertTriangle : Info;

  return (
    <Modal open={open} onClose={onClose} title={title}>
      <div className="mb-6 flex items-start gap-3">
        <div className={`rounded-full p-2 ${styles.iconBg}`}>
          <Icon className={`h-5 w-5 ${styles.iconColor}`} />
        </div>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">{message}</p>
      </div>
      <div className="flex justify-end gap-3">
        <button
          onClick={onClose}
          disabled={loading}
          className="rounded-lg border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          disabled={loading}
          className={`rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors disabled:opacity-50 ${styles.btnBg} ${styles.btnHover}`}
        >
          {loading ? loadingLabel : confirmLabel}
        </button>
      </div>
    </Modal>
  );
}
