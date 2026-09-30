import { AuthLoadingShell } from '@/components/auth-loading-shell';
import { useAuth } from '@clerk/expo';
import { Redirect, Stack } from 'expo-router';

export default function AuthRoutesLayout() {
  const { isSignedIn, isLoaded } = useAuth();

  if (!isLoaded) {
    return <AuthLoadingShell />;
  }

  if (isSignedIn) {
    return <Redirect href="/(home)" />;
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}
