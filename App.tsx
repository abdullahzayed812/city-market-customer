import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { APIProvider } from './src/app/APIProvider';
import { AuthProvider } from './src/app/AuthContext';
import { CartProvider } from './src/app/CartContext';
import { SocketProvider } from './src/app/SocketContext';
import RootNavigator from './src/navigation/RootNavigator';
import { I18nManager } from 'react-native';
import './src/locales/i18n';
import Toast from 'react-native-toast-message';
import { useNotifications } from './src/hooks/useNotifications';
import { AppType } from '@city-market/shared';

// Force RTL if needed (example: if current language is Arabic)
// Note: This usually requires a restart to take effect
I18nManager.allowRTL(true);

const AppContent = () => {
  // Notification hook must be inside providers that use its dependencies (Auth)
  useNotifications(AppType.CUSTOMER);
  return <RootNavigator />;
};

const App = () => {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <APIProvider>
          <CartProvider>
            <SocketProvider>
              <AppContent />
              <Toast />
            </SocketProvider>
          </CartProvider>
        </APIProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
};

export default App;
