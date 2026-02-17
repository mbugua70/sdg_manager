import { Toaster } from "react-hot-toast";
import Sidebar from "@/components/Sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <Toaster
        position="top-right"
        toastOptions={{
          className:
            "!bg-white !text-zinc-900 !shadow-lg dark:!bg-zinc-800 dark:!text-zinc-100",
        }}
      />
      <Sidebar />
      <main className="lg:pl-64">
        <div className="mx-auto max-w-6xl px-4 py-8 pt-16 lg:px-8 lg:pt-8">
          {children}
        </div>
      </main>
    </div>
  );
}
