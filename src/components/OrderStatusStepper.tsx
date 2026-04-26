import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { useTranslation } from 'react-i18next';
import {
  Package,
  MapPin,
  CheckCircle2,
  Truck,
  ClipboardList,
  PackageCheck,
  XCircle,
} from 'lucide-react-native';
import { theme } from '../theme';
import { CustomerOrderStatus } from '@city-market/shared';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const PADDING = 20;
const CONTAINER_WIDTH = SCREEN_WIDTH - PADDING * 2;
const NODE_SIZE = 50;
const ROW_HEIGHT = 125;
const COLUMN_WIDTH = CONTAINER_WIDTH / 3;

const STATUS_STEPS = [
  {
    status: CustomerOrderStatus.PENDING_VENDOR_CONFIRMATION,
    icon: ClipboardList,
  },
  { status: CustomerOrderStatus.PREPARING, icon: Package },
  { status: CustomerOrderStatus.READY, icon: PackageCheck },
  { status: CustomerOrderStatus.PICKED_UP, icon: Truck },
  { status: CustomerOrderStatus.IN_DELIVERY, icon: MapPin },
  { status: CustomerOrderStatus.COMPLETED, icon: CheckCircle2 },
];

interface OrderStatusStepperProps {
  currentStatus: CustomerOrderStatus | undefined;
}

