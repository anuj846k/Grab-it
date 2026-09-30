/**
 * Give. Grab. Repeat. — typography tokens (DESIGN.md).
 * Dual-font strategy: Plus Jakarta Sans for headlines, Inter for body/labels.
 */
export const fontFamily = {
  display: 'PlusJakartaSans_700Bold',
  headlineLg: 'PlusJakartaSans_700Bold',
  headlineMd: 'PlusJakartaSans_600SemiBold',
  headlineSm: 'PlusJakartaSans_600SemiBold',
  body: 'Inter_400Regular',
  label: 'Inter_600SemiBold',
  labelSm: 'Inter_500Medium',
} as const;

export const typography = {
  /** Hero marketing sections */
  displayLg: {
    fontFamily: fontFamily.display,
    fontSize: 48,
    lineHeight: 57.6, // 1.2
    letterSpacing: -0.96, // -0.02em
  },
  /** Screen headers */
  headlineLg: {
    fontFamily: fontFamily.headlineLg,
    fontSize: 32,
    lineHeight: 38.4, // 1.2
    letterSpacing: 0,
  },
  /** Mobile screen headers */
  headlineLgMobile: {
    fontFamily: fontFamily.headlineLg,
    fontSize: 24,
    lineHeight: 28.8, // 1.2
    letterSpacing: 0,
  },
  /** Section headers */
  headlineMd: {
    fontFamily: fontFamily.headlineMd,
    fontSize: 24,
    lineHeight: 31.2, // 1.3
    letterSpacing: 0,
  },
  /** Card / Item titles */
  headlineSm: {
    fontFamily: fontFamily.headlineSm,
    fontSize: 20,
    lineHeight: 28, // 1.4
    letterSpacing: 0,
  },
  /** Large body text */
  bodyLg: {
    fontFamily: fontFamily.body,
    fontSize: 18,
    lineHeight: 28.8, // 1.6
    letterSpacing: 0,
  },
  /** Standard reading */
  bodyMd: {
    fontFamily: fontFamily.body,
    fontSize: 16,
    lineHeight: 24, // 1.5
    letterSpacing: 0,
  },
  /** Buttons, tabs, important labels */
  labelMd: {
    fontFamily: fontFamily.label,
    fontSize: 14,
    lineHeight: 16.8, // 1.2
    letterSpacing: 0.14, // 0.01em
  },
  /** Metadata, smaller tags */
  labelSm: {
    fontFamily: fontFamily.labelSm,
    fontSize: 12,
    lineHeight: 14.4, // 1.2
    letterSpacing: 0,
  },
} as const;
