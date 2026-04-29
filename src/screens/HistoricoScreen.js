import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useContext, useMemo } from 'react';
import { Platform, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { AppContext } from '../context/AppContext';

export default function HistoricoScreen({ navigation }) {
  const { historicoAlertas, filialAtiva } = useContext(AppContext);

  const historicoOrdenado = useMemo(() => {
    let list = filialAtiva === 'Todas' ? (historicoAlertas || []) : (historicoAlertas || []).filter(h => h.filial === filialAtiva);
    return list.sort((a, b) => new Date(b.data_hora) - new Date(a.data_hora));
  }, [historicoAlertas, filialAtiva]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.openDrawer()} style={{ padding: 5 }}>
          <Ionicons name="menu" size={28} color="#059669" />
        </TouchableOpacity>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <MaterialCommunityIcons name="shield-check" size={24} color="#059669" />
          <Text style={styles.headerTitle}>Livro RDC Oficial</Text>
        </View>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView contentContainerStyle={styles.listContainer}>
        {historicoOrdenado.length === 0 ? (
          <View style={styles.emptyState}>
            <MaterialCommunityIcons name="history" size={64} color="#94a3b8" style={{ opacity: 0.5 }} />
            <Text style={styles.emptyTitle}>Nenhum Registo</Text>
            <Text style={styles.emptySub}>O histórico de auditoria está vazio.</Text>
          </View>
        ) : (
          <View style={styles.timelineContainer}>
            {/* Linha vertical da Timeline */}
            <View style={styles.timelineLine} />
            
            {historicoOrdenado.map((hist) => (
              <View key={hist.id} style={styles.timelineItem}>
                {/* Ponto (Dot) da Timeline */}
                <View style={styles.timelineMarker} />
                
                <View style={styles.timelineContent}>
                  <View style={styles.timelineHeader}>
                    <View style={styles.dateBadge}>
                      <MaterialCommunityIcons name="calendar" size={14} color="#059669" />
                      <Text style={styles.dateText}>{new Date(hist.data_hora).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}</Text>
                    </View>
                    <View style={styles.badgesGroup}>
                      <Text style={styles.badgeText}><MaterialCommunityIcons name="map-marker" size={10} /> {hist.filial}</Text>
                      <Text style={styles.badgeText}>{hist.setor}</Text>
                    </View>
                  </View>

                  <View style={styles.timelineBody}>
                    <View style={styles.equipTitleBox}>
                      <MaterialCommunityIcons name="monitor-dashboard" size={20} color="#059669" />
                      <Text style={styles.equipTitle}>{hist.equipamento_nome}</Text>
                    </View>
                    <View style={styles.alertMsgBox}>
                      <MaterialCommunityIcons name="alert-triangle" size={18} color="#ef4444" />
                      <Text style={styles.alertMsgText}><Text style={{fontWeight:'bold'}}>Ocorrência:</Text> {hist.mensagem}</Text>
                    </View>
                  </View>

                  <View style={styles.timelineActionBox}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                      <MaterialCommunityIcons name="check-square" size={16} color="#10b981" />
                      <Text style={styles.actionTitle}>Relatório Técnico Assinado:</Text>
                    </View>
                    <Text style={styles.actionText}>{hist.nota_resolucao}</Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 15, backgroundColor: '#fff', borderBottomWidth: 1, borderColor: '#e2e8f0', paddingTop: Platform.OS === 'ios' ? 50 : 15 },
  headerTitle: { fontSize: 18, fontWeight: '900', color: '#0f172a' },
  listContainer: { padding: 15, paddingBottom: 40 },
  
  emptyState: { alignItems: 'center', justifyContent: 'center', paddingVertical: 60 },
  emptyTitle: { fontSize: 18, fontWeight: '900', color: '#0f172a', marginTop: 15 },
  emptySub: { fontSize: 14, color: '#64748b', textAlign: 'center', marginTop: 5 },

  /* Timeline Styles Nativo */
  timelineContainer: { position: 'relative', paddingLeft: 25, marginTop: 10 },
  timelineLine: { position: 'absolute', left: 10, top: 0, bottom: 0, width: 2, backgroundColor: '#e2e8f0' },
  
  timelineItem: { position: 'relative', marginBottom: 25 },
  timelineMarker: { position: 'absolute', left: -22, top: 15, width: 14, height: 14, borderRadius: 7, backgroundColor: '#059669', borderWidth: 2, borderColor: '#fff', zIndex: 2, elevation: 3 },
  
  timelineContent: { backgroundColor: '#fff', borderRadius: 16, padding: 15, borderWidth: 1, borderColor: '#e2e8f0', elevation: 2, shadowColor: '#000', shadowOffset: {width: 0, height: 2}, shadowOpacity: 0.05 },
  timelineHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 10, borderBottomWidth: 1, borderColor: '#f1f5f9', paddingBottom: 10, marginBottom: 12 },
  dateBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#f8fafc', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, borderWidth: 1, borderColor: '#e2e8f0' },
  dateText: { fontSize: 12, fontWeight: '800', color: '#0f172a' },
  badgesGroup: { flexDirection: 'row', gap: 6, flexWrap: 'wrap' },
  badgeText: { fontSize: 10, backgroundColor: '#f8fafc', color: '#64748b', borderWidth: 1, borderColor: '#e2e8f0', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, fontWeight: '800', textTransform: 'uppercase' },

  timelineBody: { marginBottom: 15 },
  equipTitleBox: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  equipTitle: { fontSize: 16, fontWeight: '900', color: '#0f172a' },
  alertMsgBox: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, backgroundColor: 'rgba(239, 68, 68, 0.05)', borderLeftWidth: 3, borderLeftColor: '#ef4444', padding: 12, borderRadius: 8 },
  alertMsgText: { flex: 1, fontSize: 13, color: '#0f172a', lineHeight: 20 },

  timelineActionBox: { backgroundColor: 'rgba(16, 185, 129, 0.05)', padding: 12, borderRadius: 10, borderWidth: 1, borderStyle: 'dashed', borderColor: 'rgba(16, 185, 129, 0.3)' },
  actionTitle: { color: '#10b981', fontWeight: '800', fontSize: 12 },
  actionText: { fontSize: 13, color: '#0f172a' }
});