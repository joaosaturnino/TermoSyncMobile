import { Picker } from '@react-native-picker/picker';
import { DrawerContentScrollView, DrawerItemList } from '@react-navigation/drawer';
import { Activity, LogOut, MapPin, Moon, Sun, UserCheck } from 'lucide-react-native';
import { useContext } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { AppContext } from '../context/AppContext';

export default function CustomDrawer(props) {
  const { theme, isDarkMode, toggleTheme, logout, userRole, userFilial, filialAtiva, setFilialAtiva, listaFiliais } = useContext(AppContext);

  return (
    <View style={{ flex: 1, backgroundColor: theme.bg }}>
      <DrawerContentScrollView {...props} contentContainerStyle={{ backgroundColor: theme.bg }}>
        
        {/* CABEÇALHO DO DRAWER */}
        <View style={[styles.header, { borderBottomColor: theme.border }]}>
          <View style={styles.logoRow}>
            <View style={{ backgroundColor: '#f0fdf4', padding: 5, borderRadius: 8 }}><Activity color={theme.primary} size={24} /></View>
            <Text style={[styles.title, { color: theme.primary }]}>TermoSync</Text>
          </View>

          {/* FILTRO RBAC (Controlo de Acesso) */}
          <View style={styles.rbacContainer}>
            <View style={styles.rbacHeader}>
              {userRole === 'ADMIN' ? <MapPin size={14} color={theme.primary} /> : <UserCheck size={14} color={theme.primary} />}
              <Text style={[styles.rbacTitle, { color: theme.primary }]}>
                {userRole === 'ADMIN' ? 'REDE DE LOJAS' : 'ACESSO LOCAL'}
              </Text>
            </View>

            {userRole === 'ADMIN' ? (
              <View style={[styles.pickerBox, { borderColor: theme.border, backgroundColor: theme.card }]}>
                <Picker
                  selectedValue={filialAtiva}
                  onValueChange={(itemValue) => setFilialAtiva(itemValue)}
                  style={{ color: theme.textMain, height: 45 }}
                  dropdownIconColor={theme.textMain}
                >
                  {listaFiliais.map(f => <Picker.Item key={f} label={f === 'Todas' ? 'Visão Global Integrada' : f} value={f} />)}
                </Picker>
              </View>
            ) : (
              <Text style={[styles.localBox, { color: theme.textMain, borderColor: theme.border, backgroundColor: theme.card }]}>
                {userFilial}
              </Text>
            )}
          </View>
        </View>

        {/* LISTA DE PÁGINAS (Gerada automaticamente pelo DrawerNavigator) */}
        <View style={{ flex: 1, paddingTop: 10 }}>
          <DrawerItemList {...props} />
        </View>
      </DrawerContentScrollView>

      {/* RODAPÉ DO DRAWER (Tema e Sair) */}
      <View style={[styles.footer, { borderTopColor: theme.border, backgroundColor: theme.card }]}>
        <TouchableOpacity style={styles.footerBtn} onPress={toggleTheme}>
          {isDarkMode ? <Sun size={20} color={theme.warning} /> : <Moon size={20} color={theme.textMuted} />}
          <Text style={[styles.footerText, { color: theme.textMain }]}>{isDarkMode ? 'Modo Claro' : 'Modo Escuro'}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.footerBtn} onPress={logout}>
          <LogOut size={20} color={theme.danger} />
          <Text style={[styles.footerText, { color: theme.danger }]}>Encerrar Sessão</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { padding: 20, borderBottomWidth: 1 },
  logoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  title: { fontSize: 20, fontWeight: 'bold', marginLeft: 10 },
  rbacContainer: { marginTop: 5 },
  rbacHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8, gap: 5 },
  rbacTitle: { fontSize: 11, fontWeight: 'bold' },
  pickerBox: { borderWidth: 1, borderRadius: 8, overflow: 'hidden', justifyContent: 'center' },
  localBox: { padding: 12, borderWidth: 1, borderRadius: 8, fontSize: 14, fontWeight: '500' },
  footer: { padding: 20, borderTopWidth: 1 },
  footerBtn: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12 },
  footerText: { fontSize: 15, fontWeight: '600', marginLeft: 15 },
});