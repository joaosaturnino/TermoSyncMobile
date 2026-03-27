import { Edit, Save, ShieldCheck, Trash2, UserPlus, Users, X } from 'lucide-react-native';
import { useCallback, useContext, useEffect, useState } from 'react';
import {
    Alert, FlatList, Modal, RefreshControl, ScrollView, StyleSheet,
    Text, TextInput, TouchableOpacity, View
} from 'react-native';
import { api } from '../api/api';
import { AppContext } from '../context/AppContext';

export default function UsuariosScreen() {
  const { theme, userRole } = useContext(AppContext);
  const [usuarios, setUsuarios] = useState([]);
  const [filiaisDb, setFiliaisDb] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

  const formInicial = { id: '', usuario: '', senha: '', role: 'LOJA', filial: '' };
  const [form, setForm] = useState(formInicial);

  const carregarDados = useCallback(async () => {
    if (userRole !== 'ADMIN') return;
    try {
      const [resUsr, resFiliais] = await Promise.all([
        api.get('/api/usuarios'),
        api.get('/api/auxiliares/filiais').catch(() => ({ data: [] }))
      ]);
      setUsuarios(resUsr.data);
      setFiliaisDb(resFiliais.data.filter(f => f !== 'Todas'));
    } catch (error) { } finally { setRefreshing(false); }
  }, [userRole]);

  useEffect(() => { carregarDados(); }, [carregarDados]);

  const salvarUsuario = async () => {
    if (!form.usuario || !form.role) return Alert.alert('Aviso', 'Preencha o login e o nível de acesso.');
    if (!form.id && !form.senha) return Alert.alert('Aviso', 'Senha obrigatória para contas novas.');
    if (form.role === 'LOJA' && !form.filial) return Alert.alert('Aviso', 'Defina a filial para o Gestor de Loja.');

    try {
      const payload = { ...form, filial: form.role !== 'LOJA' ? 'Todas' : form.filial };
      if (form.id) await api.put(`/api/usuarios/${form.id}`, payload);
      else await api.post('/api/usuarios', payload);
      setModalVisible(false); carregarDados();
    } catch (error) { Alert.alert('Erro', 'Utilizador já existe ou falha na rede.'); }
  };

  const confirmarExclusao = (id, nome) => {
    Alert.alert('Remover Acesso', `Remover "${nome}" permanentemente?`, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Remover', style: 'destructive', onPress: () => api.delete(`/api/usuarios/${id}`).then(carregarDados) }
    ]);
  };

  if (userRole !== 'ADMIN') {
    return (
      <View style={[styles.container, { backgroundColor: theme.bg, justifyContent: 'center', alignItems: 'center' }]}>
        <ShieldCheck size={64} color={theme.border} />
        <Text style={{ color: theme.textMuted, marginTop: 15, fontWeight: 'bold' }}>Acesso Restrito a Administradores</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      <View style={styles.headerArea}>
        <Text style={[styles.listTitle, { color: theme.textMain }]}>Contas Registadas ({usuarios.length})</Text>
        <TouchableOpacity style={[styles.btnNovo, { backgroundColor: theme.primary }]} onPress={() => { setForm(formInicial); setModalVisible(true); }}>
          <UserPlus color="#fff" size={20} /><Text style={styles.btnText}> Novo</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={usuarios}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={{ padding: 16 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); carregarDados(); }} />}
        renderItem={({item}) => {
          let roleColor = theme.info; let roleName = 'Gestor de Loja';
          if (item.role === 'ADMIN') { roleColor = theme.danger; roleName = 'Administrador Master'; }
          else if (item.role === 'MANUTENCAO') { roleColor = theme.primary; roleName = 'Manutenção Global'; }

          return (
            <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 5 }}>
                  <Users color={roleColor} size={18} style={{ marginRight: 8 }} />
                  <Text style={[styles.userName, { color: theme.textMain }]}>{item.usuario}</Text>
                </View>
                <Text style={[styles.badgeRole, { backgroundColor: roleColor }]}>{roleName}</Text>
                <Text style={{ fontSize: 12, marginTop: 8, color: theme.textMuted }}>Âmbito: <Text style={{ fontWeight: 'bold' }}>{item.filial}</Text></Text>
              </View>
              <View style={{ justifyContent: 'center', paddingLeft: 10 }}>
                <TouchableOpacity style={styles.btnAction} onPress={() => { setForm({ ...item, senha: '' }); setModalVisible(true); }}><Edit color={theme.primary} size={20} /></TouchableOpacity>
                <TouchableOpacity style={[styles.btnAction, { marginTop: 10 }]} onPress={() => confirmarExclusao(item.id, item.usuario)}><Trash2 color={theme.danger} size={20} /></TouchableOpacity>
              </View>
            </View>
          );
        }}
      />

      <Modal visible={modalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.card }]}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={[styles.formTitle, { color: theme.textMain, marginBottom: 15 }]}>{form.id ? 'Editar Credencial' : 'Novo Acesso'}</Text>

              <Text style={[styles.label, { color: theme.textMain }]}>LOGIN</Text>
              <TextInput style={[styles.input, { borderColor: theme.border, color: theme.textMain }]} autoCapitalize="none" value={form.usuario} onChangeText={(t) => setForm({...form, usuario: t})} />
              
              <Text style={[styles.label, { color: theme.textMain }]}>SENHA {form.id && '(Em branco = manter atual)'}</Text>
              <TextInput style={[styles.input, { borderColor: theme.border, color: theme.textMain }]} secureTextEntry value={form.senha} onChangeText={(t) => setForm({...form, senha: t})} />

              <Text style={[styles.label, { color: theme.textMain }]}>PERMISSÃO</Text>
              <View style={styles.chipRow}>
                <TouchableOpacity onPress={() => setForm({...form, role: 'LOJA'})} style={[styles.chip, { borderColor: theme.border }, form.role === 'LOJA' && { backgroundColor: theme.info }]}>
                  <Text style={{ color: form.role === 'LOJA' ? '#fff' : theme.textMuted, fontSize: 11, fontWeight: 'bold' }}>Loja Local</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setForm({...form, role: 'MANUTENCAO'})} style={[styles.chip, { borderColor: theme.border }, form.role === 'MANUTENCAO' && { backgroundColor: theme.primary }]}>
                  <Text style={{ color: form.role === 'MANUTENCAO' ? '#fff' : theme.textMuted, fontSize: 11, fontWeight: 'bold' }}>Manutenção</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setForm({...form, role: 'ADMIN'})} style={[styles.chip, { borderColor: theme.border }, form.role === 'ADMIN' && { backgroundColor: theme.danger }]}>
                  <Text style={{ color: form.role === 'ADMIN' ? '#fff' : theme.textMuted, fontSize: 11, fontWeight: 'bold' }}>Master</Text>
                </TouchableOpacity>
              </View>

              {form.role === 'LOJA' && (
                <>
                  <Text style={[styles.label, { color: theme.textMain }]}>FILIAL DO GESTOR</Text>
                  <TextInput style={[styles.input, { borderColor: theme.border, color: theme.textMain }]} placeholder="Ex: Loja Porto" placeholderTextColor={theme.textMuted} value={form.filial} onChangeText={(t) => setForm({...form, filial: t})} />
                  {filiaisDb.length > 0 && (
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 15 }}>
                      {filiaisDb.map(f => (
                        <TouchableOpacity key={f} onPress={() => setForm({ ...form, filial: f })} style={[styles.chipSugestao, { borderColor: theme.border }]}>
                          <Text style={{ fontSize: 11, color: theme.textMuted }}>{f}</Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  )}
                </>
              )}
            </ScrollView>

            <View style={styles.modalActions}>
              <TouchableOpacity style={[styles.btnCancel, { borderColor: theme.border }]} onPress={() => setModalVisible(false)}><X color={theme.textMuted} size={24} /></TouchableOpacity>
              <TouchableOpacity style={[styles.btnSave, { backgroundColor: theme.primary }]} onPress={salvarUsuario}><Save color="#fff" size={24} /></TouchableOpacity>
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
  userName: { fontSize: 16, fontWeight: '900' },
  badgeRole: { color: '#fff', fontSize: 10, fontWeight: 'bold', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, overflow: 'hidden', alignSelf: 'flex-start' },
  btnAction: { padding: 10, backgroundColor: 'rgba(0,0,0,0.03)', borderRadius: 10 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { padding: 25, borderTopLeftRadius: 20, borderTopRightRadius: 20, maxHeight: '90%' },
  formTitle: { fontSize: 20, fontWeight: 'bold' },
  input: { borderWidth: 1, borderRadius: 10, padding: 12, marginBottom: 12 },
  label: { fontSize: 10, fontWeight: 'bold', marginBottom: 10, marginTop: 5, letterSpacing: 1 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 15, gap: 8 },
  chip: { padding: 10, borderRadius: 10, borderWidth: 1 },
  chipSugestao: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 15, borderWidth: 1, marginRight: 8 },
  modalActions: { flexDirection: 'row', marginTop: 10 },
  btnSave: { padding: 15, borderRadius: 12, flex: 1, marginLeft: 10, alignItems: 'center' },
  btnCancel: { padding: 15, borderRadius: 12, borderWidth: 1 }
});