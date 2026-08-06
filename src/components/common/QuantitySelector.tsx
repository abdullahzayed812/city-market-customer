import React, { useRef, useCallback } from 'react';
import { View, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { AppText as Text } from '@city-market/mobile-ui';
import { Minus, Plus } from 'lucide-react-native';
import { theme } from '../../theme';

interface QuantitySelectorProps {
  quantity: number;
  onIncrement: () => void;
  onDecrement: () => void;
  maxQuantity?: number;
  minQuantity?: number;
  displayValue?: string;
}

const AnimatedIconButton = ({
  onPress,
  disabled,
  children,
}: {
  onPress: () => void;
  disabled: boolean;
  children: React.ReactNode;
}) => {
  const scale = useRef(new Animated.Value(1)).current;

  const handlePressIn = useCallback(() => {
    if (disabled) return;
    Animated.spring(scale, { toValue: 0.82, useNativeDriver: true, speed: 50, bounciness: 4 }).start();
  }, [scale, disabled]);

  const handlePressOut = useCallback(() => {
    Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 50, bounciness: 6 }).start();
  }, [scale]);

  return (
    <TouchableOpacity
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled}
      activeOpacity={1}
    >
      <Animated.View
        style={[
          styles.button,
          disabled && styles.buttonDisabled,
          { transform: [{ scale }] },
        ]}
      >
        {children}
      </Animated.View>
    </TouchableOpacity>
  );
};

const QuantitySelector: React.FC<QuantitySelectorProps> = ({
  quantity,
  onIncrement,
  onDecrement,
  maxQuantity,
  minQuantity = 1,
  displayValue,
}) => {
  const isDecrDisabled = quantity <= minQuantity;
  const isIncrDisabled = maxQuantity !== undefined && quantity >= maxQuantity;

  return (
    <View style={styles.container}>
      <AnimatedIconButton onPress={onDecrement} disabled={isDecrDisabled}>
        <Minus size={16} color={isDecrDisabled ? theme.colors.textMuted : theme.colors.primary} strokeWidth={2.5} />
      </AnimatedIconButton>

      <View style={styles.valueContainer}>
        <Text style={styles.valueText}>{displayValue ?? quantity}</Text>
      </View>

      <AnimatedIconButton onPress={onIncrement} disabled={isIncrDisabled}>
        <Plus size={16} color={isIncrDisabled ? theme.colors.textMuted : theme.colors.primary} strokeWidth={2.5} />
      </AnimatedIconButton>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.primaryXLight,
    borderRadius: theme.radius.md,
    padding: 3,
    gap: 2,
  },
  button: {
    width: 30,
    height: 30,
    borderRadius: 9,
    backgroundColor: theme.colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    ...theme.shadows.soft,
  },
  buttonDisabled: {
    backgroundColor: theme.colors.borderLight,
    shadowOpacity: 0,
    elevation: 0,
  },
  valueContainer: {
    minWidth: 32,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  valueText: {
    fontSize: 14,
    fontWeight: '800',
    color: theme.colors.primary,
  },
});

export default React.memo(QuantitySelector);
