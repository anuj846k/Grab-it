import React from 'react';
import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { HomeFeedSkeleton } from './skeletons/HomeFeedSkeleton';
import { colors } from '@/constants/theme';

/** Shown while Clerk `isLoaded` is false so layouts never render an empty tree. */
export function AuthLoadingShell() {
  return (
    <SafeAreaView edges={['top']} style={styles.root} accessibilityLabel="Loading">
      <HomeFeedSkeleton />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
});
