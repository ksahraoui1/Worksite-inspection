"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { PhotoCapture } from "@/components/ecart/photo-capture";
import type { Entreprise, EcartSeverite } from "@/types/database";

export interface EcartFormData {
  constat: string;
  photoBlob: Blob | null;
  entreprise_id: string | null;
  delai_resolution: string;
  severite: EcartSeverite;
}

interface EcartFormProps {
  entreprises: Entreprise[];
  onSubmit: (data: EcartFormData) => void;
  onCancel: () => void;
}

export function EcartForm({ entreprises, onSubmit, onCancel }: EcartFormProps) {
  const [constat, setConstat] = useState("");
  const [photoBlob, setPhotoBlob] = useState<Blob | null>(null);
  const [entrepriseId, setEntrepriseId] = useState("");
  const [delai, setDelai] = useState("");
  const [severite, setSeverite] = useState<EcartSeverite>("a_corriger");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!constat.trim()) return;
    onSubmit({
      constat: constat.trim(),
      photoBlob,
      entreprise_id: entrepriseId || null,
      delai_resolution: delai,
      severite,
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Sévérité */}
      <div>
        <label className="block text-sm font-medium mb-1.5">Sévérité</label>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setSeverite("a_corriger")}
            className={`flex-1 min-h-[44px] rounded-lg text-sm font-medium border transition-colors ${
              severite === "a_corriger"
                ? "bg-amber-100 border-amber-500 text-amber-800"
                : "border-gray-200 text-gray-600"
            }`}
          >
            À corriger
          </button>
          <button
            type="button"
            onClick={() => setSeverite("stop_danger")}
            className={`flex-1 min-h-[44px] rounded-lg text-sm font-medium border transition-colors ${
              severite === "stop_danger"
                ? "bg-red-100 border-red-500 text-red-800"
                : "border-gray-200 text-gray-600"
            }`}
          >
            STOP Danger
          </button>
        </div>
      </div>

      {/* Constat */}
      <div>
        <label htmlFor="constat" className="block text-sm font-medium mb-1.5">
          Constat *
        </label>
        <textarea
          id="constat"
          value={constat}
          onChange={(e) => setConstat(e.target.value)}
          placeholder="Décrivez le constat..."
          rows={3}
          required
          className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Photo */}
      <div>
        <label className="block text-sm font-medium mb-1.5">Photo</label>
        <PhotoCapture onCapture={setPhotoBlob} />
      </div>

      {/* Entreprise assignée */}
      <div>
        <label
          htmlFor="entreprise"
          className="block text-sm font-medium mb-1.5"
        >
          Entreprise assignée
        </label>
        <select
          id="entreprise"
          value={entrepriseId}
          onChange={(e) => setEntrepriseId(e.target.value)}
          className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm min-h-[44px] focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">— Aucune —</option>
          {entreprises.map((e) => (
            <option key={e.id} value={e.id}>
              {e.nom} ({e.corps_metier})
            </option>
          ))}
        </select>
      </div>

      {/* Délai */}
      <div>
        <label htmlFor="delai" className="block text-sm font-medium mb-1.5">
          Délai de résolution
        </label>
        <input
          type="date"
          id="delai"
          value={delai}
          onChange={(e) => setDelai(e.target.value)}
          className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm min-h-[44px] focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        <Button type="button" variant="ghost" onClick={onCancel}>
          Annuler
        </Button>
        <Button type="submit" variant="danger" className="flex-1">
          Créer l&apos;écart
        </Button>
      </div>
    </form>
  );
}
