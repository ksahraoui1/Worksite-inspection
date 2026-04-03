"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { EcartWithRelations, EcartStatut } from "@/types/database";
import { getAvailableTransitions } from "@/lib/utils/ecart-state";

interface EcartListProps {
  ecarts: EcartWithRelations[];
  onTransition: (ecartId: string, nouveauStatut: EcartStatut) => Promise<void>;
}

const statutBadge: Record<EcartStatut, { variant: "danger" | "warning" | "success"; label: string }> = {
  a_corriger: { variant: "warning", label: "À corriger" },
  stop_danger: { variant: "danger", label: "STOP Danger" },
  resolu: { variant: "success", label: "Résolu" },
};

const transitionLabels: Record<EcartStatut, string> = {
  a_corriger: "Dé-escalader",
  stop_danger: "Escalader STOP",
  resolu: "Résoudre",
};

export function EcartList({ ecarts, onTransition }: EcartListProps) {
  const [filterStatut, setFilterStatut] = useState<EcartStatut | "all">("all");
  const [filterEntreprise, setFilterEntreprise] = useState<string>("all");

  const entreprises = [
    ...new Set(ecarts.map((e) => e.entreprise?.nom).filter(Boolean)),
  ];

  const filtered = ecarts.filter((e) => {
    if (filterStatut !== "all" && e.statut !== filterStatut) return false;
    if (
      filterEntreprise !== "all" &&
      e.entreprise?.nom !== filterEntreprise
    )
      return false;
    return true;
  });

  const isOverdue = (ecart: EcartWithRelations) =>
    ecart.delai_resolution &&
    ecart.statut !== "resolu" &&
    new Date(ecart.delai_resolution) < new Date();

  return (
    <div>
      {/* Filtres */}
      <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
        <select
          value={filterStatut}
          onChange={(e) => setFilterStatut(e.target.value as EcartStatut | "all")}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm min-h-[44px]"
        >
          <option value="all">Tous les statuts</option>
          <option value="a_corriger">À corriger</option>
          <option value="stop_danger">STOP Danger</option>
          <option value="resolu">Résolu</option>
        </select>
        {entreprises.length > 0 && (
          <select
            value={filterEntreprise}
            onChange={(e) => setFilterEntreprise(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm min-h-[44px]"
          >
            <option value="all">Toutes entreprises</option>
            {entreprises.map((nom) => (
              <option key={nom} value={nom!}>
                {nom}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Liste */}
      {filtered.length === 0 ? (
        <p className="text-center py-8 text-gray-500 text-sm">
          Aucun écart correspondant
        </p>
      ) : (
        <div className="space-y-3">
          {filtered.map((ecart) => {
            const badge = statutBadge[ecart.statut as EcartStatut];
            const transitions = getAvailableTransitions(
              ecart.statut as EcartStatut
            );
            const overdue = isOverdue(ecart);

            return (
              <div
                key={ecart.id}
                className="border border-gray-200 rounded-xl p-4 bg-white"
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex gap-1.5 flex-wrap">
                    <Badge variant={badge.variant}>{badge.label}</Badge>
                    {overdue && (
                      <Badge variant="danger">
                        En retard
                      </Badge>
                    )}
                  </div>
                  {ecart.photo_url && (
                    <img
                      src={ecart.photo_url}
                      alt="Photo écart"
                      className="w-12 h-12 rounded-lg object-cover shrink-0"
                    />
                  )}
                </div>

                <p className="text-sm mb-1">{ecart.constat}</p>
                <p className="text-xs text-gray-500">
                  {ecart.checklist_item?.reference_legale} —{" "}
                  {ecart.entreprise?.nom ?? "Non assigné"}
                </p>
                {ecart.delai_resolution && (
                  <p
                    className={`text-xs mt-1 ${overdue ? "text-red-600 font-medium" : "text-gray-400"}`}
                  >
                    Délai :{" "}
                    {new Date(ecart.delai_resolution).toLocaleDateString(
                      "fr-CH"
                    )}
                  </p>
                )}

                {/* Boutons de transition */}
                {transitions.length > 0 && (
                  <div className="flex gap-2 mt-3">
                    {transitions.map((target) => (
                      <Button
                        key={target}
                        size="sm"
                        variant={target === "stop_danger" ? "danger" : target === "resolu" ? "primary" : "outline"}
                        onClick={() => onTransition(ecart.id, target)}
                      >
                        {transitionLabels[target]}
                      </Button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
