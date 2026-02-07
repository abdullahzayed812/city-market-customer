import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  StatusBar,
  Keyboard,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { Search, ChevronLeft, X, ShoppingBag } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CatalogService } from '../services/api/catalogService';
import { theme } from '../theme';

const SearchScreen = ({ navigation }: any) => {
  const { t } = useTranslation();
  const [query, setQuery] = useState('');

  const {
    data: products,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ['search', query],
    queryFn: () => CatalogService.searchProducts(query),
    enabled: query.length > 2,
  });

  const clearSearch = () => {
    setQuery('');
    Keyboard.dismiss();
  };

  const renderItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.itemCard}
      onPress={() =>
        navigation.navigate('ProductDetails', { productId: item.id })
      }
      activeOpacity={0.7}
    >
      <View style={styles.itemMain}>
        <View style={styles.itemIconContainer}>
          <ShoppingBag size={22} color={theme.colors.primary} />
        </View>
        <View style={styles.itemInfo}>
          <Text style={styles.itemName}>{item.name}</Text>
          <Text style={styles.itemCat}>{item.category || 'Product'}</Text>
        </View>
      </View>
      <View style={styles.priceTag}>
        <Text style={styles.itemPrice}>${item.price.toFixed(2)}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.white} />
      <View style={styles.container}>
        {/* Search Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <ChevronLeft size={24} color={theme.colors.primary} />
          </TouchableOpacity>
          <View style={styles.searchBarContainer}>
            <Search size={20} color={theme.colors.textMuted} style={styles.searchIcon} />
            <TextInput
              style={styles.input}
              placeholder={t('home.search_placeholder')}
              value={query}
              onChangeText={setQuery}
              autoFocus
              onSubmitEditing={() => refetch()}
              placeholderTextColor={theme.colors.textMuted}
              returnKeyType="search"
            />
            {query.length > 0 && (
              <TouchableOpacity onPress={clearSearch} style={styles.clearButton}>
                <X size={18} color={theme.colors.textMuted} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {isLoading ? (
          <View style={styles.loaderContainer}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
            <Text style={styles.loaderText}>Searching products...</Text>
          </View>
        ) : (
          <FlatList
            data={products}
            renderItem={renderItem}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              query.length > 2 ? (
                <View style={styles.emptyContainer}>
                  <Search size={64} color={theme.colors.surface} />
                  <Text style={styles.emptyText}>{t('common.no_results')}</Text>
                  <Text style={styles.emptySubText}>Try searching for something else</Text>
                </View>
              ) : (
                <View style={styles.initialContainer}>
                  <Text style={styles.initialText}>Enter at least 3 characters to search</Text>
                </View>
              )
            }
          />
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: theme.colors.white },
  container: { flex: 1, backgroundColor: theme.colors.background },
  header: {
    padding: theme.spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.white,
    ...theme.shadows.soft,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  searchBarContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
    borderRadius: theme.radius.md,
    paddingHorizontal: 15,
    height: 48,

  },
  searchIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: theme.colors.primary,
    height: '100%',

  },
  clearButton: {
    padding: 5,
  },
  list: { padding: theme.spacing.lg },
  itemCard: {
    flexDirection: 'row',
    backgroundColor: theme.colors.white,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    alignItems: 'center',
    justifyContent: 'space-between',
    ...theme.shadows.soft,
  },
  itemMain: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  itemIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: theme.colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.primary,
  },
  itemCat: {
    fontSize: 12,
    color: theme.colors.textMuted,
    marginTop: 2,
  },
  priceTag: {
    backgroundColor: theme.colors.primary + '10',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: theme.radius.md,
  },
  itemPrice: {
    fontSize: 14,
    fontWeight: 'bold',
    color: theme.colors.primary,
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
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 100,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
  emptySubText: {
    marginTop: 8,
    color: theme.colors.textMuted,
    fontSize: 14,
  },
  initialContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 50,
  },
  initialText: {
    color: theme.colors.textMuted,
    fontSize: 14,
    fontStyle: 'italic',
  },
});

export default SearchScreen;
