import React from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { OrderService } from '../services/api/orderService';

const OrdersScreen = ({ navigation }: any) => {
    const { t } = useTranslation();

    const { data: orders, isLoading } = useQuery({
        queryKey: ['myOrders'],
        queryFn: OrderService.getMyOrders,
    });

    const renderOrderItem = ({ item }: { item: any }) => (
        <View style={styles.orderCard}>
            <View style={styles.orderHeader}>
                <Text style={styles.orderId}>Order #{item.id.slice(-6)}</Text>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
                    <Text style={styles.statusText}>{item.status}</Text>
                </View>
            </View>

            <View style={styles.orderInfo}>
                <Text style={styles.date}>{new Date(item.createdAt).toLocaleDateString()}</Text>
                <Text style={styles.total}>${item.totalAmount.toFixed(2)}</Text>
            </View>

            <TouchableOpacity
                style={styles.detailsButton}
                onPress={() => navigation.navigate('OrderDetails', { orderId: item.id })}
            >
                <Text style={styles.detailsButtonText}>{t('orders.track')}</Text>
            </TouchableOpacity>
        </View>
    );

    if (isLoading) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" color="#007AFF" />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>{t('orders.title')}</Text>
            </View>

            <FlatList
                data={orders}
                renderItem={renderOrderItem}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.listContent}
                ListEmptyComponent={<Text style={styles.emptyText}>No orders found</Text>}
            />
        </View>
    );
};

const getStatusColor = (status: string) => {
    switch (status) {
        case 'pending': return '#FF9500';
        case 'confirmed': return '#5856D6';
        case 'shipped': return '#007AFF';
        case 'delivered': return '#34C759';
        case 'cancelled': return '#FF3B30';
        default: return '#8E8E93';
    }
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F2F2F7' },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    header: { padding: 20, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#E5E5EA' },
    title: { fontSize: 24, fontWeight: 'bold' },
    listContent: { padding: 15 },
    orderCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 15,
        marginBottom: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3
    },
    orderHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
    orderId: { fontSize: 18, fontWeight: 'bold' },
    statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 },
    statusText: { color: '#fff', fontSize: 12, fontWeight: 'bold', textTransform: 'capitalize' },
    orderInfo: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
    date: { fontSize: 14, color: '#8E8E93' },
    total: { fontSize: 16, fontWeight: 'bold' },
    detailsButton: {
        borderWidth: 1,
        borderColor: '#007AFF',
        padding: 10,
        borderRadius: 8,
        alignItems: 'center'
    },
    detailsButtonText: { color: '#007AFF', fontWeight: '600' },
    emptyText: { textAlign: 'center', color: '#8E8E93', marginTop: 50 },
});

export default OrdersScreen;
