import axios from 'axios';
import { MapPin, Phone, Store } from 'lucide-react-native';
import { useCallback, useEffect, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';

const theme = { bg: '#020617', card: '#0f172a', textMain: '#f8fafc', textMuted: '#94a3b8', border: '#1e293b', primary: '#059669' };

export default function LojasScreen({ route }) {
  const { token } = route?.params || {};
  const [lojas, setLojas] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const carregarLojas = useCallback(async () => {
    try {
      const res = await axios.get('http://SEU_IP_LOCAL:3000/api/lojas', { headers: { Authorization: `Bearer ${token}` } });
      setLojas(res.data);
    } catch (e) { console.log(e); }
  }, [token]);

  useEffect(() => { carregarLojas(); }, [carregarLojas]);

  return (
    <View style={styles.container}>
      <Text style={styles.pageTitle}>Rede de Lojas</Text>
      <ScrollView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={async () => { setRefreshing(true); await carregarLojas(); setRefreshing(false); }} tintColor={theme.primary} />}>
        {lojas.map(loja => (
          <View key={loja.id} style={styles.card}>
            <View style={styles.cardTop}>
              <View style={styles.iconBox}><Store size={20} color={theme.primary} /></View>
              <View style={{ flex: 1 }}>
                <Text style={styles.nome}>{loja.nome}</Text>
                <Text style={styles.status}>{loja.status.toUpperCase()}</Text>
              </View>
            </View>
            <View style={styles.infoRow}><MapPin size={14} color={theme.textMuted} /><Text style={styles.infoText}>{loja.endereco || 'Endereço não informado'}</Text></View>
            <View style={styles.infoRow}><Phone size={14} color={theme.textMuted} /><Text style={styles.infoText}>{loja.telefone || 'Telefone não informado'}</Text></View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.bg, padding: 15 },
  pageTitle: { fontSize: 20, fontWeight: 'bold', color: theme.textMain, marginBottom: 15 },
  card: { backgroundColor: theme.card, padding: 15, borderRadius: 12, marginBottom: 15, borderWidth: 1, borderColor: theme.border },
  cardTop: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
  iconBox: { backgroundColor: 'rgba(5, 150, 105, 0.1)', padding: 10, borderRadius: 8, marginRight: 12 },
  nome: { color: theme.textMain, fontSize: 16, fontWeight: 'bold' },
  status: { color: theme.primary, fontSize: 10, fontWeight: 'bold', marginTop: 4 },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 8 },
  infoText: { color: theme.textMuted, fontSize: 13 }
});