import { NavigationContainer } from '@react-navigation/native';
import { useContext } from 'react';
import { AppContext, AppProvider } from './src/context/AppContext';
import DrawerNavigator from './src/navigation/DrawerNavigator';
import LoginScreen from './src/screens/LoginScreen';

function MainNavigator() {
  const { token } = useContext(AppContext);
  return token ? <DrawerNavigator /> : <LoginScreen />;
}

export default function App() {
  return (
    <AppProvider>
      <NavigationContainer>
        <MainNavigator />
      </NavigationContainer>
    </AppProvider>
  );
}