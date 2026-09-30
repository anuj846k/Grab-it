import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/constants/theme';
import { fontFamily } from '@/constants/typography';

interface OwnerProfileProps {
  owner: {
    name: string;
    avatarUrl: string;
    rating: number;
    reviewsCount: number;
  };
}

export function OwnerProfile({ owner }: OwnerProfileProps) {
  return (
    <View style={styles.wrapper}>
      <View style={styles.container}>
        <View style={styles.leftContent}>
          <Image 
            source={owner.avatarUrl} 
            style={styles.avatar} 
            contentFit="cover"
          />
          <View style={styles.info}>
            <Text style={styles.name}>{owner.name}</Text>
            <View style={styles.ratingContainer}>
              <Ionicons name="star" size={14} color="#FBBF24" />
              <Text style={styles.ratingValue}>{owner.rating.toFixed(1)}</Text>
              <Text style={styles.reviewsCount}>({owner.reviewsCount} reviews)</Text>
            </View>
          </View>
        </View>
        <Ionicons name="chevron-forward" size={18} color={colors.outlineVariant} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 24, // 24dp rounded corners
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
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.surfaceContainer,
  },
  info: {
    gap: 4,
  },
  name: {
    fontFamily: fontFamily.headlineSm,
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.onSurface,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  ratingValue: {
    fontFamily: fontFamily.body,
    fontSize: 13,
    fontWeight: 'bold',
    color: colors.onSurface,
    marginLeft: 4,
  },
  reviewsCount: {
    fontFamily: fontFamily.label,
    fontSize: 13,
    color: colors.onSurfaceVariant,
    marginLeft: 4,
  },
});
