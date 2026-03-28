import { MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useContext, useEffect, useState, useMemo } from 'react';
import { Alert, FlatList, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import api from '../api/api';
import { AppContext } from '../context/AppContext';

export default function ChamadosScreen() {
  const { theme } = useContext(AppContext);
  const [chamados, setChamados] = useState([]);
  const [equipamentos, setEquipamentos] = useState([]);
  const [tecnicos, setTecnicos] = useState([]);
  
  // Filtros FIEIS À WEB
  const [filtroTempoOS, setFiltroTempoOS] = useState('todos');
  const [tecnicoFiltroOS, setTecnicoFiltroOS] = useState('todos');
  
  // Dados de Sessão
  const [userRole, setUserRole] = useState('LOJA');
  const [nomeLogado, setNomeLogado] = useState('');
  const [nomeGerente, setNomeGerente] = useState('');
  const [nomeCoordenador, setNomeCoordenador] = useState('');

  // Modais
  const [modalVisible, setModalVisible] = useState(false);
  const [form, setForm] = useState({ equipamento_id: '', descricao: '', solicitante_nome: '', tecnico_responsavel: '' });

  const [modalResolucao, setModalResolucao] = useState(false);
  const [chamadoAResolver, setChamadoAResolver] = useState(null);
  const [notaResolucao, setNotaResolucao] = useState('');

  const [modalUrgenciaVisible, setModalUrgenciaVisible] = useState(false);
  const [chamadoUrgenciaId, setChamadoUrgenciaId] = useState(null);

  useEffect(() => {
    carregarDadosSessao();
    carregarChamados();
    carregarEquipamentos();
    carregarTecnicos();
  }, []);

  const carregarDadosSessao = async () => {
    setUserRole(await AsyncStorage.getItem('userRole') || 'LOJA');
    setNomeLogado(await AsyncStorage.getItem('nomeLogado') || '');
    setNomeGerente(await AsyncStorage.getItem('nome_gerente') || '');
    setNomeCoordenador(await AsyncStorage.getItem('nome_coordenador') || '');
  };

  const carregarChamados = async () => {
    try { const res = await api.get('/api/chamados'); setChamados(res.data); } catch(e) {}
  };

  const carregarEquipamentos = async () => {
    try { const res = await api.get('/api/equipamentos'); setEquipamentos(res.data); } catch(e) {}
  };

  const carregarTecnicos = async () => {
    try { const res = await api.get('/api/tecnicos'); setTecnicos(res.data); } catch(e) {}
  };

  // Lógica de 30 dias idêntica à Web
  const trintaDiasAtras = useMemo(() => {
    const data = new Date(); data.setDate(data.getDate() - 30); return data;
  }, []);

  // Lista base (Apenas os não concluídos ou concluídos há menos de 30 dias)
  const chamadosAtivos = useMemo(() => {
     return chamados.filter(c => c.status !== 'Concluído' || new Date(c.data_conclusao) >= trintaDiasAtras);
  }, [chamados, trintaDiasAtras]);

  // Lista Filtrada para a Tela
  const chamadosFiltrados = useMemo(() => {
    let list = chamadosAtivos;

    // Filtro por Técnico
    if (userRole === 'MANUTENCAO') {
       list = list.filter(c => c.tecnico_responsavel === nomeLogado);
    } else {
       if (tecnicoFiltroOS !== 'todos') list = list.filter(c => c.tecnico_responsavel === tecnicoFiltroOS);
    }

    // Filtro por Tempo
    const hoje = new Date();
    if (filtroTempoOS === 'dia') list = list.filter(c => new Date(c.data_conclusao || c.data_abertura).toDateString() === hoje.toDateString());
    else if (filtroTempoOS === 'semana') {
       const seteDias = new Date(hoje.getTime() - 7 * 24 * 60 * 60 * 1000);
       list = list.filter(c => new Date(c.data_conclusao || c.data_abertura) >= seteDias);
    } else if (filtroTempoOS === 'mes') {
       list = list.filter(c => new Date(c.data_conclusao || c.data_abertura) >= trintaDiasAtras);
    }

    return list;
  }, [chamadosAtivos, tecnicoFiltroOS, filtroTempoOS, userRole, nomeLogado, trintaDiasAtras]);


  const abrirNovaOS = () => {
    if (equipamentos.length === 0) return Alert.alert('Aviso', 'Não existem equipamentos registados nesta unidade.');

    let solicitanteAuto = 'Equipa da Loja';
    if (userRole === 'ADMIN') solicitanteAuto = 'Administração Central';
    else if (nomeGerente) solicitanteAuto = `Gerente - ${nomeGerente}`;
    else if (nomeCoordenador) solicitanteAuto = `Coordenador - ${nomeCoordenador}`;

    setForm({ equipamento_id: equipamentos[0].id, descricao: '', solicitante_nome: solicitanteAuto, tecnico_responsavel: '' });
    setModalVisible(true);
  };

  const submeterOS = async () => {
    if (!form.equipamento_id) return Alert.alert('Erro', 'Selecione uma máquina.');
    if (!form.descricao) return Alert.alert('Erro', 'Por favor, descreva a avaria.');
    try {
      await api.post('/api/chamados', form);
      Alert.alert('Sucesso', 'Ordem de Serviço (OS) enviada!');
      setModalVisible(false); carregarChamados();
    } catch(e) { Alert.alert('Erro', 'Falha ao submeter a Ordem de Serviço.'); }
  };

  const concluirChamado = async () => {
    if (!notaResolucao) return Alert.alert('Aviso', 'A Nota de Resolução é obrigatória.');
    try {
      await api.put(`/api/chamados/${chamadoAResolver}/status`, { status: 'Concluído', nota_resolucao: notaResolucao });
      Alert.alert('Sucesso', 'Intervenção registada e OS concluída!');
      setModalResolucao(false); setNotaResolucao(''); carregarChamados();
    } catch(e) { Alert.alert('Erro', 'Falha ao concluir o chamado.'); }
  };

  const atualizarUrgencia = async (novaUrgencia) => {
    try {
      await api.put(`/api/chamados/${chamadoUrgenciaId}/urgencia`, { urgencia: novaUrgencia });
      setModalUrgenciaVisible(false); carregarChamados();
    } catch(e) { Alert.alert('Erro', 'Falha ao atualizar urgência.'); }
  };

  const imprimirLote = () => {
    if (chamadosFiltrados.length === 0) return Alert.alert('Aviso', 'Não há chamados para imprimir com os filtros atuais.');
    Alert.alert('Impressão Iniciada', `A gerar documento com ${chamadosFiltrados.length} OS para envio...`);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      
      <View style={styles.header}>
          <Text style={{ fontSize: 18, fontWeight: '900', color: theme.textMain }}>Central de OS</Text>
          {userRole !== 'MANUTENCAO' && (
            <TouchableOpacity style={[styles.btnNova, { backgroundColor: theme.primary }]} onPress={abrirNovaOS}>
              <MaterialCommunityIcons name="plus-circle" size={18} color="#fff" />
              <Text style={styles.btnNovaText}>Nova OS</Text>
            </TouchableOpacity>
          )}
      </View>

      {/* FILTROS AVANÇADOS IGUAIS À WEB */}
      <View style={{ marginBottom: 15 }}>
         <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 8 }}>
            <TouchableOpacity style={styles.btnImprimir} onPress={imprimirLote}>
               <MaterialCommunityIcons name="printer" size={16} color="#3b82f6" />
               <Text style={{ color: '#3b82f6', fontWeight: 'bold', marginLeft: 6, fontSize: 12 }}>Imprimir ({chamadosFiltrados.length})</Text>
            </TouchableOpacity>

            {userRole !== 'MANUTENCAO' && (
              <>
                <TouchableOpacity onPress={() => setTecnicoFiltroOS('todos')} style={[styles.chipFiltro, tecnicoFiltroOS === 'todos' && { backgroundColor: theme.primary, borderColor: theme.primary }]}>
                    <Text style={{ color: tecnicoFiltroOS === 'todos' ? '#fff' : theme.textMuted, fontSize: 12, fontWeight: 'bold' }}>Todos Técnicos</Text>
                </TouchableOpacity>
                {tecnicos.map(t => (
                  <TouchableOpacity key={t.id} onPress={() => setTecnicoFiltroOS(t.nome_tecnico)} style={[styles.chipFiltro, tecnicoFiltroOS === t.nome_tecnico && { backgroundColor: theme.primary, borderColor: theme.primary }]}>
                      <Text style={{ color: tecnicoFiltroOS === t.nome_tecnico ? '#fff' : theme.textMuted, fontSize: 12, fontWeight: 'bold' }}>{t.nome_tecnico}</Text>
                  </TouchableOpacity>
                ))}
              </>
            )}
         </ScrollView>

         <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {[ {id: 'todos', label: 'Todo o Período'}, {id: 'dia', label: 'Apenas Hoje'}, {id: 'semana', label: 'Últimos 7 Dias'}, {id: 'mes', label: 'Últimos 30 Dias'} ].map(t => (
               <TouchableOpacity key={t.id} onPress={() => setFiltroTempoOS(t.id)} style={[styles.chipFiltro, filtroTempoOS === t.id && { backgroundColor: theme.textMain, borderColor: theme.textMain }]}>
                  <Text style={{ color: filtroTempoOS === t.id ? theme.bg : theme.textMuted, fontSize: 12, fontWeight: 'bold' }}>{t.label}</Text>
               </TouchableOpacity>
            ))}
         </ScrollView>
      </View>

      <FlatList
        data={chamadosFiltrados}
        keyExtractor={i => i.id.toString()}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={() => (
           <View style={{alignItems: 'center', marginTop: 50}}>
               <MaterialCommunityIcons name="check-circle" size={60} color={theme.success} style={{opacity: 0.5}}/>
               <Text style={{color: theme.textMuted, marginTop: 10, fontWeight: 'bold'}}>Nenhuma OS pendente.</Text>
           </View>
        )}
        renderItem={({item}) => {
          const isConcluido = item.status === 'Concluído';
          const corBorda = isConcluido ? theme.success : (item.urgencia === 'Crítica' || item.urgencia === 'Alta' ? theme.danger : theme.warning);

          return (
            <View style={[styles.card, { backgroundColor: theme.card, borderLeftWidth: 6, borderLeftColor: corBorda }]}>
              
              <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}}>
                  <Text style={[styles.cardTitle, { color: theme.textMain, flex: 1 }]} numberOfLines={1}>{item.equipamento_nome}</Text>
                  <View style={[styles.badge, {backgroundColor: isConcluido ? theme.success : (item.status === 'Em Atendimento' ? theme.primary : '#64748b')}]}>
                      <Text style={{color: '#fff', fontSize: 11, fontWeight: 'bold'}}>{item.status}</Text>
                  </View>
              </View>
              
              <Text style={{ color: theme.textMain, fontSize: 14, marginVertical: 12, fontWeight: '500', fontStyle: 'italic' }}>
                "{item.descricao}"
              </Text>
              
              <Text style={{ color: theme.textMuted, fontSize: 13, marginBottom: 4 }}>
                Loja: <Text style={{fontWeight: 'bold'}}>{item.filial}</Text> | Solicitante: <Text style={{fontWeight: 'bold'}}>{item.solicitante_nome || item.aberto_por}</Text>
              </Text>
              
              <Text style={{ color: theme.primary, fontSize: 13, fontWeight: 'bold', marginBottom: 4 }}>
                Técnico Acionado: {item.tecnico_responsavel || 'Manutenção Geral'}
              </Text>

              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
                <Text style={{ color: theme.textMuted, fontSize: 13 }}>Urgência definida: </Text>
                <Text style={{ fontWeight: 'bold', color: item.urgencia === 'Crítica' || item.urgencia === 'Alta' ? theme.danger : theme.warning }}>
                  {item.urgencia}
                </Text>
              </View>

              {isConcluido && (
                <View style={{ marginTop: 8, padding: 12, backgroundColor: 'rgba(16, 185, 129, 0.1)', borderRadius: 8, borderWidth: 1, borderColor: 'rgba(16, 185, 129, 0.2)' }}>
                  <Text style={{ fontSize: 13, fontWeight: 'bold', color: theme.success }}>Nota de Resolução:</Text>
                  <Text style={{ fontSize: 13, color: theme.textMain, marginTop: 4 }}>{item.nota_resolucao}</Text>
                  <Text style={{ fontSize: 11, color: 'gray', marginTop: 6 }}>Concluído em: {new Date(item.data_conclusao).toLocaleDateString()}</Text>
                </View>
              )}

              {userRole === 'ADMIN' && !isConcluido && (
                 <TouchableOpacity 
                    style={{ padding: 10, borderWidth: 1, borderColor: theme.border, borderRadius: 8, marginBottom: 10, alignItems: 'center' }}
                    onPress={() => { setChamadoUrgenciaId(item.id); setModalUrgenciaVisible(true); }}>
                    <Text style={{ fontSize: 12, color: theme.textMain, fontWeight: 'bold' }}>Alterar Urgência (Atual: {item.urgencia})</Text>
                 </TouchableOpacity>
              )}

              {(userRole === 'ADMIN' || userRole === 'MANUTENCAO') && !isConcluido && (
                <TouchableOpacity 
                   style={[styles.btnConcluir, { borderColor: theme.success }]} 
                   onPress={() => { setChamadoAResolver(item.id); setModalResolucao(true); }}>
                  <MaterialCommunityIcons name="check-circle" size={18} color={theme.success} />
                  <Text style={{ color: theme.success, fontWeight: 'bold', marginLeft: 6 }}>Marcar como Corrigido</Text>
                </TouchableOpacity>
              )}
            </View>
          );
        }}
      />

      {/* MODAL DE ABERTURA DE NOVA OS */}
      <Modal visible={modalVisible} transparent animationType="slide">
         <View style={styles.modalContainer}>
            <View style={[styles.modalContent, { backgroundColor: theme.card, borderColor: theme.border }]}>
               <Text style={[styles.modalTitle, { color: theme.textMain }]}>Nova Ordem de Serviço</Text>
               
               <ScrollView style={{maxHeight: '80%', marginTop: 15}} showsVerticalScrollIndicator={false}>
                 
                 <Text style={styles.label}>Máquina / Equipamento com Avaria</Text>
                 <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{marginBottom: 15}}>
                    {equipamentos.map(eq => (
                        <TouchableOpacity key={eq.id} onPress={() => setForm({...form, equipamento_id: eq.id})} style={[styles.chip, form.equipamento_id === eq.id && { backgroundColor: theme.primary, borderColor: theme.primary }]}>
                            <Text style={{ color: form.equipamento_id === eq.id ? '#fff' : theme.textMuted, fontSize: 12, fontWeight: 'bold' }}>
                              {userRole === 'ADMIN' ? `[${eq.filial}] ` : ''}{eq.nome}
                            </Text>
                        </TouchableOpacity>
                    ))}
                 </ScrollView>

                 <Text style={styles.label}>Descrição do Problema Encontrado</Text>
                 <TextInput 
                    style={[styles.input, { color: theme.textMain, borderColor: theme.border, height: 90, textAlignVertical: 'top' }]} 
                    multiline 
                    value={form.descricao} 
                    onChangeText={t => setForm({...form, descricao: t})} 
                    placeholder="Ex: O compressor está a fazer um ruído estranho..." 
                 />
                 
                 <Text style={styles.label}>Nome do Solicitante (Automático)</Text>
                 <TextInput 
                    style={[styles.input, { color: theme.textMuted, borderColor: theme.border, backgroundColor: 'rgba(0,0,0,0.05)' }]} 
                    value={form.solicitante_nome} 
                    editable={false} 
                 />

                 <Text style={styles.label}>Atribuir a Técnico Específico (Opcional)</Text>
                 <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{marginBottom: 15}}>
                    <TouchableOpacity onPress={() => setForm({...form, tecnico_responsavel: ''})} style={[styles.chip, form.tecnico_responsavel === '' && { backgroundColor: theme.primary, borderColor: theme.primary }]}>
                        <Text style={{ color: form.tecnico_responsavel === '' ? '#fff' : theme.textMuted, fontSize: 12, fontWeight: 'bold' }}>Deixar em aberto</Text>
                    </TouchableOpacity>
                    {tecnicos.map(t => (
                        <TouchableOpacity key={t.id} onPress={() => setForm({...form, tecnico_responsavel: t.nome_tecnico})} style={[styles.chip, form.tecnico_responsavel === t.nome_tecnico && { backgroundColor: theme.primary, borderColor: theme.primary }]}>
                            <Text style={{ color: form.tecnico_responsavel === t.nome_tecnico ? '#fff' : theme.textMuted, fontSize: 12, fontWeight: 'bold' }}>{t.nome_tecnico}</Text>
                        </TouchableOpacity>
                    ))}
                 </ScrollView>

               </ScrollView>
               <View style={styles.modalActions}>
                 <TouchableOpacity style={styles.btnCancel} onPress={() => setModalVisible(false)}><Text style={{color: theme.textMuted, fontWeight: 'bold'}}>Cancelar</Text></TouchableOpacity>
                 <TouchableOpacity style={[styles.btnSave, {backgroundColor: theme.primary}]} onPress={submeterOS}>
                    <MaterialCommunityIcons name="content-save" size={16} color="#fff" style={{marginRight: 6}}/>
                    <Text style={{color:'#fff', fontWeight:'bold'}}>Submeter OS</Text>
                 </TouchableOpacity>
               </View>
            </View>
         </View>
      </Modal>

      {/* MODAL DE CONCLUSÃO DE OS (PARA TÉCNICOS/ADMIN) */}
      <Modal visible={modalResolucao} transparent animationType="fade">
         <View style={styles.modalContainer}>
            <View style={[styles.modalContent, { backgroundColor: theme.card, borderColor: theme.border }]}>
               <Text style={[styles.modalTitle, { color: theme.textMain, marginBottom: 15 }]}>Relatório Técnico</Text>
               <Text style={styles.label}>Escreva a Nota de Resolução do reparo:</Text>
               <TextInput 
                  style={[styles.input, { color: theme.textMain, borderColor: theme.border, height: 100, textAlignVertical: 'top' }]} 
                  multiline 
                  value={notaResolucao} 
                  onChangeText={setNotaResolucao} 
                  placeholder="Ex: Carga de gás aplicada e compressor limpo." 
               />
               <View style={styles.modalActions}>
                 <TouchableOpacity style={styles.btnCancel} onPress={() => { setModalResolucao(false); setNotaResolucao(''); }}><Text style={{color: theme.textMuted, fontWeight: 'bold'}}>Cancelar</Text></TouchableOpacity>
                 <TouchableOpacity style={[styles.btnSave, {backgroundColor: theme.success}]} onPress={concluirChamado}><Text style={{color:'#fff', fontWeight:'bold'}}>Assinar Conclusão</Text></TouchableOpacity>
               </View>
            </View>
         </View>
      </Modal>

      {/* MODAL PARA ALTERAR URGÊNCIA (ADMIN) */}
      <Modal visible={modalUrgenciaVisible} transparent animationType="fade">
         <View style={styles.modalContainer}>
            <View style={[styles.modalContent, { backgroundColor: theme.card, borderColor: theme.border }]}>
               <Text style={[styles.modalTitle, { color: theme.textMain, marginBottom: 15 }]}>Definir Urgência</Text>
               
               {['Baixa', 'Média', 'Alta', 'Crítica'].map(nivel => (
                 <TouchableOpacity 
                   key={nivel}
                   style={{ padding: 15, borderBottomWidth: 1, borderColor: theme.border }}
                   onPress={() => atualizarUrgencia(nivel)}
                 >
                   <Text style={{ fontSize: 16, fontWeight: 'bold', color: nivel === 'Crítica' || nivel === 'Alta' ? theme.danger : theme.warning, textAlign: 'center' }}>
                     {nivel}
                   </Text>
                 </TouchableOpacity>
               ))}

               <TouchableOpacity style={{ marginTop: 15, padding: 15 }} onPress={() => setModalUrgenciaVisible(false)}>
                 <Text style={{ textAlign: 'center', color: theme.textMuted, fontWeight: 'bold' }}>Cancelar</Text>
               </TouchableOpacity>
            </View>
         </View>
      </Modal>

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 15 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  btnNova: { flexDirection: 'row', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, alignItems:'center' },
  btnNovaText: { color: '#fff', fontWeight: 'bold', marginLeft: 6, fontSize: 13 },
  
  btnImprimir: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(59, 130, 246, 0.1)', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: '#3b82f6', marginRight: 8 },
  chipFiltro: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: '#e2e8f0', marginRight: 8 },
  
  card: { padding: 18, borderRadius: 12, marginBottom: 15, elevation: 2 },
  cardTitle: { fontSize: 16, fontWeight: '900' },
  badge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  btnConcluir: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 10, padding: 12, borderWidth: 1, borderRadius: 8 },
  
  modalContainer: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', padding: 15 },
  modalContent: { padding: 20, borderRadius: 16, borderWidth: 1 },
  modalTitle: { fontSize: 18, fontWeight: '900' },
  
  label: { fontSize: 12, fontWeight: 'bold', color: '#64748b', marginBottom: 6 },
  input: { borderWidth: 1, borderRadius: 8, padding: 12, marginBottom: 15, fontSize: 14 },
  chip: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 20, borderWidth: 1, borderColor: '#e2e8f0', marginRight: 8 },
  
  modalActions: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 10, gap: 10, borderTopWidth: 1, borderColor: 'rgba(0,0,0,0.1)', paddingTop: 15 },
  btnCancel: { padding: 12 },
  btnSave: { paddingVertical: 12, paddingHorizontal: 16, borderRadius: 8, flexDirection: 'row', alignItems: 'center' }
});