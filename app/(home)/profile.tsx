import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Linking,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth, useUser } from '@clerk/expo';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter, useFocusEffect } from 'expo-router';
import { colors } from '@/constants/theme';
import { fontFamily } from '@/constants/typography';
import { createClerkSupabaseClient } from '@/utils/supabase';

import { ProfileHeader } from '@/components/profile/profile-header';
import { ProfileStats } from '@/components/profile/profile-stats';
import { MenuOption } from '@/components/profile/menu-option';
import { ProfileSkeleton } from '@/components/skeletons/ProfileSkeleton';
import { usePendingRequestsCount } from '@/hooks/usePendingRequestsCount';
import {
  isExpoGo,
  isGrabitPro,
  manageGrabitSubscription,
  presentGrabitPaywall,
  restoreGrabitPurchases,
} from '@/services/revenuecat';
import { AppAlert } from '@/components/ui/AppAlert';

export default function ProfileScreen() {
  const { signOut, getToken, userId } = useAuth();
  const { user } = useUser();
  const router = useRouter();
  const pendingRequestsCount = usePendingRequestsCount();

  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [isPro, setIsPro] = useState(false);
  const [isPaywallBusy, setIsPaywallBusy] = useState(false);

  const getTokenRef = useRef(getToken);
  const userIdRef = useRef(userId);
  const isFetchingRef = useRef(false);

  getTokenRef.current = getToken;
  userIdRef.current = userId;

  const fetchProfile = useCallback(async (isRefresh = false) => {
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;

    try {
      if (!isRefresh) setIsLoading(true);
      const currentUserId = userIdRef.current;
      if (!currentUserId) {
        setIsLoading(false);
        return;
      }

      const token = await getTokenRef.current({ template: 'supabase' });
      if (!token) return;

      const supabase = createClerkSupabaseClient(token);

      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('clerk_id', currentUserId)
        .single();

      if (error) throw error;

      setProfile(data);
    } catch (err) {
      console.error('Error fetching profile:', err);
    } finally {
      isFetchingRef.current = false;
      setIsLoading(false);
    }
  }, []);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await fetchProfile(true);
    setIsRefreshing(false);
  }, [fetchProfile]);

  useFocusEffect(
    useCallback(() => {
      fetchProfile();
      isGrabitPro().then(setIsPro).catch(() => {});
    }, [fetchProfile]),
  );

  const handleUpgrade = useCallback(async () => {
    if (isPaywallBusy) return;
    if (isExpoGo()) {
      AppAlert.alert(
        'Dev build required',
        'Test purchases need an EAS dev build — Expo Go runs RevenueCat in preview mode with no real paywall. Run: eas build --profile development',
      );
      return;
    }
    setIsPaywallBusy(true);
    try {
      const purchased = await presentGrabitPaywall();
      if (purchased) setIsPro(true);
      else setIsPro(await isGrabitPro());
    } catch (err) {
      console.warn('[Pro] paywall failed', err);
      AppAlert.alert('Purchase failed', 'Could not complete the purchase. Try again in a dev build.');
    } finally {
      setIsPaywallBusy(false);
    }
  }, [isPaywallBusy]);

  const handleRestore = useCallback(async () => {
    if (isPaywallBusy) return;
    setIsPaywallBusy(true);
    try {
      const restored = await restoreGrabitPurchases();
      setIsPro(restored);
      if (!restored) AppAlert.alert('No purchases found', 'No Grab It Pro purchase to restore.');
    } finally {
      setIsPaywallBusy(false);
    }
  }, [isPaywallBusy]);

  const handleManage = useCallback(async () => {
    if (isPaywallBusy) return;
    if (isExpoGo()) {
      AppAlert.alert(
        'Dev build required',
        'Subscription management needs an EAS dev build — Expo Go runs RevenueCat in preview mode.',
      );
      return;
    }
    setIsPaywallBusy(true);
    try {
      await manageGrabitSubscription();
      setIsPro(await isGrabitPro());
    } finally {
      setIsPaywallBusy(false);
    }
  }, [isPaywallBusy]);

  const handleProCardPress = isPro ? handleManage : handleUpgrade;

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (err) {
      console.error('Error signing out:', err);
    }
  };

  const handleDeleteAccount = () => {
    AppAlert.alert(
      'Delete Account',
      'Are you absolutely sure you want to delete your account? This action cannot be undone and all your data will be permanently removed.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              setIsLoading(true);
              
              // 1. Soft Delete in Supabase (Anonymize)
              const token = await getTokenRef.current({ template: 'supabase' });
              if (token && profile?.id) {
                const supabase = createClerkSupabaseClient(token);
                await supabase
                  .from('users')
                  .update({ 
                    name: 'Deleted User', 
                    avatar_url: null,
                    email: `deleted_${Date.now()}@example.com`,
                    clerk_id: `deleted_${Date.now()}`
                  })
                  .eq('id', profile.id);
              }

              // 2. Delete Clerk user
              if (user) {
                await user.delete();
              }
              
              // 3. Sign out (Clerk may auto sign out on delete)
              await signOut();
              
            } catch (err) {
              console.error('Error deleting account:', err);
              AppAlert.alert('Error', 'Could not delete your account. Please try again.');
              setIsLoading(false);
            }
          },
        },
      ]
    );
  };

  const displayName = profile?.name || user?.fullName || 'User';
  const avatarUrl =
    profile?.avatar_url ||
    user?.imageUrl ||
    'https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=400&h=400&q=80';
  const bio = profile?.bio || '';

  return (
    <LinearGradient
      colors={['#eef8f5', '#ffffff']}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      style={styles.container}
    >
      <SafeAreaView edges={['top']} style={styles.safeArea}>
        <View style={styles.headerContainer}>
        <Text style={styles.headerTitle}>Give. Grab. Repeat.</Text>
      </View>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor={colors.primaryContainer}
            colors={[colors.primaryContainer]}
          />
        }
      >
        {isLoading ? (
          <ProfileSkeleton />
        ) : (
          <>
            <ProfileHeader
              name={displayName}
              avatarUrl={avatarUrl}
              trustScore={98}
              bio={bio}
              onEditPress={() => router.push('/edit-profile')}
            />

            <ProfileStats
              itemsGiven={profile?.items_given_count || 0}
              itemsReceived={profile?.items_received_count || 0}
            />

            <Pressable
              style={styles.proCard}
              onPress={handleProCardPress}
              disabled={isPaywallBusy}
            >
              <View>
                <Text style={styles.proTitle}>
                  {isPro ? 'Grab It Pro active' : 'Upgrade to Grab It Pro'}
                </Text>
                <Text style={styles.proSubtitle}>
                  {isPro
                    ? 'Extra photos, Reserve claims, Plus badge'
                    : 'Extra photos, Reserve claims, Plus badge — $0.99/mo'}
                </Text>
              </View>
              <Text style={styles.proCta}>{isPro ? 'MANAGE' : 'TRY'}</Text>
            </Pressable>
            {!isPro && (
              <Pressable onPress={handleRestore} disabled={isPaywallBusy} style={styles.restoreRow}>
                <Text style={styles.restoreText}>Restore purchases</Text>
              </Pressable>
            )}

            {/* <Achievements /> */}

            <View style={styles.menuCard}>
              <MenuOption
                icon='list'
                title='My Listings'
                onPress={() => router.push('/my-listings')}
              />
              <MenuOption
                icon='heart-outline'
                title='My Favorites'
                onPress={() => router.push('/my-favorites')}
              />
              <MenuOption
                icon='hand-right-outline'
                title='My Claims'
                onPress={() => router.push('/my-claims')}
              />
              <MenuOption
                icon='notifications-outline'
                title='Requests'
                badge={pendingRequestsCount}
                onPress={() => router.push('/requests')}
              />
              <MenuOption
                icon='create-outline'
                title='Edit Profile'
                onPress={() => router.push('/edit-profile')}
              />
              <MenuOption
                icon='help-circle-outline'
                title='Help & Support'
                onPress={() => Linking.openURL('mailto:anuj846k@gmail.com?subject=GrabIt Support Request')}
              />
              <MenuOption
                icon='shield-checkmark-outline'
                title='Privacy Policy'
                onPress={() => router.push('/privacy')}
              />
              <MenuOption
                icon='log-out-outline'
                title='Log Out'
                onPress={handleLogout}
              />
              <MenuOption
                icon='trash-outline'
                title='Delete Account'
                onPress={handleDeleteAccount}
                destructive
                hideDivider
              />
            </View>
          </>
        )}
      </ScrollView>
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
  headerContainer: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontFamily: fontFamily.display,
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.primary,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 126,
  },
  menuCard: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 2,
    marginBottom: 24,
  },
  proCard: {
    backgroundColor: colors.primary,
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  proTitle: {
    fontFamily: fontFamily.display,
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
  },
  proSubtitle: {
    fontFamily: fontFamily.body,
    fontSize: 12,
    color: 'rgba(255,255,255,0.85)',
    marginTop: 4,
  },
  proCta: {
    fontFamily: fontFamily.label,
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary,
    backgroundColor: '#ffffff',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    overflow: 'hidden',
  },
  restoreRow: {
    alignItems: 'center',
    paddingVertical: 8,
    marginBottom: 12,
  },
  restoreText: {
    fontFamily: fontFamily.body,
    fontSize: 13,
    color: colors.primary,
    fontWeight: '600',
  },
});
