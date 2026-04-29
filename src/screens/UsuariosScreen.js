import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useContext, useState } from 'react';
import { Alert, KeyboardAvoidingView, Modal, Platform, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { AppContext } from '../context/AppContext';

export default function UsuariosScreen({ navigation }) {
  const { api, filiaisDb, isOffline } = useContext(AppContext);
  
  // Usamos um array vazio caso o context ainda não tenha os utilizadores carregados
  const usuariosLista = []; // Substituir por `usuariosLista` do Contexto se já o tiveres no AppContext
  const carregarUsuarios = () => {}; // Função do context

  const formInicialUsuario = { id: '', usuario: '', senha: '', role: 'LOJA', filial: '', tipo_acesso: 'GERENTE', nome_identidade: '' };
  const [formUsuario, setFormUsuario] = useState({ ...formInicialUsuario });
  const [modalUsuario, setModalUsuario] = useState(false);

  const abrirModalUsuario = (tipoAcesso) => {
    let roleTarget = 'LOJA'; 
    if (tipoAcesso === 'TECNICO') roleTarget = 'MANUTENCAO'; 
    if (tipoAcesso === 'OUTROS') roleTarget = 'ADMIN';
    
    setFormUsuario({ id: '', usuario: '', senha: '', role: roleTarget, filial: '', tipo_acesso: tipoAcesso, nome_identidade: '' }); 
    setModalUsuario(true);
  };

  const salvarUsuario = async () => {
    if (isOffline) return alert('Ação bloqueada offline.');
    if (!formUsuario.usuario) return alert('O Login é obrigatório!');
    if (!formUsuario.id && !formUsuario.senha) return alert('A senha é obrigatória para novos utilizadores!');

    try {
      const payload = { 
        usuario: formUsuario.usuario, 
        senha: formUsuario.senha, 
        role: formUsuario.role, 
        filial: formUsuario.role !== 'LOJA' ? 'Todas' : formUsuario.filial, 
        nome_gerente: formUsuario.tipo_acesso === 'GERENTE' ? formUsuario.nome_identidade : null,
        nome_coordenador: formUsuario.tipo_acesso === 'COORDENADOR' ? formUsuario.nome_identidade : null,
        nome_tecnico: formUsuario.role === 'MANUTENCAO' ? formUsuario.nome_identidade : null
      };

      if (formUsuario.id) {
        if (!payload.senha) delete payload.senha; 
        await api.put(`/usuarios/${formUsuario.id}`, payload);
        alert('Credenciais atualizadas!');
      } else {
        await api.post('/usuarios', payload);
        alert('Novo utilizador autorizado!');
      }
      setModalUsuario(false);
      carregarUsuarios();
    } catch (err) {
      alert('Erro. Verifique se o login já existe.');
    }
  };

  const pedirExclusaoUsuario = (id, nome) => {
    Alert.alert(
      "Revogar Acesso",
      `Tem a certeza que deseja remover o utilizador "${nome}" permanentemente?`,
      [
        { text: "Cancelar", style: "cancel" },
        { text: "Remover", style: "destructive", onPress: async () => {
            try { 
              await api.delete(`/usuarios/${id}`); 
              alert('Acesso revogado.'); 
              carregarUsuarios(); 
            } catch (e) { alert('Erro ao remover o utilizador.'); }
          }
        }
      ]
    );
  };

  const modalHeaderInfo = (() => {
    if (formUsuario.role === 'ADMIN') return { title: 'Administrador Root', icon: 'shield-account', color: '#8b5cf6' };
    if (formUsuario.role === 'MANUTENCAO') return { title: 'Técnico de Manutenção', icon: 'wrench', color: '#3b82f6' };
    return { title: 'Gestão de Loja', icon: 'storefront', color: '#10b981' };
  })();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.openDrawer()} style={{ padding: 5 }}>
          <Ionicons name="menu" size={28} color="#059669" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Controlo de Acessos</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView contentContainerStyle={styles.listContainer}>
        
        {/* Carrossel de Ações de Criação */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.actionCarousel}>
          <TouchableOpacity style={[styles.actionCard, { borderLeftColor: '#10b981' }]} onPress={() => abrirModalUsuario('GERENTE')}>
            <View style={[styles.actionIconBox, { backgroundColor: 'rgba(16, 185, 129, 0.15)' }]}>
              <MaterialCommunityIcons name="store" size={24} color="#10b981" />
            </View>
            <View>
              <Text style={styles.actionTitle}>Gerência de Loja</Text>
              <Text style={styles.actionSub}>Atribuir a uma filial</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.actionCard, { borderLeftColor: '#3b82f6' }]} onPress={() => abrirModalUsuario('TECNICO')}>
            <View style={[styles.actionIconBox, { backgroundColor: 'rgba(59, 130, 246, 0.15)' }]}>
              <MaterialCommunityIcons name="wrench" size={24} color="#3b82f6" />
            </View>
            <View>
              <Text style={styles.actionTitle}>Equipa Técnica</Text>
              <Text style={styles.actionSub}>Manutenção Global</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.actionCard, { borderLeftColor: '#8b5cf6' }]} onPress={() => abrirModalUsuario('OUTROS')}>
            <View style={[styles.actionIconBox, { backgroundColor: 'rgba(139, 92, 246, 0.15)' }]}>
              <MaterialCommunityIcons name="shield-alert" size={24} color="#8b5cf6" />
            </View>
            <View>
              <Text style={styles.actionTitle}>Root / Admin</Text>
              <Text style={styles.actionSub}>Acesso total ao sistema</Text>
            </View>
          </TouchableOpacity>
        </ScrollView>

        {/* Lista de Utilizadores */}
        {usuariosLista.length === 0 ? (
          <View style={styles.emptyState}>
            <MaterialCommunityIcons name="account-group" size={64} color="#059669" style={{ opacity: 0.5 }} />
            <Text style={styles.emptyTitle}>Gestão de Acessos</Text>
            <Text style={styles.emptySub}>A carregar utilizadores do sistema...</Text>
          </View>
        ) : (
          usuariosLista.map(u => {
            const identidade = u.nome_gerente || u.nome_coordenador || u.nome_tecnico || 'Equipe / Indefinido';
            const inicial = identidade !== 'Equipe / Indefinido' ? identidade.charAt(0).toUpperCase() : u.usuario.charAt(0).toUpperCase();
            
            let roleBadge = { text: 'Operação Loja', color: '#10b981', bg: 'rgba(16, 185, 129, 0.1)' };
            if (u.role === 'ADMIN') roleBadge = { text: 'Admin / Root', color: '#8b5cf6', bg: 'rgba(139, 92, 246, 0.1)' };
            else if (u.role === 'MANUTENCAO') roleBadge = { text: 'Manutenção', color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.1)' };

            return (
              <View key={u.id} style={styles.userCard}>
                <View style={styles.userHeader}>
                  <View style={styles.userProfileBox}>
                    <View style={[styles.userAvatar, { backgroundColor: roleBadge.color }]}>
                      <Text style={styles.userAvatarText}>{inicial}</Text>
                    </View>
                    <View style={styles.userDetails}>
                      <Text style={styles.userIdentity}>{identidade}</Text>
                      <Text style={styles.userLogin}>@{u.usuario}</Text>
                    </View>
                  </View>
                  <View style={styles.userActions}>
                    <TouchableOpacity style={styles.btnEdit} onPress={() => {
                        let tipoAcesso = 'GERENTE'; if(u.role === 'ADMIN') tipoAcesso = 'OUTROS'; if(u.role === 'MANUTENCAO') tipoAcesso = 'TECNICO';
                        setFormUsuario({ id: u.id, usuario: u.usuario, senha: '', role: u.role, filial: u.filial || '', tipo_acesso: tipoAcesso, nome_identidade: identidade === 'Equipe / Indefinido' ? '' : identidade });
                        setModalUsuario(true);
                      }}>
                      <MaterialCommunityIcons name="pencil" size={18} color="#3b82f6" />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.btnDelete} onPress={() => pedirExclusaoUsuario(u.id, u.usuario)}>
                      <MaterialCommunityIcons name="close" size={18} color="#ef4444" />
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={styles.userMeta}>
                  <View style={[styles.roleBadge, { backgroundColor: roleBadge.bg, borderColor: roleBadge.color }]}>
                    <Text style={[styles.roleBadgeText, { color: roleBadge.color }]}>{roleBadge.text}</Text>
                  </View>
                  
                  {u.role === 'LOJA' ? (
                    <View style={styles.filialInfo}>
                      <MaterialCommunityIcons name="map-marker-outline" size={14} color="#64748b" />
                      <Text style={styles.filialText}>{u.filial || 'Sem Filial'}</Text>
                    </View>
                  ) : (
                    <View style={styles.filialInfo}>
                      <MaterialCommunityIcons name="web" size={14} color="#64748b" />
                      <Text style={styles.filialText}>Rede Global</Text>
                    </View>
                  )}
                </View>
              </View>
            );
          })
        )}
      </ScrollView>

      {/* MODAL DE CRIAÇÃO/EDIÇÃO */}
      <Modal visible={modalUsuario} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.modalContent}>
            <View style={styles.modalHeaderLine}>
              <MaterialCommunityIcons name={modalHeaderInfo.icon} size={24} color={modalHeaderInfo.color} style={{ marginRight: 10 }}/>
              <Text style={styles.modalTitle}>{formUsuario.id ? 'Atualizar Acesso' : 'Nova Autorização'}</Text>
            </View>

            <Text style={styles.modalSubtitle}>{modalHeaderInfo.title}</Text>

            <ScrollView style={{ maxHeight: 400 }} showsVerticalScrollIndicator={false}>
              
              <Text style={styles.inputLabel}>Nome do Colaborador (Opcional)</Text>
              <TextInput style={styles.input} placeholder="Ex: João Silva" value={formUsuario.nome_identidade} onChangeText={t => setFormUsuario({...formUsuario, nome_identidade: t})} />

              {formUsuario.role === 'LOJA' && (
                <>
                  <Text style={styles.inputLabel}>Atribuição da Filial Física</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filiaisScroll}>
                    {(filiaisDb || []).map(f => (
                      <TouchableOpacity key={f} style={[styles.filialChip, formUsuario.filial === f && styles.filialChipActive]} onPress={() => setFormUsuario({...formUsuario, filial: f})}>
                        <Text style={[styles.filialChipText, formUsuario.filial === f && styles.filialChipTextActive]}>{f}</Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>

                  <Text style={styles.inputLabel}>Nível de Gestão</Text>
                  <View style={styles.radioGroup}>
                    <TouchableOpacity style={[styles.radioBtn, formUsuario.tipo_acesso === 'GERENTE' && styles.radioActive]} onPress={() => setFormUsuario({...formUsuario, tipo_acesso: 'GERENTE'})}>
                      <Text style={[styles.radioText, formUsuario.tipo_acesso === 'GERENTE' && styles.radioTextActive]}>Gerente</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.radioBtn, formUsuario.tipo_acesso === 'COORDENADOR' && styles.radioActive]} onPress={() => setFormUsuario({...formUsuario, tipo_acesso: 'COORDENADOR'})}>
                      <Text style={[styles.radioText, formUsuario.tipo_acesso === 'COORDENADOR' && styles.radioTextActive]}>Coordenador</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.radioBtn, formUsuario.tipo_acesso === 'OUTROS' && styles.radioActive]} onPress={() => setFormUsuario({...formUsuario, tipo_acesso: 'OUTROS'})}>
                      <Text style={[styles.radioText, formUsuario.tipo_acesso === 'OUTROS' && styles.radioTextActive]}>Operador Base</Text>
                    </TouchableOpacity>
                  </View>
                </>
              )}

              <Text style={styles.inputLabel}>Nome de Utilizador (Login)</Text>
              <TextInput style={styles.input} placeholder="Ex: joao.silva" autoCapitalize="none" value={formUsuario.usuario} onChangeText={t => setFormUsuario({...formUsuario, usuario: t})} />

              <Text style={styles.inputLabel}>Senha de Segurança {formUsuario.id ? '(Deixe vazio para manter)' : ''}</Text>
              <TextInput style={styles.input} placeholder="********" secureTextEntry value={formUsuario.senha} onChangeText={t => setFormUsuario({...formUsuario, senha: t})} />

            </ScrollView>

            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.btnCancel} onPress={() => setModalUsuario(false)}><Text style={styles.btnCancelText}>Cancelar</Text></TouchableOpacity>
              <TouchableOpacity style={[styles.btnConfirm, { backgroundColor: modalHeaderInfo.color }]} onPress={salvarUsuario}>
                <MaterialCommunityIcons name="content-save" size={18} color="#fff" style={{marginRight: 6}}/>
                <Text style={styles.btnConfirmText}>Salvar Credencial</Text>
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 15, backgroundColor: '#fff', borderBottomWidth: 1, borderColor: '#e2e8f0', paddingTop: Platform.OS === 'ios' ? 50 : 15 },
  headerTitle: { fontSize: 18, fontWeight: '900', color: '#0f172a' },
  listContainer: { paddingBottom: 40 },
  
  actionCarousel: { padding: 15, gap: 15, paddingRight: 30 },
  actionCard: { backgroundColor: '#fff', padding: 15, borderRadius: 16, borderLeftWidth: 4, minWidth: 200, flexDirection: 'row', alignItems: 'center', gap: 12, elevation: 3, shadowColor: '#000', shadowOffset: {width: 0, height: 2}, shadowOpacity: 0.05 },
  actionIconBox: { padding: 10, borderRadius: 12 },
  actionTitle: { fontSize: 15, fontWeight: '900', color: '#0f172a' },
  actionSub: { fontSize: 11, color: '#64748b', fontWeight: '600' },

  emptyState: { alignItems: 'center', justifyContent: 'center', paddingVertical: 60 },
  emptyTitle: { fontSize: 18, fontWeight: '900', color: '#0f172a', marginTop: 15 },
  emptySub: { fontSize: 14, color: '#64748b', textAlign: 'center', marginTop: 5, fontWeight: '500' },

  userCard: { backgroundColor: '#fff', marginHorizontal: 15, marginBottom: 15, borderRadius: 16, padding: 15, elevation: 2, shadowColor: '#000', shadowOffset: {width: 0, height: 2}, shadowOpacity: 0.05, borderWidth: 1, borderColor: '#f1f5f9' },
  userHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 15, borderBottomWidth: 1, borderColor: '#f1f5f9', paddingBottom: 15 },
  userProfileBox: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  userAvatar: { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center', elevation: 2 },
  userAvatarText: { color: '#fff', fontSize: 18, fontWeight: '900' },
  userDetails: { flex: 1 },
  userIdentity: { fontSize: 16, fontWeight: '900', color: '#0f172a' },
  userLogin: { fontSize: 12, color: '#64748b', fontWeight: '700' },
  
  userActions: { flexDirection: 'row', gap: 8 },
  btnEdit: { backgroundColor: 'rgba(59, 130, 246, 0.08)', padding: 8, borderRadius: 8 },
  btnDelete: { backgroundColor: 'rgba(239, 68, 68, 0.08)', padding: 8, borderRadius: 8 },

  userMeta: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  roleBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, borderWidth: 1 },
  roleBadgeText: { fontSize: 11, fontWeight: '800', textTransform: 'uppercase' },
  filialInfo: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  filialText: { fontSize: 12, color: '#64748b', fontWeight: '700' },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 25, paddingBottom: Platform.OS === 'ios' ? 40 : 25 },
  modalHeaderLine: { flexDirection: 'row', alignItems: 'center', marginBottom: 5 },
  modalTitle: { fontSize: 20, fontWeight: '900', color: '#0f172a' },
  modalSubtitle: { fontSize: 13, color: '#64748b', fontWeight: '600', marginBottom: 20, textTransform: 'uppercase' },
  
  inputLabel: { fontSize: 12, fontWeight: '800', color: '#64748b', marginBottom: 6, marginTop: 10, textTransform: 'uppercase' },
  input: { backgroundColor: '#f1f5f9', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 12, padding: 15, color: '#0f172a', fontWeight: '600', marginBottom: 5 },
  
  filiaisScroll: { flexDirection: 'row', marginBottom: 5 },
  filialChip: { backgroundColor: '#f1f5f9', borderWidth: 1, borderColor: '#e2e8f0', paddingHorizontal: 15, paddingVertical: 8, borderRadius: 20, marginRight: 10 },
  filialChipActive: { backgroundColor: '#059669', borderColor: '#059669' },
  filialChipText: { color: '#64748b', fontWeight: '700', fontSize: 13 },
  filialChipTextActive: { color: '#fff' },

  radioGroup: { flexDirection: 'row', gap: 10, marginBottom: 5, flexWrap: 'wrap' },
  radioBtn: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, borderWidth: 1, borderColor: '#e2e8f0', backgroundColor: '#f8fafc' },
  radioActive: { borderColor: '#10b981', backgroundColor: 'rgba(16, 185, 129, 0.1)' },
  radioText: { fontSize: 13, color: '#64748b', fontWeight: '700' },
  radioTextActive: { color: '#10b981' },

  modalActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 10, marginTop: 20 },
  btnCancel: { padding: 14, borderRadius: 12 },
  btnCancelText: { color: '#64748b', fontWeight: '800' },
  btnConfirm: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 24, paddingVertical: 14, borderRadius: 12, elevation: 2 },
  btnConfirmText: { color: '#fff', fontWeight: '900' }
});