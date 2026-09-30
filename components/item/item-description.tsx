import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '@/constants/theme';
import { fontFamily } from '@/constants/typography';

interface ItemDescriptionProps {
  description: string;
  tags?: string[];
}

export function ItemDescription({ description, tags }: ItemDescriptionProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Description</Text>
      <Text style={styles.description}>{description}</Text>
      
      {tags && tags.length > 0 && (
        <View style={styles.tagsContainer}>
          {tags.map((tag, index) => (
            <View key={index} style={styles.tagPill}>
              <Text style={styles.tagText}>#{tag}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 20,
    marginBottom: 16,
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
  description: {
    fontFamily: fontFamily.body,
    fontSize: 14,
    color: colors.onSurfaceVariant,
    lineHeight: 22,
    marginBottom: 16,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tagPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999, // Pill shape
    backgroundColor: 'rgba(0, 108, 73, 0.05)', // light primary container tint
  },
  tagText: {
    fontFamily: fontFamily.label,
    fontSize: 12,
    color: colors.primary, // Green color text
    fontWeight: '600',
  },
});
