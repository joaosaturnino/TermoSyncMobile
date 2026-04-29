import {
  BrainCircuit,
  CheckCircle,
  FileText,
  Terminal,
  Thermometer,
  Zap
} from 'lucide-react-native';
import {
  SafeAreaView,
  ScrollView, StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

const theme = {
  bg: '#020617', card: '#0f172a', textMain: '#f8fafc', textMuted: '#94a3b8',
  border: '#1e293b', primary: '#059669', info: '#38bdf8', danger: '#ef4444'
};

export default function RelatoriosScreen() {
  const rawData = [
    { hora: '14:00', nome: 'CONG-01', temp: -18.2, hr: 45, alert: false },
    { hora: '14:05', nome: 'CONG-01', temp: -12.5, hr: 50, alert: true },
    { hora: '14:10', nome: 'CONG-01', temp: -18.5, hr: 46, alert: false },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        {/* KPIS NEON (ESG & MKT) */}
        <View style={styles.kpiGrid}>
          <View style={styles.kpiCard}>
            <View style={styles.kpiHeader}>
              <Text style={styles.kpiTitle}>Consumo ESG</Text>
              <Zap size={16} color={theme.warning} />
            </View>
            <Text style={[styles.kpiValue, { color: theme.warning }]}>452.1 <Text style={styles.kpiUnit}>kWh</Text></Text>
          </View>
          
          <View style={styles.kpiCard}>
            <View style={styles.kpiHeader}>
              <Text style={styles.kpiTitle}>Legal (SLA)</Text>
              <CheckCircle size={16} color={theme.primary} />
            </View>
            <Text style={[styles.kpiValue, { color: theme.primary }]}>99.8 <Text style={styles.kpiUnit}>%</Text></Text>
          </View>

          <View style={styles.kpiCard}>
            <View style={styles.kpiHeader}>
              <Text style={styles.kpiTitle}>MKT (Cinética)</Text>
              <BrainCircuit size={16} color={theme.info} />
            </View>
            <Text style={[styles.kpiValue, { color: theme.info }]}>-17.5 <Text style={styles.kpiUnit}>°C</Text></Text>
          </View>
          
          <View style={styles.kpiCard}>
            <View style={styles.kpiHeader}>
              <Text style={styles.kpiTitle}>Pico Térmico</Text>
              <Thermometer size={16} color={theme.danger} />
            </View>
            <Text style={[styles.kpiValue, { color: theme.danger }]}>-12.5 <Text style={styles.kpiUnit}>°C</Text></Text>
          </View>
        </View>

        {/* CONTROLOS TÁTICOS */}
        <View style={styles.controlsCard}>
          <Text style={styles.controlsTitle}>Extração de Dados</Text>
          <View style={styles.btnRow}>
            <TouchableOpacity style={styles.btnExtract}>
              <FileText size={16} color="white" />
              <Text style={styles.btnExtractText}>PDF RDC</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.btnExtract, { backgroundColor: 'transparent', borderWidth: 1, borderColor: theme.border }]}>
              <Terminal size={16} color={theme.textMain} />
              <Text style={[styles.btnExtractText, { color: theme.textMain }]}>CSV Raw</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* TERMINAL DE RAW DATA */}
        <View style={styles.terminalCard}>
          <View style={styles.terminalHeader}>
            <Terminal size={16} color={theme.textMuted} />
            <Text style={styles.terminalTitle}>Data-Log (Live)</Text>
          </View>
          
          <View style={styles.tableHeader}>
            <Text style={[styles.th, { flex: 1 }]}>Hora</Text>
            <Text style={[styles.th, { flex: 2 }]}>Nó (Hardware)</Text>
            <Text style={[styles.th, { flex: 1, textAlign: 'right' }]}>Temp</Text>
          </View>

          {rawData.map((d, i) => (
            <View key={i} style={[styles.tableRow, d.alert && styles.rowAlert]}>
              <Text style={[styles.tdTime, { flex: 1 }]}>[{d.hora}]</Text>
              <Text style={[styles.tdNode, { flex: 2 }]}>{d.nome}</Text>
              <Text style={[styles.tdVal, { flex: 1, textAlign: 'right', color: d.alert ? theme.danger : theme.primary }]}>{d.temp}°C</Text>
            </View>
          ))}
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.bg },
  scrollContent: { padding: 15, paddingBottom: 40 },
  
  kpiGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 20 },
  kpiCard: { width: '48%', backgroundColor: theme.card, borderWidth: 1, borderColor: theme.border, borderRadius: 16, padding: 15, marginBottom: 15 },
  kpiHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  kpiTitle: { color: theme.textMuted, fontSize: 11, fontWeight: '800', textTransform: 'uppercase' },
  kpiValue: { fontSize: 24, fontWeight: '900', fontFamily: 'monospace' },
  kpiUnit: { fontSize: 14, opacity: 0.6 },

  controlsCard: { backgroundColor: theme.card, borderWidth: 1, borderColor: theme.border, borderRadius: 16, padding: 15, marginBottom: 20 },
  controlsTitle: { color: theme.textMain, fontSize: 14, fontWeight: '800', marginBottom: 15 },
  btnRow: { flexDirection: 'row', gap: 10 },
  btnExtract: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: theme.primary, paddingVertical: 12, borderRadius: 10 },
  btnExtractText: { color: 'white', fontWeight: '800', fontSize: 13 },

  terminalCard: { backgroundColor: '#020617', borderWidth: 1, borderColor: theme.border, borderRadius: 12, overflow: 'hidden' },
  terminalHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 12, backgroundColor: theme.card, borderBottomWidth: 1, borderBottomColor: theme.border },
  terminalTitle: { color: theme.textMuted, fontSize: 12, fontWeight: '800', textTransform: 'uppercase' },
  
  tableHeader: { flexDirection: 'row', paddingHorizontal: 12, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: theme.border },
  th: { color: theme.textMuted, fontSize: 10, fontWeight: '800', textTransform: 'uppercase' },
  
  tableRow: { flexDirection: 'row', paddingHorizontal: 12, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)' },
  rowAlert: { backgroundColor: 'rgba(239, 68, 68, 0.1)', borderLeftWidth: 2, borderLeftColor: theme.danger },
  tdTime: { color: theme.textMuted, fontSize: 11, fontFamily: 'monospace' },
  tdNode: { color: theme.textMain, fontSize: 12, fontWeight: '700' },
  tdVal: { fontSize: 12, fontWeight: '900', fontFamily: 'monospace' }
});