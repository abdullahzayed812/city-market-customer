import { palette } from '@city-market/mobile-ui';

// Legacy key names kept so existing screens keep compiling; values come from
// the shared CityMarket design tokens.
export const colors = {
  primary: palette.primary,
  primaryDark: palette.primaryPressed,
  primaryLight: palette.primaryMuted,
  primaryXLight: palette.primarySoft,
  secondary: palette.textSecondary,
  background: palette.background,
  surface: palette.surface,
  textPrimary: palette.text,
  textSecondary: palette.textSecondary,
  textMuted: palette.textMuted,
  accent: palette.accent,
  accentLight: palette.accentSoft,
  white: palette.white,
  black: palette.black,
  error: palette.error,
  errorLight: palette.errorSoft,
  success: palette.success,
  successLight: palette.successSoft,
  warning: palette.warning,
  warningLight: palette.warningSoft,
  cardBackground: palette.surface,
  border: palette.border,
  borderLight: palette.surfaceMuted,
  overlay: palette.overlay,
  overlayLight: 'rgba(16,24,19,0.2)',
};
