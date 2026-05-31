import { createDrawerNavigator } from '@react-navigation/drawer';
import { useContext } from 'react';
import { AppContext } from '../context/AppContext';
import CustomDrawer from './CustomDrawer';

// Importação das 17 Telas
import ChamadosScreen from '../screens/ChamadosScreen';
import ChatScreen from '../screens/ChatScreen';
import DashboardScreen from '../screens/DashboardScreen';
import EquipamentosScreen from '../screens/EquipamentosScreen';
import GestaoEmpresasScreen from '../screens/GestaoEmpresasScreen';
import HistoricoChamadosScreen from '../screens/HistoricoChamadosScreen';
import HistoricoScreen from '../screens/HistoricoScreen';
import LojasScreen from '../screens/LojasScreen';
import MapaCalorScreen from '../screens/MapaCalorScreen';
import MetrologiaScreen from '../screens/MetrologiaScreen';
import PainelDesenvolvedor from '../screens/PainelDesenvolvedor';
import ParametrosGlobaisScreen from '../screens/ParametrosGlobaisScreen';
import RelatoriosScreen from '../screens/RelatoriosScreen';
import SensoresScreen from '../screens/SensoresScreen';
import SimuladorScreen from '../screens/SimuladorScreen';
import Sobre from '../screens/Sobre';
import UsuariosScreen from '../screens/UsuariosScreen';

const Drawer = createDrawerNavigator();

export default function DrawerNavigator() {
  const contexto = useContext(AppContext);
  const theme = contexto?.theme || { background: '#0f172a', card: '#1e293b' };

  return (
    <Drawer.Navigator 
      drawerContent={props => <CustomDrawer {...props} />}
      screenOptions={{
        headerShown: false, // Esconde o cabeçalho nativo (já usamos o nosso)
        sceneContainerStyle: { backgroundColor: theme.background },
        drawerStyle: { backgroundColor: theme.card, width: '80%' }
      }}
      initialRouteName="Dashboard"
    >
      <Drawer.Screen name="Dashboard" component={DashboardScreen} />
      <Drawer.Screen name="Mapa" component={MapaCalorScreen} />
      <Drawer.Screen name="Sensores" component={SensoresScreen} />
      <Drawer.Screen name="Chamados" component={ChamadosScreen} />
      <Drawer.Screen name="HistoricoChamados" component={HistoricoChamadosScreen} />
      <Drawer.Screen name="Equipamentos" component={EquipamentosScreen} />
      <Drawer.Screen name="Metrologia" component={MetrologiaScreen} />
      <Drawer.Screen name="Parametros" component={ParametrosGlobaisScreen} />
      <Drawer.Screen name="Chat" component={ChatScreen} />
      <Drawer.Screen name="Relatorios" component={RelatoriosScreen} />
      <Drawer.Screen name="Historico" component={HistoricoScreen} />
      <Drawer.Screen name="Lojas" component={LojasScreen} />
      <Drawer.Screen name="Usuarios" component={UsuariosScreen} />
      <Drawer.Screen name="Sobre" component={Sobre} />
      
      {/* Telas Exclusivas DEV */}
      <Drawer.Screen name="PainelDev" component={PainelDesenvolvedor} />
      <Drawer.Screen name="Empresas" component={GestaoEmpresasScreen} />
      <Drawer.Screen name="Simulador" component={SimuladorScreen} />
    </Drawer.Navigator>
  );
}