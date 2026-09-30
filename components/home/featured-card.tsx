import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Listing } from '@/types/listing';
import { colors } from '@/constants/theme';
import { fontFamily } from '@/constants/typography';

interface FeaturedCardProps {
  listing: Listing;
}

export function FeaturedCard({ listing }: FeaturedCardProps) {
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
          <Ionicons name="location-outline" size={14} color={colors.onSurfaceVariant} />
          <Text style={styles.distance}>{listing.distance}</Text>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 280,
    borderRadius: 24,
    backgroundColor: '#ffffff',
    overflow: 'hidden',
    marginRight: 16,
    // Add a subtle border or shadow to define the card edge against white background
    borderWidth: 1,
    borderColor: colors.surfaceVariant,
  },
  imageContainer: {
    width: '100%',
    height: 220,
    backgroundColor: colors.surfaceContainer,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  badge: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: '#ffffff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
  },
  badgeText: {
    fontFamily: fontFamily.label,
    fontSize: 12,
    fontWeight: 'bold',
    color: colors.primary,
  },
  infoContainer: {
    padding: 16,
    backgroundColor: '#ffffff',
  },
  title: {
    fontFamily: fontFamily.headlineSm,
    fontSize: 16,
    fontWeight: 'bold',
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
    fontSize: 14,
    color: colors.onSurfaceVariant,
  },
});
