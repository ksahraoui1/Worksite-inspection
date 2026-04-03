import { db } from "@/lib/dexie/db";
import { createClient } from "@/lib/supabase/client";

const POLL_INTERVAL = 30_000; // 30 secondes
const MAX_BACKOFF = 5 * 60_000; // 5 minutes

export class SyncManager {
  private intervalId: ReturnType<typeof setInterval> | null = null;
  private backoffMs = POLL_INTERVAL;
  private syncing = false;

  start() {
    if (this.intervalId) return;
    this.intervalId = setInterval(() => this.sync(), this.backoffMs);
    this.sync(); // sync immédiat au démarrage
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  async sync(): Promise<{ synced: number; errors: number }> {
    if (this.syncing || !navigator.onLine) return { synced: 0, errors: 0 };

    this.syncing = true;
    let synced = 0;
    let errors = 0;

    try {
      const supabase = createClient();

      // 1. Upload photos pending
      const pendingPhotos = await db.offlinePhotos
        .where("syncStatus")
        .equals("pending")
        .toArray();

      for (const photo of pendingPhotos) {
        try {
          const path = `offline/${photo.ecart_id}/${photo.id}.jpg`;
          const { error } = await supabase.storage
            .from("ecart-photos")
            .upload(path, photo.blob, { contentType: "image/jpeg" });

          if (!error) {
            await db.offlinePhotos.update(photo.id, { syncStatus: "synced" });
            synced++;
          } else {
            await db.offlinePhotos.update(photo.id, { syncStatus: "error" });
            errors++;
          }
        } catch {
          errors++;
        }
      }

      // 2. Sync visites pending
      const pendingVisites = await db.offlineVisites
        .where("syncStatus")
        .equals("pending")
        .toArray();

      for (const visite of pendingVisites) {
        try {
          const { error } = await supabase.from("visite").upsert({
            id: visite.id,
            chantier_id: visite.chantier_id,
            phase_id: visite.phase_id,
            inspecteur_nom: visite.inspecteur_nom,
            date_visite: visite.date_visite,
            statut: visite.statut,
            notes: visite.notes,
          });

          if (!error) {
            await db.offlineVisites.update(visite.id, { syncStatus: "synced" });
            synced++;
          } else {
            errors++;
          }
        } catch {
          errors++;
        }
      }

      // 3. Sync réponses pending
      const pendingReponses = await db.offlineReponses
        .where("syncStatus")
        .equals("pending")
        .toArray();

      for (const reponse of pendingReponses) {
        try {
          const { error } = await supabase.from("reponse_visite").upsert(
            {
              id: reponse.id,
              visite_id: reponse.visite_id,
              checklist_item_id: reponse.checklist_item_id,
              resultat: reponse.resultat,
            },
            { onConflict: "visite_id,checklist_item_id" }
          );

          if (!error) {
            await db.offlineReponses.update(reponse.id, {
              syncStatus: "synced",
            });
            synced++;
          } else {
            errors++;
          }
        } catch {
          errors++;
        }
      }

      // 4. Sync écarts pending (STOP Danger en priorité)
      const pendingEcarts = await db.offlineEcarts
        .where("syncStatus")
        .equals("pending")
        .toArray();

      // Trier : stop_danger en premier (protection STOP Danger)
      pendingEcarts.sort((a, b) => {
        if (a.statut === "stop_danger" && b.statut !== "stop_danger") return -1;
        if (b.statut === "stop_danger" && a.statut !== "stop_danger") return 1;
        return 0;
      });

      for (const ecart of pendingEcarts) {
        try {
          const { error } = await supabase.from("ecart").upsert({
            id: ecart.id,
            visite_id: ecart.visite_id,
            checklist_item_id: ecart.checklist_item_id,
            entreprise_id: ecart.entreprise_id,
            constat: ecart.constat,
            photo_url: ecart.photo_url,
            severite: ecart.severite,
            statut: ecart.statut,
            delai_resolution: ecart.delai_resolution,
          });

          if (!error) {
            await db.offlineEcarts.update(ecart.id, { syncStatus: "synced" });
            synced++;
          } else {
            errors++;
          }
        } catch {
          errors++;
        }
      }

      // Reset backoff on success
      this.backoffMs = POLL_INTERVAL;
    } catch {
      // Exponential backoff
      this.backoffMs = Math.min(this.backoffMs * 2, MAX_BACKOFF);
      errors++;
    } finally {
      this.syncing = false;
    }

    return { synced, errors };
  }

  async getPendingCount(): Promise<number> {
    const [visites, reponses, ecarts, photos] = await Promise.all([
      db.offlineVisites.where("syncStatus").equals("pending").count(),
      db.offlineReponses.where("syncStatus").equals("pending").count(),
      db.offlineEcarts.where("syncStatus").equals("pending").count(),
      db.offlinePhotos.where("syncStatus").equals("pending").count(),
    ]);
    return visites + reponses + ecarts + photos;
  }
}

export const syncManager = new SyncManager();
