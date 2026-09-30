import React from 'react';
import { View, StyleSheet } from 'react-native';
import { SkeletonBase } from './SkeletonBase';

export function ListingCardSkeleton() {
  return (
    <View style={styles.container}>
      <View style={styles.imageContainer}>
        <SkeletonBase width="100%" height="100%" borderRadius={0} />
      </View>
      <View style={styles.infoContainer}>
        <SkeletonBase width="80%" height={16} borderRadius={4} style={{ marginBottom: 6 }} />
        <SkeletonBase width="50%" height={14} borderRadius={4} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 160,
    marginRight: 16,
  },
  imageContainer: {
    width: 160,
    height: 160,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 12,
  },
  infoContainer: {
    paddingHorizontal: 4,
  },
});
