import AsyncStorage from '@react-native-async-storage/async-storage';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import Toast from 'react-native-toast-message';

import { AppProvider } from './src/context/AppContext';
import DrawerNavigator from './src/navigation/DrawerNavigator';
import LoginScreen from './src/screens/LoginScreen';

const Stack = createNativeStackNavigator();

// 🚀 CONFIGURAÇÃO GLOBAL DO POP-UP (Ajustado para o fundo)
const toastConfig = {
  alertaESG: ({ text1, text2, props }) => {
    const tipo = props?.tipo || ''; 
    const isRede = tipo === 'REDE';
    const isDegelo = tipo === 'DEGELO';

    let colorTheme = '#ef4444'; // Vermelho
    let bgTheme = '#fee2e2';

    if (isRede) { colorTheme = '#f59e0b'; bgTheme = '#fef3c7'; } // Laranja
    else if (isDegelo) { colorTheme = '#38bdf8'; bgTheme = '#e0f2fe'; } // Azul

    return (
      <View style={{
        width: '92%', backgroundColor: bgTheme, borderLeftWidth: 6,
        borderLeftColor: colorTheme, borderRadius: 10, padding: 16,
        shadowColor: '#000', shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.15, shadowRadius: 6, elevation: 10,
        // Mudámos de marginTop para marginBottom para dar espaço à barra de navegação do Android/iOS
        marginBottom: 10, 
        zIndex: 99999 
      }}>
        <Text style={{ fontSize: 15, fontWeight: '900', color: colorTheme, marginBottom: 5 }}>{text1}</Text>
        <Text style={{ fontSize: 13, fontWeight: '600', color: '#0f172a', lineHeight: 18 }}>{text2}</Text>
      </View>
    );
  }
};

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    verificarSessao();
  }, []);

  const verificarSessao = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (token) setIsAuthenticated(true);
    } catch (e) {
      console.log('Erro ao ler a sessão:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = () => setIsAuthenticated(true);
  const handleLogout = () => setIsAuthenticated(false);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#059669' }}>
        <ActivityIndicator size="large" color="#ffffff" />
      </View>
    );
  }

  return (
    <>
      <AppProvider onLogout={handleLogout}>
        <NavigationContainer>
          <Stack.Navigator screenOptions={{ headerShown: false }}>
            {!isAuthenticated ? (
              <Stack.Screen name="Login">
                {(props) => <LoginScreen {...props} onLogin={handleLogin} />}
              </Stack.Screen>
            ) : (
              <Stack.Screen name="MainApp" component={DrawerNavigator} />
            )}
          </Stack.Navigator>
        </NavigationContainer>
      </AppProvider>
      
      {/* Rei da Tela */}
      <Toast config={toastConfig} />
    </>
  );
}