import { MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useContext, useEffect, useState } from 'react';
import { Alert, FlatList, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import api from '../api/api';
import { AppContext } from '../context/AppContext';

export default function LojasScreen() {
  const { theme, carregarDadosBasicos } = useContext(AppContext);
  const [lojas, setLojas] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  
  const [form, setForm] = useState({ id: '', filial: '', endereco_loja: '', telefone_loja: '' });

  useEffect(() => { carregarLojas(); }, []);

  const carregarLojas = async () => {
    try { const res = await api.get('/api/lojas'); setLojas(res.data); } catch(e) {}
  };

  const salvar = async () => {
    if (!form.filial) return Alert.alert('Aviso', 'O nome da loja é obrigatório.');
    try {
      if (form.id) {
        await api.put(`/api/lojas/${form.id}`, form);
        Alert.alert('Sucesso', 'Loja atualizada. Os equipamentos foram sincronizados!');
      } else {
        await api.post('/api/cadastrar-loja', form);
        Alert.alert('Sucesso', 'Nova Loja registada!');
      }
      setModalVisible(false); carregarLojas(); carregarDadosBasicos();
    } catch(e) { Alert.alert('Erro', 'Falha ao guardar loja.'); }
  };

  const deletar = (id, nome) => {
    Alert.alert('Aviso de Risco', `Apagar a loja "${nome}" vai ELIMINAR TODOS os equipamentos, utilizadores e históricos vinculados a ela. Continuar?`, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Sim, Apagar Tudo', style: 'destructive', onPress: async () => { await api.delete(`/api/lojas/${id}`); carregarLojas(); carregarDadosBasicos(); } }
    ]);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      <View style={styles.header}>
          <Text style={{ fontSize: 18, fontWeight: '900', color: theme.textMain }}>Unidades / Lojas</Text>
          <TouchableOpacity style={[styles.btnNova, { backgroundColor: theme.primary }]} onPress={() => { setForm({ id: '', filial: '', endereco_loja: '', telefone_loja: '' }); setModalVisible(true); }}>
            <MaterialCommunityIcons name="plus-circle" size={18} color="#fff" />
            <Text style={styles.btnNovaText}>Nova Loja</Text>
          </TouchableOpacity>
      </View>

      <FlatList
        data={lojas}
        keyExtractor={i => i.id.toString()}
        renderItem={({item}) => (
          <View style={[styles.card, { backgroundColor: theme.card }]}>
            <Text style={[styles.cardTitle, { color: theme.textMain }]}>{item.nome}</Text>
            <Text style={{ color: theme.textMuted, fontSize: 13, marginTop: 4 }}><MaterialCommunityIcons name="map-marker" size={14}/> {item.endereco}</Text>
            <Text style={{ color: theme.textMuted, fontSize: 13, marginTop: 2 }}><MaterialCommunityIcons name="phone" size={14}/> {item.telefone}</Text>

            <View style={[styles.actions, { borderTopColor: theme.border }]}>
              <TouchableOpacity style={[styles.actionBtn, {borderColor: theme.border}]} onPress={() => { 
                setForm({ id: item.id, filial: item.nome, endereco_loja: item.endereco, telefone_loja: item.telefone }); 
                setModalVisible(true); 
              }}>
                <MaterialCommunityIcons name="pencil" size={20} color={theme.primary}/>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.actionBtn, {borderColor: theme.border}]} onPress={() => deletar(item.id, item.nome)}>
                <MaterialCommunityIcons name="delete" size={20} color={theme.danger}/>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />

      <Modal visible={modalVisible} transparent animationType="slide">
         <View style={styles.modalContainer}>
            <View style={[styles.modalContent, { backgroundColor: theme.card, borderColor: theme.border }]}>
               <Text style={[styles.modalTitle, { color: theme.textMain, marginBottom: 15 }]}>{form.id ? 'Editar Unidade' : 'Nova Unidade'}</Text>
               <ScrollView style={{maxHeight: '80%'}}>
                 
                 <Text style={styles.label}>Nome Oficial da Loja / Filial</Text>
                 <TextInput style={[styles.input, { color: theme.textMain, borderColor: theme.border }]} value={form.filial} onChangeText={t => setForm({...form, filial: t})} placeholder="Ex: Loja Lisboa Centro" />
                 
                 <Text style={styles.label}>Endereço Completo</Text>
                 <TextInput style={[styles.input, { color: theme.textMain, borderColor: theme.border }]} value={form.endereco_loja} onChangeText={t => setForm({...form, endereco_loja: t})} placeholder="Ex: Rua Augusta, 123" />

                 <Text style={styles.label}>Contato / Telefone</Text>
                 <TextInput style={[styles.input, { color: theme.textMain, borderColor: theme.border }]} value={form.telefone_loja} onChangeText={t => setForm({...form, telefone_loja: t})} placeholder="Ex: +351 912 345 678" />

               </ScrollView>
               <View style={styles.modalActions}>
                 <TouchableOpacity style={styles.btnCancel} onPress={() => setModalVisible(false)}><Text style={{color: theme.textMuted, fontWeight: 'bold'}}>Cancelar</Text></TouchableOpacity>
                 <TouchableOpacity style={[styles.btnSave, {backgroundColor: theme.primary}]} onPress={salvar}><Text style={{color:'#fff', fontWeight:'bold'}}>Salvar Unidade</Text></TouchableOpacity>
               </View>
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
  card: { padding: 18, borderRadius: 12, marginBottom: 15, elevation: 2 },
  cardTitle: { fontSize: 17, fontWeight: '900' },
  actions: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 15, borderTopWidth: 1, paddingTop: 15, gap: 12 },
  actionBtn: { padding: 8, borderWidth: 1, borderRadius: 8 },
  modalContainer: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', padding: 15 },
  modalContent: { padding: 20, borderRadius: 16, borderWidth: 1 },
  modalTitle: { fontSize: 18, fontWeight: '900' },
  label: { fontSize: 12, fontWeight: 'bold', color: '#64748b', marginBottom: 6 },
  input: { borderWidth: 1, borderRadius: 8, padding: 12, marginBottom: 10, fontSize: 14 },
  modalActions: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 20, gap: 10, borderTopWidth: 1, borderColor: 'rgba(0,0,0,0.1)', paddingTop: 15 },
  btnCancel: { padding: 12 },
  btnSave: { paddingVertical: 12, paddingHorizontal: 16, borderRadius: 8 }
});