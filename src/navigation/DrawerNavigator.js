import { MaterialCommunityIcons } from '@expo/vector-icons';
import { createDrawerNavigator } from '@react-navigation/drawer';
import React, { useContext } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { AppContext } from '../context/AppContext';
import CustomDrawer from './CustomDrawer';

import ChamadosScreen from '../screens/ChamadosScreen';
import DashboardScreen from '../screens/DashboardScreen';
import EquipamentosScreen from '../screens/EquipamentosScreen';
import HistoricoChamadosScreen from '../screens/HistoricoChamadosScreen';
import HistoricoScreen from '../screens/HistoricoScreen';
import LojasScreen from '../screens/LojasScreen';
import RelatoriosScreen from '../screens/RelatoriosScreen';
import SensoresScreen from '../screens/SensoresScreen';
import UsuariosScreen from '../screens/UsuariosScreen';

const Drawer = createDrawerNavigator();

export default function DrawerNavigator() {
  const { userRole, isDarkMode, toggleTheme, latencia, isOffline, somAtivoState, alternarSom, theme, notificacoes } = useContext(AppContext);
  const totalNotifs = notificacoes?.length || 0;

  return (
    <Drawer.Navigator
      drawerContent={(props) => <CustomDrawer {...props} />}
      screenOptions={{
        // 🔴 AQUI ESTÁ O SEGREDO: Fundo do Drawer sempre verde!
        drawerStyle: { backgroundColor: '#059669' },
        drawerActiveBackgroundColor: 'rgba(255,255,255,0.2)',
        drawerActiveTintColor: '#ffffff',
        drawerInactiveTintColor: 'rgba(255,255,255,0.7)',
        drawerLabelStyle: { fontWeight: 'bold', fontSize: 13 },
        
        // O Header acompanha o fundo dos Cards (Branco no claro, Azul Escuro no dark)
        headerStyle: { backgroundColor: theme.card, borderBottomWidth: 1, borderBottomColor: theme.border, shadowOpacity: 0, elevation: 0 },
        headerTintColor: theme.textMain,
        
        headerRight: () => (
          <View style={{ flexDirection: 'row', alignItems: 'center', marginRight: 15, gap: 12 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: isDarkMode ? '#334155' : '#f1f5f9', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 20, borderWidth: 1, borderColor: theme.border }}>
              <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: isOffline ? theme.danger : (latencia === 0 ? theme.textMuted : (latencia < 80 ? theme.success : theme.warning)), marginRight: 6 }} />
              <Text style={{ color: isOffline ? theme.danger : theme.textMain, fontSize: 11, fontWeight: 'bold' }}>
                {isOffline ? 'Offline' : (latencia === 0 ? 'Ligando...' : `${latencia}ms`)}
              </Text>
            </View>

            <TouchableOpacity onPress={alternarSom} style={{ padding: 4 }}>
              <MaterialCommunityIcons name={somAtivoState ? "bell-ring" : "bell-off"} size={22} color={somAtivoState ? theme.primary : theme.textMuted} />
            </TouchableOpacity>

            <TouchableOpacity onPress={toggleTheme} style={{ padding: 4 }}>
              <MaterialCommunityIcons name={isDarkMode ? "weather-night" : "weather-sunny"} size={22} color={isDarkMode ? theme.info : theme.warning} />
            </TouchableOpacity>
          </View>
        )
      }}
    >
      <Drawer.Screen name="Painel Central" component={DashboardScreen} options={{ drawerIcon: ({ color }) => <MaterialCommunityIcons name="view-dashboard" size={22} color={color} />, drawerLabel: `Painel Central ${totalNotifs > 0 ? `(${totalNotifs})` : ''}` }} />
      <Drawer.Screen name="Monitorização Térmica" component={SensoresScreen} initialParams={{ tipoSensor: 'temperatura' }} options={{ drawerIcon: ({ color }) => <MaterialCommunityIcons name="thermometer" size={22} color={color} /> }} />
      <Drawer.Screen name="Monitorização Humidade" component={SensoresScreen} initialParams={{ tipoSensor: 'umidade' }} options={{ drawerIcon: ({ color }) => <MaterialCommunityIcons name="water-percent" size={22} color={color} /> }} />
      <Drawer.Screen name="Metrologia IoT" component={EquipamentosScreen} options={{ drawerIcon: ({ color }) => <MaterialCommunityIcons name="cog" size={22} color={color} /> }} />
      <Drawer.Screen name="Gestão ESG" component={RelatoriosScreen} options={{ drawerIcon: ({ color }) => <MaterialCommunityIcons name="leaf" size={22} color={color} /> }} />
      <Drawer.Screen name="Auditoria RDC" component={HistoricoScreen} options={{ drawerIcon: ({ color }) => <MaterialCommunityIcons name="history" size={22} color={color} /> }} />
      <Drawer.Screen name="Ordens de Serviço" component={ChamadosScreen} options={{ drawerIcon: ({ color }) => <MaterialCommunityIcons name="tools" size={22} color={color} /> }} />
      <Drawer.Screen name="Histórico OS" component={HistoricoChamadosScreen} options={{ drawerIcon: ({ color }) => <MaterialCommunityIcons name="archive" size={22} color={color} /> }} />
      {userRole === 'ADMIN' && (
        <>
          <Drawer.Screen name="Lojas e Unidades" component={LojasScreen} options={{ drawerIcon: ({ color }) => <MaterialCommunityIcons name="store" size={22} color={color} /> }} />
          <Drawer.Screen name="Acessos" component={UsuariosScreen} options={{ drawerIcon: ({ color }) => <MaterialCommunityIcons name="account-group" size={22} color={color} /> }} />
        </>
      )}
    </Drawer.Navigator>
  );
}