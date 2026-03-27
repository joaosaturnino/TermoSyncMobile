import { CheckCircle, Clock, MessageSquarePlus, PenTool, X } from 'lucide-react-native';
import { useCallback, useContext, useEffect, useState } from 'react';
import {
  Alert, FlatList, Modal, RefreshControl,
  ScrollView // 🔴 ScrollView ADICIONADO AQUI!
  ,
  StyleSheet, Text,
  TextInput, TouchableOpacity, View
} from 'react-native';
import { api, getSocket } from '../api/api';
import { AppContext } from '../context/AppContext';

export default function ChamadosScreen() {
  const { theme, userRole, filialAtiva } = useContext(AppContext);
  const [chamados, setChamados] = useState([]);
  const [equipamentos, setEquipamentos] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  
  // Modais
  const [modalOpen, setModalOpen] = useState(false);
  const [modalResolve, setModalResolve] = useState({ visible: false, chamadoId: null, nota: '' });
  const [formChamado, setFormChamado] = useState({ equipamento_id: '', descricao: '' });

  const carregarDados = useCallback(async () => {
    try {
      const [resC, resEq] = await Promise.all([api.get('/api/chamados'), api.get('/api/equipamentos')]);
      setChamados(resC.data);
      setEquipamentos(resEq.data);
    } catch (e) { } finally { setRefreshing(false); }
  }, []);

  useEffect(() => {
    carregarDados();
    const socket = getSocket();
    socket.on('atualizacao_dados', carregarDados);
    return () => socket.off('atualizacao_dados');
  }, [carregarDados]);

  const abrirChamado = async () => {
    if (!formChamado.equipamento_id || !formChamado.descricao) return Alert.alert('Aviso', 'Preencha os campos.');
    try {
      await api.post('/api/chamados', formChamado);
      setModalOpen(false); setFormChamado({ equipamento_id: '', descricao: '' }); carregarDados();
    } catch (e) { Alert.alert('Erro', 'Falha ao enviar solicitação.'); }
  };

  const resolverChamado = async () => {
    if (!modalResolve.nota) return Alert.alert('Aviso', 'Escreva uma nota técnica de resolução.');
    try {
      await api.put(`/api/chamados/${modalResolve.chamadoId}/status`, { status: 'Concluído', nota_resolucao: modalResolve.nota });
      setModalResolve({ visible: false, chamadoId: null, nota: '' }); carregarDados();
    } catch (e) { Alert.alert('Erro', 'Falha ao concluir.'); }
  };

  const mudarUrgencia = (id) => {
    Alert.alert('Definir Urgência', 'Selecione a prioridade deste chamado:', [
      { text: 'Baixa', onPress: () => api.put(`/api/chamados/${id}/urgencia`, { urgencia: 'Baixa' }).then(carregarDados) },
      { text: 'Média', onPress: () => api.put(`/api/chamados/${id}/urgencia`, { urgencia: 'Média' }).then(carregarDados) },
      { text: 'Alta', onPress: () => api.put(`/api/chamados/${id}/urgencia`, { urgencia: 'Alta' }).then(carregarDados) },
      { text: 'Crítica', onPress: () => api.put(`/api/chamados/${id}/urgencia`, { urgencia: 'Crítica' }).then(carregarDados), style: 'destructive' },
      { text: 'Cancelar', style: 'cancel' }
    ]);
  };

  const filtrados = filialAtiva === 'Todas' ? chamados : chamados.filter(c => c.filial === filialAtiva);

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      <View style={styles.headerArea}>
        <Text style={[styles.listTitle, { color: theme.textMain }]}>Ocorrências ({filtrados.length})</Text>
        {userRole === 'LOJA' && (
          <TouchableOpacity style={[styles.btnNovo, { backgroundColor: theme.primary }]} onPress={() => setModalOpen(true)}>
            <MessageSquarePlus color="#fff" size={20} /><Text style={styles.btnText}> Novo</Text>
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={filtrados}
        keyExtractor={(i) => String(i.id)}
        contentContainerStyle={{ padding: 16 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); carregarDados(); }} />}
        ListEmptyComponent={<View style={{alignItems: 'center', marginTop: 50}}><CheckCircle size={48} color={theme.success} /><Text style={{color: theme.textMuted, marginTop: 10}}>Sem chamados abertos.</Text></View>}
        renderItem={({ item }) => {
          const isConcluido = item.status === 'Concluído';
          const isCritico = item.urgencia === 'Crítica' || item.urgencia === 'Alta';
          const borderColor = isConcluido ? theme.success : (isCritico ? theme.danger : theme.warning);

          return (
            <View style={[styles.card, { backgroundColor: theme.card, borderLeftColor: borderColor }]}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={[styles.cardTitle, { color: theme.textMain, flex: 1 }]}>{item.equipamento_nome}</Text>
                <Text style={[styles.badgeStatus, { backgroundColor: isConcluido ? 'rgba(16,185,129,0.1)' : 'rgba(245,158,11,0.1)', color: borderColor }]}>{item.status}</Text>
              </View>
              
              <Text style={{ color: theme.textMain, marginVertical: 8 }}>"{item.descricao}"</Text>
              
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 5 }}>
                <Text style={{ color: theme.textMuted, fontSize: 11 }}>Loja: {item.filial}</Text>
                <Text style={{ color: theme.textMuted, fontSize: 11 }}>Criado por: {item.aberto_por}</Text>
              </View>

              <Text style={{ color: isCritico ? theme.danger : theme.textMuted, fontSize: 11, marginTop: 5, fontWeight: 'bold' }}>
                Urgência: {item.urgencia}
              </Text>

              {isConcluido && item.nota_resolucao && (
                <View style={[styles.notaBox, { backgroundColor: 'rgba(16,185,129,0.05)', borderColor: theme.success }]}>
                  <Text style={{ color: theme.success, fontSize: 11, fontWeight: 'bold' }}>Nota Técnica: {item.nota_resolucao}</Text>
                </View>
              )}

              {/* Botões de Ação */}
              <View style={{ flexDirection: 'row', marginTop: 12, gap: 10 }}>
                {userRole === 'ADMIN' && !isConcluido && (
                  <TouchableOpacity style={[styles.actionBtn, { borderColor: theme.border }]} onPress={() => mudarUrgencia(item.id)}>
                    <Clock size={16} color={theme.textMain} /><Text style={{ color: theme.textMain, marginLeft: 5, fontSize: 12 }}>Prioridade</Text>
                  </TouchableOpacity>
                )}
                {(userRole === 'ADMIN' || userRole === 'MANUTENCAO') && !isConcluido && (
                  <TouchableOpacity style={[styles.actionBtn, { borderColor: theme.success, backgroundColor: 'rgba(16,185,129,0.1)' }]} onPress={() => setModalResolve({ visible: true, chamadoId: item.id, nota: '' })}>
                    <PenTool size={16} color={theme.success} /><Text style={{ color: theme.success, marginLeft: 5, fontSize: 12, fontWeight: 'bold' }}>Corrigir</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          );
        }}
      />

      {/* Modal: Novo Chamado (LOJA) */}
      <Modal visible={modalOpen} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.card }]}>
            <Text style={[styles.formTitle, { color: theme.textMain }]}>Solicitar Reparo</Text>
            
            <Text style={[styles.label, { color: theme.textMain, marginTop: 15 }]}>EQUIPAMENTO COM DEFEITO</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 15, maxHeight: 40 }}>
              {equipamentos.filter(e => e.filial === filialAtiva).map(eq => (
                <TouchableOpacity key={eq.id} onPress={() => setFormChamado({ ...formChamado, equipamento_id: eq.id })} style={[styles.chipSugestao, { borderColor: theme.border, backgroundColor: formChamado.equipamento_id === eq.id ? theme.primary : 'transparent' }]}>
                  <Text style={{ fontSize: 12, color: formChamado.equipamento_id === eq.id ? '#fff' : theme.textMuted }}>{eq.nome}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Text style={[styles.label, { color: theme.textMain }]}>DESCRIÇÃO DO PROBLEMA</Text>
            <TextInput style={[styles.input, { borderColor: theme.border, color: theme.textMain, height: 100 }]} multiline textAlignVertical="top" placeholder="Descreva a anomalia..." placeholderTextColor={theme.textMuted} value={formChamado.descricao} onChangeText={(t) => setFormChamado({ ...formChamado, descricao: t })} />

            <View style={styles.modalActions}>
              <TouchableOpacity style={[styles.btnCancel, { borderColor: theme.border }]} onPress={() => setModalOpen(false)}><X color={theme.textMuted} size={24} /></TouchableOpacity>
              <TouchableOpacity style={[styles.btnSave, { backgroundColor: theme.primary }]} onPress={abrirChamado}><CheckCircle color="#fff" size={24} /></TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal: Resolver Chamado (ADMIN/MANUTENCAO) */}
      <Modal visible={modalResolve.visible} animationType="fade" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.card }]}>
            <Text style={[styles.formTitle, { color: theme.textMain }]}>Relatório de Resolução</Text>
            <Text style={[styles.label, { color: theme.textMain, marginTop: 15 }]}>NOTA TÉCNICA DO REPARO</Text>
            <TextInput style={[styles.input, { borderColor: theme.border, color: theme.textMain, height: 100 }]} multiline textAlignVertical="top" placeholder="O que foi reparado?" placeholderTextColor={theme.textMuted} value={modalResolve.nota} onChangeText={(t) => setModalResolve({ ...modalResolve, nota: t })} />
            <View style={styles.modalActions}>
              <TouchableOpacity style={[styles.btnCancel, { borderColor: theme.border }]} onPress={() => setModalResolve({ visible: false, chamadoId: null, nota: '' })}><Text style={{ color: theme.textMain }}>Cancelar</Text></TouchableOpacity>
              <TouchableOpacity style={[styles.btnSave, { backgroundColor: theme.success }]} onPress={resolverChamado}><Text style={{ color: '#fff', fontWeight: 'bold' }}>Concluir Reparo</Text></TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerArea: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20 },
  listTitle: { fontSize: 16, fontWeight: '800' },
  btnNovo: { flexDirection: 'row', padding: 10, borderRadius: 8, alignItems: 'center' },
  btnText: { color: '#fff', fontWeight: 'bold' },
  card: { padding: 15, borderRadius: 12, marginBottom: 12, borderWidth: 1, borderLeftWidth: 6, elevation: 1 },
  cardTitle: { fontSize: 16, fontWeight: 'bold' },
  badgeStatus: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, fontSize: 10, fontWeight: '900', overflow: 'hidden' },
  notaBox: { marginTop: 10, padding: 10, borderRadius: 8, borderWidth: 1 },
  actionBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 10, borderWidth: 1, borderRadius: 8 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { padding: 20, borderTopLeftRadius: 20, borderTopRightRadius: 20 },
  formTitle: { fontSize: 18, fontWeight: 'bold' },
  label: { fontSize: 10, fontWeight: 'bold', marginBottom: 5, letterSpacing: 1 },
  input: { borderWidth: 1, borderRadius: 8, padding: 12, marginBottom: 10 },
  chipSugestao: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 15, borderWidth: 1, marginRight: 8, alignSelf: 'flex-start' },
  modalActions: { flexDirection: 'row', marginTop: 10 },
  btnSave: { padding: 15, borderRadius: 12, flex: 1, marginLeft: 10, alignItems: 'center', justifyContent: 'center' },
  btnCancel: { padding: 15, borderRadius: 12, borderWidth: 1, alignItems: 'center', justifyContent: 'center', minWidth: 60 }
});