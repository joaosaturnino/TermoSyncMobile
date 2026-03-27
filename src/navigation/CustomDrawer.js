import { MaterialCommunityIcons } from '@expo/vector-icons';
import { DrawerContentScrollView, DrawerItem, DrawerItemList } from '@react-navigation/drawer';
import { useContext } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { AppContext } from '../context/AppContext';

export default function CustomDrawer(props) {
  const { logout, nomeLogado, papelLogado, loginAtivo } = useContext(AppContext);
  const inicial = nomeLogado ? nomeLogado.charAt(0).toUpperCase() : 'U';

  return (
    <View style={{ flex: 1 }}>
      <DrawerContentScrollView {...props} contentContainerStyle={{ backgroundColor: '#0f172a' }}>
        <View style={styles.header}>
          <View style={styles.logoBox}>
            <MaterialCommunityIcons name="snowflake" size={32} color="#38bdf8" />
          </View>
          <Text style={styles.headerTitle}>TermoSync</Text>
        </View>

        <View style={styles.profileSection}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{inicial}</Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName} numberOfLines={1}>{nomeLogado || 'Utilizador'}</Text>
            <Text style={styles.profileRole}>@{loginAtivo} • {papelLogado}</Text>
          </View>
        </View>

        <View style={styles.menuContainer}>
          <DrawerItemList {...props} />
        </View>
      </DrawerContentScrollView>
      
      <View style={styles.footer}>
        <DrawerItem
          label="Encerrar Sessão"
          labelStyle={{ color: '#ef4444', fontWeight: 'bold' }}
          icon={({ size }) => <MaterialCommunityIcons name="logout" color="#ef4444" size={size} />}
          onPress={logout}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { padding: 20, flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.1)' },
  logoBox: { backgroundColor: 'white', padding: 5, borderRadius: 8, marginRight: 10 },
  headerTitle: { color: 'white', fontSize: 22, fontWeight: 'bold' },
  profileSection: { flexDirection: 'row', alignItems: 'center', padding: 15, backgroundColor: 'rgba(255,255,255,0.05)', margin: 10, borderRadius: 10 },
  avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#3b82f6', justifyContent: 'center', alignItems: 'center' },
  avatarText: { color: 'white', fontSize: 18, fontWeight: 'bold' },
  profileInfo: { marginLeft: 12, flex: 1 },
  profileName: { color: 'white', fontSize: 16, fontWeight: 'bold' },
  profileRole: { color: '#94a3b8', fontSize: 12, marginTop: 2 },
  menuContainer: { flex: 1, backgroundColor: '#fff', paddingTop: 10 },
  footer: { padding: 10, borderTopWidth: 1, borderTopColor: '#e2e8f0', backgroundColor: '#fff' }
});