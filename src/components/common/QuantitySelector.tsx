import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Minus, Plus } from 'lucide-react-native';
import { theme } from '../../theme';

interface QuantitySelectorProps {
    quantity: number;
    onIncrement: () => void;
    onDecrement: () => void;
    maxQuantity?: number;
}

const QuantitySelector: React.FC<QuantitySelectorProps> = ({
    quantity,
    onIncrement,
    onDecrement,
    maxQuantity,
}) => {
    return (
        <View style={styles.container}>
            <TouchableOpacity
                style={[styles.button, quantity <= 1 && styles.disabledButton]}
                onPress={onDecrement}
                disabled={quantity <= 1}
            >
                <Minus size={20} color={quantity <= 1 ? theme.colors.textMuted : theme.colors.primary} />
            </TouchableOpacity>

            <View style={styles.quantityContainer}>
                <Text style={styles.quantityText}>{quantity}</Text>
            </View>

            <TouchableOpacity
                style={[
                    styles.button,
                    maxQuantity !== undefined && quantity >= maxQuantity && styles.disabledButton,
                ]}
                onPress={onIncrement}
                disabled={maxQuantity !== undefined && quantity >= maxQuantity}
            >
                <Plus size={20} color={maxQuantity !== undefined && quantity >= maxQuantity ? theme.colors.textMuted : theme.colors.primary} />
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.white,
        borderRadius: theme.radius.md,
        borderWidth: 1,
        borderColor: theme.colors.border,
        padding: 4,
        width: 130,
        justifyContent: 'space-between',
    },
    button: {
        width: 36,
        height: 36,
        borderRadius: theme.radius.sm,
        backgroundColor: theme.colors.background,
        justifyContent: 'center',
        alignItems: 'center',
    },
    disabledButton: {
        opacity: 0.5,
    },
    quantityContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    quantityText: {
        fontSize: theme.typography.sizes.md,
        fontWeight: theme.typography.weights.bold,
        color: theme.colors.primary,
    },
});

export default QuantitySelector;
