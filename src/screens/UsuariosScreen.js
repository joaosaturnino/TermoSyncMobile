import {
  Globe,
  KeyRound,
  Lock,
  MapPin,
  Search,
  Settings,
  ShieldAlert,
  Store,
  UserCircle,
  Wrench
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
  info: '#38bdf8'
};

export default function UsuariosScreen() {
  const [busca, setBusca] = useState('');
  const [filtroPrivilegio, setFiltroPrivilegio] = useState('TODOS');

  // Simulação de Identidades
  const usuariosDb = [
    { id: 1, nome: 'Eng. Sistema', usuario: 'admin.root', role: 'ADMIN', cargo: 'Master' },
    { id: 2, nome: 'Carlos Silva', usuario: 'carlos.tec', role: 'MANUTENCAO', cargo: 'Técnico L2' },
    { id: 3, nome: 'Maria João', usuario: 'maria.j', role: 'LOJA', cargo: 'Gerente', filial: 'Loja Centro' },
  ];

  const kpis = useMemo(() => {
    let admin = 0; let tech = 0; let loja = 0;
    usuariosDb.forEach(u => {
      if (u.role === 'ADMIN') admin++;
      else if (u.role === 'MANUTENCAO') tech++;
      else if (u.role === 'LOJA') loja++;
    });
    return { total: usuariosDb.length, admin, tech, loja };
  }, [usuariosDb]);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        <View style={styles.headerBox}>
          <View style={styles.iconCircle}><KeyRound size={24} color={theme.info} /></View>
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={styles.title}>IAM (Acessos)</Text>
            <Text style={styles.subtitle}>Gestão de Identidade e Privilégios</Text>
          </View>
        </View>

        {/* SEARCH & KPIS */}
        <View style={styles.searchBox}>
          <Search size={18} color={theme.textMuted} />
          <TextInput style={styles.searchInput} placeholder="Procurar agente ou login..." placeholderTextColor={theme.textMuted} value={busca} onChangeText={setBusca} />
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.kpiScroll}>
          <TouchableOpacity style={[styles.kpiPill, filtroPrivilegio==='TODOS' && styles.kpiPillActive]} onPress={()=>setFiltroPrivilegio('TODOS')}>
            <Text style={[styles.kpiVal, filtroPrivilegio==='TODOS'&&styles.kpiValActive]}>{kpis.total}</Text><Text style={[styles.kpiLbl, filtroPrivilegio==='TODOS'&&styles.kpiValActive]}>Rede</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.kpiPill, {borderColor: theme.danger}, filtroPrivilegio==='ADMIN' && {backgroundColor: theme.danger}]} onPress={()=>setFiltroPrivilegio('ADMIN')}>
            <Text style={[styles.kpiVal, {color: theme.danger}, filtroPrivilegio==='ADMIN'&&{color:'white'}]}>{kpis.admin}</Text><Text style={[styles.kpiLbl, {color: theme.danger}, filtroPrivilegio==='ADMIN'&&{color:'white'}]}>L3 (Master)</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.kpiPill, {borderColor: theme.info}, filtroPrivilegio==='MANUTENCAO' && {backgroundColor: theme.info}]} onPress={()=>setFiltroPrivilegio('MANUTENCAO')}>
            <Text style={[styles.kpiVal, {color: theme.info}, filtroPrivilegio==='MANUTENCAO'&&{color:'white'}]}>{kpis.tech}</Text><Text style={[styles.kpiLbl, {color: theme.info}, filtroPrivilegio==='MANUTENCAO'&&{color:'white'}]}>L2 (Técnico)</Text>
          </TouchableOpacity>
        </ScrollView>

        {/* CARTÕES DE IDENTIDADE */}
        {usuariosDb.map(u => {
          if (filtroPrivilegio !== 'TODOS' && u.role !== filtroPrivilegio) return null;

          let roleColor = theme.success; let IconLevel = Store; let roleLabel = 'L1 (Loja)';
          if (u.role === 'ADMIN') { roleColor = theme.danger; IconLevel = ShieldAlert; roleLabel = 'L3 (Admin)'; }
          else if (u.role === 'MANUTENCAO') { roleColor = theme.info; IconLevel = Wrench; roleLabel = 'L2 (Técnico)'; }

          return (
            <View key={u.id} style={[styles.userCard, { borderLeftColor: roleColor }]}>
              <View style={styles.userHeader}>
                <View style={styles.avatarRow}>
                  <View style={[styles.avatar, { backgroundColor: roleColor }]}><Text style={styles.avatarText}>{u.nome.charAt(0)}</Text></View>
                  <View style={{ marginLeft: 10 }}>
                    <Text style={styles.userName}>{u.nome}</Text>
                    <Text style={styles.userCargo}>{u.cargo}</Text>
                  </View>
                </View>
                <View style={styles.actionsRow}>
                  <TouchableOpacity style={styles.actionBtn}><Settings size={16} color={theme.textMuted} /></TouchableOpacity>
                  <TouchableOpacity style={styles.actionBtn}><Lock size={16} color={theme.danger} /></TouchableOpacity>
                </View>
              </View>

              <View style={styles.userBody}>
                <View style={styles.badgeRow}>
                  <View style={styles.badgeLogin}><UserCircle size={12} color={theme.textMuted}/><Text style={styles.badgeLoginText}>@{u.usuario}</Text></View>
                  <View style={[styles.badgeRole, { backgroundColor: `${roleColor}15`, borderColor: `${roleColor}40` }]}>
                    <IconLevel size={10} color={roleColor}/><Text style={[styles.badgeRoleText, { color: roleColor }]}>{roleLabel}</Text>
                  </View>
                </View>
                <View style={styles.locationRow}>
                  {u.role === 'LOJA' ? <><MapPin size={12} color={theme.textMuted}/><Text style={styles.locText}>{u.filial}</Text></> : <><Globe size={12} color={theme.success}/><Text style={[styles.locText, {color: theme.success}]}>Acesso Global Autorizado</Text></>}
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
  headerBox: { flexDirection: 'row', alignItems: 'center', marginBottom: 20, backgroundColor: theme.card, padding: 15, borderRadius: 16, borderWidth: 1, borderColor: theme.border },
  iconCircle: { padding: 10, backgroundColor: 'rgba(56, 189, 248, 0.15)', borderRadius: 12, borderWidth: 1, borderColor: 'rgba(56, 189, 248, 0.3)' },
  title: { color: theme.textMain, fontSize: 18, fontWeight: '900' },
  subtitle: { color: theme.textMuted, fontSize: 12, fontWeight: '600' },

  searchBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: theme.card, borderWidth: 1, borderColor: theme.border, borderRadius: 12, paddingHorizontal: 15, paddingVertical: 10, marginBottom: 15 },
  searchInput: { flex: 1, color: theme.textMain, marginLeft: 10, fontSize: 15 },

  kpiScroll: { marginBottom: 20 },
  kpiPill: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: theme.border, marginRight: 10 },
  kpiPillActive: { backgroundColor: theme.textMain, borderColor: theme.textMain },
  kpiVal: { fontSize: 14, fontWeight: '900', color: theme.textMain },
  kpiLbl: { fontSize: 10, fontWeight: '700', color: theme.textMuted, textTransform: 'uppercase' },
  kpiValActive: { color: theme.bg },

  userCard: { backgroundColor: theme.card, borderWidth: 1, borderColor: theme.border, borderLeftWidth: 4, borderRadius: 12, padding: 15, marginBottom: 15 },
  userHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 15 },
  avatarRow: { flexDirection: 'row', alignItems: 'center' },
  avatar: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  avatarText: { color: 'white', fontSize: 16, fontWeight: '900' },
  userName: { color: theme.textMain, fontSize: 15, fontWeight: '800' },
  userCargo: { color: theme.textMuted, fontSize: 11, fontWeight: '600', textTransform: 'uppercase' },
  actionsRow: { flexDirection: 'row', gap: 8 },
  actionBtn: { padding: 6, backgroundColor: theme.bg, borderRadius: 8, borderWidth: 1, borderColor: theme.border },

  userBody: { gap: 10 },
  badgeRow: { flexDirection: 'row', gap: 10, flexWrap: 'wrap' },
  badgeLogin: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: theme.bg, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, borderWidth: 1, borderColor: theme.border },
  badgeLoginText: { color: theme.textMain, fontFamily: 'monospace', fontSize: 11, fontWeight: '700' },
  badgeRole: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, borderWidth: 1 },
  badgeRoleText: { fontSize: 10, fontWeight: '800', textTransform: 'uppercase' },
  
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 },
  locText: { color: theme.textMuted, fontSize: 11, fontWeight: '700' }
});