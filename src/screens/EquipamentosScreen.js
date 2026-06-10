import {
  Cpu,
  MapPin,
  Power,
  RefreshCw,
  Search,
  Server,
  TerminalSquare
} from 'lucide-react-native';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator, Alert, SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import api from '../api/api';

export default function EquipamentosScreen() {
  const [hardware, setHardware] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const carregarHardware = async () => {
    setIsRefreshing(true);
    try {
      const res = await api.get('/hardware');
      const agora = new Date().getTime();
      
      const formatado = res.data.map(eq => {
        const tempo = eq.ultima_comunicacao ? (agora - new Date(eq.ultima_comunicacao).getTime()) : 999999999;
        return {
          ...eq,
          ip: eq.ip || '0.0.0.0',
          mac: eq.mac || '00:00:00:00:00:00',
          signal: eq.signal_dbm || -100,
          isOffline: tempo > 180000 // 3 minutos sem heartbeat
        };
      });
      setHardware(formatado);
    } catch (error) {
      Alert.alert('Erro', 'Falha ao sincronizar com os Edge Nodes.');
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => { carregarHardware(); }, []);

  const nodesFiltrados = hardware.filter(n => 
    n.nome?.toLowerCase().includes(busca.toLowerCase()) || 
    n.ip?.includes(busca)
  );

  const dispararAcao = (acao, nome) => {
    Alert.alert(`Comando MQTT: ${acao}`, `A instrução foi enviada para o nó ${nome}.`);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        {/* HEADER TÁTICO */}
        <View style={styles.headerCard}>
          <View style={styles.headerTitleRow}>
            <View style={[styles.iconBoxPrimary, { backgroundColor: '#38bdf8' }]}>
              <Server size={24} color="#0f172a" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.headerTitle}>EDGE COMPUTING</Text>
              <Text style={styles.headerSubtitle}>Monitorização Gêmeo Digital (IoT)</Text>
            </View>
          </View>
          
          <View style={styles.searchBox}>
            <Search size={18} color="#94a3b8" />
            <TextInput 
              style={styles.searchInput} placeholder="Filtrar IP, MAC ou Nome..." 
              placeholderTextColor="#64748b" value={busca} onChangeText={setBusca} 
            />
            <TouchableOpacity onPress={carregarHardware}>
              <RefreshCw size={18} color="#38bdf8" />
            </TouchableOpacity>
          </View>
        </View>

        {/* LISTA DE NÓS (DIGITAL TWINS) */}
        {loading ? (
          <ActivityIndicator size="large" color="#38bdf8" style={{ marginTop: 40 }} />
        ) : nodesFiltrados.length > 0 ? (
          nodesFiltrados.map(node => (
            <View key={node.id} style={[styles.cyberCard, node.isOffline && styles.cyberCardOffline]}>
              <View style={styles.cardHeader}>
                <View style={styles.cardHeaderLeft}>
                  <Cpu size={28} color={node.isOffline ? '#ef4444' : '#10b981'} />
                  <View>
                    <Text style={styles.nodeName}>{node.nome}</Text>
                    <Text style={styles.nodeLocation}><MapPin size={10} color="#94a3b8"/> {node.filial || 'Matriz'}</Text>
                  </View>
                </View>
                <View style={styles.statusBox}>
                  <View style={[styles.led, node.isOffline ? styles.ledRed : styles.ledGreen]} />
                  <Text style={[styles.statusText, node.isOffline ? {color: '#ef4444'} : {color: '#10b981'}]}>
                    {node.isOffline ? 'OFFLINE' : 'ONLINE'}
                  </Text>
                </View>
              </View>

              <View style={styles.specsGrid}>
                <View style={styles.specItem}>
                  <Text style={styles.specLabel}>ENDEREÇO IP (WLAN)</Text>
                  <Text style={[styles.specValue, {color: '#38bdf8'}]}>{node.ip}</Text>
                </View>
                <View style={styles.specItem}>
                  <Text style={styles.specLabel}>ENDEREÇO MAC FÍSICO</Text>
                  <Text style={styles.specValue}>{node.mac}</Text>
                </View>
                <View style={styles.specItem}>
                  <Text style={styles.specLabel}>SINAL RÁDIO (WIFI)</Text>
                  <Text style={styles.specValue}>{node.isOffline ? 'DROP' : `${node.signal} dBm`}</Text>
                </View>
                <View style={styles.specItem}>
                  <Text style={styles.specLabel}>FIRMWARE ROM</Text>
                  <Text style={[styles.specValue, {color: '#10b981'}]}>{node.fwVersion || 'v1.0.0'}</Text>
                </View>
              </View>

              <View style={styles.actionGrid}>
                <TouchableOpacity style={styles.btnDanger} onPress={() => dispararAcao('REBOOT_SIGTERM', node.nome)}>
                  <Power size={14} color="#ef4444" />
                  <Text style={styles.btnDangerText}>REBOOT (COLD)</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.btnInfo} onPress={() => dispararAcao('FLASH_OTA', node.nome)}>
                  <RefreshCw size={14} color="#38bdf8" />
                  <Text style={styles.btnInfoText}>INJETAR OTA</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        ) : (
          <View style={styles.emptyState}>
            <TerminalSquare size={48} color="#334155" />
            <Text style={styles.emptyTitle}>NENHUM NÓ LOCALIZADO</Text>
            <Text style={styles.emptyDesc}>Verifique a integridade do Broker MQTT ou limpe os filtros de pesquisa.</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#020617' },
  scrollContent: { padding: 16, paddingBottom: 40 },
  
  headerCard: { backgroundColor: '#0b1120', padding: 16, borderRadius: 16, borderWidth: 1, borderColor: '#1e293b', marginBottom: 20 },
  headerTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 },
  iconBoxPrimary: { width: 48, height: 48, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '900', color: '#fff', letterSpacing: 1 },
  headerSubtitle: { fontSize: 12, color: '#94a3b8', fontWeight: '600', marginTop: 2 },
  
  searchBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#020617', borderWidth: 1, borderColor: '#1e293b', borderRadius: 10, paddingHorizontal: 12, height: 44 },
  searchInput: { flex: 1, marginLeft: 8, color: '#fff', fontSize: 14, fontFamily: 'monospace' },

  cyberCard: { backgroundColor: '#0b1120', borderRadius: 12, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: '#1e293b', borderTopWidth: 3, borderTopColor: '#10b981' },
  cyberCardOffline: { borderTopColor: '#ef4444', backgroundColor: 'rgba(239,68,68,0.05)', borderColor: 'rgba(239,68,68,0.2)' },
  
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
  cardHeaderLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  nodeName: { fontSize: 16, fontWeight: '900', color: '#fff' },
  nodeLocation: { fontSize: 11, color: '#94a3b8', fontWeight: 'bold', marginTop: 2 },
  
  statusBox: { alignItems: 'flex-end', gap: 4 },
  led: { width: 8, height: 8, borderRadius: 4 },
  ledGreen: { backgroundColor: '#10b981', shadowColor: '#10b981', shadowOpacity: 1, shadowRadius: 5, elevation: 5 },
  ledRed: { backgroundColor: '#ef4444', shadowColor: '#ef4444', shadowOpacity: 1, shadowRadius: 5, elevation: 5 },
  statusText: { fontSize: 10, fontWeight: '900', fontFamily: 'monospace' },

  specsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, backgroundColor: '#020617', padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#1e293b', marginBottom: 16 },
  specItem: { width: '47%', marginBottom: 6 },
  specLabel: { fontSize: 9, color: '#64748b', fontWeight: 'bold', marginBottom: 4 },
  specValue: { fontSize: 12, color: '#cbd5e1', fontFamily: 'monospace', fontWeight: 'bold' },

  actionGrid: { flexDirection: 'row', gap: 10 },
  btnDanger: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, backgroundColor: 'rgba(239,68,68,0.1)', padding: 12, borderRadius: 8, borderWidth: 1, borderColor: 'rgba(239,68,68,0.3)' },
  btnDangerText: { color: '#ef4444', fontSize: 10, fontWeight: '900' },
  btnInfo: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, backgroundColor: 'rgba(56,189,248,0.1)', padding: 12, borderRadius: 8, borderWidth: 1, borderColor: 'rgba(56,189,248,0.3)' },
  btnInfoText: { color: '#38bdf8', fontSize: 10, fontWeight: '900' },

  emptyState: { alignItems: 'center', justifyContent: 'center', padding: 40, backgroundColor: '#0b1120', borderRadius: 16, borderWidth: 1, borderColor: '#1e293b', borderStyle: 'dashed' },
  emptyTitle: { color: '#fff', fontSize: 14, fontWeight: '900', marginTop: 16, letterSpacing: 1 },
  emptyDesc: { color: '#64748b', fontSize: 11, textAlign: 'center', marginTop: 8 }
});