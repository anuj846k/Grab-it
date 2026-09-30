import React from 'react';
import { View, StyleSheet } from 'react-native';
import { colors } from '@/constants/theme';
import { SkeletonBase } from './SkeletonBase';

export function FeaturedCardSkeleton() {
  return (
    <View style={styles.container}>
      <View style={styles.imageContainer}>
        <SkeletonBase width="100%" height="100%" borderRadius={0} />
      </View>
      <View style={styles.infoContainer}>
        <SkeletonBase width="70%" height={20} borderRadius={4} style={{ marginBottom: 8 }} />
        <SkeletonBase width="40%" height={16} borderRadius={4} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 280,
    borderRadius: 24,
    backgroundColor: '#ffffff',
    overflow: 'hidden',
    marginRight: 16,
    borderWidth: 1,
    borderColor: colors.surfaceVariant,
  },
  imageContainer: {
    width: '100%',
    height: 220,
  },
  infoContainer: {
    padding: 16,
    backgroundColor: '#ffffff',
  },
});
