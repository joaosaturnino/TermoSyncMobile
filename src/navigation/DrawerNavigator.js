import { createDrawerNavigator } from '@react-navigation/drawer';
import * as Notifications from 'expo-notifications'; // 🚀 Sistema Nativo
import { useContext, useEffect, useRef } from 'react';
import Toast from 'react-native-toast-message';

import DashboardScreen from '../screens/DashboardScreen';
import EquipamentosScreen from '../screens/EquipamentosScreen';
import HistoricoScreen from '../screens/HistoricoScreen';
import RelatoriosScreen from '../screens/RelatoriosScreen';
import SensoresScreen from '../screens/SensoresScreen';

import { api, getSocket } from '../api/api';
import { AppContext } from '../context/AppContext';
import CustomDrawer from './CustomDrawer';

// 🚀 Configura como o telemóvel deve reagir quando o alerta chega (com a App aberta)
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldVibrate: true,
  }),
});

const Drawer = createDrawerNavigator();
const MotoresScreen = (props) => <SensoresScreen {...props} isTemp={true} />;
const UmidadeScreen = (props) => <SensoresScreen {...props} isTemp={false} />;

export default function DrawerNavigator() {
  const { theme } = useContext(AppContext);
  const idsConhecidos = useRef(new Set()); 
  const isFirstLoad = useRef(true); 

  useEffect(() => {
    // 🚀 Pedir permissão ao utilizador para enviar alertas/sons
    const configurarPermissoes = async () => {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== 'granted') {
        console.log('Permissão de notificação negada!');
      }
    };
    configurarPermissoes();

    const socket = getSocket();

    const verificarNovosAlertas = async () => {
      try {
        const res = await api.get('/notificacoes');
        const alertasAtuais = res.data;

        if (isFirstLoad.current) {
          idsConhecidos.current = new Set(alertasAtuais.map(n => n.id));
          isFirstLoad.current = false;
          return;
        }

        alertasAtuais.forEach(notif => {
          if (!idsConhecidos.current.has(notif.id)) {
            
            // 🚀 DISPARA O SOM PADRÃO DO SISTEMA E O ALERTA NATIVO
            Notifications.scheduleNotificationAsync({
              content: {
                title: `🚨 ALERTA: ${notif.equipamento_nome}`,
                body: notif.mensagem,
                sound: true, // Usa o som padrão do aparelho
                vibrate: [0, 250, 250, 250], // Padrão de vibração
                priority: Notifications.AndroidNotificationPriority.MAX,
              },
              trigger: null, // Dispara imediatamente
            });

            // Mantemos o Toast para feedback visual dentro da App
            Toast.show({
              type: 'alertaESG',
              text1: `🚨 ${notif.equipamento_nome}`,
              text2: notif.mensagem,
              props: { tipo: notif.tipo_alerta },
              position: 'bottom',
              bottomOffset: 40,
            });
          }
        });

        idsConhecidos.current = new Set(alertasAtuais.map(n => n.id));
      } catch (error) {
        console.log('Erro no motor de alertas:', error);
      }
    };

    verificarNovosAlertas();
    socket.on('atualizacao_dados', verificarNovosAlertas);

    return () => socket.disconnect();
  }, []);

  return (
    <Drawer.Navigator
      drawerContent={(props) => <CustomDrawer {...props} />}
      screenOptions={{
        headerStyle: { backgroundColor: theme.primary },
        headerTintColor: '#fff',
        sceneContainerStyle: { backgroundColor: theme.bg } 
      }}
    >
      <Drawer.Screen name="Dashboard" component={DashboardScreen} options={{ title: 'Painel Central' }} />
      <Drawer.Screen name="Motores" component={MotoresScreen} options={{ title: 'Monitorização Térmica' }} />
      <Drawer.Screen name="Umidade" component={UmidadeScreen} options={{ title: 'Monitorização Humidade' }} />
      <Drawer.Screen name="Equipamentos" component={EquipamentosScreen} options={{ title: 'Ativos IoT' }} />
      <Drawer.Screen name="Relatorios" component={RelatoriosScreen} options={{ title: 'Sustentabilidade ESG' }} />
      <Drawer.Screen name="Historico" component={HistoricoScreen} options={{ title: 'Auditoria (Logs)' }} />
    </Drawer.Navigator>
  );
}