import axios from 'axios';
import { Droplets, Snowflake, Thermometer } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

const theme = { bg: '#020617', card: '#0f172a', textMain: '#f8fafc', textMuted: '#94a3b8', border: '#1e293b', primary: '#059669', info: '#38bdf8' };

export default function SensoresScreen({ route }) {
  const { token, socket } = route?.params || {};
  const [equipamentos, setEquipamentos] = useState([]);

  useEffect(() => {
    axios.get('http://SEU_IP_LOCAL:3000/api/equipamentos', { headers: { Authorization: `Bearer ${token}` } })
      .then(res => setEquipamentos(res.data));
  }, [token]);

  useEffect(() => {
    if (!socket) return;
    socket.on('nova_leitura', (leitura) => {
      setEquipamentos(prev => prev.map(eq => eq.id === leitura.equipamento_id ? { ...eq, ultima_temp: leitura.temperatura, ultima_umidade: leitura.umidade } : eq));
    });
    return () => socket.off('nova_leitura');
  }, [socket]);

  return (
    <View style={styles.container}>
      <Text style={styles.pageTitle}>Telemetria IoT Dinâmica</Text>
      <ScrollView>
        {equipamentos.map(eq => (
          <View key={eq.id} style={styles.card}>
            <Text style={styles.eqName}>{eq.nome}</Text>
            <Text style={styles.eqSetor}>{eq.setor}</Text>
            
            <View style={styles.leiturasRow}>
              <View style={styles.leituraBox}>
                <Thermometer size={24} color={theme.primary} />
                <Text style={styles.leituraValor}>{eq.ultima_temp != null ? `${parseFloat(eq.ultima_temp).toFixed(1)}°` : '--'}</Text>
                <Text style={styles.leituraLabel}>Temperatura</Text>
              </View>
              
              <View style={styles.leituraBox}>
                <Droplets size={24} color={theme.info} />
                <Text style={styles.leituraValor}>{eq.ultima_umidade != null ? `${parseFloat(eq.ultima_umidade).toFixed(0)}%` : '--'}</Text>
                <Text style={styles.leituraLabel}>Umidade</Text>
              </View>

              {eq.em_degelo === 1 && (
                <View style={styles.degeloBox}>
                  <Snowflake size={20} color="#ffffff" />
                  <Text style={{color: 'white', fontSize: 10, fontWeight: 'bold', marginTop: 4}}>DEGELO</Text>
                </View>
              )}
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
  card: { backgroundColor: theme.card, padding: 20, borderRadius: 16, marginBottom: 15, borderWidth: 1, borderColor: theme.border },
  eqName: { color: theme.textMain, fontSize: 18, fontWeight: '900' },
  eqSetor: { color: theme.textMuted, fontSize: 12, fontWeight: 'bold', textTransform: 'uppercase', marginBottom: 15 },
  leiturasRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  leituraBox: { alignItems: 'center', backgroundColor: '#1e293b', padding: 15, borderRadius: 12, flex: 1, marginHorizontal: 5 },
  leituraValor: { color: theme.textMain, fontSize: 22, fontWeight: '900', marginTop: 8, fontFamily: 'monospace' },
  leituraLabel: { color: theme.textMuted, fontSize: 10, textTransform: 'uppercase', fontWeight: 'bold', marginTop: 4 },
  degeloBox: { backgroundColor: theme.info, padding: 10, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginLeft: 5 }
});