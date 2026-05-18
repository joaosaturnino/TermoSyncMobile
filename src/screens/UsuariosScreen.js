import axios from 'axios';
import { ShieldCheck, User } from 'lucide-react-native';
import { useCallback, useEffect, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';

const theme = { bg: '#020617', card: '#0f172a', textMain: '#f8fafc', textMuted: '#94a3b8', border: '#1e293b', primary: '#059669', info: '#38bdf8' };

export default function UsuariosScreen({ route }) {
  const { token } = route?.params || {};
  const [usuarios, setUsuarios] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const carregarUsuarios = useCallback(async () => {
    try {
      const res = await axios.get('http://SEU_IP_LOCAL:3000/api/usuarios', { headers: { Authorization: `Bearer ${token}` } });
      setUsuarios(res.data);
    } catch (e) { console.log(e); }
  }, [token]);

  useEffect(() => { carregarUsuarios(); }, [carregarUsuarios]);

  return (
    <View style={styles.container}>
      <Text style={styles.pageTitle}>Identidades e Acessos</Text>
      <ScrollView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={async () => { setRefreshing(true); await carregarUsuarios(); setRefreshing(false); }} tintColor={theme.primary} />}>
        {usuarios.map(u => (
          <View key={u.id} style={styles.card}>
            <View style={styles.avatarBox}><User size={24} color={theme.textMain} /></View>
            <View style={styles.infoBox}>
              <Text style={styles.nome}>{u.usuario}</Text>
              <Text style={styles.nomeCompleto}>{u.nome_tecnico || u.nome_gerente || u.nome_coordenador || 'Usuário Sistema'}</Text>
            </View>
            <View style={styles.roleBox}>
              <ShieldCheck size={12} color={u.role === 'ADMIN' || u.role === 'DEV' ? theme.info : theme.primary} />
              <Text style={[styles.roleText, { color: u.role === 'ADMIN' || u.role === 'DEV' ? theme.info : theme.primary }]}>{u.role}</Text>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.bg, padding: 15 },
  pageTitle: { fontSize: 20, fontWeight: 'bold', color: theme.textMain, marginBottom: 15 },
  card: { flexDirection: 'row', alignItems: 'center', backgroundColor: theme.card, padding: 15, borderRadius: 12, marginBottom: 10, borderWidth: 1, borderColor: theme.border },
  avatarBox: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.1)', justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  infoBox: { flex: 1 },
  nome: { color: theme.textMain, fontSize: 16, fontWeight: 'bold' },
  nomeCompleto: { color: theme.textMuted, fontSize: 12, marginTop: 2 },
  roleBox: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(0,0,0,0.3)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  roleText: { fontSize: 10, fontWeight: 'bold' }
});