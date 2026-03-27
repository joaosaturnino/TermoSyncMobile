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

const EquipamentoCard = React.memo(({ item, onDelete, onEdit, theme }) => {
  const diasCalib = item.data_calibracao ? Math.floor((Date.now() - new Date(item.data_calibracao).getTime()) / (1000 * 60 * 60 * 24)) : 0;
  const calibCritica = diasCalib > 365;

  const statusColor = item.em_degelo ? '#38bdf8' : (item.motor_ligado ? '#10b981' : '#ef4444');

  return (
    <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
      <View style={styles.cardInfo}>
        <View style={styles.badgeRow}>
          <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
          <Text style={[styles.badgeFilial, { backgroundColor: theme.bg, color: theme.primary }]}>{String(item.filial || '').toUpperCase()}</Text>
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

  // 🔴 FALLBACKS ADICIONADOS PARA EVITAR O ERRO 'map of undefined'
  const [filiaisDb, setFiliaisDb] = useState([]);
  const [setoresDb, setSetoresDb] = useState([]);

  const formInicial = {
    nome: '', filial: userRole === 'LOJA' ? userFilial : '', setor: '', tipo: '', 
    temp_min: '', temp_max: '', umidade_min: '', umidade_max: '', 
    intervalo_degelo: '6', duracao_degelo: '30', data_calibracao: new Date().toISOString().split('T')[0]
  };

  const [form, setForm] = useState(formInicial);
  
  // Listas fixas caso a API falhe
  const setores = ['Farmácia', 'Açougue', 'Padaria', 'Frios', 'FLV', 'Congelados', 'Rotisseria', 'Geral'];
  const tipos = ['Câmara Frigorífica', 'Ilha de Congelados', 'Balcão Refrigerado Aberto', 'Balcão Refrigerado com Porta', 'Arca Horizontal'];

  const carregarDados = useCallback(async () => {
    try {
      const [resEq, resFiliais, resSetores] = await Promise.all([
        api.get('/api/equipamentos'),
        api.get('/api/auxiliares/filiais').catch(() => ({ data: [] })),
        api.get('/api/auxiliares/setores').catch(() => ({ data: [] }))
      ]);
      
      // 🔴 GARANTIR QUE NUNCA É UNDEFINED MESMO SE A API DEVOLVER NULO
      setEquipamentos(resEq.data || []);
      setFiliaisDb((resFiliais.data || []).filter(f => f !== 'Todas'));
      setSetoresDb(resSetores.data || []);
      
    } catch (error) { 
      console.log('Erro ao carregar equipamentos', error); 
    } finally { 
      setLoading(false); 
      setRefreshing(false); 
    }
  }, []);

  useEffect(() => { 
    carregarDados(); 
    const socket = getSocket();
    socket.on('atualizacao_dados', () => carregarDados());
    return () => socket.disconnect();
  }, [carregarDados]);

  const aplicarNormaANVISA = () => {
    if (!form.setor || !form.tipo) return Alert.alert('Atenção', 'Selecione Setor e Tipo primeiro.');
    let tMin = '', tMax = '', uMin = '', uMax = '';
    if (form.setor === 'Farmácia' || form.setor === 'Farmácia / Vacinas') {
      if (form.tipo.includes('Congelados')) { tMin = '-25'; tMax = '-15'; uMin = '35'; uMax = '60'; } 
      else { tMin = '2'; tMax = '8'; uMin = '35'; uMax = '65'; }
    } else {
      if (form.tipo.includes('Congelados') || form.tipo.includes('Arca')) { tMin = '-24'; tMax = '-18'; uMin = '60'; uMax = '80'; } 
      else if (form.setor === 'Açougue') { tMin = '0'; tMax = '4'; uMin = '85'; uMax = '95'; } 
      else if (form.setor === 'FLV') { tMin = '8'; tMax = '12'; uMin = '85'; uMax = '95'; } 
      else { tMin = '0'; tMax = '8'; uMin = '60'; uMax = '85'; }
    }
    setForm(prev => ({ ...prev, temp_min: tMin, temp_max: tMax, umidade_min: uMin, umidade_max: uMax }));
  };

  const salvarEquipamento = async () => {
    if (!form.nome || !form.filial || !form.setor || !form.tipo) return Alert.alert('Erro', 'Preencha os campos obrigatórios (Nome, Filial, Setor e Tipo).');
    try {
      if (editMode) { 
        await api.put(`/api/equipamentos/${form.id}/edit`, form); 
      } else { 
        await api.post('/api/equipamentos', form); 
      }
      setModalVisible(false);
      carregarDados();
    } catch (error) { 
      Alert.alert('Erro', 'Falha na operação de gravação.'); 
    }
  };

  const confirmarExclusao = useCallback((id, nome) => {
    Alert.alert('Remover Máquina', `Remover "${nome}" permanentemente?`, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Remover', style: 'destructive', onPress: () => api.delete(`/api/equipamentos/${id}`).then(carregarDados) }
    ]);
  }, [carregarDados]);

  const handleEdit = useCallback((i) => {
    setForm({...i, data_calibracao: i.data_calibracao ? i.data_calibracao.split('T')[0] : ''}); 
    setEditMode(true); 
    setModalVisible(true);
  }, []);

  const renderItem = useCallback(({ item }) => (
    <EquipamentoCard item={item} onDelete={confirmarExclusao} onEdit={handleEdit} theme={theme} />
  ), [theme, confirmarExclusao, handleEdit]);

  // 🔴 GARANTIR QUE A VARIÁVEL EQUIPAMENTOS É UM ARRAY ANTES DE FILTRAR
  const equipamentosSeguros = Array.isArray(equipamentos) ? equipamentos : [];
  const filtrados = filialAtiva === 'Todas' ? equipamentosSeguros : equipamentosSeguros.filter(eq => eq.filial === filialAtiva);

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
        keyExtractor={(item) => String(item.id)}
        renderItem={renderItem}
        contentContainerStyle={{ padding: 16 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); carregarDados(); }} colors={[theme.primary]} />}
        initialNumToRender={8}           
        maxToRenderPerBatch={8}          
        windowSize={5}                   
        removeClippedSubviews={true}     
        updateCellsBatchingPeriod={50}   
      />

      <Modal visible={modalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.card }]}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.modalHeader}>
                <Text style={[styles.formTitle, { color: theme.textMain }]}>{editMode ? 'Editar Ativo' : 'Novo Sensor IoT'}</Text>
                <TouchableOpacity onPress={aplicarNormaANVISA} style={styles.btnNorma}><ShieldCheck size={22} color={theme.info} /></TouchableOpacity>
              </View>

              <Text style={[styles.label, { color: theme.textMain }]}>IDENTIFICADOR</Text>
              <TextInput style={[styles.input, { borderColor: theme.border, color: theme.textMain }]} placeholder="Identificador" placeholderTextColor={theme.textMuted} value={form.nome} onChangeText={(t) => setForm({...form, nome: t})} />
              
              <Text style={[styles.label, { color: theme.textMain }]}>FILIAL / LOJA</Text>
              <TextInput style={[styles.input, { borderColor: theme.border, color: theme.textMain, backgroundColor: userRole === 'LOJA' ? 'rgba(0,0,0,0.05)' : 'transparent' }]} value={form.filial} onChangeText={(t) => setForm({...form, filial: t})} editable={userRole !== 'LOJA'} placeholder="Escreva a loja..." placeholderTextColor={theme.textMuted} />
              
              {/* 🔴 CHIPS DE FILIAL: Verifica se filiaisDb tem dados e se não é undefined */}
              {userRole !== 'LOJA' && Array.isArray(filiaisDb) && filiaisDb.length > 0 && (
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 15 }}>
                  {filiaisDb.map(f => (
                    <TouchableOpacity key={f} onPress={() => setForm({...form, filial: f})} style={[styles.chipSugestao, { borderColor: theme.border }, form.filial === f && { backgroundColor: theme.primary }]}>
                      <Text style={{ fontSize: 11, color: form.filial === f ? '#fff' : theme.textMuted, fontWeight: form.filial === f ? 'bold' : 'normal' }}>{f}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              )}

              <Text style={[styles.label, { color: theme.textMain }]}>SETOR COMERCIAL</Text>
              <TextInput style={[styles.input, { borderColor: theme.border, color: theme.textMain }]} value={form.setor} onChangeText={(t) => setForm({...form, setor: t})} placeholder="Escreva o setor..." placeholderTextColor={theme.textMuted} />
              
              {/* 🔴 CHIPS DE SETORES: Mistura os dados do SQL com a lista fixa para garantir opções */}
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 15 }}>
                {Array.from(new Set([...setores, ...(Array.isArray(setoresDb) ? setoresDb : [])])).map(s => (
                  <TouchableOpacity key={s} onPress={() => setForm({...form, setor: s})} style={[styles.chipSugestao, { borderColor: theme.border }, form.setor === s && { backgroundColor: theme.primary }]}>
                    <Text style={{ fontSize: 11, color: form.setor === s ? '#fff' : theme.textMuted, fontWeight: form.setor === s ? 'bold' : 'normal' }}>{s}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <Text style={[styles.label, { color: theme.textMain }]}>TIPO DE MÁQUINA</Text>
              <TextInput style={[styles.input, { borderColor: theme.border, color: theme.textMain }]} value={form.tipo} onChangeText={(t) => setForm({ ...form, tipo: t })} placeholder="Escreva o tipo..." placeholderTextColor={theme.textMuted} />
              
              {/* 🔴 CHIPS DE TIPO */}
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 15 }}>
                {tipos.map(t => (
                  <TouchableOpacity key={t} onPress={() => setForm({...form, tipo: t})} style={[styles.chipSugestao, { borderColor: theme.border }, form.tipo === t && { backgroundColor: theme.info }]}>
                    <Text style={{ fontSize: 11, color: form.tipo === t ? '#fff' : theme.textMuted, fontWeight: form.tipo === t ? 'bold' : 'normal' }}>{t}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <Text style={[styles.label, { color: theme.textMain }]}>METROLOGIA / SLA / DEGELO</Text>
              <TextInput style={[styles.input, { borderColor: theme.border, color: theme.textMain }]} placeholder="Data Calibração (AAAA-MM-DD)" placeholderTextColor={theme.textMuted} value={form.data_calibracao} onChangeText={(t) => setForm({...form, data_calibracao: t})} />
              
              <View style={styles.row}>
                <View style={styles.half}>
                  <Text style={[styles.label, { color: theme.textMain, marginTop: 0 }]}>MÍN °C</Text>
                  <TextInput style={[styles.input, { borderColor: theme.border, color: theme.textMain }]} value={String(form.temp_min)} onChangeText={(t) => setForm({...form, temp_min: t})} keyboardType="numeric" />
                </View>
                <View style={styles.half}>
                  <Text style={[styles.label, { color: theme.textMain, marginTop: 0 }]}>MÁX °C</Text>
                  <TextInput style={[styles.input, { borderColor: theme.border, color: theme.textMain }]} value={String(form.temp_max)} onChangeText={(t) => setForm({...form, temp_max: t})} keyboardType="numeric" />
                </View>
              </View>
              
              <View style={styles.row}>
                <View style={styles.half}>
                  <Text style={[styles.label, { color: theme.textMain, marginTop: 0 }]}>UR% MÍN</Text>
                  <TextInput style={[styles.input, { borderColor: theme.border, color: theme.textMain }]} value={String(form.umidade_min || '')} onChangeText={(t) => setForm({...form, umidade_min: t})} keyboardType="numeric" />
                </View>
                <View style={styles.half}>
                  <Text style={[styles.label, { color: theme.textMain, marginTop: 0 }]}>UR% MÁX</Text>
                  <TextInput style={[styles.input, { borderColor: theme.border, color: theme.textMain }]} value={String(form.umidade_max || '')} onChangeText={(t) => setForm({...form, umidade_max: t})} keyboardType="numeric" />
                </View>
              </View>
              
              <View style={styles.row}>
                <View style={styles.half}>
                  <Text style={[styles.label, { color: theme.textMain, marginTop: 0 }]}>DEGELO (Horas)</Text>
                  <TextInput style={[styles.input, { borderColor: theme.border, color: theme.textMain }]} value={String(form.intervalo_degelo)} onChangeText={(t) => setForm({...form, intervalo_degelo: t})} keyboardType="numeric" />
                </View>
                <View style={styles.half}>
                  <Text style={[styles.label, { color: theme.textMain, marginTop: 0 }]}>DEGELO (Minutos)</Text>
                  <TextInput style={[styles.input, { borderColor: theme.border, color: theme.textMain }]} value={String(form.duracao_degelo)} onChangeText={(t) => setForm({...form, duracao_degelo: t})} keyboardType="numeric" />
                </View>
              </View>

              <View style={{height: 50}} />
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
  card: { padding: 15, borderRadius: 12, marginBottom: 12, borderWidth: 1, flexDirection: 'row' },
  cardTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 5 },
  actionBtn: { padding: 8, backgroundColor: 'rgba(0,0,0,0.03)', borderRadius: 8, marginBottom: 5 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { padding: 20, borderTopLeftRadius: 20, borderTopRightRadius: 20, maxHeight: '90%' },
  formTitle: { fontSize: 18, fontWeight: 'bold' },
  label: { fontSize: 10, fontWeight: 'bold', marginBottom: 5, marginTop: 5, letterSpacing: 1 },
  input: { borderWidth: 1, borderRadius: 8, padding: 12, marginBottom: 10 },
  chipSugestao: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 15, borderWidth: 1, marginRight: 8, alignSelf: 'flex-start' },
  btnNorma: { padding: 8, backgroundColor: 'rgba(56, 189, 248, 0.1)', borderRadius: 10 },
  modalActions: { flexDirection: 'row', marginTop: 15 },
  btnSave: { padding: 15, borderRadius: 12, flex: 1, marginLeft: 10, alignItems: 'center' },
  btnCancel: { padding: 15, borderRadius: 12, borderWidth: 1, alignItems: 'center', width: 60 },
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
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  half: { width: '48%' }
});