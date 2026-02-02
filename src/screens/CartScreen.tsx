import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useCart } from '../app/CartContext';

const CartScreen = ({ navigation }: any) => {
    const { t } = useTranslation();
    const { items, removeFromCart, updateQuantity, total } = useCart();

    const renderCartItem = ({ item }: { item: any }) => (
        <View style={styles.cartItem}>
            <View style={styles.itemInfo}>
                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={styles.itemPrice}>${item.price.toFixed(2)}</Text>
            </View>
            <View style={styles.quantityControls}>
                <TouchableOpacity
                    style={styles.qtyButton}
                    onPress={() => updateQuantity(item.id, item.quantity - 1)}
                >
                    <Text style={styles.qtyButtonText}>-</Text>
                </TouchableOpacity>
                <Text style={styles.quantity}>{item.quantity}</Text>
                <TouchableOpacity
                    style={styles.qtyButton}
                    onPress={() => updateQuantity(item.id, item.quantity + 1)}
                >
                    <Text style={styles.qtyButtonText}>+</Text>
                </TouchableOpacity>
            </View>
            <TouchableOpacity onPress={() => removeFromCart(item.id)} style={styles.removeButton}>
                <Text style={styles.removeText}>{t('cart.remove')}</Text>
            </TouchableOpacity>
        </View>
    );

    if (items.length === 0) {
        return (
            <View style={styles.centered}>
                <Text style={styles.emptyText}>{t('cart.empty')}</Text>
                <TouchableOpacity
                    style={styles.shopButton}
                    onPress={() => navigation.navigate('Home')}
                >
                    <Text style={styles.shopButtonText}>{t('home.title')}</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>{t('cart.title')}</Text>
            </View>

            <FlatList
                data={items}
                renderItem={renderCartItem}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.listContent}
            />

            <View style={styles.footer}>
                <View style={styles.totalRow}>
                    <Text style={styles.totalLabel}>{t('cart.total')}</Text>
                    <Text style={styles.totalValue}>${total.toFixed(2)}</Text>
                </View>
                <TouchableOpacity
                    style={styles.checkoutButton}
                    onPress={() => navigation.navigate('Checkout')}
                >
                    <Text style={styles.checkoutButtonText}>{t('cart.checkout')}</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
    header: { padding: 20, borderBottomWidth: 1, borderBottomColor: '#F2F2F7' },
    title: { fontSize: 24, fontWeight: 'bold' },
    listContent: { padding: 15 },
    cartItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#F2F2F7'
    },
    itemInfo: { flex: 1 },
    itemName: { fontSize: 16, fontWeight: 'bold' },
    itemPrice: { fontSize: 14, color: '#007AFF', marginTop: 4 },
    quantityControls: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 15 },
    qtyButton: {
        width: 30,
        height: 30,
        borderRadius: 15,
        backgroundColor: '#F2F2F7',
        justifyContent: 'center',
        alignItems: 'center'
    },
    qtyButtonText: { fontSize: 18, fontWeight: 'bold' },
    quantity: { marginHorizontal: 10, fontSize: 16, fontWeight: '600' },
    removeButton: { padding: 5 },
    removeText: { color: '#FF3B30', fontSize: 12 },
    footer: { padding: 20, borderTopWidth: 1, borderTopColor: '#F2F2F7' },
    totalRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
    totalLabel: { fontSize: 18, fontWeight: '600' },
    totalValue: { fontSize: 22, fontWeight: 'bold', color: '#007AFF' },
    checkoutButton: {
        backgroundColor: '#007AFF',
        padding: 18,
        borderRadius: 12,
        alignItems: 'center'
    },
    checkoutButtonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
    emptyText: { fontSize: 18, color: '#8E8E93', marginBottom: 20 },
    shopButton: { backgroundColor: '#007AFF', paddingHorizontal: 30, paddingVertical: 12, borderRadius: 25 },
    shopButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});

export default CartScreen;
