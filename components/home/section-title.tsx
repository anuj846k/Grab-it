import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { colors } from '@/constants/theme';
import { fontFamily } from '@/constants/typography';
import { Ionicons } from '@expo/vector-icons';

interface SectionTitleProps {
  title: string;
  onSeeAll?: () => void;
}

export function SectionTitle({ title, onSeeAll }: SectionTitleProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      {onSeeAll && (
        <Pressable onPress={onSeeAll} style={styles.seeAllContainer}>
          <Text style={styles.seeAllText}>See All</Text>
          <Ionicons name="chevron-forward" size={16} color={colors.primary} />
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  title: {
    fontFamily: fontFamily.headlineMd,
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.onSurface,
  },
  seeAllContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  seeAllText: {
    fontFamily: fontFamily.label,
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
  },
});
