import { colors } from '@/constants/theme';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

type OnboardingProgressProps = {
  activeStep: number;
  totalSteps: number;
  variant?: 'light' | 'dark';
  style?: StyleProp<ViewStyle>;
};

export function OnboardingProgress({
  activeStep,
  totalSteps,
  variant = 'dark',
  style,
}: OnboardingProgressProps) {
  const safeTotalSteps = Math.max(1, totalSteps);
  const boundedActiveStep = Math.min(Math.max(activeStep, 0), safeTotalSteps - 1);
  const stepIndexes = Array.from({ length: safeTotalSteps }, (_, index) => index);

  const isDark = variant === 'dark';

  return (
    <View
      style={[styles.row, style]}
      accessible
      accessibilityRole="progressbar"
      accessibilityLabel="Onboarding progress"
      accessibilityValue={{
        min: 1,
        max: safeTotalSteps,
        now: boundedActiveStep + 1,
      }}
    >
      {stepIndexes.map((stepIndex) => {
        const isActive = stepIndex === boundedActiveStep;
        return (
          <View
            key={stepIndex}
            style={[
              styles.segment,
              isActive
                ? isDark ? styles.activeDark : styles.activeLight
                : isDark ? styles.inactiveDark : styles.inactiveLight,
            ]}
          />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  segment: {
    height: 8,
    borderRadius: 9999,
  },
  activeDark: {
    width: 32,
    backgroundColor: '#ffffff',
  },
  inactiveDark: {
    width: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  activeLight: {
    width: 32,
    backgroundColor: colors.primary,
  },
  inactiveLight: {
    width: 8,
    backgroundColor: colors.secondaryContainer,
  },
});
