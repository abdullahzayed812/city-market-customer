import React, { useMemo, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ChevronLeft,
  AlertCircle,
  Check,
  X,
  Store,
  Tag,
  Info,
  Layers,
  Clock,
  Scale,
} from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { OrderService } from '../services/api/orderService';
import CustomModal from '../components/common/CustomModal';
import { theme } from '../theme';

import {
  OrderItemProposal,
  ProposalType,
  ProposalStatus,
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

  const { data: fetchedProposals, isLoading: isLoadingProposals } = useQuery({
    queryKey: ['order-proposals', orderId],
    queryFn: () => OrderService.getOrderProposals(orderId),
  });

  const isLoading = isLoadingProposals;

  const closeModal = useCallback(() => {
    setModalType(null);
    setSelectedProposal(null);
  }, []);

  const acceptMutation = useMutation({
    mutationFn: (proposalId: string) => OrderService.acceptProposal(proposalId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['order', orderId] });
      queryClient.invalidateQueries({ queryKey: ['order-proposals', orderId] });
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
      queryClient.invalidateQueries({ queryKey: ['order-proposals', orderId] });
      closeModal();
    },
  });

  const isActionLoading = acceptMutation.isPending || rejectMutation.isPending;

  const proposals: ProposalWithVendor[] = useMemo(() => {
    if (!fetchedProposals) return [];
    return fetchedProposals as ProposalWithVendor[];
  }, [fetchedProposals]);

  const openModal = useCallback(
    (proposal: ProposalWithVendor, type: ModalType) => {
      setSelectedProposal(proposal);
      setModalType(type);
    },
    [],
  );

  const handleConfirm = useCallback(() => {
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
  }, [selectedProposal, modalType, acceptMutation, rejectMutation]);

  const getTypeColor = useCallback((type: ProposalType) => {
    switch (type) {
      case ProposalType.QUANTITY_REDUCTION:
        return '#FF9500';
      case ProposalType.WEIGHT_ADJUSTMENT:
        return '#FF9500';
      case ProposalType.UNAVAILABLE:
        return theme.colors.error;
      default:
        return theme.colors.textMuted;
    }
  }, []);

  const getStatusColor = useCallback((status: ProposalStatus) => {
    switch (status) {
      case ProposalStatus.PENDING:
        return theme.colors.secondary;
      case ProposalStatus.ACCEPTED:
        return theme.colors.success;
      case ProposalStatus.REJECTED:
        return theme.colors.error;
      default:
        return theme.colors.textMuted;
    }
  }, []);

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
        <View style={styles.emptyIconContainer as any}>
          <Check size={64} color={theme.colors.success} />
        </View>
        <Text style={styles.noProposalsText}>
          {t('proposals.no_proposals')}
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

          <Text style={styles.title}>{t('proposals.title')}</Text>

          <View style={{ width: 40 }} />
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* INFO BOX */}
          <View style={styles.infoBox}>
            <AlertCircle size={24} color={theme.colors.secondary} />
            <Text style={styles.infoText}>{t('proposals.info_text')}</Text>
          </View>

          {/* PROPOSALS */}
          {proposals.map(proposal => (
            <View key={proposal.id} style={styles.proposalCard}>
              <View style={styles.cardHeader}>
                <View>
                  <View style={styles.vendorRow}>
                    <Store size={16} color={theme.colors.primary} />
                    <Text style={styles.vendorName}>{proposal.vendorName}</Text>
                  </View>
                  <Text style={styles.productName}>{proposal.productName}</Text>
                </View>
              </View>

              <View style={styles.divider} />

              <View style={styles.cardBody}>
                <InfoRow
                  icon={<Tag size={16} color={theme.colors.textMuted} />}
                  label={t('proposals.type')}
                  value={t(`proposals.type_${proposal.type.toLowerCase()}`)}
                  valueStyle={{
                    color: getTypeColor(proposal.type as ProposalType),
                    fontWeight: 'bold',
                  }}
                />

                <InfoRow
                  icon={<Info size={16} color={theme.colors.textMuted} />}
                  label={t('proposals.status')}
                  value={t(`proposals.status_${proposal.status.toLowerCase()}`)}
                  badge
                  badgeColor={getStatusColor(proposal.status as ProposalStatus)}
                />

                {proposal.actualQuantity && (
                  <InfoRow
                    icon={<Layers size={16} color={theme.colors.textMuted} />}
                    label={t('proposals.actual_quantity')}
                    value={proposal?.actualQuantity?.toString()}
                  />
                )}

                {proposal.proposedQuantity && (
                  <InfoRow
                    icon={<Layers size={16} color={theme.colors.textMuted} />}
                    label={t('proposals.proposed_quantity')}
                    value={proposal?.proposedQuantity?.toString()}
                  />
                )}

                {(proposal.requestedWeight ||
                  proposal.requestedWeightGrams) && (
                  <InfoRow
                    icon={<Scale size={16} color={theme.colors.textMuted} />}
                    label={t('proposals.requested_weight')}
                    value={`≈ ${(
                      proposal.requestedWeight ||
                      proposal.requestedWeightGrams! / 1000
                    ).toFixed(2)} ${t('common.kg')}`}
                  />
                )}

                {(proposal.proposedWeight || proposal.proposedWeightGrams) && (
                  <InfoRow
                    icon={<Scale size={16} color={theme.colors.textMuted} />}
                    label={t('proposals.proposed_weight')}
                    value={`${(
                      (proposal.proposedWeight as number) ||
                      proposal.proposedWeightGrams! / 1000
                    ).toFixed(2)} ${t('common.kg')}`}
                    valueStyle={{
                      color: theme.colors.primary,
                      fontWeight: 'bold',
                    }}
                  />
                )}

                <InfoRow
                  icon={<Clock size={16} color={theme.colors.textMuted} />}
                  label={t('common.date')}
                  value={new Date(proposal.createdAt).toLocaleString([], {
                    dateStyle: 'medium',
                    timeStyle: 'short',
                  })}
                />
              </View>

              {proposal.status === ProposalStatus.PENDING && (
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
              )}
            </View>
          ))}
        </ScrollView>

        <CustomModal
          visible={modalType !== null}
          onClose={closeModal}
          onConfirm={handleConfirm}
          title={
            modalType === 'accept'
              ? t('proposals.confirm_accept_title')
              : t('proposals.reject_proposal_title')
          }
          message={
            modalType === 'accept'
              ? t('proposals.confirm_accept_message')
              : t('proposals.reject_proposal_message')
          }
          confirmLabel={
            modalType === 'accept' ? t('common.accept') : t('common.reject')
          }
          confirmColor={
            modalType === 'accept' ? theme.colors.success : theme.colors.error
          }
          loading={isActionLoading}
        >
          {modalType === 'reject-shop' && (
            <TouchableOpacity
              style={styles.alternativeAction}
              onPress={() => setModalType('reject-all')}
            >
              <Text style={styles.alternativeActionText}>
                {t('proposals.cancel_entire_order_instead')}
              </Text>
            </TouchableOpacity>
          )}
        </CustomModal>
      </View>
    </SafeAreaView>
  );
};

