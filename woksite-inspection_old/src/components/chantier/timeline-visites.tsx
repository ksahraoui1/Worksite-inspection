import { Badge } from "@/components/ui/badge";
import type { VisiteWithRelations } from "@/types/database";

interface TimelineVisitesProps {
  visites: VisiteWithRelations[];
  chantierId: string;
}

export function TimelineVisites({ visites, chantierId }: TimelineVisitesProps) {
  if (visites.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>Aucune visite enregistrée</p>
        <a
          href={`/chantiers/${chantierId}/visites/nouvelle`}
          className="text-blue-600 text-sm mt-2 inline-block"
        >
          Démarrer une première inspection
        </a>
      </div>
    );
  }

  return (
    <div className="space-y-0">
      {visites.map((visite, index) => {
        const ecartsCount = visite.ecart?.length ?? 0;
        const dateFormatted = new Date(visite.date_visite).toLocaleDateString(
          "fr-CH",
          { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }
        );

        return (
          <div key={visite.id} className="relative pl-8 pb-6">
            {/* Ligne verticale */}
            {index < visites.length - 1 && (
              <div className="absolute left-3 top-6 bottom-0 w-px bg-gray-200" />
            )}
            {/* Point */}
            <div
              className={`absolute left-1.5 top-1.5 w-3 h-3 rounded-full border-2 ${
                visite.statut === "terminee"
                  ? "bg-green-500 border-green-500"
                  : "bg-white border-blue-500"
              }`}
            />
            {/* Contenu */}
            <a
              href={`/chantiers/${chantierId}/visites/${visite.id}`}
              className="block bg-white rounded-lg border border-gray-100 p-3 hover:border-gray-300 transition-colors active:bg-gray-50"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-medium text-sm">{visite.phase.nom}</p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {dateFormatted} — {visite.inspecteur_nom}
                  </p>
                </div>
                <div className="flex gap-1.5 shrink-0">
                  <Badge
                    variant={
                      visite.statut === "terminee" ? "success" : "warning"
                    }
                  >
                    {visite.statut === "terminee" ? "Terminée" : "En cours"}
                  </Badge>
                  {ecartsCount > 0 && (
                    <Badge variant="danger">{ecartsCount} écart{ecartsCount > 1 ? "s" : ""}</Badge>
                  )}
                </div>
              </div>
            </a>
          </div>
        );
      })}
    </div>
  );
}
