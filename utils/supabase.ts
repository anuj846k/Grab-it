import { createClient } from '@supabase/supabase-js';

// Keep the legacy factory for components that haven't been refactored yet
export const createClerkSupabaseClient = (clerkToken: string) => {
    return createClient(
        process.env.EXPO_PUBLIC_SUPABASE_URL!,
        process.env.EXPO_PUBLIC_SUPABASE_KEY!,
        {
            global: {
              headers: { Authorization: `Bearer ${clerkToken}` }
            }
        }
    );
};

export { SupabaseProvider, useSupabase } from '@/providers/SupabaseProvider';
