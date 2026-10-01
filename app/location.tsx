import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  TextInput,
  Keyboard,
  Linking,
  ActivityIndicator,
  DeviceEventEmitter,
  AppState,
} from 'react-native';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';
import MapView, { Region, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';
import { useAuth } from '@clerk/expo';

import { colors } from '@/constants/theme';
import { fontFamily } from '@/constants/typography';
import { normalizePickupLocation } from '@/utils/location';
import { createClerkSupabaseClient } from '@/utils/supabase';
import { AppAlert } from '@/components/ui/AppAlert';

const INITIAL_REGION = {
  latitude: 28.6273928,
  longitude: 77.3726929,
  latitudeDelta: 0.0922,
  longitudeDelta: 0.0421,
};

interface PlaceSuggestion {
  placeId: string;
  description: string;
}

const fetchPlaceSuggestions = async (query: string): Promise<PlaceSuggestion[]> => {
  const apiKey = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY;
  if (!apiKey) return [];

  const url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(query)}&key=${apiKey}`;
  const response = await fetch(url);
  const data = await response.json();

  if (data.status !== 'OK') {
    if (data.status !== 'ZERO_RESULTS') {
      console.warn('[LocationScreen] Places Autocomplete error:', data.status, data.error_message);
    }
    return [];
  }

  return (data.predictions || []).map((p: { place_id: string; description: string }) => ({
    placeId: p.place_id,
    description: p.description,
  }));
};

const buildGoogleMapsUrl = ({ latitude, longitude }: Region) =>
  `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;

const parseGoogleMapsUrl = (mapUrl?: string | null): Region | null => {
  if (!mapUrl) return null;

  const decodedUrl = decodeURIComponent(mapUrl);
  const coordinateMatch = decodedUrl.match(
    /(?:[?&](?:query|q)=|@)(-?\d+(?:\.\d+)?),\s*(-?\d+(?:\.\d+)?)/,
  );

  if (!coordinateMatch) return null;

  const latitude = Number(coordinateMatch[1]);
  const longitude = Number(coordinateMatch[2]);

  if (
    Number.isNaN(latitude) ||
    Number.isNaN(longitude) ||
    latitude < -90 ||
    latitude > 90 ||
    longitude < -180 ||
    longitude > 180
  ) {
    return null;
  }

  return {
    latitude,
    longitude,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  };
};

export default function LocationSelectorScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const mapRef = useRef<MapView>(null);
  const pendingInitialRegionRef = useRef<Region | null>(null);
  const wasPermissionDeniedRef = useRef<boolean>(false);
  const appStateRef = useRef(AppState.currentState);
  const { getToken, isLoaded, userId } = useAuth();
  const getTokenRef = useRef(getToken);
  getTokenRef.current = getToken;

  const [region, setRegion] = useState<Region>(INITIAL_REGION);
  const [address, setAddress] = useState<string>('Locating...');
  const [isLocating, setIsLocating] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [canAskAgain, setCanAskAgain] = useState(true);
  const [suggestions, setSuggestions] = useState<PlaceSuggestion[]>([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const suggestionsDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const requestLocationPermission = useCallback(async () => {
    let { status, canAskAgain: canAsk } =
      await Location.getForegroundPermissionsAsync();

    if (status !== 'granted' && canAsk) {
      ({ status, canAskAgain: canAsk } =
        await Location.requestForegroundPermissionsAsync());
    }

    if (status === 'granted') {
      setPermissionDenied(false);
      wasPermissionDeniedRef.current = false;
      return { granted: true, canAskAgain: canAsk };
    }

    setPermissionDenied(true);
    setCanAskAgain(canAsk);
    wasPermissionDeniedRef.current = true;

    if (!canAsk) {
      AppAlert.alert(
        'Location Access Needed',
        'Enable location access in Settings to use this feature.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Open Settings', onPress: () => Linking.openSettings() },
        ],
      );
    }
    return { granted: false, canAskAgain: canAsk };
  }, []);

  const initializeLocation = useCallback(async () => {
    const { granted, canAskAgain: canAsk } = await requestLocationPermission();

    if (!granted) {
      setAddress(
        canAsk ? 'Location permission needed' : 'Location permission denied',
      );
      setIsLocating(false);
      return;
    }

    try {
      if (userId) {
        const token = await getTokenRef.current({ template: 'supabase' });

        if (token) {
          const supabase = createClerkSupabaseClient(token);
          const { data, error } = await supabase
            .from('users')
            .select('default_neighborhood, default_address_url')
            .eq('clerk_id', userId)
            .single();

          if (error) {
            console.error('Error loading saved location:', error);
          }

          const savedRegion = parseGoogleMapsUrl(data?.default_address_url);

          if (savedRegion) {
            setAddress(
              normalizePickupLocation(data?.default_neighborhood) ||
                'Saved Location',
            );
            setRegion(savedRegion);
            if (mapRef.current) {
              mapRef.current.animateToRegion(savedRegion, 1000);
            } else {
              pendingInitialRegionRef.current = savedRegion;
            }
            setIsLocating(false);
            return;
          }
        }
      }

      let location = await Location.getLastKnownPositionAsync({});
      if (!location) {
        location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
      }
      const newRegion = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      };
      setRegion(newRegion);
      if (mapRef.current) {
        mapRef.current.animateToRegion(newRegion, 1000);
      } else {
        pendingInitialRegionRef.current = newRegion;
      }
    } catch (error) {
      console.error('Error getting location:', error);
      setIsLocating(false);
    }
  }, [userId, requestLocationPermission]);

  useEffect(() => {
    if (!isLoaded) return;
    initializeLocation();
  }, [isLoaded, initializeLocation]);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (
        appStateRef.current.match(/inactive|background/) &&
        nextAppState === 'active' &&
        wasPermissionDeniedRef.current
      ) {
        Location.getForegroundPermissionsAsync().then(({ status }) => {
          if (status === 'granted') {
            initializeLocation();
          }
        });
      }
      appStateRef.current = nextAppState;
    });

    return () => subscription.remove();
  }, [initializeLocation]);

  useFocusEffect(
    useCallback(() => {
      if (!wasPermissionDeniedRef.current) return;

      Location.getForegroundPermissionsAsync().then(({ status }) => {
        if (status === 'granted') {
          initializeLocation();
        }
      });
    }, [initializeLocation]),
  );

  const handleMapReady = () => {
    if (!pendingInitialRegionRef.current) return;

    mapRef.current?.animateToRegion(pendingInitialRegionRef.current, 1000);
    pendingInitialRegionRef.current = null;
  };

  const handleRegionChangeComplete = async (newRegion: Region) => {
    setRegion(newRegion);
    setIsLocating(true);
    try {
      const geocode = await Location.reverseGeocodeAsync({
        latitude: newRegion.latitude,
        longitude: newRegion.longitude,
      });

      if (geocode.length > 0) {
        const place = geocode[0];
        // Construct a nice address string
        const addressParts = [];
        if (place.name) addressParts.push(place.name);
        if (place.street && place.street !== place.name)
          addressParts.push(place.street);
        if (place.city) addressParts.push(place.city);
        else if (place.subregion) addressParts.push(place.subregion);
        if (place.region) addressParts.push(place.region);

        setAddress(addressParts.join(', ') || 'Unknown Location');
      } else {
        setAddress('Unknown Location');
      }
    } catch (error) {
      console.error('Reverse geocode error:', error);
      setAddress('Could not determine address');
    } finally {
      setIsLocating(false);
    }
  };

  const centerOnUser = async () => {
    try {
      const { granted } = await requestLocationPermission();
      if (!granted) return;

      setIsLocating(true);
      let location = await Location.getLastKnownPositionAsync({});
      if (!location) {
        location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
      }
      const newRegion = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      };

      // If we are already centered near this location, animateToRegion might not fire region change.
      // So we can manually check and trigger the geocoding reverse lookup directly.
      const latDiff = Math.abs(region.latitude - newRegion.latitude);
      const lngDiff = Math.abs(region.longitude - newRegion.longitude);
      
      if (latDiff < 0.0001 && lngDiff < 0.0001) {
        await handleRegionChangeComplete(newRegion);
      } else {
        mapRef.current?.animateToRegion(newRegion, 1000);
      }
    } catch (error) {
      console.error('Error centering location:', error);
      setIsLocating(false);
    }
  };

  const jumpToAddress = async (query: string) => {
    setIsSearching(true);
    try {
      const results = await Location.geocodeAsync(query);
      if (results.length === 0) {
        AppAlert.alert('Not Found', `Could not find "${query}". Try a different search.`);
        return;
      }

      const { latitude, longitude } = results[0];
      const newRegion = {
        latitude,
        longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      };

      setIsLocating(true);
      mapRef.current?.animateToRegion(newRegion, 1000);
    } catch (error) {
      console.error('Geocode search error:', error);
      AppAlert.alert('Search Failed', 'Could not search for that location. Please try again.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearch = async () => {
    const query = searchQuery.trim();
    if (!query || isSearching) return;

    Keyboard.dismiss();
    setSuggestions([]);
    await jumpToAddress(query);
  };

  const handleSelectSuggestion = async (suggestion: PlaceSuggestion) => {
    Keyboard.dismiss();
    setSearchQuery(suggestion.description);
    setSuggestions([]);
    await jumpToAddress(suggestion.description);
  };

  useEffect(() => {
    if (suggestionsDebounceRef.current) clearTimeout(suggestionsDebounceRef.current);

    const query = searchQuery.trim();
    if (query.length < 3) {
      setSuggestions([]);
      setIsLoadingSuggestions(false);
      return;
    }

    setIsLoadingSuggestions(true);
    suggestionsDebounceRef.current = setTimeout(async () => {
      try {
        const results = await fetchPlaceSuggestions(query);
        setSuggestions(results);
      } finally {
        setIsLoadingSuggestions(false);
      }
    }, 350);

    return () => {
      if (suggestionsDebounceRef.current) clearTimeout(suggestionsDebounceRef.current);
    };
  }, [searchQuery]);

  const handleConfirm = async () => {
    if (!userId) return;

    try {
      setIsSaving(true);

      const token = await getToken({ template: 'supabase' });
      if (!token) throw new Error('No token');

      const supabase = createClerkSupabaseClient(token);
      const mapUrl = buildGoogleMapsUrl(region);

      console.log('--- SAVING LOCATION ---');
      console.log('Full Address:', address);
      console.log('Map URL:', mapUrl);

      const { data, error } = await supabase
        .from('users')
        .update({
          default_neighborhood: address,
          default_address_url: mapUrl,
        })
        .eq('clerk_id', userId)
        .select();

      if (error) {
        console.error('Error saving location:', error);
      } else {
        console.log('Location saved:', data);
      }

      DeviceEventEmitter.emit('locationSelected', address);
      DeviceEventEmitter.emit('locationUrlSelected', mapUrl);
      router.back();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        initialRegion={INITIAL_REGION}
        onMapReady={handleMapReady}
        onRegionChangeComplete={handleRegionChangeComplete}
        showsUserLocation={true}
        showsMyLocationButton={false}
        showsCompass={false}
      />

      <View style={styles.markerFixed}>
        <View style={styles.markerContainer}>
          <Ionicons name='location' size={40} color={colors.primary} />
          <View style={styles.markerDot} />
        </View>
      </View>

      <SafeAreaView edges={['top']} style={styles.headerOverlay}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name='arrow-back' size={24} color={colors.onSurface} />
          </Pressable>
          <Text style={styles.headerTitle}>Select Location</Text>
          <View style={{ width: 40 }} />
        </View>

        <View style={styles.searchBar}>
          <Ionicons name='search' size={18} color={colors.onSurfaceVariant} />
          <TextInput
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder='Search for an address or city'
            placeholderTextColor={colors.onSurfaceVariant}
            returnKeyType='search'
            onSubmitEditing={handleSearch}
          />
          {isSearching || isLoadingSuggestions ? (
            <ActivityIndicator size='small' color={colors.primary} />
          ) : searchQuery.length > 0 ? (
            <Pressable
              onPress={() => {
                setSearchQuery('');
                setSuggestions([]);
              }}
              hitSlop={8}
            >
              <Ionicons name='close-circle' size={18} color={colors.onSurfaceVariant} />
            </Pressable>
          ) : null}
        </View>

        {suggestions.length > 0 && (
          <View style={styles.suggestionsDropdown}>
            {suggestions.map((suggestion, index) => (
              <Pressable
                key={suggestion.placeId}
                style={({ pressed }) => [
                  styles.suggestionRow,
                  index === suggestions.length - 1 && styles.suggestionRowLast,
                  pressed && styles.suggestionRowPressed,
                ]}
                onPress={() => handleSelectSuggestion(suggestion)}
              >
                <Ionicons name='location-outline' size={16} color={colors.onSurfaceVariant} />
                <Text style={styles.suggestionText} numberOfLines={1}>
                  {suggestion.description}
                </Text>
              </Pressable>
            ))}
          </View>
        )}
      </SafeAreaView>

      <Pressable
        style={[styles.fab, { bottom: insets.bottom + 180 }]}
        onPress={centerOnUser}
      >
        <Ionicons name='locate' size={24} color={colors.onSurface} />
      </Pressable>

      <View
        style={[
          styles.bottomCard,
          { paddingBottom: Math.max(insets.bottom + 16, 16) },
        ]}
      >
        <View style={styles.addressContainer}>
          <Ionicons name='location' size={20} color={colors.onSurfaceVariant} />
          {isLocating ? (
            <ActivityIndicator
              size='small'
              color={colors.primary}
              style={styles.loader}
            />
          ) : (
            <Text style={styles.addressText} numberOfLines={2}>
              {address}
            </Text>
          )}
        </View>

        {permissionDenied ? (
          <Pressable
            style={({ pressed }) => [
              styles.confirmButton,
              pressed && styles.confirmButtonPressed,
            ]}
            onPress={() =>
              canAskAgain ? requestLocationPermission() : Linking.openSettings()
            }
          >
            <Text style={styles.confirmButtonText}>
              {canAskAgain ? 'Enable Location' : 'Open Settings'}
            </Text>
          </Pressable>
        ) : (
          <Pressable
            style={({ pressed }) => [
              styles.confirmButton,
              pressed && styles.confirmButtonPressed,
              (isSaving || isLocating) && { opacity: 0.7 },
            ]}
            onPress={handleConfirm}
            disabled={isSaving || isLocating || address === 'Locating...'}
          >
            {isSaving ? (
              <ActivityIndicator color='#ffffff' />
            ) : (
              <Text style={styles.confirmButtonText}>Confirm Location</Text>
            )}
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  map: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  markerFixed: {
    position: 'absolute',
    left: '50%',
    top: '50%',
    marginLeft: -20,
    marginTop: -40, // offset the marker height to point exactly at the center
    alignItems: 'center',
    justifyContent: 'center',
  },
  markerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  markerDot: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ffffff',
    top: 10,
  },
  headerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: colors.outlineVariant,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontFamily: fontFamily.headlineSm,
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.onSurface,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceContainer,
    borderRadius: 12,
    marginHorizontal: 16,
    marginBottom: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    fontFamily: fontFamily.body,
    fontSize: 14,
    color: colors.onSurface,
    padding: 0,
  },
  suggestionsDropdown: {
    marginHorizontal: 16,
    marginTop: -4,
    marginBottom: 12,
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 6,
    overflow: 'hidden',
  },
  suggestionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.outlineVariant,
  },
  suggestionRowLast: {
    borderBottomWidth: 0,
  },
  suggestionRowPressed: {
    backgroundColor: colors.surfaceContainer,
  },
  suggestionText: {
    flex: 1,
    fontFamily: fontFamily.body,
    fontSize: 13,
    color: colors.onSurface,
  },
  fab: {
    position: 'absolute',
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 5,
  },
  bottomCard: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 10,
  },
  addressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceContainer,
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  addressText: {
    flex: 1,
    marginLeft: 12,
    fontFamily: fontFamily.body,
    fontSize: 14,
    color: colors.onSurface,
    lineHeight: 20,
  },
  loader: {
    marginLeft: 12,
  },
  confirmButton: {
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  confirmButtonPressed: {
    opacity: 0.8,
  },
  confirmButtonText: {
    fontFamily: fontFamily.label,
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
  },
});
