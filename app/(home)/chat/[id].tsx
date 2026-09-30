import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  LayoutAnimation,
  Pressable,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

import { colors } from '@/constants/theme';
import { fontFamily } from '@/constants/typography';
import { useBackNavigation } from '@/hooks/useBackNavigation';
import { ChatProvider, useChatContext } from '@/providers/ChatProvider';
import { ChatHeader } from '@/components/chat/ChatHeader';
import { MessageList } from '@/components/chat/MessageList';
import { MessageInputBar } from '@/components/chat/MessageInputBar';
import { ImageViewer } from '@/components/chat/ImageViewer';

function ChatScreenContent() {
  const { isLoading, conversation, messages } = useChatContext();
  const goBack = useBackNavigation('/(home)/messages');
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [viewerImage, setViewerImage] = useState<string | null>(null);
  const insets = useSafeAreaInsets();

  // Listen to keyboard show/hide to manually drive bottom offset on Android.
  useEffect(() => {
    if (Platform.OS !== 'android') return;
    const show = Keyboard.addListener('keyboardDidShow', (e) => {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setKeyboardHeight(e.endCoordinates.height);
    });
    const hide = Keyboard.addListener('keyboardDidHide', () => {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setKeyboardHeight(0);
    });
    return () => {
      show.remove();
      hide.remove();
    };
  }, []);

  if (isLoading) {
    return (
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <SafeAreaView edges={['top']} style={styles.safeArea}>
          <View style={styles.headerSkeleton}>
            <View style={styles.backButton}>
              <Ionicons name='arrow-back' size={24} color={colors.onSurface} />
            </View>
            <View style={styles.headerInfoSkeleton}>
              <View style={styles.skeletonBar1} />
              <View style={styles.skeletonBar2} />
            </View>
          </View>
        </SafeAreaView>

        <View style={styles.flex}>
          <View style={styles.messagesListSkeleton}>
            <View style={[styles.messageRow, styles.otherMessageRow]}>
              <View style={[styles.bubble, styles.otherBubble, styles.skeletonBubble1]} />
            </View>
            <View style={[styles.messageRow, styles.ownMessageRow]}>
              <View style={[styles.bubble, styles.ownBubble, styles.skeletonBubble2]} />
            </View>
            <View style={[styles.messageRow, styles.otherMessageRow]}>
              <View style={[styles.bubble, styles.otherBubble, styles.skeletonBubble3]} />
            </View>
          </View>

          <View style={[styles.inputBarSkeleton, { paddingBottom: insets.bottom || 12 }]} />
        </View>
      </KeyboardAvoidingView>
    );
  }

  if (!conversation) {
    return (
      <SafeAreaView edges={['top']} style={styles.container}>
        <View style={styles.headerSkeleton}>
          <Pressable onPress={goBack} style={styles.backButton}>
            <Ionicons name='arrow-back' size={24} color={colors.onSurface} />
          </Pressable>
          <Text style={styles.headerPartyName}>Conversation not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <SafeAreaView edges={['top']} style={styles.safeArea}>
        <ChatHeader onBack={goBack} />
      </SafeAreaView>

      <View style={styles.flex}>
        {messages.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="chatbubbles-outline" size={48} color={colors.onSurfaceVariant} />
            <Text style={styles.emptyText}>No messages yet. Start the conversation!</Text>
          </View>
        ) : (
          <MessageList onImagePress={setViewerImage} />
        )}
        <MessageInputBar keyboardHeight={keyboardHeight} />
        {Platform.OS === 'android' && (
          <View style={{ height: keyboardHeight > 0 ? keyboardHeight + 8 : 0 }} />
        )}
      </View>
      <ImageViewer
        visible={!!viewerImage}
        imageUrl={viewerImage || ''}
        onClose={() => setViewerImage(null)}
      />
    </KeyboardAvoidingView>
  );
}

export default function ChatScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  if (!id) return null;

  return (
    <LinearGradient
      colors={['#eef8f5', '#ffffff']}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      style={{ flex: 1 }}
    >
      <ChatProvider conversationId={id}>
        <ChatScreenContent />
      </ChatProvider>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  safeArea: {
    backgroundColor: 'transparent',
  },
  flex: {
    flex: 1,
  },
  backButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerPartyName: {
    fontFamily: fontFamily.label,
    fontSize: 15,
    fontWeight: '700',
    color: colors.onSurface,
  },
  // Skeleton styles
  headerSkeleton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.surfaceContainer,
    backgroundColor: 'transparent',
    gap: 8,
  },
  headerInfoSkeleton: {
    flex: 1,
  },
  skeletonBar1: {
    width: 120,
    height: 16,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    marginBottom: 6,
  },
  skeletonBar2: {
    width: 180,
    height: 12,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
  },
  messagesListSkeleton: {
    flex: 1,
    padding: 16,
    justifyContent: 'flex-end',
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
  skeletonBubble1: {
    width: 200,
    height: 40,
    backgroundColor: '#E5E7EB',
  },
  skeletonBubble2: {
    width: 150,
    height: 40,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  skeletonBubble3: {
    width: 240,
    height: 60,
    backgroundColor: '#E5E7EB',
  },
  inputBarSkeleton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: colors.surfaceContainer,
    backgroundColor: 'transparent',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    gap: 12,
  },
  emptyText: {
    fontFamily: fontFamily.body,
    fontSize: 14,
    color: colors.onSurfaceVariant,
    textAlign: 'center',
    lineHeight: 20,
  },
});
