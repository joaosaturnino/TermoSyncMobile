import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useContext, useState } from 'react';
import { KeyboardAvoidingView, Modal, Platform, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { AppContext } from '../context/AppContext';

export default function GestaoLojasScreen({ navigation }) {
  const { filiaisDb, api, carregarDashboard } = useContext(AppContext);
  
  const [modalLoja, setModalLoja] = useState(false);
  const [formLoja, setFormLoja] = useState({ nome: '', endereco_loja: '', telefone_loja: '' });

  // Como o filiaisDb no teu AppContext apenas guarda os Nomes das lojas, criamos um mock visual premium:
  const lojasFormatadas = (filiaisDb || []).map((nomeLoja, i) => ({
    id: i, nome: nomeLoja, endereco: 'Endereço em atualização...', telefone: 'N/A',
    nome_gerente: 'Pendente', nome_coordenador: 'Pendente'
  }));

  const salvarLoja = async () => {
    if (!formLoja.nome) return alert('O nome da loja é obrigatório.');
    try {
      await api.post('/lojas', formLoja);
      setModalLoja(false);
      carregarDashboard();
      alert('Loja cadastrada com sucesso!');
    } catch(err) { alert('Erro ao cadastrar loja.'); }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.openDrawer()} style={{ padding: 5 }}>
          <Ionicons name="menu" size={28} color="#059669" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Gestão de Lojas</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView contentContainerStyle={styles.listContainer}>
        
        <View style={styles.topActions}>
          <TouchableOpacity style={styles.btnNewStore} onPress={() => { setFormLoja({nome:'', endereco_loja:'', telefone_loja:''}); setModalLoja(true); }}>
            <MaterialCommunityIcons name="store-plus" size={20} color="#fff" />
            <Text style={styles.btnNewStoreText}>Cadastrar Nova Loja</Text>
          </TouchableOpacity>
        </View>

        {lojasFormatadas.length === 0 ? (
          <View style={styles.emptyState}>
            <MaterialCommunityIcons name="domain" size={64} color="#059669" style={{ opacity: 0.5 }} />
            <Text style={styles.emptyTitle}>Nenhuma Loja Registada</Text>
            <Text style={styles.emptySub}>Adiciona a primeira filial ao sistema.</Text>
          </View>
        ) : (
          lojasFormatadas.map((loja, idx) => (
            <View key={idx} style={styles.lojaCard}>
              <View style={styles.lojaHeader}>
                <View style={styles.lojaTitleBox}>
                  <View style={styles.iconBox}><MaterialCommunityIcons name="storefront" size={22} color="#059669" /></View>
                  <Text style={styles.lojaName}>{loja.nome}</Text>
                </View>
                <TouchableOpacity style={styles.btnEdit}><MaterialCommunityIcons name="pencil" size={18} color="#3b82f6" /></TouchableOpacity>
              </View>

              <View style={styles.leadershipBox}>
                <View style={styles.leaderBadgeManager}>
                  <MaterialCommunityIcons name="account-tie" size={14} color="#10b981" />
                  <Text style={styles.leaderTextManager}>Gerente: {loja.nome_gerente}</Text>
                </View>
                <View style={styles.leaderBadgeCoord}>
                  <MaterialCommunityIcons name="account-hard-hat" size={14} color="#38bdf8" />
                  <Text style={styles.leaderTextCoord}>Coord: {loja.nome_coordenador}</Text>
                </View>
              </View>

              <View style={styles.contactBox}>
                <View style={styles.contactLine}>
                  <Ionicons name="location" size={14} color="#64748b" />
                  <Text style={styles.contactText}>{loja.endereco}</Text>
                </View>
                <View style={styles.contactLine}>
                  <Ionicons name="call" size={14} color="#64748b" />
                  <Text style={styles.contactText}>{loja.telefone}</Text>
                </View>
              </View>
            </View>
          ))
        )}
      </ScrollView>

      {/* Modal Nova Loja */}
      <Modal visible={modalLoja} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.modalContent}>
            <Text style={styles.modalTitle}><MaterialCommunityIcons name="store" size={22} color="#059669" /> Registar Filial</Text>
            
            <Text style={styles.inputLabel}>Nome Comercial</Text>
            <TextInput style={styles.input} placeholder="Ex: Supermercado Central" value={formLoja.nome} onChangeText={t => setFormLoja({...formLoja, nome: t})} />
            
            <Text style={styles.inputLabel}>Endereço Completo</Text>
            <TextInput style={styles.input} placeholder="Rua, Número, Cidade" value={formLoja.endereco_loja} onChangeText={t => setFormLoja({...formLoja, endereco_loja: t})} />
            
            <Text style={styles.inputLabel}>Contato Telefónico</Text>
            <TextInput style={styles.input} placeholder="Ex: 210 000 000" keyboardType="phone-pad" value={formLoja.telefone_loja} onChangeText={t => setFormLoja({...formLoja, telefone_loja: t})} />
            
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.btnCancel} onPress={() => setModalLoja(false)}><Text style={styles.btnCancelText}>Cancelar</Text></TouchableOpacity>
              <TouchableOpacity style={styles.btnConfirm} onPress={salvarLoja}><Text style={styles.btnConfirmText}>Cadastrar</Text></TouchableOpacity>
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
  listContainer: { padding: 15, paddingBottom: 40 },
  
  topActions: { flexDirection: 'row', justifyContent: 'flex-end', marginBottom: 20 },
  btnNewStore: { backgroundColor: '#059669', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, borderRadius: 12, gap: 8, elevation: 3 },
  btnNewStoreText: { color: '#fff', fontWeight: '900', fontSize: 14 },

  emptyState: { alignItems: 'center', justifyContent: 'center', paddingVertical: 60 },
  emptyTitle: { fontSize: 18, fontWeight: '900', color: '#0f172a', marginTop: 15 },
  emptySub: { fontSize: 14, color: '#64748b', textAlign: 'center', marginTop: 5, fontWeight: '500' },

  lojaCard: { backgroundColor: '#fff', borderRadius: 16, padding: 20, marginBottom: 15, elevation: 2, shadowColor: '#000', shadowOffset: {width: 0, height: 2}, shadowOpacity: 0.05, borderWidth: 1, borderColor: '#f1f5f9' },
  lojaHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15, paddingBottom: 15, borderBottomWidth: 1, borderColor: '#f1f5f9' },
  lojaTitleBox: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  iconBox: { backgroundColor: 'rgba(5, 150, 105, 0.1)', padding: 10, borderRadius: 12 },
  lojaName: { fontSize: 17, fontWeight: '900', color: '#0f172a' },
  btnEdit: { backgroundColor: 'rgba(59, 130, 246, 0.08)', padding: 8, borderRadius: 8 },
  
  leadershipBox: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 15 },
  leaderBadgeManager: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(16, 185, 129, 0.1)', borderWidth: 1, borderColor: 'rgba(16, 185, 129, 0.2)', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 },
  leaderTextManager: { fontSize: 11, fontWeight: '800', color: '#10b981' },
  leaderBadgeCoord: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(56, 189, 248, 0.1)', borderWidth: 1, borderColor: 'rgba(56, 189, 248, 0.2)', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 },
  leaderTextCoord: { fontSize: 11, fontWeight: '800', color: '#38bdf8' },
  
  contactBox: { gap: 8, backgroundColor: '#f8fafc', padding: 12, borderRadius: 10 },
  contactLine: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  contactText: { fontSize: 13, color: '#475569', fontWeight: '600' },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 25, paddingBottom: Platform.OS === 'ios' ? 40 : 25 },
  modalTitle: { fontSize: 20, fontWeight: '900', color: '#0f172a', marginBottom: 20 },
  inputLabel: { fontSize: 12, fontWeight: '800', color: '#64748b', marginBottom: 6, textTransform: 'uppercase' },
  input: { backgroundColor: '#f1f5f9', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 12, padding: 15, marginBottom: 15, color: '#0f172a', fontWeight: '600' },
  modalActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 10, marginTop: 10 },
  btnCancel: { padding: 14, borderRadius: 12 },
  btnCancelText: { color: '#64748b', fontWeight: '800' },
  btnConfirm: { backgroundColor: '#059669', paddingHorizontal: 24, paddingVertical: 14, borderRadius: 12, elevation: 2 },
  btnConfirmText: { color: '#fff', fontWeight: '900' }
});