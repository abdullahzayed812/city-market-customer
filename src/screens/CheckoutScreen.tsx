import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation } from '@tanstack/react-query';
import { UserService } from '../services/api/userService';
import { OrderService } from '../services/api/orderService';
import { useCart } from '../app/CartContext';

const CheckoutScreen = ({ navigation }: any) => {
  const { t } = useTranslation();
  const { items, total, clearCart } = useCart();
  const [selectedAddress, setSelectedAddress] = useState<string | null>(null);

  const { data: addresses, isLoading: addressesLoading } = useQuery({
    queryKey: ['addresses'],
    queryFn: UserService.getAddresses,
  });

  const orderMutation = useMutation({
    mutationFn: OrderService.createOrder,
    onSuccess: () => {
      clearCart();
      Alert.alert(t('checkout.success'), '', [
        {
          text: 'OK',
          onPress: () => navigation.replace('Main', { screen: 'Orders' }),
        },
      ]);
    },
    onError: () => {
      Alert.alert(t('common.error'), 'Failed to place order');
    },
  });

  const handleConfirmOrder = () => {
    if (!selectedAddress) {
      Alert.alert(t('common.error'), 'Please select a delivery address');
      return;
    }

    const address = addresses?.find((a: any) => a.id === selectedAddress);
    if (!address) {
      Alert.alert(t('common.error'), 'Selected address not found');
      return;
    }

    const orderData = {
      vendorId: items[0].vendorId, // Assuming all items from same vendor for MVP
      items: items.map(item => ({
        productId: item.id,
        quantity: item.quantity,
      })),
      deliveryAddress: address.address,
      deliveryLatitude: address.latitude,
      deliveryLongitude: address.longitude,
    };

    orderMutation.mutate(orderData);
  };

  if (addressesLoading) {
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
          <Text style={styles.sectionTitle}>{t('checkout.address')}</Text>
          {addresses?.map((address: any) => (
            <TouchableOpacity
              key={address.id}
              style={[
                styles.addressCard,
                selectedAddress === address.id && styles.selectedAddress,
              ]}
              onPress={() => setSelectedAddress(address.id)}
            >
              <Text style={styles.addressText}>
                {address.label}, {address.address}
              </Text>
            </TouchableOpacity>
          ))}
          <TouchableOpacity
            style={styles.addAddressButton}
            onPress={() => navigation.navigate('Addresses')}
          >
            <Text style={styles.addAddressText}>+ Add New Address</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order Summary</Text>
          <View style={styles.summaryRow}>
            <Text>{t('cart.total')}</Text>
            <Text>${total.toFixed(2)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text>{t('checkout.delivery_fee')}</Text>
            <Text>$5.00</Text>
          </View>
          <View style={[styles.summaryRow, styles.grandTotalRow]}>
            <Text style={styles.grandTotalLabel}>Grand Total</Text>
            <Text style={styles.grandTotalValue}>
              ${(total + 5).toFixed(2)}
            </Text>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.confirmButton}
          onPress={handleConfirmOrder}
          disabled={orderMutation.isPending}
        >
          {orderMutation.isPending ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.confirmButtonText}>
              {t('checkout.confirm_order')}
            </Text>
          )}
        </TouchableOpacity>
      </View>
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
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 15 },
  addressCard: {
    padding: 15,
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderRadius: 10,
    marginBottom: 10,
  },
  selectedAddress: { borderColor: '#007AFF', backgroundColor: '#F0F7FF' },
  addressText: { fontSize: 16 },
  addAddressButton: { marginTop: 10 },
  addAddressText: { color: '#007AFF', fontWeight: '600' },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  grandTotalRow: {
    borderTopWidth: 1,
    borderTopColor: '#F2F2F7',
    paddingTop: 15,
    marginTop: 5,
  },
  grandTotalLabel: { fontSize: 18, fontWeight: 'bold' },
  grandTotalValue: { fontSize: 20, fontWeight: 'bold', color: '#007AFF' },
  footer: {
    padding: 20,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
  },
  confirmButton: {
    backgroundColor: '#34C759',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
  },
  confirmButtonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
});

export default CheckoutScreen;
