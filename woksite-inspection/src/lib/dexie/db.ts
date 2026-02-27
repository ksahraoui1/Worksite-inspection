import Dexie, { type EntityTable } from "dexie";

export type SyncStatus = "pending" | "synced" | "error";

export interface OfflineVisite {
  id: string;
  chantier_id: string;
  phase_id: string;
  inspecteur_nom: string;
  date_visite: string;
  statut: string;
  notes: string | null;
  syncStatus: SyncStatus;
  updated_at: string;
}

export interface OfflineReponse {
  id: string;
  visite_id: string;
  checklist_item_id: string;
  resultat: string;
  syncStatus: SyncStatus;
}

export interface OfflineEcart {
  id: string;
  visite_id: string;
  checklist_item_id: string;
  entreprise_id: string | null;
  constat: string;
  photo_url: string | null;
  severite: string;
  statut: string;
  delai_resolution: string | null;
  syncStatus: SyncStatus;
  updated_at: string;
}

export interface OfflinePhoto {
  id: string;
  ecart_id: string;
  blob: Blob;
  syncStatus: SyncStatus;
  created_at: string;
}

const db = new Dexie("WokSiteInspection") as Dexie & {
  offlineVisites: EntityTable<OfflineVisite, "id">;
  offlineReponses: EntityTable<OfflineReponse, "id">;
  offlineEcarts: EntityTable<OfflineEcart, "id">;
  offlinePhotos: EntityTable<OfflinePhoto, "id">;
};

db.version(1).stores({
  offlineVisites: "id, chantier_id, syncStatus, updated_at",
  offlineReponses: "id, visite_id, checklist_item_id, syncStatus",
  offlineEcarts: "id, visite_id, syncStatus, updated_at",
  offlinePhotos: "id, ecart_id, syncStatus, created_at",
});

export { db };
