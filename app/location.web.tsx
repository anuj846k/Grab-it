import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ActivityIndicator,
  TextInput,
  DeviceEventEmitter,
} from 'react-native';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuth } from '@clerk/expo';

import { colors } from '@/constants/theme';
import { fontFamily } from '@/constants/typography';
import { normalizePickupLocation } from '@/utils/location';
import { createClerkSupabaseClient } from '@/utils/supabase';

const buildGoogleMapsUrlForAddress = (addressString: string) =>
  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(addressString)}`;

export default function LocationSelectorScreenWeb() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { getToken, isLoaded, userId } = useAuth();

  const [address, setAddress] = useState<string>('');
  const [isLocating, setIsLocating] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  // Fetch initial location from database
  useEffect(() => {
    if (!isLoaded) return;

    (async () => {
      try {
        if (userId) {
          const token = await getToken({ template: 'supabase' });

          if (token) {
            const supabase = createClerkSupabaseClient(token);
            const { data, error } = await supabase
              .from('users')
              .select('default_neighborhood')
              .eq('clerk_id', userId)
              .single();

            if (error) {
              console.error('Error loading saved location:', error);
            }

            if (data?.default_neighborhood) {
              setAddress(normalizePickupLocation(data.default_neighborhood) || '');
            }
          }
        }
      } catch (error) {
        console.error('Error getting location:', error);
      } finally {
        setIsLocating(false);
      }
    })();
  }, [getToken, isLoaded, userId]);

  const handleConfirm = async () => {
    if (!userId || !address.trim()) return;

    try {
      setIsSaving(true);

      const token = await getToken({ template: 'supabase' });
      if (!token) throw new Error('No token');

      const supabase = createClerkSupabaseClient(token);
      const mapUrl = buildGoogleMapsUrlForAddress(address);

      const { error } = await supabase
        .from('users')
        .update({
          default_neighborhood: address,
          default_address_url: mapUrl,
        })
        .eq('clerk_id', userId);

      if (error) {
        console.error('Error saving location:', error);
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
      <SafeAreaView edges={['top']} style={styles.headerOverlay}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name='arrow-back' size={24} color={colors.onSurface} />
          </Pressable>
          <Text style={styles.headerTitle}>Select Location</Text>
          <View style={{ width: 40 }} />
        </View>
      </SafeAreaView>

      <View style={[styles.content, { paddingTop: insets.top + 80 }]}>
        <Text style={styles.label}>Your Neighborhood or Address</Text>
        <TextInput
          style={styles.input}
          value={address}
          onChangeText={setAddress}
          placeholder={isLocating ? "Loading saved location..." : "e.g., Sector 62, Noida"}
          placeholderTextColor={colors.onSurfaceVariant}
          editable={!isLocating && !isSaving}
        />

        <Pressable
          style={({ pressed }) => [
            styles.confirmButton,
            pressed && styles.confirmButtonPressed,
            (isSaving || isLocating || !address.trim()) && { opacity: 0.7 },
          ]}
          onPress={handleConfirm}
          disabled={isSaving || isLocating || !address.trim()}
        >
          {isSaving ? (
            <ActivityIndicator color='#ffffff' />
          ) : (
            <Text style={styles.confirmButtonText}>Confirm Location</Text>
          )}
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  headerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: colors.outlineVariant,
    zIndex: 10,
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
  content: {
    paddingHorizontal: 24,
    gap: 16,
  },
  label: {
    fontFamily: fontFamily.label,
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.onSurface,
  },
  input: {
    fontFamily: fontFamily.body,
    fontSize: 16,
    color: colors.onSurface,
    backgroundColor: colors.surfaceContainer,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
  },
  confirmButton: {
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
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
