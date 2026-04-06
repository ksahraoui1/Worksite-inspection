"use client";

import { useState } from "react";
import { StopModal } from "@/components/stop-danger/stop-modal";

export function StopButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-20 right-4 sm:bottom-6 sm:right-6 z-50 w-14 h-14 bg-red-600 hover:bg-red-700 active:bg-red-800 text-white rounded-full shadow-lg shadow-red-600/30 flex items-center justify-center transition-colors"
        aria-label="STOP EN CAS DE DANGER"
      >
        <span className="text-2xl font-bold">!</span>
      </button>
      <StopModal open={open} onClose={() => setOpen(false)} />
    </>
  );
}
