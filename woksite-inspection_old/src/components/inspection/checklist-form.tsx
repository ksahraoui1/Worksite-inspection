"use client";

import { useState } from "react";
import { ChecklistItemComponent } from "@/components/inspection/checklist-item";
import { EcartForm, type EcartFormData } from "@/components/ecart/ecart-form";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import type {
  ChecklistItem,
  Entreprise,
  ResultatReponse,
} from "@/types/database";

interface ChecklistFormProps {
  items: ChecklistItem[];
  entreprises: Entreprise[];
  onSaveReponse: (
    checklistItemId: string,
    resultat: ResultatReponse
  ) => Promise<void>;
  onCreateEcart: (
    checklistItemId: string,
    data: EcartFormData
  ) => Promise<void>;
  onTerminerVisite: () => Promise<void>;
  initialReponses: Record<string, ResultatReponse>;
}

export function ChecklistForm({
  items,
  entreprises,
  onSaveReponse,
  onCreateEcart,
  onTerminerVisite,
  initialReponses,
}: ChecklistFormProps) {
  const [reponses, setReponses] =
    useState<Record<string, ResultatReponse>>(initialReponses);
  const [ecartItemId, setEcartItemId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const answeredCount = Object.keys(reponses).length;
  const totalCount = items.length;
  const allAnswered = answeredCount === totalCount;

  async function handleResultat(itemId: string, resultat: ResultatReponse) {
    setReponses((prev) => ({ ...prev, [itemId]: resultat }));
    await onSaveReponse(itemId, resultat);

    if (resultat === "non_conforme") {
      setEcartItemId(itemId);
    }
  }

  async function handleEcartSubmit(data: EcartFormData) {
    if (!ecartItemId) return;
    await onCreateEcart(ecartItemId, data);
    setEcartItemId(null);
  }

  async function handleTerminer() {
    setSaving(true);
    try {
      await onTerminerVisite();
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      {/* Progress */}
      <div className="mb-4">
        <div className="flex justify-between text-sm text-gray-500 mb-1">
          <span>
            {answeredCount}/{totalCount} points vérifiés
          </span>
          <span>{Math.round((answeredCount / totalCount) * 100)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all"
            style={{
              width: `${(answeredCount / totalCount) * 100}%`,
            }}
          />
        </div>
      </div>

      {/* Checklist items */}
      <div className="space-y-3">
        {items.map((item) => (
          <ChecklistItemComponent
            key={item.id}
            item={item}
            resultat={reponses[item.id] ?? null}
            onResultat={(r) => handleResultat(item.id, r)}
          />
        ))}
      </div>

      {/* Terminer la visite */}
      <div className="mt-6 pb-4">
        <Button
          onClick={handleTerminer}
          disabled={!allAnswered || saving}
          className="w-full"
        >
          {saving ? "Enregistrement..." : "Terminer la visite"}
        </Button>
        {!allAnswered && (
          <p className="text-sm text-gray-500 text-center mt-2">
            Répondez à tous les points de contrôle pour terminer
          </p>
        )}
      </div>

      {/* Modal écart */}
      <Modal
        open={ecartItemId !== null}
        onClose={() => setEcartItemId(null)}
        title="Documenter l'écart"
      >
        <EcartForm
          entreprises={entreprises}
          onSubmit={handleEcartSubmit}
          onCancel={() => setEcartItemId(null)}
        />
      </Modal>
    </div>
  );
}
