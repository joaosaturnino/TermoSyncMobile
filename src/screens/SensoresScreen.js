import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useContext, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { AppContext } from '../context/AppContext';

export default function SensoresScreen({ route }) {
  const { equipamentos, filialAtiva, setoresDb, theme } = useContext(AppContext);
  const isTemp = route.params?.tipoSensor !== 'umidade';
  const [setorFiltro, setSetorFiltro] = useState('');

  let lista = (equipamentos || []).filter(e => filialAtiva === 'Todas' || (e.filial || 'Loja Principal') === filialAtiva);
  if (setorFiltro) lista = lista.filter(e => e.setor === setorFiltro);

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterBar}>
        <TouchableOpacity style={[styles.chip, !setorFiltro && { backgroundColor: theme.textMain }]} onPress={() => setSetorFiltro('')}>
          <Text style={{ color: !setorFiltro ? theme.bg : theme.textMuted, fontWeight: 'bold' }}>Todos Setores</Text>
        </TouchableOpacity>
        {setoresDb?.map(s => (
          <TouchableOpacity key={s} style={[styles.chip, setorFiltro === s && { backgroundColor: theme.textMain }]} onPress={() => setSetorFiltro(s)}>
            <Text style={{ color: setorFiltro === s ? theme.bg : theme.textMuted, fontWeight: 'bold' }}>{s}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView contentContainerStyle={{ padding: 15 }}>
        {lista.map(eq => {
          const valor = isTemp ? eq.ultima_temp : eq.ultima_umidade;
          const min = isTemp ? eq.temp_min : (eq.umidade_min || 40);
          const max = isTemp ? eq.temp_max : (eq.umidade_max || 60);
          const isAlta = valor > max;
          const isBaixa = valor < min;
          const anomalia = (isAlta || isBaixa) && !eq.em_degelo;
          
          let percent = ((valor || min) - min) / (max - min) * 100;
          if(percent > 100) percent = 100; if(percent < 5) percent = 5;

          let boxBg = theme.card;
          let textColorMain = theme.textMain;
          let textColorMuted = theme.textMuted;
          let barBgColor = 'rgba(0,0,0,0.1)';
          let barFillColor = '#fff';
          let visorBg = 'rgba(0,0,0,0.1)';
          let borderColor = theme.border;

          if (isTemp) {
             if (eq.em_degelo) { boxBg = theme.info; borderColor = theme.info; }
             else if (!eq.motor_ligado) { boxBg = theme.danger; borderColor = theme.danger; }
             else { boxBg = theme.primary; borderColor = theme.primary; }

             textColorMain = '#ffffff'; textColorMuted = 'rgba(255,255,255,0.8)';
             barBgColor = 'rgba(255,255,255,0.3)'; visorBg = 'rgba(255,255,255,0.2)';
          } else {
             if (anomalia) { boxBg = theme.warning; borderColor = theme.warning; }
             else { boxBg = theme.info; borderColor = theme.info; }
             textColorMain = '#ffffff'; textColorMuted = 'rgba(255,255,255,0.8)';
             barBgColor = 'rgba(0,0,0,0.2)'; visorBg = 'rgba(0,0,0,0.15)';
          }

          const statusText = isTemp ? (eq.em_degelo ? 'DEGELO AUTOMÁTICO' : (eq.motor_ligado ? 'MOTOR LIGADO' : 'MOTOR PARADO')) : (isAlta ? 'HÚMIDO' : (isBaixa ? 'SECO' : 'ESTÁVEL'));

          return (
            <View key={eq.id} style={[styles.card, { backgroundColor: theme.card, borderLeftColor: borderColor }]}>
              <View style={styles.cardHeader}>
                <Text style={[styles.nome, { color: theme.textMain }]}>{eq.nome}</Text>
                <Text style={styles.badgeSetor}>{eq.setor || 'Geral'}</Text>
              </View>
              
              <View style={[styles.panel, { backgroundColor: boxBg }]}>
                <View style={{ flex: 1, marginRight: 15 }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text style={{ fontSize: 12, fontWeight: '900', color: textColorMain, letterSpacing: 0.5 }}>
                      <MaterialCommunityIcons name={isTemp?'power':'water'} size={14}/> {statusText}
                    </Text>
                    <Text style={{fontSize: 10, color: textColorMuted, fontWeight: 'bold'}}>{min}{isTemp?'°C':'%'} a {max}{isTemp?'°C':'%'}</Text>
                  </View>
                  <View style={[styles.barBg, { backgroundColor: barBgColor }]}>
                    <View style={[styles.barFill, { width: `${percent}%`, backgroundColor: barFillColor }]} />
                  </View>
                </View>
                
                <View style={[styles.visor, { backgroundColor: visorBg }]}>
                  <Text style={{ color: textColorMuted, fontSize: 9, fontWeight: '900', textTransform: 'uppercase', letterSpacing: 1 }}>Sensor</Text>
                  <Text style={{ color: (anomalia && isTemp) ? '#ffcccc' : '#ffffff', fontSize: 26, fontWeight: '900', letterSpacing: -1 }}>
                    {valor ? `${valor}${isTemp?'°C':'%'}` : '--'}
                  </Text>
                </View>
              </View>

            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  filterBar: { maxHeight: 55, padding: 10 },
  chip: { paddingHorizontal: 15, paddingVertical: 8, borderRadius: 20, backgroundColor: '#e2e8f0', marginRight: 10, justifyContent: 'center' },
  card: { padding: 18, borderRadius: 12, marginBottom: 15, borderLeftWidth: 6, elevation: 4 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 },
  nome: { fontWeight: '900', fontSize: 17 },
  badgeSetor: { fontSize: 10, backgroundColor: 'rgba(0,0,0,0.05)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, color: '#64748b', fontWeight: 'bold' },
  panel: { flexDirection: 'row', alignItems: 'center', padding: 15, borderRadius: 10 },
  barBg: { height: 8, borderRadius: 4, overflow: 'hidden', marginTop: 12 },
  barFill: { height: '100%', borderRadius: 4 },
  visor: { paddingVertical: 10, paddingHorizontal: 15, borderRadius: 8, alignItems: 'center', minWidth: 95 }
});