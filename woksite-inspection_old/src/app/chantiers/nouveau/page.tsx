"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ChantierForm,
  type ChantierFormData,
} from "@/components/chantier/chantier-form";
import { createClient } from "@/lib/supabase/client";

export default function NouveauChantierPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(data: ChantierFormData) {
    setError(null);
    const supabase = createClient();

    const { data: chantier, error: dbError } = await supabase
      .from("chantier")
      .insert({
        nom: data.nom,
        adresse: data.adresse,
        date_debut: data.date_debut,
        date_fin_prevue: data.date_fin_prevue || null,
        responsable_securite: data.responsable_securite,
        responsable_email: data.responsable_email,
        statut: "actif",
      })
      .select()
      .single();

    if (dbError) {
      setError(dbError.message);
      return;
    }

    if (chantier) {
      router.push(`/chantiers/${chantier.id}`);
    }
  }

  return (
    <div>
      <a href="/chantiers" className="text-sm text-blue-600 mb-4 inline-block">
        ← Retour aux chantiers
      </a>
      <h2 className="text-xl font-bold mb-4">Nouveau chantier</h2>
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 mb-4 text-red-700 text-sm">
          {error}
        </div>
      )}
      <ChantierForm onSubmit={handleSubmit} />
    </div>
  );
}
