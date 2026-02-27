"use client";

import { useEffect, useState } from "react";
import { syncManager } from "@/lib/sync/sync-manager";
import { useOnlineStatus } from "@/hooks/use-online-status";

interface SyncState {
  pendingCount: number;
  lastSyncAt: Date | null;
  syncing: boolean;
}

export function useSync(): SyncState & { isOnline: boolean } {
  const isOnline = useOnlineStatus();
  const [state, setState] = useState<SyncState>({
    pendingCount: 0,
    lastSyncAt: null,
    syncing: false,
  });

  useEffect(() => {
    if (isOnline) {
      syncManager.start();
    } else {
      syncManager.stop();
    }

    const interval = setInterval(async () => {
      const count = await syncManager.getPendingCount();
      setState((prev) => ({ ...prev, pendingCount: count }));
    }, 5000);

    return () => {
      clearInterval(interval);
      syncManager.stop();
    };
  }, [isOnline]);

  return { ...state, isOnline };
}
