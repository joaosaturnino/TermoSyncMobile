import { Fingerprint, Lock, Search, UserCheck, UserX } from 'lucide-react-native';
import { useState } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function UsuariosScreen() {
  const [busca, setBusca] = useState('');

  // Dados mockados com estilo Cyber
  const utilizadores = [
    { id: 1, nome: 'Guilherme Silva', role: 'ROOT_ADMIN', status: 'Ativo', lastLogin: 'Agora mesmo', ip: '192.168.1.45' },
    { id: 2, nome: 'Emily Costa', role: 'SYS_ADMIN', status: 'Ativo', lastLogin: 'Há 5 min', ip: '10.0.0.12' },
    { id: 3, nome: 'Técnico Externo', role: 'GUEST_TECH', status: 'Bloqueado', lastLogin: 'Há 2 dias', ip: 'Desconhecido' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        <View style={styles.headerCard}>
          <Fingerprint size={28} color="#a855f7" />
          <View style={{ marginLeft: 12 }}>
            <Text style={styles.headerTitle}>IDENTIDADE & ACESSO (IAM)</Text>
            <Text style={styles.headerSubtitle}>Zero-Trust Security Protocol</Text>
          </View>
        </View>

        <View style={styles.searchBox}>
          <Search size={18} color="#94a3b8" />
          <TextInput style={styles.searchInput} placeholder="Procurar Credencial..." placeholderTextColor="#64748b" value={busca} onChangeText={setBusca} />
        </View>

        {utilizadores.map(user => (
          <View key={user.id} style={[styles.userCard, user.status === 'Bloqueado' && styles.userCardBlocked]}>
            <View style={styles.userHeader}>
              <View style={styles.avatar}><Text style={styles.avatarText}>{user.nome.charAt(0)}</Text></View>
              <View style={{ flex: 1 }}>
                <Text style={styles.userName}>{user.nome}</Text>
                <Text style={[styles.userRole, { color: user.role.includes('ADMIN') ? '#a855f7' : '#f59e0b' }]}>{user.role}</Text>
              </View>
              <View style={[styles.statusLed, user.status === 'Ativo' ? styles.ledGreen : styles.ledRed]} />
            </View>

            <View style={styles.metaGrid}>
              <View style={styles.metaItem}>
                <Text style={styles.metaLabel}>ÚLTIMO LOGIN</Text>
                <Text style={styles.metaValue}>{user.lastLogin}</Text>
              </View>
              <View style={styles.metaItem}>
                <Text style={styles.metaLabel}>ÚLTIMO IP</Text>
                <Text style={styles.metaValue}>{user.ip}</Text>
              </View>
            </View>

            <View style={styles.actionRow}>
              <TouchableOpacity style={styles.btnAction}>
                <Lock size={14} color="#cbd5e1" /><Text style={styles.btnActionText}>REDEFINIR JWT</Text>
              </TouchableOpacity>
              {user.status === 'Ativo' ? (
                <TouchableOpacity style={[styles.btnAction, {borderColor: '#ef4444'}]}>
                  <UserX size={14} color="#ef4444" /><Text style={[styles.btnActionText, {color: '#ef4444'}]}>REVOGAR</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity style={[styles.btnAction, {borderColor: '#10b981'}]}>
                  <UserCheck size={14} color="#10b981" /><Text style={[styles.btnActionText, {color: '#10b981'}]}>AUTORIZAR</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        ))}

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#020617' },
  scrollContent: { padding: 16 },
  headerCard: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  headerTitle: { fontSize: 16, fontWeight: '900', color: '#fff', letterSpacing: 0.5 },
  headerSubtitle: { fontSize: 11, color: '#94a3b8', fontWeight: 'bold' },
  searchBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#0b1120', borderWidth: 1, borderColor: '#1e293b', borderRadius: 10, paddingHorizontal: 12, height: 44, marginBottom: 20 },
  searchInput: { flex: 1, marginLeft: 8, color: '#fff', fontSize: 13, fontFamily: 'monospace' },
  
  userCard: { backgroundColor: '#0b1120', borderRadius: 12, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#1e293b', borderLeftWidth: 3, borderLeftColor: '#a855f7' },
  userCardBlocked: { borderLeftColor: '#ef4444', backgroundColor: 'rgba(239, 68, 68, 0.05)' },
  userHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 16, gap: 12 },
  avatar: { width: 36, height: 36, borderRadius: 8, backgroundColor: 'rgba(168, 85, 247, 0.2)', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#a855f7' },
  avatarText: { color: '#a855f7', fontWeight: '900', fontSize: 16 },
  userName: { color: '#fff', fontSize: 14, fontWeight: 'bold' },
  userRole: { fontSize: 10, fontWeight: '900', fontFamily: 'monospace', marginTop: 2 },
  statusLed: { width: 10, height: 10, borderRadius: 5 },
  ledGreen: { backgroundColor: '#10b981', shadowColor: '#10b981', shadowOpacity: 0.8, shadowRadius: 5, elevation: 3 },
  ledRed: { backgroundColor: '#ef4444', shadowColor: '#ef4444', shadowOpacity: 0.8, shadowRadius: 5, elevation: 3 },

  metaGrid: { flexDirection: 'row', gap: 12, backgroundColor: '#020617', padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#1e293b', marginBottom: 16 },
  metaItem: { flex: 1 },
  metaLabel: { fontSize: 9, color: '#64748b', fontWeight: 'bold', marginBottom: 4 },
  metaValue: { fontSize: 11, color: '#cbd5e1', fontFamily: 'monospace' },

  actionRow: { flexDirection: 'row', gap: 8 },
  btnAction: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 10, borderRadius: 8, borderWidth: 1, borderColor: '#334155', backgroundColor: '#020617' },
  btnActionText: { color: '#cbd5e1', fontSize: 10, fontWeight: '900', letterSpacing: 0.5 }
});