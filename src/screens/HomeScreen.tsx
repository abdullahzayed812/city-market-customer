import React, { useCallback, useRef } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  StatusBar,
  TouchableOpacity,
  Animated,
  // Dimensions,
} from 'react-native';
import { AppText as Text } from '@city-market/mobile-ui';
import { useTranslation } from 'react-i18next';
import { ShoppingCart, Search, Zap, ChevronRight } from 'lucide-react-native';
import { theme } from '../theme';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useHomeData } from '../features/home/hooks/useHomeData';
import { CategoryItem } from '../features/home/components/CategoryItem';
import { VendorItem } from '../features/home/components/VendorItem';
import { useCart } from '../app/CartContext';
import { HomeScreenSkeleton } from '../components/common/SkeletonLoader';

// const { width } = Dimensions.get('window');

const PromoBanner = React.memo(() => {
  const { t } = useTranslation();
  const scaleAnim = useRef(new Animated.Value(0.97)).current;

  React.useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 1200,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 0.97,
          duration: 1200,
          useNativeDriver: true,
        }),
      ]),
    );
    anim.start();
    return () => anim.stop();
  }, [scaleAnim]);

  return (
    <Animated.View
      style={[styles.promoBanner, { transform: [{ scale: scaleAnim }] }]}
    >
      <View style={styles.promoContent}>
        <View style={styles.promoLeft}>
          <Text style={styles.promoTag}>{t('home.promo_tag')}</Text>
          <Text style={styles.promoTitle}>{t('home.promo_title')}</Text>
          <Text style={styles.promoSubtitle}>{t('home.promo_subtitle')}</Text>
        </View>
        <View style={styles.promoRight}>
          <Zap size={48} color="rgba(255,255,255,0.3)" />
        </View>
      </View>
    </Animated.View>
  );
});

const CartButton = React.memo(
  ({ itemCount, onPress }: { itemCount: number; onPress: () => void }) => {
    const scaleAnim = useRef(new Animated.Value(1)).current;
    const prevCount = useRef(itemCount);

    React.useEffect(() => {
      if (itemCount !== prevCount.current) {
        prevCount.current = itemCount;
        Animated.sequence([
          Animated.spring(scaleAnim, {
            toValue: 1.25,
            useNativeDriver: true,
            speed: 30,
            bounciness: 12,
          }),
          Animated.spring(scaleAnim, {
            toValue: 1,
            useNativeDriver: true,
            speed: 30,
            bounciness: 8,
          }),
        ]).start();
      }
    }, [itemCount, scaleAnim]);

    return (
      <TouchableOpacity
        style={styles.cartButton}
        onPress={onPress}
        activeOpacity={0.8}
      >
        <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
          <ShoppingCart color={theme.colors.primary} size={22} />
        </Animated.View>
        {itemCount > 0 && (
          <View style={styles.cartBadge}>
            <Text style={styles.cartBadgeText}>
              {itemCount > 99 ? '99+' : itemCount}
            </Text>
          </View>
        )}
      </TouchableOpacity>
    );
  },
);

const HomeHeader = React.memo(
  ({
    t,
    navigation,
    categories,
    onCategoryPress,
    itemCount,
    onCartPress,
  }: any) => (
    <View style={styles.headerContainer}>
      <View style={styles.headerBar}>
        <View style={styles.locationContainer}>
          <Text style={styles.welcomeText}>{t('home.welcome')}</Text>
          <View style={styles.logoRow}>
            <Text
              style={styles.brandName}
              numberOfLines={1}
              adjustsFontSizeToFit
              maxFontSizeMultiplier={1.2}
            >
              {t('home.brand')}
            </Text>
            {/* <MapPin size={14} color={theme.colors.accent} style={{ marginLeft: 4 }} /> */}
          </View>
        </View>
        <CartButton itemCount={itemCount} onPress={onCartPress} />
      </View>

      <TouchableOpacity
        style={styles.searchContainer}
        onPress={() => navigation.navigate('Search')}
        activeOpacity={0.85}
      >
        <Search color={theme.colors.primary} size={18} />
        <Text style={styles.searchPlaceholder}>
          {t('home.search_placeholder')}
        </Text>
      </TouchableOpacity>

      {/* <PromoBanner /> */}

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, styles.categoriesSectionTitle]}>
          {t('home.categories')}
        </Text>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={categories}
          renderItem={({ item }) => (
            <CategoryItem item={item} onPress={onCategoryPress} />
          )}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.categoriesList}
        />
      </View>
    </View>
  ),
);

