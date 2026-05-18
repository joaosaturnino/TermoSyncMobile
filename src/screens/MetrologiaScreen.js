import axios from 'axios';
import { AlertTriangle, ClipboardCheck, MapPin, ShieldAlert, ShieldCheck, Target } from 'lucide-react-native';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';

const theme = { bg: '#020617', card: '#0f172a', textMain: '#f8fafc', textMuted: '#94a3b8', border: '#1e293b', primary: '#059669', success: '#10b981', danger: '#ef4444', warning: '#f59e0b', info: '#38bdf8' };

export default function MetrologiaScreen({ route }) {
  const { token } = route?.params || {};
  const [equipamentos, setEquipamentos] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const carregarDados = useCallback(async () => {
    try {
      const res = await axios.get('http://SEU_IP_LOCAL:3000/api/equipamentos', { headers: { Authorization: `Bearer ${token}` } });
      setEquipamentos(res.data);
    } catch (e) { console.log(e); }
  }, [token]);

  useEffect(() => { carregarDados(); }, [carregarDados]);

  const analise = useMemo(() => {
    const hoje = new Date().getTime();
    return equipamentos.map(eq => {
      const dias = eq.data_calibracao ? Math.floor((hoje - new Date(eq.data_calibracao).getTime()) / (1000 * 60 * 60 * 24)) : 999;
      const status = dias > 365 ? 'VENCIDO' : (dias > 330 ? 'ALERTA' : 'OK');
      return { ...eq, dias_calibracao: dias, status_calibracao: status };
    }).sort((a, b) => b.dias_calibracao - a.dias_calibracao);
  }, [equipamentos]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Target size={24} color={theme.info} />
        <View style={{ marginLeft: 10 }}>
          <Text style={styles.title}>Controlo Metrológico</Text>
          <Text style={styles.subtitle}>Auditoria RDC / HACCP</Text>
        </View>
      </View>

      <ScrollView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={async () => { setRefreshing(true); await carregarDados(); setRefreshing(false); }} tintColor={theme.info} />}>
        {analise.map(eq => {
          const isVencido = eq.status_calibracao === 'VENCIDO';
          const isAlerta = eq.status_calibracao === 'ALERTA';
          const cor = isVencido ? theme.danger : (isAlerta ? theme.warning : theme.success);
          const Icon = isVencido ? ShieldAlert : (isAlerta ? AlertTriangle : ShieldCheck);

          return (
            <View key={eq.id} style={[styles.card, { borderLeftColor: cor }]}>
              <View style={styles.cardHeader}>
                <View>
                  <Text style={styles.eqName}>{eq.nome}</Text>
                  <Text style={styles.eqFilial}><MapPin size={12}/> {eq.filial || 'Base'}</Text>
                </View>
                <View style={[styles.badge, { backgroundColor: `${cor}20`, borderColor: `${cor}50` }]}>
                  <Icon size={12} color={cor} />
                  <Text style={[styles.badgeText, { color: cor }]}>
                    {isVencido ? 'CADUCADO' : (isAlerta ? 'RENOVAR' : 'CONFORME')}
                  </Text>
                </View>
              </View>
              
              <View style={styles.cardBody}>
                <ClipboardCheck size={14} color={theme.textMuted} />
                <Text style={styles.diasText}>
                  {eq.dias_calibracao === 999 ? 'Sem registo prévio' : `Última calibração há ${eq.dias_calibracao} dias`}
                </Text>
              </View>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.bg, padding: 15 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 20, backgroundColor: theme.card, padding: 15, borderRadius: 12, borderWidth: 1, borderColor: theme.border },
  title: { color: theme.textMain, fontSize: 18, fontWeight: 'bold' },
  subtitle: { color: theme.textMuted, fontSize: 12 },
  card: { backgroundColor: theme.card, padding: 15, borderRadius: 12, marginBottom: 15, borderWidth: 1, borderColor: theme.border, borderLeftWidth: 4 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  eqName: { color: theme.textMain, fontSize: 16, fontWeight: 'bold' },
  eqFilial: { color: theme.textMuted, fontSize: 11, marginTop: 4 },
  badge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 20, borderWidth: 1, gap: 4 },
  badgeText: { fontSize: 10, fontWeight: 'bold' },
  cardBody: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingTop: 12, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.05)' },
  diasText: { color: theme.textMain, fontSize: 12, fontWeight: '600' }
});