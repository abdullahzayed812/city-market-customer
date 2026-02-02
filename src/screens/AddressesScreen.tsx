import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  TextInput,
  Modal,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { UserService } from '../services/api/userService';

const AddressesScreen = ({ navigation }: any) => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [modalVisible, setModalVisible] = useState(false);
  const [newAddress, setNewAddress] = useState({
    label: 'Work',
    address: 'Building 4, Flat 14, 1200',
    isDefault: false,
    latitude: undefined,
    longitude: undefined,
  });

  const { data: addresses, isLoading } = useQuery({
    queryKey: ['addresses'],
    queryFn: UserService.getAddresses,
  });

  const addMutation = useMutation({
    mutationFn: UserService.addAddress,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['addresses'] });
      setModalVisible(false);
      setNewAddress({
        label: '',
        address: '',
        isDefault: false,
        latitude: undefined,
        longitude: undefined,
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: UserService.deleteAddress,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['addresses'] });
    },
  });

  const handleAddAddress = () => {
    if (!newAddress.label || !newAddress.address) {
      Alert.alert('Error', 'Label and address are required');
      return;
    }

    addMutation.mutate(newAddress);
  };

  const renderAddressItem = ({ item }: { item: any }) => (
    <View style={styles.addressCard}>
      <View style={styles.addressInfo}>
        <Text style={styles.streetText}>{item.label}</Text>
        <Text style={styles.cityText}>{item.address}</Text>
        {item.isDefault && (
          <View style={styles.primaryBadge}>
            <Text style={styles.primaryText}>Default</Text>
          </View>
        )}
      </View>
      <TouchableOpacity
        onPress={() => deleteMutation.mutate(item.id)}
        style={styles.deleteButton}
      >
        <Text style={styles.deleteText}>Delete</Text>
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
      <FlatList
        data={addresses}
        renderItem={renderAddressItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No addresses saved</Text>
        }
      />

      <TouchableOpacity
        style={styles.fab}
        onPress={() => setModalVisible(true)}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add New Address</Text>
            <TextInput
              style={styles.input}
              placeholder="Label (Home, Work, etc.)"
              value={newAddress.label}
              onChangeText={text =>
                setNewAddress({ ...newAddress, label: text })
              }
            />

            <TextInput
              style={[styles.input, { height: 80 }]}
              placeholder="Full Address"
              multiline
              value={newAddress.address}
              onChangeText={text =>
                setNewAddress({ ...newAddress, address: text })
              }
            />

            <TouchableOpacity
              onPress={() =>
                setNewAddress({
                  ...newAddress,
                  isDefault: !newAddress.isDefault,
                })
              }
            >
              <Text>
                {newAddress.isDefault ? '✓ Default Address' : 'Set as default'}
              </Text>
            </TouchableOpacity>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>
                  {t('common.cancel')}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={handleAddAddress}
              >
                <Text style={styles.saveButtonText}>{t('common.save')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  listContent: { padding: 15 },
  addressCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  addressInfo: { flex: 1 },
  streetText: { fontSize: 16, fontWeight: 'bold' },
  cityText: { fontSize: 14, color: '#8E8E93', marginTop: 4 },
  primaryBadge: {
    backgroundColor: '#E5F1FF',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  primaryText: { color: '#007AFF', fontSize: 10, fontWeight: 'bold' },
  deleteButton: { padding: 10 },
  deleteText: { color: '#FF3B30', fontWeight: '600' },
  emptyText: { textAlign: 'center', color: '#8E8E93', marginTop: 50 },
  fab: {
    position: 'absolute',
    bottom: 30,
    right: 30,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  fabText: { color: '#fff', fontSize: 32, fontWeight: 'bold' },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 20,
  },
  modalContent: { backgroundColor: '#fff', borderRadius: 16, padding: 20 },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 15,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  modalButton: {
    flex: 0.48,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: { backgroundColor: '#F2F2F7' },
  cancelButtonText: { color: '#3C3C43', fontWeight: 'bold' },
  saveButton: { backgroundColor: '#007AFF' },
  saveButtonText: { color: '#fff', fontWeight: 'bold' },
});

export default AddressesScreen;
