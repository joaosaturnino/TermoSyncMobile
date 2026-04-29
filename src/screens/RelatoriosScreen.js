import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useContext } from 'react';
import { Platform, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { AppContext } from '../context/AppContext';

export default function RelatoriosScreen({ navigation }) {
  // Simulando os dados do AppContext / Props da Web
  const { totalEnergia = 120.5, slaCompliance = 98.5, mktValueProcessado = 2.4, isOffline } = useContext(AppContext) || {};

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.openDrawer()} style={{ padding: 5 }}>
          <Ionicons name="menu" size={28} color="#059669" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Inteligência ESG</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView contentContainerStyle={styles.listContainer}>
        
        {/* KPIs SUPERIORES */}
        <View style={styles.kpiGrid}>
          <View style={styles.kpiCard}>
            <View style={styles.kpiHeader}>
              <Text style={styles.kpiTitle}>Consumo Energético</Text>
              <View style={[styles.kpiIconBox, { backgroundColor: 'rgba(245, 158, 11, 0.1)' }]}>
                <MaterialCommunityIcons name="lightning-bolt" size={18} color="#f59e0b" />
              </View>
            </View>
            <Text style={[styles.kpiValue, { color: '#38bdf8' }]}>{totalEnergia} <Text style={styles.kpiUnit}>kWh</Text></Text>
            <Text style={styles.kpiSub}>Impacto na pegada de carbono</Text>
          </View>

          <View style={styles.kpiCard}>
            <View style={styles.kpiHeader}>
              <Text style={styles.kpiTitle}>Conformidade Legal</Text>
              <View style={[styles.kpiIconBox, { backgroundColor: 'rgba(16, 185, 129, 0.1)' }]}>
                <MaterialCommunityIcons name="check-decagram" size={18} color="#10b981" />
              </View>
            </View>
            <Text style={[styles.kpiValue, { color: '#10b981' }]}>{slaCompliance} <Text style={styles.kpiUnit}>%</Text></Text>
            <Text style={styles.kpiSub}>Tempo dentro da norma ANVISA</Text>
          </View>

          <View style={styles.kpiCard}>
            <View style={styles.kpiHeader}>
              <Text style={styles.kpiTitle}>MKT - Média Cinética</Text>
              <View style={[styles.kpiIconBox, { backgroundColor: 'rgba(59, 130, 246, 0.1)' }]}>
                <MaterialCommunityIcons name="brain" size={18} color="#3b82f6" />
              </View>
            </View>
            <Text style={[styles.kpiValue, { color: '#3b82f6' }]}>{mktValueProcessado} <Text style={styles.kpiUnit}>°C</Text></Text>
            <Text style={styles.kpiSub}>Impacto na vida útil do produto</Text>
          </View>
        </View>

        {/* FILTROS E EXPORTAÇÃO */}
        <View style={styles.controlsCard}>
          <View style={styles.controlsHeader}>
            <MaterialCommunityIcons name="shield-check" size={22} color="#059669" />
            <Text style={styles.controlsTitle}>Auditoria de Qualidade RDC</Text>
          </View>
          <Text style={styles.controlsInfo}>* Para gerar o Gráfico Detalhado e a Tabela em Planilha (CSV) ou PDF Oficial assinado, por favor, aceda à plataforma Web Num Computador.</Text>
          
          <TouchableOpacity style={styles.btnExport} disabled={isOffline}>
            <MaterialCommunityIcons name="file-pdf-box" size={20} color="#fff" />
            <Text style={styles.btnExportText}>Baixar Resumo em PDF</Text>
          </TouchableOpacity>
        </View>

        {/* Placeholder do Gráfico no Mobile */}
        <View style={styles.chartPlaceholder}>
          <MaterialCommunityIcons name="chart-line" size={48} color="#cbd5e1" style={{ marginBottom: 15 }} />
          <Text style={styles.chartText}>Telemetria em Tempo Real</Text>
          <Text style={styles.chartSub}>Consulte o TermoSync Web para o gráfico detalhado.</Text>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 15, backgroundColor: '#fff', borderBottomWidth: 1, borderColor: '#e2e8f0', paddingTop: Platform.OS === 'ios' ? 50 : 15 },
  headerTitle: { fontSize: 18, fontWeight: '900', color: '#0f172a' },
  listContainer: { padding: 15, paddingBottom: 40 },
  
  kpiGrid: { gap: 15, marginBottom: 20 },
  kpiCard: { backgroundColor: '#fff', padding: 20, borderRadius: 16, borderWidth: 1, borderColor: '#e2e8f0', elevation: 2, shadowColor: '#000', shadowOffset: {width: 0, height: 4}, shadowOpacity: 0.05 },
  kpiHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 15 },
  kpiTitle: { fontSize: 11, fontWeight: '800', color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.5 },
  kpiIconBox: { padding: 8, borderRadius: 10 },
  kpiValue: { fontSize: 42, fontWeight: '900', lineHeight: 46 },
  kpiUnit: { fontSize: 18, opacity: 0.6 },
  kpiSub: { fontSize: 12, color: '#94a3b8', fontWeight: '600', marginTop: 5 },

  controlsCard: { backgroundColor: '#fff', padding: 20, borderRadius: 16, borderWidth: 1, borderColor: '#e2e8f0', marginBottom: 20 },
  controlsHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 15, borderBottomWidth: 1, borderColor: '#f1f5f9', paddingBottom: 15 },
  controlsTitle: { fontSize: 16, fontWeight: '900', color: '#0f172a' },
  controlsInfo: { fontSize: 13, color: '#64748b', fontStyle: 'italic', lineHeight: 20, marginBottom: 20 },
  btnExport: { backgroundColor: '#ef4444', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 15, borderRadius: 12, gap: 8 },
  btnExportText: { color: '#fff', fontWeight: '900', fontSize: 15 },

  chartPlaceholder: { backgroundColor: '#f1f5f9', padding: 40, borderRadius: 16, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderStyle: 'dashed', borderColor: '#cbd5e1' },
  chartText: { fontSize: 16, fontWeight: '800', color: '#64748b' },
  chartSub: { fontSize: 13, color: '#94a3b8', textAlign: 'center', marginTop: 5 }
});