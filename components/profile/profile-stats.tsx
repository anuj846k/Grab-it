import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/constants/theme';
import { fontFamily } from '@/constants/typography';

interface ProfileStatsProps {
  itemsGiven: number;
  itemsReceived: number;
}

export function ProfileStats({ itemsGiven, itemsReceived }: ProfileStatsProps) {
  return (
    <View style={styles.container}>
      <View style={styles.statCard}>
        <View style={[styles.iconCircle, { backgroundColor: 'rgba(0, 108, 73, 0.06)' }]}>
          <Ionicons name="heart" size={20} color={colors.primary} />
        </View>
        <Text style={[styles.statNumber, { color: colors.primary }]}>{itemsGiven}</Text>
        <Text style={styles.statLabel}>Items Given</Text>
      </View>
      
      <View style={styles.statCard}>
        <View style={[styles.iconCircle, { backgroundColor: 'rgba(93, 95, 95, 0.06)' }]}>
          <Ionicons name="gift" size={20} color={colors.secondary} />
        </View>
        <Text style={[styles.statNumber, { color: colors.onSurface }]}>{itemsReceived}</Text>
        <Text style={styles.statLabel}>Items Received</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 2,
    gap: 8,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  statNumber: {
    fontFamily: fontFamily.display,
    fontSize: 32,
    fontWeight: 'bold',
  },
  statLabel: {
    fontFamily: fontFamily.label,
    fontSize: 12,
    fontWeight: 'bold',
    color: colors.onSurfaceVariant,
  },
});
