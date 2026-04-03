import { createAdminClient } from "@/lib/supabase/server";
import {
  isValidTransition,
  getAvailableTransitions,
} from "@/lib/utils/ecart-state";
import { sendStopDangerEmail } from "@/lib/notifications/email";
import { NextResponse } from "next/server";
import type { EcartStatut } from "@/types/database";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  const nouveauStatut = body.nouveau_statut as EcartStatut;

  if (!nouveauStatut) {
    return NextResponse.json(
      { error: "nouveau_statut est requis" },
      { status: 400 }
    );
  }

  const supabase = createAdminClient();

  // Charger l'écart actuel
  const { data: ecart } = await supabase
    .from("ecart")
    .select("*, visite(chantier_id)")
    .eq("id", id)
    .is("deleted_at", null)
    .single();

  if (!ecart) {
    return NextResponse.json(
      { error: "Écart introuvable" },
      { status: 404 }
    );
  }

  // Valider la transition
  if (!isValidTransition(ecart.statut as EcartStatut, nouveauStatut)) {
    const available = getAvailableTransitions(ecart.statut as EcartStatut);
    return NextResponse.json(
      {
        error: `Transition invalide: ${ecart.statut} → ${nouveauStatut}. Transitions possibles: ${available.join(", ") || "aucune (état terminal)"}`,
      },
      { status: 400 }
    );
  }

  // Mettre à jour le statut
  const updateData: Record<string, unknown> = {
    statut: nouveauStatut,
    updated_at: new Date().toISOString(),
  };

  if (nouveauStatut === "resolu") {
    updateData.date_resolution = new Date().toISOString();
  }

  const { data: updatedEcart, error: updateError } = await supabase
    .from("ecart")
    .update(updateData)
    .eq("id", id)
    .select()
    .single();

  if (updateError) {
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour" },
      { status: 500 }
    );
  }

  // Notification si escalade vers stop_danger
  let notificationSent = false;
  if (nouveauStatut === "stop_danger" && ecart.visite?.chantier_id) {
    const { data: chantier } = await supabase
      .from("chantier")
      .select("nom, responsable_email")
      .eq("id", ecart.visite.chantier_id)
      .single();

    if (chantier?.responsable_email) {
      notificationSent = await sendStopDangerEmail(
        chantier.responsable_email,
        chantier.nom,
        ecart.constat
      );
    }
  }

  return NextResponse.json({
    ecart: updatedEcart,
    notification_sent: notificationSent,
  });
}
