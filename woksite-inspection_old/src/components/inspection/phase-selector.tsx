"use client";

import { Card, CardContent } from "@/components/ui/card";
import type { Phase } from "@/types/database";

interface PhaseSelectorProps {
  phases: Phase[];
  checklistCounts: Record<string, number>;
  onSelect: (phase: Phase) => void;
}

const phaseIcons: Record<number, string> = {
  1: "🏗️",
  2: "⛏️",
  3: "🧱",
  4: "🏠",
  5: "🔌",
};

export function PhaseSelector({
  phases,
  checklistCounts,
  onSelect,
}: PhaseSelectorProps) {
  return (
    <div className="space-y-3">
      <h3 className="font-semibold text-base mb-3">
        Sélectionnez la phase à inspecter
      </h3>
      {phases.map((phase) => (
        <button
          key={phase.id}
          onClick={() => onSelect(phase)}
          className="w-full text-left"
        >
          <Card className="hover:border-blue-300 transition-colors active:bg-blue-50">
            <CardContent>
              <div className="flex items-center gap-3">
                <span className="text-2xl">
                  {phaseIcons[phase.numero] ?? "📋"}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="font-medium">
                    Phase {phase.numero} : {phase.nom}
                  </p>
                  {phase.description && (
                    <p className="text-sm text-gray-500 truncate">
                      {phase.description}
                    </p>
                  )}
                </div>
                <span className="text-sm text-gray-400 shrink-0">
                  {checklistCounts[phase.id] ?? 0} points
                </span>
              </div>
            </CardContent>
          </Card>
        </button>
      ))}
    </div>
  );
}
