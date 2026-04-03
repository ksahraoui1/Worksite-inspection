import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { TimelineVisites } from "@/components/chantier/timeline-visites";
import { ChantierEcarts } from "@/components/chantier/chantier-ecarts";
import { notFound } from "next/navigation";
import type { VisiteWithRelations, EcartWithRelations } from "@/types/database";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function ChantierDetailPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();

  // Charger le chantier
  const { data: chantier } = await supabase
    .from("chantier")
    .select("*")
    .eq("id", id)
    .is("deleted_at", null)
    .single();

  if (!chantier) notFound();

  // Charger les visites avec relations
  const { data: visites } = await supabase
    .from("visite")
    .select("*, phase(*), ecart(*), reponse_visite(*, checklist_item(*))")
    .eq("chantier_id", id)
    .is("deleted_at", null)
    .order("date_visite", { ascending: false });

  // Charger tous les écarts du chantier
  const visiteIds = (visites ?? []).map((v) => v.id);
  const { data: ecartsData } = visiteIds.length > 0
    ? await supabase
        .from("ecart")
        .select("*, checklist_item(*), entreprise(*)")
        .in("visite_id", visiteIds)
        .is("deleted_at", null)
        .order("created_at", { ascending: false })
    : { data: [] };

  const allEcarts = (ecartsData ?? []) as EcartWithRelations[];
  const ecartsActifs = allEcarts.filter((e) => e.statut !== "resolu").length;

  const dateDebut = new Date(chantier.date_debut).toLocaleDateString("fr-CH", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  return (
    <div>
      {/* En-tête chantier */}
      <div className="mb-6">
        <a href="/" className="text-sm text-blue-600 mb-2 inline-block">
          ← Retour au dashboard
        </a>
        <h2 className="text-xl font-bold">{chantier.nom}</h2>
        <p className="text-gray-500 text-sm mt-1">{chantier.adresse}</p>
      </div>

      {/* Infos chantier */}
      <Card className="mb-4">
        <CardContent>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-gray-500">Début</p>
              <p className="font-medium">{dateDebut}</p>
            </div>
            <div>
              <p className="text-gray-500">Fin prévue</p>
              <p className="font-medium">
                {chantier.date_fin_prevue
                  ? new Date(chantier.date_fin_prevue).toLocaleDateString(
                      "fr-CH"
                    )
                  : "—"}
              </p>
            </div>
            <div>
              <p className="text-gray-500">Responsable sécurité</p>
              <p className="font-medium">{chantier.responsable_securite}</p>
            </div>
            <div>
              <p className="text-gray-500">Statut</p>
              <Badge
                variant={chantier.statut === "actif" ? "success" : "muted"}
              >
                {chantier.statut === "actif" ? "Actif" : "Terminé"}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Résumé écarts */}
      {ecartsActifs > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-4">
          <p className="text-red-800 font-semibold text-sm">
            {ecartsActifs} écart{ecartsActifs > 1 ? "s" : ""} non
            résolu{ecartsActifs > 1 ? "s" : ""}
          </p>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3 mb-6">
        <a href={`/chantiers/${id}/visites/nouvelle`} className="flex-1">
          <Button className="w-full">Nouvelle inspection</Button>
        </a>
        <a href={`/chantiers/${id}/entreprises`}>
          <Button variant="outline">Entreprises</Button>
        </a>
      </div>

      {/* Timeline des visites */}
      <Card className="mb-4">
        <CardHeader>
          <h3 className="font-semibold">Historique des visites</h3>
        </CardHeader>
        <CardContent>
          <TimelineVisites
            visites={(visites ?? []) as VisiteWithRelations[]}
            chantierId={id}
          />
        </CardContent>
      </Card>

      {/* Écarts */}
      {allEcarts.length > 0 && (
        <Card>
          <CardHeader>
            <h3 className="font-semibold">Écarts</h3>
          </CardHeader>
          <CardContent>
            <ChantierEcarts ecarts={allEcarts} />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
