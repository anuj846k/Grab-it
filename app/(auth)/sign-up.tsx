import { AuthScreenLayout } from '@/components/auth/auth-screen-layout';
import { PasswordInput } from '@/components/auth/password-input';
import { AppAlert } from '@/components/ui/AppAlert';
import { Ionicons } from '@expo/vector-icons';
import { GoogleSignInButton } from '@/components/auth/google-sign-in-button';
import { authScreenStyles as s } from '@/constants/auth-screen-styles';
import { colors } from '@/constants/theme';
import { useAuth, useSignUp } from '@clerk/expo';
import { Link } from 'expo-router';
import React from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  ActivityIndicator,
} from 'react-native';

const placeholderColor = colors.onSurfaceVariant;

export default function Page() {
  const { signUp, errors, fetchStatus } = useSignUp();
  const { isSignedIn } = useAuth();

  const [firstName, setFirstName] = React.useState('');
  const [lastName, setLastName] = React.useState('');
  const [emailAddress, setEmailAddress] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [code, setCode] = React.useState('');
  const [showVerify, setShowVerify] = React.useState(false);

  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isVerifying, setIsVerifying] = React.useState(false);

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      const { error } = await signUp.password({
        emailAddress,
        password,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
      });
      if (error) {
        console.error(JSON.stringify(error, null, 2));
        AppAlert.alert(
          'Sign Up Error',
          error.message ||
            'Something went wrong while signing up. Please try again.',
        );
        return;
      }

      await signUp.verifications.sendEmailCode();
      setShowVerify(true);
    } catch (err: any) {
      console.error(JSON.stringify(err, null, 2));
      AppAlert.alert(
        'Sign Up Error',
        err.message ||
          err.toString() ||
          'An unexpected error occurred during sign up.',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerify = async () => {
    try {
      setIsVerifying(true);
      await signUp.verifications.verifyEmailCode({
        code,
      });
      if (signUp.status === 'complete') {
        await signUp.finalize({
          navigate: ({ session, decorateUrl }) => {
            if (session?.currentTask) {
              console.log(session?.currentTask);
              return;
            }

            // Let the layout automatically redirect to /(home) when isSignedIn becomes true.
          },
        });
      } else {
        console.error('Sign-up attempt not complete:', signUp);
        AppAlert.alert('Error', 'Sign-up verification failed. Please try again.');
      }
    } catch (err: any) {
      console.error(JSON.stringify(err, null, 2));
      AppAlert.alert(
        'Verification Error',
        err.message || err.toString() || 'An unexpected error occurred.',
      );
    } finally {
      setIsVerifying(false);
    }
  };

  if (signUp.status === 'complete' || isSignedIn) {
    return null;
  }

  if (
    showVerify &&
    signUp?.status === 'missing_requirements' &&
    signUp?.unverifiedFields?.includes('email_address') &&
    signUp?.missingFields?.length === 0
  ) {
    return (
      <AuthScreenLayout>
        <Pressable
          style={{
            alignSelf: 'flex-start',
            marginBottom: 8,
            padding: 4,
            marginLeft: -4,
          }}
          onPress={() => setShowVerify(false)}
        >
          <Ionicons name='arrow-back' size={24} color={colors.onSurface} />
        </Pressable>
        <Text style={s.title}>Verify your account</Text>
        <Text style={s.label}>Verification code</Text>
        <TextInput
          style={s.input}
          value={code}
          placeholder='Enter your verification code'
          placeholderTextColor={placeholderColor}
          onChangeText={setCode}
          keyboardType='number-pad'
        />
        {errors.fields.code && (
          <Text style={s.error}>{errors.fields.code.message}</Text>
        )}
        <Pressable
          onPress={handleVerify}
          disabled={isVerifying || fetchStatus === 'fetching'}
          accessibilityRole='button'
          accessibilityLabel='Verify'
          style={({ pressed }) => [
            s.primaryCta,
            (isVerifying || fetchStatus === 'fetching') && styles.disabled,
            pressed && s.pressed,
          ]}
        >
          {isVerifying ? (
            <ActivityIndicator color='#ffffff' size='small' />
          ) : (
            <Text style={s.primaryCtaLabel}>Verify</Text>
          )}
        </Pressable>
        <Pressable
          style={({ pressed }) => [s.secondaryButton, pressed && s.pressed]}
          onPress={() => signUp.verifications.sendEmailCode()}
          accessibilityRole='button'
          accessibilityLabel='Send a new code'
        >
          <Text style={s.secondaryButtonLabel}>I need a new code</Text>
        </Pressable>
      </AuthScreenLayout>
    );
  }

  return (
    <AuthScreenLayout>
      <Text style={s.title}>Sign up</Text>

      <View style={{ marginBottom: 16 }}>
        <GoogleSignInButton layout='full' />
      </View>

      <View style={s.dividerRow}>
        <View style={s.dividerLine} />
        <Text style={s.dividerText}>OR</Text>
        <View style={s.dividerLine} />
      </View>

      <Text style={s.label}>First name</Text>
      <TextInput
        style={s.input}
        value={firstName}
        placeholder='First name'
        placeholderTextColor={placeholderColor}
        onChangeText={setFirstName}
        autoCapitalize='words'
        textContentType='givenName'
      />
      {errors.fields.firstName && (
        <Text style={s.error}>{errors.fields.firstName.message}</Text>
      )}

      <Text style={[s.label, { marginTop: 4 }]}>Last name</Text>
      <TextInput
        style={s.input}
        value={lastName}
        placeholder='Last name'
        placeholderTextColor={placeholderColor}
        onChangeText={setLastName}
        autoCapitalize='words'
        textContentType='familyName'
      />
      {errors.fields.lastName && (
        <Text style={s.error}>{errors.fields.lastName.message}</Text>
      )}

      <Text style={[s.label, { marginTop: 4 }]}>Email address</Text>
      <TextInput
        style={s.input}
        autoCapitalize='none'
        autoCorrect={false}
        value={emailAddress}
        placeholder='Enter email'
        placeholderTextColor={placeholderColor}
        onChangeText={setEmailAddress}
        keyboardType='email-address'
        textContentType='emailAddress'
      />
      {errors.fields.emailAddress && (
        <Text style={s.error}>{errors.fields.emailAddress.message}</Text>
      )}

      <Text style={[s.label, { marginTop: 4 }]}>Password</Text>
      <PasswordInput
        value={password}
        onChangeText={setPassword}
        placeholder='Enter password'
        textContentType='newPassword'
      />
      {errors.fields.password && (
        <Text style={s.error}>{errors.fields.password.message}</Text>
      )}

      <Pressable
        onPress={handleSubmit}
        disabled={
          !firstName.trim() ||
          !lastName.trim() ||
          !emailAddress ||
          !password ||
          isSubmitting ||
          fetchStatus === 'fetching'
        }
        accessibilityRole='button'
        accessibilityLabel='Sign up'
        style={({ pressed }) => [
          s.primaryCta,
          (isSubmitting || fetchStatus === 'fetching') && styles.disabled,
          pressed && s.pressed,
        ]}
      >
        {isSubmitting ? (
          <ActivityIndicator color='#ffffff' size='small' />
        ) : (
          <Text style={s.primaryCtaLabel}>Sign up</Text>
        )}
      </Pressable>

      <View style={s.linkRow}>
        <Text style={s.linkMuted}>Already have an account?</Text>
        <Link href='/sign-in' asChild>
          <Pressable accessibilityRole='link' accessibilityLabel='Sign in'>
            <Text style={s.link}>Sign in</Text>
          </Pressable>
        </Link>
      </View>

      <View nativeID='clerk-captcha' />
    </AuthScreenLayout>
  );
}

const styles = StyleSheet.create({
  disabled: {
    opacity: 0.5,
  },
});
