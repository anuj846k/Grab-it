import { colors } from '@/constants/theme';

/**
 * Digital Sommelier elevation — ambient glows, not heavy Material shadows.
 * See docs/design.md §4.
 */
export const elevation = {
  /** 32dp blur, 0 offset, ~4% tint from primary container */
  ambient: {
    shadowColor: colors.primaryContainer,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.04,
    shadowRadius: 32,
    elevation: 3,
  },
  /** Slightly stronger accent glow (e.g. progress active pill) */
  accentGlow: {
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 4,
  },
} as const;
