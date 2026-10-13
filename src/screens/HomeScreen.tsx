import React, { useCallback } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  StatusBar,
  Pressable,
  RefreshControl,
  useWindowDimensions,
} from 'react-native';
import {
  AppText as Text,
  IconButton,
  SectionHeader,
  EmptyState,
  palette,
  radii,
  space,
  elevation,
} from '@city-market/mobile-ui';
import { useTranslation } from 'react-i18next';
import { ShoppingCart, Search, Store } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useHomeData } from '../features/home/hooks/useHomeData';
import { CategoryItem } from '../features/home/components/CategoryItem';
import { VendorItem } from '../features/home/components/VendorItem';
import { useCart } from '../app/CartContext';
import { HomeScreenSkeleton } from '../components/common/SkeletonLoader';
import QueryError from '../components/common/QueryError';

const HomeHeader = React.memo(
  ({
    t,
    categories,
    onSearchPress,
    onCategoryPress,
    itemCount,
    onCartPress,
  }: {
    t: any;
    categories: any[] | undefined;
    onSearchPress: () => void;
    onCategoryPress: (id: string) => void;
    itemCount: number;
    onCartPress: () => void;
  }) => (
    <View>
      <View style={styles.topBar}>
        <View style={styles.brandBlock}>
          <Text variant="caption" color={palette.textMuted}>
            {t('home.welcome')}
          </Text>
          <Text variant="title" color={palette.primary} numberOfLines={1}>
            {t('home.brand')}
          </Text>
        </View>
        <IconButton
          icon={ShoppingCart}
          onPress={onCartPress}
          accessibilityLabel={t('cart.title')}
          badge={itemCount}
          iconColor={palette.primary}
          size={48}
        />
      </View>

      <Pressable
        style={({ pressed }) => [styles.searchBar, pressed && styles.searchPressed]}
        onPress={onSearchPress}
        accessibilityRole="search"
        accessibilityLabel={t('home.search_placeholder')}
      >
        <Search color={palette.primary} size={20} />
        <Text variant="body" color={palette.textMuted} style={styles.searchText} numberOfLines={1}>
          {t('home.search_placeholder')}
        </Text>
      </Pressable>

      {categories && categories.length > 0 ? (
        <View style={styles.block}>
          <SectionHeader title={t('home.categories')} style={styles.sectionPad} />
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={categories}
            renderItem={({ item }) => <CategoryItem item={item} onPress={onCategoryPress} />}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.hList}
          />
        </View>
      ) : null}
    </View>
  ),
);

const HomeScreen = ({ navigation }: any) => {
  const { t } = useTranslation();
  const { width } = useWindowDimensions();
  const { categories, groupedVendors, isLoading, error, refetch, isRefetching } = useHomeData();
  const { itemCount } = useCart();

  // Compact tiles in a grid: 4 per row (3 on narrow phones), so every store shows at once
  const columns = width < 360 ? 3 : 4;
  const tileWidth = Math.floor((width - space.lg * 2 - space.md * (columns - 1)) / columns);

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
  const handleCartPress = useCallback(() => navigation.navigate('Cart'), [navigation]);
  const handleSearchPress = useCallback(() => navigation.navigate('Search'), [navigation]);

  const renderSection = useCallback(
    ({ item }: { item: { type: string; items: any[] } }) => (
      <View style={styles.block}>
        <SectionHeader
          title={t(`home.type_${item.type.toLowerCase()}`, { defaultValue: item.type })}
          actionLabel={t('common.see_all')}
          onAction={() => handleSeeAllPress(item.type)}
          style={styles.sectionPad}
        />
        <View style={styles.vendorGrid}>
          {item.items.map(vendor => (
            <VendorItem key={vendor.id} item={vendor} onPress={handleVendorPress} t={t} width={tileWidth} compact />
          ))}
        </View>
      </View>
    ),
    [t, handleSeeAllPress, handleVendorPress, tileWidth],
  );

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <StatusBar barStyle="dark-content" backgroundColor={palette.background} />
        <HomeScreenSkeleton />
      </SafeAreaView>
    );
  }

  const header = (
    <HomeHeader
      t={t}
      categories={categories}
      onSearchPress={handleSearchPress}
      onCategoryPress={handleCategoryPress}
      itemCount={itemCount}
      onCartPress={handleCartPress}
    />
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={palette.background} />
      <FlatList
        data={groupedVendors}
        renderItem={renderSection}
        keyExtractor={item => item.type}
        ListHeaderComponent={header}
        ListEmptyComponent={
          error ? (
            <QueryError error={error} onRetry={refetch} retrying={isRefetching} />
          ) : (
            <EmptyState icon={Store} title={t('home.no_stores')} message={t('home.no_stores_hint')} />
          )
        }
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            tintColor={palette.primary}
            colors={[palette.primary]}
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
    backgroundColor: palette.background,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: space.xxxl,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    paddingHorizontal: space.lg,
    paddingTop: space.md,
    paddingBottom: space.md,
  },
  brandBlock: {
    flex: 1,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    height: 52,
    marginHorizontal: space.lg,
    paddingHorizontal: space.lg,
    backgroundColor: palette.surface,
    borderRadius: radii.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: palette.borderStrong,
    ...elevation.card,
  },
  searchPressed: {
    backgroundColor: palette.surfaceMuted,
  },
  searchText: {
    flex: 1,
  },
  block: {
    marginTop: space.xl,
  },
  sectionPad: {
    paddingHorizontal: space.lg,
  },
  hList: {
    paddingHorizontal: space.lg,
    gap: space.md,
  },
  vendorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    columnGap: space.md,
    rowGap: space.lg,
    paddingHorizontal: space.lg,
  },
});

export default HomeScreen;
