import { Activity, AlertTriangle, Snowflake, Thermometer, Zap } from 'lucide-react-native';
import { SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';

const theme = {
  bg: '#020617', card: '#0f172a', textMain: '#f8fafc', textMuted: '#94a3b8',
  border: '#1e293b', success: '#10b981', danger: '#ef4444', info: '#38bdf8', warning: '#f59e0b'
};

export default function SensoresScreen() {
  const sensores = [
    { id: 1, nome: 'CONG-01', temp: -18.2, temp_max: -15, motor: true, degelo: false },
    { id: 2, nome: 'REF-04', temp: 8.5, temp_max: 6, motor: true, degelo: false }, // Excursão
    { id: 3, nome: 'ILHA-02', temp: -5.0, temp_max: 0, motor: false, degelo: true }, // Degelo
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Activity size={24} color={theme.info} />
        <View style={{ marginLeft: 12 }}>
          <Text style={styles.title}>Monitorização Live</Text>
          <Text style={styles.subtitle}>Telemetria Térmica em Tempo Real</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.grid}>
        {sensores.map(s => {
          const isDanger = s.temp > s.temp_max;
          let statusColor = theme.success; let StatusIcon = Zap; let statusText = 'Operacional';
          
          if (s.degelo) { statusColor = theme.info; StatusIcon = Snowflake; statusText = 'Em Degelo'; }
          else if (isDanger) { statusColor = theme.danger; StatusIcon = AlertTriangle; statusText = 'Excursão Térmica'; }

          return (
            <View key={s.id} style={[styles.card, isDanger && styles.cardDanger]}>
              <View style={styles.cardTop}>
                <Text style={styles.equipName}>{s.nome}</Text>
                <View style={[styles.statusBadge, { backgroundColor: `${statusColor}20` }]}>
                  <StatusIcon size={12} color={statusColor} />
                  <Text style={[styles.statusText, { color: statusColor }]}>{statusText}</Text>
                </View>
              </View>

              <View style={styles.telemetryBox}>
                <View style={styles.reading}>
                  <Thermometer size={16} color={isDanger ? theme.danger : theme.textMuted} />
                  <Text style={[styles.readingVal, isDanger && { color: theme.danger }]}>{s.temp}°C</Text>
                </View>
                <Text style={styles.limitText}>SLA Máx: {s.temp_max}°C</Text>
              </View>
            </View>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.bg },
  header: { flexDirection: 'row', alignItems: 'center', padding: 15, backgroundColor: theme.card, borderBottomWidth: 1, borderBottomColor: theme.border },
  title: { color: theme.textMain, fontSize: 20, fontWeight: '900' },
  subtitle: { color: theme.textMuted, fontSize: 12, fontWeight: '600' },
  grid: { padding: 15, gap: 15 },
  
  card: { backgroundColor: theme.card, padding: 15, borderRadius: 16, borderWidth: 1, borderColor: theme.border, borderLeftWidth: 4, borderLeftColor: theme.success },
  cardDanger: { borderLeftColor: theme.danger, backgroundColor: 'rgba(239, 68, 68, 0.05)', borderColor: 'rgba(239, 68, 68, 0.3)' },
  
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  equipName: { color: theme.textMain, fontSize: 18, fontWeight: '800', fontFamily: 'monospace' },
  statusBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  statusText: { fontSize: 10, fontWeight: '800', textTransform: 'uppercase' },

  telemetryBox: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  reading: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  readingVal: { color: theme.textMain, fontSize: 28, fontWeight: '900', fontFamily: 'monospace' },
  limitText: { color: theme.textMuted, fontSize: 11, fontWeight: '700', textTransform: 'uppercase' }
});