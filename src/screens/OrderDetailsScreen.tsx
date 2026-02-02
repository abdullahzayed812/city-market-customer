import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { OrderService } from '../services/api/orderService';

const OrderDetailsScreen = ({ route, navigation }: any) => {
  const { orderId } = route.params;
  const { t } = useTranslation();

  const { data: order, isLoading } = useQuery({
    queryKey: ['order', orderId],
    queryFn: () => OrderService.getOrderById(orderId),
  });

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Order #{order?.order?.id?.slice(-6)}
          </Text>
          <Text style={styles.status}>Status: {order?.order?.status}</Text>
          <Text style={styles.date}>
            {new Date(order?.order?.createdAt)?.toLocaleString()}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Items</Text>
          {order.items.map((item: any) => (
            <View key={item.id} style={styles.itemRow}>
              <Text style={styles.itemName}>
                {item.productName} x{item.quantity}
              </Text>
              <Text style={styles.itemPrice}>
                ${item.totalPrice?.toFixed(2)}
              </Text>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Summary</Text>
          <View style={styles.summaryRow}>
            <Text>Delivery Fee</Text>
            <Text style={styles.total}>
              ${order?.order?.deliveryFee?.toFixed(2)}
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text>Subtotal</Text>
            <Text style={styles.total}>
              ${order?.order?.subtotal?.toFixed(2)}
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text>Total Amount</Text>
            <Text style={styles.total}>
              ${order?.order?.totalAmount?.toFixed(2)}
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F2F2F7' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  backButton: { marginRight: 15 },
  backButtonText: { fontSize: 24, color: '#007AFF' },
  title: { fontSize: 20, fontWeight: 'bold' },
  content: { flex: 1 },
  section: { backgroundColor: '#fff', marginTop: 15, padding: 20 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
  status: {
    fontSize: 16,
    color: '#007AFF',
    marginBottom: 5,
    textTransform: 'capitalize',
  },
  date: { fontSize: 14, color: '#8E8E93' },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7',
  },
  itemName: { fontSize: 16 },
  itemPrice: { fontSize: 16, fontWeight: '600' },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  total: { fontSize: 18, fontWeight: 'bold', color: '#007AFF' },
});

export default OrderDetailsScreen;
