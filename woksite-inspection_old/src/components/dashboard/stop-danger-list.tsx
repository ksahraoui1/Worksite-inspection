import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

interface StopDangerItem {
  id: string;
  constat: string;
  created_at: string;
  chantier_nom: string | null;
  chantier_id: string | null;
}

interface StopDangerListProps {
  ecarts: StopDangerItem[];
}

export function StopDangerList({ ecarts }: StopDangerListProps) {
  if (ecarts.length === 0) return null;

  return (
    <div className="mb-6">
      <div className="bg-red-600 text-white rounded-xl px-4 py-3 mb-3 flex items-center gap-3">
        <span className="text-2xl">⚠️</span>
        <div>
          <p className="font-bold text-lg">
            {ecarts.length} STOP Danger actif{ecarts.length > 1 ? "s" : ""}
          </p>
          <p className="text-red-100 text-sm">
            Intervention immédiate requise
          </p>
        </div>
      </div>

      <div className="space-y-2">
        {ecarts.map((ecart) => (
          <Card key={ecart.id} className="border-red-300 bg-red-50">
            <CardContent>
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-red-900 text-sm">
                    {ecart.constat}
                  </p>
                  <div className="flex items-center gap-2 mt-1.5">
                    {ecart.chantier_nom && (
                      <span className="text-xs text-red-700">
                        {ecart.chantier_nom}
                      </span>
                    )}
                    <span className="text-xs text-red-400">
                      {new Date(ecart.created_at).toLocaleDateString("fr-CH", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                </div>
                <Badge variant="danger">STOP</Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
