import {
  Cpu,
  Filter,
  ShieldCheck,
  Terminal,
  Thermometer,
  WifiOff,
  Zap
} from 'lucide-react-native';
import { useState } from 'react';
import {
  SafeAreaView,
  ScrollView, StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

const theme = {
  bg: '#020617', card: '#0f172a', textMain: '#f8fafc', textMuted: '#94a3b8',
  border: '#1e293b', primary: '#059669', thermal: '#f97316', power: '#ef4444', network: '#38bdf8'
};

export default function HistoricoScreen() {
  const [filtro, setFiltro] = useState('ALL');

  const logs = [
    { id: 1, equip: 'CONG-01 Frios', tipo: 'THERMAL', msg: 'Temperatura excedeu limite (-12°C)', laudo: 'Ajuste de termostato feito.', time: '14:30' },
    { id: 2, equip: 'REF-04 Ilha', tipo: 'POWER', msg: 'Falha de energia no motor.', laudo: 'Disjuntor rearmado.', time: '12:15' }
  ];

  const getLogStyle = (tipo) => {
    if (tipo === 'THERMAL') return { color: theme.thermal, icon: Thermometer };
    if (tipo === 'POWER') return { color: theme.power, icon: Zap };
    return { color: theme.network, icon: WifiOff };
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        <View style={styles.headerBox}>
          <View style={styles.shieldIcon}><ShieldCheck size={24} color={theme.primary} /></View>
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={styles.title}>Auditoria RDC</Text>
            <Text style={styles.subtitle}>System Logs e Conformidade</Text>
          </View>
        </View>

        {/* PILLS DE TRIAGEM */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.triageScroll}>
          <TouchableOpacity style={[styles.pill, filtro==='ALL' && styles.pillActive]} onPress={()=>setFiltro('ALL')}>
            <Filter size={12} color={filtro==='ALL'?'white':theme.textMuted}/>
            <Text style={[styles.pillText, filtro==='ALL'&&styles.pillTextActive]}>Todos</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.pill, filtro==='THERMAL' && {backgroundColor: theme.thermal, borderColor: theme.thermal}]} onPress={()=>setFiltro('THERMAL')}>
            <Thermometer size={12} color={filtro==='THERMAL'?'white':theme.thermal}/>
            <Text style={[styles.pillText, filtro==='THERMAL'&&styles.pillTextActive, {color: filtro==='THERMAL'?'white':theme.thermal}]}>Térmicas</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.pill, filtro==='POWER' && {backgroundColor: theme.power, borderColor: theme.power}]} onPress={()=>setFiltro('POWER')}>
            <Zap size={12} color={filtro==='POWER'?'white':theme.power}/>
            <Text style={[styles.pillText, filtro==='POWER'&&styles.pillTextActive, {color: filtro==='POWER'?'white':theme.power}]}>Energia</Text>
          </TouchableOpacity>
        </ScrollView>

        {/* TIMELINE (TERMINAL) */}
        <View style={styles.timelineContainer}>
          {logs.map((log, index) => {
            if (filtro !== 'ALL' && log.tipo !== filtro) return null;
            const styleObj = getLogStyle(log.tipo);
            const Icon = styleObj.icon;

            return (
              <View key={log.id} style={styles.timelineRow}>
                {/* Conector Linha/Ponto */}
                <View style={styles.connector}>
                  <View style={[styles.dot, { backgroundColor: styleObj.color }]}><Icon size={10} color="white" /></View>
                  {index !== logs.length - 1 && <View style={styles.line} />}
                </View>

                {/* Cartão de Log */}
                <View style={[styles.logCard, { borderLeftColor: styleObj.color }]}>
                  <View style={styles.logHeader}>
                    <Text style={styles.logTime}>{log.time}</Text>
                    <Text style={[styles.logTypeBadge, { color: styleObj.color, backgroundColor: `${styleObj.color}15` }]}>{log.tipo}</Text>
                  </View>
                  
                  <Text style={styles.logEquip}><Cpu size={12} color={theme.textMuted}/> {log.equip}</Text>
                  
                  <View style={[styles.terminalBox, { borderLeftColor: styleObj.color }]}>
                    <Terminal size={12} color={theme.textMuted} />
                    <Text style={styles.terminalText}>{log.msg}</Text>
                  </View>
                  
                  <Text style={styles.resolutionText}>Laudo: {log.laudo}</Text>
                </View>
              </View>
            );
          })}
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.bg },
  scrollContent: { padding: 15, paddingBottom: 40 },
  
  headerBox: { flexDirection: 'row', alignItems: 'center', marginBottom: 20, backgroundColor: theme.card, padding: 15, borderRadius: 16, borderWidth: 1, borderColor: theme.border },
  shieldIcon: { padding: 10, backgroundColor: 'rgba(5, 150, 105, 0.15)', borderRadius: 12, borderWidth: 1, borderColor: 'rgba(5, 150, 105, 0.3)' },
  title: { color: theme.textMain, fontSize: 18, fontWeight: '900' },
  subtitle: { color: theme.textMuted, fontSize: 12, fontWeight: '600' },

  triageScroll: { marginBottom: 20 },
  pill: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: theme.border, marginRight: 10 },
  pillActive: { backgroundColor: theme.textMain, borderColor: theme.textMain },
  pillText: { fontSize: 12, fontWeight: '700', color: theme.textMuted },
  pillTextActive: { color: theme.bg },

  timelineContainer: { paddingLeft: 5 },
  timelineRow: { flexDirection: 'row', marginBottom: 15 },
  connector: { width: 30, alignItems: 'center' },
  dot: { width: 20, height: 20, borderRadius: 10, justifyContent: 'center', alignItems: 'center', zIndex: 2, borderWidth: 2, borderColor: theme.bg },
  line: { width: 2, flex: 1, backgroundColor: theme.border, marginTop: 2, marginBottom: -15 },

  logCard: { flex: 1, backgroundColor: theme.card, borderWidth: 1, borderColor: theme.border, borderLeftWidth: 3, borderRadius: 12, padding: 12, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 4 },
  logHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  logTime: { color: theme.textMain, fontSize: 12, fontWeight: '800' },
  logTypeBadge: { fontSize: 9, fontWeight: '800', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  logEquip: { color: theme.textMain, fontSize: 14, fontWeight: '800', marginBottom: 10 },
  
  terminalBox: { flexDirection: 'row', gap: 6, backgroundColor: 'rgba(0,0,0,0.2)', padding: 10, borderRadius: 6, borderWidth: 1, borderColor: theme.border, borderLeftWidth: 2, marginBottom: 8 },
  terminalText: { color: theme.textMain, fontSize: 12, fontFamily: 'monospace', flex: 1 },
  
  resolutionText: { color: theme.primary, fontSize: 11, fontStyle: 'italic', fontWeight: '600' }
});