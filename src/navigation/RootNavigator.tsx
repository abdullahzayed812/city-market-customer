import React, { useRef, useCallback } from 'react';
import { NavigationContainer, createNavigationContainerRef } from '@react-navigation/native';

export const navigationRef = createNavigationContainerRef();
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useTranslation } from 'react-i18next';
import {
  Home,
  ShoppingCart,
  ClipboardList,
  User,
} from 'lucide-react-native';
import {
  TouchableOpacity,
  Platform,
  View,
  Text,
  StyleSheet,
  Animated,
} from 'react-native';
import { theme } from '../theme';
import AsyncStorage from '@react-native-async-storage/async-storage';

import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import HomeScreen from '../screens/HomeScreen';
import StoreDetailsScreen from '../screens/StoreDetailsScreen';
import ProductDetailsScreen from '../screens/ProductDetailsScreen';
import CartScreen from '../screens/CartScreen';
import CheckoutScreen from '../screens/CheckoutScreen';
import OrdersScreen from '../screens/OrdersScreen';
import OrderDetailsScreen from '../screens/OrderDetailsScreen';
import ProfileScreen from '../screens/ProfileScreen';
import AddressesScreen from '../screens/AddressesScreen';
import LanguageSettingsScreen from '../screens/LanguageSettingsScreen';
import AllStoresScreen from '../screens/AllStoresScreen';
import CategoryProductsScreen from '../screens/CategoryProductsScreen';

import SearchScreen from '../screens/SearchScreen';
import SplashScreen from '../screens/SplashScreen';
import ReviewProposalsScreen from '../screens/ReviewProposalsScreen';
import VendorReviewsScreen from '../screens/VendorReviewsScreen';
import TermsAndConditionsScreen from '../screens/TermsAndConditionsScreen';

import { useAuth } from '../app/AuthContext';
import { useCart } from '../app/CartContext';

const TERMS_ACCEPTED_KEY = '@citymarket_customer_terms_accepted';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

interface TabBarButtonProps {
  onPress: () => void;
  label: string;
  icon: any;
  focused: boolean;
  badge?: number;
}

const TabBarButton = ({ onPress, label, icon: Icon, focused, badge }: TabBarButtonProps) => {
  const scaleAnim = useRef(new Animated.Value(focused ? 1 : 0.85)).current;
  const colorAnim = useRef(new Animated.Value(focused ? 1 : 0)).current;

  React.useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: focused ? 1 : 0.85,
        useNativeDriver: true,
        speed: 20,
        bounciness: 8,
      }),
      Animated.timing(colorAnim, {
        toValue: focused ? 1 : 0,
        duration: 180,
        useNativeDriver: false,
      }),
    ]).start();
  }, [focused, scaleAnim, colorAnim]);

  const iconColor = colorAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [theme.colors.textMuted, theme.colors.primary],
  });

  return (
    <TouchableOpacity
      onPress={onPress}
      style={tabStyles.tabButton}
      activeOpacity={0.7}
    >
      <Animated.View
        style={[
          tabStyles.iconWrapper,
          focused && tabStyles.iconWrapperActive,
          { transform: [{ scale: scaleAnim }] },
        ]}
      >
        <Animated.View>
          <Icon
            size={22}
            color={focused ? theme.colors.primary : theme.colors.textMuted}
          />
        </Animated.View>
        {badge !== undefined && badge > 0 && (
          <View style={tabStyles.badge}>
            <Text style={tabStyles.badgeText}>{badge > 99 ? '99+' : badge}</Text>
          </View>
        )}
      </Animated.View>
      <Animated.Text
        style={[
          tabStyles.tabLabel,
          { color: focused ? theme.colors.primary : theme.colors.textMuted },
          focused && tabStyles.tabLabelActive,
        ]}
      >
        {label}
      </Animated.Text>
    </TouchableOpacity>
  );
};

