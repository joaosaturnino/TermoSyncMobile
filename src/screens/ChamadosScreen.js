import axios from 'axios';
import { CheckCircle, Clock, Wrench } from 'lucide-react-native';
import { useCallback, useEffect, useState } from 'react';
import { Alert, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const theme = { bg: '#020617', card: '#0f172a', textMain: '#f8fafc', textMuted: '#94a3b8', border: '#1e293b', success: '#10b981', warning: '#f59e0b', danger: '#ef4444' };

export default function ChamadosScreen({ route }) {
  const { token } = route?.params || {};
  const [chamados, setChamados] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const carregarChamados = useCallback(async () => {
    try {
      const res = await axios.get('http://SEU_IP_LOCAL:3000/api/chamados', { headers: { Authorization: `Bearer ${token}` } });
      setChamados(res.data);
    } catch (e) {}
  }, [token]);

  useEffect(() => { carregarChamados(); }, [carregarChamados]);

  const concluirOS = async (id) => {
    try {
      await axios.put(`http://SEU_IP_LOCAL:3000/api/chamados/${id}/resolver`, { nota_resolucao: 'Concluído pelo técnico via Mobile' }, { headers: { Authorization: `Bearer ${token}` } });
      carregarChamados();
      Alert.alert('Sucesso', 'Ordem de Serviço finalizada.');
    } catch (e) { Alert.alert('Erro', 'Não foi possível concluir a OS.'); }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.pageTitle}>Ordens de Serviço (OS)</Text>
      
      <ScrollView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={async () => { setRefreshing(true); await carregarChamados(); setRefreshing(false); }} tintColor={theme.success} />}>
        {chamados.map(c => {
          const isConcluido = c.status === 'Concluído';
          const corUrgencia = c.urgencia === 'Alta' ? theme.danger : (c.urgencia === 'Média' ? theme.warning : theme.success);

          return (
            <View key={c.id} style={[styles.card, { borderLeftColor: isConcluido ? theme.success : corUrgencia }]}>
              <View style={styles.cardHeader}>
                <Text style={styles.eqName}>{c.equipamento_nome}</Text>
                <View style={[styles.badge, { backgroundColor: isConcluido ? 'rgba(16,185,129,0.1)' : 'rgba(245,158,11,0.1)' }]}>
                  <Text style={[styles.badgeText, { color: isConcluido ? theme.success : theme.warning }]}>{c.status}</Text>
                </View>
              </View>
              
              <Text style={styles.desc}>{c.descricao}</Text>
              
              <View style={styles.metaRow}>
                <View style={styles.metaItem}><Clock size={12} color={theme.textMuted}/> <Text style={styles.metaText}>{new Date(c.data_abertura).toLocaleDateString()}</Text></View>
                <View style={styles.metaItem}><Wrench size={12} color={theme.textMuted}/> <Text style={styles.metaText}>{c.tecnico_responsavel || 'Aguardando'}</Text></View>
              </View>

              {!isConcluido && (
                <TouchableOpacity style={styles.btnResolver} onPress={() => concluirOS(c.id)}>
                  <CheckCircle size={16} color="#ffffff" />
                  <Text style={styles.btnResolverText}>Concluir OS</Text>
                </TouchableOpacity>
              )}
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.bg, padding: 15 },
  pageTitle: { fontSize: 20, fontWeight: 'bold', color: theme.textMain, marginBottom: 15 },
  card: { backgroundColor: theme.card, padding: 15, borderRadius: 12, marginBottom: 15, borderWidth: 1, borderColor: theme.border, borderLeftWidth: 4 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  eqName: { color: theme.textMain, fontSize: 16, fontWeight: 'bold' },
  badge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  badgeText: { fontSize: 10, fontWeight: 'bold', textTransform: 'uppercase' },
  desc: { color: theme.textMuted, fontSize: 13, lineHeight: 18, marginBottom: 15 },
  metaRow: { flexDirection: 'row', gap: 15, marginBottom: 15 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: { color: theme.textMuted, fontSize: 11, fontWeight: '600' },
  btnResolver: { flexDirection: 'row', backgroundColor: theme.success, padding: 12, borderRadius: 8, justifyContent: 'center', alignItems: 'center', gap: 8 },
  btnResolverText: { color: '#ffffff', fontWeight: 'bold', fontSize: 14 }
});