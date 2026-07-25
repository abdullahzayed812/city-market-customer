import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Toast from 'react-native-toast-message';
import { UserService } from '../services/api/userService';
import { Home, Briefcase, Navigation } from 'lucide-react-native';

export const useAddresses = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [modalVisible, setModalVisible] = useState(false);
  const [newAddress, setNewAddress] = useState<{
    label: string,
    address: string,
    isDefault: boolean,
    latitude: number | undefined,
    longitude: number | undefined,
  }>({
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
        text1: t('addresses.address_added'),
        text2: t('addresses.address_saved'),
        position: 'top',
      });
    },
    onError: () => {
      Toast.show({
        type: 'error',
        text1: t('common.error'),
        text2: t('addresses.add_failed'),
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
        text1: t('addresses.address_deleted'),
        position: 'top',
      });
    },
  });

  const handleAddAddress = () => {
    if (!newAddress.label || !newAddress.address) {
      Toast.show({
        type: 'error',
        text1: t('common.error'),
        text2: t('addresses.required_fields'),
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

  return {
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
  };
};
