"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { PhaseSelector } from "@/components/inspection/phase-selector";
import { Spinner } from "@/components/ui/spinner";
import { createClient } from "@/lib/supabase/client";
import type { Phase } from "@/types/database";

export default function NouvelleVisitePage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [phases, setPhases] = useState<Phase[]>([]);
  const [checklistCounts, setChecklistCounts] = useState<
    Record<string, number>
  >({});
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    async function load() {
      const supabase = createClient();

      const { data: phasesData } = await supabase
        .from("phase")
        .select("*")
        .order("numero");

      const { data: counts } = await supabase
        .from("checklist_item")
        .select("phase_id");

      setPhases(phasesData ?? []);

      const countMap: Record<string, number> = {};
      for (const row of counts ?? []) {
        countMap[row.phase_id] = (countMap[row.phase_id] ?? 0) + 1;
      }
      setChecklistCounts(countMap);
      setLoading(false);
    }
    load();
  }, []);

  async function handleSelect(phase: Phase) {
    if (creating) return;
    setCreating(true);

    const supabase = createClient();
    const { data: visite, error } = await supabase
      .from("visite")
      .insert({
        chantier_id: params.id,
        phase_id: phase.id,
        inspecteur_nom: "Inspecteur", // TODO: auth user
      })
      .select()
      .single();

    if (error || !visite) {
      setCreating(false);
      return;
    }

    router.push(`/chantiers/${params.id}/visites/${visite.id}`);
  }

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div>
      <a
        href={`/chantiers/${params.id}`}
        className="text-sm text-blue-600 mb-4 inline-block"
      >
        ← Retour au chantier
      </a>
      <h2 className="text-xl font-bold mb-4">Nouvelle inspection</h2>
      <PhaseSelector
        phases={phases}
        checklistCounts={checklistCounts}
        onSelect={handleSelect}
      />
      {creating && (
        <div className="flex items-center justify-center gap-2 mt-4 text-gray-500">
          <Spinner size="sm" />
          <span className="text-sm">Création de la visite...</span>
        </div>
      )}
    </div>
  );
}
