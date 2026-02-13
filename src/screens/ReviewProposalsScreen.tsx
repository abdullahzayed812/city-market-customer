import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ChevronLeft, AlertCircle, Check, X } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { OrderService } from '../services/api/orderService';
import { theme } from '../theme';

const ReviewProposalsScreen = ({ route, navigation }: any) => {
    const { orderId } = route.params;
    const { t } = useTranslation();
    const queryClient = useQueryClient();

    const { data: order, isLoading } = useQuery({
        queryKey: ['order', orderId],
        queryFn: () => OrderService.getOrderById(orderId),
    });

    const acceptMutation = useMutation({
        mutationFn: (proposalId: string) => OrderService.acceptProposal(proposalId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['order', orderId] });
            Alert.alert(t('common.success'), t('proposals.accept_success') || 'Proposal accepted successfully');
        },
    });

    const rejectMutation = useMutation({
        mutationFn: ({ proposalId, cancelEntireOrder }: any) =>
            OrderService.rejectProposal(proposalId, cancelEntireOrder),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['order', orderId] });
            Alert.alert(t('common.success'), t('proposals.reject_success') || 'Proposal rejected');
        },
    });

    if (isLoading) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
            </View>
        );
    }

    const vendorOrders = order?.vendorOrders || [];
    const allProposals = vendorOrders.flatMap((vo: any) =>
        vo.proposals.map((p: any) => ({ ...p, vendorName: vo.vendorName }))
    );

    if (allProposals.length === 0) {
        return (
            <View style={styles.centered}>
                <Text style={styles.noProposalsText}>{t('proposals.no_proposals') || 'No pending proposals'}</Text>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButtonLarge}>
                    <Text style={styles.backButtonLargeText}>{t('common.go_back')}</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.container}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <ChevronLeft size={24} color={theme.colors.primary} />
                    </TouchableOpacity>
                    <Text style={styles.title}>{t('proposals.title') || 'Review Proposals'}</Text>
                    <View style={{ width: 40 }} />
                </View>

                <ScrollView contentContainerStyle={styles.scrollContent}>
                    <View style={styles.infoBox}>
                        <AlertCircle size={20} color={theme.colors.secondary} />
                        <Text style={styles.infoText}>
                            {t('proposals.info_text') || 'Some items are unavailable. Please review and decide how to proceed.'}
                        </Text>
                    </View>

                    {allProposals.map((proposal: any) => (
                        <View key={proposal.id} style={styles.proposalCard}>
                            <Text style={styles.vendorName}>{proposal.vendorName}</Text>
                            <Text style={styles.proposalType}>
                                {proposal.type === 'UNAVAILABLE' ? 'Item Unavailable' : 'Quantity Reduced'}
                            </Text>

                            <View style={styles.buttonsContainer}>
                                <TouchableOpacity
                                    style={[styles.actionButton, styles.acceptButton]}
                                    onPress={() => acceptMutation.mutate(proposal.id)}
                                    disabled={acceptMutation.isPending}
                                >
                                    <Check size={20} color={theme.colors.white} />
                                    <Text style={styles.buttonText}>{t('common.accept')}</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={[styles.actionButton, styles.rejectButton]}
                                    onPress={() => {
                                        Alert.alert(
                                            t('proposals.reject_title') || 'Reject Proposal',
                                            t('proposals.reject_message') || 'Rejecting will cancel this shop\'s order. Cancel entire multi-shop order instead?',
                                            [
                                                { text: t('common.cancel'), style: 'cancel' },
                                                { text: t('proposals.cancel_shop') || 'Cancel Shop', onPress: () => rejectMutation.mutate({ proposalId: proposal.id, cancelEntireOrder: false }) },
                                                { text: t('proposals.cancel_all') || 'Cancel Entire Order', onPress: () => rejectMutation.mutate({ proposalId: proposal.id, cancelEntireOrder: true }), style: 'destructive' },
                                            ]
                                        );
                                    }}
                                    disabled={rejectMutation.isPending}
                                >
                                    <X size={20} color={theme.colors.white} />
                                    <Text style={styles.buttonText}>{t('common.reject')}</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    ))}
                </ScrollView>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: theme.colors.white },
    container: { flex: 1, backgroundColor: theme.colors.background },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
    header: {
        padding: theme.spacing.lg,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: theme.colors.white,
        ...theme.shadows.soft,
    },
    backButton: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
    title: { fontSize: theme.typography.sizes.xl, fontWeight: theme.typography.weights.bold, color: theme.colors.primary },
    scrollContent: { padding: theme.spacing.lg },
    infoBox: {
        flexDirection: 'row',
        backgroundColor: theme.colors.secondary + '15',
        padding: 15,
        borderRadius: 12,
        alignItems: 'center',
        marginBottom: 20,
    },
    infoText: { flex: 1, marginLeft: 10, color: theme.colors.primary, fontSize: 13 },
    proposalCard: {
        backgroundColor: theme.colors.white,
        borderRadius: 16,
        padding: 20,
        marginBottom: 15,
        ...theme.shadows.soft,
    },
    vendorName: { fontSize: 16, fontWeight: 'bold', color: theme.colors.primary, marginBottom: 4 },
    proposalType: { fontSize: 14, color: theme.colors.error, fontWeight: '600', marginBottom: 15 },
    buttonsContainer: { flexDirection: 'row', justifyContent: 'space-between' },
    actionButton: {
        flex: 0.48,
        flexDirection: 'row',
        height: 48,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    acceptButton: { backgroundColor: theme.colors.success },
    rejectButton: { backgroundColor: theme.colors.error },
    buttonText: { color: theme.colors.white, fontWeight: 'bold', marginLeft: 8 },
    noProposalsText: { fontSize: 16, color: theme.colors.textMuted, marginBottom: 20 },
    backButtonLarge: { backgroundColor: theme.colors.primary, paddingHorizontal: 30, paddingVertical: 12, borderRadius: 12 },
    backButtonLargeText: { color: theme.colors.white, fontWeight: 'bold' },
});

export default ReviewProposalsScreen;
