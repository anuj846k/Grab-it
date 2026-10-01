import React, { createContext, useContext, useEffect, useState, useCallback, useMemo, PropsWithChildren } from 'react';
import { useAuth } from '@clerk/expo';
import { useSupabase } from '@/utils/supabase';
import { useRealtimeChat } from '@/hooks/useRealtimeChat';
import type { Conversation, Message } from '@/types/chat';
import * as ChatService from '@/services/chat';
import { AppAlert } from '@/components/ui/AppAlert';

interface ChatContextValue {
  conversationId: string;
  conversation: Conversation | null;
  messages: Message[];
  profileId: string | null;
  isLoading: boolean;
  isSending: boolean;
  isRetrying: boolean;
  isBlocked: boolean;
  isReporting: boolean;
  isOtherTyping: boolean;
  otherParty: { id: string; name?: string; avatar_url?: string } | null;
  
  sendMessage: (text: string, imageOverride?: { uri: string; base64: string; mimeType: string }) => Promise<void>;
  retryMessage: (clientId: string) => Promise<void>;
  broadcastTyping: () => void;
  reportUser: (reason: string) => Promise<void>;
  blockUser: () => Promise<void>;
  unblockUser: () => Promise<void>;
  handleOptions: () => void;
}

const ChatContext = createContext<ChatContextValue | null>(null);

