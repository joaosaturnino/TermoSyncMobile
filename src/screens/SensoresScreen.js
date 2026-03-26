import {
  Activity,
  Clock,
  Droplets,
  Filter,
  Power,
  Wifi
} from 'lucide-react-native';
import React, { useCallback, useContext, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { api, getSocket } from '../api/api';
import { AppContext } from '../context/AppContext';

const { width } = Dimensions.get('window');

const SensorCard = React.memo(({ eq, theme, isTemp }) => {
  const valor = isTemp ? eq.ultima_temp : eq.ultima_umidade;
  const min = parseFloat(isTemp ? eq.temp_min : (eq.umidade_min || 40));
  const max = parseFloat(isTemp ? eq.temp_max : (eq.umidade_max || 80));
  
  const isAlta = valor > max;
  const isBaixa = valor < min;

  let isAnomalia = false;
  let statusColor = '';
  let statusText = '';
  let subStatusText = '';

  if (isTemp) {
    isAnomalia = (isAlta || isBaixa) && !eq.em_degelo;
    const motorLigado = eq.motor_ligado;
    const emDegelo = eq.em_degelo;

    if (emDegelo) {
      statusColor = '#38bdf8'; 
      statusText = 'DEGELO';
      subStatusText = 'Ciclo de Degelo Automático';
    } else if (!motorLigado) {
      statusColor = '#f97316'; 
      statusText = 'PARADO';
      subStatusText = 'Aviso: Motor Desligado';
    } else if (isAnomalia) {
      statusColor = '#ef4444'; 
      statusText = 'LIGADO';
      subStatusText = 'Excursão Térmica Registada';
    } else {
      statusColor = '#10b981'; 
      statusText = 'LIGADO';
      subStatusText = 'Temperatura Estável';
    }
  } else {
    isAnomalia = isAlta || isBaixa;
    
    if (isAnomalia) {
      statusColor = '#f59e0b'; 
      statusText = isAlta ? 'HÚMIDO' : 'SECO';
      subStatusText = 'Ambiente Desregulado (HACCP)';
    } else {
      statusColor = '#38bdf8'; 
      statusText = 'ESTÁVEL';
      subStatusText = 'Higrometria Estável';
    }
  }

  let percent = ((valor - min) / (max - min)) * 100;
  percent = Math.min(Math.max(percent, 5), 100);

  return (
    <View style={[
      styles.card, 
      { backgroundColor: theme.card, borderColor: isAnomalia ? statusColor : theme.border },
      isAnomalia && { borderLeftWidth: 8, borderLeftColor: statusColor }
    ]}>
      <View style={styles.cardHeader}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.badgeSetor, { backgroundColor: theme.bg, color: theme.textMuted }]}>
            {String(eq.filial).toUpperCase()} | {String(eq.setor).toUpperCase()}
          </Text>
          <Text style={[styles.cardTitle, { color: theme.textMain }]}>{eq.nome}</Text>
        </View>
      </View>

      <View style={[styles.statusBox, { backgroundColor: statusColor }]}>
        <View style={styles.statusInfo}>
          <View style={styles.statusRow}>
            {isTemp ? <Power color="#fff" size={16} /> : <Droplets color="#fff" size={16} />}
            <Text style={styles.statusText}>{statusText}</Text>
          </View>
          <Text style={styles.limitesText}>
            ALVO: {min}{isTemp ? '°C' : '%'} a {max}{isTemp ? '°C' : '%'}
          </Text>
          <View style={[styles.thermalBarBg, { backgroundColor: isTemp ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.25)' }]}>
            <View style={[styles.thermalBarFill, { width: `${percent}%`, backgroundColor: '#fff' }]} />
          </View>
        </View>
        <View style={[styles.tempDisplay, { borderLeftColor: isTemp ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.2)' }]}>
          <Text style={styles.sensorLabel}>Sensor</Text>
          <Text style={styles.sensorValue}>
            {valor !== null ? `${valor}${isTemp ? '°' : '%'}` : '--'}
          </Text>
        </View>
      </View>

      <View style={styles.cardFooter}>
        <View style={styles.footerItem}>
          <Clock size={12} color={theme.textMuted} />
          <Text style={[styles.footerText, { color: theme.textMuted }]}> Atualização Real-Time</Text>
        </View>
        <View style={styles.footerItem}>
          <Activity size={12} color={isAnomalia ? statusColor : '#10b981'} />
          <Text style={[styles.footerText, { color: theme.textMuted }]}>
            {` ${subStatusText}`}
          </Text>
        </View>
      </View>
    </View>
  );
});

export default function SensoresScreen({ isTemp }) {
  const { filialAtiva, theme } = useContext(AppContext);
  const [equipamentos, setEquipamentos] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [setorSelecionado, setSetorSelecionado] = useState('Todos');

  const setoresDisponiveis = ['Todos', 'Farmácia / Vacinas', 'Açougue', 'Padaria', 'Frios', 'FLV'];

  const carregarDados = useCallback(async () => {
    try {
      const res = await api.get('/api/equipamentos');
      setEquipamentos(res.data);
    } catch (error) {
      console.error('Erro:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    carregarDados();
    
    const socket = getSocket();
    
    // 🔴 CORREÇÃO: Comparação de String e parse rigoroso do status
    socket.on('nova_leitura', (dadosNovaLeitura) => {
      setEquipamentos(prev => prev.map(eq => 
        String(eq.id) === String(dadosNovaLeitura.equipamento_id) 
          ? { 
              ...eq, 
              ultima_temp: dadosNovaLeitura.temperatura, 
              ultima_umidade: dadosNovaLeitura.umidade,
              motor_ligado: dadosNovaLeitura.motor_ligado === true || dadosNovaLeitura.motor_ligado == 1,
              em_degelo: dadosNovaLeitura.em_degelo === true || dadosNovaLeitura.em_degelo == 1
            } 
          : eq
      ));
    });

    socket.on('atualizacao_dados', () => carregarDados());

    return () => socket.disconnect();
  }, [carregarDados]);

  const onRefresh = async () => {
    setRefreshing(true);
    await carregarDados();
    setRefreshing(false);
  };

  const filtrados = equipamentos.filter(eq => {
    if (!isTemp && eq.umidade_max === null) return false;
    
    const matchFilial = filialAtiva === 'Todas' || eq.filial === filialAtiva;
    const matchSetor = setorSelecionado === 'Todos' || eq.setor === setorSelecionado;
    return matchFilial && matchSetor;
  });

  const renderItem = useCallback(({ item }) => (
    <SensorCard eq={item} theme={theme} isTemp={isTemp} />
  ), [theme, isTemp]);

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.bg, justifyContent: 'center' }]}>
        <ActivityIndicator size="large" color={isTemp ? theme.primary : theme.info} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      <View style={[styles.filterContainer, { borderBottomColor: theme.border }]}>
        <View style={styles.filterHeader}>
          <Filter size={16} color={isTemp ? theme.primary : theme.info} />
          <Text style={[styles.filterLabel, { color: theme.textMain }]}>Setores {isTemp ? 'Térmicos' : 'Higrométricos'}</Text>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipScroll}>
          {setoresDisponiveis.map((setor) => (
            <TouchableOpacity 
              key={setor} 
              onPress={() => setSetorSelecionado(setor)}
              style={[
                styles.chip, 
                { backgroundColor: theme.card, borderColor: theme.border },
                setorSelecionado === setor && { backgroundColor: isTemp ? theme.primary : theme.info, borderColor: isTemp ? theme.primary : theme.info }
              ]}
            >
              <Text style={[
                styles.chipText, 
                { color: theme.textMuted },
                setorSelecionado === setor && { color: '#fff' }
              ]}>
                {setor}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <FlatList
        data={filtrados}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderItem}  
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[isTemp ? theme.primary : theme.info]} />}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Wifi size={48} color={theme.border} />
            <Text style={{ color: theme.textMuted, marginTop: 10 }}>
              {isTemp ? 'Nenhum equipamento térmico localizado.' : 'Nenhum sensor de humidade localizado.'}
            </Text>
          </View>
        }
        initialNumToRender={8}
        maxToRenderPerBatch={8}
        windowSize={5}
        removeClippedSubviews={true}
        updateCellsBatchingPeriod={50}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  filterContainer: { paddingVertical: 12, borderBottomWidth: 1 },
  filterHeader: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, marginBottom: 8 },
  filterLabel: { fontSize: 13, fontWeight: '700', marginLeft: 6, textTransform: 'uppercase' },
  chipScroll: { paddingHorizontal: 12 },
  chip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, borderWidth: 1, marginRight: 8 },
  chipText: { fontSize: 12, fontWeight: '700' },
  listContent: { padding: 16, paddingBottom: 40 },
  card: { borderRadius: 16, padding: 16, marginBottom: 16, borderWidth: 1, elevation: 4 },
  cardHeader: { marginBottom: 12 },
  cardTitle: { fontSize: 18, fontWeight: '800', marginTop: 4 },
  badgeSetor: { alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6, fontSize: 10, fontWeight: '900' },
  statusBox: { flexDirection: 'row', borderRadius: 12, padding: 15, alignItems: 'center' },
  statusInfo: { flex: 1 },
  statusRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  statusText: { color: '#fff', fontWeight: 'bold', marginLeft: 6, fontSize: 11, letterSpacing: 1 },
  limitesText: { color: 'rgba(255,255,255,0.9)', fontSize: 12, fontWeight: '700', marginBottom: 12 },
  thermalBarBg: { height: 10, borderRadius: 5, overflow: 'hidden' },
  thermalBarFill: { height: '100%', borderRadius: 5 },
  tempDisplay: { paddingLeft: 15, alignItems: 'center', borderLeftWidth: 1, minWidth: 90 },
  sensorLabel: { color: '#fff', fontSize: 10, fontWeight: '700', textTransform: 'uppercase' },
  sensorValue: { color: '#fff', fontSize: 28, fontWeight: '900' },
  cardFooter: { flexDirection: 'row', marginTop: 12, borderTopWidth: 1, borderTopColor: 'rgba(0,0,0,0.05)', paddingTop: 8, justifyContent: 'space-between' },
  footerItem: { flexDirection: 'row', alignItems: 'center' },
  footerText: { fontSize: 11, fontWeight: '600' },
  emptyContainer: { alignItems: 'center', marginTop: 60 }
});