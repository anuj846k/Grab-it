import { colors } from '@/constants/theme';
import { fontFamily } from '@/constants/typography';
import { AppAlert } from '@/components/ui/AppAlert';
import { useSSO } from '@clerk/expo';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import * as Linking from 'expo-linking';
import {
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

const outline = 'rgba(92, 63, 64, 0.2)';

type Props = {
  /** Called after session is active; default navigates to `/` (index routes to `/home` when signed in). */
  onSignInComplete?: () => void;
  /** Show “OR” divider below (auth screens). */
  showDivider?: boolean;
  /** `full` = full-width under title; `split` = half-width beside Email (onboarding). */
  layout?: 'full' | 'split';
  /** Web / unsupported: tap handler (e.g. navigate to sign-up). */
  onFallbackPress?: () => void;
};

/**
 * Native Sign in with Google (Clerk). Requires a dev/production build — not Expo Go.
 * Configure: https://clerk.com/docs/guides/configure/auth-strategies/sign-in-with-google
 */
export function GoogleSignInButton({
  onSignInComplete,
  showDivider = false,
  layout = 'full',
  onFallbackPress,
}: Props) {
  const { startSSOFlow } = useSSO();

  const handlePress = async () => {
    try {
      const { createdSessionId, setActive } = await startSSOFlow({
        strategy: 'oauth_google',
        redirectUrl: Linking.createURL('/'),
      });

      if (createdSessionId && setActive) {
        await setActive({ session: createdSessionId });
        if (onSignInComplete) {
          onSignInComplete();
        }
      }
    } catch (err: unknown) {
      const code =
        err && typeof err === 'object' && 'code' in err
          ? String((err as { code: unknown }).code)
          : '';
      if (code === 'SIGN_IN_CANCELLED' || code === '-5') {
        return;
      }
      const message =
        err instanceof Error ? err.message : 'An error occurred during Google sign-in';
      AppAlert.alert('Error', message);
      console.error('Sign in with Google:', err);
    }
  };

  if (Platform.OS !== 'ios' && Platform.OS !== 'android') {
    if (!onFallbackPress) {
      return null;
    }
    return (
      <Pressable
        onPress={onFallbackPress}
        style={({ pressed }) => [
          layout === 'full' ? styles.fullBtn : styles.splitBtn,
          pressed && styles.pressed,
        ]}
        accessibilityRole="button"
        accessibilityLabel="Continue with Google"
      >
        <FontAwesome5 name="google" size={20} color={colors.onSurface} brand />
        <Text style={layout === 'full' ? styles.fullLabel : styles.splitLabel}>
          Google
        </Text>
      </Pressable>
    );
  }

  const button = (
    <Pressable
      onPress={handlePress}
      style={({ pressed }) => [
        layout === 'full' ? styles.fullBtn : styles.splitBtn,
        pressed && styles.pressed,
      ]}
      accessibilityRole="button"
      accessibilityLabel="Continue with Google"
    >
      <FontAwesome5 name="google" size={20} color={colors.onSurface} brand />
      <Text style={layout === 'full' ? styles.fullLabel : styles.splitLabel}>
        Google
      </Text>
    </Pressable>
  );

  return (
    <>
      {button}
      {showDivider && layout === 'full' && (
        <View style={styles.dividerRow}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>OR</Text>
          <View style={styles.dividerLine} />
        </View>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  fullBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    width: '100%',
    minHeight: 56,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 9999,
    backgroundColor: '#ffffff',
    borderWidth: 1.5,
    borderColor: 'rgba(0, 108, 73, 0.15)',
  },
  fullLabel: {
    fontFamily: fontFamily.label,
    fontSize: 15,
    lineHeight: 24,
    color: colors.onSurface,
  },
  splitBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    minHeight: 56,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 9999,
    backgroundColor: '#ffffff',
    borderWidth: 1.5,
    borderColor: 'rgba(0, 108, 73, 0.15)',
  },
  splitLabel: {
    fontFamily: fontFamily.label,
    fontSize: 14,
    lineHeight: 24,
    color: colors.onSurface,
  },
  pressed: {
    opacity: 0.92,
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
    backgroundColor: 'rgba(92, 63, 64, 0.25)',
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
