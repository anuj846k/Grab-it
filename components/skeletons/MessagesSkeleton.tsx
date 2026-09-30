import React from 'react';
import { View, StyleSheet } from 'react-native';
import { SkeletonBase } from './SkeletonBase';

function ConversationRowSkeleton() {
  return (
    <View style={styles.row}>
      <View style={styles.avatarContainer}>
        <SkeletonBase width={52} height={52} borderRadius={26} />
      </View>
      <View style={styles.info}>
        <View style={styles.topRow}>
          <SkeletonBase width={120} height={16} borderRadius={4} />
          <SkeletonBase width={40} height={12} borderRadius={4} />
        </View>
        <SkeletonBase width={90} height={14} borderRadius={4} style={styles.listingLine} />
        <SkeletonBase width="75%" height={14} borderRadius={4} />
      </View>
    </View>
  );
}

export function MessagesSkeleton() {
  return (
    <View style={styles.container}>
      {[1, 2, 3, 4, 5].map((i) => (
        <ConversationRowSkeleton key={i} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 12,
    gap: 12,
  },
  avatarContainer: {
    position: 'relative',
  },
  info: {
    flex: 1,
    gap: 6,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  listingLine: {
    marginTop: 2,
  },
});
