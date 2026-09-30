import React from 'react';
import { Linking, Pressable, View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/constants/theme';
import { fontFamily } from '@/constants/typography';
import {
  buildGoogleMapsDirectionsUrl,
  parseGoogleMapsUrl,
} from '@/utils/map-url';

interface ItemLocationProps {
  locationText: string;
  locationUrl?: string | null;
}

export function ItemLocation({ locationText, locationUrl }: ItemLocationProps) {
  const coordinates = parseGoogleMapsUrl(locationUrl);

  const openDirections = async () => {
    if (!coordinates) return;

    const directionsUrl = buildGoogleMapsDirectionsUrl(coordinates);
    await Linking.openURL(directionsUrl);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Pickup Location</Text>
      {coordinates ? (
        <Pressable
          accessibilityLabel={`Open directions to ${locationText}`}
          accessibilityRole='button'
          style={styles.mapContainer}
          onPress={openDirections}
        >
          {/* Web Fallback (instead of MapView which crashes web) */}
          <View style={styles.mapFallback}>
            <Ionicons
              name='map-outline'
              size={32}
              color={colors.onSurfaceVariant}
            />
            <Text style={styles.mapText}>Tap to open map directions</Text>
          </View>
          <View style={styles.directionsBadge}>
            <Ionicons name='navigate' size={14} color='#ffffff' />
            <Text style={styles.directionsText}>Directions</Text>
          </View>
        </Pressable>
      ) : (
        <View style={styles.mapFallback}>
          <Ionicons
            name='map-outline'
            size={32}
            color={colors.onSurfaceVariant}
          />
          <Text style={styles.mapText}>Location map unavailable</Text>
        </View>
      )}
      <View style={styles.locationContainer}>
        <Ionicons name='location' size={16} color={colors.primary} />
        <Text style={styles.locationText}>{locationText}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#ffffff',
  },
  title: {
    fontFamily: fontFamily.headlineMd,
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.onSurface,
    marginBottom: 12,
  },
  mapContainer: {
    width: '100%',
    height: 160,
    borderRadius: 16,
    marginBottom: 12,
    overflow: 'hidden',
  },
  directionsBadge: {
    position: 'absolute',
    right: 12,
    bottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.primary,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  directionsText: {
    fontFamily: fontFamily.label,
    fontSize: 12,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  mapFallback: {
    width: '100%',
    height: '100%',
    backgroundColor: colors.surfaceContainer,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mapText: {
    fontFamily: fontFamily.label,
    fontSize: 12,
    color: colors.onSurfaceVariant,
    marginTop: 4,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  locationText: {
    fontFamily: fontFamily.body,
    fontSize: 14,
    color: colors.onSurface,
  },
});
