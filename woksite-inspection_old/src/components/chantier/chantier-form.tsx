"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import type { Chantier, ChantierStatut } from "@/types/database";

interface ChantierFormProps {
  initial?: Partial<Chantier>;
  ecartsNonResolus?: number;
  onSubmit: (data: ChantierFormData) => Promise<void>;
}

export interface ChantierFormData {
  nom: string;
  adresse: string;
  date_debut: string;
  date_fin_prevue: string;
  responsable_securite: string;
  responsable_email: string;
  statut: ChantierStatut;
}

export function ChantierForm({
  initial,
  ecartsNonResolus = 0,
  onSubmit,
}: ChantierFormProps) {
  const [nom, setNom] = useState(initial?.nom ?? "");
  const [adresse, setAdresse] = useState(initial?.adresse ?? "");
  const [dateDebut, setDateDebut] = useState(initial?.date_debut ?? "");
  const [dateFinPrevue, setDateFinPrevue] = useState(
    initial?.date_fin_prevue ?? ""
  );
  const [responsable, setResponsable] = useState(
    initial?.responsable_securite ?? ""
  );
  const [email, setEmail] = useState(initial?.responsable_email ?? "");
  const [statut, setStatut] = useState<ChantierStatut>(
    initial?.statut ?? "actif"
  );
  const [saving, setSaving] = useState(false);
  const [showClotureWarning, setShowClotureWarning] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    // FR-014: avertir si clôture avec écarts non résolus
    if (
      statut === "termine" &&
      initial?.statut === "actif" &&
      ecartsNonResolus > 0 &&
      !showClotureWarning
    ) {
      setShowClotureWarning(true);
      return;
    }

    setSaving(true);
    try {
      await onSubmit({
        nom: nom.trim(),
        adresse: adresse.trim(),
        date_debut: dateDebut,
        date_fin_prevue: dateFinPrevue || "",
        responsable_securite: responsable.trim(),
        responsable_email: email.trim(),
        statut,
      });
    } finally {
      setSaving(false);
      setShowClotureWarning(false);
    }
  }

  const inputClass =
    "w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm min-h-[44px] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent";

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="nom" className="block text-sm font-medium mb-1.5">
          Nom du chantier *
        </label>
        <input
          id="nom"
          type="text"
          value={nom}
          onChange={(e) => setNom(e.target.value)}
          required
          className={inputClass}
        />
      </div>

      <div>
        <label htmlFor="adresse" className="block text-sm font-medium mb-1.5">
          Adresse *
        </label>
        <input
          id="adresse"
          type="text"
          value={adresse}
          onChange={(e) => setAdresse(e.target.value)}
          required
          className={inputClass}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label
            htmlFor="date_debut"
            className="block text-sm font-medium mb-1.5"
          >
            Date de début *
          </label>
          <input
            id="date_debut"
            type="date"
            value={dateDebut}
            onChange={(e) => setDateDebut(e.target.value)}
            required
            className={inputClass}
          />
        </div>
        <div>
          <label
            htmlFor="date_fin"
            className="block text-sm font-medium mb-1.5"
          >
            Fin prévue
          </label>
          <input
            id="date_fin"
            type="date"
            value={dateFinPrevue}
            onChange={(e) => setDateFinPrevue(e.target.value)}
            className={inputClass}
          />
        </div>
      </div>

      <div>
        <label
          htmlFor="responsable"
          className="block text-sm font-medium mb-1.5"
        >
          Responsable sécurité *
        </label>
        <input
          id="responsable"
          type="text"
          value={responsable}
          onChange={(e) => setResponsable(e.target.value)}
          required
          className={inputClass}
        />
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium mb-1.5">
          Email du responsable *
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className={inputClass}
        />
      </div>

      {initial && (
        <div>
          <label className="block text-sm font-medium mb-1.5">Statut</label>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setStatut("actif")}
              className={`flex-1 min-h-[44px] rounded-lg text-sm font-medium border transition-colors ${
                statut === "actif"
                  ? "bg-green-100 border-green-500 text-green-800"
                  : "border-gray-200 text-gray-600"
              }`}
            >
              Actif
            </button>
            <button
              type="button"
              onClick={() => setStatut("termine")}
              className={`flex-1 min-h-[44px] rounded-lg text-sm font-medium border transition-colors ${
                statut === "termine"
                  ? "bg-gray-200 border-gray-400 text-gray-700"
                  : "border-gray-200 text-gray-600"
              }`}
            >
              Terminé
            </button>
          </div>
        </div>
      )}

      {showClotureWarning && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
          <p className="text-amber-800 text-sm font-medium">
            Ce chantier a {ecartsNonResolus} écart
            {ecartsNonResolus > 1 ? "s" : ""} non résolu
            {ecartsNonResolus > 1 ? "s" : ""}. Voulez-vous vraiment le clôturer
            ?
          </p>
          <p className="text-amber-600 text-xs mt-1">
            Cliquez à nouveau sur Enregistrer pour confirmer.
          </p>
        </div>
      )}

      <Button type="submit" className="w-full" disabled={saving}>
        {saving ? "Enregistrement..." : initial ? "Enregistrer" : "Créer le chantier"}
      </Button>
    </form>
  );
}
