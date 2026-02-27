"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { EcartList } from "@/components/ecart/ecart-list";
import type { EcartWithRelations, EcartStatut } from "@/types/database";

interface ChantierEcartsProps {
  ecarts: EcartWithRelations[];
}

export function ChantierEcarts({ ecarts }: ChantierEcartsProps) {
  const router = useRouter();

  const handleTransition = useCallback(
    async (ecartId: string, nouveauStatut: EcartStatut) => {
      const res = await fetch(`/api/ecarts/${ecartId}/transition`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nouveau_statut: nouveauStatut }),
      });

      if (res.ok) {
        router.refresh();
      }
    },
    [router]
  );

  const counts = {
    a_corriger: ecarts.filter((e) => e.statut === "a_corriger").length,
    stop_danger: ecarts.filter((e) => e.statut === "stop_danger").length,
    resolu: ecarts.filter((e) => e.statut === "resolu").length,
  };

  return (
    <div>
      {/* Compteurs */}
      <div className="flex gap-3 mb-4 text-sm">
        <span className="text-amber-700 font-medium">
          {counts.a_corriger} à corriger
        </span>
        <span className="text-red-700 font-medium">
          {counts.stop_danger} STOP
        </span>
        <span className="text-green-700 font-medium">
          {counts.resolu} résolu{counts.resolu > 1 ? "s" : ""}
        </span>
      </div>

      <EcartList ecarts={ecarts} onTransition={handleTransition} />
    </div>
  );
}
