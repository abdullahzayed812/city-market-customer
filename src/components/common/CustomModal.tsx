import React from 'react';
import {
    Modal,
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    TouchableWithoutFeedback,
    Dimensions,
} from 'react-native';
import { theme } from '../../theme';

const { width } = Dimensions.get('window');

interface CustomModalProps {
    visible: boolean;
    onClose: () => void;
    title?: string;
    message?: string;
    confirmLabel?: string;
    cancelLabel?: string;
    onConfirm?: () => void;
    children?: React.ReactNode;
}

const CustomModal: React.FC<CustomModalProps> = ({
    visible,
    onClose,
    title,
    message,
    confirmLabel = 'Confirm',
    cancelLabel = 'Cancel',
    onConfirm,
    children,
}) => {
    return (
        <Modal
            transparent
            visible={visible}
            animationType="fade"
            onRequestClose={onClose}
        >
            <TouchableWithoutFeedback onPress={onClose}>
                <View style={styles.overlay}>
                    <TouchableWithoutFeedback>
                        <View style={styles.modalContainer}>
                            {title && <Text style={styles.title}>{title}</Text>}
                            {message && <Text style={styles.message}>{message}</Text>}
                            {children}

                            <View style={styles.buttonContainer}>
                                <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
                                    <Text style={styles.cancelButtonText}>{cancelLabel}</Text>
                                </TouchableOpacity>
                                {onConfirm && (
                                    <TouchableOpacity style={styles.confirmButton} onPress={onConfirm}>
                                        <Text style={styles.confirmButtonText}>{confirmLabel}</Text>
                                    </TouchableOpacity>
                                )}
                            </View>
                        </View>
                    </TouchableWithoutFeedback>
                </View>
            </TouchableWithoutFeedback>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContainer: {
        width: width * 0.85,
        backgroundColor: theme.colors.white,
        borderRadius: theme.radius.lg,
        padding: theme.spacing.lg,
        ...theme.shadows.medium,
    },
    title: {
        fontSize: theme.typography.sizes.lg,
        fontWeight: theme.typography.weights.bold,
        color: theme.colors.primary,
        marginBottom: theme.spacing.sm,
        textAlign: 'center',
    },
    message: {
        fontSize: theme.typography.sizes.md,
        color: theme.colors.textMuted,
        marginBottom: theme.spacing.lg,
        textAlign: 'center',
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: theme.spacing.md,
    },
    cancelButton: {
        flex: 1,
        paddingVertical: theme.spacing.md,
        marginRight: theme.spacing.sm,
        borderRadius: theme.radius.md,
        backgroundColor: theme.colors.background,
        alignItems: 'center',
    },
    cancelButtonText: {
        color: theme.colors.primary,
        fontWeight: theme.typography.weights.semibold,
    },
    confirmButton: {
        flex: 1,
        paddingVertical: theme.spacing.md,
        marginLeft: theme.spacing.sm,
        borderRadius: theme.radius.md,
        backgroundColor: theme.colors.primary,
        alignItems: 'center',
    },
    confirmButtonText: {
        color: theme.colors.white,
        fontWeight: theme.typography.weights.semibold,
    },
});

export default CustomModal;
