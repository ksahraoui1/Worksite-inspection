import { createAdminClient } from "@/lib/supabase/server";
import { sendStopDangerEmail } from "@/lib/notifications/email";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const body = await request.json();
  const { chantier_id, checklist_item_id, constat, photo_url } = body;

  if (!chantier_id || !constat) {
    return NextResponse.json(
      { error: "chantier_id et constat sont requis" },
      { status: 400 }
    );
  }

  const supabase = createAdminClient();

  // Charger le chantier pour récupérer l'email du responsable
  const { data: chantier } = await supabase
    .from("chantier")
    .select("id, nom, responsable_email")
    .eq("id", chantier_id)
    .is("deleted_at", null)
    .single();

  if (!chantier) {
    return NextResponse.json(
      { error: "Chantier introuvable" },
      { status: 404 }
    );
  }

  if (!chantier.responsable_email) {
    return NextResponse.json(
      { error: "Chantier sans email de responsable" },
      { status: 400 }
    );
  }

  // Créer l'écart STOP Danger
  const { data: ecart, error: ecartError } = await supabase
    .from("ecart")
    .insert({
      visite_id: null, // STOP Danger déclenché hors contexte de visite
      checklist_item_id: checklist_item_id ?? null,
      constat,
      photo_url: photo_url ?? null,
      severite: "stop_danger",
      statut: "stop_danger",
    })
    .select()
    .single();

  if (ecartError) {
    return NextResponse.json(
      { error: "Erreur lors de la création de l'écart" },
      { status: 500 }
    );
  }

  // Envoyer notification email
  const notificationSent = await sendStopDangerEmail(
    chantier.responsable_email,
    chantier.nom,
    constat
  );

  return NextResponse.json(
    {
      ecart,
      notification_sent: notificationSent,
    },
    { status: 201 }
  );
}
