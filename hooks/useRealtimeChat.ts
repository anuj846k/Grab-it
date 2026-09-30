import { useCallback, useEffect, useRef, useState } from 'react'
import { useSupabase } from '@/providers/SupabaseProvider'

export interface ChatMessage {
  id: string
  content: string
  sender_id: string
  createdAt: string
  image_url?: string | null
}

interface UseRealtimeChatProps {
  conversationId: string
  senderId: string
}

export function useRealtimeChat({ conversationId, senderId }: UseRealtimeChatProps) {
  const supabase = useSupabase()
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null)
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const lastTypingBroadcastRef = useRef(0)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isConnected, setIsConnected] = useState(false)
  const [isOtherTyping, setIsOtherTyping] = useState(false)

  useEffect(() => {
    console.log(`[useRealtimeChat] Creating channel for conversation: ${conversationId}, sender: ${senderId}`)
    const channel = supabase.channel(conversationId)
    channelRef.current = channel

    channel
      .on('broadcast', { event: 'message' }, (payload) => {
        const msg = payload.payload as ChatMessage
        console.log(`[useRealtimeChat] Received message from ${msg.sender_id}: ${msg.content.substring(0, 50)}`)
        setMessages((current) => [...current, msg])
      })
      .on('broadcast', { event: 'typing' }, (_payload) => {
        setIsOtherTyping(true)
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current)
        typingTimeoutRef.current = setTimeout(() => setIsOtherTyping(false), 2000)
      })
      .subscribe((status) => {
        console.log(`[useRealtimeChat] Subscribe status: ${status}`)
        if (status === 'SUBSCRIBED') {
          setIsConnected(true)
        } else {
          setIsConnected(false)
        }
      })

    return () => {
      console.log(`[useRealtimeChat] Cleaning up channel: ${conversationId}`)
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current)
      supabase.removeChannel(channel)
      channelRef.current = null
    }
  }, [conversationId, supabase, senderId])

  const sendMessage = useCallback((message: ChatMessage) => {
    const channel = channelRef.current
    if (!channel) {
      console.warn('[useRealtimeChat] Cannot send — channel not ready')
      return
    }

    setMessages((current) => [...current, message])

    channel.send({
      type: 'broadcast',
      event: 'message',
      payload: message,
    })
  }, [])

  const broadcastTyping = useCallback(() => {
    const channel = channelRef.current
    if (!channel) return

    const now = Date.now()
    if (now - lastTypingBroadcastRef.current < 1500) return
    lastTypingBroadcastRef.current = now

    channel.send({
      type: 'broadcast',
      event: 'typing',
      payload: { sender_id: senderId },
    })
  }, [senderId])

  return { messages, sendMessage, broadcastTyping, isConnected, isOtherTyping }
}
