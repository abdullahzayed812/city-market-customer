import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { ShoppingBag } from 'lucide-react-native';
import { theme } from '../../../theme';

interface CartEmptyStateProps {
  t: any;
  onShopPress: () => void;
}

export const CartEmptyState = ({ t, onShopPress }: CartEmptyStateProps) => (
  <View style={styles.centered}>
    <View style={styles.emptyIconContainer}>
      <ShoppingBag size={80} color={theme.colors.surface} />
    </View>
    <Text style={styles.emptyText}>{t('cart.empty')}</Text>
    <TouchableOpacity
      style={styles.shopButton}
      onPress={onShopPress}
    >
      <Text style={styles.shopButtonText}>{t('home.title')}</Text>
    </TouchableOpacity>
  </View>
);

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyIconContainer: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: theme.colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  emptyText: {
    fontSize: theme.typography.sizes.lg,
    color: theme.colors.textMuted,
    textAlign: 'center',
    marginBottom: theme.spacing.xl,
  },
  shopButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: theme.radius.md,
    ...theme.shadows.soft,
  },
  shopButtonText: {
    color: theme.colors.white,
    fontWeight: 'bold',
    fontSize: 16,
  },
});
