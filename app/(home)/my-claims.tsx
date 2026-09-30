import React, { useCallback, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  ActivityIndicator,
  Image,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';
import { useAuth } from '@clerk/expo';

import { colors } from '@/constants/theme';
import { fontFamily } from '@/constants/typography';
import { createClerkSupabaseClient } from '@/utils/supabase';
import { LinearGradient } from 'expo-linear-gradient';
import { useBackNavigation } from '@/hooks/useBackNavigation';
import { ListingsSkeleton } from '@/components/skeletons/ListingsSkeleton';

interface MyClaim {
  id: string;
  listing_id: string;
  status: string;
  created_at: string;
  listing: {
    title: string;
    image_urls?: string[];
    status: string;
    neighborhood?: string;
    location_url?: string;
    city?: string;
    owner: { name: string; avatar_url: string } | null;
  } | null;
}

const STATUS_CONFIG = {
  pending: { label: 'Pending', icon: 'time-outline' as const, bg: 'rgba(251, 191, 36, 0.12)', text: '#B45309' },
  accepted: { label: 'Accepted', icon: 'checkmark-circle' as const, bg: 'rgba(16, 185, 129, 0.12)', text: '#047857' },
  rejected: { label: 'Declined', icon: 'close-circle' as const, bg: 'rgba(239, 68, 68, 0.12)', text: '#DC2626' },
} as const;

export default function MyClaimsScreen() {
  const router = useRouter();
  const goBack = useBackNavigation('/(home)/profile');
  const { getToken, userId } = useAuth();
  const insets = useSafeAreaInsets();

  const [isLoading, setIsLoading] = useState(true);
  const [claims, setClaims] = useState<MyClaim[]>([]);
  const [filter, setFilter] = useState<string | null>(null);

  const getTokenRef = useRef(getToken);
  const userIdRef = useRef(userId);
  const profileIdRef = useRef<string | null>(null);
  const isFetchingRef = useRef(false);

  getTokenRef.current = getToken;
  userIdRef.current = userId;

  const fetchClaims = useCallback(async () => {
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;

    try {
      setIsLoading(true);
      const token = await getTokenRef.current({ template: 'supabase' });
      if (!token) return;

      const supabase = createClerkSupabaseClient(token);

      if (!profileIdRef.current && userIdRef.current) {
        const { data: profile } = await supabase
          .from('users')
          .select('id')
          .eq('clerk_id', userIdRef.current)
          .single();
        if (profile) {
          profileIdRef.current = profile.id;
        }
      }

      if (!profileIdRef.current) return;

      const { data } = await supabase
        .from('claims')
        .select(`
          id,
          listing_id,
          status,
          created_at,
          listing:listing_id (
            title,
            image_urls,
            status,
            neighborhood,
            location_url,
            city,
            owner:user_id (
              name,
              avatar_url
            )
          )
        `)
        .eq('requester_id', profileIdRef.current)
        .order('created_at', { ascending: false });

      setClaims((data as any) || []);
    } catch (err) {
      console.error('Error fetching my claims:', err);
    } finally {
      isFetchingRef.current = false;
      setIsLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchClaims();
    }, [fetchClaims]),
  );

  const filteredClaims = filter ? claims.filter((c) => c.status === filter) : claims;

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
        <Text style={styles.headerTitle}>My Claims</Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.filterRow}>
        {[
          { key: null, label: 'All' },
          { key: 'pending', label: 'Pending' },
          { key: 'accepted', label: 'Accepted' },
          { key: 'rejected', label: 'Declined' },
        ].map((f) => {
          const isSelected = filter === f.key;
          const gradientColors = (isSelected 
            ? ['#008b5e', '#006c49'] 
            : ['#ffffff', '#e6f4ee']) as [string, string];

          return (
            <Pressable
              key={f.key || 'all'}
              onPress={() => setFilter(f.key)}
              style={styles.filterChipWrapper}
            >
              <LinearGradient
                colors={gradientColors}
                start={{ x: 0, y: 0 }}
                end={{ x: 0, y: 1 }}
                style={styles.filterChip}
              >
                <Text style={[
                  styles.filterChipText,
                  isSelected ? styles.filterChipTextActive : styles.filterChipTextInactive
                ]}>
                  {f.label}
                </Text>
              </LinearGradient>
            </Pressable>
          );
        })}
      </View>

      {isLoading ? (
        <ListingsSkeleton hasActions={false} />
      ) : filteredClaims.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="hand-right-outline" size={64} color={colors.onSurfaceVariant} />
          <Text style={styles.emptyTitle}>No Claims Yet</Text>
          <Text style={styles.emptyText}>
            {filter
              ? `No ${filter} claims.`
              : 'Items you claim from others will appear here.'}
          </Text>
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 126 }]}
        >
          {filteredClaims.map((claim) => {
            const cfg = STATUS_CONFIG[claim.status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.pending;

            return (
              <View key={claim.id} style={styles.card}>
                <View style={styles.cardBody}>
                  <View style={styles.listingRow}>
                    <Image
                      source={{
                        uri: claim.listing?.image_urls?.[0] || 'https://via.placeholder.com/48',
                      }}
                      style={styles.listingThumb}
                    />
                    <View style={styles.listingInfo}>
                      <Text style={styles.listingTitle} numberOfLines={1}>
                        {claim.listing?.title || 'Unknown item'}
                      </Text>
                      {claim.listing?.owner && (
                        <View style={styles.ownerRow}>
                          <Image
                            source={{
                              uri: claim.listing.owner.avatar_url || 'https://via.placeholder.com/20',
                            }}
                            style={styles.ownerAvatar}
                          />
                          <Text style={styles.ownerName} numberOfLines={1}>
                            {claim.listing.owner.name}
                          </Text>
                        </View>
                      )}
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: cfg.bg }]}>
                      <Ionicons name={cfg.icon} size={14} color={cfg.text} />
                      <Text style={[styles.statusText, { color: cfg.text }]}>{cfg.label}</Text>
                    </View>
                  </View>

                  {claim.status === 'accepted' && (
                    <View style={styles.pickupInfo}>
                      <Ionicons name="location-outline" size={16} color={colors.primary} />
                      <Text style={styles.pickupText}>
                        {claim.listing?.neighborhood || claim.listing?.city || 'Location shared with you'}
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            );
          })}
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
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'transparent',
    gap: 8,
  },
  filterChipWrapper: {
    borderRadius: 999,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 4,
    elevation: 1,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterChipText: {
    fontFamily: fontFamily.label,
    fontSize: 13,
    fontWeight: '600',
  },
  filterChipTextActive: {
    color: colors.onPrimary,
  },
  filterChipTextInactive: {
    color: colors.onSurface,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
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
    lineHeight: 20,
  },
  scrollContent: {
    padding: 16,
    gap: 12,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: colors.inverseSurface,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.04,
    shadowRadius: 16,
    elevation: 2,
  },
  cardBody: {
    padding: 16,
    gap: 12,
  },
  listingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  listingThumb: {
    width: 64,
    height: 64,
    borderRadius: 12,
    backgroundColor: colors.surfaceContainer,
  },
  listingInfo: {
    flex: 1,
    gap: 4,
  },
  listingTitle: {
    fontFamily: fontFamily.display,
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.onSurface,
  },
  ownerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  ownerAvatar: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: colors.surfaceContainer,
  },
  ownerName: {
    fontFamily: fontFamily.body,
    fontSize: 13,
    color: colors.onSurfaceVariant,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontFamily: fontFamily.label,
    fontSize: 9,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  pickupInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  pickupText: {
    fontFamily: fontFamily.body,
    fontSize: 13,
    color: colors.primary,
    flex: 1,
  },
});
