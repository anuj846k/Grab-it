import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  DeviceEventEmitter,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '@/constants/theme';
import { fontFamily } from '@/constants/typography';
import { useRouter } from 'expo-router';
import { useAuth } from '@clerk/expo';
import { createClerkSupabaseClient } from '@/utils/supabase';

export function HomeHeader() {
  const router = useRouter();
  const { getToken, userId } = useAuth();
  const [locationName, setLocationName] = useState('New York');

  useEffect(() => {
    // 1. Fetch initial location from database
    const fetchLocation = async () => {
      if (!userId) return;
      try {
        const token = await getToken({ template: 'supabase' });
        if (!token) return;
        const supabase = createClerkSupabaseClient(token);

        const { data, error } = await supabase
          .from('users')
          .select('default_neighborhood')
          .eq('clerk_id', userId)
          .single();

        if (!error && data?.default_neighborhood) {
          const fullAddress = data.default_neighborhood;
          const parts = fullAddress.split(', ').filter(Boolean);

          const shortName =
            parts.length >= 3
              ? `${parts[0]}, ${parts[parts.length - 2]}`
              : parts[0];

          setLocationName(shortName);
        }
      } catch (err) {
        console.error('Error fetching location from DB:', err);
      }
    };

    fetchLocation();

    // 2. Listen for instantaneous updates from the map screen
    const subscription = DeviceEventEmitter.addListener(
      'locationSelected',
      (newAddress: string) => {
        const parts = newAddress.split(', ');
        const shortName = parts.length > 1 ? parts[parts.length - 2] : parts[0];
        setLocationName(shortName);
      },
    );

    return () => {
      subscription.remove();
    };
  }, [userId, getToken]);

  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        <Pressable
          style={styles.locationContainer}
          onPress={() => router.push('/location')}
        >
          <View style={styles.locationIconCircle}>
            <Ionicons name='location' size={14} color={colors.primary} />
          </View>
          <View style={styles.locationInfo}>
            <Text style={styles.locationLabel}>Location</Text>
            <Text style={styles.locationText} numberOfLines={1}>{locationName}</Text>
          </View>
          <Ionicons
            name='chevron-down'
            size={14}
            color={colors.primary}
            style={{ marginLeft: 2 }}
          />
        </Pressable>
        
        <View style={styles.rightActions}>
          <Pressable style={styles.iconButton}>
            <Ionicons name='search-outline' size={18} color={colors.onSurface} />
          </Pressable>
          <Pressable style={styles.iconButton} onPress={() => router.push('/requests')}>
            <Ionicons name='notifications-outline' size={18} color={colors.onSurface} />
          </Pressable>
        </View>
      </View>
      <Text style={styles.tagline}>Give. Grab. Repeat.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.55)', // Translucent glassmorphic blend
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    maxWidth: '70%',
  },
  locationIconCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(0, 108, 73, 0.06)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  locationInfo: {
    justifyContent: 'center',
  },
  locationLabel: {
    fontFamily: fontFamily.label,
    fontSize: 9,
    fontWeight: 'bold',
    color: colors.outline,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  locationText: {
    fontFamily: fontFamily.body,
    fontSize: 13,
    fontWeight: 'bold',
    color: colors.onSurface,
  },
  rightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.55)', // Translucent glassmorphic blend
    alignItems: 'center',
    justifyContent: 'center',
  },
  tagline: {
    fontFamily: fontFamily.display,
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.onSurface,
  },
});
