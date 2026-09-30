import React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { SkeletonBase } from './SkeletonBase';
import { colors } from '@/constants/theme';

export function ItemDetailsSkeleton() {
  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Image Header Skeleton */}
        <View style={styles.imageHeaderWrapper}>
          <SkeletonBase width="100%" height={350} borderRadius={0} />
        </View>

        {/* Info Header Skeleton */}
        <View style={styles.infoSection}>
          <View style={styles.topRow}>
            <SkeletonBase width={60} height={24} borderRadius={12} />
            <SkeletonBase width={100} height={16} borderRadius={4} />
          </View>
          <SkeletonBase width="80%" height={28} borderRadius={4} style={{ marginBottom: 12 }} />
          <SkeletonBase width="30%" height={20} borderRadius={8} />
        </View>

        {/* Owner Profile Card Skeleton */}
        <View style={styles.card}>
          <View style={styles.leftContent}>
            <SkeletonBase width={56} height={56} borderRadius={28} />
            <View style={styles.info}>
              <SkeletonBase width={120} height={18} borderRadius={4} style={{ marginBottom: 8 }} />
              <SkeletonBase width={90} height={14} borderRadius={4} />
            </View>
          </View>
          <SkeletonBase width={20} height={20} borderRadius={10} />
        </View>

        {/* Description Card Skeleton */}
        <View style={styles.card}>
          <SkeletonBase width={100} height={18} borderRadius={4} style={{ marginBottom: 16 }} />
          <SkeletonBase width="100%" height={14} borderRadius={4} style={{ marginBottom: 8 }} />
          <SkeletonBase width="100%" height={14} borderRadius={4} style={{ marginBottom: 8 }} />
          <SkeletonBase width="70%" height={14} borderRadius={4} style={{ marginBottom: 16 }} />
          
          <View style={styles.tagsContainer}>
            <SkeletonBase width={60} height={24} borderRadius={999} />
            <SkeletonBase width={80} height={24} borderRadius={999} />
            <SkeletonBase width={50} height={24} borderRadius={999} />
          </View>
        </View>

        {/* Location Card Skeleton */}
        <View style={styles.card}>
          <SkeletonBase width={120} height={18} borderRadius={4} style={{ marginBottom: 16 }} />
          <SkeletonBase width="100%" height={160} borderRadius={16} style={{ marginBottom: 16 }} />
          <SkeletonBase width="60%" height={14} borderRadius={4} />
        </View>
      </ScrollView>

      {/* Bottom Action Bar Skeleton */}
      <View style={styles.bottomBar}>
        <SkeletonBase style={{ flex: 1 }} height={48} borderRadius={16} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  imageHeaderWrapper: {
    width: '100%',
    height: 350,
    backgroundColor: colors.surfaceContainer,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    overflow: 'hidden',
  },
  infoSection: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 16,
    backgroundColor: 'transparent',
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  card: {
    marginHorizontal: 20,
    marginBottom: 16,
    padding: 20,
    borderRadius: 24,
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 2,
  },
  leftContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  info: {
    justifyContent: 'center',
  },
  tagsContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  bottomBar: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 32,
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    gap: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 8,
  },
});
