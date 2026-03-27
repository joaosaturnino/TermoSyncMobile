import { createDrawerNavigator } from '@react-navigation/drawer';
import { setAudioModeAsync, useAudioPlayer } from 'expo-audio';
import { Activity, Droplets, History, Leaf, Settings, Thermometer, Users, Wrench } from 'lucide-react-native';
import { useContext, useEffect, useRef } from 'react';
import Toast from 'react-native-toast-message';

import { api, getSocket } from '../api/api';
import { AppContext } from '../context/AppContext';
import CustomDrawer from './CustomDrawer';

import DashboardScreen from '../screens/DashboardScreen';
import EquipamentosScreen from '../screens/EquipamentosScreen';
import HistoricoScreen from '../screens/HistoricoScreen';
import RelatoriosScreen from '../screens/RelatoriosScreen';
import SensoresScreen from '../screens/SensoresScreen';
// 🔴 NOVAS TELAS
import ChamadosScreen from '../screens/ChamadosScreen';
import UsuariosScreen from '../screens/UsuariosScreen';

const Drawer = createDrawerNavigator();
const MotoresScreen = (props) => <SensoresScreen {...props} isTemp={true} />;
const UmidadeScreen = (props) => <SensoresScreen {...props} isTemp={false} />;
const ALERTA_SOUND = require('../assets/sounds/alert.mp3');

export default function DrawerNavigator() {
  const { theme, userRole } = useContext(AppContext);
  const idsConhecidos = useRef(new Set()); 
  const isFirstLoad = useRef(true); 
  const player = useAudioPlayer(ALERTA_SOUND);

  const tocarAlerta = async () => {
    try {
      await setAudioModeAsync({ playsInSilentMode: true });
      player.seekTo(0); player.play();
    } catch (error) { }
  };

  useEffect(() => {
    const socket = getSocket();
    const verificarNovosAlertas = async () => {
      try {
        const res = await api.get('/api/notificacoes');
        const alertasAtuais = res.data;

        if (isFirstLoad.current) {
          idsConhecidos.current = new Set(alertasAtuais.map(n => n.id));
          isFirstLoad.current = false; return;
        }

        alertasAtuais.forEach(notif => {
          if (!idsConhecidos.current.has(notif.id)) {
            tocarAlerta();
            Toast.show({
              type: 'alertaESG', text1: `🚨 ALERTA: ${notif.equipamento_nome}`, text2: notif.mensagem,
              props: { tipo: notif.tipo_alerta }, position: 'top', topOffset: 55, visibilityTime: 5000
            });
          }
        });
        idsConhecidos.current = new Set(alertasAtuais.map(n => n.id));
      } catch (error) { }
    };

    verificarNovosAlertas();
    socket.on('atualizacao_dados', verificarNovosAlertas);
    return () => socket.disconnect();
  }, [player]);

  return (
    <Drawer.Navigator
      drawerContent={(props) => <CustomDrawer {...props} />}
      screenOptions={{
        headerStyle: { backgroundColor: theme.primary },
        headerTintColor: '#fff',
        headerTitleAlign: 'center',
        headerTitleStyle: { fontWeight: 'bold' },
        drawerActiveBackgroundColor: theme.primary,
        drawerActiveTintColor: '#fff',
        drawerInactiveTintColor: theme.textMain,
        drawerLabelStyle: { fontSize: 15, fontWeight: '600', marginLeft: -10 },
        drawerItemStyle: { borderRadius: 8, paddingHorizontal: 5 },
        sceneContainerStyle: { backgroundColor: theme.bg } 
      }}
    >
      <Drawer.Screen name="Dashboard" component={DashboardScreen} options={{ title: 'Painel Central', drawerIcon: ({ color }) => <Activity color={color} size={22} /> }} />
      <Drawer.Screen name="Motores" component={MotoresScreen} options={{ title: 'Monitorização Térmica', drawerIcon: ({ color }) => <Thermometer color={color} size={22} /> }} />
      <Drawer.Screen name="Umidade" component={UmidadeScreen} options={{ title: 'Monitorização Humidade', drawerIcon: ({ color }) => <Droplets color={color} size={22} /> }} />
      <Drawer.Screen name="Equipamentos" component={EquipamentosScreen} options={{ title: 'Metrologia & Instalações', drawerIcon: ({ color }) => <Settings color={color} size={22} /> }} />
      <Drawer.Screen name="Relatorios" component={RelatoriosScreen} options={{ title: 'Sustentabilidade ESG', drawerIcon: ({ color }) => <Leaf color={color} size={22} /> }} />
      <Drawer.Screen name="Historico" component={HistoricoScreen} options={{ title: 'Auditoria (Logs)', drawerIcon: ({ color }) => <History color={color} size={22} /> }} />
      
      {/* 🔴 NOVAS ABAS */}
      <Drawer.Screen name="Chamados" component={ChamadosScreen} options={{ title: 'Chamados Técnicos', drawerIcon: ({ color }) => <Wrench color={color} size={22} /> }} />
      {userRole === 'ADMIN' && (
        <Drawer.Screen name="Usuarios" component={UsuariosScreen} options={{ title: 'Gestão de Acessos', drawerIcon: ({ color }) => <Users color={color} size={22} /> }} />
      )}
    </Drawer.Navigator>
  );
}