import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useContext } from 'react';
import { AppContext } from '../context/AppContext';

// Ecrãs e Navegadores
import LoginScreen from '../screens/LoginScreen';
import DrawerNavigator from './DrawerNavigator';

const Stack = createNativeStackNavigator();

export default function RootNavigator() {
  const { token } = useContext(AppContext);

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {token ? (
        // Se o utilizador tem sessão iniciada, carrega a App (Menu Lateral)
        <Stack.Screen name="App" component={DrawerNavigator} />
      ) : (
        // Se não tem sessão, carrega apenas o ecrã de Login
        <Stack.Screen name="Login" component={LoginScreen} />
      )}
    </Stack.Navigator>
  );
}