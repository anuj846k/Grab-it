import { OnboardingProgress } from '@/components/onboarding/onboarding-progress';
import { ONBOARDING_STEP_COUNT } from '@/constants/onboarding-layout';
import { colors } from '@/constants/theme';
import { fontFamily } from '@/constants/typography';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, StyleSheet, Text, View, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const heroImage = require('../../assets/images/onboarding-step-2.png');
const { width: SCREEN_WIDTH } = Dimensions.get('window');

type Props = {
  onBack: () => void;
  onNext: () => void;
  onSkip: () => void;
  activeStep?: number;
  totalSteps?: number;
};

export function OnboardingStepTwo({
  onBack,
  onNext,
  onSkip,
  activeStep = 1,
  totalSteps = ONBOARDING_STEP_COUNT,
}: Props) {
  const insets = useSafeAreaInsets();

  return (
    <LinearGradient
      colors={['#e8f8f2', '#ffffff']}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      style={styles.root}
    >
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <Pressable
          style={styles.backButton}
          onPress={onBack}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Ionicons name="chevron-back" size={24} color={colors.onSurface} />
        </Pressable>
        <Pressable
          style={styles.skipButton}
          onPress={onSkip}
          accessibilityRole="button"
          accessibilityLabel="Skip onboarding"
        >
          <Text style={styles.skipText}>Skip</Text>
        </Pressable>
      </View>

      {/* Hero Area */}
      <View style={styles.heroArea}>
        <View style={styles.heroCard}>
          <Image
            source={heroImage}
            style={styles.heroImage}
            contentFit="contain"
            transition={300}
          />
        </View>
      </View>

      {/* Typography */}
      <View style={styles.textArea}>
        <Text style={styles.headline}>Discover free{'\n'}items near you.</Text>
        <Text style={styles.subtitle}>
          Furniture, books, electronics, clothes, and more — all free.
        </Text>
      </View>

      {/* Footer */}
      <View style={[styles.footer, { paddingBottom: insets.bottom + 32 }]}>
        <OnboardingProgress
          activeStep={activeStep}
          totalSteps={totalSteps}
          variant="light"
          style={styles.progress}
        />

        <Pressable
          onPress={onNext}
          style={({ pressed }) => [
            styles.primaryButton,
            pressed && styles.primaryButtonPressed,
          ]}
          accessibilityRole="button"
          accessibilityLabel="Next step"
        >
          <View style={styles.buttonContent}>
            <Text style={styles.buttonText}>Next</Text>
            <Ionicons name="arrow-forward" size={16} color="#ffffff" style={styles.buttonIcon} />
          </View>
        </Pressable>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 8,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  skipButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 9999,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
  },
  skipText: {
    fontFamily: fontFamily.label,
    fontSize: 13,
    color: colors.onSurfaceVariant,
    letterSpacing: 0.3,
  },
  heroArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  heroCard: {
    width: SCREEN_WIDTH * 0.72,
    aspectRatio: 1,
    backgroundColor: '#ffffff',
    borderRadius: 32,
    borderWidth: 1.5,
    borderColor: 'rgba(0, 108, 73, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    transform: [{ rotate: '2deg' }],
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.1,
    shadowRadius: 28,
    elevation: 10,
    overflow: 'hidden',
  },
  heroImage: {
    width: '90%',
    height: '90%',
  },
  textArea: {
    paddingHorizontal: 28,
    gap: 14,
    marginBottom: 8,
  },
  headline: {
    fontFamily: fontFamily.display,
    fontSize: 32,
    lineHeight: 38,
    color: colors.onSurface,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontFamily: fontFamily.body,
    fontSize: 16,
    lineHeight: 24,
    color: colors.onSurfaceVariant,
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 20,
    gap: 28,
  },
  progress: {
    alignSelf: 'center',
  },
  primaryButton: {
    backgroundColor: colors.primary,
    borderRadius: 9999,
    paddingVertical: 18,
    paddingHorizontal: 24,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 6,
  },
  primaryButtonPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  buttonText: {
    fontFamily: fontFamily.label,
    fontSize: 15,
    color: '#ffffff',
    letterSpacing: 0.2,
  },
  buttonIcon: {
    marginTop: 1,
  },
});
