"use client";

import { Badge } from "@/components/ui/badge";
import type { ChecklistItem, ResultatReponse } from "@/types/database";

interface ChecklistItemProps {
  item: ChecklistItem;
  resultat: ResultatReponse | null;
  onResultat: (resultat: ResultatReponse) => void;
}

const buttonBase =
  "flex-1 min-h-[44px] rounded-lg text-sm font-medium transition-colors border";

export function ChecklistItemComponent({
  item,
  resultat,
  onResultat,
}: ChecklistItemProps) {
  return (
    <div className="border border-gray-200 rounded-xl p-4 bg-white">
      <div className="mb-3">
        <p className="text-sm font-medium leading-relaxed">{item.question}</p>
        <Badge variant="muted" className="mt-2">
          {item.reference_legale}
        </Badge>
      </div>
      <div className="flex gap-2">
        <button
          onClick={() => onResultat("conforme")}
          className={`${buttonBase} ${
            resultat === "conforme"
              ? "bg-green-100 border-green-500 text-green-800"
              : "border-gray-200 text-gray-600 hover:bg-green-50"
          }`}
        >
          Conforme
        </button>
        <button
          onClick={() => onResultat("non_conforme")}
          className={`${buttonBase} ${
            resultat === "non_conforme"
              ? "bg-red-100 border-red-500 text-red-800"
              : "border-gray-200 text-gray-600 hover:bg-red-50"
          }`}
        >
          Non conforme
        </button>
        <button
          onClick={() => onResultat("non_applicable")}
          className={`${buttonBase} ${
            resultat === "non_applicable"
              ? "bg-gray-200 border-gray-400 text-gray-700"
              : "border-gray-200 text-gray-600 hover:bg-gray-100"
          }`}
        >
          N/A
        </button>
      </div>
    </div>
  );
}
