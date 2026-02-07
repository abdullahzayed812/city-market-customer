import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  Modal,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { MapPin, Plus, ChevronLeft, Trash2, Home, Briefcase, Navigation, Check } from 'lucide-react-native';
import Toast from 'react-native-toast-message';
import { SafeAreaView } from 'react-native-safe-area-context';
import { UserService } from '../services/api/userService';
import { theme } from '../theme';

const AddressesScreen = ({ navigation }: any) => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [modalVisible, setModalVisible] = useState(false);
  const [newAddress, setNewAddress] = useState({
    label: '',
    address: '',
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
      Toast.show({
        type: 'success',
        text1: 'Address Added',
        text2: 'Your new address has been saved.',
        position: 'top',
      });
    },
    onError: () => {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to add address.',
        position: 'top',
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: UserService.deleteAddress,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['addresses'] });
      Toast.show({
        type: 'success',
        text1: 'Address Deleted',
        position: 'top',
      });
    },
  });

  const handleAddAddress = () => {
    if (!newAddress.label || !newAddress.address) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Label and address are required',
        position: 'top',
      });
      return;
    }

    addMutation.mutate(newAddress);
  };

  const getAddressIcon = (label: string) => {
    const l = label.toLowerCase();
    if (l.includes('home')) return Home;
    if (l.includes('work') || l.includes('office')) return Briefcase;
    return Navigation;
  };

  const renderAddressItem = ({ item }: { item: any }) => {
    const Icon = getAddressIcon(item.label);
    return (
      <View style={styles.addressCard}>
        <View style={styles.addressIconContainer}>
          <Icon size={22} color={theme.colors.primary} />
        </View>
        <View style={styles.addressInfo}>
          <View style={styles.labelRow}>
            <Text style={styles.labelBadgeText}>{item.label}</Text>
            {item.isDefault && (
              <View style={styles.defaultBadge}>
                <Text style={styles.defaultText}>Default</Text>
              </View>
            )}
          </View>
          <Text style={styles.addressText} numberOfLines={2}>{item.address}</Text>
        </View>
        <TouchableOpacity
          onPress={() => deleteMutation.mutate(item.id)}
          style={styles.deleteButton}
        >
          <Trash2 size={20} color={theme.colors.error} />
        </TouchableOpacity>
      </View>
    );
  };

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.white} />
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <ChevronLeft size={24} color={theme.colors.primary} />
          </TouchableOpacity>
          <Text style={styles.title}>{t('profile.addresses')}</Text>
          <View style={{ width: 40 }} />
        </View>

        <FlatList
          data={addresses}
          renderItem={renderAddressItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <MapPin size={64} color={theme.colors.surface} />
              <Text style={styles.emptyText}>No addresses saved</Text>
            </View>
          }
        />

        <TouchableOpacity
          style={styles.fab}
          onPress={() => setModalVisible(true)}
        >
          <Plus size={30} color={theme.colors.white} />
        </TouchableOpacity>

        <Modal
          animationType="fade"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <KeyboardAvoidingView
              behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
              style={styles.modalPosition}
            >
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Add New Address</Text>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Label</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="e.g. Home, Work"
                    value={newAddress.label}
                    onChangeText={text => setNewAddress({ ...newAddress, label: text })}
                    placeholderTextColor={theme.colors.textMuted}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Address Details</Text>
                  <TextInput
                    style={[styles.input, { height: 100, textAlignVertical: 'top' }]}
                    placeholder="Enter full address"
                    multiline
                    value={newAddress.address}
                    onChangeText={text => setNewAddress({ ...newAddress, address: text })}
                    placeholderTextColor={theme.colors.textMuted}
                  />
                </View>

                <TouchableOpacity
                  style={styles.defaultCheckbox}
                  onPress={() => setNewAddress({ ...newAddress, isDefault: !newAddress.isDefault })}
                >
                  <View style={[styles.checkbox, newAddress.isDefault && styles.checkboxActive]}>
                    {newAddress.isDefault && <Check size={14} color={theme.colors.white} />}
                  </View>
                  <Text style={styles.checkboxLabel}>Set as default address</Text>
                </TouchableOpacity>

                <View style={styles.modalButtons}>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.cancelBtn]}
                    onPress={() => setModalVisible(false)}
                  >
                    <Text style={styles.cancelBtnText}>{t('common.cancel')}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.saveBtn]}
                    onPress={handleAddAddress}
                    disabled={addMutation.isPending}
                  >
                    {addMutation.isPending ? (
                      <ActivityIndicator color={theme.colors.white} />
                    ) : (
                      <Text style={styles.saveBtnText}>{t('common.save')}</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            </KeyboardAvoidingView>
          </View>
        </Modal>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: theme.colors.white },
  container: { flex: 1, backgroundColor: theme.colors.background },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.colors.background },
  header: {
    padding: theme.spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.colors.white,
    ...theme.shadows.soft,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: theme.typography.sizes.xl,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.primary,
  },
  listContent: { padding: theme.spacing.lg, paddingBottom: 100 },
  addressCard: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    ...theme.shadows.soft,
  },
  addressIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: theme.colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  addressInfo: { flex: 1 },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  labelBadgeText: {
    fontSize: theme.typography.sizes.md,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.primary,
  },
  defaultBadge: {
    backgroundColor: theme.colors.primary + '15',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 8,
  },
  defaultText: {
    color: theme.colors.primary,
    fontSize: 10,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  addressText: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.textMuted,
    lineHeight: 18,
  },
  deleteButton: {
    padding: 10,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 100,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: theme.colors.textMuted,
  },
  fab: {
    position: 'absolute',
    bottom: 30,
    right: 25,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...theme.shadows.medium,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalPosition: {
    width: '100%',
  },
  modalContent: {
    backgroundColor: theme.colors.white,
    borderTopLeftRadius: theme.radius.xl,
    borderTopRightRadius: theme.radius.xl,
    padding: 30,
    paddingBottom: Platform.OS === 'ios' ? 50 : 30,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.primary,
    marginBottom: 25,
    textAlign: 'center',
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.primary,
    marginBottom: 8,
  },
  input: {
    backgroundColor: theme.colors.background,
    borderRadius: theme.radius.md,
    padding: 15,
    fontSize: 16,
    color: theme.colors.primary,
  },
  defaultCheckbox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 30,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: theme.colors.border,
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxActive: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primary,
  },
  checkboxLabel: {
    fontSize: 14,
    color: theme.colors.primary,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    flex: 0.48,
    height: 55,
    borderRadius: theme.radius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelBtn: {
    backgroundColor: theme.colors.background,
  },
  cancelBtnText: {
    color: theme.colors.primary,
    fontWeight: 'bold',
  },
  saveBtn: {
    backgroundColor: theme.colors.primary,
  },
  saveBtnText: {
    color: theme.colors.white,
    fontWeight: 'bold',
  },
});

export default AddressesScreen;
