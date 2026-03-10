import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Star, Send, MessageSquare } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { theme } from '../theme';
import { RatingService } from '../services/api/ratingService';
import { useNavigation } from '@react-navigation/native';

interface VendorRatingCardProps {
  orderId: string;
  vendorName: string;
  vendorId?: string;
  onSuccess?: () => void;
}

export const VendorRatingCard: React.FC<VendorRatingCardProps> = ({
  orderId,
  vendorName,
  vendorId,
  onSuccess,
}) => {
  const { t } = useTranslation();
  const navigation = useNavigation<any>();
  const [stars, setStars] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async () => {
    if (stars === 0) {
      Alert.alert(t('common.error'), t('rating.select_stars') || 'Please select at least one star');
      return;
    }

    setIsSubmitting(true);
    try {
      if (!vendorId) throw new Error("Missing vendorId");
      await RatingService.rateVendor(orderId, vendorId, stars, comment);
      setIsSubmitted(true);
      if (onSuccess) onSuccess();
    } catch (error: any) {
      console.error('Rating submission failed:', error);
      const errorMessage = error.response?.data?.message || 'Failed to submit rating';
      Alert.alert(t('common.error'), t(`errors.${errorMessage}`) || errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleViewReviews = () => {
    if (vendorId) {
      navigation.navigate('VendorReviews', { vendorId });
    }
  };

  if (isSubmitted) {
    return (
      <View style={styles.container}>
        <View style={styles.successContainer}>
          <View style={styles.successIcon}>
            <Star size={24} color={theme.colors.white} fill={theme.colors.white} />
          </View>
          <Text style={styles.successText}>
            {t('rating.thank_you') || 'Thank you for your review of'} {vendorName}!
          </Text>
          {vendorId && (
            <TouchableOpacity style={styles.viewReviewsLink} onPress={handleViewReviews}>
              <Text style={styles.viewReviewsLinkText}>{t('store.view_reviews')}</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.cardHeader}>
        <Text style={styles.title}>
          {t('rating.rate_vendor') || 'Rate your experience with'} {vendorName}
        </Text>
        {vendorId && (
          <TouchableOpacity onPress={handleViewReviews} style={styles.infoIcon}>
            <MessageSquare size={18} color={theme.colors.primary} />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.starsContainer}>
        {[1, 2, 3, 4, 5].map(num => (
          <TouchableOpacity
            key={num}
            onPress={() => setStars(num)}
            style={styles.starButton}
          >
            <Star
              size={32}
              color={num <= stars ? theme.colors.accent : theme.colors.textMuted}
              fill={num <= stars ? theme.colors.accent : 'transparent'}
            />
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.inputContainer}>
        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.input}
            placeholder={t('rating.comment_placeholder') || 'Write a review (optional)'}
            placeholderTextColor={theme.colors.textMuted}
            value={comment}
            onChangeText={setComment}
            multiline
            numberOfLines={3}
            maxLength={200}
          />
        </View>
        <TouchableOpacity
          style={[
            styles.submitButton,
            (isSubmitting || stars === 0) && styles.submitButtonDisabled,
          ]}
          onPress={handleSubmit}
          disabled={isSubmitting || stars === 0}
        >
          {isSubmitting ? (
            <ActivityIndicator size="small" color={theme.colors.white} />
          ) : (
            <Send size={20} color={theme.colors.white} />
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.white,
    padding: theme.spacing.lg,
    borderRadius: theme.radius.lg,
    marginVertical: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
    ...theme.shadows.soft,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
    position: 'relative',
  },
  title: {
    fontSize: theme.typography.sizes.md,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.primary,
    textAlign: 'center',
    paddingHorizontal: 30,
  },
  infoIcon: {
    position: 'absolute',
    right: 0,
    padding: 4,
  },
  starsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: theme.spacing.md,
    gap: 8,
  },
  starButton: {
    padding: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 12,
  },
  inputWrapper: {
    flex: 1,
    backgroundColor: theme.colors.background,
    borderRadius: theme.radius.md,
    minHeight: 80,
  },
  input: {
    flex: 1,
    padding: theme.spacing.md,
    color: theme.colors.textPrimary,
    textAlignVertical: 'top',
    fontSize: theme.typography.sizes.sm,
  },
  submitButton: {
    backgroundColor: theme.colors.primary,
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    ...theme.shadows.medium,
  },
  submitButtonDisabled: {
    backgroundColor: theme.colors.textMuted,
    opacity: 0.6,
  },
  successContainer: {
    alignItems: 'center',
    padding: theme.spacing.sm,
  },
  successIcon: {
    backgroundColor: theme.colors.success,
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  successText: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.success,
    fontWeight: theme.typography.weights.bold,
    textAlign: 'center',
  },
  viewReviewsLink: {
    marginTop: theme.spacing.sm,
  },
  viewReviewsLinkText: {
    color: theme.colors.primary,
    fontSize: theme.typography.sizes.sm,
    fontWeight: theme.typography.weights.semibold,
    textDecorationLine: 'underline',
  },
});
