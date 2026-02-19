import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, AlertCircle, Check, X } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { OrderService } from '../services/api/orderService';
import CustomModal from '../components/common/CustomModal';
import { theme } from '../theme';

import {
  OrderWithItems,
  OrderItemProposal,
  VendorOrder,
} from '@city-market/shared';

type ProposalWithVendor = OrderItemProposal & {
  vendorName: string;
};

type ModalType = 'accept' | 'reject-shop' | 'reject-all' | null;

const ReviewProposalsScreen = ({ route, navigation }: any) => {
  const { orderId } = route.params;
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const [selectedProposal, setSelectedProposal] =
    useState<ProposalWithVendor | null>(null);
  const [modalType, setModalType] = useState<ModalType>(null);

  const { data: order, isLoading } = useQuery<OrderWithItems | undefined>({
    queryKey: ['order', orderId],
    queryFn: () => OrderService.getOrderById(orderId),
  });

  const acceptMutation = useMutation({
    mutationFn: (proposalId: string) => OrderService.acceptProposal(proposalId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['order', orderId] });
      closeModal();
    },
  });

  const rejectMutation = useMutation({
    mutationFn: ({
      proposalId,
      cancelEntireOrder,
    }: {
      proposalId: string;
      cancelEntireOrder: boolean;
    }) => OrderService.rejectProposal(proposalId, cancelEntireOrder),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['order', orderId] });
      closeModal();
    },
  });

  const isActionLoading = acceptMutation.isPending || rejectMutation.isPending;

  const proposals: ProposalWithVendor[] = useMemo(() => {
    const vendorOrders = order?.vendorOrders || [];

    return vendorOrders.flatMap(
      (
        vo: VendorOrder & {
          vendorName: string;
          proposals: OrderItemProposal[];
        },
      ) =>
        vo.proposals.map(proposal => ({
          ...proposal,
          vendorName: vo.vendorName,
        })),
    );
  }, [order]);

  const openModal = (proposal: ProposalWithVendor, type: ModalType) => {
    setSelectedProposal(proposal);
    setModalType(type);
  };

  const closeModal = () => {
    setModalType(null);
    setSelectedProposal(null);
  };

  const handleConfirm = () => {
    if (!selectedProposal || !modalType) return;

    if (modalType === 'accept') {
      acceptMutation.mutate(selectedProposal.id);
    }

    if (modalType === 'reject-shop') {
      rejectMutation.mutate({
        proposalId: selectedProposal.id,
        cancelEntireOrder: false,
      });
    }

    if (modalType === 'reject-all') {
      rejectMutation.mutate({
        proposalId: selectedProposal.id,
        cancelEntireOrder: true,
      });
    }
  };

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  if (proposals.length === 0) {
    return (
      <View style={styles.centered}>
        <Text style={styles.noProposalsText}>
          {t('proposals.no_proposals') || 'No pending proposals'}
        </Text>

        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButtonLarge}
        >
          <Text style={styles.backButtonLargeText}>{t('common.go_back')}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* HEADER */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <ChevronLeft size={24} color={theme.colors.primary} />
          </TouchableOpacity>

          <Text style={styles.title}>
            {t('proposals.title') || 'Review Proposals'}
          </Text>

          <View style={{ width: 40 }} />
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* INFO BOX */}
          <View style={styles.infoBox}>
            <AlertCircle size={20} color={theme.colors.secondary} />
            <Text style={styles.infoText}>
              {t('proposals.info_text') ||
                'Some items are unavailable. Please review and decide how to proceed.'}
            </Text>
          </View>

          {/* PROPOSALS */}
          {proposals.map(proposal => (
            <View key={proposal.id} style={styles.proposalCard}>
              <Text style={styles.vendorName}>{proposal.vendorName}</Text>

              {/* <InfoRow label="Proposal ID" value={proposal.id.slice(-7)} /> */}
              <InfoRow label="Type" value={proposal.type} />
              <InfoRow label="Status" value={proposal.status} />

              {proposal.proposedQuantity && (
                <InfoRow
                  label="Proposed Quantity"
                  value={proposal.proposedQuantity.toString()}
                />
              )}

              {/* <InfoRow
                label="Vendor Order Item ID"
                value={proposal.vendorOrderItemId}
              /> */}

              <InfoRow
                label="Created At"
                value={new Date(proposal.createdAt).toLocaleString()}
              />

              {/* <InfoRow
                label="Updated At"
                value={new Date(proposal.updatedAt).toLocaleString()}
              /> */}

              <View style={styles.buttonsContainer}>
                <TouchableOpacity
                  style={[styles.actionButton, styles.acceptButton]}
                  onPress={() => openModal(proposal, 'accept')}
                  disabled={isActionLoading}
                >
                  <Check size={20} color={theme.colors.white} />
                  <Text style={styles.buttonText}>{t('common.accept')}</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.actionButton, styles.rejectButton]}
                  onPress={() => openModal(proposal, 'reject-shop')}
                  disabled={isActionLoading}
                >
                  <X size={20} color={theme.colors.white} />
                  <Text style={styles.buttonText}>{t('common.reject')}</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </ScrollView>
      </View>

      {/* CONFIRMATION MODAL */}
      <CustomModal
        visible={!!modalType}
        onClose={closeModal}
        title={modalType === 'accept' ? 'Confirm Accept' : 'Reject Proposal'}
        message={
          modalType === 'accept'
            ? 'Are you sure you want to accept this proposal?'
            : 'Rejecting will cancel this shop order. Continue?'
        }
        confirmLabel={
          modalType === 'accept'
            ? 'Accept'
            : modalType === 'reject-shop'
            ? 'Cancel Shop'
            : 'Cancel Entire Order'
        }
        onConfirm={handleConfirm}
      >
        {modalType === 'reject-shop' && (
          <TouchableOpacity
            style={styles.cancelAllButton}
            onPress={() => setModalType('reject-all')}
          >
            <Text style={styles.cancelAllText}>
              Cancel Entire Order Instead
            </Text>
          </TouchableOpacity>
        )}
      </CustomModal>
    </SafeAreaView>
  );
};

