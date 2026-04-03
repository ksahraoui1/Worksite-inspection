import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import type { ChantierWithEcartsEnRetard } from "@/types/database";

interface ChantierCardProps {
  chantier: ChantierWithEcartsEnRetard;
}

export function ChantierCard({ chantier }: ChantierCardProps) {
  const hasOverdueEcarts = chantier.ecarts_en_retard > 0;

  return (
    <a href={`/chantiers/${chantier.id}`}>
      <Card className="hover:border-gray-300 transition-colors active:bg-gray-50">
        <CardContent>
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-base truncate">
                {chantier.nom}
              </h3>
              <p className="text-sm text-gray-500 truncate mt-0.5">
                {chantier.adresse}
              </p>
              <p className="text-sm text-gray-400 mt-1">
                {chantier.responsable_securite}
              </p>
            </div>
            <div className="flex flex-col items-end gap-1.5 shrink-0">
              <Badge variant={chantier.statut === "actif" ? "success" : "muted"}>
                {chantier.statut === "actif" ? "Actif" : "Terminé"}
              </Badge>
              {hasOverdueEcarts && (
                <Badge variant="danger">
                  {chantier.ecarts_en_retard} en retard
                </Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </a>
  );
}
