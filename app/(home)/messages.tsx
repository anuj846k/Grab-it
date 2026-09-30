import React, { useCallback, useRef, useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  ScrollView,
  Pressable,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '@clerk/expo';

import { colors } from '@/constants/theme';
import { fontFamily } from '@/constants/typography';
import { getTimeAgo } from '@/utils/date';
import { MessagesSkeleton } from '@/components/skeletons/MessagesSkeleton';
import { useSupabase } from '@/providers/SupabaseProvider';
import * as ChatService from '@/services/chat';
import type { Conversation } from '@/types/chat';

// Extend Conversation to include unread count for local UI state
interface ConversationWithUnread extends Conversation {
  unread_count?: number;
}

export default function MessagesScreen() {
  const router = useRouter();
  const supabase = useSupabase();
  const { userId } = useAuth();

  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [conversations, setConversations] = useState<ConversationWithUnread[]>([]);

  const [profileId, setProfileId] = useState<string | null>(null);
  const profileIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (!userId) return
    ChatService.fetchProfileId(supabase, userId).then((profile) => {
      if (profile) {
        profileIdRef.current = profile.id
        setProfileId(profile.id)
      }
    })
  }, [userId, supabase])

  const fetchConversations = useCallback(async (isRefresh = false) => {
    if (!profileId) {
      setIsLoading(false)
      return
    }

    try {
      if (isRefresh) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }

      const data = await ChatService.fetchConversations(supabase, profileId);

      const formattedData = data.map(conv => ({
        ...conv,
        unread_count: 0,
      }));

      setConversations(formattedData);
    } catch (err) {
      console.error('Error fetching conversations:', err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [supabase, profileId]);

  useFocusEffect(
    useCallback(() => {
      fetchConversations();
    }, [fetchConversations]),
  );

  const renderItem = ({ item }: { item: ConversationWithUnread }) => {
    if (!profileId) return null;

    const isOwner = item.owner_id === profileId;
    const otherParty = isOwner ? item.requester : item.owner;

    return (
      <Pressable
        style={styles.conversationRow}
        onPress={() => router.push(`/chat/${item.id}` as any)}
      >
        <View style={styles.avatarContainer}>
          <Image
            source={{
              uri: otherParty?.avatar_url || 'https://via.placeholder.com/48',
            }}
            style={styles.avatar}
          />
          {item.listing?.image_urls?.[0] && (
            <Image
              source={{ uri: item.listing.image_urls[0] }}
              style={styles.listingThumbBadge}
            />
          )}
        </View>
        <View style={styles.conversationInfo}>
          <View style={styles.topRow}>
            <Text style={styles.partyName} numberOfLines={1}>
              {otherParty?.name || 'Unknown'}
            </Text>
            {item.last_message_at && (
              <Text style={styles.timeAgo}>
                {getTimeAgo(item.last_message_at)}
              </Text>
            )}
          </View>
          <View style={styles.bottomRow}>
            <View style={[styles.roleBadge, isOwner ? styles.roleBadgeOwner : styles.roleBadgeRequester]}>
              <Text style={[styles.roleBadgeText, isOwner ? styles.roleBadgeTextOwner : styles.roleBadgeTextRequester]}>
                {isOwner ? 'My Listing' : 'My Request'}
              </Text>
            </View>
            <Text style={styles.listingLabel} numberOfLines={1}>
              {item.listing?.title || 'Unknown item'}
            </Text>
          </View>
          {item.last_message_text && (
            <Text style={styles.lastMessage} numberOfLines={1}>
              {item.last_message_text}
            </Text>
          )}
        </View>
        {item.status === 'archived' && (
          <View style={styles.archivedBadge}>
            <Ionicons name="lock-closed" size={12} color={colors.onSurfaceVariant} />
          </View>
        )}
        {item.unread_count ? (
          <View style={styles.unreadBadge}>
            <Text style={styles.unreadBadgeText}>
              {item.unread_count > 99 ? '99+' : item.unread_count}
            </Text>
          </View>
        ) : null}
      </Pressable>
    );
  };

  if (isLoading) {
    return (
      <LinearGradient
        colors={['#eef8f5', '#ffffff']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={styles.container}
      >
        <SafeAreaView edges={['top']} style={styles.safeArea}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Messages</Text>
          </View>
          <MessagesSkeleton />
        </SafeAreaView>
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
      <SafeAreaView edges={['top']} style={styles.safeArea}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Messages</Text>
        </View>

      {conversations.length === 0 ? (
        <ScrollView
          contentContainerStyle={styles.flex}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={() => fetchConversations(true)}
              tintColor={colors.primaryContainer}
            />
          }
        >
          <View style={styles.emptyContainer}>
            <Ionicons name="chatbubbles-outline" size={64} color={colors.onSurfaceVariant} />
            <Text style={styles.emptyTitle}>No Messages</Text>
            <Text style={styles.emptyText}>
              When a claim is accepted, a conversation will appear here.
            </Text>
          </View>
        </ScrollView>
      ) : (
        <FlatList
          data={conversations}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={() => fetchConversations(true)}
              tintColor={colors.primaryContainer}
            />
          }
        />
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
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'transparent',
  },
  headerTitle: {
    fontFamily: fontFamily.display,
    fontSize: 28,
    color: colors.onSurface,
  },
  flex: {
    flex: 1,
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
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 126,
  },
  conversationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 12,
    gap: 12,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.surfaceContainer,
  },
  listingThumbBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: colors.surface,
    backgroundColor: colors.surfaceContainer,
  },
  conversationInfo: {
    flex: 1,
    gap: 2,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  partyName: {
    fontFamily: fontFamily.label,
    fontSize: 16,
    fontWeight: '600',
    color: colors.onSurface,
    flex: 1,
  },
  timeAgo: {
    fontFamily: fontFamily.body,
    fontSize: 12,
    color: colors.onSurfaceVariant,
    marginLeft: 8,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  listingLabel: {
    fontFamily: fontFamily.body,
    fontSize: 13,
    color: colors.primary,
    flex: 1,
  },
  lastMessage: {
    fontFamily: fontFamily.body,
    fontSize: 14,
    color: colors.onSurfaceVariant,
    marginTop: 2,
  },
  roleBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  roleBadgeOwner: {
    backgroundColor: colors.primaryContainer,
  },
  roleBadgeRequester: {
    backgroundColor: colors.surfaceContainerHigh,
  },
  roleBadgeText: {
    fontFamily: fontFamily.label,
    fontSize: 10,
    fontWeight: '600',
  },
  roleBadgeTextOwner: {
    color: colors.onPrimaryContainer,
  },
  roleBadgeTextRequester: {
    color: colors.onSurface,
  },
  archivedBadge: {
    padding: 4,
  },
  unreadBadge: {
    backgroundColor: '#FF3B30',
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
    marginLeft: 8,
  },
  unreadBadgeText: {
    fontFamily: fontFamily.label,
    fontSize: 12,
    color: '#ffffff',
    fontWeight: '700',
  },
});

