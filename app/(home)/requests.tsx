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
import { useBackNavigation } from '@/hooks/useBackNavigation';
import { fontFamily } from '@/constants/typography';
import { createClerkSupabaseClient } from '@/utils/supabase';
import { RequestsSkeleton } from '@/components/skeletons/RequestsSkeleton';
import { AppAlert } from '@/components/ui/AppAlert';

interface PendingClaim {
  id: string;
  listing_id: string;
  requester_id: string;
  status: string;
  created_at: string;
  listing: { title: string; image_urls?: string[] } | null;
  requester: { name: string; avatar_url: string } | null;
}

export default function RequestsScreen() {
  const router = useRouter();
  const goBack = useBackNavigation('/(home)/profile');
  const { getToken, userId } = useAuth();
  const insets = useSafeAreaInsets();

  const [isLoading, setIsLoading] = useState(true);
  const [claims, setClaims] = useState<PendingClaim[]>([]);
  const [processingAction, setProcessingAction] = useState<Record<string, 'accept' | 'reject'>>({});

  const getTokenRef = useRef(getToken);
  const userIdRef = useRef(userId);
  const profileIdRef = useRef<string | null>(null);
  const isFetchingRef = useRef(false);

  getTokenRef.current = getToken;
  userIdRef.current = userId;

  const fetchRequests = useCallback(async () => {
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
          requester_id,
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
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      setClaims((data as any) || []);
    } catch (err) {
      console.error('Error fetching requests:', err);
    } finally {
      isFetchingRef.current = false;
      setIsLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchRequests();
    }, [fetchRequests]),
  );

  const handleAccept = async (claim: PendingClaim) => {
    setProcessingAction((prev) => ({ ...prev, [claim.id]: 'accept' }));

    try {
      const token = await getTokenRef.current({ template: 'supabase' });
      if (!token) return;

      const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
      const res = await fetch(
        `${supabaseUrl}/functions/v1/accept-claim`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ claim_id: claim.id }),
        },
      );

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'Failed to accept request');
      }

      const { conversation_id } = await res.json();

      setClaims((prev) => prev.filter((c) => c.id !== claim.id));

      AppAlert.alert('Accepted', `You accepted "${claim.listing?.title || 'this item'}". Chat is now open.`, [
        {
          text: 'Open Chat',
          onPress: () => router.push(`/chat/${conversation_id}` as any),
        },
        { text: 'OK', style: 'cancel' },
      ]);
    } catch (err) {
      console.error('Error accepting claim:', err);
      AppAlert.alert('Error', 'Failed to accept this request.');
    } finally {
      setProcessingAction((prev) => {
        const next = { ...prev };
        delete next[claim.id];
        return next;
      });
    }
  };

  const handleReject = async (claim: PendingClaim) => {
    setProcessingAction((prev) => ({ ...prev, [claim.id]: 'reject' }));

    try {
      const token = await getTokenRef.current({ template: 'supabase' });
      if (!token) return;

      const supabase = createClerkSupabaseClient(token);

      const { error } = await supabase
        .from('claims')
        .update({ status: 'rejected' })
        .eq('id', claim.id);

      if (error) throw error;

      setClaims((prev) => prev.filter((c) => c.id !== claim.id));
    } catch (err) {
      console.error('Error rejecting claim:', err);
      AppAlert.alert('Error', 'Failed to reject this request.');
    } finally {
      setProcessingAction((prev) => {
        const next = { ...prev };
        delete next[claim.id];
        return next;
      });
    }
  };

  return (
    <LinearGradient
      colors={['#eef8f5', '#ffffff']}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      style={styles.container}
    >
      <View style={[styles.mainContent, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <Pressable onPress={goBack} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={colors.onSurface} />
          </Pressable>
          <Text style={styles.headerTitle}>Requests</Text>
          <Pressable onPress={() => router.push('/request-history')} style={styles.historyButton}>
            <Ionicons name="time-outline" size={22} color={colors.onSurfaceVariant} />
          </Pressable>
        </View>

        <View style={{ flex: 1, backgroundColor: 'transparent' }}>
        {isLoading ? (
          <RequestsSkeleton hasActions={true} />
        ) : claims.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="chatbubbles-outline" size={64} color={colors.onSurfaceVariant} />
            <Text style={styles.emptyTitle}>No Requests</Text>
            <Text style={styles.emptyText}>
              When someone claims your item, you&apos;ll see it here.
            </Text>
          </View>
        ) : (
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 126 }]}
          >
            {claims.map((claim) => {
              const action = processingAction[claim.id];

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

                  <View style={styles.actions}>
                      <Pressable
                        style={[styles.actionButton, styles.rejectButton]}
                        onPress={() => handleReject(claim)}
                        disabled={!!action}
                      >
                        {action === 'reject' ? (
                          <ActivityIndicator size="small" color="#DC2626" />
                        ) : (
                          <Text style={styles.rejectButtonText}>Decline</Text>
                        )}
                      </Pressable>
                      <Pressable
                        style={[styles.actionButton, styles.acceptButton]}
                        onPress={() => handleAccept(claim)}
                        disabled={!!action}
                      >
                        {action === 'accept' ? (
                          <ActivityIndicator size="small" color={colors.primary} />
                        ) : (
                          <Text style={styles.acceptButtonText}>Accept</Text>
                        )}
                      </Pressable>
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
  historyButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
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
  actions: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
  },
  rejectButton: {
    backgroundColor: 'rgba(220, 38, 38, 0.08)',
  },
  rejectButtonText: {
    fontFamily: fontFamily.label,
    fontSize: 12,
    fontWeight: '700',
    color: '#DC2626',
  },
  acceptButton: {
    backgroundColor: 'rgba(0, 108, 73, 0.08)',
  },
  acceptButtonText: {
    fontFamily: fontFamily.label,
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary,
  },
});
