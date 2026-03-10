import React, { useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  StatusBar,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { Search, ShoppingCart, Star, MapPin } from 'lucide-react-native';
import { CatalogService } from '../services/api/catalogService';
import { VendorService } from '../services/api/vendorService';
import { theme } from '../theme';
import { getBaseURL } from '../services/api/apiClient';
import { SafeAreaView } from 'react-native-safe-area-context';
import ImageWithPlaceholder from '../components/common/ImageWithPlaceholder';

enum VendorStatus {
  OPEN = 'OPEN',
}

const { width } = Dimensions.get('window');
const VENDOR_CARD_WIDTH = width * 0.44;

const HomeHeader = React.memo(
  ({ t, navigation, categories, renderCategoryItem }: any) => (
    <View style={styles.headerContainer}>
      <View style={styles.headerBar}>
        <View style={styles.locationContainer}>
          <Text style={styles.welcomeText}>{t('home.welcome')}</Text>
          <View style={styles.logoRow}>
            <Text style={styles.brandName}>{t('home.brand')}</Text>
            <MapPin
              size={14}
              color={theme.colors.accent}
              style={{ marginLeft: 4 }}
            />
          </View>
        </View>
        <TouchableOpacity style={styles.cartButton}>
          <ShoppingCart color={theme.colors.primary} size={22} />
          <View style={styles.cartBadge}>
            <Text style={styles.cartBadgeText}>0</Text>
          </View>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={styles.searchContainer}
        onPress={() => navigation.navigate('Search')}
        activeOpacity={0.9}
      >
        <Search color={theme.colors.primary} size={20} />
        <Text style={styles.searchPlaceholder}>
          {t('home.search_placeholder')}
        </Text>
      </TouchableOpacity>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>{t('home.categories')}</Text>
        </View>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={categories}
          renderItem={renderCategoryItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.categoriesList}
        />
      </View>
    </View>
  ),
);

const HomeScreen = ({ navigation }: any) => {
  const { t } = useTranslation();

  const { data: categories, isLoading: categoriesLoading } = useQuery({
    queryKey: ['global-categories'],
    queryFn: CatalogService.getGlobalCategories,
  });

  const { data: vendors, isLoading: vendorsLoading } = useQuery({
    queryKey: ['vendors'],
    queryFn: VendorService.getVendors,
  });

  const groupedVendors = useMemo(() => {
    if (!vendors) return [];
    const groups: Record<string, any[]> = {};
    vendors.forEach((v: any) => {
      const type = v.type || 'Other';
      if (!groups[type]) groups[type] = [];
      groups[type].push(v);
    });
    return Object.entries(groups).map(([type, items]) => ({ type, items }));
  }, [vendors]);

  const renderCategoryItem = useCallback(
    ({ item }: { item: any }) => (
      <TouchableOpacity
        style={styles.categoryCard}
        onPress={() => navigation.navigate('Search', { categoryId: item.id })}
        activeOpacity={0.7}
      >
        <View
          style={[
            styles.categoryIconContainer,
            { backgroundColor: (item.color || theme.colors.surface) + '33' },
          ]}
        >
          <ImageWithPlaceholder
            uri={item.iconUrl ? `${getBaseURL()}${item.iconUrl}` : null}
            style={styles.categoryIcon}
            resizeMode="contain"
          />
        </View>
        <Text style={styles.categoryName} numberOfLines={1}>
          {item.name}
        </Text>
      </TouchableOpacity>
    ),
    [navigation],
  );

  const renderVendorItem = useCallback(
    ({ item }: { item: any }) => (
      <TouchableOpacity
        style={styles.vendorCard}
        onPress={() =>
          navigation.navigate('StoreDetails', { vendorId: item.id })
        }
        activeOpacity={0.95}
      >
        <View style={styles.vendorImageContainer}>
          <ImageWithPlaceholder
            uri={item.storeImage ? `${getBaseURL()}${item.storeImage}` : null}
            style={styles.vendorImage}
          />
          <View
            style={[
              styles.statusBadge,
              {
                backgroundColor:
                  item.status === VendorStatus.OPEN
                    ? theme.colors.success
                    : theme.colors.error,
              },
            ]}
          >
            <View style={styles.statusDot} />
            <Text style={styles.statusText}>
              {item.status === VendorStatus.OPEN
                ? t('home.open')
                : t('home.closed')}
            </Text>
          </View>
        </View>

        <View style={styles.vendorInfo}>
          <Text style={styles.vendorName} numberOfLines={1}>
            {item.shopName}
          </Text>
          <View style={styles.vendorMeta}>
            <View style={styles.ratingContainer}>
              <Star
                size={12}
                color={theme.colors.accent}
                fill={theme.colors.accent}
              />
              <Text style={styles.ratingText}>{item.averageRating}</Text>
            </View>
            <Text style={styles.vendorAddress} numberOfLines={1}>
              {item.address?.split(',')[0]}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    ),
    [navigation, t],
  );

  const renderSection = ({ item }: { item: any }) => (
    <View style={styles.typeSection}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>
          {t(`home.type_${item.type.toLowerCase()}`)}
        </Text>
        <TouchableOpacity>
          <Text style={styles.seeAll}>{t('common.see_all')}</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={item.items}
        renderItem={renderVendorItem}
        keyExtractor={v => v.id}
        contentContainerStyle={styles.vendorsHorizontalList}
      />
    </View>
  );

  if (categoriesLoading || vendorsLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
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
            renderCategoryItem={renderCategoryItem}
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
  headerContainer: {
    paddingBottom: theme.spacing.md,
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
    color: theme.colors.primary,
    opacity: 0.7,
    fontWeight: '500',
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  brandName: {
    fontSize: 20,
    fontWeight: '800',
    color: theme.colors.primary,
    letterSpacing: -0.5,
  },
  cartButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.white,
    borderRadius: theme.radius.md,
    ...theme.shadows.soft,
  },
  cartBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: theme.colors.accent,
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    paddingHorizontal: 4,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: theme.colors.white,
  },
  cartBadgeText: {
    color: theme.colors.primary,
    fontSize: 9,
    fontWeight: 'bold',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.white,
    marginHorizontal: theme.spacing.lg,
    marginVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.md,
    height: 54,
    borderRadius: theme.radius.lg,
    ...theme.shadows.medium,
  },
  searchPlaceholder: {
    marginLeft: theme.spacing.sm,
    color: theme.colors.textMuted,
    fontSize: theme.typography.sizes.md,
    fontWeight: '500',
  },
  scrollContent: { paddingBottom: theme.spacing.xl },
  section: { marginTop: theme.spacing.sm },
  typeSection: { marginTop: theme.spacing.lg },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.md,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.primary,
  },
  seeAll: {
    color: theme.colors.accent,
    fontSize: 14,
    fontWeight: '600',
  },
  categoriesList: { paddingHorizontal: theme.spacing.md },
  categoryCard: {
    alignItems: 'center',
    marginHorizontal: theme.spacing.xs,
    width: 80,
  },
  categoryIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.xs,
    ...theme.shadows.medium,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.8)',
  },
  categoryIcon: {
    width: 38,
    height: 38,
  },
  categoryName: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.primary,
    textAlign: 'center',
  },
  vendorsHorizontalList: {
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.sm,
  },
  vendorCard: {
    width: VENDOR_CARD_WIDTH,
    backgroundColor: theme.colors.white,
    borderRadius: theme.radius.lg,
    overflow: 'hidden',
    ...theme.shadows.soft,
    marginRight: theme.spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  vendorImageContainer: {
    width: '100%',
    height: 150,
  },
  vendorImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  statusBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: theme.colors.white,
    marginRight: 4,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '700',
    color: theme.colors.white,
    textTransform: 'uppercase',
  },
  vendorInfo: { padding: theme.spacing.md },
  vendorName: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.primary,
  },
  vendorMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(228, 166, 48, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginRight: 10,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: '700',
    color: theme.colors.accent,
    marginLeft: 3,
  },
  vendorAddress: {
    fontSize: 12,
    color: theme.colors.textMuted,
    flex: 1,
  },
});

export default HomeScreen;
