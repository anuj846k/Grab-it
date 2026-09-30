import React from 'react';
import { Linking, Pressable, View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
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
          <MapView
            style={styles.map}
            provider={PROVIDER_GOOGLE}
            initialRegion={{
              ...coordinates,
              latitudeDelta: 0.01,
              longitudeDelta: 0.01,
            }}
            pointerEvents='none'
            scrollEnabled={false}
            zoomEnabled={false}
            rotateEnabled={false}
            pitchEnabled={false}
          >
            <Marker coordinate={coordinates} />
          </MapView>
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
  mapContainer: {
    width: '100%',
    height: 160,
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
  },
  map: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
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
    paddingHorizontal: 16,
    paddingVertical: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  directionsText: {
    fontFamily: fontFamily.label,
    fontSize: 12,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  mapFallback: {
    width: '100%',
    height: 120,
    backgroundColor: colors.surfaceContainer,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
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
    backgroundColor: colors.surfaceContainerLow,
    padding: 12,
    borderRadius: 12,
  },
  locationText: {
    fontFamily: fontFamily.body,
    fontSize: 14,
    color: colors.onSurface,
  },
});
