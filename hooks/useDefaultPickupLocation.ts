import { useEffect, useState } from 'react';
import { DeviceEventEmitter } from 'react-native';

import {
  DEFAULT_PICKUP_LOCATION,
  getCityFromNeighborhood,
  normalizePickupLocation,
} from '@/utils/location';
import { createClerkSupabaseClient } from '@/utils/supabase';

interface UseDefaultPickupLocationParams {
  getToken: (options: { template: string }) => Promise<string | null>;
  userId?: string | null;
}

export function useDefaultPickupLocation({
  getToken,
  userId,
}: UseDefaultPickupLocationParams) {
  const [neighborhood, setNeighborhood] = useState(DEFAULT_PICKUP_LOCATION);
  const [locationUrl, setLocationUrl] = useState<string | null>(null);

  useEffect(() => {
    const fetchDefaultLocation = async () => {
      if (!userId) return;

      try {
        const token = await getToken({ template: 'supabase' });
        if (!token) return;

        const supabase = createClerkSupabaseClient(token);
        const { data, error } = await supabase
          .from('users')
          .select('default_neighborhood, default_address_url')
          .eq('clerk_id', userId)
          .single();

        if (error) {
          console.error('Error fetching default location:', error);
          return;
        }

        const savedNeighborhood = normalizePickupLocation(
          data?.default_neighborhood,
        );

        if (savedNeighborhood) {
          setNeighborhood(savedNeighborhood);
        } else {
          setNeighborhood(DEFAULT_PICKUP_LOCATION);
        }

        if (data?.default_address_url) {
          setLocationUrl(data.default_address_url);
        }
      } catch (err) {
        console.error('Error loading default location:', err);
      }
    };

    fetchDefaultLocation();

    const locationSubscription = DeviceEventEmitter.addListener(
      'locationSelected',
      (newAddress: string) => {
        setNeighborhood(newAddress);
      },
    );

    const urlSubscription = DeviceEventEmitter.addListener(
      'locationUrlSelected',
      (newLocationUrl: string) => {
        setLocationUrl(newLocationUrl);
      },
    );

    return () => {
      locationSubscription.remove();
      urlSubscription.remove();
    };
  }, [getToken, userId]);

  return {
    city: getCityFromNeighborhood(neighborhood),
    locationUrl,
    neighborhood,
  };
}
