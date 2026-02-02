import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { CatalogService } from '../services/api/catalogService';

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

  const renderItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.item}
      onPress={() =>
        navigation.navigate('ProductDetails', { productId: item.id })
      }
    >
      <Text style={styles.itemName}>{item.name}</Text>
      <Text style={styles.itemPrice}>${item.price.toFixed(2)}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TextInput
          style={styles.input}
          placeholder={t('home.search_placeholder')}
          value={query}
          onChangeText={setQuery}
          autoFocus
          onSubmitEditing={() => refetch()}
        />
      </View>

      {isLoading ? (
        <ActivityIndicator style={styles.loader} size="large" color="#007AFF" />
      ) : (
        <FlatList
          data={products}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            query.length > 2 ? (
              <Text style={styles.emptyText}>{t('common.no_results')}</Text>
            ) : null
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: { padding: 15, borderBottomWidth: 1, borderBottomColor: '#eee' },
  input: {
    height: 45,
    backgroundColor: '#f2f2f7',
    borderRadius: 10,
    paddingHorizontal: 15,
    fontSize: 16,
  },
  list: { padding: 15 },
  item: {
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f2f2f7',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  itemName: { fontSize: 16, fontWeight: '500' },
  itemPrice: { fontSize: 16, color: '#007AFF' },
  loader: { marginTop: 20 },
  emptyText: { textAlign: 'center', marginTop: 20, color: '#8e8e93' },
});

export default SearchScreen;
