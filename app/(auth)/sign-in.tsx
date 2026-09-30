import { AuthScreenLayout } from '@/components/auth/auth-screen-layout';
import { PasswordInput } from '@/components/auth/password-input';
import { GoogleSignInButton } from '@/components/auth/google-sign-in-button';
import { authScreenStyles as s } from '@/constants/auth-screen-styles';
import { colors } from '@/constants/theme';
import { fontFamily } from '@/constants/typography';
import { useSignIn } from '@clerk/expo';
import { Ionicons } from '@expo/vector-icons';
import { type Href, Link, useRouter } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet, Text, TextInput, View, Alert, ActivityIndicator, Linking } from 'react-native';

const placeholderColor = colors.onSurfaceVariant;

export default function Page() {
  const { signIn, errors, fetchStatus } = useSignIn();
  const router = useRouter();

  const [showEmailForm, setShowEmailForm] = React.useState(false);
  const [emailAddress, setEmailAddress] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [code, setCode] = React.useState('');
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isVerifying, setIsVerifying] = React.useState(false);

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      const { error } = await signIn.password({
        emailAddress,
        password,
      });
      if (error) {
        console.error(JSON.stringify(error, null, 2));
        Alert.alert('Sign In Error', error.message || 'Something went wrong while signing in. Please check your credentials and try again.');
        return;
      }

      if (signIn.status === 'complete') {
        await signIn.finalize({
          navigate: ({ session, decorateUrl }) => {
            if (session?.currentTask) {
              console.log(session?.currentTask);
              return;
            }

            // Let the layout automatically redirect to /(home) when isSignedIn becomes true.
          },
        });
      } else if (signIn.status === 'needs_second_factor') {
        // MFA strategies — see Clerk docs
      } else if (signIn.status === 'needs_client_trust') {
        const emailCodeFactor = signIn.supportedSecondFactors.find(
          (factor) => factor.strategy === 'email_code',
        );

        if (emailCodeFactor) {
          await signIn.mfa.sendEmailCode();
        }
      } else {
        console.error('Sign-in attempt not complete:', signIn);
        Alert.alert('Error', 'Sign-in attempt not complete. Please try again.');
      }
    } catch (err: any) {
      console.error(JSON.stringify(err, null, 2));
      Alert.alert('Sign In Error', err.message || err.toString() || 'An unexpected error occurred during sign in.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerify = async () => {
    try {
      setIsVerifying(true);
      await signIn.mfa.verifyEmailCode({ code });

      if (signIn.status === 'complete') {
        await signIn.finalize({
          navigate: ({ session, decorateUrl }) => {
            if (session?.currentTask) {
              console.log(session?.currentTask);
              return;
            }

            router.replace('/' as Href);
          },
        });
      } else {
        console.error('Sign-in attempt not complete:', signIn);
      }
    } catch (err: any) {
      console.error(JSON.stringify(err, null, 2));
      Alert.alert('Verification Error', err.message || err.toString() || 'An unexpected error occurred.');
    } finally {
      setIsVerifying(false);
    }
  };

  if (signIn.status === 'needs_client_trust') {
    return (
      <AuthScreenLayout>
        <Text style={s.title}>Verify your account</Text>
        <Text style={s.label}>Verification code</Text>
        <TextInput
          style={s.input}
          value={code}
          placeholder="Enter your verification code"
          placeholderTextColor={placeholderColor}
          onChangeText={setCode}
          keyboardType="number-pad"
        />
        {errors.fields.code && (
          <Text style={s.error}>{errors.fields.code.message}</Text>
        )}
        <Pressable
          onPress={handleVerify}
          disabled={isVerifying || fetchStatus === 'fetching'}
          accessibilityRole="button"
          accessibilityLabel="Verify"
          style={({ pressed }) => [
            s.primaryCta,
            (isVerifying || fetchStatus === 'fetching') && styles.disabled,
            pressed && s.pressed,
          ]}
        >
          {isVerifying ? (
            <ActivityIndicator color="#ffffff" size="small" />
          ) : (
            <Text style={s.primaryCtaLabel}>Verify</Text>
          )}
        </Pressable>
        <Pressable
          style={({ pressed }) => [s.secondaryButton, pressed && s.pressed]}
          onPress={() => signIn.mfa.sendEmailCode()}
          accessibilityRole="button"
          accessibilityLabel="Send a new code"
        >
          <Text style={s.secondaryButtonLabel}>I need a new code</Text>
        </Pressable>
        <Pressable
          style={({ pressed }) => [s.secondaryButton, pressed && s.pressed]}
          onPress={() => signIn.reset()}
          accessibilityRole="button"
          accessibilityLabel="Start over"
        >
          <Text style={s.secondaryButtonLabel}>Start over</Text>
        </Pressable>
      </AuthScreenLayout>
    );
  }

  if (!showEmailForm) {
    return (
      <AuthScreenLayout>
        <View style={styles.headerContainer}>
          <Text style={styles.welcomeTitle}>Welcome Back</Text>
          <Text style={styles.welcomeSubtitle}>
            Sign in to continue sharing with your community.
          </Text>
        </View>

        <View style={styles.cardContainer}>
          <View style={styles.buttonStack}>
            <GoogleSignInButton layout="full" />
          </View>

          <View style={[s.dividerRow, styles.orDivider]}>
            <View style={s.dividerLine} />
            <Text style={s.dividerText}>OR</Text>
            <View style={s.dividerLine} />
          </View>

          <Pressable
            onPress={() => setShowEmailForm(true)}
            style={({ pressed }) => [
              styles.emailButton,
              pressed && s.pressed,
            ]}
            accessibilityRole="button"
            accessibilityLabel="Continue with Email"
          >
            <Ionicons name="mail-outline" size={20} color={colors.onPrimary} />
            <Text style={styles.emailButtonLabel}>Continue with Email</Text>
          </Pressable>
        </View>

        <View style={styles.footerContainer}>
          <Text style={styles.footerText}>
            By continuing, you agree to our{' '}
            <Text style={styles.footerLink} onPress={() => Linking.openURL('https://www.joingrabit.com/terms')}>Terms of Service</Text>
            {'\n'}and <Text style={styles.footerLink} onPress={() => Linking.openURL('https://www.joingrabit.com/privacy')}>Privacy Policy</Text>.
          </Text>
        </View>

        <View style={s.linkRow}>
          <Text style={s.linkMuted}>Don&apos;t have an account?</Text>
          <Link href="/sign-up" asChild>
            <Pressable accessibilityRole="link" accessibilityLabel="Sign up">
              <Text style={s.link}>Sign up</Text>
            </Pressable>
          </Link>
        </View>
      </AuthScreenLayout>
    );
  }

  return (
    <AuthScreenLayout>
      <Pressable
        style={styles.backButton}
        onPress={() => setShowEmailForm(false)}
      >
        <Ionicons name="arrow-back" size={24} color={colors.onSurface} />
      </Pressable>
      <Text style={s.title}>Sign in with Email</Text>

      <Text style={s.label}>Email address</Text>
      <TextInput
        style={s.input}
        autoCapitalize="none"
        autoCorrect={false}
        value={emailAddress}
        placeholder="Enter email"
        placeholderTextColor={placeholderColor}
        onChangeText={setEmailAddress}
        keyboardType="email-address"
        textContentType="emailAddress"
      />
      {errors.fields.identifier && (
        <Text style={s.error}>{errors.fields.identifier.message}</Text>
      )}

      <Text style={[s.label, { marginTop: 4 }]}>Password</Text>
      <PasswordInput
        value={password}
        onChangeText={setPassword}
        placeholder="Enter password"
        textContentType="password"
      />
      {errors.fields.password && (
        <Text style={s.error}>{errors.fields.password.message}</Text>
      )}

      <Pressable
        onPress={handleSubmit}
        disabled={!emailAddress || !password || isSubmitting || fetchStatus === 'fetching'}
        accessibilityRole="button"
        accessibilityLabel="Continue"
        style={({ pressed }) => [
          s.primaryCta,
          (isSubmitting || fetchStatus === 'fetching') && styles.disabled,
          pressed && s.pressed,
        ]}
      >
        {isSubmitting ? (
          <ActivityIndicator color="#ffffff" size="small" />
        ) : (
          <Text style={s.primaryCtaLabel}>Continue</Text>
        )}
      </Pressable>
    </AuthScreenLayout>
  );
}

