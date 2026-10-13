import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { AppText as Text, palette, radii } from '@city-market/mobile-ui';
import { useTranslation } from 'react-i18next';
import { Minus, Plus } from 'lucide-react-native';

interface QuantitySelectorProps {
  quantity: number;
  onIncrement: () => void;
  onDecrement: () => void;
  maxQuantity?: number;
  minQuantity?: number;
  displayValue?: string;
  /** `lg` for the product page, `md` for list rows. */
  size?: 'md' | 'lg';
}

const QuantitySelector: React.FC<QuantitySelectorProps> = ({
  quantity,
  onIncrement,
  onDecrement,
  maxQuantity,
  minQuantity = 1,
  displayValue,
  size = 'md',
}) => {
  const { t } = useTranslation();
  const isDecrDisabled = quantity <= minQuantity;
  const isIncrDisabled = maxQuantity !== undefined && quantity >= maxQuantity;
  const btn = size === 'lg' ? 44 : 36;

  const renderButton = (kind: 'dec' | 'inc') => {
    const disabled = kind === 'dec' ? isDecrDisabled : isIncrDisabled;
    const Icon = kind === 'dec' ? Minus : Plus;
    return (
      <Pressable
        onPress={kind === 'dec' ? onDecrement : onIncrement}
        disabled={disabled}
        hitSlop={4}
        accessibilityRole="button"
        accessibilityLabel={kind === 'dec' ? t('common.decrease') : t('common.increase')}
        accessibilityState={{ disabled }}
        style={({ pressed }) => [
          styles.button,
          { width: btn, height: btn, borderRadius: btn / 2 },
          disabled && styles.buttonDisabled,
          pressed && styles.pressed,
        ]}
      >
        <Icon size={size === 'lg' ? 20 : 17} color={disabled ? palette.textDisabled : palette.primary} strokeWidth={2.5} />
      </Pressable>
    );
  };

  return (
    <View style={styles.container} accessibilityRole="adjustable" accessibilityValue={{ text: displayValue ?? String(quantity) }}>
      {renderButton('dec')}
      <View style={[styles.valueContainer, size === 'lg' && styles.valueLg]}>
        <Text variant={size === 'lg' ? 'heading' : 'bodyStrong'} color={palette.text} style={styles.valueText} numberOfLines={1}>
          {displayValue ?? quantity}
        </Text>
      </View>
      {renderButton('inc')}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: palette.primarySoft,
    borderRadius: radii.pill,
    padding: 3,
  },
  button: {
    backgroundColor: palette.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: 'transparent',
  },
  pressed: {
    opacity: 0.6,
  },
  valueContainer: {
    minWidth: 40,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  valueLg: {
    minWidth: 64,
  },
  valueText: {
    fontVariant: ['tabular-nums'],
  },
});

export default React.memo(QuantitySelector);
