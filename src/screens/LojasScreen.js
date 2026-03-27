import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useContext, useState } from 'react';
import { Alert, FlatList, Modal, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import api from '../api/api';
import { AppContext } from '../context/AppContext';

export default function LojasScreen() {
  const { lojasCadastradas, carregarDadosBasicos } = useContext(AppContext);
  const [modalVisible, setModalVisible] = useState(false);
  const [form, setForm] = useState({ id: '', nome: '', endereco_loja: '', telefone_loja: '' });

  const salvar = async () => {
    if (!form.nome) return Alert.alert("Erro", "Nome da Loja é obrigatório");
    try {
      if (form.id) {
        await api.put(`/lojas/${form.id}`, form);
      } else {
        await api.post('/lojas', form);
      }
      setModalVisible(false);
      carregarDadosBasicos();
    } catch(e) { Alert.alert("Erro ao salvar loja."); }
  };

  const deletar = (id) => {
    Alert.alert('Remover Loja', 'Certeza? Apagará utilizadores e equipamentos desta filial.', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Apagar', style: 'destructive', onPress: async () => {
          await api.delete(`/lojas/${id}`);
          carregarDadosBasicos();
      }}
    ]);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.btnNova} onPress={() => { setForm({id:'', nome:'', endereco_loja:'', telefone_loja:''}); setModalVisible(true); }}>
        <MaterialCommunityIcons name="store-plus" size={20} color="#fff" />
        <Text style={{color:'#fff', fontWeight:'bold', marginLeft: 8}}>Nova Loja Física</Text>
      </TouchableOpacity>

      <FlatList
        data={lojasCadastradas}
        keyExtractor={i => i.id.toString()}
        renderItem={({item}) => (
          <View style={styles.card}>
            <View style={styles.cardRow}>
               <MaterialCommunityIcons name="store" size={24} color="#0284c7" />
               <Text style={styles.cardTitle}>{item.nome}</Text>
            </View>
            <View style={styles.infoBox}>
               <Text style={styles.info}><Text style={{fontWeight:'bold'}}>Endereço:</Text> {item.endereco || '-'}</Text>
               <Text style={styles.info}><Text style={{fontWeight:'bold'}}>Telefone:</Text> {item.telefone || '-'}</Text>
            </View>
            <View style={styles.gestaoBox}>
               <Text style={{color:'#047857', fontSize:13, fontWeight: 'bold'}}>Gerente: <Text style={{fontWeight: 'normal'}}>{item.nome_gerente || 'Não def.'}</Text></Text>
               <Text style={{color:'#0369a1', fontSize:13, fontWeight: 'bold'}}>Coordenador: <Text style={{fontWeight: 'normal'}}>{item.nome_coordenador || 'Não def.'}</Text></Text>
            </View>
            <View style={styles.actions}>
               <TouchableOpacity onPress={() => { setForm({id: item.id, nome: item.nome, endereco_loja: item.endereco, telefone_loja: item.telefone}); setModalVisible(true); }}><MaterialCommunityIcons name="pencil" size={22} color="#64748b" style={{marginRight:15}}/></TouchableOpacity>
               <TouchableOpacity onPress={() => deletar(item.id)}><MaterialCommunityIcons name="delete" size={22} color="#ef4444"/></TouchableOpacity>
            </View>
          </View>
        )}
      />

      <Modal visible={modalVisible} transparent animationType="slide">
         <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
               <Text style={styles.modalTitle}>{form.id ? 'Editar Loja' : 'Cadastrar Loja'}</Text>
               <TextInput style={styles.input} placeholder="Nome da Loja" value={form.nome} onChangeText={t => setForm({...form, nome: t})} editable={!form.id} />
               <TextInput style={styles.input} placeholder="Endereço Completo" value={form.endereco_loja} onChangeText={t => setForm({...form, endereco_loja: t})} />
               <TextInput style={styles.input} placeholder="Telefone Comercial" value={form.telefone_loja} onChangeText={t => setForm({...form, telefone_loja: t})} keyboardType="phone-pad" />
               <View style={styles.modalActions}>
                 <TouchableOpacity style={styles.btnCancel} onPress={() => setModalVisible(false)}><Text style={{color:'#64748b'}}>Cancelar</Text></TouchableOpacity>
                 <TouchableOpacity style={styles.btnSave} onPress={salvar}><Text style={{color:'#fff', fontWeight:'bold'}}>Salvar</Text></TouchableOpacity>
               </View>
            </View>
         </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f1f5f9', padding: 15 },
  btnNova: { backgroundColor: '#0284c7', flexDirection: 'row', padding: 15, borderRadius: 8, justifyContent: 'center', marginBottom: 15 },
  card: { backgroundColor: '#fff', padding: 15, borderRadius: 10, marginBottom: 15, elevation: 2 },
  cardRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  cardTitle: { fontSize: 18, fontWeight: 'bold', marginLeft: 10, color: '#0f172a' },
  infoBox: { paddingBottom: 10, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  info: { fontSize: 14, color: '#475569', marginBottom: 4 },
  gestaoBox: { paddingTop: 10, gap: 4 },
  actions: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 10 },
  modalContainer: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
  modalContent: { backgroundColor: '#fff', padding: 20, borderRadius: 15 },
  modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 15 },
  input: { borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 8, padding: 12, marginBottom: 10 },
  modalActions: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 10, gap: 10 },
  btnCancel: { padding: 10, borderRadius: 8, backgroundColor: '#e2e8f0' },
  btnSave: { padding: 10, borderRadius: 8, backgroundColor: '#0284c7' }
});