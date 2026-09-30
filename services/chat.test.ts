import { describe, it, expect, vi } from 'vitest'
import type { SupabaseClient } from '@supabase/supabase-js'
import { fetchConversation } from './chat'
import type { Conversation } from '@/types/chat'

function createMockSupabase(response: { data: unknown; error: unknown }): SupabaseClient {
  const chain: Record<string, unknown> = {
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue(response),
  }
  chain.from = vi.fn().mockReturnValue(chain)
  return chain as unknown as SupabaseClient
}

describe('fetchConversation', () => {
  it('returns null when Supabase returns error (conversation not found)', async () => {
    const supabase = createMockSupabase({
      data: null,
      error: { code: 'PGRST116', message: 'The result contains 0 rows' },
    })

    const result = await fetchConversation(supabase, '00000000-0000-0000-0000-000000000000')

    expect(result).toBeNull()
  })

  it('returns shaped Conversation when data exists', async () => {
    const mockData = {
      id: 'conv-1',
      listing_id: 'list-1',
      owner_id: 'owner-1',
      requester_id: 'req-1',
      claim_id: 'claim-1',
      status: 'active',
      last_message_at: '2024-01-01T00:00:00Z',
      last_message_text: 'Hello!',
      created_at: '2024-01-01T00:00:00Z',
      listing: { title: 'Vintage Table', image_urls: ['https://example.com/img.jpg'] },
      owner: { id: 'owner-1', name: 'Alice', avatar_url: 'https://example.com/alice.jpg' },
      requester: { id: 'req-1', name: 'Bob', avatar_url: 'https://example.com/bob.jpg' },
    }

    const supabase = createMockSupabase({ data: mockData, error: null })

    const result = await fetchConversation(supabase, 'conv-1')

    expect(result).not.toBeNull()
    expect(result!.id).toBe('conv-1')
    expect(result!.listing?.title).toBe('Vintage Table')
    expect(result!.owner?.name).toBe('Alice')
    expect(result!.requester?.name).toBe('Bob')
  })

  it('returns null when listing, owner, or requester are null in response', async () => {
    const mockData = {
      id: 'conv-2',
      listing_id: 'list-2',
      owner_id: 'owner-2',
      requester_id: 'req-2',
      claim_id: 'claim-2',
      status: 'active',
      last_message_at: null,
      last_message_text: null,
      created_at: '2024-01-01T00:00:00Z',
      listing: null,
      owner: null,
      requester: null,
    }

    const supabase = createMockSupabase({ data: mockData, error: null })

    const result = await fetchConversation(supabase, 'conv-2')

    expect(result).not.toBeNull()
    expect(result!.id).toBe('conv-2')
    expect(result!.listing).toBeNull()
    expect(result!.owner).toBeNull()
    expect(result!.requester).toBeNull()
  })
})
