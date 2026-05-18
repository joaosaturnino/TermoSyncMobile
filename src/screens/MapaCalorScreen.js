import axios from 'axios';
import { Activity, AlertTriangle, Map, Snowflake, Thermometer } from 'lucide-react-native';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';

const theme = { bg: '#020617', card: '#0f172a', textMain: '#f8fafc', textMuted: '#94a3b8', border: '#1e293b', primary: '#059669', success: '#10b981', danger: '#ef4444', warning: '#f59e0b', info: '#38bdf8' };

export default function MapaCalorScreen({ route }) {
  const { token } = route?.params || {};
  const [equipamentos, setEquipamentos] = useState([]);
  const [notificacoes, setNotificacoes] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const carregarDados = useCallback(async () => {
    try {
      const [resEquip, resNotif] = await Promise.all([
        axios.get('http://SEU_IP_LOCAL:3000/api/equipamentos', { headers: { Authorization: `Bearer ${token}` } }),
        axios.get('http://SEU_IP_LOCAL:3000/api/notificacoes', { headers: { Authorization: `Bearer ${token}` } })
      ]);
      setEquipamentos(resEquip.data);
      setNotificacoes(resNotif.data);
    } catch (e) { console.log(e); }
  }, [token]);

  useEffect(() => { carregarDados(); }, [carregarDados]);

  const statusMapa = useMemo(() => {
    return equipamentos.map(eq => {
      const temAlerta = notificacoes.find(n => n.equipamento_id === eq.id && !n.resolvido);
      let statusColor = theme.success;
      let statusText = 'ZONA ESTÁVEL';
      let Icon = Activity;
      
      if (temAlerta) { statusColor = theme.danger; statusText = 'FOCO CRÍTICO'; Icon = AlertTriangle; }
      else if (eq.em_degelo) { statusColor = theme.info; statusText = 'CICLO DE DEGELO'; Icon = Snowflake; }
      else if (!eq.motor_ligado) { statusColor = theme.warning; statusText = 'COMPRESSOR PARADO'; }

      return { ...eq, statusColor, statusText, temAlerta, Icon };
    });
  }, [equipamentos, notificacoes]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Map size={24} color={theme.primary} />
        <View style={{ marginLeft: 10 }}>
          <Text style={styles.title}>Planta Digital (Heatmap)</Text>
          <Text style={styles.subtitle}>Mapeamento térmico em tempo real</Text>
        </View>
      </View>

      <ScrollView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={async () => { setRefreshing(true); await carregarDados(); setRefreshing(false); }} tintColor={theme.primary} />}>
        <View style={styles.grid}>
          {statusMapa.map(eq => (
            <View key={eq.id} style={[styles.card, { borderColor: eq.statusColor, backgroundColor: `${eq.statusColor}10` }]}>
              <View style={styles.cardTop}>
                <View>
                  <Text style={styles.eqName}>{eq.nome}</Text>
                  <Text style={styles.eqSetor}>{eq.setor || 'Geral'}</Text>
                </View>
                <eq.Icon size={24} color={eq.statusColor} />
              </View>

              <View style={styles.leituras}>
                <Text style={[styles.tempPrincipal, { color: eq.statusColor }]}>
                  {eq.ultima_temp != null ? `${parseFloat(eq.ultima_temp).toFixed(1)}°` : '--'}
                </Text>
                <View style={styles.leituraSecundaria}>
                  <Text style={styles.umidade}><Thermometer size={12} color={theme.textMuted}/> [{eq.temp_min} a {eq.temp_max}°]</Text>
                </View>
              </View>

              <View style={[styles.badge, { backgroundColor: `${eq.statusColor}20` }]}>
                <Text style={[styles.badgeText, { color: eq.statusColor }]}>{eq.statusText}</Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.bg, padding: 15 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 20, backgroundColor: theme.card, padding: 15, borderRadius: 12, borderWidth: 1, borderColor: theme.border },
  title: { color: theme.textMain, fontSize: 18, fontWeight: 'bold' },
  subtitle: { color: theme.textMuted, fontSize: 12 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', paddingBottom: 20 },
  card: { width: '48%', padding: 15, borderRadius: 16, borderWidth: 2, marginBottom: 15 },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 },
  eqName: { color: theme.textMain, fontSize: 14, fontWeight: '900' },
  eqSetor: { color: theme.textMuted, fontSize: 10, fontWeight: 'bold', textTransform: 'uppercase' },
  leituras: { flexDirection: 'row', alignItems: 'baseline', gap: 8, marginBottom: 10 },
  tempPrincipal: { fontSize: 24, fontWeight: '900' },
  leituraSecundaria: { flexDirection: 'column' },
  umidade: { color: theme.textMuted, fontSize: 10, fontWeight: 'bold' },
  badge: { alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 10 },
  badgeText: { fontSize: 9, fontWeight: 'bold' }
});