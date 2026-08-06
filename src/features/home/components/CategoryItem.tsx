import React, { useRef, useCallback } from 'react';
import { Animated, TouchableOpacity, View, StyleSheet } from 'react-native';
import { AppText as Text } from '@city-market/mobile-ui';
import { theme } from '../../../theme';
import ImageWithPlaceholder from '../../../components/common/ImageWithPlaceholder';

interface CategoryItemProps {
  item: any;
  onPress: (id: string) => void;
}

export const CategoryItem = React.memo(({ item, onPress }: CategoryItemProps) => {
  const scale = useRef(new Animated.Value(1)).current;

  const handlePressIn = useCallback(() => {
    Animated.spring(scale, {
      toValue: 0.88,
      useNativeDriver: true,
      speed: 40,
      bounciness: 4,
    }).start();
  }, [scale]);

  const handlePressOut = useCallback(() => {
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
      speed: 40,
      bounciness: 6,
    }).start();
  }, [scale]);

  return (
    <TouchableOpacity
      onPress={() => onPress(item.id)}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      activeOpacity={1}
      style={styles.wrapper}
    >
      <Animated.View style={{ transform: [{ scale }] }}>
        <View
          style={[
            styles.iconContainer,
            { backgroundColor: (item.color || theme.colors.primary) + '18' },
          ]}
        >
          <ImageWithPlaceholder
            uri={item.iconUrl || null}
            style={styles.icon}
            resizeMode="contain"
          />
        </View>
        <Text style={styles.name} numberOfLines={1}>
          {item.name}
        </Text>
      </Animated.View>
    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    marginRight: theme.spacing.md,
    width: 96,
  },
  iconContainer: {
    width: 88,
    height: 88,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  icon: {
    width: 60,
    height: 60,
  },
  name: {
    fontSize: 11,
    color: theme.colors.textSecondary,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 15,
  },
});
