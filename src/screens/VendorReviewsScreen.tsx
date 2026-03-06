import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  StatusBar,
  TouchableOpacity,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { ChevronLeft, Star, MessageSquare, User } from 'lucide-react-native';
import { theme } from '../theme';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RatingService } from '../services/api/ratingService';

const VendorReviewsScreen = ({ route, navigation }: any) => {
  const { vendorId } = route.params;
  const { t } = useTranslation();

  const { data: summaryRes, isLoading: summaryLoading } = useQuery({
    queryKey: ['vendor-rating-summary', vendorId],
    queryFn: () => RatingService.getSummary(vendorId),
  });

  const { data: reviewsRes, isLoading: reviewsLoading } = useQuery({
    queryKey: ['vendor-reviews', vendorId],
    queryFn: () => RatingService.getReviews(vendorId),
  });

  const summary = summaryRes?.data || { averageRating: 0, totalRatings: 0 };
  const reviews = reviewsRes?.data || [];

  const renderReviewItem = ({ item }: any) => (
    <View style={styles.reviewCard}>
      <View style={styles.reviewHeader}>
        <View style={styles.starContainer}>
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              size={14}
              color={
                i < item.stars ? theme.colors.accent : theme.colors.textMuted
              }
              fill={i < item.stars ? theme.colors.accent : 'transparent'}
            />
          ))}
        </View>
        <Text style={styles.reviewDate}>
          {new Date(item.createdAt).toLocaleDateString()}
        </Text>
      </View>
      <Text style={styles.reviewComment}>
        {item.comment || t('store.no_comment')}
      </Text>
      <View style={styles.reviewerInfo}>
        <User size={12} color={theme.colors.textMuted} />
        <Text style={styles.reviewerText}>{item.customerName || "Customer"}</Text>
      </View>
    </View>
  );

  if (summaryLoading || reviewsLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <ChevronLeft size={24} color={theme.colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('store.reviews')}</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.summarySection}>
        <View style={styles.summaryCard}>
          <Text style={styles.averageRating}>
            {summary.averageRating.toFixed(1)}
          </Text>
          <View style={styles.starsRow}>
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                size={20}
                color={
                  i < Math.round(summary.averageRating)
                    ? theme.colors.accent
                    : theme.colors.textMuted
                }
                fill={
                  i < Math.round(summary.averageRating)
                    ? theme.colors.accent
                    : 'transparent'
                }
              />
            ))}
          </View>
          <Text style={styles.totalReviews}>
            {summary.totalRatings} {t('store.reviews')}
          </Text>
        </View>
      </View>

      <FlatList
        data={reviews}
        renderItem={renderReviewItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <MessageSquare size={48} color={theme.colors.textMuted} />
            <Text style={styles.emptyText}>{t('store.no_reviews')}</Text>
          </View>
        )}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: theme.colors.white,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: { fontSize: 18, fontWeight: '800', color: theme.colors.primary },
  summarySection: { padding: 20 },
  summaryCard: {
    backgroundColor: theme.colors.white,
    padding: 24,
    borderRadius: 24,
    alignItems: 'center',
    ...theme.shadows.medium,
  },
  averageRating: {
    fontSize: 48,
    fontWeight: '900',
    color: theme.colors.primary,
  },
  starsRow: { flexDirection: 'row', gap: 4, marginVertical: 8 },
  totalReviews: {
    fontSize: 14,
    color: theme.colors.textMuted,
    fontWeight: '600',
  },
  listContent: { padding: 20, paddingTop: 0 },
  reviewCard: {
    backgroundColor: theme.colors.white,
    padding: 16,
    borderRadius: 20,
    marginBottom: 16,
    ...theme.shadows.soft,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.03)',
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  starContainer: { flexDirection: 'row', gap: 2 },
  reviewDate: { fontSize: 12, color: theme.colors.textMuted },
  reviewComment: {
    fontSize: 15,
    color: theme.colors.primary,
    lineHeight: 22,
    fontWeight: '500',
  },
  reviewerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 12,
  },
  reviewerText: {
    fontSize: 12,
    color: theme.colors.textMuted,
    fontWeight: '600',
  },
  emptyContainer: { alignItems: 'center', marginTop: 100 },
  emptyText: {
    marginTop: 16,
    color: theme.colors.textMuted,
    fontSize: 16,
    fontWeight: '600',
  },
});

export default VendorReviewsScreen;
