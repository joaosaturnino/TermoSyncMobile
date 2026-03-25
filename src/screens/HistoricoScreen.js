import {
  AlertTriangle,
  Calendar,
  FileText,
  History
} from 'lucide-react-native';
import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { api } from '../api/api';
import { AppContext } from '../context/AppContext';

/**
 * Item da Timeline: Réplica fiel da versão Web
 */
const TimelineItem = React.memo(({ item, theme }) => (
  <View style={styles.timelineItem}>
    <View style={[styles.timelineMarker, { backgroundColor: theme.primary }]} />
    <View style={[styles.timelineContent, { backgroundColor: theme.card, borderColor: theme.border }]}>
      <View style={styles.timelineHeader}>
        <View style={styles.dateRow}>
          <Calendar size={14} color={theme.textMuted} />
          <Text style={[styles.timelineDate, { color: theme.textMuted }]}>
            {new Date(item.data_hora).toLocaleString()}
          </Text>
        </View>
        <Text style={[styles.badgeSetor, { backgroundColor: theme.bg, color: theme.textMuted }]}>
          {item.filial} | {item.setor}
        </Text>
      </View>
      
      <View style={styles.timelineBody}>
        <Text style={[styles.equipName, { color: theme.primary }]}>{item.equipamento_nome}</Text>
        <View style={styles.alertRow}>
          <AlertTriangle size={16} color="#ef4444" />
          <Text style={styles.alertMsg}>{item.mensagem}</Text>
        </View>
      </View>

      <View style={[styles.timelineAction, { backgroundColor: 'rgba(16, 185, 129, 0.05)' }]}>
        <Text style={styles.actionLabel}>RELATÓRIO TÉCNICO ASSINADO:</Text>
        <Text style={[styles.actionText, { color: theme.textMain }]}>{item.nota_resolucao}</Text>
      </View>
    </View>
  </View>
));

export default function HistoricoScreen() {
  const { filialAtiva, theme } = useContext(AppContext);
  const [historico, setHistorico] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Função para buscar os dados no servidor
  const carregarHistorico = useCallback(async () => {
    try {
      const res = await api.get('/notificacoes/historico');
      setHistorico(res.data);
    } catch (error) {
      console.error('Erro ao carregar logs RDC:', error);
    } finally {
      setLoading(false);
      setRefreshing(false); // Desativa o ícone de refresh após o carregamento
    }
  }, []);

  // Carregamento inicial
  useEffect(() => {
    carregarHistorico();
  }, [carregarHistorico]);

  // Função acionada ao deslizar de cima para baixo
  const onRefresh = useCallback(() => {
    setRefreshing(true); // Ativa o ícone de carregamento visual
    carregarHistorico(); // Chama a API novamente
  }, [carregarHistorico]);

  const filtrados = useMemo(() => {
    return historico.filter(h => filialAtiva === 'Todas' || h.filial === filialAtiva);
  }, [historico, filialAtiva]);

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.bg, justifyContent: 'center' }]}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      <View style={styles.headerArea}>
        <View>
          <Text style={[styles.title, { color: theme.textMain }]}>Livro de Registo Oficial</Text>
          <Text style={{ color: theme.textMuted, fontSize: 12, marginTop: 2 }}>Conformidade RDC / HACCP</Text>
        </View>
        <TouchableOpacity style={styles.btnPdf}>
          <FileText size={18} color="#fff" />
          <Text style={styles.btnPdfText}> PDF</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={filtrados}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => <TimelineItem item={item} theme={theme} />}
        ListHeaderComponent={<View style={styles.timelineLine} />}
        ListEmptyComponent={
          <View style={styles.empty}>
            <History size={48} color={theme.border} />
            <Text style={{ color: theme.textMuted, marginTop: 10 }}>Nenhum log auditável encontrado.</Text>
          </View>
        }
        // ==========================================
        // Lógica de Puxar para Atualizar (Pull-to-Refresh)
        // ==========================================
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh} 
            colors={[theme.primary]} // Cor da rodinha de carregamento (Android)
            tintColor={theme.primary} // Cor da rodinha de carregamento (iOS)
          />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerArea: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: 'rgba(0,0,0,0.05)' },
  title: { fontSize: 18, fontWeight: '800' },
  btnPdf: { backgroundColor: '#ef4444', flexDirection: 'row', paddingHorizontal: 15, paddingVertical: 10, borderRadius: 10, alignItems: 'center', elevation: 2 },
  btnPdfText: { color: '#fff', fontWeight: 'bold', fontSize: 13 },
  listContent: { paddingHorizontal: 20, paddingBottom: 40, paddingTop: 20 },
  timelineLine: { position: 'absolute', left: 27, top: 20, bottom: 0, width: 2, backgroundColor: '#e2e8f0' },
  timelineItem: { paddingLeft: 35, marginBottom: 20, position: 'relative' },
  timelineMarker: { position: 'absolute', left: 20, top: 20, width: 16, height: 16, borderRadius: 8, borderWidth: 3, borderColor: '#f8fafc', zIndex: 1 },
  timelineContent: { padding: 15, borderRadius: 12, borderWidth: 1, elevation: 2 },
  timelineHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, borderBottomWidth: 1, borderBottomColor: 'rgba(0,0,0,0.03)', paddingBottom: 8 },
  dateRow: { flexDirection: 'row', alignItems: 'center' },
  timelineDate: { fontSize: 11, fontWeight: '700', marginLeft: 5 },
  badgeSetor: { fontSize: 9, fontWeight: '800', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10 },
  timelineBody: { marginBottom: 12 },
  equipName: { fontSize: 15, fontWeight: '800', marginBottom: 4 },
  alertRow: { flexDirection: 'row', alignItems: 'center' },
  alertMsg: { color: '#ef4444', fontSize: 12, marginLeft: 6, fontWeight: '600', flex: 1 },
  timelineAction: { padding: 12, borderRadius: 8, borderLeftWidth: 4, borderLeftColor: '#10b981', marginTop: 5 },
  actionLabel: { fontSize: 9, fontWeight: '900', color: '#10b981', marginBottom: 4, letterSpacing: 0.5 },
  actionText: { fontSize: 13, fontWeight: '500', lineHeight: 18 },
  empty: { alignItems: 'center', marginTop: 100 }
});