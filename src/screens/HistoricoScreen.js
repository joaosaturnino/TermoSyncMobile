import { AlertTriangle, Calendar, History } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, View } from 'react-native';
import { api, theme } from '../api/api';

export default function HistoricoScreen() {
  const [historico, setHistorico] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    carregarHistorico();
  }, []);

  const carregarHistorico = async () => {
    try {
      const res = await api.get('/notificacoes/historico');
      setHistorico(res.data);
    } catch (error) {
      console.log('Erro ao carregar historico', error);
    } finally {
      setLoading(false);
    }
  };

  const renderTimelineItem = ({ item, index }) => {
    const isLast = index === historico.length - 1;

    return (
      <View style={styles.timelineItem}>
        {/* Linha Vertical da Cronologia */}
        {!isLast && <View style={styles.timelineLine} />}
        
        {/* Marcador Circular */}
        <View style={styles.timelineMarker} />

        {/* Conteúdo do Cartão */}
        <View style={styles.timelineContent}>
          <View style={styles.headerRow}>
            <View style={styles.dateBadge}>
              <Calendar size={14} color={theme.textMuted} />
              <Text style={styles.dateText}>
                {new Date(item.data_hora).toLocaleString()}
              </Text>
            </View>
            <Text style={styles.badgeFilial}>{item.filial}</Text>
          </View>

          <Text style={styles.equipName}>{item.equipamento_nome}</Text>
          
          <View style={styles.msgRow}>
            <AlertTriangle size={16} color={theme.danger} />
            <Text style={styles.msgText}>{item.mensagem}</Text>
          </View>

          <View style={styles.actionBox}>
            <Text style={styles.actionLabel}>Relatório Técnico Assinado:</Text>
            <Text style={styles.actionText}>{item.nota_resolucao}</Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <History color={theme.textMain} size={28} />
        <Text style={styles.headerTitle}>Livro de Registo Oficial</Text>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={theme.primary} style={{ marginTop: 50 }} />
      ) : (
        <FlatList
          data={historico}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderTimelineItem}
          contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
          ListEmptyComponent={
            <Text style={styles.emptyText}>Nenhum registo de auditoria encontrado.</Text>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.bg },
  header: { flexDirection: 'row', alignItems: 'center', padding: 20, backgroundColor: theme.card, borderBottomWidth: 1, borderBottomColor: theme.border },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: theme.textMain, marginLeft: 10 },
  timelineItem: { flexDirection: 'row', marginBottom: 20, position: 'relative' },
  timelineLine: { position: 'absolute', left: 7, top: 20, bottom: -20, width: 2, backgroundColor: theme.border, zIndex: 0 },
  timelineMarker: { width: 16, height: 16, borderRadius: 8, backgroundColor: theme.primary, borderWidth: 3, borderColor: theme.bg, zIndex: 1, marginTop: 5, marginRight: 15 },
  timelineContent: { flex: 1, backgroundColor: theme.card, padding: 15, borderRadius: 12, borderWidth: 1, borderColor: theme.border, elevation: 1 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, borderBottomWidth: 1, borderBottomColor: theme.border, paddingBottom: 10 },
  dateBadge: { flexDirection: 'row', alignItems: 'center' },
  dateText: { fontSize: 12, color: theme.textMuted, fontWeight: 'bold', marginLeft: 5 },
  badgeFilial: { backgroundColor: theme.border, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, fontSize: 10, fontWeight: 'bold', color: theme.textMuted },
  equipName: { fontSize: 16, fontWeight: 'bold', color: theme.primary, marginBottom: 5 },
  msgRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
  msgText: { color: theme.danger, fontSize: 14, marginLeft: 5, flex: 1 },
  actionBox: { backgroundColor: 'rgba(16, 185, 129, 0.1)', padding: 10, borderRadius: 8, borderLeftWidth: 4, borderLeftColor: theme.success },
  actionLabel: { fontSize: 10, textTransform: 'uppercase', color: theme.textMuted, fontWeight: 'bold', marginBottom: 2 },
  actionText: { color: theme.success, fontWeight: 'bold', fontSize: 13 },
  emptyText: { textAlign: 'center', color: theme.textMuted, marginTop: 30 },
});