const CustomTabBar = ({ state, descriptors, navigation }: any) => {
  const { itemCount } = useCart();

  return (
    <View style={tabStyles.tabBar}>
      {state.routes.map((route: any, index: number) => {
        const { options } = descriptors[route.key];
        const label = options.title ?? route.name;
        const focused = state.index === index;

        const iconMap: Record<string, any> = {
          Home,
          Cart: ShoppingCart,
          Orders: ClipboardList,
          Profile: User,
        };

        const icon = iconMap[route.name] ?? Home;
        const badge = route.name === 'Cart' ? itemCount : undefined;

        return (
          <TabBarButton
            key={route.key}
            onPress={() => navigation.navigate(route.name)}
            label={label}
            icon={icon}
            focused={focused}
            badge={badge}
          />
        );
      })}
    </View>
  );
};

const tabStyles = StyleSheet.create({
  tabBar: {
    flexDirection: 'row',
    backgroundColor: theme.colors.white,
    paddingBottom: Platform.OS === 'ios' ? 24 : 8,
    paddingTop: 10,
    paddingHorizontal: 8,
    borderTopWidth: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 16,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 2,
  },
  iconWrapper: {
    width: 44,
    height: 34,
    borderRadius: 17,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconWrapperActive: {
    backgroundColor: theme.colors.primaryXLight,
  },
  badge: {
    position: 'absolute',
    top: -2,
    right: -2,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: theme.colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 3,
    borderWidth: 1.5,
    borderColor: theme.colors.white,
  },
  badgeText: {
    color: theme.colors.white,
    fontSize: 9,
    fontWeight: '800',
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
  },
  tabLabelActive: {
    fontWeight: '700',
  },
});

const MainTabNavigator = () => {
  const { t } = useTranslation();

  return (
    <Tab.Navigator
      tabBar={props => <CustomTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{ title: t('home.title') }} />
      <Tab.Screen name="Cart" component={CartScreen} options={{ title: t('cart.title') }} />
      <Tab.Screen name="Orders" component={OrdersScreen} options={{ title: t('orders.title') }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ title: t('profile.title') }} />
    </Tab.Navigator>
  );
};

const RootNavigator = () => {
  const { isLoading } = useAuth();
  const [showSplash, setShowSplash] = React.useState(true);
  const [termsAccepted, setTermsAccepted] = React.useState<boolean | null>(null);

  React.useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  React.useEffect(() => {
    AsyncStorage.getItem(TERMS_ACCEPTED_KEY).then(value => {
      setTermsAccepted(value === 'true');
    });
  }, []);

  const handleAcceptTerms = useCallback(async () => {
    await AsyncStorage.setItem(TERMS_ACCEPTED_KEY, 'true');
    setTermsAccepted(true);
  }, []);

  if (showSplash || isLoading || termsAccepted === null) {
    return <SplashScreen />;
  }

  if (!termsAccepted) {
    return <TermsAndConditionsScreen onAccept={handleAcceptTerms} />;
  }

  return (
    <NavigationContainer ref={navigationRef}>
      <Stack.Navigator
        initialRouteName="Main"
        screenOptions={{ headerShown: false }}
      >
        <Stack.Screen name="Main" component={MainTabNavigator} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name="StoreDetails" component={StoreDetailsScreen} />
        <Stack.Screen name="ProductDetails" component={ProductDetailsScreen} />
        <Stack.Screen name="OrderDetails" component={OrderDetailsScreen} />
        <Stack.Screen name="Checkout" component={CheckoutScreen} />
        <Stack.Screen name="Addresses" component={AddressesScreen} />
        <Stack.Screen name="Search" component={SearchScreen} />
        <Stack.Screen name="LanguageSettings" component={LanguageSettingsScreen} />
        <Stack.Screen name="AllStores" component={AllStoresScreen} />
        <Stack.Screen name="ReviewProposals" component={ReviewProposalsScreen} />
        <Stack.Screen name="VendorReviews" component={VendorReviewsScreen} />
        <Stack.Screen name="CategoryProducts" component={CategoryProductsScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default RootNavigator;
