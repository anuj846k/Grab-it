import { useAuth, useUser } from '@clerk/expo';
import { useEffect, useRef } from 'react';
import { useSupabase } from '@/utils/supabase';

export function useUserSync() {
  const { isLoaded: isUserLoaded, isSignedIn } = useUser();
  const { getToken } = useAuth();
  const getTokenRef = useRef(getToken);
  getTokenRef.current = getToken;
  const supabase = useSupabase();

  useEffect(() => {
    const syncUser = async () => {
      // Only proceed if user is fully loaded and signed in
      if (!isUserLoaded || !isSignedIn) return;

      try {
        // Native Integration: Fetch the default Clerk JWT (no template needed)
        const token = await getTokenRef.current();
        console.log('[Native Integration] TOKEN EXISTS:', !!token);

        if (!token) return;

        // Test querying the tasks table
        const { data, error } = await supabase.from('tasks').select('*');

        console.log('[Native Integration] DATA:', data?.length || 0, 'items');
        console.log('[Native Integration] ERROR:', error);
      } catch (err) {
        console.error('[UserSync] Unexpected error during sync:', err);
      }
    };

    syncUser();
  }, [isUserLoaded, isSignedIn]);
}
