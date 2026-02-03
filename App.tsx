import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { APIProvider } from './src/app/APIProvider';
import { AuthProvider } from './src/app/AuthContext';
import { CartProvider } from './src/app/CartContext';
import { SocketProvider } from './src/app/SocketContext';
import RootNavigator from './src/navigation/RootNavigator';
import './src/locales/i18n';

const App = () => {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <APIProvider>
          <CartProvider>
            <SocketProvider>
              <RootNavigator />
            </SocketProvider>
          </CartProvider>
        </APIProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
};

export default App;
