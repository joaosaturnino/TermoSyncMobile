import { MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useContext, useState } from 'react';
import { Alert, FlatList, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import api from '../api/api';
import { AppContext } from '../context/AppContext';

export default function EquipamentosScreen() {
  const { equipamentos, userRole, userFilial, filiaisDb, theme, carregarDadosBasicos, isOffline } = useContext(AppContext);
  const [modalVisible, setModalVisible] = useState(false);
  
  const formInicial = { 
    id: '', 
    nome: '', 
    tipo: '', 
    temp_min: '', 
    temp_max: '', 
    umidade_min: '', 
    umidade_max: '', 
    intervalo_degelo: '', 
    duracao_degelo: '30', 
    setor: '', 
    filial: userRole === 'LOJA' ? userFilial : '', 
    data_calibracao: new Date().toISOString().split('T')[0] 
  };
  const [form, setForm] = useState({ ...formInicial });

  const aplicarNormaANVISA = () => {
    if (!form.setor || !form.tipo) return Alert.alert('Aviso', 'Preencha o Setor Comercial e o Tipo de Refrigeração primeiro.');
    let tMin = '', tMax = '', uMin = '', uMax = '';
    const setorLower = form.setor.toLowerCase();
    
    if (setorLower.includes('farmácia') || setorLower.includes('vacina')) {
      if (form.tipo.includes('Congelados')) { tMin = -25; tMax = -15; uMin = 35; uMax = 60; } else { tMin = 2; tMax = 8; uMin = 35; uMax = 65; }
    } else {
      if (form.tipo.includes('Congelados') || form.tipo.includes('Arca')) { tMin = -24; tMax = -18; uMin = 60; uMax = 80; } 
      else if (setorLower.includes('açougue')) { tMin = 0; tMax = 4; uMin = 85; uMax = 95; } 
      else if (setorLower.includes('flv')) { tMin = 8; tMax = 12; uMin = 85; uMax = 95; } 
      else { tMin = 0; tMax = 8; uMin = 60; uMax = 85; }
    }
    
    setForm(prev => ({ 
      ...prev, 
      temp_min: String(tMin), 
      temp_max: String(tMax), 
      umidade_min: String(uMin), 
      umidade_max: String(uMax), 
      intervalo_degelo: '6', 
      duracao_degelo: '30' 
    }));
    Alert.alert('Sucesso', 'Regulamentação e SLAs Físicos aplicados ao formulário!');
  };

  const salvar = async () => {
    if (isOffline) return Alert.alert('Aviso', 'Ação bloqueada enquanto estiver offline.');
    if (!form.nome || !form.temp_min || !form.temp_max || !form.tipo || !form.data_calibracao) {
        return Alert.alert('Aviso', 'Preencha todos os campos obrigatórios (Identificador, Tipo, Data de Calibração, Temp Mín e Temp Máx).');
    }
    
    try {
      const payload = { ...form, filial: userRole === 'LOJA' ? userFilial : form.filial };
      if (form.id) await api.put(`/api/equipamentos/${form.id}/edit`, payload);
      else await api.post('/api/equipamentos', payload);
      
      setModalVisible(false);
      carregarDadosBasicos();
      Alert.alert('Sucesso', form.id ? 'Perfil do equipamento atualizado.' : 'Hardware registado com sucesso.');
    } catch(e) { Alert.alert('Erro', 'Falha ao comunicar com o servidor.'); }
  };

  const deletar = (id, nome) => {
    if (isOffline) return Alert.alert('Aviso', 'Ação bloqueada enquanto estiver offline.');
    Alert.alert('Remover Máquina', `Deseja remover "${nome}" permanentemente do sistema?`, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Apagar', style: 'destructive', onPress: async () => { 
          try { await api.delete(`/api/equipamentos/${id}`); carregarDadosBasicos(); } 
          catch (e) { Alert.alert('Erro', 'Falha ao apagar registo.'); }
      }}
    ]);
  };

  const tiposOpcoes = ["Câmara Frigorífica", "Ilha de Congelados", "Balcão Refrigerado Aberto"];

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 }}>
          <Text style={{ fontSize: 18, fontWeight: '900', color: theme.textMain }}>Metrologia IoT</Text>
          <TouchableOpacity style={[styles.btnNova, { backgroundColor: theme.primary }]} onPress={() => { setForm({...formInicial, filial: userRole === 'LOJA' ? userFilial : ''}); setModalVisible(true); }}>
            <MaterialCommunityIcons name="plus-circle" size={18} color="#fff" />
            <Text style={styles.btnNovaText}>Novo Sensor</Text>
          </TouchableOpacity>
      </View>

      <FlatList
        data={equipamentos}
        keyExtractor={i => i.id.toString()}
        renderItem={({item}) => {
          const diasCalib = item.data_calibracao ? Math.floor((Date.now() - new Date(item.data_calibracao).getTime()) / (1000 * 60 * 60 * 24)) : 0;
          const calibCritica = diasCalib > 365;

          return (
            <View style={[styles.card, { backgroundColor: theme.card }]}>
              <View style={styles.cardTop}>
                <View style={{flexDirection:'row', alignItems:'center', flex: 1}}>
                  <View style={[styles.dot, {backgroundColor: item.em_degelo ? theme.info : (item.motor_ligado ? theme.success : theme.danger)}]} />
                  <Text style={[styles.cardTitle, { color: theme.textMain }]} numberOfLines={1}>{item.nome}</Text>
                </View>
                <Text style={{ fontSize: 11, fontWeight: 'bold', color: theme.textMuted, marginLeft: 10 }}>{item.filial}</Text>
              </View>
              <Text style={[styles.subText, { color: theme.textMuted }]}>{item.tipo} | {item.setor}</Text>
              
              <View style={styles.infoRow}><MaterialCommunityIcons name="thermometer" size={16} color={theme.textMuted}/><Text style={{ color: theme.textMain, fontSize: 13, fontWeight: 'bold' }}> SLA Físico: {item.temp_min}°C a {item.temp_max}°C</Text></View>
              <View style={styles.infoRow}><MaterialCommunityIcons name="water-percent" size={16} color={theme.textMuted}/><Text style={{ color: theme.textMain, fontSize: 13 }}> Humidade: {item.umidade_min || 0}% a {item.umidade_max || 0}%</Text></View>
              <View style={styles.infoRow}><MaterialCommunityIcons name="certificate" size={16} color={calibCritica ? theme.danger : theme.success}/><Text style={{color: calibCritica ? theme.danger : theme.success, fontSize: 13, fontWeight:'bold'}}> Certificado há {diasCalib} dias</Text></View>

              <View style={[styles.actions, { borderTopColor: theme.border }]}>
                <TouchableOpacity style={[styles.actionBtn, {borderColor: theme.border}]} onPress={() => { 
                  setForm({ 
                    ...item, 
                    temp_min: String(item.temp_min), 
                    temp_max: String(item.temp_max), 
                    umidade_min: String(item.umidade_min || ''), 
                    umidade_max: String(item.umidade_max || ''), 
                    intervalo_degelo: String(item.intervalo_degelo), 
                    duracao_degelo: String(item.duracao_degelo), 
                    data_calibracao: item.data_calibracao ? item.data_calibracao.split('T')[0] : '' 
                  }); 
                  setModalVisible(true); 
                }}>
                  <MaterialCommunityIcons name="pencil" size={20} color={theme.primary}/>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.actionBtn, {borderColor: theme.border}]} onPress={() => deletar(item.id, item.nome)}>
                  <MaterialCommunityIcons name="delete" size={20} color={theme.danger}/>
                </TouchableOpacity>
              </View>
            </View>
          );
        }}
      />

      <Modal visible={modalVisible} transparent animationType="slide">
         <View style={styles.modalContainer}>
            <View style={[styles.modalContent, { backgroundColor: theme.card, borderColor: theme.border, borderWidth: 1 }]}>
               
               <View style={{flexDirection:'row', justifyContent:'space-between', alignItems:'center', marginBottom:15, borderBottomWidth: 1, borderBottomColor: theme.border, paddingBottom: 10}}>
                 <Text style={[styles.modalTitle, { color: theme.textMain }]}>{form.id ? 'Editar Máquina' : 'Registo IoT'}</Text>
                 <TouchableOpacity onPress={aplicarNormaANVISA} style={styles.btnAnvisa}>
                    <MaterialCommunityIcons name="shield-check" size={16} color={theme.info}/>
                    <Text style={{color: theme.info, fontSize:11, fontWeight:'bold', marginLeft:4}}>Padrão Legal</Text>
                 </TouchableOpacity>
               </View>

               <ScrollView style={{maxHeight: '75%'}} showsVerticalScrollIndicator={false}>
                 
                 <Text style={styles.label}>Identificador da Máquina</Text>
                 <TextInput style={[styles.input, { color: theme.textMain, borderColor: theme.border, backgroundColor: theme.bg }]} value={form.nome} onChangeText={t => setForm({...form, nome: t})} placeholder="Ex: Câmara de Carnes" placeholderTextColor={theme.textMuted} />
                 
                 <Text style={styles.label}>Filial / Loja Física</Text>
                 {userRole === 'LOJA' ? ( <TextInput style={[styles.input, { backgroundColor: theme.bg, color: theme.textMain, borderColor: theme.border }]} value={form.filial} editable={false} /> ) : (
                   <ScrollView horizontal style={{marginBottom:15}} showsHorizontalScrollIndicator={false}>
                     {filiaisDb?.map(f => <TouchableOpacity key={f} onPress={()=>setForm({...form, filial: f})} style={[styles.chip, form.filial === f && { backgroundColor: theme.primary, borderColor: theme.primary }]}><Text style={{color: form.filial===f?'white':theme.textMuted, fontWeight: 'bold'}}>{f}</Text></TouchableOpacity>)}
                   </ScrollView>
                 )}
                 
                 <Text style={styles.label}>Setor Comercial</Text>
                 <TextInput style={[styles.input, { color: theme.textMain, borderColor: theme.border, backgroundColor: theme.bg }]} value={form.setor} onChangeText={t => setForm({...form, setor: t})} placeholder="Ex: Açougue" placeholderTextColor={theme.textMuted} />

                 <Text style={styles.label}>Tipo de Refrigeração</Text>
                 <View style={{flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 15}}>
                    {tiposOpcoes.map(tipo => (
                        <TouchableOpacity key={tipo} onPress={() => setForm({...form, tipo})} style={[styles.chipTipo, { borderColor: theme.border }, form.tipo === tipo && { backgroundColor: theme.textMain, borderColor: theme.textMain }]}>
                            <Text style={{ color: form.tipo === tipo ? theme.bg : theme.textMuted, fontSize: 12, fontWeight: 'bold' }}>{tipo}</Text>
                        </TouchableOpacity>
                    ))}
                 </View>

                 <Text style={styles.label}>Data de Calibração (YYYY-MM-DD)</Text>
                 <TextInput style={[styles.input, { color: theme.textMain, borderColor: theme.border, backgroundColor: theme.bg }]} value={form.data_calibracao} onChangeText={t => setForm({...form, data_calibracao: t})} placeholder="Ex: 2025-01-20" placeholderTextColor={theme.textMuted} />
                 
                 <Text style={styles.label}>Degelo Automático (Horas)</Text>
                 <TextInput style={[styles.input, { color: theme.textMain, borderColor: theme.border, backgroundColor: theme.bg }]} keyboardType="numeric" value={form.intervalo_degelo} onChangeText={t => setForm({...form, intervalo_degelo: t})} placeholder="Ex: 6" placeholderTextColor={theme.textMuted} />

                 <View style={{flexDirection:'row', justifyContent:'space-between'}}>
                    <View style={{width:'48%'}}>
                      <Text style={styles.label}>Temp Mín (°C)</Text>
                      <TextInput style={[styles.input, { color: theme.textMain, borderColor: theme.border, backgroundColor: theme.bg }]} keyboardType="numeric" value={form.temp_min} onChangeText={t => setForm({...form, temp_min: t})} placeholder="Ex: 2" placeholderTextColor={theme.textMuted} />
                    </View>
                    <View style={{width:'48%'}}>
                      <Text style={styles.label}>Temp Máx (°C)</Text>
                      <TextInput style={[styles.input, { color: theme.textMain, borderColor: theme.border, backgroundColor: theme.bg }]} keyboardType="numeric" value={form.temp_max} onChangeText={t => setForm({...form, temp_max: t})} placeholder="Ex: 8" placeholderTextColor={theme.textMuted} />
                    </View>
                 </View>

                 <View style={{flexDirection:'row', justifyContent:'space-between'}}>
                    <View style={{width:'48%'}}>
                      <Text style={styles.label}>Humidade Mín (%)</Text>
                      <TextInput style={[styles.input, { color: theme.textMain, borderColor: theme.border, backgroundColor: theme.bg }]} keyboardType="numeric" value={form.umidade_min} onChangeText={t => setForm({...form, umidade_min: t})} placeholder="Ex: 40" placeholderTextColor={theme.textMuted} />
                    </View>
                    <View style={{width:'48%'}}>
                      <Text style={styles.label}>Humidade Máx (%)</Text>
                      <TextInput style={[styles.input, { color: theme.textMain, borderColor: theme.border, backgroundColor: theme.bg }]} keyboardType="numeric" value={form.umidade_max} onChangeText={t => setForm({...form, umidade_max: t})} placeholder="Ex: 60" placeholderTextColor={theme.textMuted} />
                    </View>
                 </View>

               </ScrollView>

               <View style={styles.modalActions}>
                 <TouchableOpacity style={styles.btnCancel} onPress={() => setModalVisible(false)}>
                   <Text style={{color: theme.textMuted, fontWeight: 'bold'}}>Cancelar</Text>
                 </TouchableOpacity>
                 <TouchableOpacity style={[styles.btnSave, {backgroundColor: theme.primary}]} onPress={salvar}>
                   <MaterialCommunityIcons name="content-save" size={18} color="#fff" style={{marginRight: 6}}/> 
                   <Text style={{color:'#fff', fontWeight:'bold'}}>Salvar Perfil</Text>
                 </TouchableOpacity>
               </View>
            </View>
         </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 15 },
  btnNova: { flexDirection: 'row', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, alignItems:'center' },
  btnNovaText: { color: '#fff', fontWeight: 'bold', marginLeft: 6, fontSize: 13 },
  card: { padding: 18, borderRadius: 12, marginBottom: 15, elevation: 2, shadowColor: '#000', shadowOffset: {width: 0, height: 2}, shadowOpacity: 0.1, shadowRadius: 4 },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  dot: { width: 10, height: 10, borderRadius: 5, marginRight: 8 },
  cardTitle: { fontSize: 17, fontWeight: '900', flexShrink: 1 },
  subText: { fontSize: 13, marginLeft: 18, marginBottom: 15, fontWeight: 'bold' },
  infoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8, marginLeft: 18 },
  actions: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 15, borderTopWidth: 1, paddingTop: 15, gap: 12 },
  actionBtn: { padding: 8, borderWidth: 1, borderRadius: 8 },
  
  modalContainer: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', padding: 15 },
  modalContent: { padding: 20, borderRadius: 16, elevation: 10 },
  modalTitle: { fontSize: 18, fontWeight: '900' },
  btnAnvisa: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 },
  label: { fontSize: 12, fontWeight: 'bold', color: '#64748b', marginBottom: 6, marginTop: 5 },
  input: { borderWidth: 1, borderRadius: 8, padding: 12, marginBottom: 10, fontSize: 14 },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, marginRight: 8, borderWidth: 1 },
  chipTipo: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, borderWidth: 1 },
  modalActions: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 20, gap: 10, borderTopWidth: 1, borderTopColor: 'rgba(0,0,0,0.1)', paddingTop: 15 },
  btnCancel: { padding: 12, borderRadius: 8, borderWidth: 1, borderColor: 'transparent', justifyContent: 'center' },
  btnSave: { paddingVertical: 12, paddingHorizontal: 16, borderRadius: 8, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }
});