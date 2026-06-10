import {
  Activity,
  Briefcase,
  Building2,
  Calendar,
  DownloadCloud,
  Edit,
  Globe,
  Mail,
  Phone,
  PlusCircle, RefreshCw,
  Save,
  Search,
  ShieldAlert, ShieldCheck,
  ToggleLeft, ToggleRight,
  Trash2,
  X
} from 'lucide-react-native';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator, Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import api from '../api/api';

export default function GestaoEmpresasScreen() {
  const [empresas, setEmpresas] = useState([]);
  const [busca, setBusca] = useState('');
  const [filtroStatus, setFiltroStatus] = useState('Todas');
  
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  
  const formInicial = { id: '', nome: '', cnpj: '', contato: '', email: '', status: 'Ativa' };
  const [form, setForm] = useState({ ...formInicial });
  const [modalAberto, setModalAberto] = useState(false);

  const carregarEmpresas = useCallback(async () => {
    try {
      const res = await api.get('/empresas');
      setEmpresas(Array.isArray(res.data) ? res.data : []);
    } catch (e) {
      Alert.alert('Erro', 'Falha na comunicação com o Hub de Organizações.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { carregarEmpresas(); }, [carregarEmpresas]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await carregarEmpresas();
    setTimeout(() => setIsRefreshing(false), 800);
  };

  const empresasFiltradas = useMemo(() => {
    const termo = busca.toLowerCase();
    return empresas.filter(e => {
      const matchBusca = e.nome?.toLowerCase().includes(termo) || e.cnpj?.toLowerCase().includes(termo);
      const matchStatus = filtroStatus === 'Todas' ? true : e.status === filtroStatus;
      return matchBusca && matchStatus;
    });
  }, [empresas, busca, filtroStatus]);

  const kpis = useMemo(() => {
    const total = empresas.length;
    const ativas = empresas.filter(e => e.status === 'Ativa').length;
    return { total, ativas, suspensas: total - ativas };
  }, [empresas]);

  const exportarParaCSV = () => {
    setIsExporting(true);
    setTimeout(() => {
      if (empresasFiltradas.length === 0) {
        Alert.alert('Aviso', 'Nenhum dado disponível na grid atual.');
        setIsExporting(false);
        return;
      }
      Alert.alert('Sucesso', 'Dump CSV extraído com sucesso (Simulação Mobile).');
      setIsExporting(false);
    }, 800);
  };

  const salvarEmpresa = async () => {
    if (!form.nome) return Alert.alert('Aviso', 'Razão Social é obrigatória.');
    setIsSubmitting(true);
    try {
      if (form.id) {
        await api.put(`/empresas/${form.id}`, form);
        Alert.alert('Sucesso', `Tenant "${form.nome}" atualizado.`);
      } else {
        await api.post('/empresas', form);
        Alert.alert('Sucesso', 'Novo Tenant provisionado no Cluster!');
      }
      setModalAberto(false);
      await carregarEmpresas();
    } catch (err) {
      Alert.alert('Erro', 'Erro ao gravar parâmetros no BD.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const alternarStatus = async (empresa) => {
    const novoStatus = empresa.status === 'Ativa' ? 'Suspensa' : 'Ativa';
    try {
      await api.put(`/empresas/${empresa.id}`, { ...empresa, status: novoStatus });
      Alert.alert('Status Alterado', `Lockdown do Tenant "${empresa.nome}" alterado para: ${novoStatus.toUpperCase()}.`);
      carregarEmpresas();
    } catch (err) {
      Alert.alert('Erro', 'Erro de permissão no IAM.');
    }
  };

  const pedirExclusao = (id, nome) => {
    Alert.alert(
      'Forçar Destruição de Tenant (DROP)',
      `CUIDADO: A purga do tenant "${nome}" invocará a remoção em cascata (CASCADE) no banco de dados. Confirmar?`,
      [
        { text: 'Abortar', style: 'cancel' },
        { text: 'Confirmar Purga', style: 'destructive', onPress: async () => {
            try {
              await api.delete(`/empresas/${id}`);
              Alert.alert('Sucesso', 'Tenant purgado da base de dados.');
              carregarEmpresas();
            } catch (e) {
              Alert.alert('Erro', 'Erro restritivo (Foreign Key). Remova os nós IoT primeiro.');
            }
          }
        }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        {/* HEADER TÁTICO */}
        <View style={styles.headerCard}>
          <View style={styles.headerTitleRow}>
            <View style={styles.iconBoxPrimary}><Globe size={24} color="#fff" /></View>
            <View style={{ flex: 1 }}>
              <Text style={styles.headerTitle}>GESTÃO DE TENANTS</Text>
              <Text style={styles.headerSubtitle}>Administração Multi-Tenant SaaS.</Text>
            </View>
          </View>
          
          <View style={styles.searchBox}>
            <Search size={18} color="#94a3b8" />
            <TextInput 
              style={styles.searchInput} 
              placeholder="Procurar Tenant ou CNPJ..." 
              placeholderTextColor="#64748b"
              value={busca} 
              onChangeText={setBusca} 
            />
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filtersRow}>
            <TouchableOpacity style={[styles.filterBtn, filtroStatus === 'Todas' && styles.filterBtnActive]} onClick={() => setFiltroStatus('Todas')} onPress={() => setFiltroStatus('Todas')}>
              <Text style={[styles.filterBtnText, filtroStatus === 'Todas' && styles.filterBtnTextActive]}>TODOS</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.filterBtn, filtroStatus === 'Ativa' && styles.filterBtnActive]} onPress={() => setFiltroStatus('Ativa')}>
              <Text style={[styles.filterBtnText, filtroStatus === 'Ativa' && styles.filterBtnTextActive]}>🟢 ONLINE</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.filterBtn, filtroStatus === 'Suspensa' && styles.filterBtnActive]} onPress={() => setFiltroStatus('Suspensa')}>
              <Text style={[styles.filterBtnText, filtroStatus === 'Suspensa' && styles.filterBtnTextActive]}>🔴 LOCKDOWN</Text>
            </TouchableOpacity>
          </ScrollView>

          <View style={styles.actionsRow}>
            <TouchableOpacity style={styles.actionBtnOutline} onPress={exportarParaCSV} disabled={isExporting}>
              {isExporting ? <ActivityIndicator size="small" color="#38bdf8" /> : <DownloadCloud size={18} color="#cbd5e1" />}
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionBtnOutline} onPress={handleRefresh}>
              <RefreshCw size={18} color="#cbd5e1" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionBtnPrimary} onPress={() => { setForm({ ...formInicial }); setModalAberto(true); }}>
              <PlusCircle size={18} color="#fff" />
              <Text style={styles.actionBtnPrimaryText}>PROVISIONAR</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* KPI DASHBOARD (HUD) */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.kpiRow}>
          <View style={[styles.kpiCard, { borderTopColor: '#38bdf8' }]}>
            <View style={styles.kpiHeader}><Briefcase size={16} color="#38bdf8"/><Text style={styles.kpiTitle}>TENANTS</Text></View>
            <Text style={styles.kpiValue}>{isLoading ? '-' : kpis.total}</Text>
          </View>
          <View style={[styles.kpiCard, { borderTopColor: '#10b981' }]}>
            <View style={styles.kpiHeader}><ShieldCheck size={16} color="#10b981"/><Text style={styles.kpiTitle}>ONLINE (OK)</Text></View>
            <Text style={styles.kpiValue}>{isLoading ? '-' : kpis.ativas}</Text>
          </View>
          <View style={[styles.kpiCard, { borderTopColor: '#ef4444' }]}>
            <View style={styles.kpiHeader}><ShieldAlert size={16} color="#ef4444"/><Text style={styles.kpiTitle}>LOCKDOWN</Text></View>
            <Text style={styles.kpiValue}>{isLoading ? '-' : kpis.suspensas}</Text>
          </View>
        </ScrollView>

        {/* LISTA DE TENANTS (CARTÕES CYBER) */}
        {isLoading ? (
          <ActivityIndicator size="large" color="#10b981" style={{ marginTop: 40 }} />
        ) : empresasFiltradas.length > 0 ? (
          empresasFiltradas.map(emp => (
            <View key={emp.id} style={[styles.tenantCard, emp.status === 'Suspensa' && styles.tenantCardSuspended]}>
              <View style={styles.tenantHeader}>
                <View style={styles.tenantHeaderLeft}>
                  <View style={[styles.tenantIcon, emp.status === 'Suspensa' && styles.tenantIconSuspended]}>
                    <Building2 size={20} color={emp.status === 'Suspensa' ? '#ef4444' : '#10b981'} />
                  </View>
                  <View>
                    <Text style={styles.tenantName}>{emp.nome}</Text>
                    <Text style={styles.tenantCnpj}>{emp.cnpj || 'KEY: ISENTA_ESTRANGEIRA'}</Text>
                  </View>
                </View>
                <TouchableOpacity onPress={() => alternarStatus(emp)}>
                  {emp.status === 'Ativa' ? <ToggleRight size={32} color="#10b981"/> : <ToggleLeft size={32} color="#ef4444"/>}
                </TouchableOpacity>
              </View>

              <View style={styles.tenantBody}>
                <View style={styles.contactRow}><Phone size={12} color="#38bdf8"/><Text style={styles.contactText}>{emp.contato || 'Telefone offline'}</Text></View>
                <View style={styles.contactRow}><Mail size={12} color="#38bdf8"/><Text style={styles.contactText}>{emp.email || 'Email offline'}</Text></View>
                <View style={styles.contactRow}><Calendar size={12} color="#94a3b8"/><Text style={styles.contactText}>Deploy: {emp.data_cadastro ? new Date(emp.data_cadastro).toLocaleDateString('pt-BR') : 'N/A'}</Text></View>
              </View>

              <View style={styles.tenantFooter}>
                <View style={styles.slaBox}>
                   <View style={[styles.led, emp.status === 'Ativa' ? styles.ledOnline : styles.ledOffline]} />
                   <Text style={[styles.slaText, emp.status !== 'Ativa' && {color: '#ef4444'}]}>{emp.status === 'Ativa' ? '99.98% SLA' : 'FALHA NO SLA'}</Text>
                </View>
                <View style={styles.tenantActions}>
                  <TouchableOpacity style={styles.btnIcon} onPress={() => { setForm(emp); setModalAberto(true); }}><Edit size={16} color="#cbd5e1" /></TouchableOpacity>
                  <TouchableOpacity style={styles.btnIconDanger} onPress={() => pedirExclusao(emp.id, emp.nome)}><Trash2 size={16} color="#ef4444" /></TouchableOpacity>
                </View>
              </View>
            </View>
          ))
        ) : (
          <View style={styles.emptyState}>
            <Activity size={48} color="#334155" />
            <Text style={styles.emptyTitle}>QUERY VAZIA</Text>
            <Text style={styles.emptyDesc}>O filtro ({filtroStatus}) não retornou resultados no cluster.</Text>
          </View>
        )}
      </ScrollView>

      {/* MODAL DE PROVISIONAMENTO */}
      <Modal visible={modalAberto} animationType="slide" transparent={true}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{form.id ? 'PARAMETRIZAR TENANT' : 'NOVO PROVISIONAMENTO'}</Text>
              <TouchableOpacity onPress={() => setModalAberto(false)}><X size={24} color="#94a3b8" /></TouchableOpacity>
            </View>
            <ScrollView style={styles.modalBody}>
              <Text style={styles.inputLabel}>RAZÃO SOCIAL / NOME DE OPERAÇÃO *</Text>
              <TextInput style={styles.input} value={form.nome} onChangeText={t => setForm({...form, nome: t})} placeholder="Ex: TermoSync AWS S/A" placeholderTextColor="#64748b" />
              
              <Text style={styles.inputLabel}>IDENTIFICADOR FISCAL (CNPJ)</Text>
              <TextInput style={styles.input} value={form.cnpj} onChangeText={t => setForm({...form, cnpj: t})} placeholder="00.000.000/0001-00" placeholderTextColor="#64748b" />
              
              <Text style={styles.inputLabel}>HOTLINE (TELEFONE)</Text>
              <TextInput style={styles.input} value={form.contato} onChangeText={t => setForm({...form, contato: t})} placeholder="(00) 00000-0000" placeholderTextColor="#64748b" />
              
              <Text style={styles.inputLabel}>E-MAIL DE SERVIÇO (ADMIN)</Text>
              <TextInput style={styles.input} value={form.email} onChangeText={t => setForm({...form, email: t})} placeholder="admin@host.com" placeholderTextColor="#64748b" keyboardType="email-address" autoCapitalize="none" />
            </ScrollView>
            <View style={styles.modalFooter}>
              <TouchableOpacity style={styles.btnCancel} onPress={() => setModalAberto(false)} disabled={isSubmitting}>
                <Text style={styles.btnCancelText}>ABORTAR</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.btnSubmit} onPress={salvarEmpresa} disabled={isSubmitting}>
                {isSubmitting ? <ActivityIndicator size="small" color="#fff" /> : <Save size={18} color="#fff" />}
                <Text style={styles.btnSubmitText}>{form.id ? 'COMMIT (UPDATE)' : 'COMMIT (INSERT)'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#020617' },
  scrollContent: { padding: 16, paddingBottom: 40 },
  
  headerCard: { backgroundColor: '#0b1120', padding: 16, borderRadius: 16, borderWidth: 1, borderColor: '#1e293b', marginBottom: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.5, shadowRadius: 15, elevation: 10 },
  headerTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 },
  iconBoxPrimary: { width: 48, height: 48, borderRadius: 12, backgroundColor: '#10b981', alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '900', color: '#fff', letterSpacing: 0.5 },
  headerSubtitle: { fontSize: 12, color: '#94a3b8', fontWeight: '600', marginTop: 2 },
  
  searchBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#020617', borderWidth: 1, borderColor: '#1e293b', borderRadius: 10, paddingHorizontal: 12, height: 44, marginBottom: 12 },
  searchInput: { flex: 1, marginLeft: 8, color: '#fff', fontSize: 14, fontFamily: 'monospace' },
  
  filtersRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  filterBtn: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, backgroundColor: '#0f172a', borderWidth: 1, borderColor: '#1e293b' },
  filterBtnActive: { backgroundColor: 'rgba(16, 185, 129, 0.1)', borderColor: '#10b981' },
  filterBtnText: { color: '#94a3b8', fontSize: 12, fontWeight: 'bold' },
  filterBtnTextActive: { color: '#10b981' },
  
  actionsRow: { flexDirection: 'row', gap: 8 },
  actionBtnOutline: { width: 44, height: 44, borderRadius: 10, backgroundColor: '#0f172a', borderWidth: 1, borderColor: '#1e293b', alignItems: 'center', justifyContent: 'center' },
  actionBtnPrimary: { flex: 1, height: 44, borderRadius: 10, backgroundColor: '#10b981', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  actionBtnPrimaryText: { color: '#fff', fontWeight: '900', fontSize: 13, letterSpacing: 1 },

  kpiRow: { flexDirection: 'row', gap: 12, marginBottom: 20 },
  kpiCard: { width: 140, backgroundColor: '#0b1120', padding: 16, borderRadius: 12, borderWidth: 1, borderColor: '#1e293b', borderTopWidth: 3 },
  kpiHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 },
  kpiTitle: { fontSize: 10, fontWeight: 'bold', color: '#94a3b8', letterSpacing: 0.5 },
  kpiValue: { fontSize: 24, fontWeight: '900', color: '#fff', fontFamily: 'monospace' },

  tenantCard: { backgroundColor: '#0b1120', borderRadius: 16, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: '#1e293b', shadowColor: '#000', shadowOffset: {width: 0, height: 4}, shadowOpacity: 0.3, shadowRadius: 8, elevation: 5 },
  tenantCardSuspended: { backgroundColor: 'rgba(239, 68, 68, 0.05)', borderColor: 'rgba(239, 68, 68, 0.2)' },
  tenantHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
  tenantHeaderLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  tenantIcon: { width: 40, height: 40, borderRadius: 10, backgroundColor: 'rgba(16, 185, 129, 0.1)', borderWidth: 1, borderColor: 'rgba(16, 185, 129, 0.3)', alignItems: 'center', justifyContent: 'center' },
  tenantIconSuspended: { backgroundColor: 'rgba(239, 68, 68, 0.1)', borderColor: 'rgba(239, 68, 68, 0.3)' },
  tenantName: { fontSize: 15, fontWeight: 'bold', color: '#fff' },
  tenantCnpj: { fontSize: 11, color: '#38bdf8', fontFamily: 'monospace', marginTop: 2 },
  
  tenantBody: { gap: 6, marginBottom: 16, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: '#1e293b' },
  contactRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  contactText: { fontSize: 12, color: '#cbd5e1' },
  
  tenantFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  slaBox: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  led: { width: 8, height: 8, borderRadius: 4 },
  ledOnline: { backgroundColor: '#10b981', shadowColor: '#10b981', shadowOffset: {width:0, height:0}, shadowOpacity: 0.8, shadowRadius: 5, elevation: 2 },
  ledOffline: { backgroundColor: '#ef4444', shadowColor: '#ef4444', shadowOffset: {width:0, height:0}, shadowOpacity: 0.8, shadowRadius: 5, elevation: 2 },
  slaText: { fontSize: 11, fontWeight: 'bold', color: '#10b981', fontFamily: 'monospace' },
  
  tenantActions: { flexDirection: 'row', gap: 8 },
  btnIcon: { width: 36, height: 36, borderRadius: 8, backgroundColor: '#0f172a', borderWidth: 1, borderColor: '#1e293b', alignItems: 'center', justifyContent: 'center' },
  btnIconDanger: { width: 36, height: 36, borderRadius: 8, backgroundColor: 'rgba(239, 68, 68, 0.1)', borderWidth: 1, borderColor: 'rgba(239, 68, 68, 0.3)', alignItems: 'center', justifyContent: 'center' },

  emptyState: { alignItems: 'center', justifyContent: 'center', padding: 40, backgroundColor: '#0b1120', borderRadius: 16, borderWidth: 1, borderColor: '#1e293b', borderStyle: 'dashed' },
  emptyTitle: { color: '#fff', fontSize: 16, fontWeight: '900', marginTop: 16, letterSpacing: 1 },
  emptyDesc: { color: '#64748b', fontSize: 12, textAlign: 'center', marginTop: 8 },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(2, 6, 23, 0.8)', justifyContent: 'flex-end' },
  modalBox: { backgroundColor: '#0b1120', borderTopLeftRadius: 24, borderTopRightRadius: 24, borderTopWidth: 2, borderTopColor: '#10b981', maxHeight: '90%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: '#1e293b' },
  modalTitle: { color: '#fff', fontSize: 14, fontWeight: '900', letterSpacing: 1 },
  modalBody: { padding: 20 },
  inputLabel: { color: '#94a3b8', fontSize: 10, fontWeight: 'bold', marginBottom: 8, letterSpacing: 0.5 },
  input: { backgroundColor: '#020617', borderWidth: 1, borderColor: '#1e293b', borderRadius: 10, color: '#fff', paddingHorizontal: 16, height: 48, marginBottom: 20, fontFamily: 'monospace' },
  modalFooter: { flexDirection: 'row', padding: 20, borderTopWidth: 1, borderTopColor: '#1e293b', gap: 12 },
  btnCancel: { flex: 1, height: 50, borderRadius: 10, borderWidth: 1, borderColor: '#334155', alignItems: 'center', justifyContent: 'center' },
  btnCancelText: { color: '#94a3b8', fontWeight: 'bold', fontSize: 12, letterSpacing: 1 },
  btnSubmit: { flex: 2, height: 50, borderRadius: 10, backgroundColor: '#10b981', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  btnSubmitText: { color: '#fff', fontWeight: 'bold', fontSize: 12, letterSpacing: 1 }
});