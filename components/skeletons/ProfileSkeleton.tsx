import React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { SkeletonBase } from './SkeletonBase';
import { colors } from '@/constants/theme';

function MenuOptionSkeleton() {
  return (
    <View style={menuStyles.row}>
      <View style={menuStyles.left}>
        <SkeletonBase width={36} height={36} borderRadius={18} />
        <SkeletonBase width={100} height={15} borderRadius={4} />
      </View>
      <SkeletonBase width={18} height={18} borderRadius={9} />
    </View>
  );
}

const menuStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 20,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
});

export function ProfileSkeleton() {
  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.scrollContent}
    >
      {/* Profile Header Skeleton */}
      <View style={styles.headerCard}>
        <SkeletonBase width={100} height={100} borderRadius={50} style={styles.avatar} />
        <SkeletonBase width={160} height={24} borderRadius={4} style={styles.name} />
        <SkeletonBase width={130} height={24} borderRadius={999} style={styles.trustBadge} />
        <SkeletonBase width="70%" height={14} borderRadius={4} />
        <SkeletonBase width="50%" height={14} borderRadius={4} style={styles.bioLine} />
      </View>

      {/* Stats Skeleton */}
      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <SkeletonBase width={48} height={48} borderRadius={24} style={styles.statIcon} />
          <SkeletonBase width={40} height={36} borderRadius={4} />
          <SkeletonBase width={80} height={12} borderRadius={4} />
        </View>
        <View style={styles.statCard}>
          <SkeletonBase width={48} height={48} borderRadius={24} style={styles.statIcon} />
          <SkeletonBase width={40} height={36} borderRadius={4} />
          <SkeletonBase width={90} height={12} borderRadius={4} />
        </View>
      </View>

      {/* Menu Card Skeleton */}
      <View style={styles.menuCard}>
        <MenuOptionSkeleton />
        <MenuOptionSkeleton />
        <MenuOptionSkeleton />
        <MenuOptionSkeleton />
        <MenuOptionSkeleton />
        <MenuOptionSkeleton />
        <MenuOptionSkeleton />
        <MenuOptionSkeleton />
        <MenuOptionSkeleton />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  headerCard: {
    padding: 24,
    borderRadius: 24,
    alignItems: 'center',
    marginBottom: 24,
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 2,
  },
  avatar: {
    marginBottom: 16,
  },
  name: {
    marginBottom: 12,
  },
  trustBadge: {
    marginBottom: 16,
  },
  bioLine: {
    marginTop: 8,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 2,
  },
  statIcon: {
    marginBottom: 8,
  },
  menuCard: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 2,
    marginBottom: 24,
  },
});
