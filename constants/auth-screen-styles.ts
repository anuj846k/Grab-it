import { colors } from '@/constants/theme';
import { fontFamily, typography } from '@/constants/typography';
import { Platform, StyleSheet } from 'react-native';

const outline = 'rgba(0, 108, 73, 0.1)';

/**
 * Shared styles for sign-in / sign-up — designed for light mint gradient backgrounds.
 */
export const authScreenStyles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 32,
    maxWidth: 448,
    width: '100%',
    alignSelf: 'center',
    gap: 14,
  },
  title: {
    fontFamily: fontFamily.display,
    fontSize: 28,
    lineHeight: 34,
    color: colors.onSurface,
    marginBottom: 4,
  },
  label: {
    fontFamily: fontFamily.label,
    fontSize: 14,
    lineHeight: 24,
    letterSpacing: 0.2,
    color: colors.onSurfaceVariant,
  },
  /**
   * Android: do not set `lineHeight` on TextInput — RN clips descenders (g, y, p).
   * Use minHeight + padding; iOS can keep lineHeight for alignment.
   */
  input: {
    borderWidth: 1.5,
    borderColor: 'transparent',
    borderRadius: 16,
    paddingHorizontal: 16,
    fontSize: 16,
    fontFamily: fontFamily.body,
    color: colors.onSurface,
    backgroundColor: '#ffffff',
    minHeight: 56,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 2,
    ...Platform.select({
      ios: {
        paddingVertical: 14,
        lineHeight: 26,
      },
      android: {
        paddingVertical: 16,
        textAlignVertical: 'center',
      },
    }),
  },
  primaryCta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    width: '100%',
    minHeight: 56,
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 9999,
    backgroundColor: colors.primary,
    marginTop: 8,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 6,
  },
  primaryCtaLabel: {
    fontFamily: fontFamily.label,
    fontSize: 15,
    lineHeight: 24,
    color: '#ffffff',
  },
  secondaryButton: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 4,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: outline,
  },
  secondaryButtonLabel: {
    fontFamily: fontFamily.label,
    fontSize: 15,
    lineHeight: 26,
    color: colors.primary,
  },
  linkRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 16,
    alignItems: 'center',
    gap: 4,
  },
  linkMuted: {
    fontFamily: fontFamily.body,
    fontSize: 15,
    lineHeight: 24,
    color: colors.onSurfaceVariant,
  },
  link: {
    fontFamily: fontFamily.label,
    fontSize: 15,
    lineHeight: 26,
    color: colors.primary,
  },
  error: {
    fontFamily: fontFamily.body,
    fontSize: 13,
    lineHeight: 22,
    color: '#ef4444',
    marginTop: -6,
  },
  debug: {
    fontFamily: fontFamily.body,
    fontSize: 10,
    lineHeight: 14,
    opacity: 0.45,
    color: colors.onSurfaceVariant,
    marginTop: 8,
  },
  pressed: {
    opacity: 0.92,
    transform: [{ scale: 0.98 }],
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
    width: '100%',
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: outline,
  },
  dividerText: {
    fontFamily: fontFamily.label,
    fontSize: 12,
    lineHeight: 18,
    letterSpacing: 1.2,
    marginHorizontal: 12,
    color: colors.onSurfaceVariant,
  },
});
