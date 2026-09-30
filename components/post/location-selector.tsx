import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/constants/theme';
import { fontFamily } from '@/constants/typography';

interface LocationSelectorProps {
  location: string;
  onPress: () => void;
}

export function LocationSelector({ location, onPress }: LocationSelectorProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>Pickup Location<Text style={styles.requiredAsterisk}> *</Text></Text>
      <Pressable style={styles.selector} onPress={onPress}>
        <View style={styles.leftContent}>
          <Ionicons name="location" size={20} color={colors.primary} style={{ flexShrink: 0 }} />
          <Text style={styles.locationText} numberOfLines={3}>{location}</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color={colors.onSurfaceVariant} style={{ flexShrink: 0 }} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 32,
  },
  label: {
    fontFamily: fontFamily.label,
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.onSurface,
    marginBottom: 8,
  },
  requiredAsterisk: {
    color: colors.error,
    fontWeight: 'bold',
  },
  selector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  leftContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    paddingRight: 8,
  },
  locationText: {
    fontFamily: fontFamily.body,
    fontSize: 16,
    color: colors.onSurface,
    flex: 1,
    marginLeft: 8,
  },
});
