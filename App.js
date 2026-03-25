import AsyncStorage from '@react-native-async-storage/async-storage';
import { NavigationContainer } from '@react-navigation/native';
import { useEffect, useState } from 'react';
import 'react-native-gesture-handler';
import { api } from './src/api/api';
import DrawerNavigator from './src/navigation/DrawerNavigator';
import LoginScreen from './src/screens/LoginScreen';

export default function App() {
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    checkToken();
  }, []);

  const checkToken = async () => {
    const token = await AsyncStorage.getItem('token');
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setUserData({ token }); // Simplificado. O ideal é validar o token no backend.
    }
  };

  const handleLogin = (data) => {
    setUserData(data);
  };

  return (
    <NavigationContainer>
      {userData ? (
        <DrawerNavigator />
      ) : (
        <LoginScreen onLogin={handleLogin} />
      )}
    </NavigationContainer>
  );
}