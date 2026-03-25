import { Droplets, Power, Thermometer } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { api, theme } from '../api/api';

export default function SensoresScreen({ isTemp = true }) {
  const [equipamentos, setEquipamentos] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const carregarSensores = async () => {
    try {
      const res = await api.get('/equipamentos');
      setEquipamentos(res.data);
    } catch (error) {
      console.log('Erro ao buscar sensores:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await carregarSensores();
    setRefreshing(false);
  };

  useEffect(() => {
    carregarSensores();
  }, []);

  const renderItem = ({ item: eq }) => {
    const valor = isTemp ? eq.ultima_temp : eq.ultima_umidade;
    const min = isTemp ? parseFloat(eq.temp_min) : parseFloat(eq.umidade_min || 40);
    const max = isTemp ? parseFloat(eq.temp_max) : parseFloat(eq.umidade_max || 60);
    
    const isAlta = valor > max;
    const isBaixa = valor < min;
    const isAnomalia = (isAlta || isBaixa) && !eq.em_degelo;
    
    // Cálculo da barra térmica
    let percent = ((valor || min) - min) / (max - min) * 100;
    if (percent > 100) percent = 100;
    if (percent < 5) percent = 5;

    let barColor = isTemp ? theme.success : theme.info;
    if (isAnomalia) barColor = isTemp ? theme.danger : theme.warning;
    if (eq.em_degelo) barColor = theme.info;

    return (
      <View style={[styles.card, isAnomalia && styles.cardDanger]}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>{eq.nome}</Text>
          <Text style={styles.badgeSetor}>{eq.filial} | {eq.setor}</Text>
        </View>

        <View style={[styles.statusBox, { backgroundColor: !isTemp ? (isAnomalia ? theme.warning : theme.info) : (eq.em_degelo ? theme.info : (isAnomalia ? theme.danger : (eq.motor_ligado ? theme.primary : theme.danger))) }]}>
          <View style={styles.statusInfo}>
            <View style={styles.statusRow}>
              {isTemp ? <Power color="#fff" size={18} /> : <Droplets color="#fff" size={18} />}
              <Text style={styles.statusText}>
                {isTemp ? (eq.em_degelo ? 'DEGELO' : (eq.motor_ligado ? 'LIGADO' : 'PARADO')) : (isAlta ? 'HÚMIDO' : (isBaixa ? 'SECO' : 'ESTÁVEL'))}
              </Text>
            </View>
            <Text style={styles.limitesText}>{min}{isTemp ? '°C' : '%'} a {max}{isTemp ? '°C' : '%'}</Text>
            
            {/* Barra Térmica */}
            <View style={[styles.thermalBarBg, !isTemp && { backgroundColor: 'rgba(0,0,0,0.2)' }]}>
              <View style={[styles.thermalBarFill, { width: `${percent}%`, backgroundColor: !isTemp ? '#fff' : barColor }]} />
            </View>
          </View>

          <View style={[styles.tempDisplay, !isTemp && { backgroundColor: 'rgba(0,0,0,0.15)' }]}>
            <Text style={styles.sensorLabel}>Sensor</Text>
            <Text style={[styles.sensorValue, (isAnomalia && isTemp) && { color: '#ffcccc' }]}>
              {valor ? `${valor}${isTemp ? '°C' : '%'}` : '--'}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        {isTemp ? <Thermometer color={theme.primary} size={28} /> : <Droplets color={theme.info} size={28} />}
        <Text style={styles.headerTitle}>{isTemp ? 'Câmaras e Ilhas' : 'Gestão de Humidade'}</Text>
      </View>

      <FlatList
        data={equipamentos}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[theme.primary]} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.bg },
  header: { flexDirection: 'row', alignItems: 'center', padding: 16, backgroundColor: theme.card, borderBottomWidth: 1, borderBottomColor: theme.border },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: theme.textMain, marginLeft: 10 },
  card: { backgroundColor: theme.card, borderRadius: 12, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: theme.border, elevation: 2 },
  cardDanger: { borderColor: theme.danger, borderWidth: 2 },
  cardHeader: { marginBottom: 15 },
  cardTitle: { fontSize: 18, fontWeight: 'bold', color: theme.textMain, marginBottom: 5 },
  badgeSetor: { backgroundColor: theme.border, alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, fontSize: 11, fontWeight: 'bold', color: theme.textMuted },
  statusBox: { flexDirection: 'row', borderRadius: 8, padding: 15, alignItems: 'center', justifyContent: 'space-between' },
  statusInfo: { flex: 1, marginRight: 15 },
  statusRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 5 },
  statusText: { color: '#fff', fontWeight: 'bold', marginLeft: 6, letterSpacing: 1, fontSize: 12 },
  limitesText: { color: 'rgba(255,255,255,0.8)', fontSize: 12, marginBottom: 10 },
  thermalBarBg: { height: 8, backgroundColor: 'rgba(255,255,255,0.3)', borderRadius: 4, overflow: 'hidden' },
  thermalBarFill: { height: '100%', borderRadius: 4 },
  tempDisplay: { backgroundColor: 'rgba(255,255,255,0.2)', padding: 10, borderRadius: 8, alignItems: 'center', minWidth: 80 },
  sensorLabel: { color: '#fff', fontSize: 10, textTransform: 'uppercase', opacity: 0.9 },
  sensorValue: { color: '#fff', fontSize: 24, fontWeight: '900' }
});