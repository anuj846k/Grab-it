import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { SkeletonBase } from './SkeletonBase';
import { colors } from '@/constants/theme';

interface RequestsSkeletonProps {
  hasActions?: boolean;
}

export function RequestsSkeleton({ hasActions = false }: RequestsSkeletonProps) {
  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.scrollContent}
    >
      {Array.from({ length: 3 }).map((_, index) => (
        <View key={index} style={styles.card}>
          <View style={styles.cardBody}>
            <View style={styles.requesterRow}>
              <SkeletonBase width={40} height={40} borderRadius={20} />
              <View style={styles.requesterInfo}>
                <SkeletonBase width={100} height={15} borderRadius={4} />
                <SkeletonBase
                  width={40}
                  height={12}
                  borderRadius={4}
                  style={styles.wantsLabel}
                />
              </View>
              {!hasActions && (
                <SkeletonBase width={70} height={22} borderRadius={11} />
              )}
            </View>

            <View style={styles.listingRow}>
              <SkeletonBase width={48} height={48} borderRadius={10} />
              <SkeletonBase width="65%" height={16} borderRadius={4} />
            </View>
          </View>

          {hasActions && (
            <View style={styles.actions}>
              <View style={styles.actionButton}>
                <SkeletonBase width={50} height={14} borderRadius={4} />
              </View>
              <View style={[styles.actionButton, styles.acceptButton]}>
                <SkeletonBase width={50} height={14} borderRadius={4} />
              </View>
            </View>
          )}
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    padding: 16,
    gap: 12,
    paddingBottom: 100,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardBody: {
    padding: 16,
    gap: 12,
  },
  requesterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  requesterInfo: {
    flex: 1,
  },
  wantsLabel: {
    marginTop: 4,
  },
  listingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  actions: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  actionButton: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderRightWidth: 1,
    borderRightColor: '#F3F4F6',
  },
  acceptButton: {
    borderRightWidth: 0,
    backgroundColor: colors.surfaceContainerLowest,
  },
});
