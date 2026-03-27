import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { useContext, useEffect, useMemo, useState } from 'react';
import { Alert, FlatList, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import api from '../api/api';
import { AppContext } from '../context/AppContext';

export default function ChamadosScreen() {
  const { chamados, userRole, nomeLogado, filialAtiva, equipamentos, tecnicosDb, carregarDadosBasicos } = useContext(AppContext);
  
  const [modalVisible, setModalVisible] = useState(false);
  const [modalResolve, setModalResolve] = useState(false);
  const [chamadoSelecionado, setChamadoSelecionado] = useState(null);
  
  const [equipamentoId, setEquipamentoId] = useState('');
  const [descricao, setDescricao] = useState('');
  const [tecnicoResp, setTecnicoResp] = useState('');
  const [resolucaoTexto, setResolucaoTexto] = useState('');

  const [filtroTempo, setFiltroTempo] = useState('todos');
  const [filtroTecnico, setFiltroTecnico] = useState('todos');

  useEffect(() => {
    carregarDadosBasicos();
  }, []);

  const trintaDiasAtras = new Date();
  trintaDiasAtras.setDate(trintaDiasAtras.getDate() - 30);

  const chamadosAtivos = useMemo(() => {
    return chamados.filter(c => c.status !== 'Concluído' || new Date(c.data_conclusao) >= trintaDiasAtras);
  }, [chamados, trintaDiasAtras]);

  const chamadosParaPDF = useMemo(() => {
    let list = chamadosAtivos.filter(c => c.status === 'Concluído');
    
    if (userRole === 'MANUTENCAO') {
       list = list.filter(c => c.tecnico_responsavel === nomeLogado);
    } else {
       if (userRole === 'ADMIN' && filialAtiva !== 'Todas') {
          list = list.filter(c => c.filial === filialAtiva);
       }
       if (filtroTecnico !== 'todos') {
          list = list.filter(c => c.tecnico_responsavel === filtroTecnico);
       }
    }

    const hoje = new Date();
    if (filtroTempo === 'dia') list = list.filter(c => new Date(c.data_conclusao).toDateString() === hoje.toDateString());
    else if (filtroTempo === 'semana') {
       const sete = new Date(hoje.getTime() - 7 * 24 * 60 * 60 * 1000);
       list = list.filter(c => new Date(c.data_conclusao) >= sete);
    } else if (filtroTempo === 'mes') {
       const trinta = new Date(hoje.getTime() - 30 * 24 * 60 * 60 * 1000);
       list = list.filter(c => new Date(c.data_conclusao) >= trinta);
    }
    return list;
  }, [chamadosAtivos, userRole, nomeLogado, filialAtiva, filtroTempo, filtroTecnico]);

  const gerarLoteOS = async () => {
    if (chamadosParaPDF.length === 0) {
      Alert.alert("Aviso", "Não há OS concluídas para os filtros selecionados.");
      return;
    }

    let html = `
      <html>
      <head>
        <style>
          body { font-family: 'Helvetica', sans-serif; padding: 20px; color: #333; }
          .os-container { border-bottom: 2px dashed #94a3b8; padding-bottom: 30px; margin-bottom: 30px; page-break-inside: avoid; }
          h3 { color: #059669; text-align: center; border-bottom: 1px solid #059669; padding-bottom: 5px; margin-bottom: 15px;}
          .row { display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 14px; }
          .label { font-weight: bold; color: #475569; }
          .box { background: #f8fafc; padding: 10px; border-radius: 5px; border: 1px solid #e2e8f0; margin-top: 5px; font-size: 14px; }
          .signatures { display: flex; justify-content: space-between; margin-top: 40px; }
          .sig-box { width: 45%; text-align: center; border-top: 1px solid #000; padding-top: 5px; font-size: 12px; }
          .header-main { text-align: center; font-size: 22px; font-weight: bold; color: #0f172a; margin-bottom: 20px; }
        </style>
      </head>
      <body>
        <div class="header-main">LIVRO DE ORDENS DE SERVIÇO (OS) - CONTÍNUO</div>
    `;

    chamadosParaPDF.forEach(c => {
      html += `
        <div class="os-container">
          <h3>OS #${c.id} - ${c.filial}</h3>
          <div class="row">
            <div><span class="label">Equipamento:</span> ${c.equipamento_nome}</div>
            <div><span class="label">Abertura:</span> ${new Date(c.data_abertura).toLocaleDateString()}</div>
          </div>
          <div class="row">
            <div><span class="label">Solicitante:</span> ${c.solicitante_nome}</div>
            <div><span class="label">Conclusão:</span> ${new Date(c.data_conclusao).toLocaleDateString()}</div>
          </div>
          <div class="row">
            <div><span class="label">Endereço Loja:</span> ${c.loja_endereco || 'N/A'}</div>
            <div><span class="label">Técnico:</span> ${c.tecnico_responsavel || 'N/A'}</div>
          </div>
          
          <div style="margin-bottom: 10px; margin-top: 15px;">
            <span class="label">Problema:</span>
            <div class="box">${c.descricao}</div>
          </div>
          <div style="margin-bottom: 10px;">
            <span class="label">Relatório Técnico:</span>
            <div class="box">${c.nota_resolucao}</div>
          </div>
          <div class="signatures">
            <div class="sig-box">Assinatura (${c.tecnico_responsavel || 'Técnico'})</div>
            <div class="sig-box">Assinatura da Gerência</div>
          </div>
        </div>
      `;
    });

    html += `</body></html>`;

    try {
      const { uri } = await Print.printToFileAsync({ html });
      await Sharing.shareAsync(uri);
    } catch (e) {
      Alert.alert("Erro", "Falha ao gerar o PDF.");
    }
  };

  const abrirChamado = async () => {
    if (!equipamentoId || !descricao) return Alert.alert('Erro', 'Preencha equipamento e descrição.');
    try {
      await api.post('/chamados', { 
        equipamento_id: equipamentoId, descricao, 
        solicitante_nome: nomeLogado || 'Equipa',
        tecnico_responsavel: tecnicoResp 
      });
      setModalVisible(false);
      setEquipamentoId(''); setDescricao(''); setTecnicoResp('');
      carregarDadosBasicos();
    } catch (e) { Alert.alert('Erro', 'Não foi possível abrir o chamado.'); }
  };

  const resolverChamado = async () => {
    if (!resolucaoTexto) return Alert.alert('Aviso', 'Escreva a resolução.');
    try {
      await api.put(`/chamados/${chamadoSelecionado.id}/status`, { status: 'Concluído', nota_resolucao: resolucaoTexto });
      setModalResolve(false); setResolucaoTexto(''); setChamadoSelecionado(null);
      carregarDadosBasicos();
    } catch (e) { Alert.alert('Erro', 'Falha ao concluir.'); }
  };

  return (
    <View style={styles.container}>
      
      {/* 🔴 FILTROS DE TEMPO E TÉCNICO */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filtersRow}>
        <TouchableOpacity style={[styles.filterBtn, filtroTempo === 'todos' && styles.filterActive]} onPress={() => setFiltroTempo('todos')}><Text style={[styles.fText, filtroTempo === 'todos' && styles.fTextA]}>Tudo</Text></TouchableOpacity>
        <TouchableOpacity style={[styles.filterBtn, filtroTempo === 'dia' && styles.filterActive]} onPress={() => setFiltroTempo('dia')}><Text style={[styles.fText, filtroTempo === 'dia' && styles.fTextA]}>Hoje</Text></TouchableOpacity>
        <TouchableOpacity style={[styles.filterBtn, filtroTempo === 'semana' && styles.filterActive]} onPress={() => setFiltroTempo('semana')}><Text style={[styles.fText, filtroTempo === 'semana' && styles.fTextA]}>7 Dias</Text></TouchableOpacity>
        <TouchableOpacity style={[styles.filterBtn, filtroTempo === 'mes' && styles.filterActive]} onPress={() => setFiltroTempo('mes')}><Text style={[styles.fText, filtroTempo === 'mes' && styles.fTextA]}>30 Dias</Text></TouchableOpacity>
      </ScrollView>

      {userRole !== 'MANUTENCAO' && (
        <View style={{ marginBottom: 15 }}>
          <Text style={{ fontSize: 12, fontWeight: 'bold', color: '#64748b', marginBottom: 5 }}>Filtrar OS por Técnico:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <TouchableOpacity style={[styles.filterBtnTec, filtroTecnico === 'todos' && styles.filterActiveTec]} onPress={() => setFiltroTecnico('todos')}><Text style={[styles.fTextTec, filtroTecnico === 'todos' && styles.fTextA]}>Todos os Técnicos</Text></TouchableOpacity>
            {tecnicosDb.map(tec => (
              <TouchableOpacity key={tec.id} style={[styles.filterBtnTec, filtroTecnico === tec.nome_tecnico && styles.filterActiveTec]} onPress={() => setFiltroTecnico(tec.nome_tecnico)}>
                <Text style={[styles.fTextTec, filtroTecnico === tec.nome_tecnico && styles.fTextA]}>{tec.nome_tecnico}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      <View style={styles.actionRow}>
        <TouchableOpacity style={styles.btnPdf} onPress={gerarLoteOS}>
          <MaterialCommunityIcons name="printer" size={20} color="#fff" />
          <Text style={styles.btnPdfText}>Imprimir OS ({chamadosParaPDF.length})</Text>
        </TouchableOpacity>
        
        {userRole === 'LOJA' && (
          <TouchableOpacity style={styles.btnNova} onPress={() => setModalVisible(true)}>
            <MaterialCommunityIcons name="plus" size={20} color="#fff" />
            <Text style={styles.btnNovaText}>Nova OS</Text>
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={chamadosAtivos}
        keyExtractor={i => i.id.toString()}
        renderItem={({ item }) => (
          <View style={[styles.card, { borderLeftColor: item.status === 'Concluído' ? '#10b981' : (item.urgencia === 'Crítica' ? '#ef4444' : '#f59e0b') }]}>
            <View style={styles.cardTop}>
              <Text style={styles.cardTitle}>{item.equipamento_nome}</Text>
              <Text style={[styles.statusBadge, { backgroundColor: item.status === 'Concluído' ? '#10b981' : '#f59e0b' }]}>{item.status}</Text>
            </View>
            <Text style={styles.desc}>"{item.descricao}"</Text>
            <Text style={styles.info}>Solicitante: {item.solicitante_nome}</Text>
            <Text style={[styles.info, { color: '#0284c7', fontWeight: 'bold' }]}>Técnico: {item.tecnico_responsavel || 'Manutenção Geral'}</Text>
            
            {item.status === 'Concluído' && (
               <View style={styles.resBox}>
                 <Text style={styles.resText}>Resolução: {item.nota_resolucao}</Text>
                 <Text style={{fontSize: 10, color: '#059669', marginTop: 4}}>Conc: {new Date(item.data_conclusao).toLocaleDateString()}</Text>
               </View>
            )}

            {(userRole === 'ADMIN' || userRole === 'MANUTENCAO') && item.status !== 'Concluído' && (
              <TouchableOpacity style={styles.btnResolve} onPress={() => { setChamadoSelecionado(item); setModalResolve(true); }}>
                <Text style={styles.btnResolveText}>Marcar como Resolvido</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      />

      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Nova Ordem de Serviço</Text>
            
            <Text style={styles.label}>Técnico a Acionar:</Text>
            <ScrollView style={{maxHeight: 90, marginBottom: 10}}>
               <TouchableOpacity onPress={()=>setTecnicoResp('Qualquer')} style={[styles.selBox, tecnicoResp === 'Qualquer' && styles.selActive]}><Text>Qualquer Técnico Disponível</Text></TouchableOpacity>
              {tecnicosDb.map(t => (
                 <TouchableOpacity key={t.id} onPress={()=>setTecnicoResp(t.nome_tecnico)} style={[styles.selBox, tecnicoResp === t.nome_tecnico && styles.selActive]}><Text>{t.nome_tecnico}</Text></TouchableOpacity>
              ))}
            </ScrollView>

            <Text style={styles.label}>Equipamento:</Text>
            <ScrollView style={{maxHeight: 100, marginBottom: 10}}>
              {equipamentos.map(e => (
                 <TouchableOpacity key={e.id} onPress={()=>setEquipamentoId(e.id)} style={[styles.selBox, equipamentoId === e.id && styles.selActive]}><Text>{e.nome}</Text></TouchableOpacity>
              ))}
            </ScrollView>

            <Text style={styles.label}>Descrição:</Text>
            <TextInput style={styles.inputArea} multiline value={descricao} onChangeText={setDescricao} placeholder="Qual o problema?" />
            
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.btnCancel} onPress={() => setModalVisible(false)}><Text style={{color:'#64748b'}}>Cancelar</Text></TouchableOpacity>
              <TouchableOpacity style={styles.btnSave} onPress={abrirChamado}><Text style={{color:'#fff', fontWeight:'bold'}}>Abrir OS</Text></TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={modalResolve} animationType="fade" transparent>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Concluir OS</Text>
            <Text style={styles.label}>Relatório do Serviço Executado:</Text>
            <TextInput style={styles.inputArea} multiline value={resolucaoTexto} onChangeText={setResolucaoTexto} placeholder="Descreva a solução..." />
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.btnCancel} onPress={() => setModalResolve(false)}><Text style={{color:'#64748b'}}>Cancelar</Text></TouchableOpacity>
              <TouchableOpacity style={styles.btnSave} onPress={resolverChamado}><Text style={{color:'#fff', fontWeight:'bold'}}>Concluir OS</Text></TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f1f5f9', padding: 15 },
  filtersRow: { flexDirection: 'row', marginBottom: 10, maxHeight: 40 },
  filterBtn: { backgroundColor: '#fff', paddingHorizontal: 15, paddingVertical: 8, borderRadius: 20, marginRight: 10, borderWidth: 1, borderColor: '#cbd5e1', justifyContent: 'center' },
  filterActive: { backgroundColor: '#0284c7', borderColor: '#0284c7' },
  filterBtnTec: { backgroundColor: '#fff', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, marginRight: 8, borderWidth: 1, borderColor: '#e2e8f0', justifyContent: 'center' },
  filterActiveTec: { backgroundColor: '#38bdf8', borderColor: '#38bdf8' },
  fText: { color: '#475569', fontSize: 13, fontWeight: 'bold' },
  fTextTec: { color: '#475569', fontSize: 12 },
  fTextA: { color: '#fff' },
  actionRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 },
  btnPdf: { flex: 1, backgroundColor: '#3b82f6', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 12, borderRadius: 8, marginRight: 5 },
  btnPdfText: { color: '#fff', fontWeight: 'bold', marginLeft: 8 },
  btnNova: { flex: 1, backgroundColor: '#10b981', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 12, borderRadius: 8, marginLeft: 5 },
  btnNovaText: { color: '#fff', fontWeight: 'bold', marginLeft: 8 },
  card: { backgroundColor: '#fff', padding: 15, borderRadius: 10, marginBottom: 15, borderLeftWidth: 6, elevation: 2 },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardTitle: { fontSize: 16, fontWeight: 'bold', color: '#1e293b' },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, color: '#fff', fontSize: 12, fontWeight: 'bold', overflow: 'hidden' },
  desc: { fontSize: 14, fontStyle: 'italic', marginVertical: 10, color: '#475569' },
  info: { fontSize: 13, color: '#64748b', marginBottom: 3 },
  resBox: { backgroundColor: '#f0fdf4', padding: 10, borderRadius: 8, marginTop: 10, borderWidth: 1, borderColor: '#bbf7d0' },
  resText: { fontSize: 13, color: '#065f46' },
  btnResolve: { marginTop: 15, padding: 10, borderWidth: 1, borderColor: '#10b981', borderRadius: 8, alignItems: 'center' },
  btnResolveText: { color: '#10b981', fontWeight: 'bold' },
  modalContainer: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
  modalContent: { backgroundColor: '#fff', padding: 20, borderRadius: 15 },
  modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 15, color: '#0f172a' },
  label: { fontSize: 14, fontWeight: 'bold', color: '#475569', marginBottom: 5 },
  selBox: { padding: 10, backgroundColor: '#f1f5f9', marginBottom: 5, borderRadius: 5 },
  selActive: { backgroundColor: '#bae6fd', borderWidth: 1, borderColor: '#0284c7' },
  inputArea: { borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 8, padding: 10, height: 80, textAlignVertical: 'top', marginBottom: 15 },
  modalActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 10 },
  btnCancel: { padding: 10, borderRadius: 8, backgroundColor: '#e2e8f0' },
  btnSave: { padding: 10, borderRadius: 8, backgroundColor: '#0284c7' }
});