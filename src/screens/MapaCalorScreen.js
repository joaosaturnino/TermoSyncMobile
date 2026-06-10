import { Map, RefreshCw } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';

export default function MapaCalorScreen() {
  const [heatmap, setHeatmap] = useState([]);

  // Gera uma grelha 8x12 para simular o mapa da loja no telemóvel
  useEffect(() => {
    const generateHeatmap = () => {
      const grid = [];
      for (let i = 0; i < 96; i++) {
        // Gera valores de 0 a 4 (0: Normal, 4: Quente/Alerta)
        const val = Math.random() > 0.8 ? Math.floor(Math.random() * 4) + 1 : 0;
        grid.push(val);
      }
      setHeatmap(grid);
    };

    generateHeatmap();
    const interval = setInterval(generateHeatmap, 5000);
    return () => clearInterval(interval);
  }, []);

  const getCellColor = (val) => {
    switch(val) {
      case 1: return 'rgba(56, 189, 248, 0.4)'; // Frio
      case 2: return 'rgba(245, 158, 11, 0.4)'; // Morno
      case 3: return 'rgba(239, 68, 68, 0.6)';  // Quente
      case 4: return '#ef4444'; // Alerta Máximo
      default: return '#0f172a'; // Fundo Normal
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        <View style={styles.headerCard}>
          <Map size={28} color="#10b981" />
          <View style={{ marginLeft: 12, flex: 1 }}>
            <Text style={styles.headerTitle}>PLANTA DIGITAL</Text>
            <Text style={styles.headerSubtitle}>Mapeamento Térmico (Heatmap)</Text>
          </View>
          <RefreshCw size={20} color="#64748b" />
        </View>

        <View style={styles.heatmapWrapper}>
          <View style={styles.gridContainer}>
            {heatmap.map((val, idx) => (
              <View 
                key={idx} 
                style={[
                  styles.heatCell, 
                  { backgroundColor: getCellColor(val) },
                  val === 4 && styles.heatCellAlert
                ]} 
              />
            ))}
          </View>
        </View>

        <View style={styles.legendBox}>
          <Text style={styles.legendTitle}>LEGENDA TÉRMICA</Text>
          <View style={styles.legendRow}>
            <View style={[styles.legendDot, { backgroundColor: '#0f172a' }]} /><Text style={styles.legendText}>OTIMIZADO</Text>
            <View style={[styles.legendDot, { backgroundColor: 'rgba(56, 189, 248, 0.6)' }]} /><Text style={styles.legendText}>FRIO (RESFRIADO)</Text>
            <View style={[styles.legendDot, { backgroundColor: '#ef4444' }]} /><Text style={styles.legendText}>ALERTA TÉRMICO</Text>
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
  headerTitle: { fontSize: 16, fontWeight: '900', color: '#fff', letterSpacing: 0.5 },
  headerSubtitle: { fontSize: 11, color: '#94a3b8', fontWeight: 'bold' },

  heatmapWrapper: { backgroundColor: '#0b1120', padding: 16, borderRadius: 12, borderWidth: 1, borderColor: '#1e293b', marginBottom: 20 },
  gridContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 4, justifyContent: 'center' },
  heatCell: { width: '11%', aspectRatio: 1, borderRadius: 4, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  heatCellAlert: { shadowColor: '#ef4444', shadowOffset: {width:0,height:0}, shadowOpacity: 0.8, shadowRadius: 8, elevation: 5, borderColor: '#ef4444' },

  legendBox: { backgroundColor: '#020617', padding: 16, borderRadius: 12, borderWidth: 1, borderColor: '#1e293b', borderStyle: 'dashed' },
  legendTitle: { color: '#64748b', fontSize: 10, fontWeight: '900', marginBottom: 12, letterSpacing: 1 },
  legendRow: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  legendDot: { width: 12, height: 12, borderRadius: 2, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  legendText: { color: '#cbd5e1', fontSize: 10, fontWeight: 'bold', marginRight: 8 }
});