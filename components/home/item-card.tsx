import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Listing } from '@/types/listing';
import { colors } from '@/constants/theme';
import { fontFamily } from '@/constants/typography';

interface ItemCardProps {
  listing: Listing;
}

export function ItemCard({ listing }: ItemCardProps) {
  const router = useRouter();

  return (
    <Pressable style={styles.container} onPress={() => router.push(`/item/${listing.id}`)}>
      <View style={styles.imageContainer}>
        <Image 
          source={listing.imageUrl} 
          style={styles.image}
          contentFit="cover"
          transition={200}
        />
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{listing.price}</Text>
        </View>
      </View>
      <View style={styles.infoContainer}>
        <Text style={styles.title} numberOfLines={1}>{listing.title}</Text>
        <View style={styles.distanceContainer}>
          <Ionicons name="location-outline" size={12} color={colors.onSurfaceVariant} />
          <Text style={styles.distance}>{listing.distance}</Text>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 160,
    marginRight: 16,
  },
  imageContainer: {
    width: 160,
    height: 160,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: colors.surfaceContainer,
    marginBottom: 12,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  badge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#ffffff',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
  },
  badgeText: {
    fontFamily: fontFamily.label,
    fontSize: 10,
    fontWeight: 'bold',
    color: colors.primary,
  },
  infoContainer: {
    paddingHorizontal: 4,
  },
  title: {
    fontFamily: fontFamily.headlineSm,
    fontSize: 14,
    fontWeight: '600',
    color: colors.onSurface,
    marginBottom: 4,
  },
  distanceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  distance: {
    fontFamily: fontFamily.body,
    fontSize: 12,
    color: colors.onSurfaceVariant,
  },
});
