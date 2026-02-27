import { createClient } from "@/lib/supabase/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { RapportVisite } from "@/components/pdf/rapport-visite";
import { NextResponse } from "next/server";
import { createElement } from "react";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();

  // Charger la visite
  const { data: visite } = await supabase
    .from("visite")
    .select("*, phase(*)")
    .eq("id", id)
    .single();

  if (!visite) {
    return NextResponse.json({ error: "Visite introuvable" }, { status: 404 });
  }

  if (visite.statut !== "terminee") {
    return NextResponse.json(
      { error: "La visite doit être terminée pour générer un rapport" },
      { status: 400 }
    );
  }

  // Charger le chantier
  const { data: chantier } = await supabase
    .from("chantier")
    .select("*")
    .eq("id", visite.chantier_id)
    .single();

  if (!chantier) {
    return NextResponse.json(
      { error: "Chantier introuvable" },
      { status: 404 }
    );
  }

  // Charger les réponses
  const { data: reponses } = await supabase
    .from("reponse_visite")
    .select("*, checklist_item(*)")
    .eq("visite_id", id)
    .order("created_at");

  // Charger les écarts
  const { data: ecarts } = await supabase
    .from("ecart")
    .select("*, checklist_item(*), entreprise(*)")
    .eq("visite_id", id)
    .is("deleted_at", null);

  // Générer le PDF
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const buffer = await renderToBuffer(
    createElement(RapportVisite, {
      chantier,
      visite,
      phase: visite.phase,
      reponses: reponses ?? [],
      ecarts: ecarts ?? [],
    }) as any
  );

  const dateStr = new Date(visite.date_visite)
    .toISOString()
    .split("T")[0];
  const filename = `${dateStr}-${chantier.nom.replace(/\s+/g, "_")}-Visite-Phase${visite.phase.numero}.pdf`;

  return new NextResponse(Buffer.from(buffer) as unknown as BodyInit, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
