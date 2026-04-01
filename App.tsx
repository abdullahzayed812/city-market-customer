import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { APIProvider } from './src/app/APIProvider';
import { AuthProvider } from './src/app/AuthContext';
import { CartProvider } from './src/app/CartContext';
import { SocketProvider } from './src/app/SocketContext';
import RootNavigator from './src/navigation/RootNavigator';
import { I18nManager } from 'react-native';
import './src/locales/i18n';
import Toast, { BaseToastProps } from 'react-native-toast-message';
import { useNotifications } from './src/hooks/useNotifications';
import { AppType } from '@city-market/shared';
import { NotificationBanner } from './src/components/common/NotificationBanner';

// Force RTL if needed (example: if current language is Arabic)
I18nManager.allowRTL(true);

const toastConfig = {
  notification: ({ text1, text2, props }: BaseToastProps) => (
    <NotificationBanner text1={text1} text2={text2} onPress={props.onPress} />
  ),
};

const AppContent = () => {
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
              <Toast config={toastConfig} topOffset={50} />
            </SocketProvider>
          </CartProvider>
        </APIProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
};

export default App;
