import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/constants/theme';
import { fontFamily } from '@/constants/typography';

interface ItemInfoHeaderProps {
  title: string;
  price: string;
  distance: string;
  postedAt?: string;
}

export function ItemInfoHeader({ title, price, distance, postedAt }: ItemInfoHeaderProps) {
  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{price}</Text>
        </View>
        {postedAt && (
          <Text style={styles.postedAt}>{postedAt}</Text>
        )}
      </View>
      <Text style={styles.title}>{title}</Text>
      <View style={styles.distanceContainer}>
        <Ionicons name="location-outline" size={14} color={colors.primary} />
        <Text style={styles.distance}>{distance}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 16,
    backgroundColor: 'transparent',
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  badge: {
    backgroundColor: '#e6f4ee', // Soft premium green tint
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  badgeText: {
    fontFamily: fontFamily.label,
    fontSize: 12,
    fontWeight: 'bold',
    color: colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  postedAt: {
    fontFamily: fontFamily.body,
    fontSize: 14,
    color: colors.onSurfaceVariant,
  },
  title: {
    fontFamily: fontFamily.display,
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.onSurface,
    marginBottom: 8,
  },
  distanceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(0, 108, 73, 0.05)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  distance: {
    fontFamily: fontFamily.body,
    fontSize: 13,
    fontWeight: '600',
    color: colors.primary,
  },
});
