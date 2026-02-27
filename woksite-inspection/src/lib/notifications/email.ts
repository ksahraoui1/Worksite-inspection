import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendStopDangerEmail(
  responsableEmail: string,
  chantierNom: string,
  constat: string
): Promise<boolean> {
  try {
    const { error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL ?? "securite@woksite.ch",
      to: responsableEmail,
      subject: `⚠️ STOP DANGER — ${chantierNom}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #dc2626; color: white; padding: 16px 24px; border-radius: 8px 8px 0 0;">
            <h1 style="margin: 0; font-size: 20px;">⚠️ STOP EN CAS DE DANGER</h1>
          </div>
          <div style="border: 1px solid #e5e7eb; border-top: none; padding: 24px; border-radius: 0 0 8px 8px;">
            <p style="margin: 0 0 8px;"><strong>Chantier :</strong> ${chantierNom}</p>
            <p style="margin: 0 0 16px;"><strong>Constat :</strong></p>
            <div style="background: #fef2f2; border-left: 4px solid #dc2626; padding: 12px 16px; margin-bottom: 16px;">
              ${constat}
            </div>
            <p style="color: #6b7280; font-size: 14px; margin: 0;">
              Un arrêt immédiat des travaux a été déclenché.
              Connectez-vous à WokSite Inspection pour plus de détails.
            </p>
          </div>
        </div>
      `,
    });

    return !error;
  } catch {
    return false;
  }
}
