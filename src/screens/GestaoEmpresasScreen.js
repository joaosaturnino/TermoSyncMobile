import axios from 'axios';
import { Building2, Globe, ToggleLeft, ToggleRight } from 'lucide-react-native';
import { useCallback, useEffect, useState } from 'react';
import { Alert, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const theme = { bg: '#020617', card: '#0f172a', textMain: '#f8fafc', textMuted: '#94a3b8', border: '#1e293b', primary: '#059669', success: '#10b981', danger: '#ef4444' };

export default function GestaoEmpresasScreen({ route }) {
  const { token } = route?.params || {};
  const [empresas, setEmpresas] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const carregarEmpresas = useCallback(async () => {
    try {
      const res = await axios.get('http://SEU_IP_LOCAL:3000/api/empresas', { headers: { Authorization: `Bearer ${token}` } });
      setEmpresas(res.data);
    } catch (e) { console.log(e); }
  }, [token]);

  useEffect(() => { carregarEmpresas(); }, [carregarEmpresas]);

  const alternarStatus = async (empresa) => {
    const novoStatus = empresa.status === 'Ativa' ? 'Suspensa' : 'Ativa';
    try {
      await axios.put(`http://SEU_IP_LOCAL:3000/api/empresas/${empresa.id}`, { ...empresa, status: novoStatus }, { headers: { Authorization: `Bearer ${token}` } });
      carregarEmpresas();
    } catch (e) { Alert.alert('Erro', 'Não foi possível alterar o status.'); }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Globe size={24} color={theme.primary} />
        <View style={{ marginLeft: 10 }}>
          <Text style={styles.title}>Ecossistema de Organizações</Text>
          <Text style={styles.subtitle}>Gestão SaaS Multi-Tenant</Text>
        </View>
      </View>

      <ScrollView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={async () => { setRefreshing(true); await carregarEmpresas(); setRefreshing(false); }} tintColor={theme.primary} />}>
        {empresas.map(emp => (
          <View key={emp.id} style={[styles.card, emp.status === 'Suspensa' && { opacity: 0.6 }]}>
            <View style={styles.cardHeader}>
              <View style={styles.iconBox}><Building2 size={20} color={theme.primary} /></View>
              <View style={styles.infoBox}>
                <Text style={styles.empName}>{emp.nome}</Text>
                <Text style={styles.empCnpj}>{emp.cnpj || 'ISENTO'}</Text>
              </View>
            </View>

            <View style={styles.actionsRow}>
              <View style={styles.statusBox}>
                <Text style={[styles.statusText, { color: emp.status === 'Ativa' ? theme.success : theme.danger }]}>
                  {emp.status.toUpperCase()}
                </Text>
              </View>
              
              <View style={styles.btnGroup}>
                <TouchableOpacity onPress={() => alternarStatus(emp)}>
                  {emp.status === 'Ativa' ? <ToggleRight size={32} color={theme.success}/> : <ToggleLeft size={32} color={theme.textMuted}/>}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.bg, padding: 15 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 20, backgroundColor: theme.card, padding: 15, borderRadius: 12, borderWidth: 1, borderColor: theme.border },
  title: { color: theme.textMain, fontSize: 16, fontWeight: 'bold' },
  subtitle: { color: theme.textMuted, fontSize: 12 },
  card: { backgroundColor: theme.card, padding: 15, borderRadius: 12, marginBottom: 15, borderWidth: 1, borderColor: theme.border },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
  iconBox: { backgroundColor: 'rgba(5, 150, 105, 0.1)', padding: 10, borderRadius: 8, marginRight: 12 },
  infoBox: { flex: 1 },
  empName: { color: theme.textMain, fontSize: 16, fontWeight: 'bold' },
  empCnpj: { color: theme.textMuted, fontSize: 12, marginTop: 4, fontFamily: 'monospace' },
  actionsRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.05)', paddingTop: 15 },
  statusText: { fontSize: 12, fontWeight: 'bold' },
  btnGroup: { flexDirection: 'row', gap: 15 }
});