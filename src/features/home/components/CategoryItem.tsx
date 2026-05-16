import React, { useRef, useCallback } from 'react';
import { Animated, TouchableOpacity, View, Text, StyleSheet } from 'react-native';
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
    width: 72,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  icon: {
    width: 36,
    height: 36,
  },
  name: {
    fontSize: 11,
    color: theme.colors.textSecondary,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 15,
  },
});
