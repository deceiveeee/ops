import type { SyncStatus } from "@/lib/progress/store";

export function syncStatusText(status: SyncStatus): { label: string; dot: string } {
  switch (status) {
    case "synced":
      return { label: "Synced", dot: "h-1.5 w-1.5 rounded-full bg-emerald-400" };
    case "saving":
      return { label: "Saving…", dot: "h-1.5 w-1.5 rounded-full bg-amber-400" };
    case "offline":
      return { label: "Offline — saved locally", dot: "h-1.5 w-1.5 rounded-full bg-slate-400" };
    case "error":
      return { label: "Sync error", dot: "h-1.5 w-1.5 rounded-full bg-red-400" };
    default:
      return { label: "Synced", dot: "h-1.5 w-1.5 rounded-full bg-emerald-400" };
  }
}