const HomeScreen = ({ navigation }: any) => {
  const { t } = useTranslation();
  const { categories, groupedVendors, isLoading } = useHomeData();
  const { itemCount } = useCart();

  const handleCategoryPress = useCallback(
    (id: string) => navigation.navigate('Search', { categoryId: id }),
    [navigation],
  );

  const handleVendorPress = useCallback(
    (id: string) => navigation.navigate('StoreDetails', { vendorId: id }),
    [navigation],
  );

  const handleSeeAllPress = useCallback(
    (type: string) => navigation.navigate('AllStores', { type }),
    [navigation],
  );

  const handleCartPress = useCallback(
    () => navigation.navigate('Cart'),
    [navigation],
  );

  const renderSection = useCallback(
    ({ item }: { item: any }) => (
      <View style={styles.typeSection}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            {t(`home.type_${item.type.toLowerCase()}`)}
          </Text>
          <TouchableOpacity
            style={styles.seeAllButton}
            onPress={() => handleSeeAllPress(item.type)}
            activeOpacity={0.7}
          >
            <Text style={styles.seeAll}>{t('common.see_all')}</Text>
            <ChevronRight size={14} color={theme.colors.primary} />
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
    ),
    [t, handleSeeAllPress, handleVendorPress],
  );

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar
          barStyle="dark-content"
          backgroundColor={theme.colors.background}
        />
        <HomeScreenSkeleton />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor={theme.colors.background}
      />
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
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  headerContainer: {
    paddingBottom: theme.spacing.sm,
  },
  headerBar: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.md,
    paddingBottom: theme.spacing.sm,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  locationContainer: {
    flex: 1,
  },
  welcomeText: {
    fontSize: 12,
    color: theme.colors.textMuted,
    fontWeight: '600',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
    marginBottom: 3,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  brandName: {
    fontSize: 24,
    fontWeight: '800',
    color: theme.colors.primary,
    letterSpacing: -0.6,
  },
  cartButton: {
    width: 46,
    height: 46,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(17,24,39,0.04)',
    ...theme.shadows.medium,
  },
  cartBadge: {
    position: 'absolute',
    top: 5,
    right: 5,
    backgroundColor: theme.colors.accent,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 3,
    borderWidth: 1.5,
    borderColor: theme.colors.white,
  },
  cartBadgeText: {
    color: theme.colors.white,
    fontSize: 9,
    fontWeight: '800',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.white,
    marginHorizontal: theme.spacing.lg,
    paddingHorizontal: theme.spacing.md,
    height: 52,
    borderRadius: theme.radius.xl,
    borderWidth: 1,
    borderColor: 'rgba(17,24,39,0.04)',
    ...theme.shadows.soft,
    marginBottom: theme.spacing.lg,
    gap: theme.spacing.sm,
  },
  searchPlaceholder: {
    color: theme.colors.textMuted,
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
  },
  promoBanner: {
    marginHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
    borderRadius: theme.radius.xl,
    backgroundColor: theme.colors.primary,
    overflow: 'hidden',
    ...theme.shadows.medium,
  },
  promoContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.lg,
  },
  promoLeft: {
    flex: 1,
  },
  promoRight: {
    opacity: 0.8,
  },
  promoTag: {
    fontSize: 10,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.7)',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginBottom: 4,
  },
  promoTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: theme.colors.white,
    letterSpacing: -0.5,
    marginBottom: 2,
  },
  promoSubtitle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '500',
  },
  section: {
    marginBottom: theme.spacing.sm,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.md,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: theme.colors.textPrimary,
    letterSpacing: -0.3,
  },
  categoriesSectionTitle: {
    marginLeft: theme.spacing.lg,
    marginBottom: theme.spacing.md,
  },
  seeAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  seeAll: {
    fontSize: 13,
    color: theme.colors.primary,
    fontWeight: '600',
  },
  categoriesList: {
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.xs,
  },
  scrollContent: {
    paddingBottom: theme.spacing.xl,
  },
  typeSection: {
    marginBottom: theme.spacing.xl,
  },
  vendorsHorizontalList: {
    paddingHorizontal: theme.spacing.lg,
  },
});

export default HomeScreen;
