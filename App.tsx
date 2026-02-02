import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { APIProvider } from './src/app/APIProvider';
import { AuthProvider } from './src/app/AuthContext';
import { CartProvider } from './src/app/CartContext';
import RootNavigator from './src/navigation/RootNavigator';
import './src/locales/i18n';

const App = () => {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <APIProvider>
          <CartProvider>
            <RootNavigator />
          </CartProvider>
        </APIProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
};

export default App;
