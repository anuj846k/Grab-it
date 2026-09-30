import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  ScrollView,
  StyleSheet,
  View,
  Text,
  Pressable,
  Image,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuth } from '@clerk/expo';
import { LinearGradient } from 'expo-linear-gradient';

import { colors } from '@/constants/theme';
import { fontFamily } from '@/constants/typography';
import { createClerkSupabaseClient } from '@/utils/supabase';
import { getTimeAgo } from '@/utils/date';
import { getStateFromNeighborhood } from '@/utils/location';
import { Listing, Category } from '@/types/listing';

import { HomeHeader } from '@/components/home/home-header';
import { CategoryFilter } from '@/components/home/category-filter';
import { HomeFeedSkeleton } from '@/components/skeletons/HomeFeedSkeleton';

const PAGE_SIZE = 4;

export default function HomePage() {
  const router = useRouter();
  const { getToken, userId } = useAuth();
  const insets = useSafeAreaInsets();

  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [recentListings, setRecentListings] = useState<Listing[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<Category>('All');
  const getTokenRef = useRef(getToken);
  const userIdRef = useRef(userId);
  const userProfileIdRef = useRef<string | null>(null);
  const userNeighborhoodRef = useRef<string | null>(null);
  const isFetchingRef = useRef(false);
  const pageRef = useRef(0);
  const hasMoreRef = useRef(true);
  const lastLoadMoreScrollYRef = useRef(0);
  const hasFetchedInitialRef = useRef(false);

  getTokenRef.current = getToken;
  userIdRef.current = userId;

  const fetchListings = useCallback(
    async (pageNum = 0, isLoadMore = false, showFullSkeleton = true) => {
      if (isFetchingRef.current) {
        if (!isLoadMore) {
          isFetchingRef.current = false;
        } else {
          return;
        }
      }

      if (isLoadMore && !hasMoreRef.current) return;

      isFetchingRef.current = true;

      try {
        if (isLoadMore) {
          setIsLoadingMore(true);
        } else if (showFullSkeleton) {
          setIsLoading(true);
        }

        if (!isLoadMore) {
          pageRef.current = 0;
          hasMoreRef.current = true;
          lastLoadMoreScrollYRef.current = 0;
        }

        const token = await getTokenRef.current({ template: 'supabase' });
        if (!token) return;

        const supabase = createClerkSupabaseClient(token);

        if (!userProfileIdRef.current && userIdRef.current) {
          const { data: profile } = await supabase
            .from('users')
            .select('id, default_neighborhood')
            .eq('clerk_id', userIdRef.current)
            .single();
          if (profile) {
            userProfileIdRef.current = profile.id;
            userNeighborhoodRef.current = profile.default_neighborhood;
          }
        }

        const from = pageNum * PAGE_SIZE;
        const to = from + PAGE_SIZE - 1;

        let query = supabase
          .from('listings')
          .select(
            `
          id,
          title,
          image_urls,
          category,
          condition,
          city,
          created_at,
          users (
            name,
            avatar_url
          )
        `,
          )
          .eq('status', 'active');

        if (selectedCategory !== 'All') {
          if (selectedCategory === 'Other') {
            const standardCategories = [
              'Furniture',
              'Electronics',
              'Clothing & Shoes',
              'Books & Media',
              'Home & Kitchen',
              'Plants & Garden',
              'Toys & Games',
            ];
            query = query.not(
              'category',
              'in',
              `(${standardCategories.map((c) => `"${c}"`).join(',')})`,
            );
          } else {
            query = query.eq('category', selectedCategory);
          }
        }

        if (userProfileIdRef.current) {
          query = query.neq('user_id', userProfileIdRef.current);
        }

        if (userNeighborhoodRef.current) {
          const userState = getStateFromNeighborhood(userNeighborhoodRef.current);
          if (userState) {
            query = query.ilike('neighborhood', `%${userState}%`);
          }
        }

        const { data, error } = await query
          .order('created_at', { ascending: false })
          .range(from, to);

        if (error) throw error;

        if (data) {
          const mappedListings: Listing[] = data.map((item: any) => ({
            id: item.id,
            title: item.title,
            imageUrl: item.image_urls?.[0] || 'https://via.placeholder.com/400',
            distance: item.city || 'Nearby',
            price: 'Free',
            category: item.category || 'Other',
            postedAt: getTimeAgo(item.created_at),
            condition: item.condition || 'Good',
            owner: {
              name: item.users?.name || 'Anonymous',
              avatarUrl:
                item.users?.avatar_url || 'https://via.placeholder.com/100',
              rating: 5.0,
              reviewsCount: 0,
            },
          }));

          if (isLoadMore) {
            setRecentListings((prev) => [...prev, ...mappedListings]);
          } else {
            setRecentListings(mappedListings);
          }

          const nextHasMore = data.length === PAGE_SIZE;

          hasMoreRef.current = nextHasMore;
          pageRef.current = pageNum;
        }
      } catch (err) {
        console.error('Error fetching listings:', err);
      } finally {
        isFetchingRef.current = false;
        setIsLoading(false);
        setIsLoadingMore(false);
      }
    },
    [selectedCategory],
  );

  const refreshListings = useCallback(async () => {
    setIsRefreshing(true);
    await fetchListings(0, false, false);
    setIsRefreshing(false);
  }, [fetchListings]);

  const loadMore = useCallback(() => {
    if (!isFetchingRef.current && hasMoreRef.current) {
      fetchListings(pageRef.current + 1, true);
      return true;
    }
    return false;
  }, [fetchListings]);

  const handleScroll = useCallback(
    (event: any) => {
      const { layoutMeasurement, contentOffset, contentSize } =
        event.nativeEvent;
      const paddingToBottom = 100;
      const isCloseToBottom =
        layoutMeasurement.height + contentOffset.y >=
        contentSize.height - paddingToBottom;
      const hasScrolledSinceLastLoad =
        contentOffset.y > lastLoadMoreScrollYRef.current + 24;

      if (isCloseToBottom && hasScrolledSinceLastLoad && loadMore()) {
        lastLoadMoreScrollYRef.current = contentOffset.y;
      }
    },
    [loadMore],
  );

  useEffect(() => {
    fetchListings(0, false);
  }, [selectedCategory, fetchListings]);

  // Split items into 2 columns for masonry layout
  const leftColumn: Listing[] = [];
  const rightColumn: Listing[] = [];

  recentListings.forEach((item, index) => {
    if (index % 2 === 0) {
      leftColumn.push(item);
    } else {
      rightColumn.push(item);
    }
  });

  return (
    <LinearGradient
      colors={['#eef8f5', '#ffffff']}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      style={styles.container}
    >
      <SafeAreaView edges={['top']} style={styles.safeArea}>
        {isLoading ? (
          <HomeFeedSkeleton />
        ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          onScroll={handleScroll}
          scrollEventThrottle={400}
          alwaysBounceVertical
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={refreshListings}
              tintColor={colors.primaryContainer}
              colors={[colors.primaryContainer]}
            />
          }
        >
          <HomeHeader />
          <CategoryFilter
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
          />

          <View style={styles.feedContainer}>
            {recentListings.length === 0 && !isLoading ? (
              <Text style={styles.emptyText}>
                No listings found. Check again later!
              </Text>
            ) : (
              <View style={styles.masonryContainer}>
                {/* Left Column */}
                <View style={styles.column}>
                  {leftColumn.map((listing) => (
                    <Pressable
                      key={listing.id}
                      style={styles.card}
                      onPress={() => router.push(`/item/${listing.id}`)}
                    >
                      <View style={styles.imageWrapper}>
                        <Image
                          source={{ uri: listing.imageUrl }}
                          style={styles.cardImage}
                          resizeMode='cover'
                        />
                        <View style={styles.badge}>
                          <Text style={styles.badgeText}>FREE</Text>
                        </View>
                      </View>
                      <Text style={styles.cardTitle} numberOfLines={1}>
                        {listing.title}
                      </Text>
                      <View style={styles.cardMeta}>
                        <Ionicons
                          name='location-outline'
                          size={12}
                          color={colors.onSurfaceVariant}
                        />
                        <Text style={styles.cardDistance} numberOfLines={1}>
                          {listing.distance}
                        </Text>
                      </View>
                      {listing.owner && (
                        <View style={styles.ownerContainer}>
                          <Image
                            source={{ uri: listing.owner.avatarUrl }}
                            style={styles.ownerAvatar}
                          />
                          <Text style={styles.ownerName} numberOfLines={1}>
                            {listing.owner.name.toUpperCase()}
                          </Text>
                        </View>
                      )}
                    </Pressable>
                  ))}
                </View>

                {/* Right Column */}
                <View style={styles.column}>
                  {rightColumn.map((listing) => (
                    <Pressable
                      key={listing.id}
                      style={styles.card}
                      onPress={() => router.push(`/item/${listing.id}`)}
                    >
                      <View style={styles.imageWrapper}>
                        <Image
                          source={{ uri: listing.imageUrl }}
                          style={styles.cardImage}
                          resizeMode='cover'
                        />
                        <View style={styles.badge}>
                          <Text style={styles.badgeText}>FREE</Text>
                        </View>
                      </View>
                      <Text style={styles.cardTitle} numberOfLines={1}>
                        {listing.title}
                      </Text>
                      <View style={styles.cardMeta}>
                        <Ionicons
                          name='location-outline'
                          size={12}
                          color={colors.onSurfaceVariant}
                        />
                        <Text style={styles.cardDistance} numberOfLines={1}>
                          {listing.distance}
                        </Text>
                      </View>
                      {listing.owner && (
                        <View style={styles.ownerContainer}>
                          <Image
                            source={{ uri: listing.owner.avatarUrl }}
                            style={styles.ownerAvatar}
                          />
                          <Text style={styles.ownerName} numberOfLines={1}>
                            {listing.owner.name.toUpperCase()}
                          </Text>
                        </View>
                      )}
                    </Pressable>
                  ))}
                </View>
              </View>
            )}

            {/* Loading More Indicator */}
            {isLoadingMore && (
              <View style={styles.loadingMoreContainer}>
                <ActivityIndicator
                  size='small'
                  color={colors.primaryContainer}
                  style={styles.spinner}
                />
                <Text style={styles.loadingMoreText}>
                  LOADING MORE TREASURE...
                </Text>
                {/* Skeleton placeholders */}
                <View style={styles.masonryContainer}>
                  <View style={styles.column}>
                    {[1, 2].map((i) => (
                      <View
                        key={`skeleton-left-${i}`}
                        style={styles.skeletonCard}
                      >
                        <View style={styles.skeletonImage} />
                        <View style={styles.skeletonTitle} />
                        <View style={styles.skeletonMeta} />
                      </View>
                    ))}
                  </View>
                  <View style={styles.column}>
                    {[1, 2].map((i) => (
                      <View
                        key={`skeleton-right-${i}`}
                        style={styles.skeletonCard}
                      >
                        <View style={styles.skeletonImage} />
                        <View style={styles.skeletonTitle} />
                        <View style={styles.skeletonMeta} />
                      </View>
                    ))}
                  </View>
                </View>
              </View>
            )}
          </View>
        </ScrollView>
      )}

      {/* Floating Give Away Button */}
      <Pressable
        style={[
          styles.floatingButton,
          { bottom: insets.bottom > 0 ? insets.bottom + 112 : 140 }
        ]}
        onPress={() => router.push('/post')}
      >
        <Ionicons name='add' size={20} color='#ffffff' />
        <Text style={styles.floatingButtonText}>Give Away</Text>
      </Pressable>
      </SafeAreaView>
    </LinearGradient>
  );
}

