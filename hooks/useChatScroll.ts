import { useEffect, useRef } from 'react';
import { FlatList } from 'react-native';

export function useChatScroll(messages: unknown[]) {
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages.length]);

  return { flatListRef };
}
