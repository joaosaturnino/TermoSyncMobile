import { MaterialCommunityIcons } from '@expo/vector-icons';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { useContext } from 'react';

import ChamadosScreen from '../screens/ChamadosScreen';
import DashboardScreen from '../screens/DashboardScreen';
import EquipamentosScreen from '../screens/EquipamentosScreen';
import HistoricoChamadosScreen from '../screens/HistoricoChamadosScreen';
import HistoricoScreen from '../screens/HistoricoScreen';
import LojasScreen from '../screens/LojasScreen';
import RelatoriosScreen from '../screens/RelatoriosScreen';
import SensoresScreen from '../screens/SensoresScreen';
import UsuariosScreen from '../screens/UsuariosScreen';

import { AppContext } from '../context/AppContext';
import CustomDrawer from './CustomDrawer';

const Drawer = createDrawerNavigator();

export default function DrawerNavigator() {
  const { userRole, notificacoes } = useContext(AppContext);
  const totalNotifs = notificacoes.length;

  return (
    <Drawer.Navigator
      drawerContent={(props) => <CustomDrawer {...props} />}
      screenOptions={{
        headerStyle: { backgroundColor: '#0f172a' },
        headerTintColor: '#fff',
        drawerActiveBackgroundColor: 'rgba(56, 189, 248, 0.1)',
        drawerActiveTintColor: '#0284c7',
        drawerInactiveTintColor: '#475569',
        drawerLabelStyle: { fontWeight: 'bold' }
      }}
    >
      <Drawer.Screen name="Painel Central" component={DashboardScreen} 
        options={{ 
          drawerIcon: ({ color }) => <MaterialCommunityIcons name="view-dashboard" size={22} color={color} />,
          drawerLabel: `Painel Central ${totalNotifs > 0 ? `(${totalNotifs})` : ''}`
        }} 
      />
      <Drawer.Screen name="Monitorização Térmica" component={SensoresScreen} initialParams={{ tipoSensor: 'temperatura' }} options={{ drawerIcon: ({ color }) => <MaterialCommunityIcons name="thermometer" size={22} color={color} /> }} />
      <Drawer.Screen name="Monitorização Humidade" component={SensoresScreen} initialParams={{ tipoSensor: 'umidade' }} options={{ drawerIcon: ({ color }) => <MaterialCommunityIcons name="water-percent" size={22} color={color} /> }} />
      <Drawer.Screen name="Metrologia (Máquinas)" component={EquipamentosScreen} options={{ drawerIcon: ({ color }) => <MaterialCommunityIcons name="fridge" size={22} color={color} /> }} />
      <Drawer.Screen name="Auditoria RDC (Logs)" component={HistoricoScreen} options={{ drawerIcon: ({ color }) => <MaterialCommunityIcons name="history" size={22} color={color} /> }} />
      <Drawer.Screen name="Sustentabilidade ESG" component={RelatoriosScreen} options={{ drawerIcon: ({ color }) => <MaterialCommunityIcons name="leaf" size={22} color={color} /> }} />
      
      <Drawer.Screen name="Chamados Técnicos" component={ChamadosScreen} options={{ drawerIcon: ({ color }) => <MaterialCommunityIcons name="tools" size={22} color={color} /> }} />
      <Drawer.Screen name="Histórico de OS Antigas" component={HistoricoChamadosScreen} options={{ drawerIcon: ({ color }) => <MaterialCommunityIcons name="archive" size={22} color={color} /> }} />

      {userRole === 'ADMIN' && (
        <>
          <Drawer.Screen name="Lojas e Unidades" component={LojasScreen} options={{ drawerIcon: ({ color }) => <MaterialCommunityIcons name="store" size={22} color={color} /> }} />
          <Drawer.Screen name="Gestão de Acessos" component={UsuariosScreen} options={{ drawerIcon: ({ color }) => <MaterialCommunityIcons name="account-group" size={22} color={color} /> }} />
        </>
      )}
    </Drawer.Navigator>
  );
}