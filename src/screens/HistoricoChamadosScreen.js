import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useContext, useMemo, useState } from 'react';
import { Platform, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { AppContext } from '../context/AppContext';

export default function HistoricoChamadosScreen({ navigation }) {
  const { userRole, filialAtiva, nomeLogado, chamados = [], tecnicosDb = [] } = useContext(AppContext);
  const [tecnicoFiltroOS, setTecnicoFiltroOS] = useState('todos');

  const chamadosHistoricoFiltrados = useMemo(() => {
    const trintaDiasAtras = new Date(); trintaDiasAtras.setDate(trintaDiasAtras.getDate() - 30);
    let list = chamados.filter(c => c.status === 'Concluído' && new Date(c.data_conclusao) < trintaDiasAtras);
    
    if (userRole === 'ADMIN' && filialAtiva !== 'Todas') list = list.filter(c => c.filial === filialAtiva);
    if (userRole === 'MANUTENCAO') list = list.filter(c => c.tecnico_responsavel === nomeLogado);
    else if (tecnicoFiltroOS !== 'todos') list = list.filter(c => c.tecnico_responsavel === tecnicoFiltroOS);
    
    return list.sort((a, b) => new Date(b.data_conclusao) - new Date(a.data_conclusao));
  }, [chamados, filialAtiva, userRole, nomeLogado, tecnicoFiltroOS]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.openDrawer()} style={{ padding: 5 }}>
          <Ionicons name="menu" size={28} color="#059669" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Arquivo de Intervenções</Text>
        <View style={{ width: 28 }} />
      </View>

      {userRole !== 'MANUTENCAO' && (
        <View style={styles.filtersContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 15, gap: 10 }}>
            <TouchableOpacity style={[styles.filterBtn, tecnicoFiltroOS === 'todos' && styles.filterBtnActive]} onPress={() => setTecnicoFiltroOS('todos')}>
              <Text style={[styles.filterBtnText, tecnicoFiltroOS === 'todos' && styles.filterBtnTextActive]}>Todos os Técnicos</Text>
            </TouchableOpacity>
            {tecnicosDb?.map(tec => (
              <TouchableOpacity key={tec.id} style={[styles.filterBtn, tecnicoFiltroOS === tec.nome_tecnico && styles.filterBtnActive]} onPress={() => setTecnicoFiltroOS(tec.nome_tecnico)}>
                <Text style={[styles.filterBtnText, tecnicoFiltroOS === tec.nome_tecnico && styles.filterBtnTextActive]}>{tec.nome_tecnico}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      <ScrollView contentContainerStyle={styles.listContainer}>
        {chamadosHistoricoFiltrados.length === 0 ? (
          <View style={styles.emptyState}>
            <MaterialCommunityIcons name="archive" size={64} color="#94a3b8" style={{ opacity: 0.5 }} />
            <Text style={styles.emptyTitle}>Arquivo Vazio</Text>
            <Text style={styles.emptySub}>Ainda não existem O.S. arquivadas (+30 dias).</Text>
          </View>
        ) : (
          chamadosHistoricoFiltrados.map(c => (
            <View key={c.id} style={styles.historicoCard}>
              <View style={styles.historicoHeader}>
                <View style={styles.historicoTitleBox}>
                  <MaterialCommunityIcons name="archive" size={20} color="#64748b" />
                  <Text style={styles.historicoEquip}>{c.equipamento_nome}</Text>
                </View>
                <View style={styles.badgeArquivado}><Text style={styles.badgeArquivadoText}>Arquivado</Text></View>
              </View>

              <View style={styles.historicoDescBox}>
                <Text style={styles.historicoDescText}>"{c.descricao}"</Text>
              </View>

              <View style={styles.metaGrid}>
                <View style={styles.metaRow}><MaterialCommunityIcons name="map-marker" size={14} color="#64748b" /><Text style={styles.metaText}>Localização: <Text style={styles.metaBold}>{c.filial}</Text></Text></View>
                <View style={styles.metaRow}><MaterialCommunityIcons name="account" size={14} color="#64748b" /><Text style={styles.metaText}>Solicitante: <Text style={styles.metaBold}>{c.solicitante_nome || c.aberto_por}</Text></Text></View>
                <View style={styles.metaRow}><MaterialCommunityIcons name="wrench" size={14} color="#64748b" /><Text style={styles.metaText}>Técnico: <Text style={styles.metaBold}>{c.tecnico_responsavel || 'Equipe Geral'}</Text></Text></View>
              </View>

              <View style={styles.resolucaoBox}>
                <View style={styles.resolucaoTitleBox}>
                  <MaterialCommunityIcons name="check-square" size={16} color="#64748b" />
                  <Text style={styles.resolucaoTitle}>Registo de Intervenção:</Text>
                </View>
                <Text style={styles.resolucaoText}>{c.nota_resolucao}</Text>
                <View style={styles.resolucaoDateBox}>
                  <MaterialCommunityIcons name="calendar-check" size={14} color="#64748b" />
                  <Text style={styles.resolucaoDate}>Finalizado a {new Date(c.data_conclusao).toLocaleDateString()}</Text>
                </View>
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 15, backgroundColor: '#fff', borderBottomWidth: 1, borderColor: '#e2e8f0', paddingTop: Platform.OS === 'ios' ? 50 : 15 },
  headerTitle: { fontSize: 18, fontWeight: '900', color: '#0f172a' },
  filtersContainer: { paddingVertical: 15, backgroundColor: '#fff', borderBottomWidth: 1, borderColor: '#e2e8f0' },
  filterBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: '#f1f5f9', borderWidth: 1, borderColor: '#e2e8f0' },
  filterBtnActive: { backgroundColor: '#64748b', borderColor: '#64748b' },
  filterBtnText: { color: '#64748b', fontWeight: 'bold', fontSize: 13 },
  filterBtnTextActive: { color: '#fff' },
  listContainer: { padding: 15, paddingBottom: 40 },
  
  emptyState: { alignItems: 'center', justifyContent: 'center', paddingVertical: 60 },
  emptyTitle: { fontSize: 18, fontWeight: '900', color: '#0f172a', marginTop: 15 },
  emptySub: { fontSize: 14, color: '#64748b', textAlign: 'center', marginTop: 5 },

  // Efeito de Arquivo/Desbotado
  historicoCard: { backgroundColor: '#fff', borderRadius: 16, padding: 20, marginBottom: 15, borderBottomWidth: 4, borderBottomColor: '#cbd5e1', opacity: 0.9, elevation: 1 },
  historicoHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  historicoTitleBox: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  historicoEquip: { fontSize: 16, fontWeight: '900', color: '#0f172a' },
  badgeArquivado: { backgroundColor: 'rgba(100, 116, 139, 0.15)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(100, 116, 139, 0.2)' },
  badgeArquivadoText: { fontSize: 10, fontWeight: '900', color: '#64748b', textTransform: 'uppercase' },
  
  historicoDescBox: { backgroundColor: 'rgba(0,0,0,0.02)', borderLeftWidth: 3, borderLeftColor: '#cbd5e1', padding: 12, borderRadius: 8, marginBottom: 15 },
  historicoDescText: { fontSize: 14, fontStyle: 'italic', color: '#334155' },
  
  metaGrid: { gap: 8, marginBottom: 15 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  metaText: { fontSize: 12, color: '#64748b' },
  metaBold: { fontWeight: '700', color: '#0f172a' },

  resolucaoBox: { padding: 12, borderRadius: 10, backgroundColor: 'rgba(100, 116, 139, 0.05)', borderWidth: 1, borderColor: 'rgba(100, 116, 139, 0.3)', borderStyle: 'dashed' },
  resolucaoTitleBox: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6 },
  resolucaoTitle: { color: '#64748b', fontWeight: '800', fontSize: 12 },
  resolucaoText: { fontSize: 13, color: '#0f172a', fontWeight: '500' },
  resolucaoDateBox: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 8 },
  resolucaoDate: { fontSize: 11, color: '#64748b', fontWeight: '700' }
});