import React, { useCallback } from 'react';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import { theme } from '../../../theme';
import { getBaseURL } from '../../../services/api/apiClient';
import ImageWithPlaceholder from '../../../components/common/ImageWithPlaceholder';

interface CategoryItemProps {
  item: any;
  onPress: (id: string) => void;
}

export const CategoryItem = React.memo(({ item, onPress }: CategoryItemProps) => (
  <TouchableOpacity
    style={styles.categoryCard}
    onPress={() => onPress(item.id)}
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
));

const styles = StyleSheet.create({
  categoryCard: {
    alignItems: 'center',
    marginRight: theme.spacing.md,
    width: 70,
  },
  categoryIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.xs,
  },
  categoryIcon: {
    width: 34,
    height: 34,
  },
  categoryName: {
    fontSize: 12,
    color: theme.colors.primary,
    fontWeight: '500',
    textAlign: 'center',
  },
});
