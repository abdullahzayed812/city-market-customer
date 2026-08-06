import React, { useCallback } from 'react';
import { FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { AppText as Text } from '@city-market/mobile-ui';
import { theme } from '../../../theme';

interface CategoryTabsProps {
  t: any;
  categories: any[];
  selectedCategoryId: string | undefined;
  onSelect: (categoryId: string | undefined) => void;
}

export const CategoryTabs = React.memo(({ t, categories, selectedCategoryId, onSelect }: CategoryTabsProps) => {
  const data = [{ id: undefined, name: t('store.all') }, ...categories];

  const renderItem = useCallback(
    ({ item }: { item: any }) => {
      const isSelected = selectedCategoryId === item.id;
      return (
        <TouchableOpacity
          style={[styles.tab, isSelected && styles.tabSelected]}
          activeOpacity={0.8}
          onPress={() => onSelect(item.id)}
        >
          <Text style={[styles.tabText, isSelected && styles.tabTextSelected]} numberOfLines={1}>
            {item.name}
          </Text>
        </TouchableOpacity>
      );
    },
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
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.sm,
    gap: theme.spacing.sm,
  },
  tab: {
    backgroundColor: theme.colors.white,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.pill,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 9,
  },
  tabSelected: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.textSecondary,
  },
  tabTextSelected: {
    color: theme.colors.white,
  },
});
