import { AuthLoadingShell } from '@/components/auth-loading-shell';
import { TabBar } from '@/components/navigation/tab-bar';
import { useAuth } from '@clerk/expo';
import { Redirect, Tabs } from 'expo-router';

export default function HomeGroupLayout() {
  const { isSignedIn, isLoaded } = useAuth();

  if (!isLoaded) {
    return <AuthLoadingShell />;
  }

  if (!isSignedIn) {
    return <Redirect href="/onboarding" />;
  }

  return (
    <Tabs
      tabBar={(props) => <TabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tabs.Screen name="index" />
      <Tabs.Screen name="post" />
      <Tabs.Screen name="messages" />
      <Tabs.Screen name="profile" />
      <Tabs.Screen
        name="my-listings"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="my-claims"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="edit-profile"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="requests"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="request-history"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="chat/[id]"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}
