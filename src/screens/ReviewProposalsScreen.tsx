import React, { useMemo, useState, useCallback } from 'react';
import { View, StyleSheet, ScrollView, Pressable, RefreshControl } from 'react-native';
import {
  AppText as Text,
  Button,
  Card,
  ScreenHeader,
  StatusBadge,
  EmptyState,
  LoadingState,
  ForwardIcon,
  apiErrorMessage,
  palette,
  radii,
  space,
  type Tone,
} from '@city-market/mobile-ui';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Store, Check, X, Info, PackageX, Scale, Layers, CircleCheck, CircleX, Clock } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Toast from 'react-native-toast-message';

import { OrderService } from '../services/api/orderService';
import CustomModal from '../components/common/CustomModal';
import QueryError from '../components/common/QueryError';
import { useFormat } from '../hooks/useFormat';
import { theme } from '../theme';

import {
  OrderItemProposal,
  OrderWithItems,
  ProposalType,
  ProposalStatus,
  VendorOrderItem,
} from '@city-market/shared';

type ProposalWithVendor = OrderItemProposal & {
  vendorName: string;
};

type ModalType = 'accept' | 'reject-shop' | 'reject-all' | null;

const TYPE_META: Record<string, { tone: Tone; icon: any }> = {
  [ProposalType.QUANTITY_REDUCTION]: { tone: 'warning', icon: Layers },
  [ProposalType.WEIGHT_ADJUSTMENT]: { tone: 'warning', icon: Scale },
  [ProposalType.UNAVAILABLE]: { tone: 'error', icon: PackageX },
};

const STATUS_META: Record<string, { tone: Tone; icon: any }> = {
  [ProposalStatus.PENDING]: { tone: 'info', icon: Clock },
  [ProposalStatus.ACCEPTED]: { tone: 'success', icon: CircleCheck },
  [ProposalStatus.REJECTED]: { tone: 'neutral', icon: CircleX },
};

// "Requested -> proposed" follows the reading direction, as ForwardIcon does.
const ArrowIcon = ForwardIcon;