const InfoRow = React.memo(
  ({
    icon,
    label,
    value,
    valueStyle,
    badge,
    badgeColor,
  }: {
    icon: React.ReactNode;
    label: string;
    value?: string;
    valueStyle?: any;
    badge?: boolean;
    badgeColor?: string;
  }) => (
    <View style={styles.infoRow}>
      <View style={styles.labelContainer}>
        {icon}
        <Text style={styles.label}>{label}</Text>
      </View>
      {badge ? (
        <View style={[styles.badge, { backgroundColor: badgeColor }]}>
          <Text style={styles.badgeText}>{value}</Text>
        </View>
      ) : (
        <Text style={[styles.value, valueStyle]}>{value}</Text>
      )}
    </View>
  ),
);

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  container: {
    flex: 1,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    backgroundColor: theme.colors.white,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.textPrimary,
  },
  scrollContent: {
    padding: 20,
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: '#FFF9E6',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#FFEBB3',
  },
  infoText: {
    flex: 1,
    marginLeft: 10,
    fontSize: 14,
    color: '#856404',
    lineHeight: 20,
  },
  proposalCard: {
    backgroundColor: theme.colors.white,
    borderRadius: 15,
    marginBottom: 20,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  vendorName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: theme.colors.primary,
    marginLeft: 6,
  },
  vendorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  productName: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.textPrimary,
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.border,
    marginBottom: 12,
  },
  cardBody: {
    marginBottom: 15,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  label: {
    fontSize: 14,
    color: theme.colors.textMuted,
    marginLeft: 8,
  },
  value: {
    fontSize: 14,
    color: theme.colors.textPrimary,
    fontWeight: '500',
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  badgeText: {
    color: theme.colors.white,
    fontSize: 12,
    fontWeight: 'bold',
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 10,
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
    fontSize: 14,
  },
  alternativeAction: {
    marginTop: 15,
    padding: 10,
    alignItems: 'center',
  },
  alternativeActionText: {
    color: theme.colors.primary,
    fontSize: 14,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#E8F5E9',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  noProposalsText: {
    fontSize: 18,
    color: theme.colors.textMuted,
    marginBottom: 30,
  },
  backButtonLarge: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 40,
    paddingVertical: 15,
    borderRadius: 12,
  },
  backButtonLargeText: {
    color: theme.colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ReviewProposalsScreen;
