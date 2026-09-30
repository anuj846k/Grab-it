import React from 'react';
import { View, Text, Pressable, StyleSheet, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/constants/theme';
import { fontFamily } from '@/constants/typography';
import { useChatContext } from '@/providers/ChatProvider';

interface ChatHeaderProps {
  onBack: () => void;
}

export function ChatHeader({ onBack }: ChatHeaderProps) {
  const { conversation, otherParty, handleOptions } = useChatContext();

  return (
    <View style={styles.header}>
      <Pressable onPress={onBack} style={styles.backButton}>
        <Ionicons name='arrow-back' size={24} color={colors.onSurface} />
      </Pressable>

      {otherParty?.avatar_url ? (
        <Image
          source={{ uri: otherParty.avatar_url }}
          style={styles.headerAvatar}
        />
      ) : (
        <View style={styles.headerAvatarPlaceholder}>
          <Text style={styles.headerAvatarInitial}>
            {otherParty?.name?.charAt(0)?.toUpperCase() ?? '?'}
          </Text>
        </View>
      )}

      <View style={styles.headerInfo}>
        <Text style={styles.headerPartyName} numberOfLines={1}>
          {otherParty?.name || 'Unknown'}
        </Text>
        <Text style={styles.headerListingTitle} numberOfLines={1}>
          {conversation?.listing?.title || 'Unknown item'}
        </Text>
      </View>

      <Pressable onPress={handleOptions} style={styles.optionsButton}>
        <Ionicons
          name='ellipsis-vertical'
          size={20}
          color={colors.onSurface}
        />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.surfaceContainer,
    backgroundColor: colors.surface,
    gap: 8,
  },
  backButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.surfaceContainer,
  },
  headerAvatarPlaceholder: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.primaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerAvatarInitial: {
    fontFamily: fontFamily.label,
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  optionsButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerInfo: {
    flex: 1,
  },
  headerPartyName: {
    fontFamily: fontFamily.label,
    fontSize: 15,
    fontWeight: '700',
    color: colors.onSurface,
  },
  headerListingTitle: {
    fontFamily: fontFamily.body,
    fontSize: 11,
    color: colors.primary,
    marginTop: 1,
  },
});
