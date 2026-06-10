import {
  Activity,
  Building2,
  Cpu,
  DollarSign,
  FileSpreadsheet,
  FileText,
  PieChart,
  Server,
  ShieldCheck
} from 'lucide-react-native';
import { useState } from 'react';
import {
  ActivityIndicator, Alert, SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

export default function RelatoriosScreen() {
  const [isProcessing, setIsProcessing] = useState(null);

  const modulosBI = [
    { id: 'FINOPS', titulo: 'Core Financeiro (RevOps)', desc: 'MRR, dívidas e faturas.', icon: DollarSign, color: '#10b981' },
    { id: 'SOC', titulo: 'Auditoria Zero-Trust (SOC)', desc: 'Logins e purgas do BD.', icon: ShieldCheck, color: '#a855f7' },
    { id: 'EDGE', titulo: 'Inventário Edge Computing', desc: 'Mapeamento IoT (MAC/Wi-Fi).', icon: Server, color: '#38bdf8' },
    { id: 'CAOS', titulo: 'Auditoria de Resiliência', desc: 'Anomalias no sistema.', icon: Cpu, color: '#ef4444' },
    { id: 'TENANTS', titulo: 'Ecossistema de Tenants', desc: 'Clientes, capacidades e SLAs.', icon: Building2, color: '#f59e0b' },
    { id: 'SYSOPS', titulo: 'Saúde (SysOps)', desc: 'Métricas vitais Node/MySQL.', icon: Activity, color: '#6366f1' }
  ];

  const simularExportacao = (id, formato) => {
    setIsProcessing(`${id}_${formato}`);
    setTimeout(() => {
      setIsProcessing(null);
      Alert.alert('Download Concluído', `Relatório ${id} extraído com sucesso no formato ${formato}.`);
    }, 1500);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        {/* HEADER */}
        <View style={styles.header}>
          <PieChart size={32} color="#38bdf8" />
          <Text style={styles.headerTitle}>ANALYTICS & BI</Text>
          <Text style={styles.headerSubtitle}>Extração de dados reais do cluster MySQL.</Text>
        </View>

        {/* GRID DE MÓDULOS BI */}
        {modulosBI.map(mod => (
          <View key={mod.id} style={styles.biCard}>
            <View style={[styles.biCardGlow, { backgroundColor: mod.color }]} />
            
            <View style={styles.biHeader}>
              <View style={[styles.iconWrapper, { backgroundColor: `${mod.color}20` }]}>
                <mod.icon size={24} color={mod.color} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.biTitle}>{mod.titulo}</Text>
                <Text style={styles.biDesc}>{mod.desc}</Text>
              </View>
            </View>

            <View style={styles.biActions}>
              <TouchableOpacity 
                style={styles.btnAction} 
                onPress={() => simularExportacao(mod.id, 'PDF')}
                disabled={isProcessing !== null}
              >
                {isProcessing === `${mod.id}_PDF` ? <ActivityIndicator size="small" color="#fff"/> : <FileText size={16} color="#fff"/>}
                <Text style={styles.btnText}>GERAR PDF</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.btnAction} 
                onPress={() => simularExportacao(mod.id, 'CSV')}
                disabled={isProcessing !== null}
              >
                {isProcessing === `${mod.id}_CSV` ? <ActivityIndicator size="small" color="#fff"/> : <FileSpreadsheet size={16} color="#fff"/>}
                <Text style={styles.btnText}>TABELA CSV</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#020617' },
  scrollContent: { padding: 16, paddingBottom: 40 },
  
  header: { alignItems: 'center', marginBottom: 24, paddingVertical: 20, backgroundColor: '#0b1120', borderRadius: 16, borderWidth: 1, borderColor: '#1e293b' },
  headerTitle: { color: '#fff', fontSize: 18, fontWeight: '900', marginTop: 12, letterSpacing: 1 },
  headerSubtitle: { color: '#94a3b8', fontSize: 12, marginTop: 6, textAlign: 'center', paddingHorizontal: 20 },

  biCard: { backgroundColor: '#0b1120', borderRadius: 12, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: '#1e293b', overflow: 'hidden' },
  biCardGlow: { position: 'absolute', top: 0, left: 0, right: 0, height: 3 },
  
  biHeader: { flexDirection: 'row', alignItems: 'center', gap: 16, marginBottom: 20 },
  iconWrapper: { width: 50, height: 50, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  biTitle: { fontSize: 14, fontWeight: '900', color: '#fff', marginBottom: 4 },
  biDesc: { fontSize: 11, color: '#94a3b8', lineHeight: 16 },

  biActions: { flexDirection: 'row', gap: 12, borderTopWidth: 1, borderTopColor: '#1e293b', paddingTop: 16 },
  btnAction: { flex: 1, backgroundColor: '#0f172a', borderWidth: 1, borderColor: '#334155', borderRadius: 8, paddingVertical: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  btnText: { color: '#fff', fontSize: 10, fontWeight: '900', letterSpacing: 0.5 }
});