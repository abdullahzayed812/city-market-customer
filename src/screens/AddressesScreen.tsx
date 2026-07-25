import React from 'react';
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
import { MapPin, Plus, ChevronLeft, Trash2, Check } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '../theme';
import { useAddresses } from '../hooks/useAddresses';
import MapPickerModal from '../components/MapPickerModal';

const GOOGLE_MAPS_API_KEY = 'YOUR_GOOGLE_MAPS_API_KEY';

const AddressesScreen = ({ navigation }: any) => {
  const { t } = useTranslation();
  const {
    addresses,
    isLoading,
    modalVisible,
    setModalVisible,
    newAddress,
    setNewAddress,
    addMutation,
    deleteMutation,
    handleAddAddress,
    getAddressIcon,
  } = useAddresses();

  const [mapVisible, setMapVisible] = React.useState(false);

  const handleLocationSelected = (data: {
    address: string;
    latitude: number;
    longitude: number;
  }) => {
    setNewAddress({
      ...newAddress,
      address: data.address,
      latitude: data.latitude,
      longitude: data.longitude,
    });
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
                <Text style={styles.defaultText}>{t('addresses.default')}</Text>
              </View>
            )}
          </View>
          <Text style={styles.addressText} numberOfLines={2}>
            {item.address}
          </Text>
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
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
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
              <View style={styles.emptyIconCircle}>
                <MapPin
                  size={40}
                  color={theme.colors.primary}
                  strokeWidth={1.5}
                />
              </View>
              <Text style={styles.emptyTitle}>{t('profile.no_addresses')}</Text>
              <Text style={styles.emptyText}>
                {t('addresses.empty_hint')}
              </Text>
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
                <Text style={styles.modalTitle}>{t('profile.add_new')}</Text>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>{t('addresses.label')}</Text>
                  <TextInput
                    style={styles.input}
                    placeholder={t('addresses.placeholder_label')}
                    value={newAddress.label}
                    onChangeText={text =>
                      setNewAddress({ ...newAddress, label: text })
                    }
                    placeholderTextColor={theme.colors.textMuted}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>{t('addresses.address_details')}</Text>
                  <TextInput
                    style={[
                      styles.input,
                      { height: 100, textAlignVertical: 'top' },
                    ]}
                    placeholder={t('addresses.placeholder_address')}
                    multiline
                    value={newAddress.address}
                    onChangeText={text =>
                      setNewAddress({ ...newAddress, address: text })
                    }
                    placeholderTextColor={theme.colors.textMuted}
                  />
                  <TouchableOpacity
                    style={styles.mapPickerButton}
                    onPress={() => setMapVisible(true)}
                  >
                    <MapPin size={18} color={theme.colors.primary} />
                    <Text style={styles.mapPickerButtonText}>{t('addresses.pick_on_map')}</Text>
                  </TouchableOpacity>
                </View>

                <TouchableOpacity
                  style={styles.defaultCheckbox}
                  onPress={() =>
                    setNewAddress({
                      ...newAddress,
                      isDefault: !newAddress.isDefault,
                    })
                  }
                >
                  <View
                    style={[
                      styles.checkbox,
                      newAddress.isDefault && styles.checkboxActive,
                    ]}
                  >
                    {newAddress.isDefault && (
                      <Check size={14} color={theme.colors.white} />
                    )}
                  </View>
                  <Text style={styles.checkboxLabel}>
                    {t('addresses.set_default')}
                  </Text>
                </TouchableOpacity>

                <View style={styles.modalButtons}>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.cancelBtn]}
                    onPress={() => setModalVisible(false)}
                  >
                    <Text style={styles.cancelBtnText}>
                      {t('common.cancel')}
                    </Text>
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

        <MapPickerModal
          visible={mapVisible}
          onClose={() => setMapVisible(false)}
          onConfirm={handleLocationSelected}
          googleApiKey={GOOGLE_MAPS_API_KEY}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: theme.colors.white },
  container: { flex: 1, backgroundColor: theme.colors.background },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.colors.white,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    letterSpacing: -0.3,
  },
  listContent: { padding: theme.spacing.lg, paddingBottom: 100 },
  addressCard: {
    flexDirection: 'row',
    backgroundColor: theme.colors.white,
    padding: theme.spacing.md,
    borderRadius: theme.radius.lg,
    marginBottom: theme.spacing.sm,
    alignItems: 'center',
    ...theme.shadows.soft,
    gap: theme.spacing.md,
  },
  addressIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: theme.colors.primaryXLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addressInfo: { flex: 1 },
  labelRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  labelBadgeText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: theme.colors.primary,
    marginRight: 8,
  },
  defaultBadge: {
    backgroundColor: theme.colors.primary + '15',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  defaultText: { fontSize: 10, color: theme.colors.primary, fontWeight: '600' },
  addressText: { fontSize: 13, color: theme.colors.textMuted },
  deleteButton: { padding: 8 },
  fab: {
    position: 'absolute',
    bottom: 28,
    right: 20,
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...theme.shadows.strong,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 80,
  },
  emptyIconCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: theme.colors.primaryXLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    marginBottom: 6,
    letterSpacing: -0.3,
  },
  emptyText: {
    fontSize: 14,
    color: theme.colors.textMuted,
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalPosition: { width: '100%' },
  modalContent: {
    backgroundColor: theme.colors.white,
    borderTopLeftRadius: theme.radius.xl,
    borderTopRightRadius: theme.radius.xl,
    padding: theme.spacing.lg,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.primary,
    marginBottom: 20,
    textAlign: 'center',
  },
  inputGroup: { marginBottom: 15 },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.textSecondary,
    marginBottom: 5,
  },
  input: {
    backgroundColor: theme.colors.background,
    borderRadius: theme.radius.md,
    padding: 12,
    color: theme.colors.primary,
    fontSize: 15,
  },
  defaultCheckbox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 25,
    marginTop: 5,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: theme.colors.primary,
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxActive: { backgroundColor: theme.colors.primary },
  checkboxLabel: { fontSize: 15, color: theme.colors.primary },
  modalButtons: { flexDirection: 'row', gap: 15 },
  modalButton: {
    flex: 1,
    height: 50,
    borderRadius: theme.radius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelBtn: { backgroundColor: theme.colors.background },
  cancelBtnText: { color: theme.colors.textSecondary, fontWeight: '600' },
  saveBtn: { backgroundColor: theme.colors.primary },
  saveBtnText: { color: theme.colors.white, fontWeight: 'bold' },
  mapPickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    padding: 8,
    backgroundColor: theme.colors.primary + '10',
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  mapPickerButtonText: {
    marginLeft: 6,
    color: theme.colors.primary,
    fontSize: 13,
    fontWeight: '600',
  },
});

export default AddressesScreen;
