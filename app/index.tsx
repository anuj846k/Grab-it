import { AuthLoadingShell } from '@/components/auth-loading-shell';
import { useAuth } from '@clerk/expo';
import { Redirect } from 'expo-router';

/**
 * Single entry for `/` so signed-out users always hit onboarding first.
 * (Previously `(home)/index` also mapped to `/`, which fought redirects.)
 */
export default function RootIndex() {
  const { isSignedIn, isLoaded } = useAuth();

  if (!isLoaded) {
    return <AuthLoadingShell />;
  }

  if (isSignedIn) {
    return <Redirect href="/(home)" />;
  }

  return <Redirect href="/onboarding" />;
}
