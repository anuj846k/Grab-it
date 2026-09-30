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
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '@clerk/expo';

import { colors } from '@/constants/theme';
import { fontFamily } from '@/constants/typography';
import { createClerkSupabaseClient } from '@/utils/supabase';
import { RequestsSkeleton } from '@/components/skeletons/RequestsSkeleton';

interface HistoryClaim {
  id: string;
  listing_id: string;
  status: string;
  created_at: string;
  listing: { title: string; image_urls?: string[] } | null;
  requester: { name: string; avatar_url: string } | null;
}

export default function RequestHistoryScreen() {
  const router = useRouter();
  const { getToken, userId } = useAuth();
  const insets = useSafeAreaInsets();

  const [isLoading, setIsLoading] = useState(true);
  const [claims, setClaims] = useState<HistoryClaim[]>([]);

  const getTokenRef = useRef(getToken);
  const userIdRef = useRef(userId);
  const profileIdRef = useRef<string | null>(null);
  const isFetchingRef = useRef(false);

  getTokenRef.current = getToken;
  userIdRef.current = userId;

  const fetchHistory = useCallback(async () => {
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

      const { data: myListings } = await supabase
        .from('listings')
        .select('id')
        .eq('user_id', profileIdRef.current);

      const listingIds = myListings?.map(l => l.id) || [];

      if (listingIds.length === 0) {
        setClaims([]);
        return;
      }

      const { data } = await supabase
        .from('claims')
        .select(`
          id,
          listing_id,
          status,
          created_at,
          listing:listing_id (
            title,
            image_urls
          ),
          requester:requester_id (
            name,
            avatar_url
          )
        `)
        .in('listing_id', listingIds)
        .in('status', ['accepted', 'rejected'])
        .order('created_at', { ascending: false });

      setClaims((data as any) || []);
    } catch (err) {
      console.error('Error fetching history:', err);
    } finally {
      isFetchingRef.current = false;
      setIsLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchHistory();
    }, [fetchHistory]),
  );

  return (
    <LinearGradient
      colors={['#eef8f5', '#ffffff']}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      style={styles.container}
    >
      <View style={[styles.mainContent, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <Pressable onPress={() => router.navigate('/requests')} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={colors.onSurface} />
          </Pressable>
          <Text style={styles.headerTitle}>Request History</Text>
          <View style={styles.placeholder} />
        </View>

        <View style={{ flex: 1, backgroundColor: 'transparent' }}>
        {isLoading ? (
          <RequestsSkeleton hasActions={false} />
        ) : claims.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="time-outline" size={64} color={colors.onSurfaceVariant} />
            <Text style={styles.emptyTitle}>No History</Text>
            <Text style={styles.emptyText}>
              Accepted and declined requests will appear here.
            </Text>
          </View>
        ) : (
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 126 }]}
          >
            {claims.map((claim) => {
              const isAccepted = claim.status === 'accepted';

              return (
                <View key={claim.id} style={styles.card}>
                  <View style={styles.cardBody}>
                    <View style={styles.requesterRow}>
                      <Image
                        source={{
                          uri: claim.requester?.avatar_url || 'https://via.placeholder.com/40',
                        }}
                        style={styles.avatar}
                      />
                      <View style={styles.requesterInfo}>
                        <Text style={styles.requesterName}>
                          {claim.requester?.name || 'Unknown'}
                        </Text>
                        <Text style={styles.requesterLabel}>wants</Text>
                      </View>
                      <View style={[styles.statusBadge, isAccepted ? styles.statusAccepted : styles.statusRejected]}>
                        <Text style={[styles.statusText, isAccepted ? styles.statusTextAccepted : styles.statusTextRejected]}>
                          {isAccepted ? 'Accepted' : 'Declined'}
                        </Text>
                      </View>
                    </View>
                    <View style={styles.listingRow}>
                      <Image
                        source={{
                          uri: claim.listing?.image_urls?.[0] || 'https://via.placeholder.com/48',
                        }}
                        style={styles.listingThumb}
                      />
                      <Text style={styles.listingTitle} numberOfLines={2}>
                        {claim.listing?.title || 'Unknown item'}
                      </Text>
                    </View>
                  </View>
                </View>
              );
            })}
          </ScrollView>
        )}
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  mainContent: {
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
  requesterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surfaceContainer,
  },
  requesterInfo: {
    flex: 1,
  },
  requesterName: {
    fontFamily: fontFamily.label,
    fontSize: 15,
    fontWeight: '600',
    color: colors.onSurface,
  },
  requesterLabel: {
    fontFamily: fontFamily.body,
    fontSize: 13,
    color: colors.onSurfaceVariant,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusAccepted: {
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
  },
  statusRejected: {
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
  },
  statusText: {
    fontFamily: fontFamily.label,
    fontSize: 9,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  statusTextAccepted: {
    color: '#047857',
  },
  statusTextRejected: {
    color: '#DC2626',
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
  listingTitle: {
    flex: 1,
    fontFamily: fontFamily.display,
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.onSurface,
  },
});