const GAP = 16;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 16,
    paddingBottom: 206,
  },
  feedContainer: {
    marginTop: 8,
    paddingHorizontal: 16,
  },
  masonryContainer: {
    flexDirection: 'row',
    gap: GAP,
  },
  column: {
    flex: 1,
    gap: GAP,
  },
  card: {
    width: '100%',
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 8,
    shadowColor: colors.inverseSurface,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.04,
    shadowRadius: 16,
    elevation: 2,
    marginBottom: 8,
  },
  imageWrapper: {
    width: '100%',
    aspectRatio: 0.85,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: colors.surfaceContainer,
    position: 'relative',
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  badge: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: colors.primaryContainer,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  badgeText: {
    fontFamily: fontFamily.label,
    fontSize: 10,
    fontWeight: 'bold',
    color: '#ffffff',
    letterSpacing: 1,
  },
  cardTitle: {
    fontFamily: fontFamily.display,
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.onSurface,
    marginTop: 10,
    marginHorizontal: 4,
    marginBottom: 4,
  },
  cardMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginHorizontal: 4,
    marginBottom: 8,
  },
  cardDistance: {
    fontFamily: fontFamily.body,
    fontSize: 12,
    color: colors.onSurfaceVariant,
    flex: 1,
  },
  ownerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginHorizontal: 4,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    paddingTop: 8,
  },
  ownerAvatar: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.surfaceContainer,
  },
  ownerName: {
    fontFamily: fontFamily.label,
    fontSize: 9,
    fontWeight: '700',
    color: colors.onSurfaceVariant,
    flex: 1,
    letterSpacing: 0.5,
  },
  emptyText: {
    fontFamily: fontFamily.body,
    fontSize: 14,
    color: colors.onSurfaceVariant,
    fontStyle: 'italic',
    paddingVertical: 40,
    textAlign: 'center',
  },
  floatingButton: {
    position: 'absolute',
    bottom: 24,
    right: 20,
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 999,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  floatingButtonText: {
    fontFamily: fontFamily.label,
    fontSize: 14,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  loadingMoreContainer: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  spinner: {
    marginBottom: 12,
  },
  loadingMoreText: {
    fontFamily: fontFamily.label,
    fontSize: 12,
    fontWeight: '600',
    color: colors.primaryContainer,
    letterSpacing: 1,
    marginBottom: 16,
  },
  skeletonCard: {
    width: '100%',
    marginBottom: 8,
    opacity: 0.6,
  },
  skeletonImage: {
    width: '100%',
    aspectRatio: 0.85,
    borderRadius: 16,
    backgroundColor: colors.surfaceContainer,
  },
  skeletonTitle: {
    width: '70%',
    height: 16,
    borderRadius: 4,
    backgroundColor: colors.surfaceContainer,
    marginTop: 10,
    marginBottom: 4,
  },
  skeletonMeta: {
    width: '40%',
    height: 14,
    borderRadius: 4,
    backgroundColor: colors.surfaceContainer,
  },
});
