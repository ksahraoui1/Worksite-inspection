"use client";

import { useSync } from "@/hooks/use-sync";

export function SyncIndicator() {
  const { isOnline, pendingCount } = useSync();

  return (
    <div className="flex items-center gap-2">
      <div
        className={`w-2 h-2 rounded-full ${isOnline ? "bg-green-500" : "bg-red-500"}`}
        title={isOnline ? "En ligne" : "Hors ligne"}
      />
      {pendingCount > 0 && (
        <span className="text-xs text-gray-500">
          {pendingCount} en attente
        </span>
      )}
    </div>
  );
}
