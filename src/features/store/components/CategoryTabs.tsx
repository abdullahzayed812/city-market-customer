import React, { useCallback } from 'react';
import { FlatList, StyleSheet } from 'react-native';
import { Chip, space } from '@city-market/mobile-ui';

interface CategoryTabsProps {
  t: any;
  categories: any[];
  selectedCategoryId: string | undefined;
  onSelect: (categoryId: string | undefined) => void;
}

export const CategoryTabs = React.memo(({ t, categories, selectedCategoryId, onSelect }: CategoryTabsProps) => {
  const data = [{ id: undefined, name: t('store.all') }, ...categories];

  const renderItem = useCallback(
    ({ item }: { item: any }) => (
      <Chip label={item.name} selected={selectedCategoryId === item.id} onPress={() => onSelect(item.id)} />
    ),
    [selectedCategoryId, onSelect],
  );

  return (
    <FlatList
      horizontal
      data={data}
      keyExtractor={item => item.id ?? 'all'}
      renderItem={renderItem}
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.list}
    />
  );
});

const styles = StyleSheet.create({
  list: {
    paddingHorizontal: space.lg,
    paddingBottom: space.lg,
    gap: space.sm,
  },
});
