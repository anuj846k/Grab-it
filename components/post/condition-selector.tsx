import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { colors } from '@/constants/theme';
import { fontFamily } from '@/constants/typography';

const CONDITIONS = ['New', 'Like New', 'Good', 'Fair', 'Old'];

interface ConditionSelectorProps {
  selected: string;
  onSelect: (condition: string) => void;
}

export function ConditionSelector({
  selected,
  onSelect,
}: ConditionSelectorProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>
        Condition<Text style={styles.requiredAsterisk}> *</Text>
      </Text>
      <View style={styles.pillsContainer}>
        {CONDITIONS.map((condition) => {
          const isActive = selected === condition;
          return (
            <Pressable
              key={condition}
              style={[styles.pill, isActive && styles.pillActive]}
              onPress={() => onSelect(condition)}
            >
              <Text
                style={[styles.pillText, isActive && styles.pillTextActive]}
              >
                {condition}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  label: {
    fontFamily: fontFamily.label,
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.onSurface,
    marginBottom: 12,
  },
  requiredAsterisk: {
    color: colors.error,
    fontWeight: 'bold',
  },
  pillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  pill: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 100,
    backgroundColor: colors.surfaceContainerLow,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  pillActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  pillText: {
    fontFamily: fontFamily.label,
    fontSize: 14,
    color: colors.onSurfaceVariant,
  },
  pillTextActive: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
});
