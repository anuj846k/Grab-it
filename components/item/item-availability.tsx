import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/constants/theme';
import { fontFamily } from '@/constants/typography';

interface ItemAvailabilityProps {
  availability: string[];
}

export function ItemAvailability({ availability }: ItemAvailabilityProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Availability</Text>
      <View style={styles.list}>
        {availability.map((time, index) => (
          <View key={index} style={styles.listItem}>
            <Ionicons name="time-outline" size={16} color={colors.primary} />
            <Text style={styles.timeText}>{time}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 20,
    marginBottom: 24,
    padding: 20,
    borderRadius: 24, // 24dp rounded corners
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 2,
  },
  title: {
    fontFamily: fontFamily.headlineMd,
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.onSurface,
    marginBottom: 12,
  },
  list: {
    gap: 8,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: colors.surfaceContainerLow,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
  },
  timeText: {
    fontFamily: fontFamily.body,
    fontSize: 14,
    color: colors.onSurface,
  },
});
