import { StyleSheet } from 'react-native';
import { palette, radii, space } from '@city-market/mobile-ui';

export const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: palette.background,
  },
  scrollContent: {
    padding: space.lg,
    gap: space.xl,
    paddingBottom: space.huge,
  },
  flex: {
    flex: 1,
  },
  pressed: {
    opacity: 0.85,
  },
  tabular: {
    fontVariant: ['tabular-nums'],
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: space.sm,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.xs,
  },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    padding: space.lg,
    borderRadius: radii.lg,
  },
  bannerTight: {
    marginTop: space.sm,
    padding: space.md,
  },
  bannerWarning: {
    backgroundColor: palette.warningSoft,
  },
  bannerError: {
    backgroundColor: palette.errorSoft,
  },
  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    padding: space.lg,
    borderRadius: radii.lg,
    backgroundColor: palette.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: palette.borderStrong,
  },
  actionCardUrgent: {
    borderWidth: 1.5,
    borderColor: palette.warning,
    backgroundColor: palette.warningSoft,
  },
  actionCardDanger: {
    borderWidth: 1.5,
    borderColor: palette.error,
    backgroundColor: palette.errorSoft,
  },
  actionIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: palette.primarySoft,
  },
  actionIconUrgent: {
    backgroundColor: palette.warning,
  },
  actionIconDanger: {
    backgroundColor: palette.error,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    paddingHorizontal: space.lg,
    paddingVertical: space.md,
  },
  itemRowBorder: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: palette.border,
  },
  ratedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginTop: space.sm,
  },
  rateButton: {
    alignSelf: 'flex-start',
    marginTop: space.sm,
  },
  continueVendorButton: {
    minHeight: 48,
    borderRadius: radii.md,
    borderWidth: 1.5,
    borderColor: palette.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: space.md,
  },
  cancelEntireOrderButton: {
    minHeight: 48,
    borderRadius: radii.md,
    backgroundColor: palette.error,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: space.sm,
  },
});
