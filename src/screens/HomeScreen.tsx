import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Image,
  Dimensions,
  StatusBar,
  I18nManager,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { Search, ShoppingCart, Star } from 'lucide-react-native';
import { CatalogService } from '../services/api/catalogService';
import { VendorService } from '../services/api/vendorService';
import { theme } from '../theme';
import { getBaseURL } from '../services/api/apiClient';
import { SafeAreaView } from 'react-native-safe-area-context';

enum VendorStatus {
  OPEN = 'OPEN',
}

const { width } = Dimensions.get('window');

const HomeScreen = ({ navigation }: any) => {
  const { t } = useTranslation();

  const { data: categories, isLoading: categoriesLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: CatalogService.getCategories,
  });

  const { data: vendors, isLoading: vendorsLoading } = useQuery({
    queryKey: ['vendors'],
    queryFn: VendorService.getVendors,
  });

  const renderCategoryItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.categoryCard}
      // onPress={() => navigation.navigate('Search', { categoryId: item.id })}
    >
      <Text style={styles.categoryName} numberOfLines={1}>
        {item.name}
      </Text>
    </TouchableOpacity>
  );

  const renderVendorItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.vendorCard}
      onPress={() => navigation.navigate('StoreDetails', { vendorId: item.id })}
    >
      <Image
        source={{ uri: `${getBaseURL()}${item.storeImage}` }}
        style={styles.vendorImage}
      />
      <View style={styles.vendorInfo}>
        <Text style={styles.vendorName}>{item.shopName}</Text>
        <View style={styles.vendorMeta}>
          <View style={styles.ratingContainer}>
            <Text style={styles.ratingText}>{item.rating || '4.5'}</Text>
            <Star
              size={14}
              color={theme.colors.accent}
              fill={theme.colors.accent}
            />
          </View>
          <View
            style={[
              styles.statusBadge,
              {
                backgroundColor:
                  item.status === VendorStatus.OPEN
                    ? 'rgba(52, 199, 89, 0.1)'
                    : 'rgba(255, 59, 48, 0.1)',
              },
            ]}
          >
            <Text
              style={[
                styles.statusText,
                {
                  color:
                    item.status === VendorStatus.OPEN
                      ? theme.colors.success
                      : theme.colors.error,
                },
              ]}
            >
              {item.status === VendorStatus.OPEN
                ? t('home.open')
                : t('home.closed')}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
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
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Image
              source={require('../../assets/icons/app-icon.png')}
              style={{ width: 50, height: 50 }}
              resizeMode="cover"
            />
          </View>
          <TouchableOpacity style={styles.cartButton}>
            <ShoppingCart color={theme.colors.primary} size={24} />
            <View style={styles.cartBadge}>
              <Text style={styles.cartBadgeText}>0</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <TouchableOpacity
          style={styles.searchContainer}
          onPress={() => navigation.navigate('Search')}
        >
          <Search color={theme.colors.textMuted} size={20} />
          <Text style={styles.searchPlaceholder}>
            {t('home.search_placeholder')}
          </Text>
        </TouchableOpacity>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Categories */}
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
              inverted={I18nManager.isRTL}
            />
          </View>

          {/* Promo Banner */}
          {/* <View style={styles.promoBanner}>
            <View style={styles.promoContent}>
              <Text style={styles.promoTitle}>عروض اليوم:</Text>
              <Text style={styles.promoDesc}>
                خصم 20% على جميع الفواكه الطازجة!
              </Text>
              <Text style={styles.promoCode}>استخدم كود: GUAVA20</Text>
            </View>
            <Image
              source={{
                uri: 'https://cdn-icons-png.flaticon.com/512/1625/1625048.png',
              }}
              style={styles.promoImage}
            />
          </View> */}

          {/* Nearby Stores */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>{t('home.stores')}</Text>
              <TouchableOpacity>
                <Text style={styles.seeAll}>{t('common.see_all')}</Text>
              </TouchableOpacity>
            </View>
            <FlatList
              horizontal
              showsHorizontalScrollIndicator={false}
              data={vendors}
              renderItem={renderVendorItem}
              keyExtractor={item => item.id}
              contentContainerStyle={styles.vendorsList}
              inverted={I18nManager.isRTL}
            />
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: theme.colors.background },
  container: { flex: 1, backgroundColor: theme.colors.background },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: theme.typography.sizes.xl,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.primary,
    textAlign: 'left',
  },
  headerSubtitle: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.primary,
    opacity: 0.8,
    textAlign: 'left',
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
    top: 5,
    right: 5,
    backgroundColor: theme.colors.error,
    borderRadius: 10,
    width: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: theme.colors.white,
  },
  cartBadgeText: {
    color: theme.colors.white,
    fontSize: 10,
    fontWeight: 'bold',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.white,
    marginHorizontal: theme.spacing.lg,
    marginVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    height: 50,
    borderRadius: theme.radius.md,
    ...theme.shadows.soft,
  },
  searchPlaceholder: {
    marginLeft: theme.spacing.sm,
    color: theme.colors.textMuted,
    fontSize: theme.typography.sizes.md,
  },
  scrollContent: { paddingBottom: theme.spacing.xl },
  section: { marginTop: theme.spacing.lg },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.md,
  },
  sectionTitle: {
    fontSize: theme.typography.sizes.lg,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.primary,
  },
  seeAll: {
    color: theme.colors.secondary,
    fontSize: theme.typography.sizes.sm,
    fontWeight: theme.typography.weights.medium,
  },
  categoriesList: { paddingHorizontal: theme.spacing.md },
  categoryCard: {
    alignItems: 'center',
    marginHorizontal: theme.spacing.sm,
    padding: theme.spacing.sm,
    borderRadius: theme.radius.xs,
    backgroundColor: theme.colors.white,
  },
  // categoryIconContainer: {
  //   width: 70,
  //   height: 70,
  //   borderRadius: 35,
  //   backgroundColor: theme.colors.white,
  //   justifyContent: 'center',
  //   alignItems: 'center',
  //   marginBottom: theme.spacing.xs,
  //   ...theme.shadows.soft,
  // },
  // categoryIcon: { width: 45, height: 45 },
  // placeholderIcon: {
  //   backgroundColor: theme.colors.surface,
  //   borderRadius: 22.5,
  // },
  categoryName: {
    fontSize: theme.typography.sizes.sm,
    fontWeight: theme.typography.weights.medium,
    color: theme.colors.primary,
    textAlign: 'center',
  },
  vendorsList: { paddingHorizontal: theme.spacing.md },
  vendorCard: {
    width: width * 0.45,
    backgroundColor: theme.colors.white,
    borderRadius: theme.radius.lg,
    marginHorizontal: theme.spacing.sm,
    overflow: 'hidden',
    ...theme.shadows.medium,
    marginBottom: theme.spacing.sm,
  },
  vendorImage: { width: '100%', height: 180, resizeMode: 'cover' },
  vendorInfo: { padding: theme.spacing.sm },
  vendorName: {
    fontSize: theme.typography.sizes.md,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.primary,
  },
  vendorMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: theme.spacing.xs,
  },
  ratingContainer: { flexDirection: 'row', alignItems: 'center' },
  ratingText: {
    fontSize: theme.typography.sizes.sm,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.primary,
    marginRight: 2,
  },
  statusBadge: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 2,
    borderRadius: theme.radius.sm,
  },
  statusText: {
    fontSize: 10,
    fontWeight: theme.typography.weights.bold,
    textTransform: 'uppercase',
  },
  // promoBanner: {
  //   flexDirection: 'row',
  //   backgroundColor: '#F7A7A7', // Light coral as in screenshot
  //   marginHorizontal: theme.spacing.lg,
  //   marginTop: theme.spacing.lg,
  //   borderRadius: theme.radius.lg,
  //   padding: theme.spacing.md,
  //   alignItems: 'center',
  //   overflow: 'hidden',
  // },
  // promoContent: { flex: 1 },
  // promoTitle: {
  //   fontSize: theme.typography.sizes.lg,
  //   fontWeight: theme.typography.weights.bold,
  //   color: theme.colors.white,
  // },
  // promoDesc: {
  //   fontSize: theme.typography.sizes.sm,
  //   color: theme.colors.white,
  //   marginTop: 2,
  // },
  // promoCode: {
  //   fontSize: theme.typography.sizes.sm,
  //   fontWeight: theme.typography.weights.bold,
  //   color: theme.colors.white,
  //   marginTop: 5,
  // },
  // promoImage: {
  //   width: 80,
  //   height: 80,
  //   position: 'absolute',
  //   right: -10,
  //   bottom: -10,
  //   opacity: 0.8,
  // },
});

export default HomeScreen;
