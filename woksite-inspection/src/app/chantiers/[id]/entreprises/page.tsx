"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { createClient } from "@/lib/supabase/client";
import type { Entreprise } from "@/types/database";

export default function EntreprisesPage() {
  const params = useParams<{ id: string }>();
  const [entreprises, setEntreprises] = useState<Entreprise[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [nom, setNom] = useState("");
  const [corpsMetier, setCorpsMetier] = useState("");
  const [contact, setContact] = useState("");
  const [saving, setSaving] = useState(false);

  async function loadEntreprises() {
    const supabase = createClient();
    const { data } = await supabase
      .from("chantier_entreprise")
      .select("*, entreprise(*)")
      .eq("chantier_id", params.id);

    setEntreprises(
      (data ?? [])
        .map((ce: { entreprise: Entreprise }) => ce.entreprise)
        .filter(Boolean)
    );
    setLoading(false);
  }

  useEffect(() => {
    loadEntreprises();
  }, [params.id]);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!nom.trim() || !corpsMetier.trim()) return;

    setSaving(true);
    const supabase = createClient();

    // Créer ou trouver l'entreprise
    const { data: entreprise } = await supabase
      .from("entreprise")
      .insert({
        nom: nom.trim(),
        corps_metier: corpsMetier.trim(),
        contact_nom: contact.trim() || null,
      })
      .select()
      .single();

    if (entreprise) {
      // Associer au chantier
      await supabase.from("chantier_entreprise").insert({
        chantier_id: params.id,
        entreprise_id: entreprise.id,
      });

      setNom("");
      setCorpsMetier("");
      setContact("");
      setShowForm(false);
      await loadEntreprises();
    }
    setSaving(false);
  }

  async function handleDissociate(entrepriseId: string) {
    const supabase = createClient();
    await supabase
      .from("chantier_entreprise")
      .delete()
      .eq("chantier_id", params.id)
      .eq("entreprise_id", entrepriseId);
    await loadEntreprises();
  }

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner size="lg" />
      </div>
    );
  }

  const inputClass =
    "w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm min-h-[44px] focus:outline-none focus:ring-2 focus:ring-blue-500";

  return (
    <div>
      <a
        href={`/chantiers/${params.id}`}
        className="text-sm text-blue-600 mb-4 inline-block"
      >
        ← Retour au chantier
      </a>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">Entreprises</h2>
        <Button size="sm" onClick={() => setShowForm(!showForm)}>
          {showForm ? "Annuler" : "+ Ajouter"}
        </Button>
      </div>

      {/* Formulaire ajout */}
      {showForm && (
        <Card className="mb-4">
          <CardContent>
            <form onSubmit={handleAdd} className="space-y-3">
              <input
                type="text"
                value={nom}
                onChange={(e) => setNom(e.target.value)}
                placeholder="Nom de l'entreprise *"
                required
                className={inputClass}
              />
              <input
                type="text"
                value={corpsMetier}
                onChange={(e) => setCorpsMetier(e.target.value)}
                placeholder="Corps de métier (ex: Maçonnerie) *"
                required
                className={inputClass}
              />
              <input
                type="text"
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                placeholder="Nom du contact"
                className={inputClass}
              />
              <Button type="submit" className="w-full" disabled={saving}>
                {saving ? "Ajout..." : "Ajouter l'entreprise"}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Liste */}
      {entreprises.length === 0 ? (
        <p className="text-center py-8 text-gray-500 text-sm">
          Aucune entreprise associée
        </p>
      ) : (
        <div className="space-y-3">
          {entreprises.map((e) => (
            <Card key={e.id}>
              <CardContent>
                <div className="flex items-center justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium">{e.nom}</p>
                    <p className="text-sm text-gray-500">{e.corps_metier}</p>
                    {e.contact_nom && (
                      <p className="text-xs text-gray-400">{e.contact_nom}</p>
                    )}
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDissociate(e.id)}
                    className="text-red-600"
                  >
                    Retirer
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
