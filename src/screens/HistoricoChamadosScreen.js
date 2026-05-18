import axios from 'axios';
import { Archive, CheckCircle, Clock, FileText, Wrench } from 'lucide-react-native';
import { useCallback, useEffect, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';

const theme = { bg: '#020617', card: '#0f172a', textMain: '#f8fafc', textMuted: '#94a3b8', border: '#1e293b', info: '#38bdf8' };

export default function HistoricoChamadosScreen({ route }) {
  const { token } = route?.params || {};
  const [chamados, setChamados] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const carregarChamados = useCallback(async () => {
    try {
      const res = await axios.get('http://SEU_IP_LOCAL:3000/api/chamados', { headers: { Authorization: `Bearer ${token}` } });
      // Filtra apenas os arquivados ou concluídos
      setChamados(res.data.filter(c => c.arquivado || c.status === 'Concluído'));
    } catch (e) { console.log(e); }
  }, [token]);

  useEffect(() => { carregarChamados(); }, [carregarChamados]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Archive size={24} color={theme.info} />
        <View style={{ marginLeft: 10 }}>
          <Text style={styles.title}>Arquivo de Chamados</Text>
          <Text style={styles.subtitle}>Histórico de OS Finalizadas</Text>
        </View>
      </View>

      <ScrollView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={async () => { setRefreshing(true); await carregarChamados(); setRefreshing(false); }} tintColor={theme.info} />}>
        {chamados.map(c => (
          <View key={c.id} style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.eqName}>{c.equipamento_nome}</Text>
              <View style={styles.badge}><CheckCircle size={12} color={theme.info} /><Text style={styles.badgeText}>ARQUIVADO</Text></View>
            </View>
            <Text style={styles.desc}>Problema: {c.descricao}</Text>
            
            <View style={styles.resolucaoBox}>
              <Text style={styles.resolucaoTitle}><FileText size={12} color={theme.textMain} /> Laudo Técnico:</Text>
              <Text style={styles.resolucaoText}>{c.nota_resolucao || 'Resolvido sem laudo.'}</Text>
            </View>

            <View style={styles.metaRow}>
              <View style={styles.metaItem}><Wrench size={12} color={theme.textMuted}/> <Text style={styles.metaText}>{c.tecnico_responsavel}</Text></View>
              <View style={styles.metaItem}><Clock size={12} color={theme.textMuted}/> <Text style={styles.metaText}>{new Date(c.data_conclusao || c.data_abertura).toLocaleDateString()}</Text></View>
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
  card: { backgroundColor: theme.card, padding: 15, borderRadius: 12, marginBottom: 15, borderWidth: 1, borderColor: theme.border },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  eqName: { color: theme.textMain, fontSize: 16, fontWeight: 'bold' },
  badge: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(56, 189, 248, 0.1)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, gap: 4 },
  badgeText: { color: theme.info, fontSize: 10, fontWeight: 'bold' },
  desc: { color: theme.textMuted, fontSize: 13, marginBottom: 15 },
  resolucaoBox: { backgroundColor: 'rgba(255,255,255,0.05)', padding: 10, borderRadius: 8, marginBottom: 15 },
  resolucaoTitle: { color: theme.textMain, fontSize: 12, fontWeight: 'bold', marginBottom: 4 },
  resolucaoText: { color: theme.textMuted, fontSize: 12, fontStyle: 'italic' },
  metaRow: { flexDirection: 'row', gap: 15, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.05)', paddingTop: 10 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: { color: theme.textMuted, fontSize: 11, fontWeight: '600' }
});