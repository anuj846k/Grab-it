import { readAsStringAsync } from 'expo-file-system/legacy'
import { decode } from 'base64-arraybuffer'
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Conversation, Message } from '@/types/chat';

export async function fetchProfileId(
  supabase: SupabaseClient,
  clerkId: string,
) {
  const { data, error } = await supabase
    .from('users')
    .select('id')
    .eq('clerk_id', clerkId)
    .single();
  if (error) return null;
  return data as { id: string };
}

export async function checkIfBlocked(
  supabase: SupabaseClient,
  blockerId: string,
  blockedId: string,
) {
  const { data } = await supabase
    .from('blocks')
    .select('id')
    .eq('blocker_id', blockerId)
    .eq('blocked_id', blockedId)
    .single();
  return !!data;
}

export async function blockUser(
  supabase: SupabaseClient,
  blockerId: string,
  blockedId: string,
) {
  const { error } = await supabase.from('blocks').insert({
    blocker_id: blockerId,
    blocked_id: blockedId,
  });
  return !error;
}

export async function unblockUser(
  supabase: SupabaseClient,
  blockerId: string,
  blockedId: string,
) {
  const { error } = await supabase
    .from('blocks')
    .delete()
    .eq('blocker_id', blockerId)
    .eq('blocked_id', blockedId);
  return !error;
}

export async function reportUser(
  supabase: SupabaseClient,
  reporterId: string,
  reportedUserId: string,
  reason: string,
) {
  const { error } = await supabase.from('reports').insert({
    reporter_id: reporterId,
    reported_user_id: reportedUserId,
    reason,
  });
  return !error;
}

export async function uploadChatImage(
  supabase: SupabaseClient,
  uri: string,
  conversationId: string,
  mimeType: string = 'image/jpeg',
) {
  const ext = mimeType.split('/')[1] || 'jpg'
  const fileName = `${conversationId}/${Date.now()}.${ext}`
  const base64 = await readAsStringAsync(uri, { encoding: 'base64' })
  const arrayBuffer = decode(base64)
  const { data, error } = await supabase.storage
    .from('chat-images')
    .upload(fileName, arrayBuffer, { contentType: mimeType, upsert: true })
  if (error) {
    console.error(error)
    return null
  }
  const { data: urlData } = supabase.storage.from('chat-images').getPublicUrl(data.path)
  return urlData.publicUrl
}

export async function insertMessage(
  supabase: SupabaseClient,
  conversationId: string,
  senderId: string,
  content: string,
  imageUrl?: string | null,
) {
  const { data, error } = await supabase
    .from('messages')
    .insert({
      conversation_id: conversationId,
      sender_id: senderId,
      content,
      image_url: imageUrl || null,
    })
    .select()
    .single();
  if (error) {
    console.error(error)
    return null;
  }
  return data as Message;
}

export async function fetchMessages(
  supabase: SupabaseClient,
  conversationId: string,
) {
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true });
  if (error) {
    console.error(error)
    return [];
  }
  return data as Message[];
}

export async function fetchConversation(
  supabase: SupabaseClient,
  conversationId: string,
) {
  const { data, error } = await supabase
    .from('conversations')
    .select(`
      *,
      listing:listings(title, image_urls),
      owner:users!owner_id(id, name, avatar_url),
      requester:users!requester_id(id, name, avatar_url)
    `)
    .eq('id', conversationId)
    .single();
  if (error) {
    console.error(error)
    return null;
  }
  return data as Conversation;
}

export async function fetchConversations(
  supabase: SupabaseClient,
  profileId: string,
) {
  const { data, error } = await supabase
    .from('conversations')
    .select(`
      *,
      listing:listings(title, image_urls),
      owner:users!owner_id(id, name, avatar_url),
      requester:users!requester_id(id, name, avatar_url)
    `)
    .or(`owner_id.eq.${profileId},requester_id.eq.${profileId}`)
    .order('last_message_at', { ascending: false, nullsFirst: false });
  if (error) {
    console.error(error)
    return [];
  }
  return data as Conversation[];
}
