import AsyncStorage from '@react-native-async-storage/async-storage';
import { NavigationContainer } from '@react-navigation/native';
import { useEffect, useState } from 'react';
import 'react-native-gesture-handler';
import { api } from './src/api/api';
import { AppProvider } from './src/context/AppContext';
import DrawerNavigator from './src/navigation/DrawerNavigator';
import LoginScreen from './src/screens/LoginScreen';

export default function App() {
  const [userData, setUserData] = useState(null);

  useEffect(() => { checkToken(); }, []);

  const checkToken = async () => {
    const token = await AsyncStorage.getItem('token');
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setUserData({ token });
    }
  };

  const handleLogin = (data) => setUserData(data);
  const handleLogout = () => setUserData(null); // Limpa o estado e força voltar ao Login

  return (
    <NavigationContainer>
      {userData ? (
        // Se logado, envolve a app no Contexto passando a função de logout
        <AppProvider onLogout={handleLogout}>
          <DrawerNavigator />
        </AppProvider>
      ) : (
        <LoginScreen onLogin={handleLogin} />
      )}
    </NavigationContainer>
  );
}