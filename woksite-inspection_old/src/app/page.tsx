import { createClient } from "@/lib/supabase/server";
import { AlertesBanner } from "@/components/dashboard/alertes-banner";
import { ChantierCard } from "@/components/dashboard/chantier-card";
import { StopDangerList } from "@/components/dashboard/stop-danger-list";
import { Button } from "@/components/ui/button";
import type { ChantierWithEcartsEnRetard } from "@/types/database";

export default async function DashboardPage() {
  const supabase = await createClient();

  // Charger les chantiers actifs
  const { data: chantiers } = await supabase
    .from("chantier")
    .select("*")
    .is("deleted_at", null)
    .eq("statut", "actif")
    .order("created_at", { ascending: false });

  // Charger les écarts en retard par chantier
  const { data: ecartsEnRetard } = await supabase.rpc("get_ecarts_en_retard");

  // Charger les STOP Danger actifs (non résolus)
  const { data: stopDangerEcarts } = await supabase
    .from("ecart")
    .select("id, constat, created_at, chantier_id, chantier:chantier_id(nom)")
    .eq("statut", "stop_danger")
    .is("deleted_at", null)
    .order("created_at", { ascending: false });

  const stopDangerItems = (stopDangerEcarts ?? []).map((e: Record<string, unknown>) => {
    const chantier = e.chantier as Record<string, unknown> | null;
    return {
      id: e.id as string,
      constat: e.constat as string,
      created_at: e.created_at as string,
      chantier_nom: (chantier?.nom as string) ?? null,
      chantier_id: (e.chantier_id as string) ?? null,
    };
  });

  // Fusionner les données
  const ecartsMap = new Map<string, number>();
  if (ecartsEnRetard) {
    for (const row of ecartsEnRetard) {
      ecartsMap.set(row.chantier_id, row.count);
    }
  }

  const chantiersWithEcarts: ChantierWithEcartsEnRetard[] = (
    chantiers ?? []
  ).map((c) => ({
    ...c,
    ecarts_en_retard: ecartsMap.get(c.id) ?? 0,
  }));

  const totalEcartsEnRetard = chantiersWithEcarts.reduce(
    (sum, c) => sum + c.ecarts_en_retard,
    0
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">Chantiers actifs</h2>
        <a href="/chantiers/nouveau">
          <Button size="sm">+ Nouveau</Button>
        </a>
      </div>

      <StopDangerList ecarts={stopDangerItems} />
      <AlertesBanner totalEcartsEnRetard={totalEcartsEnRetard} />

      {chantiersWithEcarts.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <p className="text-lg mb-2">Aucun chantier actif</p>
          <p className="text-sm">
            Créez votre premier chantier pour commencer les inspections.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {chantiersWithEcarts.map((chantier) => (
            <ChantierCard key={chantier.id} chantier={chantier} />
          ))}
        </div>
      )}
    </div>
  );
}
