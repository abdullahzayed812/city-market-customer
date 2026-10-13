import React, { useCallback, useRef, useEffect } from 'react';
import { View, StyleSheet, TextInput, FlatList, Pressable, StatusBar, ActivityIndicator } from 'react-native';
import {
  AppText as Text,
  BackButton,
  Chip,
  EmptyState,
  LoadingState,
  StatusBadge,
  ForwardIcon,
  palette,
  radii,
  space,
} from '@city-market/mobile-ui';
import { Search, X, PackageSearch, Tag, Store, TriangleAlert } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ImageWithPlaceholder from '../components/common/ImageWithPlaceholder';
import QueryError from '../components/common/QueryError';
import { MeasurementType } from '@city-market/shared';
import { useSearch } from '../hooks/useSearch';
import { useFormat } from '../hooks/useFormat';

const SearchScreen = ({ navigation, route }: any) => {
  const categoryId = route.params?.categoryId;
  const inputRef = useRef<TextInput>(null);
  const { money } = useFormat();

  const {
    t,
    query,
    setQuery,
    products,
    isLoading,
    selectedCategory,
    clearSearch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    error,
    isFetching,
    isTyping,
    submitSearch,
  } = useSearch(categoryId);

  useEffect(() => {
    // Browsing a category shows results immediately; only focus for free-text search.
    if (categoryId) return;
    const timer = setTimeout(() => inputRef.current?.focus(), 250);
    return () => clearTimeout(timer);
  }, [categoryId]);

  const renderItem = useCallback(
    ({ item }: { item: any }) => {
      const isWeight = item.measurementType === MeasurementType.WEIGHT;
      const isLowStock = isWeight ? item.stockWeightGrams < 5000 : item.stockQuantity < 5;

      return (
        <Pressable
          style={({ pressed }) => [styles.itemCard, pressed && styles.pressed]}
          onPress={() => navigation.navigate('ProductDetails', { productId: item.id })}
          accessibilityRole="button"
          accessibilityLabel={`${item.name}, ${money(item.price)}`}
        >
          <View style={styles.imageContainer}>
            <ImageWithPlaceholder uri={item.imageUrl || null} style={styles.itemImage} />
          </View>
          <View style={styles.itemContent}>
            <Text variant="label" color={palette.text} numberOfLines={2}>{item.name}</Text>
            <View style={styles.metaRow}>
              <Store size={13} color={palette.textMuted} />
              <Text variant="caption" color={palette.textMuted} numberOfLines={1} style={styles.flexShrink}>
                {item.vendorName}
              </Text>
            </View>
            <View style={styles.priceRow}>
              <Text variant="bodyStrong" color={palette.text}>{money(item.price)}</Text>
              {isWeight ? <Text variant="caption" color={palette.textMuted}>{t('common.per_kg')}</Text> : null}
              {isLowStock && item.isAvailable !== false ? (
                <StatusBadge label={t('store.low_stock')} tone="warning" icon={TriangleAlert} size="sm" style={styles.lowStock} />
              ) : null}
            </View>
          </View>
          <ForwardIcon size={18} color={palette.textDisabled} />
        </Pressable>
      );
    },
    [navigation, t, money],
  );

  const hasQuery = query.trim().length > 2;
  const showSpinner = isLoading || (isTyping && hasQuery);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={palette.surface} />
      <View style={styles.header}>
        <BackButton onPress={() => navigation.goBack()} accessibilityLabel={t('common.back')} variant="soft" size={40} />
        <View style={styles.searchBar}>
          <Search size={18} color={palette.textMuted} />
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
            onSubmitEditing={submitSearch}
            placeholderTextColor={palette.textMuted}
            returnKeyType="search"
            autoCorrect={false}
            autoCapitalize="none"
            accessibilityLabel={t('common.search')}
          />
          {isFetching && !isLoading ? <ActivityIndicator size="small" color={palette.primary} /> : null}
          {query.length > 0 && (
            <Pressable onPress={clearSearch} hitSlop={10} accessibilityRole="button" accessibilityLabel={t('common.cancel')}>
              <X size={18} color={palette.textMuted} />
            </Pressable>
          )}
        </View>
      </View>

      {selectedCategory ? (
        <View style={styles.filterRow}>
          <Chip label={selectedCategory.name} icon={Tag} selected onPress={() => navigation.setParams({ categoryId: undefined })} />
        </View>
      ) : null}

      {showSpinner && products.length === 0 ? (
        <LoadingState label={t('search.finding')} />
      ) : (
        <FlatList
          data={products}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.list}
          ItemSeparatorComponent={Separator}
          showsVerticalScrollIndicator={false}
          keyboardDismissMode="on-drag"
          keyboardShouldPersistTaps="handled"
          ListEmptyComponent={
            error ? (
              <QueryError error={error} onRetry={submitSearch} />
            ) : hasQuery || categoryId ? (
              <EmptyState icon={PackageSearch} title={t('common.no_results')} message={t('search.no_results_hint')} />
            ) : (
              <EmptyState icon={Search} title={t('search.min_chars')} />
            )
          }
          onEndReached={() => hasNextPage && !isFetchingNextPage && fetchNextPage()}
          onEndReachedThreshold={0.5}
          ListFooterComponent={
            isFetchingNextPage ? <ActivityIndicator style={styles.footerLoader} color={palette.primary} /> : null
          }
        />
      )}
    </SafeAreaView>
  );
};

const Separator = () => <View style={styles.separator} />;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: palette.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    paddingHorizontal: space.lg,
    paddingVertical: space.md,
    backgroundColor: palette.surface,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: palette.borderStrong,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    height: 48,
    paddingHorizontal: space.md,
    borderRadius: radii.md,
    backgroundColor: palette.surfaceMuted,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: palette.text,
    paddingVertical: 0,
  },
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: space.lg,
    paddingTop: space.md,
  },
  list: {
    flexGrow: 1,
    padding: space.lg,
  },
  separator: {
    height: space.sm,
  },
  pressed: {
    opacity: 0.85,
  },
  itemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    padding: space.md,
    borderRadius: radii.lg,
    backgroundColor: palette.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: palette.borderStrong,
  },
  imageContainer: {
    width: 72,
    height: 72,
    borderRadius: radii.md,
    overflow: 'hidden',
    backgroundColor: palette.surfaceMuted,
  },
  itemImage: {
    width: '100%',
    height: '100%',
  },
  itemContent: {
    flex: 1,
    gap: 2,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  flexShrink: {
    flexShrink: 1,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: space.xs,
  },
  lowStock: {
    marginStart: space.xs,
  },
  footerLoader: {
    paddingVertical: space.xl,
  },
});

export default SearchScreen;
