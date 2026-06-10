import { Activity, Network, Search, Server, Store } from 'lucide-react-native';
import { useState } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function LojasScreen() {
  const [busca, setBusca] = useState('');

  const lojas = [
    { id: 1, nome: 'Filial Centro (SP)', ip: '192.168.0.10', nodes: 24, status: 'Sincronizado' },
    { id: 2, nome: 'Armazém Norte (RJ)', ip: '192.168.0.22', nodes: 12, status: 'Atraso (42ms)' },
    { id: 3, nome: 'Distribuidora Sul', ip: 'OFFLINE', nodes: 0, status: 'Desconectado' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        <View style={styles.headerCard}>
          <Store size={28} color="#f59e0b" />
          <View style={{ marginLeft: 12 }}>
            <Text style={styles.headerTitle}>INFRAESTRUTURA FÍSICA</Text>
            <Text style={styles.headerSubtitle}>Gestão de Lojas e Gateways</Text>
          </View>
        </View>

        <View style={styles.searchBox}>
          <Search size={18} color="#94a3b8" />
          <TextInput style={styles.searchInput} placeholder="Procurar Filial..." placeholderTextColor="#64748b" value={busca} onChangeText={setBusca} />
        </View>

        {lojas.map(loja => (
          <View key={loja.id} style={[styles.storeCard, loja.status === 'Desconectado' && styles.storeCardOffline]}>
            <View style={styles.storeHeader}>
              <Text style={styles.storeName}>{loja.nome}</Text>
              <View style={[styles.statusBadge, loja.status === 'Desconectado' ? styles.badgeRed : styles.badgeGreen]}>
                <Text style={styles.statusText}>{loja.status}</Text>
              </View>
            </View>

            <View style={styles.specsRow}>
              <View style={styles.specBox}>
                <Network size={14} color="#64748b" />
                <Text style={styles.specLabel}>IP GATEWAY:</Text>
                <Text style={styles.specValue}>{loja.ip}</Text>
              </View>
              <View style={styles.specBox}>
                <Server size={14} color="#64748b" />
                <Text style={styles.specLabel}>NÓS ATIVOS:</Text>
                <Text style={[styles.specValue, {color: '#38bdf8'}]}>{loja.nodes}</Text>
              </View>
            </View>
            
            <TouchableOpacity style={styles.btnAction}>
              <Activity size={14} color="#cbd5e1" /><Text style={styles.btnActionText}>VER TELEMETRIA DA LOJA</Text>
            </TouchableOpacity>
          </View>
        ))}

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#020617' },
  scrollContent: { padding: 16 },
  headerCard: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  headerTitle: { fontSize: 16, fontWeight: '900', color: '#fff', letterSpacing: 0.5 },
  headerSubtitle: { fontSize: 11, color: '#94a3b8', fontWeight: 'bold' },
  searchBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#0b1120', borderWidth: 1, borderColor: '#1e293b', borderRadius: 10, paddingHorizontal: 12, height: 44, marginBottom: 20 },
  searchInput: { flex: 1, marginLeft: 8, color: '#fff', fontSize: 13, fontFamily: 'monospace' },
  
  storeCard: { backgroundColor: '#0b1120', borderRadius: 12, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#1e293b', borderTopWidth: 3, borderTopColor: '#f59e0b' },
  storeCardOffline: { borderTopColor: '#ef4444', backgroundColor: 'rgba(239, 68, 68, 0.05)' },
  storeHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  storeName: { fontSize: 15, fontWeight: 'bold', color: '#fff' },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 },
  badgeGreen: { backgroundColor: 'rgba(16, 185, 129, 0.1)', borderWidth: 1, borderColor: '#10b981' },
  badgeRed: { backgroundColor: 'rgba(239, 68, 68, 0.1)', borderWidth: 1, borderColor: '#ef4444' },
  statusText: { fontSize: 9, fontWeight: '900', color: '#fff', fontFamily: 'monospace' },

  specsRow: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  specBox: { flex: 1, backgroundColor: '#020617', padding: 10, borderRadius: 8, borderWidth: 1, borderColor: '#1e293b' },
  specLabel: { fontSize: 9, color: '#64748b', fontWeight: 'bold', marginTop: 6, marginBottom: 2 },
  specValue: { fontSize: 12, color: '#cbd5e1', fontFamily: 'monospace', fontWeight: 'bold' },

  btnAction: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: '#0f172a', paddingVertical: 12, borderRadius: 8, borderWidth: 1, borderColor: '#334155' },
  btnActionText: { color: '#cbd5e1', fontSize: 10, fontWeight: '900', letterSpacing: 0.5 }
});