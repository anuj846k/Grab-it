import React, { useEffect, useRef, useState, type ComponentProps } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import type { Tabs } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '@clerk/expo';
import { colors } from '@/constants/theme';
import { fontFamily } from '@/constants/typography';
import { createClerkSupabaseClient } from '@/utils/supabase';

type BottomTabBarProps = Parameters<
  NonNullable<ComponentProps<typeof Tabs>['tabBar']>
>[0];

const ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  index: 'home',
  post: 'add-circle',
  messages: 'chatbubbles',
  profile: 'person',
};

const LABELS: Record<string, string> = {
  index: 'Home',
  post: 'Post',
  messages: 'Messages',
  profile: 'Profile',
};

const BOTTOM_TAB_ROUTES = Object.keys(LABELS);

export function TabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const { getToken, userId } = useAuth();
  const insets = useSafeAreaInsets();
  const [pendingCount, setPendingCount] = useState(0);
  const getTokenRef = useRef(getToken);
  getTokenRef.current = getToken;

  useEffect(() => {
    if (!userId) return;

    const fetchCount = async () => {
      const token = await getTokenRef.current({ template: 'supabase' });
      if (!token) return;

      const supabase = createClerkSupabaseClient(token);

      const { data: userData } = await supabase
        .from('users')
        .select('id')
        .eq('clerk_id', userId)
        .single();

      if (!userData) return;

      const { data: listings } = await supabase
        .from('listings')
        .select('id')
        .eq('user_id', userData.id);

      const listingIds = listings?.map(l => l.id) ?? [];
      if (listingIds.length === 0) { setPendingCount(0); return; }

      const { count } = await supabase
        .from('claims')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'pending')
        .in('listing_id', listingIds);

      setPendingCount(count ?? 0);
    };

    fetchCount();
  }, [userId]);

  const visibleRoutes = state.routes
    .map((route, index) => ({ route, index }))
    .filter(({ route }) => BOTTOM_TAB_ROUTES.includes(route.name));

  if (!visibleRoutes.some(({ index }) => index === state.index)) {
    return null;
  }

  return (
    <LinearGradient
      colors={['#ffffff', '#e6f4ee']}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      style={[
        styles.container,
        { bottom: insets.bottom > 0 ? insets.bottom + 16 : 28 }
      ]}
    >
      <View style={styles.tabBar}>
        {visibleRoutes.map(({ route, index }) => {
          const { options } = descriptors[route.key];
          const label = LABELS[route.name] || route.name;
          const iconName = ICONS[route.name] || 'help-circle';

          const isFocused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name, route.params);
            }
          };

          return (
            <Pressable
              key={route.key}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={options.tabBarAccessibilityLabel}
              onPress={onPress}
              style={styles.tabItem}
            >
              <View style={[
                styles.iconCircle, 
                isFocused && styles.iconCircleActive
              ]}>
                <Ionicons 
                  name={isFocused ? iconName : (`${iconName}-outline` as keyof typeof Ionicons.glyphMap)} 
                  size={20} 
                  color={isFocused ? '#ffffff' : colors.onSurfaceVariant} 
                />
                {route.name === 'profile' && pendingCount > 0 && (
                  <View style={[styles.dot, isFocused && styles.dotActive]} />
                )}
              </View>
              <Text style={[
                styles.tabLabel, 
                { color: isFocused ? colors.primary : colors.onSurfaceVariant }
              ]}>
                {label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 16,
    right: 16,
    borderRadius: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 1,
    borderColor: 'rgba(0, 108, 73, 0.08)',
  },
  tabBar: {
    flexDirection: 'row',
    paddingVertical: 10,
    paddingHorizontal: 8,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  iconCircleActive: {
    backgroundColor: colors.primary,
    borderRadius: 22,
    overflow: 'hidden',
  },
  tabLabel: {
    fontFamily: fontFamily.label,
    fontSize: 10,
    fontWeight: '600',
    marginTop: 4,
  },
  dot: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EF4444',
  },
  dotActive: {
    borderColor: '#ffffff',
    borderWidth: 1.5,
  },
});
