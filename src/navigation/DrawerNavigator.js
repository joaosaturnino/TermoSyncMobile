import { createDrawerNavigator } from '@react-navigation/drawer';
import {
    Activity,
    Droplets,
    History,
    Leaf,
    Settings,
    Thermometer
} from 'lucide-react-native';
import { useContext } from 'react';

// Importação das Telas (Screens)
import DashboardScreen from '../screens/DashboardScreen';
import EquipamentosScreen from '../screens/EquipamentosScreen';
import HistoricoScreen from '../screens/HistoricoScreen';
import RelatoriosScreen from '../screens/RelatoriosScreen';
import SensoresScreen from '../screens/SensoresScreen';

// Importação do Custom Drawer e Contexto (Para Modo Escuro, Sair e RBAC)
import { AppContext } from '../context/AppContext';
import CustomDrawer from './CustomDrawer';

const Drawer = createDrawerNavigator();

export default function DrawerNavigator() {
  // Consumir o tema global definido no AppContext
  const { theme } = useContext(AppContext);

  return (
    <Drawer.Navigator
      // Injeta o menu lateral personalizado que criámos
      drawerContent={(props) => <CustomDrawer {...props} />}
      initialRouteName="Dashboard"
      screenOptions={{
        // Estilização do Header (Barra de cima) adaptada ao Tema
        headerStyle: { backgroundColor: theme.primary },
        headerTintColor: '#fff',
        headerTitleAlign: 'center',
        headerTitleStyle: { fontWeight: 'bold' },
        
        // Estilização do Menu Lateral (Drawer) adaptada ao Tema
        drawerActiveBackgroundColor: theme.primary,
        drawerActiveTintColor: '#fff',
        drawerInactiveTintColor: theme.textMain,
        drawerLabelStyle: { fontSize: 15, fontWeight: '600', marginLeft: -10 },
        drawerItemStyle: { borderRadius: 8, paddingHorizontal: 5 },
        
        // Garante que o fundo das telas muda para escuro/claro automaticamente
        sceneContainerStyle: { backgroundColor: theme.bg } 
      }}
    >
      <Drawer.Screen 
        name="Dashboard" 
        component={DashboardScreen} 
        options={{
          title: 'Painel Central',
          drawerIcon: ({ color }) => <Activity color={color} size={22} />
        }} 
      />
      
      <Drawer.Screen 
        name="Motores" 
        children={() => <SensoresScreen isTemp={true} />} 
        options={{
          title: 'Monitorização Térmica',
          drawerIcon: ({ color }) => <Thermometer color={color} size={22} />
        }} 
      />
      
      <Drawer.Screen 
        name="Umidade" 
        children={() => <SensoresScreen isTemp={false} />} 
        options={{
          title: 'Monitorização Humidade',
          drawerIcon: ({ color }) => <Droplets color={color} size={22} />
        }} 
      />
      
      <Drawer.Screen 
        name="Equipamentos" 
        component={EquipamentosScreen} 
        options={{
          title: 'Metrologia & Instalações',
          drawerIcon: ({ color }) => <Settings color={color} size={22} />
        }} 
      />
      
      <Drawer.Screen 
        name="Relatorios" 
        component={RelatoriosScreen} 
        options={{
          title: 'Sustentabilidade ESG',
          drawerIcon: ({ color }) => <Leaf color={color} size={22} />
        }} 
      />
      
      <Drawer.Screen 
        name="Historico" 
        component={HistoricoScreen} 
        options={{
          title: 'Auditoria RDC (Logs)',
          drawerIcon: ({ color }) => <History color={color} size={22} />
        }} 
      />
    </Drawer.Navigator>
  );
}