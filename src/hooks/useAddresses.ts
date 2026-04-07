import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Toast from 'react-native-toast-message';
import { UserService } from '../services/api/userService';
import { Home, Briefcase, Navigation } from 'lucide-react-native';

export const useAddresses = () => {
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
