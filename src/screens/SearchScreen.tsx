import React, { useCallback, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  StatusBar,
  Animated,
} from 'react-native';
import {
  Search,
  ChevronLeft,
  X,
  PackageSearch,
  Tag,
} from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '../theme';
import ImageWithPlaceholder from '../components/common/ImageWithPlaceholder';
import { MeasurementType } from '@city-market/shared';
import { useSearch } from '../hooks/useSearch';

const SearchScreen = ({ navigation, route }: any) => {
  const categoryId = route.params?.categoryId;
  const inputRef = useRef<TextInput>(null);
  const headerAnim = useRef(new Animated.Value(0)).current;

  const {
    t,
    query,
    setQuery,
    products,
    isLoading,
    refetch,
    selectedCategory,
    clearSearch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useSearch(categoryId);

  useEffect(() => {
    Animated.timing(headerAnim, {
      toValue: 1,
      duration: 250,
      useNativeDriver: true,
    }).start();
    const timer = setTimeout(() => inputRef.current?.focus(), 300);
    return () => clearTimeout(timer);
  }, [headerAnim]);

  const renderItem = useCallback(
    ({ item, index }: { item: any; index: number }) => {
      const isLowStock =
        item.measurementType === MeasurementType.UNIT
          ? item.stockQuantity < 5
          : item.stockWeightGrams < 5000;

      return (
        <TouchableOpacity
          style={styles.itemCard}
          onPress={() => navigation.navigate('ProductDetails', { productId: item.id })}
          activeOpacity={0.85}
        >
          <View style={styles.imageContainer}>
            <ImageWithPlaceholder uri={item.imageUrl || null} style={styles.itemImage} />
          </View>
          <View style={styles.itemContent}>
            <View style={styles.itemMeta}>
              <Text style={styles.itemName} numberOfLines={1}>{item.name}</Text>
              <View style={styles.itemTagRow}>
                <View style={styles.vendorTag}>
                  <Text style={styles.vendorTagText}>{item.vendorName}</Text>
                </View>
                {item.globalCategoryName && (
                  <Text style={styles.categoryTag}>{item.globalCategoryName}</Text>
                )}
              </View>
            </View>
            <View style={styles.itemFooter}>
              <View style={styles.priceGroup}>
                <Text style={styles.itemPrice}>${item.price.toFixed(2)}</Text>
                {item.measurementType === MeasurementType.WEIGHT && (
                  <Text style={styles.unitText}>/kg</Text>
                )}
              </View>
              {isLowStock && (
                <View style={styles.lowStockBadge}>
                  <Text style={styles.lowStockText}>{t('store.low_stock') || 'Low Stock'}</Text>
                </View>
              )}
            </View>
          </View>
        </TouchableOpacity>
      );
    },
    [navigation, t],
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.white} />
      <Animated.View style={[styles.header, { opacity: headerAnim }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <ChevronLeft size={24} color={theme.colors.textPrimary} />
        </TouchableOpacity>
        <View style={styles.searchBar}>
          <Search size={17} color={theme.colors.textMuted} />
          <TextInput
            ref={inputRef}
            style={styles.input}
            placeholder={
              selectedCategory
                ? `${t('common.search')} ${t('search.in')} ${selectedCategory.name}`
                : t('home.search_placeholder')
            }
            value={query}
            onChangeText={setQuery}
            onSubmitEditing={() => refetch()}
            placeholderTextColor={theme.colors.textMuted}
            returnKeyType="search"
            autoCorrect={false}
            autoCapitalize="none"
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={clearSearch} style={styles.clearBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <X size={17} color={theme.colors.textMuted} />
            </TouchableOpacity>
          )}
        </View>
      </Animated.View>

      {selectedCategory && !query && (
        <View style={styles.filterChip}>
          <Tag size={13} color={theme.colors.primary} />
          <Text style={styles.filterChipText}>{selectedCategory.name}</Text>
          <TouchableOpacity
            onPress={() => navigation.setParams({ categoryId: undefined })}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <X size={14} color={theme.colors.textMuted} />
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.content}>
        {isLoading ? (
          <View style={styles.loaderContainer}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
            <Text style={styles.loaderText}>{t('search.finding')}</Text>
          </View>
        ) : (
          <FlatList
            data={products}
            renderItem={renderItem}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}
            keyboardDismissMode="on-drag"
            ListEmptyComponent={
              query.length > 2 || categoryId ? (
                <View style={styles.emptyContainer}>
                  <PackageSearch size={72} color={theme.colors.border} />
                  <Text style={styles.emptyTitle}>{t('common.no_results')}</Text>
                  <Text style={styles.emptyHint}>{t('search.no_results_hint')}</Text>
                </View>
              ) : (
                <View style={styles.initialContainer}>
                  <Search size={56} color={theme.colors.border} />
                  <Text style={styles.initialText}>{t('search.min_chars')}</Text>
                </View>
              )
            }
            onEndReached={() => hasNextPage && !isFetchingNextPage && fetchNextPage()}
            onEndReachedThreshold={0.5}
            ListFooterComponent={
              isFetchingNextPage ? (
                <View style={styles.footerLoader}>
                  <ActivityIndicator size="small" color={theme.colors.primary} />
                </View>
              ) : null
            }
          />
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.white,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 12,
    backgroundColor: theme.colors.white,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    gap: 10,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
    borderRadius: theme.radius.md,
    paddingHorizontal: 12,
    height: 46,
    gap: 8,
  },
  input: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
    color: theme.colors.textPrimary,
    height: '100%',
    padding: 0,
  },
  clearBtn: {
    padding: 2,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    marginHorizontal: theme.spacing.lg,
    marginTop: 10,
    marginBottom: 2,
    backgroundColor: theme.colors.primaryXLight,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: theme.radius.pill,
  },
  filterChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.primary,
    flex: 1,
  },
  content: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loaderText: {
    marginTop: 12,
    color: theme.colors.textMuted,
    fontSize: 14,
    fontWeight: '500',
  },
  list: {
    padding: theme.spacing.lg,
    paddingBottom: 40,
  },
  itemCard: {
    flexDirection: 'row',
    backgroundColor: theme.colors.white,
    borderRadius: theme.radius.lg,
    marginBottom: theme.spacing.sm,
    overflow: 'hidden',
    ...theme.shadows.soft,
  },
  imageContainer: {
    width: 96,
    height: 96,
    backgroundColor: theme.colors.borderLight,
  },
  itemImage: {
    width: '100%',
    height: '100%',
  },
  itemContent: {
    flex: 1,
    padding: 12,
    justifyContent: 'space-between',
  },
  itemMeta: {},
  itemName: {
    fontSize: 15,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    marginBottom: 5,
    letterSpacing: -0.2,
  },
  itemTagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 5,
  },
  vendorTag: {
    backgroundColor: theme.colors.primaryXLight,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
  },
  vendorTagText: {
    fontSize: 11,
    fontWeight: '600',
    color: theme.colors.primary,
  },
  categoryTag: {
    fontSize: 11,
    color: theme.colors.textMuted,
    fontWeight: '500',
  },
  itemFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6,
  },
  priceGroup: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 2,
  },
  itemPrice: {
    fontSize: 17,
    fontWeight: '800',
    color: theme.colors.primary,
    letterSpacing: -0.3,
  },
  unitText: {
    fontSize: 11,
    color: theme.colors.textMuted,
  },
  lowStockBadge: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
  },
  lowStockText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#92400E',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  emptyContainer: {
    marginTop: 80,
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    marginTop: 16,
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    textAlign: 'center',
    letterSpacing: -0.3,
  },
  emptyHint: {
    marginTop: 8,
    fontSize: 14,
    color: theme.colors.textMuted,
    textAlign: 'center',
    lineHeight: 20,
  },
  initialContainer: {
    marginTop: 100,
    alignItems: 'center',
  },
  initialText: {
    marginTop: 16,
    fontSize: 15,
    color: theme.colors.textMuted,
    fontWeight: '500',
  },
  footerLoader: {
    paddingVertical: 20,
    alignItems: 'center',
  },
});

export default SearchScreen;
