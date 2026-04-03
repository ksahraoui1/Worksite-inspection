import {
  Document,
  Page,
  Text,
  View,
  Image,
  StyleSheet,
} from "@react-pdf/renderer";
import type {
  Chantier,
  Visite,
  Phase,
  ReponseVisite,
  ChecklistItem,
  Ecart,
  Entreprise,
} from "@/types/database";

const styles = StyleSheet.create({
  page: { padding: 40, fontSize: 10, fontFamily: "Helvetica" },
  header: {
    backgroundColor: "#dc2626",
    color: "white",
    padding: 16,
    marginBottom: 20,
    borderRadius: 4,
  },
  headerTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 4 },
  headerSub: { fontSize: 10 },
  section: { marginBottom: 16 },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "bold",
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
    paddingBottom: 4,
  },
  row: { flexDirection: "row", marginBottom: 4 },
  label: { width: 120, color: "#6b7280", fontSize: 9 },
  value: { flex: 1, fontWeight: "bold" },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#f3f4f6",
    padding: 6,
    borderRadius: 2,
    marginBottom: 2,
  },
  tableRow: {
    flexDirection: "row",
    padding: 6,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  colQuestion: { flex: 3 },
  colRef: { flex: 1.5 },
  colResult: { flex: 1 },
  conforme: { color: "#16a34a" },
  nonConforme: { color: "#dc2626", fontWeight: "bold" },
  na: { color: "#6b7280" },
  ecartBox: {
    border: "1 solid #fecaca",
    borderRadius: 4,
    padding: 10,
    marginBottom: 8,
    backgroundColor: "#fef2f2",
  },
  ecartSeverity: {
    fontSize: 9,
    color: "#dc2626",
    fontWeight: "bold",
    marginBottom: 4,
  },
  photo: { width: 150, height: 100, objectFit: "cover", borderRadius: 4 },
  footer: {
    position: "absolute",
    bottom: 30,
    left: 40,
    right: 40,
    fontSize: 8,
    color: "#9ca3af",
    flexDirection: "row",
    justifyContent: "space-between",
  },
});

interface RapportVisiteProps {
  chantier: Chantier;
  visite: Visite;
  phase: Phase;
  reponses: (ReponseVisite & { checklist_item: ChecklistItem })[];
  ecarts: (Ecart & {
    checklist_item: ChecklistItem;
    entreprise: Entreprise | null;
  })[];
}

const resultatLabels: Record<string, string> = {
  conforme: "Conforme",
  non_conforme: "Non conforme",
  non_applicable: "N/A",
};

export function RapportVisite({
  chantier,
  visite,
  phase,
  reponses,
  ecarts,
}: RapportVisiteProps) {
  const dateVisite = new Date(visite.date_visite).toLocaleDateString("fr-CH", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* En-tête */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Rapport de visite d&apos;inspection</Text>
          <Text style={styles.headerSub}>
            Conformité OTConst / SUVA — WokSite Inspection
          </Text>
        </View>

        {/* Info chantier */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Chantier</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Nom</Text>
            <Text style={styles.value}>{chantier.nom}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Adresse</Text>
            <Text style={styles.value}>{chantier.adresse}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Responsable</Text>
            <Text style={styles.value}>{chantier.responsable_securite}</Text>
          </View>
        </View>

        {/* Info visite */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Visite</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Date</Text>
            <Text style={styles.value}>{dateVisite}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Inspecteur</Text>
            <Text style={styles.value}>{visite.inspecteur_nom}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Phase</Text>
            <Text style={styles.value}>
              Phase {phase.numero} : {phase.nom}
            </Text>
          </View>
        </View>

        {/* Tableau points de contrôle */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Points de contrôle</Text>
          <View style={styles.tableHeader}>
            <Text style={[styles.colQuestion, { fontWeight: "bold" }]}>
              Question
            </Text>
            <Text style={[styles.colRef, { fontWeight: "bold" }]}>
              Réf. légale
            </Text>
            <Text style={[styles.colResult, { fontWeight: "bold" }]}>
              Résultat
            </Text>
          </View>
          {reponses.map((r) => (
            <View key={r.id} style={styles.tableRow}>
              <Text style={styles.colQuestion}>
                {r.checklist_item.question}
              </Text>
              <Text style={styles.colRef}>
                {r.checklist_item.reference_legale}
              </Text>
              <Text
                style={[
                  styles.colResult,
                  r.resultat === "conforme"
                    ? styles.conforme
                    : r.resultat === "non_conforme"
                      ? styles.nonConforme
                      : styles.na,
                ]}
              >
                {resultatLabels[r.resultat]}
              </Text>
            </View>
          ))}
        </View>

        {/* Écarts */}
        {ecarts.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              Écarts constatés ({ecarts.length})
            </Text>
            {ecarts.map((ecart) => (
              <View key={ecart.id} style={styles.ecartBox}>
                <Text style={styles.ecartSeverity}>
                  {ecart.severite === "stop_danger"
                    ? "⚠️ STOP DANGER"
                    : "À corriger"}
                </Text>
                <Text style={{ marginBottom: 4 }}>{ecart.constat}</Text>
                <Text style={{ fontSize: 8, color: "#6b7280" }}>
                  {ecart.checklist_item.reference_legale} —{" "}
                  {ecart.entreprise?.nom ?? "Non assigné"}
                  {ecart.delai_resolution &&
                    ` — Délai: ${new Date(ecart.delai_resolution).toLocaleDateString("fr-CH")}`}
                </Text>
                {ecart.photo_url && (
                  <Image src={ecart.photo_url} style={styles.photo} />
                )}
              </View>
            ))}
          </View>
        )}

        {/* Pied de page */}
        <View style={styles.footer} fixed>
          <Text>WokSite Inspection — {chantier.nom}</Text>
          <Text>
            Généré le{" "}
            {new Date().toLocaleDateString("fr-CH", {
              day: "2-digit",
              month: "long",
              year: "numeric",
            })}
          </Text>
        </View>
      </Page>
    </Document>
  );
}
