import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Modal,
  TouchableWithoutFeedback,
  Dimensions,
} from 'react-native';
import { AppText as Text } from '@city-market/mobile-ui';
import { Star, Send, X } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { useMutation } from '@tanstack/react-query';
import Toast from 'react-native-toast-message';
import { theme } from '../theme';

const { width } = Dimensions.get('window');

interface RatingModalProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  // Who is being rated, shown under the title
  subjectName: string;
  submit: (stars: number, comment?: string) => Promise<unknown>;
  // Called after a successful submit (e.g. invalidate queries)
  onRated?: () => void;
}

// Stars + optional comment. Used for vendors and for couriers/offices.
export const RatingModal: React.FC<RatingModalProps> = ({
  visible,
  onClose,
  title,
  subjectName,
  submit,
  onRated,
}) => {
  const { t } = useTranslation();
  const [stars, setStars] = useState(0);
  const [comment, setComment] = useState('');

  const mutation = useMutation({
    mutationFn: (data: { stars: number; comment?: string }) => submit(data.stars, data.comment),
    onSuccess: () => {
      onRated?.();
      Toast.show({
        type: 'success',
        text1: t('rating.thank_you_title'),
        text2: t('rating.thank_you', { vendorName: subjectName }),
        position: 'top',
      });

      handleClose();
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.message || 'submit_failed';

      Toast.show({
        type: 'error',
        text1: t('common.error'),
        text2: errorMessage,
        position: 'top',
      });
    },
  });

  const handleSubmit = () => {
    if (stars === 0) {
      Toast.show({
        type: 'error',
        text1: t('common.error'),
        text2: t('rating.select_stars'),
        position: 'top',
      });
      return;
    }

    mutation.mutate({ stars, comment });
  };

  const handleClose = () => {
    setStars(0);
    setComment('');
    onClose();
  };

  return (
    <Modal
      transparent
      visible={visible}
      animationType="slide"
      onRequestClose={handleClose}
    >
      <TouchableWithoutFeedback onPress={handleClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={styles.modalContainer}>
              <View style={styles.header}>
                <Text style={styles.headerTitle}>{title}</Text>
                <TouchableOpacity
                  onPress={handleClose}
                  style={styles.closeButton}
                >
                  <X size={24} color={theme.colors.textMuted} />
                </TouchableOpacity>
              </View>

              <View style={styles.content}>
                <Text style={styles.vendorNameText}>{subjectName}</Text>

                <View style={styles.starsContainer}>
                  {[1, 2, 3, 4, 5].map(num => (
                    <TouchableOpacity
                      key={num}
                      onPress={() => setStars(num)}
                      style={styles.starButton}
                    >
                      <Star
                        size={40}
                        color={
                          num <= stars
                            ? theme.colors.accent
                            : theme.colors.textMuted
                        }
                        fill={
                          num <= stars ? theme.colors.accent : 'transparent'
                        }
                      />
                    </TouchableOpacity>
                  ))}
                </View>

                <TextInput
                  style={styles.input}
                  placeholder={t('rating.comment_placeholder')}
                  placeholderTextColor={theme.colors.textMuted}
                  value={comment}
                  onChangeText={setComment}
                  multiline
                  numberOfLines={4}
                  maxLength={200}
                />

                <TouchableOpacity
                  style={[
                    styles.submitButton,
                    (mutation.isPending || stars === 0) &&
                      styles.submitButtonDisabled,
                  ]}
                  onPress={handleSubmit}
                  disabled={mutation.isPending || stars === 0}
                >
                  {mutation.isPending ? (
                    <ActivityIndicator
                      size="small"
                      color={theme.colors.white}
                    />
                  ) : (
                    <>
                      <Text style={styles.submitButtonText}>
                        {t('common.save')}
                      </Text>
                      <Send
                        size={18}
                        color={theme.colors.white}
                        style={{ marginLeft: 8 }}
                      />
                    </>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </TouchableWithoutFeedback>
          {/* Internal Toast to show over native modal */}
          <View style={styles.toastWrapper}>
            <Toast />
          </View>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: width * 0.9,
    backgroundColor: theme.colors.white,
    borderRadius: 24,
    padding: theme.spacing.lg,
    ...theme.shadows.medium,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  headerTitle: {
    fontSize: theme.typography.sizes.lg,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.primary,
  },
  closeButton: {
    padding: 4,
  },
  content: {
    alignItems: 'center',
  },
  vendorNameText: {
    fontSize: theme.typography.sizes.md,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.lg,
  },
  starsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: theme.spacing.xl,
    gap: 12,
  },
  starButton: {
    padding: 4,
  },
  input: {
    width: '100%',
    backgroundColor: theme.colors.background,
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
    color: theme.colors.textPrimary,
    minHeight: 100,
    textAlignVertical: 'top',
    fontSize: theme.typography.sizes.sm,
    marginBottom: theme.spacing.xl,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  submitButton: {
    backgroundColor: theme.colors.primary,
    flexDirection: 'row',
    height: 54,
    borderRadius: 27,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
    width: '100%',
    ...theme.shadows.medium,
  },
  submitButtonText: {
    color: theme.colors.white,
    fontSize: theme.typography.sizes.md,
    fontWeight: theme.typography.weights.bold,
  },
  submitButtonDisabled: {
    backgroundColor: theme.colors.textMuted,
    opacity: 0.6,
  },
  toastWrapper: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 9999,
  },
});
