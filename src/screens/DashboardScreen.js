import { Activity, AlertTriangle, Droplets, Thermometer, Zap } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';

export default function DashboardScreen() {
  const [telemetria, setTelemetria] = useState({ temp: '-.-', hum: '-.-', alertas: 0 });
  const [feed, setFeed] = useState([]);

  useEffect(() => {
    // Simulação de telemetria em tempo real
    const timer = setInterval(() => {
      setTelemetria({
        temp: (Math.random() * (5) + -18).toFixed(1), // Temp de congelador
        hum: (Math.random() * (20) + 40).toFixed(1),
        alertas: Math.floor(Math.random() * 3)
      });

      setFeed(prev => [
        { id: Date.now(), msg: `Sync efetuado com Nó Edge. Latência: ${Math.floor(Math.random()*40+10)}ms`, type: 'info' },
        ...prev.slice(0, 4)
      ]);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        <View style={styles.headerCard}>
          <View style={styles.iconBoxPrimary}><Activity size={24} color="#0f172a" /></View>
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={styles.headerTitle}>DASHBOARD OPERACIONAL</Text>
            <Text style={styles.headerSubtitle}>Monitorização Global de Telemetria</Text>
          </View>
        </View>

        <View style={styles.kpiContainer}>
          <View style={[styles.kpiCard, { borderTopColor: '#38bdf8' }]}>
            <View style={styles.kpiHeader}><Thermometer size={14} color="#38bdf8" /><Text style={styles.kpiTitle}>MÉDIA TÉRMICA</Text></View>
            <Text style={styles.kpiValue}>{telemetria.temp}<Text style={styles.kpiUnit}> °C</Text></Text>
          </View>

          <View style={[styles.kpiCard, { borderTopColor: '#10b981' }]}>
            <View style={styles.kpiHeader}><Droplets size={14} color="#10b981" /><Text style={styles.kpiTitle}>UMIDADE MÉDIA</Text></View>
            <Text style={styles.kpiValue}>{telemetria.hum}<Text style={styles.kpiUnit}> %</Text></Text>
          </View>

          <View style={[styles.kpiCard, { borderTopColor: telemetria.alertas > 0 ? '#ef4444' : '#64748b' }]}>
            <View style={styles.kpiHeader}><AlertTriangle size={14} color={telemetria.alertas > 0 ? '#ef4444' : '#64748b'} /><Text style={styles.kpiTitle}>ALARMES ATIVOS</Text></View>
            <Text style={[styles.kpiValue, { color: telemetria.alertas > 0 ? '#ef4444' : '#fff' }]}>{telemetria.alertas}</Text>
          </View>
        </View>

        <View style={styles.panel}>
          <Text style={styles.panelTitle}><Zap size={14} color="#f59e0b" /> FEED DE EVENTOS EM TEMPO REAL</Text>
          <View style={styles.terminalBox}>
            {feed.map((item) => (
              <View key={item.id} style={styles.terminalLine}>
                <Text style={styles.terminalTime}>[{new Date(item.id).toLocaleTimeString()}]</Text>
                <Text style={styles.terminalMsg}>{item.msg}</Text>
              </View>
            ))}
            {feed.length === 0 && <Text style={styles.terminalMsg}>A aguardar telemetria...</Text>}
          </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#020617' },
  scrollContent: { padding: 16 },
  headerCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#0b1120', padding: 16, borderRadius: 12, borderWidth: 1, borderColor: '#1e293b', marginBottom: 20 },
  iconBoxPrimary: { width: 44, height: 44, borderRadius: 10, backgroundColor: '#38bdf8', alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 16, fontWeight: '900', color: '#fff', letterSpacing: 0.5 },
  headerSubtitle: { fontSize: 11, color: '#94a3b8', fontWeight: 'bold' },
  kpiContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 20 },
  kpiCard: { flex: 1, minWidth: '45%', backgroundColor: '#0b1120', padding: 16, borderRadius: 12, borderWidth: 1, borderColor: '#1e293b', borderTopWidth: 3 },
  kpiHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 },
  kpiTitle: { fontSize: 10, fontWeight: '900', color: '#94a3b8' },
  kpiValue: { fontSize: 24, fontWeight: '900', color: '#fff', fontFamily: 'monospace' },
  kpiUnit: { fontSize: 12, color: '#64748b' },
  panel: { backgroundColor: '#0b1120', borderRadius: 12, borderWidth: 1, borderColor: '#1e293b', padding: 16 },
  panelTitle: { color: '#f59e0b', fontSize: 12, fontWeight: '900', marginBottom: 12, letterSpacing: 1 },
  terminalBox: { backgroundColor: '#020617', padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#1e293b', minHeight: 150 },
  terminalLine: { flexDirection: 'row', marginBottom: 6, gap: 8 },
  terminalTime: { color: '#64748b', fontSize: 10, fontFamily: 'monospace' },
  terminalMsg: { color: '#10b981', fontSize: 10, fontFamily: 'monospace', flex: 1 }
});