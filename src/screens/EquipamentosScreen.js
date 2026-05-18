import {
  AlertTriangle, ClipboardCheck, Edit,
  PlusCircle,
  Search,
  Server,
  Thermometer,
  X
} from 'lucide-react-native';
import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator, Alert,
  SafeAreaView,
  ScrollView, StyleSheet,
  Text, TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import api from '../api/api';

const theme = {
  bg: '#020617', card: '#0f172a', textMain: '#f8fafc', textMuted: '#94a3b8',
  border: '#1e293b', primary: '#059669', secondary: '#10b981', danger: '#ef4444',
  warning: '#f59e0b', info: '#38bdf8'
};

export default function EquipamentosScreen() {
  const [equipamentos, setEquipamentos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [buscaAtivo, setBuscaAtivo] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);

  const carregarDados = async () => {
    setLoading(true);
    try {
      const res = await api.get('/equipamentos');
      setEquipamentos(Array.isArray(res.data) ? res.data : []);
    } catch (e) {
      Alert.alert('Aviso', 'A usar dados de cache (Modo Offline).');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { carregarDados(); }, []);

  const pedirExclusao = (id, nome) => {
    Alert.alert('Remover Ativo IoT', `Deseja eliminar a máquina ${nome} permanentemente?`, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Excluir', style: 'destructive', onPress: async () => {
          try {
            await api.delete(`/equipamentos/${id}`);
            Alert.alert('Sucesso', 'Equipamento removido da rede.');
            carregarDados();
          } catch(e) { Alert.alert('Erro', 'Falha ao remover.'); }
      }}
    ]);
  };

  const ativosExibidos = useMemo(() => {
    if (!equipamentos) return [];
    if (!buscaAtivo.trim()) return equipamentos;
    const termo = buscaAtivo.toLowerCase();
    return equipamentos.filter(eq => 
      eq.nome?.toLowerCase().includes(termo) || 
      eq.setor?.toLowerCase().includes(termo) ||
      eq.filial?.toLowerCase().includes(termo)
    );
  }, [equipamentos, buscaAtivo]);

  const kpis = useMemo(() => {
    let riscoCalib = 0; let offlines = 0;
    ativosExibidos.forEach(eq => {
      const diasCalib = eq.data_calibracao ? Math.floor((Date.now() - new Date(eq.data_calibracao).getTime()) / (1000 * 60 * 60 * 24)) : 0;
      if (diasCalib > 330) riscoCalib++;
      if (!eq.motor_ligado && !eq.em_degelo) offlines++;
    });
    return { total: ativosExibidos.length, riscoCalib, offlines };
  }, [ativosExibidos]);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        <View style={styles.header}>
          <View style={styles.titleRow}>
            <Server size={24} color={theme.info} />
            <View style={{ marginLeft: 10 }}>
              <Text style={styles.title}>Inventário IoT</Text>
              <Text style={styles.subtitle}>Metrologia e Telemetria</Text>
            </View>
          </View>
          <TouchableOpacity style={[styles.btnToggleForm, isFormOpen && styles.btnToggleFormActive]} onPress={() => setIsFormOpen(!isFormOpen)}>
            {isFormOpen ? <X size={20} color={theme.textMain} /> : <PlusCircle size={20} color="white" />}
          </TouchableOpacity>
        </View>

        <View style={styles.searchBox}>
          <Search size={18} color={theme.textMuted} />
          <TextInput style={styles.searchInput} placeholder="Procurar ativo ou filial..." placeholderTextColor={theme.textMuted} value={buscaAtivo} onChangeText={setBuscaAtivo} />
        </View>

        <View style={styles.kpiRow}>
          <View style={styles.kpiCard}>
            <View style={[styles.kpiIconBox, { backgroundColor: 'rgba(56, 189, 248, 0.1)' }]}><Server size={18} color={theme.info}/></View>
            <View><Text style={styles.kpiVal}>{kpis.total}</Text><Text style={styles.kpiLbl}>Instalados</Text></View>
          </View>
          <View style={[styles.kpiCard, kpis.riscoCalib > 0 && styles.kpiCardDanger]}>
            <View style={[styles.kpiIconBox, { backgroundColor: 'rgba(239, 68, 68, 0.1)' }]}><ClipboardCheck size={18} color={theme.danger}/></View>
            <View><Text style={[styles.kpiVal, kpis.riscoCalib > 0 && {color: theme.danger}]}>{kpis.riscoCalib}</Text><Text style={styles.kpiLbl}>Risco Calib.</Text></View>
          </View>
          <View style={[styles.kpiCard, kpis.offlines > 0 && styles.kpiCardWarning]}>
            <View style={[styles.kpiIconBox, { backgroundColor: 'rgba(245, 158, 11, 0.1)' }]}><AlertTriangle size={18} color={theme.warning}/></View>
            <View><Text style={[styles.kpiVal, kpis.offlines > 0 && {color: theme.warning}]}>{kpis.offlines}</Text><Text style={styles.kpiLbl}>Inativos</Text></View>
          </View>
        </View>

        {loading ? (
           <ActivityIndicator size="large" color={theme.info} style={{ marginTop: 40 }} />
        ) : (
          ativosExibidos.map(eq => {
            const diasCalib = eq.data_calibracao ? Math.floor((Date.now() - new Date(eq.data_calibracao).getTime()) / (1000 * 60 * 60 * 24)) : 0;
            const calibPercent = Math.min(100, Math.max(0, (diasCalib / 365) * 100));
            const isExpirado = diasCalib > 365;
            const statusColor = eq.em_degelo ? theme.secondary : (!eq.motor_ligado ? theme.danger : theme.success);

            return (
              <View key={eq.id} style={styles.equipCard}>
                <View style={styles.equipHeader}>
                  <View style={styles.nodeLocation}>
                    <View style={[styles.statusRing, { backgroundColor: statusColor }]} />
                    <Text style={styles.equipFilial}>{eq.filial || 'Filial Base'}</Text>
                  </View>
                  <View style={styles.equipActions}>
                    <TouchableOpacity style={styles.iconBtn}><Edit size={16} color={theme.textMuted} /></TouchableOpacity>
                    <TouchableOpacity style={styles.iconBtn} onPress={() => pedirExclusao(eq.id, eq.nome)}><X size={16} color={theme.danger} /></TouchableOpacity>
                  </View>
                </View>

                <Text style={styles.equipName}>{eq.nome}</Text>
                <Text style={styles.equipType}>{eq.tipo} • {eq.setor}</Text>

                <View style={styles.metrologyBox}>
                  <View style={styles.metroLabels}>
                    <Text style={[styles.metroText, { color: isExpirado ? theme.danger : theme.textMuted }]}>
                      {isExpirado ? '⚠️ Certificado Expirado' : 'Dias desde Calibração'}
                    </Text>
                    <Text style={styles.metroDays}>{diasCalib} dias</Text>
                  </View>
                  <View style={styles.metroTrack}>
                    <View style={[styles.metroFill, { width: `${calibPercent}%`, backgroundColor: isExpirado ? theme.danger : theme.success }]} />
                  </View>
                </View>

                <View style={styles.slaBox}>
                  <View style={styles.slaTag}>
                    <Thermometer size={12} color={theme.danger} />
                    <Text style={styles.slaTagText}>{eq.temp_min}°C a {eq.temp_max}°C</Text>
                  </View>
                </View>
              </View>
            );
          })
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.bg },
  scrollContent: { padding: 15, paddingBottom: 40 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  titleRow: { flexDirection: 'row', alignItems: 'center' },
  title: { color: theme.textMain, fontSize: 20, fontWeight: '900', letterSpacing: -0.5 },
  subtitle: { color: theme.textMuted, fontSize: 12, fontWeight: '600' },
  btnToggleForm: { backgroundColor: theme.primary, padding: 10, borderRadius: 12 },
  btnToggleFormActive: { backgroundColor: 'transparent', borderWidth: 1, borderColor: theme.border },

  searchBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: theme.card, borderWidth: 1, borderColor: theme.border, borderRadius: 12, paddingHorizontal: 15, paddingVertical: 10, marginBottom: 20 },
  searchInput: { flex: 1, color: theme.textMain, marginLeft: 10, fontSize: 15 },

  kpiRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  kpiCard: { flex: 1, backgroundColor: theme.card, borderWidth: 1, borderColor: theme.border, borderRadius: 12, padding: 10, marginHorizontal: 4, alignItems: 'center', flexDirection: 'row', gap: 8 },
  kpiCardDanger: { borderColor: 'rgba(239, 68, 68, 0.4)' },
  kpiCardWarning: { borderColor: 'rgba(245, 158, 11, 0.4)' },
  kpiIconBox: { padding: 8, borderRadius: 10 },
  kpiVal: { color: theme.textMain, fontSize: 16, fontWeight: '900' },
  kpiLbl: { color: theme.textMuted, fontSize: 9, fontWeight: 'bold', textTransform: 'uppercase' },

  equipCard: { backgroundColor: theme.card, borderWidth: 1, borderColor: theme.border, borderRadius: 16, padding: 15, marginBottom: 15, shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 5 },
  equipHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  nodeLocation: { flexDirection: 'row', alignItems: 'center' },
  statusRing: { width: 10, height: 10, borderRadius: 5, marginRight: 8 },
  equipFilial: { color: theme.textMuted, fontSize: 12, fontWeight: '700', textTransform: 'uppercase' },
  equipActions: { flexDirection: 'row', gap: 10 },
  iconBtn: { padding: 6, backgroundColor: theme.bg, borderRadius: 8, borderWidth: 1, borderColor: theme.border },

  equipName: { color: theme.textMain, fontSize: 18, fontWeight: '900' },
  equipType: { color: theme.textMuted, fontSize: 12, fontWeight: '600', marginBottom: 15 },

  metrologyBox: { marginBottom: 15 },
  metroLabels: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  metroText: { fontSize: 10, fontWeight: '800', textTransform: 'uppercase' },
  metroDays: { color: theme.textMain, fontSize: 11, fontWeight: '800' },
  metroTrack: { height: 6, backgroundColor: theme.border, borderRadius: 3, overflow: 'hidden' },
  metroFill: { height: '100%', borderRadius: 3 },

  slaBox: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  slaTag: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: theme.bg, borderWidth: 1, borderColor: theme.border, paddingVertical: 4, paddingHorizontal: 8, borderRadius: 6 },
  slaTagText: { color: theme.textMain, fontSize: 11, fontFamily: 'monospace', fontWeight: 'bold' }
});