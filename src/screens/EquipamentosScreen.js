import {
  AlertTriangle,
  ClipboardCheck,
  Edit,
  PlusCircle,
  Save,
  ShieldCheck,
  Thermometer,
  Trash2,
  X
} from 'lucide-react-native';
import React, { useCallback, useContext, useEffect, useState } from 'react';
import {
  Alert,
  FlatList,
  Modal,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { api, getSocket } from '../api/api';
import { AppContext } from '../context/AppContext';

// Componente do Card isolado para melhor performance (React.memo previne renders desnecessários)
const EquipamentoCard = React.memo(({ item, onDelete, onEdit, theme }) => {
  const diasCalib = item.data_calibracao ? Math.floor((Date.now() - new Date(item.data_calibracao).getTime()) / (1000 * 60 * 60 * 24)) : 0;
  const calibCritica = diasCalib > 365;

  // Lógica de cores do status idêntica à Web
  const statusColor = item.em_degelo ? '#38bdf8' : (item.motor_ligado ? '#10b981' : '#ef4444');

  return (
    <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
      <View style={styles.cardInfo}>
        <View style={styles.badgeRow}>
          <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
          <Text style={[styles.badgeFilial, { backgroundColor: theme.bg, color: theme.primary }]}>{String(item.filial).toUpperCase()}</Text>
          <Text style={[styles.badgeSetor, { backgroundColor: theme.border, color: theme.textMuted }]}>{item.setor}</Text>
        </View>
        <Text style={[styles.equipNome, { color: theme.textMain }]}>{item.nome}</Text>
        <Text style={[styles.subText, { color: theme.textMuted }]}>{item.tipo}</Text>
        <View style={styles.divider} />
        <View style={styles.metrologiaGrid}>
          <View style={styles.metrologiaItem}>
             <View style={styles.labelRow}>
                {calibCritica ? <AlertTriangle size={14} color="#ef4444" /> : <ClipboardCheck size={14} color="#10b981" />}
                <Text style={[styles.metrologiaLabel, { color: calibCritica ? '#ef4444' : '#10b981' }]}> CALIBRAÇÃO</Text>
             </View>
             <Text style={[styles.metrologiaValue, { color: theme.textMain }]}>Há {diasCalib} dias</Text>
          </View>
          <View style={styles.metrologiaItem}>
             <View style={styles.labelRow}>
                <Thermometer size={14} color={theme.textMuted} />
                <Text style={[styles.metrologiaLabel, { color: theme.textMuted }]}> LIMITE SLA</Text>
             </View>
             <Text style={[styles.metrologiaValue, { color: theme.textMain }]}>{item.temp_min}°C a {item.temp_max}°C</Text>
          </View>
        </View>
      </View>
      <View style={styles.actionColumn}>
        <TouchableOpacity style={styles.btnAction} onPress={() => onEdit(item)}>
          <Edit color={theme.primary} size={20} />
        </TouchableOpacity>
        <TouchableOpacity style={[styles.btnAction, { marginTop: 10 }]} onPress={() => onDelete(item.id, item.nome)}>
          <Trash2 color="#ef4444" size={20} />
        </TouchableOpacity>
      </View>
    </View>
  );
});

export default function EquipamentosScreen() {
  const { filialAtiva, theme, userRole, userFilial } = useContext(AppContext);
  const [equipamentos, setEquipamentos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editMode, setEditMode] = useState(false);

  const formInicial = {
    nome: '', filial: userRole === 'LOJA' ? userFilial : '', setor: '', tipo: '', 
    temp_min: '', temp_max: '', umidade_min: '', umidade_max: '', 
    intervalo_degelo: '6', duracao_degelo: '30', data_calibracao: new Date().toISOString().split('T')[0]
  };

  const [form, setForm] = useState(formInicial);
  const setores = ['Farmácia / Vacinas', 'Açougue', 'Padaria', 'Frios', 'FLV'];
  const tipos = ['Câmara Frigorífica', 'Ilha de Congelados', 'Balcão Refrigerado Aberto'];

  const carregarDados = useCallback(async () => {
    try {
      const res = await api.get('/equipamentos');
      setEquipamentos(res.data);
    } catch (error) { 
      console.log('Erro ao carregar', error); 
    } finally { 
      setLoading(false); 
      setRefreshing(false); 
    }
  }, []);

  useEffect(() => { 
    carregarDados(); 
    
    // Escuta eventos globais para atualizar listagem em caso de edição/exclusão em outro dispositivo
    const socket = getSocket();
    socket.on('atualizacao_dados', () => carregarDados());

    return () => socket.disconnect();
  }, [carregarDados]);

  const lojasExistentes = [...new Set(equipamentos.map(eq => eq.filial))];

  const aplicarNormaANVISA = () => {
    if (!form.setor || !form.tipo) return Alert.alert('Atenção', 'Selecione Setor e Tipo primeiro.');
    let tMin = '', tMax = '', uMin = '', uMax = '';
    if (form.setor === 'Farmácia / Vacinas') {
      if (form.tipo.includes('Congelados')) { tMin = '-25'; tMax = '-15'; uMin = '35'; uMax = '60'; } 
      else { tMin = '2'; tMax = '8'; uMin = '35'; uMax = '65'; }
    } else {
      if (form.tipo.includes('Congelados')) { tMin = '-24'; tMax = '-18'; uMin = '60'; uMax = '80'; } 
      else if (form.setor === 'Açougue') { tMin = '0'; tMax = '4'; uMin = '85'; uMax = '95'; } 
      else if (form.setor === 'FLV') { tMin = '8'; tMax = '12'; uMin = '85'; uMax = '95'; } 
      else { tMin = '0'; tMax = '8'; uMin = '60'; uMax = '85'; }
    }
    setForm(prev => ({ ...prev, temp_min: tMin, temp_max: tMax, umidade_min: uMin, umidade_max: uMax }));
  };

  const salvarEquipamento = async () => {
    if (!form.nome || !form.filial || !form.setor || !form.tipo) return Alert.alert('Erro', 'Preencha os campos obrigatórios.');
    try {
      if (editMode) { 
        await api.put(`/equipamentos/${form.id}/edit`, form); 
      } else { 
        await api.post('/equipamentos', form); 
      }
      setModalVisible(false);
      carregarDados();
    } catch (error) { 
      Alert.alert('Erro', 'Falha na operação.'); 
    }
  };

  // 1. Otimização: Isolar funções de ação com useCallback para manter a estabilidade do React.memo
  const confirmarExclusao = useCallback((id, nome) => {
    Alert.alert('Remover Máquina', `Remover "${nome}" permanentemente?`, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Remover', style: 'destructive', onPress: () => api.delete(`/equipamentos/${id}`).then(carregarDados) }
    ]);
  }, [carregarDados]);

  const handleEdit = useCallback((i) => {
    setForm({...i, data_calibracao: i.data_calibracao.split('T')[0]}); 
    setEditMode(true); 
    setModalVisible(true);
  }, []);

  // 2. Otimização: Isolar o renderItem
  const renderItem = useCallback(({ item }) => (
    <EquipamentoCard 
      item={item} 
      onDelete={confirmarExclusao} 
      onEdit={handleEdit} 
      theme={theme} 
    />
  ), [theme, confirmarExclusao, handleEdit]);

  const filtrados = filialAtiva === 'Todas' ? equipamentos : equipamentos.filter(eq => eq.filial === filialAtiva);

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      <View style={styles.headerArea}>
        <Text style={[styles.listTitle, { color: theme.textMain }]}>Metrologia & Instalações ({filtrados.length})</Text>
        <TouchableOpacity style={[styles.btnNovo, { backgroundColor: theme.primary }]} onPress={() => { setForm(formInicial); setEditMode(false); setModalVisible(true); }}>
          <PlusCircle color="#fff" size={20} /><Text style={styles.btnText}> Novo</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={filtrados}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        contentContainerStyle={{ padding: 16 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); carregarDados(); }} colors={[theme.primary]} />}
        
        // 🚀 PROPS DE OTIMIZAÇÃO DE PERFORMANCE 
        initialNumToRender={8}           // Renderiza apenas 8 itens na primeira vez
        maxToRenderPerBatch={8}          // Renderiza de 8 em 8 enquanto faz scroll
        windowSize={5}                   // Reduz o número de páginas renderizadas off-screen (Padrão é 21)
        removeClippedSubviews={true}     // Remove da memória do telemóvel os cards que não estão visíveis
        updateCellsBatchingPeriod={50}   // Dá um tempo de respiro para a thread UI
      />

      <Modal visible={modalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.card }]}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.modalHeader}>
                <Text style={[styles.formTitle, { color: theme.textMain }]}>{editMode ? 'Editar Ativo' : 'Novo Sensor IoT'}</Text>
                <TouchableOpacity onPress={aplicarNormaANVISA} style={styles.btnNorma}><ShieldCheck size={22} color={theme.info} /></TouchableOpacity>
              </View>

              <Text style={[styles.label, { color: theme.textMain }]}>NOME E LOCALIZAÇÃO</Text>
              <TextInput style={[styles.input, { borderColor: theme.border, color: theme.textMain }]} placeholder="Identificador" placeholderTextColor={theme.textMuted} value={form.nome} onChangeText={(t) => setForm({...form, nome: t})} />
              
              <Text style={[styles.label, { color: theme.textMain }]}>SELECIONAR LOJA (DINÂMICO)</Text>
              <View style={styles.chipRow}>
                {lojasExistentes.map(l => (
                  <TouchableOpacity key={l} onPress={() => setForm({...form, filial: l})} style={[styles.chip, { borderColor: theme.border }, form.filial === l && { backgroundColor: theme.primary }]}>
                    <Text style={{ color: form.filial === l ? '#fff' : theme.textMuted, fontSize: 10 }}>{l}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={[styles.label, { color: theme.textMain }]}>SETOR E TIPO</Text>
              <View style={styles.chipRow}>{setores.map(s => <TouchableOpacity key={s} onPress={() => setForm({...form, setor: s})} style={[styles.chip, { borderColor: theme.border }, form.setor === s && { backgroundColor: theme.primary }]}><Text style={{ color: form.setor === s ? '#fff' : theme.textMuted, fontSize: 10 }}>{s}</Text></TouchableOpacity>)}</View>
              <View style={styles.chipRow}>{tipos.map(t => <TouchableOpacity key={t} onPress={() => setForm({...form, tipo: t})} style={[styles.chip, { borderColor: theme.border }, form.tipo === t && { backgroundColor: theme.info }]}><Text style={{ color: form.tipo === t ? '#fff' : theme.textMuted, fontSize: 10 }}>{t}</Text></TouchableOpacity>)}</View>

              <Text style={[styles.label, { color: theme.textMain }]}>METROLOGIA / SLA / DEGELO</Text>
              <TextInput style={[styles.input, { borderColor: theme.border, color: theme.textMain }]} placeholder="Data Calibração (AAAA-MM-DD)" placeholderTextColor={theme.textMuted} value={form.data_calibracao} onChangeText={(t) => setForm({...form, data_calibracao: t})} />
              <View style={styles.row}>
                <TextInput style={[styles.input, styles.half, { borderColor: theme.border, color: theme.textMain }]} placeholder="Mín °C" placeholderTextColor={theme.textMuted} value={String(form.temp_min)} onChangeText={(t) => setForm({...form, temp_min: t})} keyboardType="numeric" />
                <TextInput style={[styles.input, styles.half, { borderColor: theme.border, color: theme.textMain }]} placeholder="Máx °C" placeholderTextColor={theme.textMuted} value={String(form.temp_max)} onChangeText={(t) => setForm({...form, temp_max: t})} keyboardType="numeric" />
              </View>
              <View style={styles.row}>
                <TextInput style={[styles.input, styles.half, { borderColor: theme.border, color: theme.textMain }]} placeholder="UR% Mín" placeholderTextColor={theme.textMuted} value={String(form.umidade_min || '')} onChangeText={(t) => setForm({...form, umidade_min: t})} keyboardType="numeric" />
                <TextInput style={[styles.input, styles.half, { borderColor: theme.border, color: theme.textMain }]} placeholder="UR% Máx" placeholderTextColor={theme.textMuted} value={String(form.umidade_max || '')} onChangeText={(t) => setForm({...form, umidade_max: t})} keyboardType="numeric" />
              </View>
              <View style={styles.row}>
                <TextInput style={[styles.input, styles.half, { borderColor: theme.border, color: theme.textMain }]} placeholder="Degelo Int. (h)" placeholderTextColor={theme.textMuted} value={String(form.intervalo_degelo)} onChangeText={(t) => setForm({...form, intervalo_degelo: t})} keyboardType="numeric" />
                <TextInput style={[styles.input, styles.half, { borderColor: theme.border, color: theme.textMain }]} placeholder="Degelo Dur. (m)" placeholderTextColor={theme.textMuted} value={String(form.duracao_degelo)} onChangeText={(t) => setForm({...form, duracao_degelo: t})} keyboardType="numeric" />
              </View>
            </ScrollView>

            <View style={styles.modalActions}>
              <TouchableOpacity style={[styles.btnCancel, { borderColor: theme.border }]} onPress={() => setModalVisible(false)}><X color={theme.textMuted} size={24} /></TouchableOpacity>
              <TouchableOpacity style={[styles.btnSave, { backgroundColor: theme.primary }]} onPress={salvarEquipamento}><Save color="#fff" size={24} /></TouchableOpacity>
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
  card: { padding: 16, borderRadius: 16, marginBottom: 12, flexDirection: 'row', borderWidth: 1, elevation: 2 },
  cardInfo: { flex: 1 },
  badgeRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  statusDot: { width: 8, height: 8, borderRadius: 4, marginRight: 8 },
  badgeFilial: { fontSize: 9, fontWeight: '900', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, marginRight: 6 },
  badgeSetor: { fontSize: 9, fontWeight: '800', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  equipNome: { fontSize: 17, fontWeight: '800' },
  subText: { fontSize: 12, marginBottom: 5 },
  divider: { height: 1, backgroundColor: 'rgba(0,0,0,0.05)', marginVertical: 10 },
  metrologiaGrid: { flexDirection: 'row', justifyContent: 'space-between' },
  metrologiaItem: { flex: 1 },
  labelRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  metrologiaLabel: { fontSize: 9, fontWeight: '900' },
  metrologiaValue: { fontSize: 14, fontWeight: '700' },
  actionColumn: { justifyContent: 'center', paddingLeft: 10 },
  btnAction: { padding: 10, backgroundColor: 'rgba(0,0,0,0.03)', borderRadius: 10 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { padding: 25, borderTopLeftRadius: 20, borderTopRightRadius: 20, maxHeight: '90%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20, alignItems: 'center' },
  formTitle: { fontSize: 20, fontWeight: 'bold' },
  btnNorma: { padding: 8, backgroundColor: 'rgba(56, 189, 248, 0.1)', borderRadius: 10 },
  input: { borderWidth: 1, borderRadius: 10, padding: 12, marginBottom: 12 },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  half: { width: '48%' },
  label: { fontSize: 10, fontWeight: 'bold', marginBottom: 10, marginTop: 10, letterSpacing: 1 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 10, gap: 5 },
  chip: { padding: 8, borderRadius: 15, borderWidth: 1 },
  modalActions: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 20 },
  btnSave: { padding: 15, borderRadius: 12, flex: 1, marginLeft: 10, alignItems: 'center' },
  btnCancel: { padding: 15, borderRadius: 12, borderWidth: 1 }
});