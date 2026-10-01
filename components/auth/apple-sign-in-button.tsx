import { colors } from '@/constants/theme';
import { fontFamily } from '@/constants/typography';
import { AppAlert } from '@/components/ui/AppAlert';
import { useOAuth } from '@clerk/expo';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import * as Linking from 'expo-linking';
import {
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';



type Props = {
  /** Called after session is active; default navigates to `/` (index routes to `/home` when signed in). */
  onSignInComplete?: () => void;
  /** Show “OR” divider below (auth screens). */
  showDivider?: boolean;
  /** `full` = full-width under title; `split` = half-width beside another button. */
  layout?: 'full' | 'split';
  /** Web / unsupported: tap handler. */
  onFallbackPress?: () => void;
};

/**
 * Native Sign in with Apple (Clerk).
 */
export function AppleSignInButton({
  onSignInComplete,
  showDivider = false,
  layout = 'full',
  onFallbackPress,
}: Props) {
  const { startOAuthFlow } = useOAuth({ strategy: 'oauth_apple' });

  const handlePress = async () => {
    try {
      const { createdSessionId, setActive } = await startOAuthFlow({
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
        err instanceof Error ? err.message : 'An error occurred during Apple sign-in';
      AppAlert.alert('Error', message);
      console.error('Sign in with Apple:', err);
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
        accessibilityLabel="Continue with Apple"
      >
        <FontAwesome5 name="apple" size={20} color="#FFFFFF" brand />
        <Text style={layout === 'full' ? styles.fullLabel : styles.splitLabel}>
          Apple
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
      accessibilityLabel="Continue with Apple"
    >
      <FontAwesome5 name="apple" size={20} color="#FFFFFF" brand />
      <Text style={layout === 'full' ? styles.fullLabel : styles.splitLabel}>
        Apple
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
    minHeight: 54,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 9999, // fully rounded pill
    backgroundColor: '#2A2C36', // Dark slate from design
    borderWidth: 0,
  },
  fullLabel: {
    fontFamily: fontFamily.label,
    fontSize: 15,
    lineHeight: 24,
    color: '#FFFFFF',
  },
  splitBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    minHeight: 54,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 9999,
    backgroundColor: '#2A2C36',
    borderWidth: 0,
  },
  splitLabel: {
    fontFamily: fontFamily.label,
    fontSize: 14,
    lineHeight: 24,
    color: '#FFFFFF',
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
