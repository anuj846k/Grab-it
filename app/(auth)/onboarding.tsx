import { OnboardingStepOne } from '@/components/onboarding/onboarding-step-one';
import { OnboardingStepThree } from '@/components/onboarding/onboarding-step-three';
import { OnboardingStepTwo } from '@/components/onboarding/onboarding-step-two';
import { ONBOARDING_STEP_COUNT } from '@/constants/onboarding-layout';
import { type Href, useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { BackHandler, StyleSheet, View } from 'react-native';

export default function OnboardingScreen() {
  const router = useRouter();
  const [step, setStep] = useState(0);

  const completeOnboarding = useCallback(() => {
    router.push('/sign-in' as Href);
  }, [router]);

  useEffect(() => {
    if (step === 0) return;
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      setStep((s) => Math.max(0, s - 1));
      return true;
    });
    return () => sub.remove();
  }, [step]);

  if (step === 2) {
    return (
      <View style={styles.root}>
        <OnboardingStepThree
          onBack={() => setStep(1)}
          onNext={completeOnboarding}
          activeStep={2}
          totalSteps={ONBOARDING_STEP_COUNT}
        />
      </View>
    );
  }

  if (step === 1) {
    return (
      <View style={styles.root}>
        <OnboardingStepTwo
          onBack={() => setStep(0)}
          onNext={() => setStep(2)}
          onSkip={completeOnboarding}
          activeStep={1}
          totalSteps={ONBOARDING_STEP_COUNT}
        />
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <OnboardingStepOne
        onNext={() => setStep(1)}
        onSkip={completeOnboarding}
        activeStep={0}
        totalSteps={ONBOARDING_STEP_COUNT}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});
