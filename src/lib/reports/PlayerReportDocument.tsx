import { Document, Page, View, Text, StyleSheet } from "@react-pdf/renderer";
import { STAT_LABELS } from "@/lib/stats/statLabels";

const COLORS = {
  navy: "#1c2a5e",
  navyDeep: "#04060f",
  accent: "#c99a1e", // versión más oscura del dorado de marca, más legible sobre blanco
  text: "#111827",
  muted: "#6b7280",
  border: "#e5e7eb",
  track: "#f1f2f6",
};

const styles = StyleSheet.create({
  page: { padding: 40, fontSize: 10, fontFamily: "Helvetica", color: COLORS.text },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    borderBottom: `2px solid ${COLORS.navy}`,
    paddingBottom: 12,
    marginBottom: 20,
  },
  brand: { fontSize: 14, fontFamily: "Helvetica-Bold", color: COLORS.navy },
  brandSub: { fontSize: 8, color: COLORS.muted, marginTop: 2 },
  dateText: { fontSize: 8, color: COLORS.muted, textAlign: "right" },
  playerName: { fontSize: 22, fontFamily: "Helvetica-Bold", color: COLORS.navyDeep },
  playerMeta: { fontSize: 10, color: COLORS.muted, marginTop: 4 },
  sectionTitle: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    color: COLORS.navy,
    marginTop: 20,
    marginBottom: 8,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  infoGrid: { flexDirection: "row", flexWrap: "wrap", gap: 0 },
  infoCell: { width: "33%", marginBottom: 10, paddingRight: 8 },
  infoLabel: { fontSize: 8, color: COLORS.muted, textTransform: "uppercase" },
  infoValue: { fontSize: 11, color: COLORS.text, marginTop: 2, fontFamily: "Helvetica-Bold" },
  barRow: { flexDirection: "row", alignItems: "center", marginBottom: 7 },
  barLabel: { width: 130, fontSize: 9, color: COLORS.text },
  barTrack: { flex: 1, height: 8, backgroundColor: COLORS.track, borderRadius: 4, overflow: "hidden" },
  barFill: { height: 8, backgroundColor: COLORS.accent, borderRadius: 4 },
  barValue: { width: 32, fontSize: 9, color: COLORS.muted, textAlign: "right" },
  footer: {
    position: "absolute",
    bottom: 24,
    left: 40,
    right: 40,
    borderTop: `1px solid ${COLORS.border}`,
    paddingTop: 8,
    fontSize: 8,
    color: COLORS.muted,
    flexDirection: "row",
    justifyContent: "space-between",
  },
});

export type PlayerReportData = {
  name: string;
  positionGroup: string;
  nationality: string | null;
  foot: string | null;
  teamName: string | null;
  leagueName: string | null;
  marketValueEur: number | null;
  season: string | null;
  minutesPlayed: number | null;
  percentiles: Record<string, number> | null;
  tenantName: string;
};

export function PlayerReportDocument({ data }: { data: PlayerReportData }) {
  const generatedAt = new Date().toLocaleDateString("es-AR", { year: "numeric", month: "long", day: "numeric" });
  const percentileEntries = data.percentiles
    ? Object.entries(data.percentiles).sort((a, b) => b[1] - a[1])
    : [];

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View>
            <Text style={styles.brand}>{data.tenantName}</Text>
            <Text style={styles.brandSub}>Informe de Scouting — Scoutline Trinidense</Text>
          </View>
          <Text style={styles.dateText}>Generado el {generatedAt}</Text>
        </View>

        <Text style={styles.playerName}>{data.name}</Text>
        <Text style={styles.playerMeta}>
          {data.positionGroup} · {data.nationality ?? "Nacionalidad no cargada"} ·{" "}
          {data.teamName ?? "Sin equipo"} {data.leagueName ? `(${data.leagueName})` : ""}
        </Text>

        <Text style={styles.sectionTitle}>Datos generales</Text>
        <View style={styles.infoGrid}>
          <View style={styles.infoCell}>
            <Text style={styles.infoLabel}>Pie</Text>
            <Text style={styles.infoValue}>{data.foot ?? "—"}</Text>
          </View>
          <View style={styles.infoCell}>
            <Text style={styles.infoLabel}>Valor de mercado</Text>
            <Text style={styles.infoValue}>
              {data.marketValueEur ? `€${data.marketValueEur.toLocaleString()}` : "—"}
            </Text>
          </View>
          <View style={styles.infoCell}>
            <Text style={styles.infoLabel}>Temporada</Text>
            <Text style={styles.infoValue}>{data.season ?? "—"}</Text>
          </View>
          <View style={styles.infoCell}>
            <Text style={styles.infoLabel}>Minutos jugados</Text>
            <Text style={styles.infoValue}>{data.minutesPlayed ?? "—"}</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Percentiles vs. cohorte (misma posición/temporada)</Text>
        {percentileEntries.length === 0 ? (
          <Text style={{ fontSize: 9, color: COLORS.muted }}>Todavía no hay percentiles calculados.</Text>
        ) : (
          percentileEntries.map(([key, value]) => (
            <View key={key} style={styles.barRow}>
              <Text style={styles.barLabel}>{STAT_LABELS[key] ?? key}</Text>
              <View style={styles.barTrack}>
                <View style={[styles.barFill, { width: `${Math.max(2, Math.min(100, value))}%` }]} />
              </View>
              <Text style={styles.barValue}>{Math.round(value)}</Text>
            </View>
          ))
        )}

        <View style={styles.footer} fixed>
          <Text>Scoutline Trinidense · Generado automáticamente</Text>
          <Text render={({ pageNumber, totalPages }) => `Página ${pageNumber} de ${totalPages}`} />
        </View>
      </Page>
    </Document>
  );
}
