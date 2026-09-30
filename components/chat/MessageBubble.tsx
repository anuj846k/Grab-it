import React from 'react';
import { View, Text, Pressable, StyleSheet, ActivityIndicator } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/constants/theme';
import { fontFamily } from '@/constants/typography';
import type { Message } from '@/types/chat';

interface MessageBubbleProps {
  item: Message;
  isOwn: boolean;
  showDateSeparator: boolean;
  isLastInGroup: boolean;
  otherPartyAvatar?: string | null;
  onImagePress: (url: string) => void;
  onRetryPress: (clientId: string) => void;
}

function formatTime(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function formatDateSeparator(dateStr: string) {
  const d = new Date(dateStr);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  if (d.toDateString() === today.toDateString()) return 'Today';
  if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
  return d.toLocaleDateString([], {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

export const MessageBubble = React.memo(function MessageBubble({
  item,
  isOwn,
  showDateSeparator,
  isLastInGroup,
  otherPartyAvatar,
  onImagePress,
  onRetryPress,
}: MessageBubbleProps) {
  const isSendingState = item.status === 'sending';
  const isFailedState = item.status === 'failed';
  const isSentState = item.status === 'sent';
  const hasImage = !!item.image_url;
  const hasText = !!item.content;

  return (
    <>
      <View style={[styles.messageRow, isOwn ? styles.ownMessageRow : styles.otherMessageRow]}>
        {/* Other user avatar — only on last in their sequence */}
        {!isOwn && (
          <View style={styles.avatarSlot}>
            {isLastInGroup && otherPartyAvatar ? (
              <Image source={{ uri: otherPartyAvatar }} style={styles.messageAvatar} />
            ) : null}
          </View>
        )}

        <View style={styles.bubbleColumn}>
          <View
            style={[
              styles.bubble,
              isOwn ? styles.ownBubble : styles.otherBubble,
              hasImage && !hasText && styles.imageBubble,
              isSendingState && styles.bubbleSending,
              isFailedState && styles.bubbleFailed,
            ]}
          >
            {hasImage && (
              <Pressable onPress={() => onImagePress(item.image_url!)}>
                <Image source={{ uri: item.image_url! }} style={styles.chatImage} contentFit='cover' />
              </Pressable>
            )}
            {hasText && (
              <Text
                style={[
                  styles.messageText,
                  isOwn ? styles.ownMessageText : styles.otherMessageText,
                  isSendingState && styles.messageTextSending,
                  hasImage && styles.messageTextWithImage,
                ]}
              >
                {item.content}
              </Text>
            )}
          </View>
          {isLastInGroup && (
            <View style={[styles.metaRow, isOwn && styles.metaRowOwn]}>
              <Text style={[styles.timestamp, isOwn && styles.timestampOwn]}>
                {formatTime(item.created_at)}
              </Text>
              {isOwn && isSendingState && (
                <ActivityIndicator size={10} color={colors.onSurfaceVariant} style={styles.statusIcon} />
              )}
              {isOwn && isFailedState && (
                <Pressable onPress={() => onRetryPress(item.clientId!)}>
                  <Ionicons name='alert-circle' size={14} color='#DC2626' />
                </Pressable>
              )}
              {isOwn && isSentState && !item.is_read && (
                <Ionicons name='checkmark' size={14} color={colors.onSurfaceVariant} style={styles.statusIcon} />
              )}
              {isOwn && isSentState && item.is_read && (
                <Ionicons name='checkmark-done' size={14} color='#3B82F6' style={styles.statusIcon} />
              )}
            </View>
          )}
        </View>
      </View>
      {showDateSeparator && (
        <View style={styles.dateSeparator}>
          <View style={styles.dateLine} />
          <Text style={styles.dateText}>{formatDateSeparator(item.created_at)}</Text>
          <View style={styles.dateLine} />
        </View>
      )}
    </>
  );
}, (prev, next) => {
  return (
    prev.item === next.item &&
    prev.isOwn === next.isOwn &&
    prev.showDateSeparator === next.showDateSeparator &&
    prev.isLastInGroup === next.isLastInGroup &&
    prev.otherPartyAvatar === next.otherPartyAvatar
  );
});

export function isSameDay(a: string, b: string) {
  return new Date(a).toDateString() === new Date(b).toDateString();
}

const styles = StyleSheet.create({
  dateSeparator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 16,
    gap: 8,
  },
  dateLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.surfaceContainerHighest,
  },
  dateText: {
    fontFamily: fontFamily.label,
    fontSize: 11,
    color: colors.onSurfaceVariant,
    fontWeight: '600',
  },
  messageRow: {
    marginBottom: 2,
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  ownMessageRow: {
    justifyContent: 'flex-end',
  },
  otherMessageRow: {
    justifyContent: 'flex-start',
  },
  avatarSlot: {
    width: 28,
    marginRight: 6,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  messageAvatar: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: colors.surfaceContainer,
  },
  bubbleColumn: {
    maxWidth: '78%',
    gap: 3,
  },
  bubble: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
  },
  ownBubble: {
    backgroundColor: colors.primary,
    borderBottomRightRadius: 5,
  },
  otherBubble: {
    backgroundColor: colors.surfaceContainerHigh,
    borderBottomLeftRadius: 5,
  },
  messageText: {
    fontFamily: fontFamily.body,
    fontSize: 15,
    lineHeight: 21,
  },
  ownMessageText: {
    color: '#ffffff',
  },
  otherMessageText: {
    color: colors.onSurface,
  },
  timestamp: {
    fontFamily: fontFamily.body,
    fontSize: 10,
    color: colors.onSurfaceVariant,
    alignSelf: 'flex-start',
    marginBottom: 6,
  },
  timestampOwn: {
    alignSelf: 'flex-end',
  },
  bubbleSending: {
    opacity: 0.6,
  },
  bubbleFailed: {
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  messageTextSending: {
    opacity: 0.7,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'flex-start',
    marginBottom: 6,
  },
  metaRowOwn: {
    alignSelf: 'flex-end',
  },
  statusIcon: {
    marginLeft: 2,
  },
  imageBubble: {
    padding: 3,
    overflow: 'hidden',
  },
  chatImage: {
    width: 220,
    height: 180,
    borderRadius: 16,
  },
  messageTextWithImage: {
    paddingHorizontal: 11,
    paddingTop: 6,
    paddingBottom: 2,
  },
});
