import '@supabase/functions-js/edge-runtime.d.ts';
import { createClient } from 'jsr:@supabase/supabase-js@2';

export default {
  async fetch(req: Request) {
    try {
      const payload = await req.json();

      const user = payload.data;

      const clerkId = user.id;
      const email = user.email_addresses?.[0]?.email_address ?? null;

      const name = `${user.first_name ?? ''} ${user.last_name ?? ''}`.trim();

      const avatarUrl = user.image_url;

      const supabaseUrl = 'https://cbriaywajfclrpxjfchz.supabase.co';
      const supabaseKey = Deno.env.get('SERVICE_ROLE_KEY')!;
      
      const supabase = createClient(supabaseUrl, supabaseKey);

      const { error } = await supabase.from('users').upsert(
        {
          clerk_id: clerkId,
          email,
          name,
          avatar_url: avatarUrl,
        },
        {
          onConflict: 'clerk_id',
        },
      );

      if (error) {
        console.error(error);
        return new Response('Database Error', {
          status: 500,
        });
      }

      return new Response('OK', {
        status: 200,
      });
    } catch (err) {
      console.error(err);

      return new Response('Error', {
        status: 500,
      });
    }
  },
};
