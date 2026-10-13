// PREVIEW ONLY — renders real screens against a pre-filled query cache (no network).
import { I18nManager } from 'react-native';
if (!I18nManager.isRTL) { I18nManager.allowRTL(true); I18nManager.forceRTL(true); }
import React from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import '../src/locales/i18n';
import { AuthProvider } from '../src/app/AuthContext';
import { CartProvider } from '../src/app/CartContext';
import HomeScreen from '../src/screens/HomeScreen';
import StoreDetailsScreen from '../src/screens/StoreDetailsScreen';
import ProductDetailsScreen from '../src/screens/ProductDetailsScreen';
import CartScreen from '../src/screens/CartScreen';
import CheckoutScreen from '../src/screens/CheckoutScreen';
import AllStoresScreen from '../src/screens/AllStoresScreen';
import * as m from './mockData';
import { SCREEN, PARAMS, WITH_CART, FAIL } from './screen';

const qc = new QueryClient({ defaultOptions: { queries: { staleTime: Infinity, retry: false, gcTime: Infinity } } });
const failing = () => Promise.reject(Object.assign(new Error('Network Error'), { code: 'ERR_NETWORK' }));
if (!FAIL) {
  qc.setQueryData(['global-categories'], m.categories);
  qc.setQueryData(['vendors'], m.vendors);
  m.vendors.forEach(v => qc.setQueryData(['vendor', v.id], v));
  qc.setQueryData(['vendor-categories', 'v1'], m.categories.slice(0, 3));
  qc.setQueryData(['category-products', 'v1', 'all'], { pages: [{ data: m.products, total: 5, page: 1, limit: 20 }], pageParams: [1] });
  m.products.forEach(p => qc.setQueryData(['product', p.id], { ...p, vendorName: 'سوبر ماركت الهدى' }));
  qc.setQueryData(['addresses'], m.addresses);
  qc.setQueryData(['profile'], { hasPenalty: false });
  qc.setQueryData(['delivery-fee', 'a1', m.cart.map(i => i.id).join(',')], 25);
} else {
  qc.setQueryDefaults(['vendors'], { queryFn: failing });
  qc.setQueryDefaults(['global-categories'], { queryFn: failing });
}
AsyncStorage.setItem('@citymarket_cart', JSON.stringify(WITH_CART ? m.cart : []));

const Stack = createNativeStackNavigator();
const names = { Home: HomeScreen, StoreDetails: StoreDetailsScreen, ProductDetails: ProductDetailsScreen, Cart: CartScreen, Checkout: CheckoutScreen, AllStores: AllStoresScreen };

export default function PreviewApp() {
  return (
    <SafeAreaProvider>
      <QueryClientProvider client={qc}>
        <AuthProvider>
          <CartProvider>
            <NavigationContainer>
              <Stack.Navigator initialRouteName={SCREEN} screenOptions={{ headerShown: false }}>
                {Object.entries(names).map(([name, C]) => (
                  <Stack.Screen key={name} name={name} component={C} initialParams={name === SCREEN ? PARAMS : undefined} />
                ))}
              </Stack.Navigator>
            </NavigationContainer>
          </CartProvider>
        </AuthProvider>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}
