import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { SkeletonBase } from './SkeletonBase';
import { colors } from '@/constants/theme';

interface ListingsSkeletonProps {
  hasActions?: boolean;
}

export function ListingsSkeleton({ hasActions = false }: ListingsSkeletonProps) {
  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.scrollContent}
    >
      <View style={styles.listingsContainer}>
        {Array.from({ length: 4 }).map((_, index) => (
          <View key={index} style={styles.listingCard}>
            <View style={styles.cardContent}>
              <SkeletonBase width={80} height={80} borderRadius={12} />
              <View style={styles.listingInfo}>
                <View style={styles.titleRow}>
                  <SkeletonBase width="55%" height={16} borderRadius={4} />
                  <SkeletonBase width={60} height={20} borderRadius={10} />
                </View>
                <SkeletonBase
                  width="40%"
                  height={13}
                  borderRadius={4}
                  style={styles.categoryLine}
                />
              </View>
            </View>

            {hasActions && (
              <View style={styles.actionsContainer}>
                <View style={styles.actionButton}>
                  <SkeletonBase width={45} height={14} borderRadius={4} />
                </View>
                <View style={[styles.actionButton, styles.middleButton]}>
                  <SkeletonBase width={70} height={14} borderRadius={4} />
                </View>
                <View style={styles.actionButton}>
                  <SkeletonBase width={45} height={14} borderRadius={4} />
                </View>
              </View>
            )}
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    padding: 16,
    paddingBottom: 120,
  },
  listingsContainer: {
    gap: 16,
  },
  listingCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardContent: {
    flexDirection: 'row',
    padding: 12,
  },
  listingInfo: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  categoryLine: {
    marginTop: 6,
  },
  actionsContainer: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  actionButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
  },
  middleButton: {
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: '#F3F4F6',
  },
});
