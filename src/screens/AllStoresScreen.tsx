import React, { useMemo } from 'react';
import { View, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { ScreenHeader, IconButton, EmptyState, LoadingState, palette, space } from '@city-market/mobile-ui';
import { useTranslation } from 'react-i18next';
import { Search, Store } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useHomeData } from '../features/home/hooks/useHomeData';
import { VendorItem } from '../features/home/components/VendorItem';
import QueryError from '../components/common/QueryError';

const AllStoresScreen = ({ route, navigation }: any) => {
  const { t } = useTranslation();
  const { type } = route.params || {};
  const { vendors, isLoading, error, refetch, isRefetching } = useHomeData();

  const filteredVendors = useMemo(() => {
    if (!vendors) return [];
    if (!type) return vendors;
    return vendors.filter((v: any) => v.type === type);
  }, [vendors, type]);

  const handleVendorPress = (id: string) => {
    navigation.navigate('StoreDetails', { vendorId: id });
  };

  const title = type ? t(`home.type_${type.toLowerCase()}`, { defaultValue: type }) : t('home.stores');

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScreenHeader
        title={title}
        onBack={() => navigation.goBack()}
        backLabel={t('common.back')}
        right={
          <IconButton
            icon={Search}
            variant="soft"
            size={40}
            onPress={() => navigation.navigate('Search')}
            accessibilityLabel={t('common.search')}
          />
        }
      />

      {isLoading ? (
        <LoadingState />
      ) : (
        <FlatList
          data={filteredVendors}
          renderItem={({ item }) => (
            <View style={styles.cell}>
              <VendorItem item={item} onPress={handleVendorPress} t={t} />
            </View>
          )}
          keyExtractor={item => item.id}
          numColumns={2}
          columnWrapperStyle={styles.row}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={palette.primary} colors={[palette.primary]} />
          }
          ListEmptyComponent={
            error ? (
              <QueryError error={error} onRetry={refetch} retrying={isRefetching} />
            ) : (
              <EmptyState icon={Store} title={t('home.no_stores')} message={t('home.no_stores_hint')} />
            )
          }
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: palette.background,
  },
  listContent: {
    flexGrow: 1,
    padding: space.lg,
    paddingBottom: space.xxxl,
  },
  row: {
    gap: space.md,
    marginBottom: space.md,
  },
  cell: {
    flex: 1,
    // Keeps a lone last card at half width instead of stretching.
    maxWidth: '50%',
  },
});

export default AllStoresScreen;
