import { MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useContext, useEffect, useState } from 'react';
import { Alert, FlatList, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import api from '../api/api';
import { AppContext } from '../context/AppContext';

export default function UsuariosScreen() {
  const { theme, filiaisDb, carregarDadosBasicos } = useContext(AppContext);
  const [usuarios, setUsuarios] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  
  // O tipo de perfil amigável que controla o que aparece no ecrã
  const [tipoPerfil, setTipoPerfil] = useState('GERENTE'); 

  const formInicial = { 
    id: '', usuario: '', senha: '', role: 'LOJA', filial: 'Loja Principal', 
    nome_gerente: '', nome_coordenador: '', nome_tecnico: '' 
  };
  const [form, setForm] = useState({ ...formInicial });

  useEffect(() => { carregarUsuarios(); }, []);

  const carregarUsuarios = async () => {
    try { const res = await api.get('/api/usuarios'); setUsuarios(res.data); } catch(e) {}
  };

  // Função para descobrir qual era o botão selecionado quando vamos editar alguém
  const abrirEdicao = (item) => {
    let tipoCalculado = 'GERENTE';
    if (item.role === 'ADMIN') tipoCalculado = 'ADMIN';
    else if (item.role === 'MANUTENCAO') tipoCalculado = 'TECNICO';
    else if (item.nome_coordenador) tipoCalculado = 'COORDENADOR';
    
    setTipoPerfil(tipoCalculado);
    setForm({ 
      ...item, 
      senha: '', // Senha em branco para não reescrever acidentalmente
      nome_gerente: item.nome_gerente || '',
      nome_coordenador: item.nome_coordenador || '',
      nome_tecnico: item.nome_tecnico || '',
      filial: item.filial || 'Todas'
    });
    setModalVisible(true);
  };

  const abrirNovo = () => {
    setTipoPerfil('GERENTE');
    setForm({ ...formInicial });
    setModalVisible(true);
  };

  const lidarMudancaPerfil = (tipo) => {
    setTipoPerfil(tipo);
    // Ajusta as permissões automaticamente como na Web
    if (tipo === 'ADMIN') setForm(prev => ({ ...prev, role: 'ADMIN', filial: 'Todas', nome_gerente: '', nome_coordenador: '', nome_tecnico: '' }));
    else if (tipo === 'TECNICO') setForm(prev => ({ ...prev, role: 'MANUTENCAO', filial: 'Todas', nome_gerente: '', nome_coordenador: '' }));
    else if (tipo === 'GERENTE') setForm(prev => ({ ...prev, role: 'LOJA', nome_coordenador: '', nome_tecnico: '', filial: filiaisDb?.[0] || 'Loja Principal' }));
    else if (tipo === 'COORDENADOR') setForm(prev => ({ ...prev, role: 'LOJA', nome_gerente: '', nome_tecnico: '', filial: filiaisDb?.[0] || 'Loja Principal' }));
  };

  const salvar = async () => {
    if (!form.usuario) return Alert.alert('Aviso', 'Preencha a Credencial de Login.');
    
    // Validações específicas por perfil
    if (tipoPerfil === 'GERENTE' && !form.nome_gerente) return Alert.alert('Aviso', 'Preencha o Nome do Gerente.');
    if (tipoPerfil === 'COORDENADOR' && !form.nome_coordenador) return Alert.alert('Aviso', 'Preencha o Nome do Coordenador.');
    if (tipoPerfil === 'TECNICO' && !form.nome_tecnico) return Alert.alert('Aviso', 'Preencha o Nome do Técnico.');
    if ((tipoPerfil === 'GERENTE' || tipoPerfil === 'COORDENADOR') && (!form.filial || form.filial === 'Todas')) {
      return Alert.alert('Aviso', 'Selecione uma Loja específica para este cargo.');
    }

    try {
      if (form.id) {
        await api.put(`/api/usuarios/${form.id}`, form);
        Alert.alert('Sucesso', 'Acesso atualizado com sucesso!');
      } else {
        if (!form.senha) return Alert.alert('Aviso', 'A palavra-passe é obrigatória para novos acessos.');
        await api.post('/api/usuarios', form);
        Alert.alert('Sucesso', 'Novo acesso criado!');
      }
      setModalVisible(false); carregarUsuarios(); carregarDadosBasicos();
    } catch(e) { Alert.alert('Erro', 'Falha ao guardar acesso.'); }
  };

  const deletar = (id, nome) => {
    Alert.alert('Remover', `Apagar permanentemente o acesso de "${nome}"?`, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Apagar', style: 'destructive', onPress: async () => { await api.delete(`/api/usuarios/${id}`); carregarUsuarios(); } }
    ]);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      <View style={styles.header}>
          <Text style={{ fontSize: 18, fontWeight: '900', color: theme.textMain }}>Gestão de Acessos</Text>
          <TouchableOpacity style={[styles.btnNova, { backgroundColor: theme.primary }]} onPress={abrirNovo}>
            <MaterialCommunityIcons name="plus-circle" size={18} color="#fff" />
            <Text style={styles.btnNovaText}>Novo Acesso</Text>
          </TouchableOpacity>
      </View>

      <FlatList
        data={usuarios}
        keyExtractor={i => i.id.toString()}
        renderItem={({item}) => {
          let tituloAmigavel = 'Administrador do Sistema';
          let iconName = 'shield-account';
          if (item.role === 'MANUTENCAO') { tituloAmigavel = `Técnico: ${item.nome_tecnico}`; iconName = 'tools'; }
          else if (item.nome_gerente) { tituloAmigavel = `Gerente: ${item.nome_gerente}`; iconName = 'tie'; }
          else if (item.nome_coordenador) { tituloAmigavel = `Coord: ${item.nome_coordenador}`; iconName = 'account-tie'; }

          return (
            <View style={[styles.card, { backgroundColor: theme.card }]}>
              <View style={{flexDirection: 'row', alignItems: 'center', marginBottom: 8}}>
                  <MaterialCommunityIcons name={iconName} size={20} color={theme.primary} style={{marginRight: 8}}/>
                  <Text style={[styles.cardTitle, { color: theme.textMain }]} numberOfLines={1}>{tituloAmigavel}</Text>
              </View>
              
              <Text style={{ color: theme.textMuted, fontSize: 13, marginBottom: 2 }}>
                <Text style={{fontWeight: 'bold'}}>Login:</Text> {item.usuario}
              </Text>
              <Text style={{ color: theme.textMuted, fontSize: 13 }}>
                <Text style={{fontWeight: 'bold'}}>Unidade:</Text> {item.filial}
              </Text>

              <View style={[styles.actions, { borderTopColor: theme.border }]}>
                <TouchableOpacity style={[styles.actionBtn, {borderColor: theme.border}]} onPress={() => abrirEdicao(item)}>
                  <MaterialCommunityIcons name="pencil" size={20} color={theme.primary}/>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.actionBtn, {borderColor: theme.border}]} onPress={() => deletar(item.id, item.usuario)}>
                  <MaterialCommunityIcons name="delete" size={20} color={theme.danger}/>
                </TouchableOpacity>
              </View>
            </View>
          );
        }}
      />

      <Modal visible={modalVisible} transparent animationType="slide">
         <View style={styles.modalContainer}>
            <View style={[styles.modalContent, { backgroundColor: theme.card, borderColor: theme.border }]}>
               
               <Text style={[styles.modalTitle, { color: theme.textMain }]}>{form.id ? 'Editar Acesso' : 'Registar Acesso'}</Text>
               
               <ScrollView style={{maxHeight: '82%', marginTop: 15}} showsVerticalScrollIndicator={false}>
                 
                 <Text style={styles.label}>1. Tipo de Perfil</Text>
                 <View style={{flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20}}>
                    {['GERENTE', 'COORDENADOR', 'TECNICO', 'ADMIN'].map(tipo => {
                        const labels = { 'GERENTE': 'Gerente de Loja', 'COORDENADOR': 'Coordenador', 'TECNICO': 'Manutenção', 'ADMIN': 'Admin. Master' };
                        return (
                          <TouchableOpacity 
                            key={tipo} 
                            onPress={() => lidarMudancaPerfil(tipo)} 
                            style={[styles.chipPerfil, form.id && tipoPerfil !== tipo && {opacity: 0.5}, tipoPerfil === tipo ? { backgroundColor: theme.primary, borderColor: theme.primary } : { borderColor: theme.border }]}
                            disabled={!!form.id} // Impede mudar o tipo base ao editar (mesma regra da web)
                          >
                              <Text style={{ color: tipoPerfil === tipo ? '#fff' : theme.textMuted, fontSize: 12, fontWeight: 'bold' }}>{labels[tipo]}</Text>
                          </TouchableOpacity>
                        );
                    })}
                 </View>

                 {/* CAMPOS CONDICIONAIS COM BASE NO BOTÃO CLICADO */}
                 {tipoPerfil === 'GERENTE' && (
                   <View style={styles.inputBox}>
                     <Text style={styles.label}>Nome Completo do Gerente</Text>
                     <TextInput style={[styles.input, { color: theme.textMain, borderColor: theme.border, backgroundColor: theme.bg }]} value={form.nome_gerente} onChangeText={t => setForm({...form, nome_gerente: t})} placeholder="Ex: Carlos Silva" />
                   </View>
                 )}

                 {tipoPerfil === 'COORDENADOR' && (
                   <View style={styles.inputBox}>
                     <Text style={styles.label}>Nome Completo do Coordenador</Text>
                     <TextInput style={[styles.input, { color: theme.textMain, borderColor: theme.border, backgroundColor: theme.bg }]} value={form.nome_coordenador} onChangeText={t => setForm({...form, nome_coordenador: t})} placeholder="Ex: Ana Souza" />
                   </View>
                 )}

                 {tipoPerfil === 'TECNICO' && (
                   <View style={styles.inputBox}>
                     <Text style={styles.label}>Nome Completo do Técnico</Text>
                     <TextInput style={[styles.input, { color: theme.textMain, borderColor: theme.border, backgroundColor: theme.bg }]} value={form.nome_tecnico} onChangeText={t => setForm({...form, nome_tecnico: t})} placeholder="Ex: Roberto Almeida" />
                   </View>
                 )}

                 {(tipoPerfil === 'GERENTE' || tipoPerfil === 'COORDENADOR') && (
                   <View style={styles.inputBox}>
                     <Text style={styles.label}>Vínculo da Unidade Física</Text>
                     <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        {(filiaisDb || []).map(f => (
                            <TouchableOpacity key={f} onPress={() => setForm({...form, filial: f})} style={[styles.chip, form.filial === f && { backgroundColor: theme.textMain, borderColor: theme.textMain }]}>
                                <Text style={{ color: form.filial === f ? theme.bg : theme.textMuted, fontSize: 12, fontWeight: 'bold' }}>{f}</Text>
                            </TouchableOpacity>
                        ))}
                     </ScrollView>
                   </View>
                 )}

                 <View style={styles.separator} />

                 <Text style={styles.label}>Credencial de Login</Text>
                 <TextInput style={[styles.input, { color: theme.textMain, borderColor: theme.border, backgroundColor: theme.bg }]} value={form.usuario} onChangeText={t => setForm({...form, usuario: t})} placeholder="ex: carlos.gerente" autoCapitalize="none" autoCorrect={false} />
                 
                 <Text style={styles.label}>Palavra-passe {form.id && '(Preencha apenas se quiser alterar)'}</Text>
                 <TextInput style={[styles.input, { color: theme.textMain, borderColor: theme.border, backgroundColor: theme.bg }]} secureTextEntry value={form.senha} onChangeText={t => setForm({...form, senha: t})} placeholder="••••••••" autoCapitalize="none" />

               </ScrollView>

               <View style={styles.modalActions}>
                 <TouchableOpacity style={styles.btnCancel} onPress={() => setModalVisible(false)}><Text style={{color: theme.textMuted, fontWeight: 'bold'}}>Cancelar</Text></TouchableOpacity>
                 <TouchableOpacity style={[styles.btnSave, {backgroundColor: theme.primary}]} onPress={salvar}>
                   <MaterialCommunityIcons name="content-save" size={18} color="#fff" style={{marginRight: 6}}/>
                   <Text style={{color:'#fff', fontWeight:'bold'}}>Salvar Acesso</Text>
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
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  btnNova: { flexDirection: 'row', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, alignItems:'center' },
  btnNovaText: { color: '#fff', fontWeight: 'bold', marginLeft: 6, fontSize: 13 },
  card: { padding: 18, borderRadius: 12, marginBottom: 15, elevation: 2 },
  cardTitle: { fontSize: 16, fontWeight: '900', flexShrink: 1 },
  actions: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 15, borderTopWidth: 1, paddingTop: 15, gap: 12 },
  actionBtn: { padding: 8, borderWidth: 1, borderRadius: 8 },
  
  modalContainer: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', padding: 15 },
  modalContent: { padding: 20, borderRadius: 16, borderWidth: 1 },
  modalTitle: { fontSize: 18, fontWeight: '900' },
  
  label: { fontSize: 12, fontWeight: 'bold', color: '#64748b', marginBottom: 6 },
  inputBox: { marginBottom: 15 },
  input: { borderWidth: 1, borderRadius: 8, padding: 12, marginBottom: 15, fontSize: 14 },
  
  chipPerfil: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, borderWidth: 1 },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: '#e2e8f0', marginRight: 8 },
  
  separator: { height: 1, backgroundColor: 'rgba(0,0,0,0.1)', marginVertical: 10, marginBottom: 20 },
  
  modalActions: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 10, gap: 10, borderTopWidth: 1, borderColor: 'rgba(0,0,0,0.1)', paddingTop: 15 },
  btnCancel: { padding: 12 },
  btnSave: { paddingVertical: 12, paddingHorizontal: 16, borderRadius: 8, flexDirection: 'row', alignItems: 'center' }
});