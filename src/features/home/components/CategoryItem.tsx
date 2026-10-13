import React from 'react';
import { Pressable, View, StyleSheet } from 'react-native';
import { AppText as Text, palette, radii } from '@city-market/mobile-ui';
import { LayoutGrid } from 'lucide-react-native';
import ImageWithPlaceholder from '../../../components/common/ImageWithPlaceholder';

interface CategoryItemProps {
  item: any;
  onPress: (id: string) => void;
}

export const CATEGORY_TILE_WIDTH = 76;

export const CategoryItem = React.memo(({ item, onPress }: CategoryItemProps) => (
  <Pressable
    onPress={() => onPress(item.id)}
    accessibilityRole="button"
    accessibilityLabel={item.name}
    style={({ pressed }) => [styles.wrapper, pressed && styles.pressed]}
  >
    <View style={styles.tile}>
      <ImageWithPlaceholder uri={item.iconUrl || null} style={styles.icon} resizeMode="cover" fallbackIcon={LayoutGrid} />
    </View>
    <Text variant="caption" color={palette.text} style={styles.name} numberOfLines={2}>
      {item.name}
    </Text>
  </Pressable>
));

const styles = StyleSheet.create({
  wrapper: {
    width: CATEGORY_TILE_WIDTH,
    alignItems: 'center',
  },
  pressed: {
    opacity: 0.75,
  },
  tile: {
    width: 68,
    height: 68,
    borderRadius: radii.lg,
    overflow: 'hidden',
    backgroundColor: palette.primarySoft,
  },
  icon: {
    width: '100%',
    height: '100%',
  },
  name: {
    marginTop: 6,
    textAlign: 'center',
    fontSize: 12,
    lineHeight: 17,
  },
});
