import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default async function ChantiersPage() {
  const supabase = await createClient();

  const { data: chantiers } = await supabase
    .from("chantier")
    .select("*")
    .is("deleted_at", null)
    .order("created_at", { ascending: false });

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">Tous les chantiers</h2>
        <a href="/chantiers/nouveau">
          <Button size="sm">+ Nouveau</Button>
        </a>
      </div>

      {/* Filtres */}
      <div className="flex gap-2 mb-4">
        <Badge variant="success">
          {chantiers?.filter((c) => c.statut === "actif").length ?? 0} actifs
        </Badge>
        <Badge variant="muted">
          {chantiers?.filter((c) => c.statut === "termine").length ?? 0}{" "}
          terminés
        </Badge>
      </div>

      {(chantiers ?? []).length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <p className="text-lg mb-2">Aucun chantier</p>
          <a href="/chantiers/nouveau" className="text-blue-600 text-sm">
            Créer votre premier chantier
          </a>
        </div>
      ) : (
        <div className="space-y-3">
          {(chantiers ?? []).map((chantier) => (
            <a key={chantier.id} href={`/chantiers/${chantier.id}`}>
              <Card className="hover:border-gray-300 transition-colors active:bg-gray-50 mb-3">
                <CardContent>
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold truncate">{chantier.nom}</h3>
                      <p className="text-sm text-gray-500 truncate">
                        {chantier.adresse}
                      </p>
                    </div>
                    <Badge
                      variant={
                        chantier.statut === "actif" ? "success" : "muted"
                      }
                    >
                      {chantier.statut === "actif" ? "Actif" : "Terminé"}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
