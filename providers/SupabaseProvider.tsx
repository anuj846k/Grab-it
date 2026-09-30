import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { useSession } from '@clerk/expo';
import React, {
  createContext,
  PropsWithChildren,
  useContext,
  useState,
} from 'react';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_KEY!;

type SupabaseContextType = {
  supabase: SupabaseClient;
};
// Create the context with an initial static client
const SupabaseContext = createContext<SupabaseContextType>({
  supabase: createClient(supabaseUrl, supabaseAnonKey),
});

export function SupabaseProvider({ children }: PropsWithChildren) {
  const { session } = useSession();
  const sessionRef = React.useRef(session);
  sessionRef.current = session;

  const [supabase] = useState<SupabaseClient>(() =>
    createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        ...(Platform.OS !== 'web' ? { storage: AsyncStorage } : {}),
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
      },
      accessToken: async () => {
        return (
          sessionRef.current?.getToken({
            template: 'supabase',
            skipCache: true,
          }) ?? null
        );
      },
    }),
  );

  return (
    <SupabaseContext.Provider value={{ supabase }}>
      {children}
    </SupabaseContext.Provider>
  );
}

// Hook to access the globally shared Supabase client
export function useSupabase() {
  const { supabase } = useContext(SupabaseContext);
  return supabase;
}
