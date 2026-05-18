import axios from 'axios';
import { CheckCircle, Clock, History, MapPin } from 'lucide-react-native';
import { useCallback, useEffect, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';

const theme = { bg: '#020617', card: '#0f172a', textMain: '#f8fafc', textMuted: '#94a3b8', border: '#1e293b', success: '#10b981' };

export default function HistoricoScreen({ route }) {
  const { token } = route?.params || {};
  const [historico, setHistorico] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const carregarHistorico = useCallback(async () => {
    try {
      const res = await axios.get('http://SEU_IP_LOCAL:3000/api/notificacoes/historico', { headers: { Authorization: `Bearer ${token}` } });
      setHistorico(res.data);
    } catch (e) { console.log(e); }
  }, [token]);

  useEffect(() => { carregarHistorico(); }, [carregarHistorico]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <History size={24} color={theme.success} />
        <View style={{ marginLeft: 10 }}>
          <Text style={styles.title}>Auditoria de Logs</Text>
          <Text style={styles.subtitle}>Alertas resolvidos e normalizados</Text>
        </View>
      </View>

      <ScrollView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={async () => { setRefreshing(true); await carregarHistorico(); setRefreshing(false); }} tintColor={theme.success} />}>
        {historico.map(h => (
          <View key={h.id} style={styles.card}>
            <View style={styles.cardTop}>
              <View style={styles.iconBox}><CheckCircle size={20} color={theme.success} /></View>
              <View style={{ flex: 1 }}>
                <Text style={styles.eqName}>{h.equipamento_nome}</Text>
                <Text style={styles.eqFilial}><MapPin size={12}/> {h.filial || 'Matriz'}</Text>
              </View>
            </View>
            <Text style={styles.msg}>{h.mensagem}</Text>
            <View style={styles.metaRow}>
              <Clock size={12} color={theme.textMuted}/>
              <Text style={styles.metaText}>{new Date(h.data_hora).toLocaleString()}</Text>
              <Text style={styles.notaText}>Motivo: {h.nota_resolucao}</Text>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.bg, padding: 15 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 20, backgroundColor: theme.card, padding: 15, borderRadius: 12, borderWidth: 1, borderColor: theme.border },
  title: { color: theme.textMain, fontSize: 18, fontWeight: 'bold' },
  subtitle: { color: theme.textMuted, fontSize: 12 },
  card: { backgroundColor: theme.card, padding: 15, borderRadius: 12, marginBottom: 15, borderWidth: 1, borderColor: theme.border, borderLeftWidth: 4, borderLeftColor: theme.success },
  cardTop: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  iconBox: { backgroundColor: 'rgba(16, 185, 129, 0.1)', padding: 8, borderRadius: 8, marginRight: 12 },
  eqName: { color: theme.textMain, fontSize: 16, fontWeight: 'bold' },
  eqFilial: { color: theme.textMuted, fontSize: 12, marginTop: 2 },
  msg: { color: theme.textMain, fontSize: 13, marginBottom: 15, lineHeight: 18 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 6, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.05)', paddingTop: 10 },
  metaText: { color: theme.textMuted, fontSize: 11, fontWeight: '600' },
  notaText: { color: theme.success, fontSize: 11, fontWeight: 'bold', marginLeft: 'auto' }
});