export function ChatProvider({ children, conversationId }: PropsWithChildren<{ conversationId: string }>) {
  const { userId } = useAuth();
  const supabase = useSupabase();

  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [isBlocked, setIsBlocked] = useState(false);
  const [isReporting, setIsReporting] = useState(false);

  const [profileId, setProfileId] = useState<string | null>(null);
  const [dbMessages, setDbMessages] = useState<Message[]>([]);

  const isArchived = conversation?.status === 'archived';

  const { messages: realtimeMessages, sendMessage: sendRealtimeMessage, broadcastTyping: sendTyping, isOtherTyping: otherIsTyping } = useRealtimeChat({
    conversationId,
    senderId: profileId || 'pending',
  });

  const messages = useMemo<Message[]>(() => {
    const broadcastMessages = realtimeMessages.map((msg) => ({
      id: msg.id,
      conversation_id: conversationId,
      sender_id: msg.sender_id,
      content: msg.content,
      image_url: msg.image_url || null,
      is_read: true,
      created_at: msg.createdAt,
    }))
    const seen = new Set<string>()
    const all = [...dbMessages, ...broadcastMessages]
    return all.filter((msg) => {
      if (seen.has(msg.id)) return false
      seen.add(msg.id)
      return true
    })
  }, [dbMessages, realtimeMessages, conversationId])

  useEffect(() => {
    let active = true
    setIsLoading(true)

    const initChat = async () => {
      try {
        let realProfileId = ''

        if (userId) {
          const profile = await ChatService.fetchProfileId(supabase, userId)
          if (profile && active) {
            realProfileId = profile.id
            setProfileId(realProfileId)
          }
        }

        if (!active || !realProfileId) return

        const [conv, msgs] = await Promise.all([
          ChatService.fetchConversation(supabase, conversationId),
          ChatService.fetchMessages(supabase, conversationId),
        ])

        if (!active) return

        if (conv) {
          setConversation(conv)
        }

        if (msgs) {
          setDbMessages(msgs)
        }

        const otherPartyId = conv
          ? (conv.owner_id === realProfileId ? conv.requester_id : conv.owner_id)
          : null

        if (otherPartyId) {
          const blocked = await ChatService.checkIfBlocked(supabase, realProfileId, otherPartyId)
          setIsBlocked(blocked)
        }
      } catch (err) {
        console.error('[ChatProvider]', err)
      } finally {
        if (active) setIsLoading(false)
      }
    }

    initChat()
  }, [conversationId, userId, supabase])

  const getOtherParty = () => {
    if (!conversation || !profileId) return null;
    const party = conversation.owner_id === profileId ? conversation.requester : conversation.owner;
    return party || null;
  };
  const otherParty = getOtherParty();

  // 2. Action: Send Message
  const sendMessage = useCallback(async (text: string, imageOverride?: { uri: string; base64: string; mimeType: string }) => {
    const trimmed = text.trim();
    if ((!trimmed && !imageOverride) || isSending || isArchived || !profileId) return;

    setIsSending(true);

    try {
      let imageUrl: string | null = null

      if (imageOverride) {
        imageUrl = await ChatService.uploadChatImage(supabase, imageOverride.uri, conversationId, imageOverride.mimeType)
      }

      const persisted = await ChatService.insertMessage(supabase, conversationId, profileId, trimmed, imageUrl)
      if (persisted) {
        sendRealtimeMessage({
          id: persisted.id,
          content: persisted.content,
          sender_id: persisted.sender_id,
          createdAt: persisted.created_at,
          image_url: persisted.image_url,
        })
      }
    } catch (e) {
      console.error('[ChatProvider] Failed to send message', e)
    }

    setIsSending(false);
  }, [isSending, isArchived, profileId, supabase, conversationId, sendRealtimeMessage]);

  const retryMessage = async (clientId: string) => {
    // No-op in demo mode
  };

  const broadcastTyping = useCallback(() => {
    sendTyping()
  }, [sendTyping]);

  // 4. DB-backed Block, Unblock, and Report Actions
  const reportUser = async (reason: string) => {
    if (!profileId || !otherParty || isReporting) return;
    setIsReporting(true);
    try {
      const ok = await ChatService.reportUser(supabase, profileId, otherParty.id, reason);
      if (!ok) throw new Error('Failed to report user');
      AppAlert.alert('Report Submitted', 'Thank you. Our team will review this user shortly.');
    } catch (err) {
      console.error('Error reporting user:', err);
      AppAlert.alert('Error', 'Could not submit report. Please try again later.');
    } finally {
      setIsReporting(false);
    }
  };

  const blockUser = async () => {
    if (!profileId || !otherParty) return;
    try {
      const ok = await ChatService.blockUser(supabase, profileId, otherParty.id);
      if (!ok) throw new Error('Failed to block user');
      setIsBlocked(true);
      AppAlert.alert('User Blocked', 'You will no longer receive messages from this user.');
    } catch (err) {
      console.error('Error blocking user:', err);
      AppAlert.alert('Error', 'Could not block user. Please try again later.');
    }
  };

  const unblockUser = async () => {
    if (!profileId || !otherParty) return;
    try {
      const ok = await ChatService.unblockUser(supabase, profileId, otherParty.id);
      if (!ok) throw new Error('Failed to unblock user');
      setIsBlocked(false);
      AppAlert.alert('User Unblocked', 'You can now exchange messages with this user.');
    } catch (err) {
      console.error('Error unblocking user:', err);
      AppAlert.alert('Error', 'Could not unblock user. Please try again later.');
    }
  };

  const handleOptions = () => {
    if (isBlocked) {
      AppAlert.alert(
        'Options',
        'What would you like to do?',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Unblock User', onPress: unblockUser },
        ],
        { cancelable: true },
      );
      return;
    }

    AppAlert.alert(
      'Options',
      'What would you like to do?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Report User', 
          onPress: () => {
            AppAlert.alert(
              'Report User',
              'Why are you reporting this user?',
              [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Spam', onPress: () => reportUser('Spam') },
                { text: 'Inappropriate Content', onPress: () => reportUser('Inappropriate Content') },
                { text: 'Scam', style: 'destructive', onPress: () => reportUser('Scam') },
              ],
              { cancelable: true },
            );
          }
        },
        { text: 'Block User', style: 'destructive', onPress: blockUser },
      ],
      { cancelable: true },
    );
  };

  const value: ChatContextValue = {
    conversationId,
    conversation,
    messages,
    profileId,
    isLoading,
    isSending,
    isRetrying: false,
    isBlocked,
    isReporting,
    isOtherTyping: otherIsTyping,
    otherParty,
    sendMessage,
    retryMessage,
    broadcastTyping,
    reportUser,
    blockUser,
    unblockUser,
    handleOptions,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}

export const useChatContext = () => {
  const context = useContext(ChatContext);
  if (!context) throw new Error('useChatContext must be used within a ChatProvider');
  return context;
};
