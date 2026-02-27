"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { createClient } from "@/lib/supabase/client";
import type { Visite, Phase, ReponseVisite, ChecklistItem, Ecart } from "@/types/database";

export default function RapportPage() {
  const params = useParams<{ id: string; visiteId: string }>();
  const [visite, setVisite] = useState<Visite & { phase: Phase } | null>(null);
  const [reponses, setReponses] = useState<(ReponseVisite & { checklist_item: ChecklistItem })[]>([]);
  const [ecarts, setEcarts] = useState<Ecart[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    async function load() {
      const supabase = createClient();

      const { data: visiteData } = await supabase
        .from("visite")
        .select("*, phase(*)")
        .eq("id", params.visiteId)
        .single();

      if (visiteData) {
        setVisite(visiteData as Visite & { phase: Phase });
      }

      const { data: reponsesData } = await supabase
        .from("reponse_visite")
        .select("*, checklist_item(*)")
        .eq("visite_id", params.visiteId);

      setReponses((reponsesData ?? []) as (ReponseVisite & { checklist_item: ChecklistItem })[]);

      const { data: ecartsData } = await supabase
        .from("ecart")
        .select("*")
        .eq("visite_id", params.visiteId)
        .is("deleted_at", null);

      setEcarts(ecartsData ?? []);
      setLoading(false);
    }
    load();
  }, [params.visiteId]);

  async function handleGenerate() {
    setGenerating(true);
    try {
      const res = await fetch(`/api/visites/${params.visiteId}/pdf`, {
        method: "POST",
      });

      if (res.ok) {
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download =
          res.headers.get("Content-Disposition")?.split("filename=")[1]?.replace(/"/g, "") ??
          "rapport.pdf";
        a.click();
        URL.revokeObjectURL(url);
      }
    } finally {
      setGenerating(false);
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!visite) {
    return <p className="text-center py-12 text-gray-500">Visite introuvable</p>;
  }

  const conformeCount = reponses.filter((r) => r.resultat === "conforme").length;
  const ncCount = reponses.filter((r) => r.resultat === "non_conforme").length;

  return (
    <div>
      <a
        href={`/chantiers/${params.id}`}
        className="text-sm text-blue-600 mb-4 inline-block"
      >
        ← Retour au chantier
      </a>
      <h2 className="text-xl font-bold mb-1">Rapport de visite</h2>
      <p className="text-gray-500 text-sm mb-4">
        Phase {visite.phase.numero} : {visite.phase.nom}
      </p>

      {/* Résumé */}
      <Card className="mb-4">
        <CardContent>
          <div className="grid grid-cols-3 gap-3 text-center">
            <div>
              <p className="text-2xl font-bold text-green-600">{conformeCount}</p>
              <p className="text-xs text-gray-500">Conformes</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-red-600">{ncCount}</p>
              <p className="text-xs text-gray-500">Non conformes</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-600">{ecarts.length}</p>
              <p className="text-xs text-gray-500">Écarts</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Points de contrôle */}
      <Card className="mb-4">
        <CardHeader>
          <h3 className="font-semibold">Points de contrôle</h3>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {reponses.map((r) => (
              <div key={r.id} className="flex items-start justify-between gap-2 py-2 border-b border-gray-50 last:border-0">
                <div className="flex-1 min-w-0">
                  <p className="text-sm">{r.checklist_item.question}</p>
                  <p className="text-xs text-gray-400">{r.checklist_item.reference_legale}</p>
                </div>
                <Badge
                  variant={
                    r.resultat === "conforme" ? "success" :
                    r.resultat === "non_conforme" ? "danger" : "muted"
                  }
                >
                  {r.resultat === "conforme" ? "C" : r.resultat === "non_conforme" ? "NC" : "N/A"}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Bouton PDF */}
      <Button
        onClick={handleGenerate}
        disabled={generating || visite.statut !== "terminee"}
        className="w-full"
      >
        {generating ? "Génération en cours..." : "Télécharger le rapport PDF"}
      </Button>
      {visite.statut !== "terminee" && (
        <p className="text-sm text-gray-500 text-center mt-2">
          La visite doit être terminée pour générer le rapport
        </p>
      )}
    </div>
  );
}