export const OrderStatusStepper = ({
  currentStatus,
}: OrderStatusStepperProps) => {
  const { t } = useTranslation();

  if (!currentStatus) return null;

  if (
    currentStatus === CustomerOrderStatus.CANCELLED ||
    currentStatus === CustomerOrderStatus.CANCELLED_BY_CUSTOMER
  ) {
    return (
      <View style={styles.cancelledContainer}>
        <XCircle size={36} color={theme.colors.error} />
        <Text style={styles.cancelledText}>
          {currentStatus === CustomerOrderStatus.CANCELLED_BY_CUSTOMER
            ? t('orders.status_cancelled_by_customer')
            : t('orders.status_cancelled')}
        </Text>
      </View>
    );
  }

  // AWAITING_CUSTOMER_CONFIRMATION is handled by the confirmation card in OrderDetailsScreen
  if (currentStatus === CustomerOrderStatus.AWAITING_CUSTOMER_CONFIRMATION) {
    return null;
  }

  const effectiveStatus =
    currentStatus === CustomerOrderStatus.WAITING_CUSTOMER_DECISION
      ? CustomerOrderStatus.PREPARING
      : currentStatus;

  const currentIndex = STATUS_STEPS.findIndex(
    step => step.status === effectiveStatus,
  );

  const renderNode = (index: number) => {
    const step = STATUS_STEPS[index];
    const isCompleted =
      index < currentIndex || currentStatus === CustomerOrderStatus.COMPLETED;
    const isActive =
      index === currentIndex && currentStatus !== CustomerOrderStatus.COMPLETED;
    const Icon = step.icon;
    const iconColor =
      isActive || isCompleted ? theme.colors.white : theme.colors.primary;

    return (
      <View key={step.status} style={styles.nodeContainer}>
        <View
          style={[
            styles.node,
            isCompleted && styles.nodeCompleted,
            isActive && styles.nodeActive,
          ]}
        >
          <Icon size={26} color={iconColor} />
          {isActive &&
            currentStatus === CustomerOrderStatus.WAITING_CUSTOMER_DECISION && (
              <View style={styles.alertBadge}>
                <Text style={styles.alertText}>!</Text>
              </View>
            )}
        </View>
        <Text
          style={[
            styles.label,
            isCompleted && styles.labelCompleted,
            isActive && styles.labelActive,
          ]}
          numberOfLines={2}
        >
          {t(`orders.status_${step.status.toLowerCase()}`)}
        </Text>
      </View>
    );
  };

  return (
    <View style={styles.outerContainer}>
      <View style={styles.innerContainer}>
        {/* Path Overlay (Lines) - Positioned behind nodes */}
        <View style={styles.pathOverlay}>
          {/* Row 1 Line: From Node 0 (Right) to Node 2 (Left) */}
          <View
            style={[
              styles.hLine,
              { width: COLUMN_WIDTH * 2, right: COLUMN_WIDTH / 2 },
              currentIndex > 0 && styles.lineCompleted,
            ]}
          />

          {/* Vertical U-Turn Line: On the far LEFT side */}
          <View
            style={[
              styles.vLine,
              { left: COLUMN_WIDTH / 2 - 2, height: ROW_HEIGHT },
              currentIndex >= 3 && styles.lineCompleted,
            ]}
          />

          {/* Row 2 Line: From Node 3 (Left) back to Node 5 (Right) */}
          <View
            style={[
              styles.hLine,
              {
                width: COLUMN_WIDTH * 2,
                left: COLUMN_WIDTH / 2,
                top: ROW_HEIGHT + NODE_SIZE / 2 - 2,
              },
              currentIndex > 3 && styles.lineCompleted,
            ]}
          />
        </View>

        {/* Nodes Layer */}
        <View style={styles.nodesLayer}>
          {/* Row 1: Right -> Left (Zig) */}
          <View style={[styles.row, { flexDirection: 'row-reverse' }]}>
            {renderNode(0)}
            {renderNode(1)}
            {renderNode(2)}
          </View>

          {/* Spacer for Vertical Connector Area */}
          <View style={{ height: ROW_HEIGHT - NODE_SIZE }} />

          {/* Row 2: Left -> Right (Zag) */}
          <View style={[styles.row, { flexDirection: 'row' }]}>
            {renderNode(3)}
            {renderNode(4)}
            {renderNode(5)}
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  outerContainer: {
    width: '100%',
    paddingVertical: theme.spacing.sm,
    alignItems: 'center',
  },
  innerContainer: {
    width: CONTAINER_WIDTH,
    position: 'relative',
  },
  pathOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1,
  },
  nodesLayer: {
    zIndex: 2,
  },
  row: {
    flexDirection: 'row',
    height: NODE_SIZE,
    alignItems: 'center',
  },
  nodeContainer: {
    width: COLUMN_WIDTH,
    alignItems: 'center',
    justifyContent: 'center',
  },
  node: {
    width: NODE_SIZE,
    height: NODE_SIZE,
    borderRadius: NODE_SIZE / 2,
    backgroundColor: theme.colors.white,
    borderWidth: 2,
    borderColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  nodeCompleted: {
    backgroundColor: theme.colors.success,
    borderColor: theme.colors.success,
  },
  nodeActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
    elevation: 6,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  label: {
    fontSize: 12,
    fontWeight: 'bold', // Made base text bold
    color: theme.colors.textMuted,
    textAlign: 'center',
    position: 'absolute',
    top: NODE_SIZE + 6,
    width: COLUMN_WIDTH - 8,
    lineHeight: 14,
  },
  labelCompleted: {
    color: theme.colors.textPrimary,
  },
  labelActive: {
    color: theme.colors.primary,
  },
  hLine: {
    position: 'absolute',
    top: NODE_SIZE / 2 - 2,
    height: 4,
    backgroundColor: theme.colors.border,
  },
  vLine: {
    position: 'absolute',
    top: NODE_SIZE / 2,
    width: 4,
    backgroundColor: theme.colors.border,
  },
  lineCompleted: {
    backgroundColor: theme.colors.success,
  },
  alertBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#FF9500',
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: theme.colors.white,
  },
  alertText: {
    color: theme.colors.white,
    fontSize: 11,
    fontWeight: 'bold',
  },
  cancelledContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    backgroundColor: theme.colors.error + '15',
    borderRadius: 15,
    width: '95%',
  },
  cancelledText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.error,
    marginLeft: 12,
  },
});
