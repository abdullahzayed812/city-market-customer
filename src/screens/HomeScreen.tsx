import React, { useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  StatusBar,
  TouchableOpacity,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { ShoppingCart, MapPin, Search } from 'lucide-react-native';
import { theme } from '../theme';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useHomeData } from '../features/home/hooks/useHomeData';
import { CategoryItem } from '../features/home/components/CategoryItem';
import { VendorItem } from '../features/home/components/VendorItem';
import { useCart } from '../app/CartContext';

const HomeHeader = React.memo(({ t, navigation, categories, onCategoryPress, itemCount, onCartPress }: any) => (
  <View style={styles.headerContainer}>
    <View style={styles.headerBar}>
      <View style={styles.locationContainer}>
        <Text style={styles.welcomeText}>{t('home.welcome')}</Text>
        <View style={styles.logoRow}>
          <Text style={styles.brandName}>{t('home.brand')}</Text>
          <MapPin size={14} color={theme.colors.accent} style={{ marginLeft: 4 }} />
        </View>
      </View>
      <TouchableOpacity style={styles.cartButton} onPress={onCartPress}>
        <ShoppingCart color={theme.colors.primary} size={22} />
        {itemCount > 0 && (
          <View style={styles.cartBadge}>
            <Text style={styles.cartBadgeText}>{itemCount > 99 ? '99+' : itemCount}</Text>
          </View>
        )}
      </TouchableOpacity>
    </View>

    <TouchableOpacity
      style={styles.searchContainer}
      onPress={() => navigation.navigate('Search')}
      activeOpacity={0.9}
    >
      <Search color={theme.colors.primary} size={20} />
      <Text style={styles.searchPlaceholder}>{t('home.search_placeholder')}</Text>
    </TouchableOpacity>

    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{t('home.categories')}</Text>
      </View>
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={categories}
        renderItem={({ item }) => <CategoryItem item={item} onPress={onCategoryPress} />}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.categoriesList}
      />
    </View>
  </View>
));

const HomeScreen = ({ navigation }: any) => {
  const { t } = useTranslation();
  const { categories, groupedVendors, isLoading } = useHomeData();
  const { itemCount } = useCart();

  const handleCategoryPress = useCallback((id: string) => {
    navigation.navigate('Search', { categoryId: id });
  }, [navigation]);

  const handleVendorPress = useCallback((id: string) => {
    navigation.navigate('StoreDetails', { vendorId: id });
  }, [navigation]);

  const handleSeeAllPress = useCallback((type: string) => {
    navigation.navigate('AllStores', { type });
  }, [navigation]);

  const handleCartPress = useCallback(() => {
    navigation.navigate('Cart');
  }, [navigation]);

  const renderSection = ({ item }: { item: any }) => (
    <View style={styles.typeSection}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{t(`home.type_${item.type.toLowerCase()}`)}</Text>
        <TouchableOpacity onPress={() => handleSeeAllPress(item.type)}>
          <Text style={styles.seeAll}>{t('common.see_all')}</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={item.items}
        renderItem={({ item: vendor }) => (
          <VendorItem item={vendor} onPress={handleVendorPress} t={t} />
        )}
        keyExtractor={v => v.id}
        contentContainerStyle={styles.vendorsHorizontalList}
      />
    </View>
  );

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.background} />
      <FlatList
        data={groupedVendors}
        renderItem={renderSection}
        keyExtractor={item => item.type}
        ListHeaderComponent={
          <HomeHeader
            t={t}
            navigation={navigation}
            categories={categories}
            onCategoryPress={handleCategoryPress}
            itemCount={itemCount}
            onCartPress={handleCartPress}
          />
        }
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: theme.colors.background },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  headerContainer: { paddingBottom: theme.spacing.md },
  headerBar: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.md,
    paddingBottom: theme.spacing.sm,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  locationContainer: { flex: 1 },
  welcomeText: { fontSize: 12, color: theme.colors.primary, opacity: 0.7, fontWeight: '500' },
  logoRow: { flexDirection: 'row', alignItems: 'center' },
  brandName: { fontSize: 20, fontWeight: 'bold', color: theme.colors.primary },
  cartButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    ...theme.shadows.soft,
  },
  cartBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: theme.colors.accent,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 3,
  },
  cartBadgeText: { color: theme.colors.white, fontSize: 10, fontWeight: 'bold' },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.white,
    marginHorizontal: theme.spacing.lg,
    paddingHorizontal: theme.spacing.md,
    height: 50,
    borderRadius: theme.radius.md,
    ...theme.shadows.soft,
    marginBottom: theme.spacing.lg,
  },
  searchPlaceholder: { marginLeft: theme.spacing.sm, color: theme.colors.textSecondary, fontSize: 14 },
  section: { marginTop: theme.spacing.xs },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.md,
  },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: theme.colors.primary },
  categoriesList: { paddingHorizontal: theme.spacing.lg },
  scrollContent: { paddingBottom: theme.spacing.xl },
  typeSection: { marginBottom: theme.spacing.lg },
  seeAll: { fontSize: 14, color: theme.colors.secondary, fontWeight: '600' },
  vendorsHorizontalList: { paddingHorizontal: theme.spacing.lg },
});

export default HomeScreen;
