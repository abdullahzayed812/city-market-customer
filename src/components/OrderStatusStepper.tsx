import React from 'react';
import { View, StyleSheet } from 'react-native';
import { AppText as Text, palette, space } from '@city-market/mobile-ui';
import { useTranslation } from 'react-i18next';
import { Package, MapPin, Check, Truck, ClipboardList, PackageCheck, XCircle } from 'lucide-react-native';
import { CustomerOrderStatus } from '@city-market/shared';

const STATUS_STEPS = [
  { status: CustomerOrderStatus.PENDING_VENDOR_CONFIRMATION, icon: ClipboardList },
  { status: CustomerOrderStatus.PREPARING, icon: Package },
  { status: CustomerOrderStatus.READY, icon: PackageCheck },
  { status: CustomerOrderStatus.PICKED_UP, icon: Truck },
  { status: CustomerOrderStatus.IN_DELIVERY, icon: MapPin },
  { status: CustomerOrderStatus.COMPLETED, icon: Check },
];

interface OrderStatusStepperProps {
  currentStatus: CustomerOrderStatus | undefined;
}

/** Vertical order-progress timeline. Hook-free, so it can render any status safely. */
export const OrderStatusStepper = ({ currentStatus }: OrderStatusStepperProps) => {
  const { t } = useTranslation();

  if (!currentStatus) return null;

  if (
    currentStatus === CustomerOrderStatus.CANCELLED ||
    currentStatus === CustomerOrderStatus.CANCELLED_BY_CUSTOMER
  ) {
    return (
      <View style={styles.cancelled}>
        <XCircle size={22} color={palette.error} />
        <Text variant="subheading" color={palette.error}>
          {t(`orders.status_${currentStatus.toLowerCase()}`)}
        </Text>
      </View>
    );
  }

  // Waiting on the customer happens during preparation, so it sits on that step.
  const waitingOnCustomer = currentStatus === CustomerOrderStatus.WAITING_CUSTOMER_DECISION;
  const effectiveStatus = waitingOnCustomer ? CustomerOrderStatus.PREPARING : currentStatus;
  const currentIndex = STATUS_STEPS.findIndex(step => step.status === effectiveStatus);
  const isComplete = currentStatus === CustomerOrderStatus.COMPLETED;

  return (
    <View accessibilityRole="progressbar">
      {STATUS_STEPS.map((step, index) => {
        const done = index < currentIndex || isComplete;
        const active = index === currentIndex && !isComplete;
        const Icon = done ? Check : step.icon;
        const isLast = index === STATUS_STEPS.length - 1;
        const label =
          active && waitingOnCustomer
            ? t('orders.status_waiting_customer_decision')
            : t(`orders.status_${step.status.toLowerCase()}`);

        return (
          <View key={step.status} style={styles.row}>
            <View style={styles.rail}>
              <View style={[styles.node, done && styles.nodeDone, active && (waitingOnCustomer ? styles.nodeWarn : styles.nodeActive)]}>
                <Icon size={16} color={done || active ? palette.white : palette.textDisabled} strokeWidth={2.5} />
              </View>
              {!isLast ? <View style={[styles.line, done && styles.lineDone]} /> : null}
            </View>
            <View style={styles.labelBlock}>
              <Text
                variant={active ? 'subheading' : 'body'}
                color={active ? (waitingOnCustomer ? palette.warning : palette.text) : done ? palette.textSecondary : palette.textMuted}
              >
                {label}
              </Text>
            </View>
          </View>
        );
      })}
    </View>
  );
};

const NODE = 30;

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: space.md,
  },
  rail: {
    width: NODE,
    alignItems: 'center',
  },
  node: {
    width: NODE,
    height: NODE,
    borderRadius: NODE / 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: palette.surfaceMuted,
  },
  nodeDone: {
    backgroundColor: palette.primary,
  },
  nodeActive: {
    backgroundColor: palette.primary,
    borderWidth: 3,
    borderColor: palette.primaryMuted,
  },
  nodeWarn: {
    backgroundColor: palette.warning,
    borderWidth: 3,
    borderColor: palette.warningSoft,
  },
  line: {
    width: 2,
    flex: 1,
    minHeight: 14,
    backgroundColor: palette.border,
  },
  lineDone: {
    backgroundColor: palette.primary,
  },
  labelBlock: {
    flex: 1,
    minHeight: NODE,
    justifyContent: 'center',
    paddingBottom: space.md,
  },
  cancelled: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
  },
});
