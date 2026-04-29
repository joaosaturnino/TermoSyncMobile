import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useContext, useMemo, useState } from 'react';
import { KeyboardAvoidingView, Modal, Platform, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { AppContext } from '../context/AppContext';

export default function ChamadosScreen({ navigation }) {
  const { userRole, filialAtiva, nomeLogado, chamados = [], tecnicosDb = [], equipamentos, api, carregarDashboard, isOffline, nomeGerente, nomeCoordenador } = useContext(AppContext);
  
  const [tecnicoFiltroOS, setTecnicoFiltroOS] = useState('todos');
  const [filtroTempoOS, setFiltroTempoOS] = useState('todos');
  
  const [modalChamado, setModalChamado] = useState(false);
  const [formChamado, setFormChamado] = useState({ equipamento_id: '', descricao: '', solicitante_nome: '', tecnico_responsavel: '' });
  const [modalResolver, setModalResolver] = useState({ isOpen: false, chamadoId: null, nota: '' });

  const equipamentosDaFilial = useMemo(() => {
    return filialAtiva === 'Todas' ? equipamentos : (equipamentos || []).filter(e => e.filial === filialAtiva);
  }, [equipamentos, filialAtiva]);

  const chamadosAtivosFiltrados = useMemo(() => {
    const trintaDiasAtras = new Date(); trintaDiasAtras.setDate(trintaDiasAtras.getDate() - 30);
    let list = (chamados || []).filter(c => c.status !== 'Concluído' || new Date(c.data_conclusao) >= trintaDiasAtras);
    
    if (userRole === 'ADMIN' && filialAtiva !== 'Todas') list = list.filter(c => c.filial === filialAtiva);
    if (userRole === 'MANUTENCAO') list = list.filter(c => c.tecnico_responsavel === nomeLogado);
    else if (tecnicoFiltroOS !== 'todos') list = list.filter(c => c.tecnico_responsavel === tecnicoFiltroOS);
    
    const hoje = new Date();
    if (filtroTempoOS === 'dia') list = list.filter(c => new Date(c.data_abertura).toDateString() === hoje.toDateString() || (c.data_conclusao && new Date(c.data_conclusao).toDateString() === hoje.toDateString()));
    else if (filtroTempoOS === 'semana') { const seteDias = new Date(hoje.getTime() - 7 * 24 * 60 * 60 * 1000); list = list.filter(c => new Date(c.data_abertura) >= seteDias || (c.data_conclusao && new Date(c.data_conclusao) >= seteDias)); }
    else if (filtroTempoOS === 'mes') { const mesAtras = new Date(hoje.getTime() - 30 * 24 * 60 * 60 * 1000); list = list.filter(c => new Date(c.data_abertura) >= mesAtras || (c.data_conclusao && new Date(c.data_conclusao) >= mesAtras)); }
    
    return list;
  }, [chamados, filialAtiva, userRole, nomeLogado, tecnicoFiltroOS, filtroTempoOS]);

  const abrirModalNovoChamado = () => {
    if (!equipamentosDaFilial || equipamentosDaFilial.length === 0) {
      alert("Não existem equipamentos nesta unidade."); return;
    }
    let solicitanteAuto = userRole === 'ADMIN' ? 'Administração Central' : (nomeGerente ? `Gerente - ${nomeGerente}` : (nomeCoordenador ? `Coordenador - ${nomeCoordenador}` : 'Equipe da Loja'));
    setFormChamado({ equipamento_id: equipamentosDaFilial[0].id, descricao: '', solicitante_nome: solicitanteAuto, tecnico_responsavel: '' }); 
    setModalChamado(true);
  };

  const salvarNovoChamado = async () => {
    if (isOffline) return alert('Ação bloqueada offline.');
    if (!formChamado.equipamento_id || !formChamado.descricao) return alert('Preencha a máquina e a descrição.');
    try { 
      await api.post('/chamados', formChamado); 
      setModalChamado(false); 
      carregarDashboard(); 
    } catch (err) { alert('Erro ao abrir chamado.'); }
  };

  const concluirChamado = async () => {
    if (isOffline) return alert('Ação bloqueada offline.');
    if (!modalResolver.nota.trim()) return alert('A nota de resolução é obrigatória.');
    try {
      await api.put(`/chamados/${modalResolver.chamadoId}/status`, { status: 'Concluído', nota_resolucao: modalResolver.nota });
      setModalResolver({ isOpen: false, chamadoId: null, nota: '' });
      carregarDashboard();
    } catch (err) { alert('Erro ao concluir o chamado.'); }
  };

  const getUrgencyColor = (urgencia, status) => {
    if (status === 'Concluído') return '#10b981'; // Success
    switch (urgencia) {
      case 'Crítica': return '#ef4444'; // Danger
      case 'Alta': return '#f97316';    // Orange
      case 'Média': return '#f59e0b';   // Warning
      default: return '#38bdf8';        // Info
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.openDrawer()} style={{ padding: 5 }}>
          <Ionicons name="menu" size={28} color="#059669" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Manutenção Corretiva</Text>
        <View style={{ width: 28 }} />
      </View>

      <View style={styles.filtersContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 15, gap: 10 }}>
          <TouchableOpacity style={[styles.filterBtn, filtroTempoOS === 'todos' && styles.filterBtnActive]} onPress={() => setFiltroTempoOS('todos')}><Text style={[styles.filterBtnText, filtroTempoOS === 'todos' && styles.filterBtnTextActive]}>Todos</Text></TouchableOpacity>
          <TouchableOpacity style={[styles.filterBtn, filtroTempoOS === 'dia' && styles.filterBtnActive]} onPress={() => setFiltroTempoOS('dia')}><Text style={[styles.filterBtnText, filtroTempoOS === 'dia' && styles.filterBtnTextActive]}>Hoje</Text></TouchableOpacity>
          <TouchableOpacity style={[styles.filterBtn, filtroTempoOS === 'semana' && styles.filterBtnActive]} onPress={() => setFiltroTempoOS('semana')}><Text style={[styles.filterBtnText, filtroTempoOS === 'semana' && styles.filterBtnTextActive]}>7 Dias</Text></TouchableOpacity>
          
          {userRole !== 'MANUTENCAO' && (
            <TouchableOpacity style={styles.btnPrimaryHeader} onPress={abrirModalNovoChamado}>
              <MaterialCommunityIcons name="message-plus" size={16} color="#fff" />
              <Text style={styles.btnPrimaryHeaderText}>Abrir Chamado</Text>
            </TouchableOpacity>
          )}
        </ScrollView>
      </View>

      <ScrollView contentContainerStyle={styles.listContainer}>
        {chamadosAtivosFiltrados.length === 0 ? (
          <View style={styles.emptyState}>
            <MaterialCommunityIcons name="check-decagram" size={64} color="#10b981" style={{ opacity: 0.8 }} />
            <Text style={styles.emptyTitle}>Sem Ocorrências</Text>
            <Text style={styles.emptySub}>A central de máquinas está saudável.</Text>
          </View>
        ) : (
          chamadosAtivosFiltrados.map(c => {
            const colorTheme = getUrgencyColor(c.urgencia, c.status);
            return (
              <View key={c.id} style={[styles.ticketCard, { borderBottomColor: colorTheme }]}>
                <View style={styles.ticketHeader}>
                  <View style={styles.ticketTitleBox}>
                    <MaterialCommunityIcons name="wrench" size={20} color={colorTheme} />
                    <Text style={styles.ticketEquip}>{c.equipamento_nome}</Text>
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: `${colorTheme}15`, borderColor: `${colorTheme}40` }]}>
                    <Text style={[styles.statusText, { color: colorTheme }]}>{c.status}</Text>
                  </View>
                </View>

                <View style={styles.ticketDescBox}>
                  <Text style={styles.ticketDescText}>"{c.descricao}"</Text>
                </View>

                <View style={styles.ticketMetaGrid}>
                  <View style={styles.metaRow}><MaterialCommunityIcons name="map-marker" size={14} color="#64748b" /><Text style={styles.metaText}>Loja: <Text style={styles.metaBold}>{c.filial}</Text></Text></View>
                  <View style={styles.metaRow}><MaterialCommunityIcons name="account" size={14} color="#64748b" /><Text style={styles.metaText}>Solicitante: <Text style={styles.metaBold}>{c.solicitante_nome || c.aberto_por}</Text></Text></View>
                  <View style={styles.metaRow}><MaterialCommunityIcons name="wrench-clock" size={14} color={c.status !== 'Concluído' ? '#38bdf8' : '#64748b'} /><Text style={styles.metaText}>Técnico: <Text style={styles.metaBold}>{c.tecnico_responsavel || 'Geral'}</Text></Text></View>
                  {c.status !== 'Concluído' && <View style={styles.metaRow}><MaterialCommunityIcons name="alert-circle" size={14} color={colorTheme} /><Text style={styles.metaText}>Urgência: <Text style={{fontWeight: 'bold', color: colorTheme}}>{c.urgencia}</Text></Text></View>}
                </View>

                {c.status === 'Concluído' && (
                  <View style={styles.resolucaoBox}>
                    <Text style={styles.resolucaoTitle}><MaterialCommunityIcons name="check-all" size={16} /> Nota de Resolução:</Text>
                    <Text style={styles.resolucaoText}>{c.nota_resolucao}</Text>
                  </View>
                )}

                {c.status !== 'Concluído' && (userRole === 'ADMIN' || userRole === 'MANUTENCAO') && (
                  <TouchableOpacity style={styles.btnConcluir} onPress={() => setModalResolver({ isOpen: true, chamadoId: c.id, nota: '' })}>
                    <MaterialCommunityIcons name="check-circle-outline" size={18} color="#10b981" />
                    <Text style={styles.btnConcluirText}>Marcar como Corrigido</Text>
                  </TouchableOpacity>
                )}
              </View>
            );
          })
        )}
      </ScrollView>

      {/* Modal Novo Chamado */}
      <Modal visible={modalChamado} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.modalContent}>
            <Text style={styles.modalTitle}><MaterialCommunityIcons name="wrench" size={20} color="#059669" /> Nova Ordem de Serviço</Text>
            
            <Text style={styles.inputLabel}>Equipamento</Text>
            <View style={styles.selectFake}>
              <Text style={styles.selectFakeText}>{equipamentosDaFilial?.find(e => e.id === formChamado.equipamento_id)?.nome || 'Selecione...'}</Text>
            </View>
            
            <Text style={styles.inputLabel}>Descrição do Problema</Text>
            <TextInput style={styles.textArea} multiline numberOfLines={3} placeholder="Ex: O compressor está a fazer um ruído..." value={formChamado.descricao} onChangeText={t => setFormChamado({...formChamado, descricao: t})} />
            
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.btnCancel} onPress={() => setModalChamado(false)}><Text style={styles.btnCancelText}>Cancelar</Text></TouchableOpacity>
              <TouchableOpacity style={styles.btnConfirm} onPress={salvarNovoChamado}><Text style={styles.btnConfirmText}>Abrir Chamado</Text></TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>

      {/* Modal Concluir Chamado */}
      <Modal visible={modalResolver.isOpen} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.modalContent}>
            <Text style={styles.modalTitle}><MaterialCommunityIcons name="check-decagram" size={22} color="#10b981" /> Concluir Chamado</Text>
            <Text style={styles.modalSub}>Descreva a intervenção técnica realizada para manter o histórico.</Text>
            <TextInput style={styles.textArea} multiline numberOfLines={4} placeholder="Ex: Substituição da válvula solenoide..." value={modalResolver.nota} onChangeText={n => setModalResolver({...modalResolver, nota: n})} />
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.btnCancel} onPress={() => setModalResolver({ isOpen: false, chamadoId: null, nota: '' })}><Text style={styles.btnCancelText}>Cancelar</Text></TouchableOpacity>
              <TouchableOpacity style={[styles.btnConfirm, {backgroundColor: '#10b981'}]} onPress={concluirChamado}><Text style={styles.btnConfirmText}>Concluir e Arquivar</Text></TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 15, backgroundColor: '#fff', borderBottomWidth: 1, borderColor: '#e2e8f0', paddingTop: Platform.OS === 'ios' ? 50 : 15 },
  headerTitle: { fontSize: 18, fontWeight: '900', color: '#0f172a' },
  filtersContainer: { paddingVertical: 15, backgroundColor: '#fff', borderBottomWidth: 1, borderColor: '#e2e8f0' },
  filterBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: '#f1f5f9', borderWidth: 1, borderColor: '#e2e8f0' },
  filterBtnActive: { backgroundColor: '#059669', borderColor: '#059669' },
  filterBtnText: { color: '#64748b', fontWeight: 'bold', fontSize: 13 },
  filterBtnTextActive: { color: '#fff' },
  btnPrimaryHeader: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#059669', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, gap: 6 },
  btnPrimaryHeaderText: { color: '#fff', fontWeight: 'bold', fontSize: 13 },
  
  listContainer: { padding: 15, paddingBottom: 40 },
  emptyState: { alignItems: 'center', justifyContent: 'center', paddingVertical: 60 },
  emptyTitle: { fontSize: 18, fontWeight: '900', color: '#0f172a', marginTop: 15 },
  emptySub: { fontSize: 14, color: '#64748b', textAlign: 'center', marginTop: 5, fontWeight: '500' },

  ticketCard: { backgroundColor: '#fff', borderRadius: 16, padding: 20, marginBottom: 15, borderBottomWidth: 4, elevation: 3, shadowColor: '#000', shadowOffset: {width: 0, height: 4}, shadowOpacity: 0.05 },
  ticketHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 15 },
  ticketTitleBox: { flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 },
  ticketEquip: { fontSize: 16, fontWeight: '900', color: '#0f172a' },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, borderWidth: 1 },
  statusText: { fontSize: 10, fontWeight: '900', textTransform: 'uppercase' },
  
  ticketDescBox: { backgroundColor: 'rgba(0,0,0,0.02)', borderLeftWidth: 3, borderLeftColor: '#e2e8f0', padding: 12, borderRadius: 8, marginBottom: 15 },
  ticketDescText: { fontSize: 14, fontStyle: 'italic', color: '#334155', lineHeight: 20 },
  
  ticketMetaGrid: { gap: 8, marginBottom: 15 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  metaText: { fontSize: 12, color: '#64748b' },
  metaBold: { fontWeight: '700', color: '#0f172a' },

  resolucaoBox: { marginTop: 10, padding: 12, borderRadius: 10, backgroundColor: 'rgba(16, 185, 129, 0.08)', borderWidth: 1, borderColor: 'rgba(16, 185, 129, 0.3)', borderStyle: 'dashed' },
  resolucaoTitle: { color: '#10b981', fontWeight: '800', fontSize: 12, marginBottom: 6, display: 'flex', alignItems: 'center' },
  resolucaoText: { fontSize: 13, color: '#0f172a', fontWeight: '500' },

  btnConcluir: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#10b981', marginTop: 10 },
  btnConcluirText: { color: '#10b981', fontWeight: '800', fontSize: 13 },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
  modalContent: { backgroundColor: '#fff', borderRadius: 20, padding: 25 },
  modalTitle: { fontSize: 18, fontWeight: '900', color: '#0f172a', marginBottom: 15 },
  modalSub: { fontSize: 13, color: '#64748b', marginBottom: 15, fontWeight: '500' },
  inputLabel: { fontSize: 12, fontWeight: '800', color: '#64748b', marginBottom: 6, textTransform: 'uppercase' },
  selectFake: { backgroundColor: '#f1f5f9', padding: 14, borderRadius: 10, marginBottom: 15 },
  selectFakeText: { color: '#0f172a', fontWeight: '600' },
  textArea: { backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 12, padding: 15, minHeight: 100, textAlignVertical: 'top', fontSize: 14, marginBottom: 20 },
  modalActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 10 },
  btnCancel: { padding: 12, borderRadius: 10 },
  btnCancelText: { color: '#64748b', fontWeight: '800' },
  btnConfirm: { backgroundColor: '#059669', paddingHorizontal: 20, paddingVertical: 12, borderRadius: 10 },
  btnConfirmText: { color: '#fff', fontWeight: '800' }
});