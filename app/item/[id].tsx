import React, { useState, useEffect, useRef } from 'react';
import { View, ScrollView, StyleSheet, Text, Alert, Animated, Pressable } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useAuth } from '@clerk/expo';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '@/constants/theme';
import { fontFamily } from '@/constants/typography';

import { createClerkSupabaseClient } from '@/utils/supabase';
import { getTimeAgo } from '@/utils/date';
import { normalizeImageUrls } from '@/utils/image-urls';
import { Listing } from '@/types/listing';
import { FEATURED_LISTINGS, RECENT_LISTINGS, NEARBY_LISTINGS } from '@/utils/demo-data';

import { ItemImageHeader } from '@/components/item/item-image-header';
import { ItemInfoHeader } from '@/components/item/item-info-header';
import { OwnerProfile } from '@/components/item/owner-profile';
import { ItemDescription } from '@/components/item/item-description';
import { ItemLocation } from '@/components/item/item-location';
import { ItemAvailability } from '@/components/item/item-availability';
import { BottomActionBar } from '@/components/item/bottom-action-bar';
import { ItemDetailsSkeleton } from '@/components/skeletons/ItemDetailsSkeleton';

export default function ItemDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { getToken, userId } = useAuth();
  const insets = useSafeAreaInsets();

  const [isLoading, setIsLoading] = useState(true);
  const [listing, setListing] = useState<Listing | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isOwner, setIsOwner] = useState(false);
  const [isClaiming, setIsClaiming] = useState(false);
  const [claimStatus, setClaimStatus] = useState<string | null>(null);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [isFavorited, setIsFavorited] = useState(false);
  const [isTogglingFavorite, setIsTogglingFavorite] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [isReporting, setIsReporting] = useState(false);
  
  const toastAnim = useRef(new Animated.Value(-100)).current;

  const showSuccessToast = () => {
    setTimeout(() => {
      setShowToast(true);
      Animated.sequence([
        Animated.timing(toastAnim, {
          toValue: insets.top + 10,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.delay(3000),
        Animated.timing(toastAnim, {
          toValue: -100,
          duration: 300,
          useNativeDriver: true,
        })
      ]).start(() => {
        setShowToast(false);
      });
    }, 600);
  };

  const getTokenRef = useRef(getToken);
  const userIdRef = useRef(userId);
  getTokenRef.current = getToken;
  userIdRef.current = userId;

  useEffect(() => {
    if (!id) return;

    if (id.startsWith('item-')) {
      const allDemoListings = [...FEATURED_LISTINGS, ...RECENT_LISTINGS, ...NEARBY_LISTINGS];
      const found = allDemoListings.find(l => l.id === id);
      if (found) {
        setListing(found);
      } else {
        setError('Item not found.');
      }
      setIsLoading(false);
      return;
    }

    const fetchListing = async () => {
      try {
        setIsLoading(true);
        const token = await getTokenRef.current({ template: 'supabase' });
        if (!token) {
          setError('Authentication error');
          return;
        }

        const supabase = createClerkSupabaseClient(token);

        const { data, error: fetchError } = await supabase
          .from('listings')
          .select(`
            *,
            users (
              name,
              avatar_url
            )
          `)
          .eq('id', id)
          .single();

        if (fetchError) throw fetchError;

        if (data) {
          const imageUrls = normalizeImageUrls(data.image_urls);
          const mappedListing: Listing = {
            id: data.id,
            title: data.title,
            imageUrl: imageUrls[0],
            imageUrls,
            distance: data.city || 'Nearby',
            price: 'Free',
            category: data.category || 'Other',
            description: data.description,
            postedAt: getTimeAgo(data.created_at),
            condition: data.condition || 'Good',
            owner: {
              name: data.users?.name || 'Anonymous',
              avatarUrl: data.users?.avatar_url || 'https://via.placeholder.com/100',
              rating: 5.0,
              reviewsCount: 0,
            },
            pickupLocation: {
              text: 'Pickup details hidden until claimed',
              neighborhood:
                data.neighborhood || data.city || 'Unknown Location',
              locationUrl: data.location_url,
            }
          };
          setListing(mappedListing);

          const currentUserId = userIdRef.current;
          if (currentUserId) {
            const { data: profile } = await supabase
              .from('users')
              .select('id')
              .eq('clerk_id', currentUserId)
              .single();

            if (profile) {
              if (data.user_id === profile.id) {
                setIsOwner(true);
              } else {
                const { data: existingClaim } = await supabase
                  .from('claims')
                  .select('status')
                  .eq('listing_id', id)
                  .eq('requester_id', profile.id)
                  .maybeSingle();

                if (existingClaim) {
                  setClaimStatus(existingClaim.status);
                }

                // Check if there's an existing accepted conversation
                const { data: conv } = await supabase
                  .from('conversations')
                  .select('id')
                  .eq('listing_id', id)
                  .or(`owner_id.eq.${profile.id},requester_id.eq.${profile.id}`)
                  .eq('status', 'active')
                  .maybeSingle();

                if (conv) {
                  setConversationId(conv.id);
                }

                // Check if favorited
                const { data: favorite } = await supabase
                  .from('favorites')
                  .select('id')
                  .eq('listing_id', id)
                  .eq('user_id', profile.id)
                  .maybeSingle();

                if (favorite) {
                  setIsFavorited(true);
                }
              }
            }
          }
        } else {
          setError('Item not found.');
        }
      } catch (err: any) {
        console.error('Error fetching listing details:', err);
        setError('Failed to load item details.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchListing();
  }, [id]);

  const handleClaim = async () => {
    if (!id || isClaiming) return;

    try {
      setIsClaiming(true);
      const token = await getTokenRef.current({ template: 'supabase' });
      if (!token) return;

      const supabase = createClerkSupabaseClient(token);

      const { data: profile } = await supabase
        .from('users')
        .select('id')
        .eq('clerk_id', userIdRef.current)
        .single();

      if (!profile) {
        Alert.alert('Error', 'Could not verify your account.');
        return;
      }

      const { error: claimError } = await supabase
        .from('claims')
        .insert({
          listing_id: id,
          requester_id: profile.id,
          status: 'pending',
        });

      if (claimError) {
        if (claimError.code === '23505') {
          Alert.alert('Already Requested', 'You have already requested this item.');
        } else {
          throw claimError;
        }
        return;
      }

      setClaimStatus('pending');
      router.push({
        pathname: '/item/claim-success',
        params: { listingId: id, conversationId: conversationId || undefined }
      });
    } catch (err: any) {
      console.error('Error claiming item:', err);
      Alert.alert('Error', 'Failed to request this item. Please try again.');
    } finally {
      setIsClaiming(false);
    }
  };

  const handleToggleFavorite = async () => {
    if (!userIdRef.current) {
      router.push('/(auth)/sign-in');
      return;
    }

    if (isTogglingFavorite) return;
    setIsTogglingFavorite(true);

    try {
      const token = await getTokenRef.current({ template: 'supabase' });
      if (!token) return;
      const supabase = createClerkSupabaseClient(token);

      const { data: profile } = await supabase
        .from('users')
        .select('id')
        .eq('clerk_id', userIdRef.current)
        .single();

      if (!profile) return;

      if (isFavorited) {
        await supabase
          .from('favorites')
          .delete()
          .eq('user_id', profile.id)
          .eq('listing_id', id);
        setIsFavorited(false);
      } else {
        await supabase
          .from('favorites')
          .insert({
            user_id: profile.id,
            listing_id: id,
          });
        setIsFavorited(true);
        showSuccessToast();
      }
    } catch (err) {
      console.error('Error toggling favorite:', err);
      Alert.alert('Error', 'Could not update favorites. Please try again.');
    } finally {
      setIsTogglingFavorite(false);
    }
  };

  const handleReport = () => {
    if (!userIdRef.current) {
      router.push('/(auth)/sign-in');
      return;
    }

    if (isOwner) {
      Alert.alert('Cannot Report', 'You cannot report your own listing.');
      return;
    }

    Alert.alert(
      'Report Listing',
      'Why are you reporting this listing?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Spam', onPress: () => submitReport('Spam') },
        { text: 'Inappropriate Content', onPress: () => submitReport('Inappropriate Content') },
        { text: 'Scam', style: 'destructive', onPress: () => submitReport('Scam') },
      ],
      { cancelable: true }
    );
  };

  const submitReport = async (reason: string) => {
    if (isReporting) return;
    setIsReporting(true);

    try {
      const token = await getTokenRef.current({ template: 'supabase' });
      if (!token) return;
      const supabase = createClerkSupabaseClient(token);

      const { data: profile } = await supabase
        .from('users')
        .select('id')
        .eq('clerk_id', userIdRef.current)
        .single();

      if (!profile) return;

      const { data: listingData } = await supabase
        .from('listings')
        .select('user_id')
        .eq('id', id)
        .single();

      const { error } = await supabase.from('reports').insert({
        reporter_id: profile.id,
        reported_user_id: listingData?.user_id || null,
        listing_id: id,
        reason: reason,
      });

      if (error) throw error;

      Alert.alert('Report Submitted', 'Thank you. Our team will review this listing shortly.');
    } catch (err) {
      console.error('Error reporting listing:', err);
      Alert.alert('Error', 'Could not submit report. Please try again later.');
    } finally {
      setIsReporting(false);
    }
  };

  if (isLoading) {
    return (
      <LinearGradient
        colors={['#eef8f5', '#ffffff']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={styles.container}
      >
        <ItemDetailsSkeleton />
      </LinearGradient>
    );
  }

  if (error || !listing) {
    return (
      <LinearGradient
        colors={['#eef8f5', '#ffffff']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={styles.container}
      >
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error || 'Could not load listing.'}</Text>
        </View>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient
      colors={['#eef8f5', '#ffffff']}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      style={styles.container}
    >
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <ItemImageHeader 
          imageUrls={listing.imageUrls || [listing.imageUrl]} 
          isFavorited={isFavorited}
          onToggleFavorite={handleToggleFavorite}
          onReport={!isOwner ? handleReport : undefined}
        />
        
        <ItemInfoHeader 
          title={listing.title}
          price={listing.price}
          distance={listing.distance}
          postedAt={listing.postedAt}
        />
        
        {listing.owner && (
          <OwnerProfile owner={listing.owner} />
        )}

        <ItemDescription 
          description={listing.description || 'No description provided.'}
          tags={listing.tags}
        />

        {listing.pickupLocation && (
          <ItemLocation
            locationText={listing.pickupLocation.neighborhood}
            locationUrl={listing.pickupLocation.locationUrl}
          />
        )}

        {listing.availability && (
          <ItemAvailability availability={listing.availability} />
        )}
      </ScrollView>

      {!isOwner && (
        <BottomActionBar 
          onMessage={() => {
            if (conversationId) {
              router.push(`/chat/${conversationId}` as any);
            } else {
              console.log('Message pressed');
            }
          }}
          onClaim={handleClaim}
          claimStatus={claimStatus}
          isClaiming={isClaiming}
          conversationId={conversationId}
        />
      )}

      {showToast && (
        <Animated.View style={[styles.toastContainer, { transform: [{ translateY: toastAnim }] }]}>
          <Pressable style={styles.toastContent} onPress={() => router.push('/my-favorites')}>
            <Ionicons name="heart" size={20} color="#FF3B30" />
            <Text style={styles.toastText}>Added to Favorites. Tap to view.</Text>
          </Pressable>
        </Animated.View>
      )}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: '#666',
  },
  toastContainer: {
    position: 'absolute',
    left: 20,
    right: 20,
    zIndex: 100,
  },
  toastContent: {
    backgroundColor: '#333333',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  toastText: {
    fontFamily: fontFamily.body,
    fontSize: 14,
    color: '#ffffff',
    fontWeight: '600',
  }
});
