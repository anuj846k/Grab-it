import { useCallback } from 'react';
import { BackHandler } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';

/**
 * Overrides the Android hardware back button while the screen is focused.
 * Navigates to `route` instead of the default stack pop (which can land on the wrong tab).
 */
export function useBackNavigation(route: string) {
  const router = useRouter();

  useFocusEffect(
    useCallback(() => {
      const subscription = BackHandler.addEventListener(
        'hardwareBackPress',
        () => {
          router.navigate(route as any);
          return true; // prevent default behaviour
        },
      );
      return () => subscription.remove();
    }, [router, route]),
  );

  // Return a handler for use with icon back buttons too
  const goBack = useCallback(() => {
    router.navigate(route as any);
  }, [router, route]);

  return goBack;
}
