import { colors } from '@/constants/theme';
import { ClerkProvider } from '@clerk/expo';
import { SupabaseProvider } from '@/utils/supabase';
import { tokenCache } from '@clerk/expo/token-cache';
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
} from '@expo-google-fonts/inter';
import {
  PlusJakartaSans_600SemiBold,
  PlusJakartaSans_700Bold,
} from '@expo-google-fonts/plus-jakarta-sans';
import { useFonts } from 'expo-font';
import { Slot } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import * as WebBrowser from 'expo-web-browser';
import { useUserSync } from '@/hooks/useUserSync';
import {
  configureRevenueCat,
  loginRevenueCat,
  logoutRevenueCat,
} from '@/services/revenuecat';
import { useUser } from '@clerk/expo';
import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';

SplashScreen.preventAutoHideAsync();
WebBrowser.maybeCompleteAuthSession();

const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!;

if (!publishableKey) {
  throw new Error('Add your Clerk Publishable Key to the .env file');
}

function InnerLayout({ fontsLoaded }: { fontsLoaded: boolean }) {
  // This hook requires ClerkProvider to be its parent
  useUserSync();
  const { isSignedIn, user } = useUser();

  useEffect(() => {
    // Must configure before login/logout — this effect runs before the
    // parent RootLayout effect (children fire first), so configuring here
    // avoids calling Purchases.logIn/logOut before Purchases.configure.
    configureRevenueCat();
    if (isSignedIn && user?.id) {
      loginRevenueCat(user.id);
    } else if (!isSignedIn) {
      logoutRevenueCat();
    }
  }, [isSignedIn, user?.id]);

  return (
    <>
      <StatusBar style='dark' />
      {!fontsLoaded ? <View style={styles.bootSplash} /> : <Slot />}
    </>
  );
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    PlusJakartaSans_600SemiBold,
    PlusJakartaSans_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  return (
    <ClerkProvider publishableKey={publishableKey} tokenCache={tokenCache}>
      <SupabaseProvider>
        <InnerLayout fontsLoaded={fontsLoaded} />
      </SupabaseProvider>
    </ClerkProvider>
  );
}

const styles = StyleSheet.create({
  bootSplash: {
    flex: 1,
    backgroundColor: colors.background,
  },
});
