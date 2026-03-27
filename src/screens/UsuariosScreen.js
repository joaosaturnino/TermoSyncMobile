import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useContext, useState } from 'react';
import { Alert, FlatList, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import api from '../api/api';
import { AppContext } from '../context/AppContext';

export default function UsuariosScreen() {
  const { usuariosLista, carregarDadosBasicos, filiaisDb } = useContext(AppContext);
  const [modalVisible, setModalVisible] = useState(false);
  const [form, setForm] = useState({ id: '', usuario: '', senha: '', role: 'LOJA', filial: '', tipo_acesso: 'GERENTE', nome_identidade: '' });

  const abrirModal = (tipo) => {
    let roleT = 'LOJA';
    if (tipo === 'TECNICO') roleT = 'MANUTENCAO';
    if (tipo === 'OUTROS') roleT = 'ADMIN';
    setForm({ id: '', usuario: '', senha: '', role: roleT, filial: '', tipo_acesso: tipo, nome_identidade: '' });
    setModalVisible(true);
  };

  const salvar = async () => {
    if (!form.usuario) return Alert.alert('Aviso', 'Preencha o Login.');
    const payload = { 
      usuario: form.usuario, senha: form.senha, role: form.role,
      filial: form.role !== 'LOJA' ? 'Todas' : form.filial,
      nome_gerente: form.tipo_acesso === 'GERENTE' ? form.nome_identidade : null,
      nome_coordenador: form.tipo_acesso === 'COORDENADOR' ? form.nome_identidade : null,
      nome_tecnico: form.tipo_acesso === 'TECNICO' ? form.nome_identidade : null
    };

    try {
      if (form.id) await api.put(`/usuarios/${form.id}`, payload);
      else {
        if (!form.senha) return Alert.alert('Aviso', 'Senha obrigatória.');
        await api.post('/usuarios', payload);
      }
      setModalVisible(false);
      carregarDadosBasicos();
    } catch(e) { Alert.alert('Erro', 'O login já existe.'); }
  };

  const deletar = (id) => {
    Alert.alert('Remover Conta', 'Certeza?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Remover', style: 'destructive', onPress: async () => { await api.delete(`/usuarios/${id}`); carregarDadosBasicos(); } }
    ]);
  };

  return (
    <View style={styles.container}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.btnRow}>
        <TouchableOpacity style={[styles.btnTop, {backgroundColor: '#059669'}]} onPress={() => abrirModal('GERENTE')}><Text style={styles.btnTopText}>+ Gerente</Text></TouchableOpacity>
        <TouchableOpacity style={[styles.btnTop, {backgroundColor: '#0284c7'}]} onPress={() => abrirModal('COORDENADOR')}><Text style={styles.btnTopText}>+ Coord.</Text></TouchableOpacity>
        <TouchableOpacity style={[styles.btnTop, {backgroundColor: '#f59e0b'}]} onPress={() => abrirModal('TECNICO')}><Text style={styles.btnTopText}>+ Técnico</Text></TouchableOpacity>
        <TouchableOpacity style={[styles.btnTop, {backgroundColor: '#475569'}]} onPress={() => abrirModal('OUTROS')}><Text style={styles.btnTopText}>+ Admin</Text></TouchableOpacity>
      </ScrollView>

      <FlatList
        data={usuariosLista}
        keyExtractor={i => i.id.toString()}
        renderItem={({item}) => {
          let identity = '';
          if (item.role === 'MANUTENCAO') identity = `Técnico: ${item.nome_tecnico || 'Geral'}`;
          else if (item.nome_gerente) identity = `Gerente: ${item.nome_gerente}`;
          else if (item.nome_coordenador) identity = `Coord: ${item.nome_coordenador}`;

          return (
            <View style={styles.card}>
              <View style={styles.cardInfo}>
                 <Text style={styles.usuario}>@{item.usuario}</Text>
                 {identity ? <Text style={styles.identity}>{identity}</Text> : null}
                 <Text style={styles.detalhes}>{item.role === 'ADMIN' ? 'Admin Master' : item.role === 'MANUTENCAO' ? 'Acesso Global' : item.filial}</Text>
              </View>
              <View style={styles.actions}>
                <TouchableOpacity onPress={() => deletar(item.id)}><MaterialCommunityIcons name="delete" size={24} color="#ef4444" /></TouchableOpacity>
              </View>
            </View>
          );
        }}
      />

      <Modal visible={modalVisible} transparent animationType="slide">
         <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
               <Text style={styles.modalTitle}>
                 {form.id ? 'Editar Conta' : form.tipo_acesso === 'GERENTE' ? 'Novo Gerente' : form.tipo_acesso === 'COORDENADOR' ? 'Novo Coordenador' : form.tipo_acesso === 'TECNICO' ? 'Novo Técnico' : 'Novo Admin'}
               </Text>
               
               {form.role !== 'ADMIN' && (
                 <TextInput style={styles.input} placeholder="Nome Real Completo" value={form.nome_identidade} onChangeText={t => setForm({...form, nome_identidade: t})} />
               )}
               
               <TextInput style={styles.input} placeholder="Login (Ex: gerente_loja)" value={form.usuario} onChangeText={t => setForm({...form, usuario: t})} editable={!form.id} />
               <TextInput style={styles.input} placeholder="Palavra-passe" value={form.senha} onChangeText={t => setForm({...form, senha: t})} secureTextEntry={!form.id} />
               
               {form.role === 'LOJA' && (
                 <View style={{height: 120, marginBottom: 15, borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 8, padding: 5}}>
                   <Text style={{color:'gray', marginBottom:5, paddingLeft:5}}>Vincular à Loja:</Text>
                   <ScrollView>
                     {filiaisDb.map(f => (
                        <TouchableOpacity key={f} onPress={()=>setForm({...form, filial: f})} style={[styles.selBox, form.filial === f && styles.selActive]}><Text>{f}</Text></TouchableOpacity>
                     ))}
                   </ScrollView>
                 </View>
               )}

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
  btnRow: { flexDirection: 'row', marginBottom: 15, maxHeight: 45 },
  btnTop: { paddingHorizontal: 15, paddingVertical: 12, borderRadius: 8, marginRight: 10, justifyContent: 'center' },
  btnTopText: { color: 'white', fontWeight: 'bold' },
  card: { backgroundColor: '#fff', padding: 15, borderRadius: 10, marginBottom: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', elevation: 1 },
  cardInfo: { flex: 1 },
  usuario: { fontSize: 16, fontWeight: 'bold', color: '#0f172a' },
  identity: { fontSize: 13, color: '#0284c7', marginTop: 4, fontWeight: 'bold' },
  detalhes: { fontSize: 12, color: '#64748b', marginTop: 4 },
  actions: { flexDirection: 'row' },
  modalContainer: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
  modalContent: { backgroundColor: '#fff', padding: 20, borderRadius: 15 },
  modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 15 },
  input: { borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 8, padding: 12, marginBottom: 10 },
  selBox: { padding: 10, backgroundColor: '#f1f5f9', marginBottom: 5, borderRadius: 5 },
  selActive: { backgroundColor: '#bae6fd', borderWidth: 1, borderColor: '#0284c7' },
  modalActions: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 10, gap: 10 },
  btnCancel: { padding: 10, borderRadius: 8, backgroundColor: '#e2e8f0' },
  btnSave: { padding: 10, borderRadius: 8, backgroundColor: '#0284c7' }
});