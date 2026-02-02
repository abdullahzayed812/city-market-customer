import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  // TextInput,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { CatalogService } from '../services/api/catalogService';
import { VendorService } from '../services/api/vendorService';

const HomeScreen = ({ navigation }: any) => {
  const { t } = useTranslation();
  // const [searchQuery, setSearchQuery] = useState('');

  const { data: categories, isLoading: categoriesLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: CatalogService.getCategories,
  });

  const { data: vendors, isLoading: vendorsLoading } = useQuery({
    queryKey: ['vendors'],
    queryFn: VendorService.getVendors,
  });

  const renderCategoryItem = ({ item }: { item: any }) => (
    <TouchableOpacity style={styles.categoryCard}>
      <Text style={styles.categoryName}>{item.name}</Text>
    </TouchableOpacity>
  );

  const renderVendorItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.vendorCard}
      onPress={() => navigation.navigate('StoreDetails', { vendorId: item.id })}
    >
      <View style={styles.vendorInfo}>
        <Text style={styles.vendorName}>{item.shopName}</Text>
        <Text style={styles.vendorDesc} numberOfLines={1}>
          {item.shopDescription}
        </Text>
        <View style={styles.vendorStatus}>
          <View
            style={[
              styles.statusDot,
              {
                backgroundColor: item.status === 'open' ? '#34C759' : '#FF3B30',
              },
            ]}
          />
          <Text style={styles.statusText}>{item.status}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  if (categoriesLoading || vendorsLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{t('home.title')}</Text>
        <TouchableOpacity
          style={styles.searchInput}
          onPress={() => navigation.navigate('Search')}
        >
          <Text>{t('home.search_placeholder')}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('home.categories')}</Text>
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={categories}
            renderItem={renderCategoryItem}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.categoriesList}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('home.stores')}</Text>
          <FlatList
            data={vendors}
            renderItem={renderVendorItem}
            keyExtractor={item => item.id}
            scrollEnabled={false}
            contentContainerStyle={styles.vendorsList}
          />
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F2F2F7' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { padding: 20, backgroundColor: '#fff' },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 15 },
  searchInput: {
    justifyContent: 'center',
    height: 45,
    backgroundColor: '#F2F2F7',
    borderRadius: 10,
    paddingHorizontal: 15,
    fontSize: 16,
  },
  section: { marginTop: 20 },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginHorizontal: 20,
    marginBottom: 15,
  },
  categoriesList: { paddingHorizontal: 15 },
  categoryCard: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    marginHorizontal: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  categoryName: { fontSize: 14, fontWeight: '600' },
  vendorsList: { paddingHorizontal: 20 },
  vendorCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 15,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  vendorInfo: { padding: 15 },
  vendorName: { fontSize: 18, fontWeight: 'bold' },
  vendorDesc: { fontSize: 14, color: '#8E8E93', marginTop: 5 },
  vendorStatus: { flexDirection: 'row', alignItems: 'center', marginTop: 10 },
  statusDot: { width: 8, height: 8, borderRadius: 4, marginRight: 6 },
  statusText: { fontSize: 12, color: '#3C3C43', textTransform: 'capitalize' },
});

export default HomeScreen;