const InfoRow = ({ label, value }: { label: string; value: string }) => (
  <View style={styles.infoRow}>
    <Text style={styles.label}>{label}</Text>
    <Text style={styles.value}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: theme.colors.white },
  container: { flex: 1, backgroundColor: theme.colors.background },

  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },

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

  scrollContent: { padding: theme.spacing.lg },

  infoBox: {
    flexDirection: 'row',
    backgroundColor: theme.colors.secondary + '15',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 20,
  },

  infoText: {
    flex: 1,
    marginLeft: 10,
    color: theme.colors.primary,
    fontSize: 13,
  },

  proposalCard: {
    backgroundColor: theme.colors.white,
    borderRadius: 16,
    padding: 20,
    marginBottom: 15,
    ...theme.shadows.soft,
  },

  vendorName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.primary,
    marginBottom: 10,
  },

  infoRow: { marginBottom: 8 },

  label: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.textMuted,
  },

  value: {
    fontSize: 14,
    color: theme.colors.primary,
  },

  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 15,
  },

  actionButton: {
    flex: 0.48,
    flexDirection: 'row',
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },

  acceptButton: {
    backgroundColor: theme.colors.success,
  },

  rejectButton: {
    backgroundColor: theme.colors.error,
  },

  buttonText: {
    color: theme.colors.white,
    fontWeight: 'bold',
    marginLeft: 8,
  },

  cancelAllButton: {
    marginTop: 10,
    padding: 10,
    backgroundColor: theme.colors.error,
    borderRadius: 8,
  },

  cancelAllText: {
    color: theme.colors.white,
    textAlign: 'center',
    fontWeight: '600',
  },

  noProposalsText: {
    fontSize: 16,
    color: theme.colors.textMuted,
    marginBottom: 20,
  },

  backButtonLarge: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 12,
  },

  backButtonLargeText: {
    color: theme.colors.white,
    fontWeight: 'bold',
  },
});

export default ReviewProposalsScreen;
