import {
  AlertTriangle, ClipboardCheck, Edit,
  PlusCircle,
  Search,
  Server,
  Settings,
  Thermometer,
  X,
  Zap
} from 'lucide-react-native';
import { useMemo, useState } from 'react';
import {
  SafeAreaView,
  ScrollView, StyleSheet,
  Text, TextInput,
  TouchableOpacity,
  View
} from 'react-native';

const theme = {
  bg: '#020617', card: '#0f172a', textMain: '#f8fafc', textMuted: '#94a3b8',
  border: '#1e293b', primary: '#059669', secondary: '#10b981', danger: '#ef4444',
  warning: '#f59e0b', info: '#38bdf8'
};

export default function EquipamentosScreen() {
  const [buscaAtivo, setBuscaAtivo] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);

  // Simulação de Dados
  const ativosExibidos = [
    { id: 1, nome: 'CONG-01 Frios', filial: 'Loja Centro', setor: 'Laticínios', tipo: 'Congelador', temp_min: -20, temp_max: -15, data_calibracao: '2025-05-10', motor_ligado: true, em_degelo: false },
    { id: 2, nome: 'REF-04 Ilha', filial: 'Loja Norte', setor: 'Talho', tipo: 'Refrigerador Aberto', temp_min: 2, temp_max: 6, data_calibracao: '2026-02-15', motor_ligado: false, em_degelo: false },
  ];

  // KPIs Preditivos
  const kpis = useMemo(() => {
    let riscoCalib = 0; let offlines = 0;
    ativosExibidos.forEach(eq => {
      const diasCalib = eq.data_calibracao ? Math.floor((Date.now() - new Date(eq.data_calibracao).getTime()) / (1000 * 60 * 60 * 24)) : 0;
      if (diasCalib > 330) riscoCalib++;
      if (!eq.motor_ligado) offlines++;
    });
    return { total: ativosExibidos.length, riscoCalib, offlines };
  }, [ativosExibidos]);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        {/* CABEÇALHO */}
        <View style={styles.header}>
          <View style={styles.titleRow}>
            <Server size={24} color={theme.info} />
            <View style={{ marginLeft: 10 }}>
              <Text style={styles.title}>Inventário IoT</Text>
              <Text style={styles.subtitle}>Metrologia e configuração de SLA</Text>
            </View>
          </View>
          
          <TouchableOpacity style={[styles.btnToggleForm, isFormOpen && styles.btnToggleFormActive]} onPress={() => setIsFormOpen(!isFormOpen)}>
            {isFormOpen ? <X size={20} color={theme.textMain} /> : <PlusCircle size={20} color="white" />}
          </TouchableOpacity>
        </View>

        {/* SEARCH BAR */}
        <View style={styles.searchBox}>
          <Search size={18} color={theme.textMuted} />
          <TextInput 
            style={styles.searchInput}
            placeholder="Procurar ativo ou setor..."
            placeholderTextColor={theme.textMuted}
            value={buscaAtivo}
            onChangeText={setBuscaAtivo}
          />
        </View>

        {/* KPIS PREDITIVOS */}
        <View style={styles.kpiRow}>
          <View style={styles.kpiCard}>
            <View style={[styles.kpiIconBox, { backgroundColor: 'rgba(56, 189, 248, 0.1)' }]}><Server size={18} color={theme.info}/></View>
            <View><Text style={styles.kpiVal}>{kpis.total}</Text><Text style={styles.kpiLbl}>Instalados</Text></View>
          </View>
          <View style={[styles.kpiCard, kpis.riscoCalib > 0 && styles.kpiCardDanger]}>
            <View style={[styles.kpiIconBox, { backgroundColor: 'rgba(239, 68, 68, 0.1)' }]}><ClipboardCheck size={18} color={theme.danger}/></View>
            <View><Text style={[styles.kpiVal, kpis.riscoCalib > 0 && {color: theme.danger}]}>{kpis.riscoCalib}</Text><Text style={styles.kpiLbl}>Risco Calib.</Text></View>
          </View>
          <View style={[styles.kpiCard, kpis.offlines > 0 && styles.kpiCardWarning]}>
            <View style={[styles.kpiIconBox, { backgroundColor: 'rgba(245, 158, 11, 0.1)' }]}><AlertTriangle size={18} color={theme.warning}/></View>
            <View><Text style={[styles.kpiVal, kpis.offlines > 0 && {color: theme.warning}]}>{kpis.offlines}</Text><Text style={styles.kpiLbl}>Inativos</Text></View>
          </View>
        </View>

        {/* SMART PANEL (FORMULÁRIO OCULTO) */}
        {isFormOpen && (
          <View style={styles.formPanel}>
            <View style={styles.formHeader}>
              <Settings size={18} color={theme.primary} />
              <Text style={styles.formTitle}>Perfil do Novo Ativo</Text>
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Identificador na Rede</Text>
              <TextInput style={styles.input} placeholder="Ex: CONG-01 Corredor" placeholderTextColor={theme.textMuted} />
            </View>
            
            <TouchableOpacity style={styles.btnAnvisa}>
              <Zap size={14} color={theme.secondary} />
              <Text style={styles.btnAnvisaText}>Aplicar Norma ANVISA</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.btnSubmit}>
              <Text style={styles.btnSubmitText}>Consolidar Ativo na Base</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* LISTA DE EQUIPAMENTOS */}
        {ativosExibidos.map(eq => {
          const diasCalib = eq.data_calibracao ? Math.floor((Date.now() - new Date(eq.data_calibracao).getTime()) / (1000 * 60 * 60 * 24)) : 0;
          const calibPercent = Math.min(100, Math.max(0, (diasCalib / 365) * 100));
          const isExpirado = diasCalib > 365;
          const statusColor = eq.em_degelo ? theme.secondary : (!eq.motor_ligado ? theme.danger : theme.success);

          return (
            <View key={eq.id} style={styles.equipCard}>
              <View style={styles.equipHeader}>
                <View style={styles.nodeLocation}>
                  <View style={[styles.statusRing, { backgroundColor: statusColor }]} />
                  <Text style={styles.equipFilial}>{eq.filial}</Text>
                </View>
                <View style={styles.equipActions}>
                  <TouchableOpacity style={styles.iconBtn}><Edit size={16} color={theme.textMuted} /></TouchableOpacity>
                  <TouchableOpacity style={styles.iconBtn}><X size={16} color={theme.danger} /></TouchableOpacity>
                </View>
              </View>

              <Text style={styles.equipName}>{eq.nome}</Text>
              <Text style={styles.equipType}>{eq.tipo} • {eq.setor}</Text>

              {/* Barra de Metrologia Mobile */}
              <View style={styles.metrologyBox}>
                <View style={styles.metroLabels}>
                  <Text style={[styles.metroText, { color: isExpirado ? theme.danger : theme.textMuted }]}>
                    {isExpirado ? '⚠️ Certificado Expirado' : 'Validade de Calibração'}
                  </Text>
                  <Text style={styles.metroDays}>{diasCalib} dias</Text>
                </View>
                <View style={styles.metroTrack}>
                  <View style={[styles.metroFill, { width: `${calibPercent}%`, backgroundColor: isExpirado ? theme.danger : theme.success }]} />
                </View>
              </View>

              <View style={styles.slaBox}>
                <View style={styles.slaTag}>
                  <Thermometer size={12} color={theme.danger} />
                  <Text style={styles.slaTagText}>{eq.temp_min}°C a {eq.temp_max}°C</Text>
                </View>
              </View>
            </View>
          );
        })}

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.bg },
  scrollContent: { padding: 15, paddingBottom: 40 },
  
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  titleRow: { flexDirection: 'row', alignItems: 'center' },
  title: { color: theme.textMain, fontSize: 20, fontWeight: '900', letterSpacing: -0.5 },
  subtitle: { color: theme.textMuted, fontSize: 12, fontWeight: '600' },
  btnToggleForm: { backgroundColor: theme.primary, padding: 10, borderRadius: 12, shadowColor: theme.primary, shadowOpacity: 0.3, shadowRadius: 10 },
  btnToggleFormActive: { backgroundColor: 'transparent', borderWidth: 1, borderColor: theme.border },

  searchBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: theme.card, borderWidth: 1, borderColor: theme.border, borderRadius: 12, paddingHorizontal: 15, paddingVertical: 10, marginBottom: 20 },
  searchInput: { flex: 1, color: theme.textMain, marginLeft: 10, fontSize: 15 },

  kpiRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  kpiCard: { flex: 1, backgroundColor: theme.card, borderWidth: 1, borderColor: theme.border, borderRadius: 12, padding: 10, marginHorizontal: 4, alignItems: 'center', flexDirection: 'row', gap: 8 },
  kpiCardDanger: { borderColor: 'rgba(239, 68, 68, 0.4)' },
  kpiCardWarning: { borderColor: 'rgba(245, 158, 11, 0.4)' },
  kpiIconBox: { padding: 8, borderRadius: 10 },
  kpiVal: { color: theme.textMain, fontSize: 16, fontWeight: '900' },
  kpiLbl: { color: theme.textMuted, fontSize: 9, fontWeight: 'bold', textTransform: 'uppercase' },

  formPanel: { backgroundColor: 'rgba(255,255,255,0.02)', borderWidth: 1, borderColor: theme.primary, borderRadius: 16, padding: 15, marginBottom: 20 },
  formHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 15, borderBottomWidth: 1, borderBottomColor: theme.border, paddingBottom: 10 },
  formTitle: { color: theme.textMain, fontSize: 14, fontWeight: '800', textTransform: 'uppercase' },
  inputGroup: { marginBottom: 15 },
  label: { color: theme.textMuted, fontSize: 12, fontWeight: '700', marginBottom: 6 },
  input: { backgroundColor: theme.bg, borderWidth: 1, borderColor: theme.border, borderRadius: 10, padding: 12, color: theme.textMain },
  btnAnvisa: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: 'rgba(56, 189, 248, 0.1)', borderWidth: 1, borderColor: 'rgba(56, 189, 248, 0.3)', padding: 12, borderRadius: 10, marginBottom: 15 },
  btnAnvisaText: { color: theme.secondary, fontWeight: '800', fontSize: 12 },
  btnSubmit: { backgroundColor: theme.primary, padding: 14, borderRadius: 10, alignItems: 'center' },
  btnSubmitText: { color: 'white', fontWeight: '800', fontSize: 14 },

  equipCard: { backgroundColor: theme.card, borderWidth: 1, borderColor: theme.border, borderRadius: 16, padding: 15, marginBottom: 15, shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 5 },
  equipHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  nodeLocation: { flexDirection: 'row', alignItems: 'center' },
  statusRing: { width: 10, height: 10, borderRadius: 5, marginRight: 8 },
  equipFilial: { color: theme.textMuted, fontSize: 12, fontWeight: '700', textTransform: 'uppercase' },
  equipActions: { flexDirection: 'row', gap: 10 },
  iconBtn: { padding: 6, backgroundColor: theme.bg, borderRadius: 8, borderWidth: 1, borderColor: theme.border },

  equipName: { color: theme.textMain, fontSize: 18, fontWeight: '900' },
  equipType: { color: theme.textMuted, fontSize: 12, fontWeight: '600', marginBottom: 15 },

  metrologyBox: { marginBottom: 15 },
  metroLabels: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  metroText: { fontSize: 10, fontWeight: '800', textTransform: 'uppercase' },
  metroDays: { color: theme.textMain, fontSize: 11, fontWeight: '800' },
  metroTrack: { height: 6, backgroundColor: theme.border, borderRadius: 3, overflow: 'hidden' },
  metroFill: { height: '100%', borderRadius: 3 },

  slaBox: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  slaTag: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: theme.bg, borderWidth: 1, borderColor: theme.border, paddingVertical: 4, paddingHorizontal: 8, borderRadius: 6 },
  slaTagText: { color: theme.textMain, fontSize: 11, fontFamily: 'monospace', fontWeight: 'bold' }
});