const ReviewProposalsScreen = ({ route, navigation }: any) => {
  const { orderId } = route.params;
  const { t } = useTranslation();
  const { money, weight } = useFormat();
  const queryClient = useQueryClient();

  const [selectedProposal, setSelectedProposal] = useState<ProposalWithVendor | null>(null);
  const [modalType, setModalType] = useState<ModalType>(null);

  const {
    data: fetchedProposals,
    isLoading,
    error,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: ['order-proposals', orderId],
    queryFn: () => OrderService.getOrderProposals(orderId),
  });

  // Same cache entry as the order details screen; used for the originally
  // requested quantity and unit price of each item.
  const { data: order } = useQuery<OrderWithItems | undefined>({
    queryKey: ['order', orderId],
    queryFn: () => OrderService.getOrderById(orderId),
  });

  const itemsById = useMemo(() => {
    const map = new Map<string, VendorOrderItem>();
    order?.vendorOrders?.forEach(vo => vo.items?.forEach(i => map.set(i.id, i)));
    return map;
  }, [order]);

  const closeModal = useCallback(() => {
    setModalType(null);
    setSelectedProposal(null);
  }, []);

  const onMutationError = useCallback(
    (err: unknown) => {
      Toast.show({
        type: 'error',
        text1: t('common.action_failed'),
        text2: apiErrorMessage(err) ?? t('common.error_message'),
        position: 'top',
      });
    },
    [t],
  );

  const acceptMutation = useMutation({
    mutationFn: (proposalId: string) => OrderService.acceptProposal(proposalId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['order', orderId] });
      queryClient.invalidateQueries({ queryKey: ['order-proposals', orderId] });
      closeModal();
    },
    onError: onMutationError,
  });

  const rejectMutation = useMutation({
    mutationFn: ({ proposalId, cancelEntireOrder }: { proposalId: string; cancelEntireOrder: boolean }) =>
      OrderService.rejectProposal(proposalId, cancelEntireOrder),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['order', orderId] });
      queryClient.invalidateQueries({ queryKey: ['order-proposals', orderId] });
      closeModal();
    },
    onError: onMutationError,
  });

  const isActionLoading = acceptMutation.isPending || rejectMutation.isPending;

  // Pending decisions first; otherwise keep the server order.
  const proposals: ProposalWithVendor[] = useMemo(() => {
    const list = (fetchedProposals ?? []) as ProposalWithVendor[];
    return [...list].sort(
      (a, b) => Number(b.status === ProposalStatus.PENDING) - Number(a.status === ProposalStatus.PENDING),
    );
  }, [fetchedProposals]);
  const pendingCount = proposals.filter(p => p.status === ProposalStatus.PENDING).length;

  const openModal = useCallback((proposal: ProposalWithVendor, type: ModalType) => {
    setSelectedProposal(proposal);
    setModalType(type);
  }, []);

  const handleConfirm = useCallback(() => {
    if (!selectedProposal || !modalType) return;
    if (modalType === 'accept') {
      acceptMutation.mutate(selectedProposal.id);
    }
    if (modalType === 'reject-shop') {
      rejectMutation.mutate({ proposalId: selectedProposal.id, cancelEntireOrder: false });
    }
    if (modalType === 'reject-all') {
      rejectMutation.mutate({ proposalId: selectedProposal.id, cancelEntireOrder: true });
    }
  }, [selectedProposal, modalType, acceptMutation, rejectMutation]);

  const describe = (p: ProposalWithVendor) => {
    const item = itemsById.get(p.vendorOrderItemId);
    if (p.type === ProposalType.WEIGHT_ADJUSTMENT) {
      const requested = p.requestedWeightGrams ?? (p.requestedWeight != null ? p.requestedWeight * 1000 : item?.requestedWeightGrams);
      const proposed = p.proposedWeightGrams ?? (p.proposedWeight != null ? p.proposedWeight * 1000 : undefined);
      return { requested: weight(requested), proposed: weight(proposed) };
    }
    const requestedQty = item?.quantity ?? p.actualQuantity;
    return {
      requested: requestedQty != null ? `× ${requestedQty}` : '—',
      proposed: p.type === ProposalType.UNAVAILABLE ? '× 0' : p.proposedQuantity != null ? `× ${p.proposedQuantity}` : '—',
    };
  };

  const header = (
    <ScreenHeader
      title={t('proposals.title')}
      subtitle={pendingCount > 0 ? t('proposals.pending_count', { count: pendingCount }) : undefined}
      onBack={() => navigation.goBack()}
      backLabel={t('common.back')}
    />
  );

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {header}
        <LoadingState />
      </SafeAreaView>
    );
  }

  if (error && !fetchedProposals) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {header}
        <QueryError error={error} onRetry={refetch} retrying={isRefetching} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      {header}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, proposals.length === 0 && styles.grow]}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={palette.primary} colors={[palette.primary]} />
        }
      >
        {proposals.length === 0 ? (
          <EmptyState
            icon={Check}
            title={t('proposals.no_proposals')}
            actionLabel={t('common.go_back')}
            onAction={() => navigation.goBack()}
          />
        ) : (
          <>
            {pendingCount > 0 ? (
              <View style={styles.infoBox}>
                <Info size={20} color={palette.info} />
                <Text variant="caption" color={palette.textSecondary} style={styles.flex}>
                  {t('proposals.info_text')}
                </Text>
              </View>
            ) : null}

            {proposals.map(proposal => {
              const typeMeta = TYPE_META[proposal.type] ?? { tone: 'neutral', icon: Info };
              const statusMeta = STATUS_META[proposal.status] ?? STATUS_META[ProposalStatus.PENDING];
              const isPending = proposal.status === ProposalStatus.PENDING;
              const values = describe(proposal);
              const item = itemsById.get(proposal.vendorOrderItemId);
              const unitPrice = item?.unitPrice;

              return (
                <Card key={proposal.id} style={[styles.card, isPending && styles.cardPending]}>
                  <View style={styles.cardTop}>
                    <View style={styles.flex}>
                      <View style={styles.vendorRow}>
                        <Store size={14} color={palette.textMuted} />
                        <Text variant="caption" color={palette.textMuted} numberOfLines={1}>
                          {proposal.vendorName}
                        </Text>
                      </View>
                      <Text variant="subheading" color={palette.text}>
                        {proposal.productName}
                      </Text>
                      {unitPrice != null ? (
                        <Text variant="caption" color={palette.textMuted}>
                          {money(unitPrice)}
                          {proposal.type === ProposalType.WEIGHT_ADJUSTMENT ? ` ${t('common.per_kg')}` : ''}
                        </Text>
                      ) : null}
                    </View>
                    <StatusBadge
                      label={t(`proposals.status_${proposal.status.toLowerCase()}`)}
                      tone={statusMeta.tone}
                      icon={statusMeta.icon}
                      size="sm"
                    />
                  </View>

                  <StatusBadge
                    label={t(`proposals.type_${proposal.type.toLowerCase()}`)}
                    tone={typeMeta.tone}
                    icon={typeMeta.icon}
                    style={styles.typeBadge}
                  />

                  {proposal.type === ProposalType.UNAVAILABLE ? (
                    <Text variant="body" color={palette.textSecondary} style={styles.unavailableText}>
                      {t('proposals.unavailable_desc')}
                    </Text>
                  ) : (
                    <View style={styles.compare}>
                      <View style={styles.compareCell}>
                        <Text variant="caption" color={palette.textMuted}>{t('proposals.requested')}</Text>
                        <Text variant="heading" color={palette.textMuted} style={styles.strike}>
                          {values.requested}
                        </Text>
                      </View>
                      <ArrowIcon size={22} color={palette.textMuted} />
                      <View style={[styles.compareCell, styles.compareProposed]}>
                        <Text variant="caption" color={palette.primary}>{t('proposals.proposed')}</Text>
                        <Text variant="heading" color={palette.text}>{values.proposed}</Text>
                      </View>
                    </View>
                  )}

                  {isPending ? (
                    <View style={styles.actions}>
                      <Button
                        label={t('common.reject')}
                        icon={X}
                        variant="dangerOutline"
                        style={styles.flex}
                        disabled={isActionLoading}
                        onPress={() => openModal(proposal, 'reject-shop')}
                      />
                      <Button
                        label={t('common.accept')}
                        icon={Check}
                        style={styles.flex}
                        disabled={isActionLoading}
                        onPress={() => openModal(proposal, 'accept')}
                      />
                    </View>
                  ) : null}
                </Card>
              );
            })}
          </>
        )}
      </ScrollView>

      <CustomModal
        visible={modalType !== null}
        onClose={closeModal}
        onConfirm={handleConfirm}
        title={modalType === 'accept' ? t('proposals.confirm_accept_title') : t('proposals.reject_proposal_title')}
        message={modalType === 'accept' ? t('proposals.confirm_accept_message') : t('proposals.reject_proposal_message')}
        confirmLabel={modalType === 'accept' ? t('common.accept') : t('common.reject')}
        confirmColor={modalType === 'accept' ? theme.colors.success : theme.colors.error}
        loading={isActionLoading}
      >
        {modalType === 'reject-shop' && (
          <Pressable style={styles.alternativeAction} onPress={() => setModalType('reject-all')} accessibilityRole="button">
            <Text variant="label" color={palette.error} style={styles.center}>
              {t('proposals.cancel_entire_order_instead')}
            </Text>
          </Pressable>
        )}
      </CustomModal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: palette.background,
  },
  scrollContent: {
    padding: space.lg,
    gap: space.md,
    paddingBottom: space.huge,
  },
  grow: {
    flexGrow: 1,
  },
  flex: {
    flex: 1,
  },
  center: {
    textAlign: 'center',
  },
  infoBox: {
    flexDirection: 'row',
    gap: space.md,
    padding: space.lg,
    borderRadius: radii.lg,
    backgroundColor: palette.infoSoft,
  },
  card: {
    gap: space.md,
  },
  cardPending: {
    borderColor: palette.warning,
    borderWidth: 1,
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: space.md,
  },
  vendorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.xs,
  },
  typeBadge: {
    marginTop: -space.xs,
  },
  compare: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
  },
  compareCell: {
    flex: 1,
    padding: space.md,
    borderRadius: radii.md,
    backgroundColor: palette.surfaceMuted,
  },
  compareProposed: {
    backgroundColor: palette.primarySoft,
  },
  strike: {
    textDecorationLine: 'line-through',
  },
  unavailableText: {
    padding: space.md,
    borderRadius: radii.md,
    backgroundColor: palette.errorSoft,
  },
  actions: {
    flexDirection: 'row',
    gap: space.md,
  },
  alternativeAction: {
    paddingVertical: space.md,
    marginTop: space.sm,
  },
});

export default ReviewProposalsScreen;
