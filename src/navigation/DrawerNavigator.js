import { createDrawerNavigator } from '@react-navigation/drawer';
import { Activity, Thermometer } from 'lucide-react-native';
import { theme } from '../api/api';
import DashboardScreen from '../screens/DashboardScreen';
import SensoresScreen from '../screens/SensoresScreen';

const Drawer = createDrawerNavigator();

export default function DrawerNavigator() {
  return (
    <Drawer.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: theme.primary },
        headerTintColor: '#fff',
        drawerActiveBackgroundColor: theme.primary,
        drawerActiveTintColor: '#fff',
        drawerInactiveTintColor: theme.textMain,
      }}
    >
      <Drawer.Screen 
        name="Dashboard" 
        component={DashboardScreen} 
        options={{
          title: 'Painel Central',
          drawerIcon: ({ color }) => <Activity color={color} size={20} />
        }} 
      />
      <Drawer.Screen 
        name="Motores" 
        children={() => <SensoresScreen isTemp={true} />} 
        options={{
          title: 'Monitorização Térmica',
          drawerIcon: ({ color }) => <Thermometer color={color} size={20} />
        }} 
      />
      {/* Adicione aqui as telas de Umidade, Equipamentos, Relatórios e Histórico seguindo o mesmo padrão */}
    </Drawer.Navigator>
  );
}