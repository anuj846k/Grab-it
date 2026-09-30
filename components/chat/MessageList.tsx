import React from 'react';
import { FlatList, StyleSheet } from 'react-native';
import { useChatContext } from '@/providers/ChatProvider';
import { TypingIndicator } from './TypingIndicator';
import { MessageBubble, isSameDay } from './MessageBubble';
import type { Message } from '@/types/chat';

interface MessageListProps {
  onImagePress: (url: string) => void;
}

type DecoratedMessage = Message & {
  showDateSeparator: boolean;
  isLastInGroup: boolean;
};

export function MessageList({ onImagePress }: MessageListProps) {
  const { messages, isOtherTyping, profileId, otherParty, retryMessage } = useChatContext();

  // Pre-calculate date separators and group indicators so that the renderItem function 
  // reference doesn't have to change on every message update.
  const reversedMessages = React.useMemo(() => {
    const decorated = messages.map((item, index) => {
      const olderMessage = messages[index - 1];
      const showDateSeparator = !olderMessage || !isSameDay(olderMessage.created_at, item.created_at);

      const newerMessage = messages[index + 1];
      const isLastInGroup = !newerMessage || newerMessage.sender_id !== item.sender_id;

      return {
        ...item,
        showDateSeparator,
        isLastInGroup,
      };
    });
    return [...decorated].reverse();
  }, [messages]);

  const renderMessage = React.useCallback(({ item }: { item: DecoratedMessage }) => {
    const isOwn = item.sender_id === profileId;
    return (
      <MessageBubble
        item={item}
        isOwn={isOwn}
        showDateSeparator={item.showDateSeparator}
        isLastInGroup={item.isLastInGroup}
        otherPartyAvatar={otherParty?.avatar_url}
        onImagePress={onImagePress}
        onRetryPress={retryMessage}
      />
    );
  }, [profileId, otherParty, onImagePress, retryMessage]);

  const keyExtractor = React.useCallback((item: DecoratedMessage) => item.id, []);

  return (
    <FlatList
      data={reversedMessages}
      keyExtractor={keyExtractor}
      renderItem={renderMessage}
      contentContainerStyle={styles.messagesList}
      inverted={true}
      showsVerticalScrollIndicator={false}
      initialNumToRender={15}
      maxToRenderPerBatch={10}
      windowSize={5} // Keep memory small to avoid OOM and keep WebSockets alive
      removeClippedSubviews={true}
      ListHeaderComponent={<TypingIndicator visible={isOtherTyping} />}
    />
  );
}

const styles = StyleSheet.create({
  messagesList: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    flexGrow: 1,
  },
});
