import '@supabase/functions-js/edge-runtime.d.ts';
import { createClient } from 'jsr:@supabase/supabase-js@2';

function decodeJwt(token: string): { sub?: string } | null {
  try {
    const payload = token.split('.')[1];
    if (!payload) return null;
    return JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
  } catch {
    return null;
  }
}

export default {
  async fetch(req: Request) {
    try {
      const { claim_id } = await req.json();
      if (!claim_id) {
        return new Response(JSON.stringify({ error: 'claim_id is required' }), { status: 400 });
      }

      const authHeader = req.headers.get('Authorization')?.replace('Bearer ', '');
      if (!authHeader) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
      }

      const jwtPayload = decodeJwt(authHeader);
      const clerkId = jwtPayload?.sub;
      if (!clerkId) {
        return new Response(JSON.stringify({ error: 'Invalid token' }), { status: 401 });
      }

      const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
      const supabaseKey = Deno.env.get('SERVICE_ROLE_KEY')!;
      const supabase = createClient(supabaseUrl, supabaseKey);

      // Fetch the claim with its listing
      const { data: claim, error: claimError } = await supabase
        .from('claims')
        .select('*, listing:listings!inner(user_id, title, status)')
        .eq('id', claim_id)
        .single();

      if (claimError || !claim) {
        return new Response(JSON.stringify({ error: 'Claim not found' }), { status: 404 });
      }

      if (claim.status !== 'pending') {
        return new Response(JSON.stringify({ error: 'Claim is not pending' }), { status: 400 });
      }

      // Verify caller is the listing owner
      const { data: owner } = await supabase
        .from('users')
        .select('id')
        .eq('clerk_id', clerkId)
        .single();

      if (!owner || owner.id !== claim.listing.user_id) {
        return new Response(JSON.stringify({ error: 'Not the listing owner' }), { status: 403 });
      }

      // Atomic operations: all succeed or fail together conceptually
      // (Supabase doesn't support transactions from JS, but sequential fails are handled)

      // 1. Create conversation
      const { data: conversation, error: convError } = await supabase
        .from('conversations')
        .insert({
          listing_id: claim.listing_id,
          owner_id: claim.listing.user_id,
          requester_id: claim.requester_id,
          claim_id: claim.id,
          status: 'active',
        })
        .select()
        .single();

      if (convError) {
        // Unique violation means conversation already exists — that's fine
        if (convError.code === '23505') {
          const { data: existing } = await supabase
            .from('conversations')
            .select('id')
            .eq('listing_id', claim.listing_id)
            .eq('owner_id', claim.listing.user_id)
            .eq('requester_id', claim.requester_id)
            .single();

          if (existing) {
            // Conversation exists, just update claim status
            await supabase.from('claims').update({ status: 'accepted' }).eq('id', claim_id);
            await supabase.from('listings').update({ status: 'claimed' }).eq('id', claim.listing_id);
            return new Response(JSON.stringify({ success: true, conversation_id: existing.id }), { status: 200 });
          }
        }

        return new Response(JSON.stringify({ error: convError.message }), { status: 500 });
      }

      // 2. Update claim status
      const { error: claimUpdateError } = await supabase
        .from('claims')
        .update({ status: 'accepted' })
        .eq('id', claim_id);

      if (claimUpdateError) {
        console.error('Failed to update claim status:', claimUpdateError);
      }

      // 3. Update listing status
      const { error: listingUpdateError } = await supabase
        .from('listings')
        .update({ status: 'claimed' })
        .eq('id', claim.listing_id);

      if (listingUpdateError) {
        console.error('Failed to update listing status:', listingUpdateError);
      }

      // 4. Increment owner's items_given_count
      const { error: givenError } = await supabase.rpc('increment_given_count', { target_user_id: claim.listing.user_id });
      if (givenError) {
        const { data: userData } = await supabase
          .from('users')
          .select('items_given_count')
          .eq('id', claim.listing.user_id)
          .single();
        if (userData) {
          await supabase
            .from('users')
            .update({ items_given_count: (userData.items_given_count || 0) + 1 })
            .eq('id', claim.listing.user_id);
        }
      }

      // 5. Increment requester's items_received_count
      const { error: receivedError } = await supabase.rpc('increment_received_count', { target_user_id: claim.requester_id });
      if (receivedError) {
        const { data: userData } = await supabase
          .from('users')
          .select('items_received_count')
          .eq('id', claim.requester_id)
          .single();
        if (userData) {
          await supabase
            .from('users')
            .update({ items_received_count: (userData.items_received_count || 0) + 1 })
            .eq('id', claim.requester_id);
        }
      }

      return new Response(
        JSON.stringify({ success: true, conversation_id: conversation.id }),
        { status: 200, headers: { 'Content-Type': 'application/json' } },
      );
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      console.error('Accept claim error:', message);
      return new Response(JSON.stringify({ error: message }), { status: 500 });
    }
  },
};