const styles = StyleSheet.create({
  disabled: {
    opacity: 0.5,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 32,
    marginTop: 24,
  },
  welcomeTitle: {
    fontFamily: fontFamily.headlineLg,
    fontSize: 28,
    color: '#0A1B28', // Dark slate blue from design
    marginBottom: 8,
  },
  welcomeSubtitle: {
    fontFamily: fontFamily.body,
    fontSize: 15,
    color: colors.onSurfaceVariant,
    textAlign: 'center',
    paddingHorizontal: 24,
  },
  cardContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 24,
    elevation: 2,
    marginBottom: 32,
  },
  buttonStack: {
    gap: 16,
  },
  orDivider: {
    marginVertical: 24,
  },
  emailButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    width: '100%',
    minHeight: 56,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 9999,
    backgroundColor: colors.primary,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 6,
  },
  emailButtonLabel: {
    fontFamily: fontFamily.label,
    fontSize: 15,
    lineHeight: 24,
    color: '#FFFFFF',
  },
  footerContainer: {
    alignItems: 'center',
    paddingHorizontal: 32,
    marginBottom: 16,
  },
  footerText: {
    fontFamily: fontFamily.body,
    fontSize: 12,
    lineHeight: 18,
    textAlign: 'center',
    color: colors.onSurfaceVariant,
  },
  footerLink: {
    color: '#006C49',
    fontFamily: fontFamily.label,
  },
  backButton: {
    marginBottom: 16,
    alignSelf: 'flex-start',
  },
});
