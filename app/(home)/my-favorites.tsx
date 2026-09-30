import React, { useState, useCallback, useRef } from 'react';
import {
  ScrollView,
  StyleSheet,
  View,
  Text,
  Pressable,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '@clerk/expo';

import { colors } from '@/constants/theme';
import { fontFamily } from '@/constants/typography';
import { createClerkSupabaseClient } from '@/utils/supabase';
import { Listing } from '@/types/listing';
import { useBackNavigation } from '@/hooks/useBackNavigation';
import { ListingsSkeleton } from '@/components/skeletons/ListingsSkeleton';

interface FavoriteListing extends Listing {
  status: 'active' | 'available' | 'claimed' | 'pending';
}

export default function MyFavoritesScreen() {
  const router = useRouter();
  const goBack = useBackNavigation('/(home)/profile');
  const { getToken, userId } = useAuth();
  const insets = useSafeAreaInsets();

  const [isLoading, setIsLoading] = useState(true);
  const [listings, setListings] = useState<FavoriteListing[]>([]);
  const getTokenRef = useRef(getToken);
  const userIdRef = useRef(userId);
  const isFetchingRef = useRef(false);

  getTokenRef.current = getToken;
  userIdRef.current = userId;

  const fetchMyFavorites = useCallback(async () => {
    if (isFetchingRef.current) {
      return;
    }

    isFetchingRef.current = true;

    try {
      setIsLoading(true);

      const currentUserId = userIdRef.current;

      if (!currentUserId) {
        setListings([]);
        return;
      }

      const token = await getTokenRef.current({ template: 'supabase' });
      if (!token) return;

      const supabase = createClerkSupabaseClient(token);

      const { data: userProfile, error: profileError } = await supabase
        .from('users')
        .select('id')
        .eq('clerk_id', currentUserId)
        .single();

      if (profileError || !userProfile) {
        throw profileError || new Error('User profile not found');
      }

      const { data, error } = await supabase
        .from('favorites')
        .select(`
          created_at,
          listings (
            id,
            title,
            image_urls,
            category,
            condition,
            city,
            status
          )
        `)
        .eq('user_id', userProfile.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (data) {
        const mappedListings: FavoriteListing[] = data
          .map((item: any) => item.listings)
          .filter(Boolean)
          .map((item: any) => ({
            id: item.id,
            title: item.title,
            imageUrl: item.image_urls?.[0] || 'https://via.placeholder.com/400',
            distance: item.city || 'Nearby',
            price: 'Free',
            category: item.category || 'Other',
            condition: item.condition || 'Good',
            status: item.status || 'available',
          }));

        setListings(mappedListings);
      }
    } catch (err) {
      console.error('Error fetching favorites:', err);
      Alert.alert('Error', 'Failed to load your favorites');
    } finally {
      isFetchingRef.current = false;
      setIsLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchMyFavorites();
    }, [fetchMyFavorites])
  );

  const getStatusBadgeStyle = (status: string) => {
    switch (status) {
      case 'claimed':
        return styles.statusClaimed;
      case 'pending':
        return styles.statusPending;
      default:
        return styles.statusAvailable;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'claimed':
        return 'Claimed';
      case 'pending':
        return 'Pending';
      case 'active':
      case 'available':
        return 'Available';
      default:
        return 'Available';
    }
  };

  const getStatusTextStyle = (status: string) => {
    switch (status) {
      case 'claimed':
        return styles.statusTextClaimed;
      case 'pending':
        return styles.statusTextPending;
      default:
        return styles.statusTextAvailable;
    }
  };

  return (
    <LinearGradient
      colors={['#eef8f5', '#ffffff']}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      style={styles.container}
    >
      <SafeAreaView edges={['top']} style={styles.safeArea}>
        <View style={styles.header}>
        <Pressable onPress={goBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.onSurface} />
        </Pressable>
        <Text style={styles.headerTitle}>My Favorites</Text>
        <View style={styles.placeholder} />
      </View>

      {isLoading ? (
        <ListingsSkeleton hasActions={false} />
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 126 }]}
        >
          {listings.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons
                name="heart-outline"
                size={64}
                color={colors.onSurfaceVariant}
              />
              <Text style={styles.emptyTitle}>No Favorites Yet</Text>
              <Text style={styles.emptyText}>
                Tap the heart icon on listings to save them here
              </Text>
              <Pressable
                style={styles.createButton}
                onPress={() => router.push('/')}
              >
                <Text style={styles.createButtonText}>Browse Listings</Text>
              </Pressable>
            </View>
          ) : (
            <View style={styles.listingsContainer}>
              {listings.map((listing) => (
                <View key={listing.id} style={styles.listingCard}>
                  <Pressable
                    style={styles.cardContent}
                    onPress={() => router.push(`/item/${listing.id}`)}
                  >
                    <Image
                      source={{ uri: listing.imageUrl }}
                      style={styles.listingImage}
                      resizeMode="cover"
                    />
                    <View style={styles.listingInfo}>
                      <View style={styles.titleRow}>
                        <Text
                          style={styles.listingTitle}
                          numberOfLines={1}
                        >
                          {listing.title}
                        </Text>
                        <View
                          style={[
                            styles.statusBadge,
                            getStatusBadgeStyle(listing.status),
                          ]}
                        >
                          <Text style={[styles.statusText, getStatusTextStyle(listing.status)]}>
                            {getStatusText(listing.status)}
                          </Text>
                        </View>
                      </View>
                      <Text style={styles.listingCategory}>
                        {listing.category} • {listing.condition}
                      </Text>
                    </View>
                  </Pressable>
                </View>
              ))}
            </View>
          )}
        </ScrollView>
      )}
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'transparent',
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontFamily: fontFamily.display,
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.onSurface,
  },
  placeholder: {
    width: 40,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 116,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontFamily: fontFamily.display,
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.onSurface,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontFamily: fontFamily.body,
    fontSize: 14,
    color: colors.onSurfaceVariant,
    textAlign: 'center',
    marginBottom: 24,
  },
  createButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 999,
  },
  createButtonText: {
    fontFamily: fontFamily.label,
    fontSize: 14,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  listingsContainer: {
    gap: 16,
  },
  listingCard: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: colors.inverseSurface,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.04,
    shadowRadius: 16,
    elevation: 2,
    marginBottom: 16,
    padding: 12,
  },
  cardContent: {
    flexDirection: 'row',
  },
  listingImage: {
    width: 90,
    height: 90,
    borderRadius: 16,
    backgroundColor: colors.surfaceContainer,
  },
  listingInfo: {
    flex: 1,
    marginLeft: 16,
    justifyContent: 'center',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  listingTitle: {
    fontFamily: fontFamily.display,
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.onSurface,
    flex: 1,
    marginRight: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusAvailable: {
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
  },
  statusPending: {
    backgroundColor: 'rgba(251, 191, 36, 0.12)',
  },
  statusClaimed: {
    backgroundColor: 'rgba(107, 114, 128, 0.12)',
  },
  statusText: {
    fontFamily: fontFamily.label,
    fontSize: 9,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  statusTextAvailable: {
    color: '#047857',
  },
  statusTextPending: {
    color: '#B45309',
  },
  statusTextClaimed: {
    color: '#4B5563',
  },
  listingCategory: {
    fontFamily: fontFamily.body,
    fontSize: 13,
    color: colors.onSurfaceVariant,
  },
});
