// Types TypeScript pour toutes les entités du modèle de données

export type PhaseNumero = 1 | 2 | 3 | 4 | 5;

export type ChantierStatut = "actif" | "termine";
export type VisiteStatut = "en_cours" | "terminee";
export type ResultatReponse = "conforme" | "non_conforme" | "non_applicable";
export type EcartSeverite = "a_corriger" | "stop_danger";
export type EcartStatut = "a_corriger" | "stop_danger" | "resolu";

export interface Phase {
  id: string;
  numero: PhaseNumero;
  nom: string;
  description: string | null;
  created_at: string;
}

export interface ChecklistItem {
  id: string;
  phase_id: string;
  corps_metier: string | null;
  question: string;
  reference_legale: string;
  ordre: number;
  created_at: string;
}

export interface Chantier {
  id: string;
  nom: string;
  adresse: string;
  date_debut: string;
  date_fin_prevue: string | null;
  responsable_securite: string;
  responsable_email: string;
  statut: ChantierStatut;
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Entreprise {
  id: string;
  nom: string;
  corps_metier: string;
  contact_nom: string | null;
  contact_email: string | null;
  contact_telephone: string | null;
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface ChantierEntreprise {
  id: string;
  chantier_id: string;
  entreprise_id: string;
  created_at: string;
}

export interface Visite {
  id: string;
  chantier_id: string;
  phase_id: string;
  inspecteur_nom: string;
  inspecteur_id: string | null;
  date_visite: string;
  statut: VisiteStatut;
  notes: string | null;
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface ReponseVisite {
  id: string;
  visite_id: string;
  checklist_item_id: string;
  resultat: ResultatReponse;
  created_at: string;
  updated_at: string;
}

export interface Ecart {
  id: string;
  visite_id: string | null;
  checklist_item_id: string;
  entreprise_id: string | null;
  constat: string;
  photo_url: string | null;
  severite: EcartSeverite;
  statut: EcartStatut;
  delai_resolution: string | null;
  date_resolution: string | null;
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
}

// Types enrichis avec relations (pour les queries Supabase avec select)
export interface VisiteWithRelations extends Visite {
  phase: Phase;
  ecart: Ecart[];
  reponse_visite: (ReponseVisite & { checklist_item: ChecklistItem })[];
}

export interface EcartWithRelations extends Ecart {
  checklist_item: ChecklistItem;
  entreprise: Entreprise | null;
}

export interface ChantierWithEcartsEnRetard extends Chantier {
  ecarts_en_retard: number;
}
