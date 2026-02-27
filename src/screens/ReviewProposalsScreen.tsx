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
} from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { OrderService } from '../services/api/orderService';
import CustomModal from '../components/common/CustomModal';
import { theme } from '../theme';

import {
  OrderWithItems,
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
    const vendorOrders: any[] = order?.vendorOrders || [];

    return vendorOrders.flatMap((vo: any) =>
      (vo.proposals || []).map((proposal: any) => ({
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
        <View style={styles.emptyIconContainer}>
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

  const getTypeColor = (type: ProposalType) => {
    switch (type) {
      case ProposalType.QUANTITY_REDUCTION:
        return '#FF9500';
      case ProposalType.UNAVAILABLE:
        return theme.colors.error;
      default:
        return theme.colors.textMuted;
    }
  };

  const getStatusColor = (status: ProposalStatus) => {
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
  };

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
                <Store size={20} color={theme.colors.primary} />
                <Text style={styles.vendorName}>{proposal.vendorName}</Text>
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

                {proposal.proposedQuantity !== undefined && (
                  <InfoRow
                    icon={<Layers size={16} color={theme.colors.textMuted} />}
                    label={t('proposals.proposed_quantity')}
                    value={proposal?.proposedQuantity?.toString()}
                  />
                )}

                <InfoRow
                  icon={<Clock size={16} color={theme.colors.textMuted} />}
                  label={t('common.date') || 'Date'}
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
      </View>

      {/* CONFIRMATION MODAL */}
      <CustomModal
        visible={!!modalType}
        onClose={closeModal}
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
          modalType === 'accept'
            ? t('common.accept')
            : modalType === 'reject-shop'
            ? t('proposals.cancel_shop_label')
            : t('proposals.cancel_entire_order_label')
        }
        onConfirm={handleConfirm}
      >
        {modalType === 'reject-shop' && (
          <TouchableOpacity
            style={styles.cancelAllButton}
            onPress={() => setModalType('reject-all')}
          >
            <Text style={styles.cancelAllText}>
              {t('proposals.cancel_entire_order_instead')}
            </Text>
          </TouchableOpacity>
        )}
      </CustomModal>
    </SafeAreaView>
  );
};

const InfoRow = ({
  icon,
  label,
  value,
  valueStyle,
  badge,
  badgeColor,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
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
      <View style={[styles.badge, { backgroundColor: badgeColor + '20' }]}>
        <Text style={[styles.badgeText, { color: badgeColor }]}>{value}</Text>
      </View>
    ) : (
      <Text style={[styles.value, valueStyle]}>{value}</Text>
    )}
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
    backgroundColor: theme.colors.background,
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
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: theme.colors.secondary + '30',
  },

  infoText: {
    flex: 1,
    marginLeft: 12,
    color: theme.colors.primary,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '500',
  },

  proposalCard: {
    backgroundColor: theme.colors.white,
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    ...theme.shadows.medium,
  },

  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },

  vendorName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.primary,
    marginLeft: 10,
  },

  divider: {
    height: 1,
    backgroundColor: theme.colors.border,
    marginBottom: 16,
  },

  cardBody: {
    marginBottom: 8,
  },

  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },

  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  label: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.textMuted,
    marginLeft: 10,
  },

  value: {
    fontSize: 14,
    color: theme.colors.primary,
    fontWeight: '600',
  },

  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },

  badgeText: {
    fontSize: 12,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },

  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },

  actionButton: {
    flex: 0.48,
    flexDirection: 'row',
    height: 50,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    ...theme.shadows.soft,
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
    fontSize: 15,
  },

  cancelAllButton: {
    marginTop: 12,
    padding: 14,
    backgroundColor: theme.colors.error + '15',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.colors.error + '30',
  },

  cancelAllText: {
    color: theme.colors.error,
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 14,
  },

  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: theme.colors.success + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },

  noProposalsText: {
    fontSize: 18,
    color: theme.colors.textMuted,
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'center',
  },

  backButtonLarge: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 40,
    paddingVertical: 14,
    borderRadius: 16,
    ...theme.shadows.medium,
  },

  backButtonLargeText: {
    color: theme.colors.white,
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default ReviewProposalsScreen;
