"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ChecklistForm } from "@/components/inspection/checklist-form";
import { Spinner } from "@/components/ui/spinner";
import { createClient } from "@/lib/supabase/client";
import type {
  ChecklistItem,
  Entreprise,
  ResultatReponse,
  Visite,
  Phase,
} from "@/types/database";
import type { EcartFormData } from "@/components/ecart/ecart-form";

export default function InspectionPage() {
  const params = useParams<{ id: string; visiteId: string }>();
  const router = useRouter();
  const [visite, setVisite] = useState<Visite & { phase: Phase } | null>(null);
  const [items, setItems] = useState<ChecklistItem[]>([]);
  const [entreprises, setEntreprises] = useState<Entreprise[]>([]);
  const [initialReponses, setInitialReponses] = useState<
    Record<string, ResultatReponse>
  >({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const supabase = createClient();

      // Charger la visite
      const { data: visiteData } = await supabase
        .from("visite")
        .select("*, phase(*)")
        .eq("id", params.visiteId)
        .single();

      if (!visiteData) return;
      setVisite(visiteData as Visite & { phase: Phase });

      // Charger les checklist items de cette phase
      const { data: itemsData } = await supabase
        .from("checklist_item")
        .select("*")
        .eq("phase_id", visiteData.phase_id)
        .order("ordre");

      setItems(itemsData ?? []);

      // Charger les réponses existantes
      const { data: reponsesData } = await supabase
        .from("reponse_visite")
        .select("*")
        .eq("visite_id", params.visiteId);

      const repMap: Record<string, ResultatReponse> = {};
      for (const r of reponsesData ?? []) {
        repMap[r.checklist_item_id] = r.resultat as ResultatReponse;
      }
      setInitialReponses(repMap);

      // Charger les entreprises du chantier
      const { data: ceData } = await supabase
        .from("chantier_entreprise")
        .select("*, entreprise(*)")
        .eq("chantier_id", params.id);

      const entrs = (ceData ?? [])
        .map((ce: { entreprise: Entreprise }) => ce.entreprise)
        .filter(Boolean);
      setEntreprises(entrs);

      setLoading(false);
    }
    load();
  }, [params.id, params.visiteId]);

  const handleSaveReponse = useCallback(
    async (checklistItemId: string, resultat: ResultatReponse) => {
      const supabase = createClient();
      await supabase.from("reponse_visite").upsert(
        {
          visite_id: params.visiteId,
          checklist_item_id: checklistItemId,
          resultat,
        },
        { onConflict: "visite_id,checklist_item_id" }
      );
    },
    [params.visiteId]
  );

  const handleCreateEcart = useCallback(
    async (checklistItemId: string, data: EcartFormData) => {
      const supabase = createClient();

      let photoUrl: string | null = null;
      if (data.photoBlob) {
        const path = `${params.id}/${params.visiteId}/${checklistItemId}-${Date.now()}.jpg`;
        const { error: uploadError } = await supabase.storage
          .from("ecart-photos")
          .upload(path, data.photoBlob, { contentType: "image/jpeg" });

        if (!uploadError) {
          const {
            data: { publicUrl },
          } = supabase.storage.from("ecart-photos").getPublicUrl(path);
          photoUrl = publicUrl;
        }
      }

      await supabase.from("ecart").insert({
        visite_id: params.visiteId,
        checklist_item_id: checklistItemId,
        entreprise_id: data.entreprise_id,
        constat: data.constat,
        photo_url: photoUrl,
        severite: data.severite,
        statut: data.severite,
        delai_resolution: data.delai_resolution || null,
      });
    },
    [params.id, params.visiteId]
  );

  const handleTerminerVisite = useCallback(async () => {
    const supabase = createClient();
    await supabase
      .from("visite")
      .update({ statut: "terminee", updated_at: new Date().toISOString() })
      .eq("id", params.visiteId);

    router.push(`/chantiers/${params.id}`);
  }, [params.id, params.visiteId, router]);

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

  return (
    <div>
      <a
        href={`/chantiers/${params.id}`}
        className="text-sm text-blue-600 mb-2 inline-block"
      >
        ← Retour au chantier
      </a>
      <h2 className="text-xl font-bold mb-1">Inspection</h2>
      <p className="text-gray-500 text-sm mb-4">
        Phase {visite.phase.numero} : {visite.phase.nom}
      </p>

      <ChecklistForm
        items={items}
        entreprises={entreprises}
        onSaveReponse={handleSaveReponse}
        onCreateEcart={handleCreateEcart}
        onTerminerVisite={handleTerminerVisite}
        initialReponses={initialReponses}
      />
    </div>
  );
}
