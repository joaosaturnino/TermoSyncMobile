import {
  ActivitySquare,
  AlertTriangle, CheckCircle,
  Clock,
  Columns,
  MapPin,
  Wrench
} from 'lucide-react-native';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator, Alert, SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import api from '../api/api';

export default function ChamadosScreen() {
  const [chamados, setChamados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [abaAtiva, setAbaAtiva] = useState('Aberto');

  const abas = [
    { id: 'Aberto', titulo: 'TRIAGEM', color: '#ef4444', icon: AlertTriangle },
    { id: 'Em Atendimento', titulo: 'INTERVENÇÃO', color: '#f59e0b', icon: Wrench },
    { id: 'Concluído', titulo: 'AUDITORIA', color: '#10b981', icon: CheckCircle }
  ];

  const carregarChamados = async () => {
    try {
      const res = await api.get('/chamados');
      setChamados(res.data || []);
    } catch (e) {
      Alert.alert('Erro', 'Falha ao sincronizar o Field Service Management.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { carregarChamados(); }, []);

  const moverChamado = async (id, novoStatus) => {
    try {
      await api.put(`/chamados/${id}/status`, { status: novoStatus });
      carregarChamados();
    } catch (e) {
      Alert.alert('Erro', 'Falha ao atualizar ticket no banco de dados.');
    }
  };

  const ticketsFiltrados = chamados.filter(c => c.status === abaAtiva && !c.arquivado);

  return (
    <SafeAreaView style={styles.container}>
      
      {/* CABEÇALHO */}
      <View style={styles.header}>
        <View style={styles.iconBox}><Columns size={20} color="#0f172a" /></View>
        <View>
          <Text style={styles.headerTitle}>INCIDENTES (ITSM)</Text>
          <Text style={styles.headerSubtitle}>Field Service Management</Text>
        </View>
      </View>

      {/* SELETOR DE COLUNAS KANBAN */}
      <View style={styles.tabContainer}>
        {abas.map(aba => (
          <TouchableOpacity 
            key={aba.id} 
            style={[styles.tabBtn, abaAtiva === aba.id && { borderBottomColor: aba.color }]}
            onPress={() => setAbaAtiva(aba.id)}
          >
            <aba.icon size={16} color={abaAtiva === aba.id ? aba.color : '#64748b'} />
            <Text style={[styles.tabText, abaAtiva === aba.id && { color: aba.color }]}>
              {aba.titulo}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* LISTA DE TICKETS */}
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {loading ? (
          <ActivityIndicator size="large" color="#38bdf8" style={{ marginTop: 40 }} />
        ) : ticketsFiltrados.length > 0 ? (
          ticketsFiltrados.map(ticket => {
            const corTicket = abas.find(a => a.id === ticket.status)?.color || '#38bdf8';
            
            return (
              <View key={ticket.id} style={[styles.ticketCard, { borderLeftColor: corTicket }]}>
                <View style={styles.ticketHeader}>
                  <Text style={styles.ticketEquip}>{ticket.equipamento_nome || 'Sistema Core'}</Text>
                  <Text style={styles.ticketId}>OS-{ticket.id}</Text>
                </View>
                
                <View style={styles.ticketMetaRow}>
                  <View style={styles.metaItem}><MapPin size={10} color="#94a3b8"/><Text style={styles.metaText}>{ticket.filial || 'Matriz'}</Text></View>
                  <View style={styles.metaItem}><Clock size={10} color="#94a3b8"/><Text style={styles.metaText}>{new Date(ticket.data_abertura).toLocaleDateString()}</Text></View>
                </View>

                <View style={styles.ticketDescBox}>
                  <Text style={styles.ticketDesc} numberOfLines={3}>{ticket.descricao}</Text>
                </View>

                <View style={styles.ticketFooter}>
                  <View style={styles.avatar}><Text style={styles.avatarText}>{ticket.aberto_por ? ticket.aberto_por.charAt(0).toUpperCase() : 'S'}</Text></View>
                  
                  {/* Botões de Ação Dinâmicos baseados no status atual */}
                  <View style={styles.actionsRow}>
                    {abaAtiva === 'Aberto' && (
                      <TouchableOpacity style={styles.btnAction} onPress={() => moverChamado(ticket.id, 'Em Atendimento')}>
                        <Text style={styles.btnActionText}>INICIAR ATENDIMENTO</Text>
                      </TouchableOpacity>
                    )}
                    {abaAtiva === 'Em Atendimento' && (
                      <>
                        <TouchableOpacity style={[styles.btnAction, {borderColor: '#ef4444'}]} onPress={() => moverChamado(ticket.id, 'Aberto')}>
                          <Text style={[styles.btnActionText, {color: '#ef4444'}]}>PAUSAR</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.btnAction, {borderColor: '#10b981', backgroundColor: 'rgba(16,185,129,0.1)'}]} onPress={() => moverChamado(ticket.id, 'Concluído')}>
                          <Text style={[styles.btnActionText, {color: '#10b981'}]}>CONCLUIR</Text>
                        </TouchableOpacity>
                      </>
                    )}
                  </View>
                </View>
              </View>
            );
          })
        ) : (
          <View style={styles.emptyState}>
            <ActivitySquare size={48} color="#334155" />
            <Text style={styles.emptyTitle}>FILA VAZIA</Text>
            <Text style={styles.emptyDesc}>Nenhuma OS encontrada na coluna "{abaAtiva}".</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#020617' },
  scrollContent: { padding: 16, paddingBottom: 40 },
  
  header: { padding: 20, backgroundColor: '#0b1120', borderBottomWidth: 1, borderBottomColor: '#1e293b', flexDirection: 'row', alignItems: 'center', gap: 12 },
  iconBox: { width: 40, height: 40, borderRadius: 10, backgroundColor: '#38bdf8', alignItems: 'center', justifyContent: 'center' },
  headerTitle: { color: '#fff', fontSize: 16, fontWeight: '900', letterSpacing: 1 },
  headerSubtitle: { color: '#94a3b8', fontSize: 11, fontWeight: 'bold' },

  tabContainer: { flexDirection: 'row', backgroundColor: '#020617', borderBottomWidth: 1, borderBottomColor: '#1e293b' },
  tabBtn: { flex: 1, paddingVertical: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, borderBottomWidth: 2, borderBottomColor: 'transparent' },
  tabText: { fontSize: 11, fontWeight: '900', color: '#64748b' },

  ticketCard: { backgroundColor: '#0b1120', borderRadius: 12, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#1e293b', borderLeftWidth: 4 },
  ticketHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 },
  ticketEquip: { fontSize: 15, fontWeight: 'bold', color: '#fff', flex: 1 },
  ticketId: { fontSize: 10, fontWeight: '900', color: '#64748b', fontFamily: 'monospace', backgroundColor: 'rgba(255,255,255,0.05)', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  
  ticketMetaRow: { flexDirection: 'row', gap: 12, marginBottom: 12 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: { fontSize: 10, color: '#94a3b8', fontWeight: 'bold' },

  ticketDescBox: { backgroundColor: '#020617', padding: 10, borderRadius: 8, borderWidth: 1, borderColor: '#1e293b', marginBottom: 12 },
  ticketDesc: { fontSize: 12, color: '#cbd5e1', lineHeight: 18 },

  ticketFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderTopColor: '#1e293b', paddingTop: 12 },
  avatar: { width: 24, height: 24, borderRadius: 12, backgroundColor: '#38bdf8', alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 10, fontWeight: '900', color: '#0f172a' },
  
  actionsRow: { flexDirection: 'row', gap: 8 },
  btnAction: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6, borderWidth: 1, borderColor: '#334155', backgroundColor: '#0f172a' },
  btnActionText: { fontSize: 9, fontWeight: '900', color: '#cbd5e1', letterSpacing: 0.5 },

  emptyState: { alignItems: 'center', justifyContent: 'center', padding: 40, marginTop: 20, backgroundColor: '#0b1120', borderRadius: 16, borderWidth: 1, borderColor: '#1e293b', borderStyle: 'dashed' },
  emptyTitle: { color: '#fff', fontSize: 14, fontWeight: '900', marginTop: 16, letterSpacing: 1 },
  emptyDesc: { color: '#64748b', fontSize: 11, textAlign: 'center', marginTop: 8 }
});