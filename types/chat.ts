export interface Conversation {
  id: string;
  listing_id: string;
  owner_id: string;
  requester_id: string;
  claim_id: string;
  status: 'active' | 'archived';
  last_message_at: string | null;
  last_message_text: string | null;
  created_at: string;
  listing?: { title: string; image_urls?: string[] } | null;
  owner?: { id: string; name: string; avatar_url: string } | null;
  requester?: { id: string; name: string; avatar_url: string } | null;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  image_url?: string | null;
  is_read: boolean;
  created_at: string;
  sender?: { name: string; avatar_url: string } | null;
  clientId?: string;
  status?: 'sending' | 'sent' | 'failed';
}
