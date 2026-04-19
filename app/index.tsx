import { Redirect } from 'expo-router';
import { useSession } from '../ctx';
import { View } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { useEffect, useState } from 'react';

const HAS_LAUNCHED_KEY = 'anivartee_has_launched';

export default function Index() {
  const { session, isLoading } = useSession();
  const [isFirstLaunch, setIsFirstLaunch] = useState<boolean | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function resolveFirstLaunch() {
      try {
        const hasLaunched = await SecureStore.getItemAsync(HAS_LAUNCHED_KEY);

        if (!hasLaunched) {
          await SecureStore.setItemAsync(HAS_LAUNCHED_KEY, '1');
          if (isMounted) setIsFirstLaunch(true);
          return;
        }

        if (isMounted) setIsFirstLaunch(false);
      } catch {
        if (isMounted) setIsFirstLaunch(false);
      }
    }

    resolveFirstLaunch();

    return () => {
      isMounted = false;
    };
  }, []);

  if (isLoading || isFirstLaunch === null) {
    // Return empty view while auth/session + first-launch checks resolve.
    return <View style={{ flex: 1, backgroundColor: '#0B1220' }} />;
  }

  if (session) {
    return <Redirect href="/(tabs)" />;
  }

  if (isFirstLaunch) {
    return <Redirect href="/(auth)/sign-up" />;
  }

  return <Redirect href="/(auth)/sign-in" />;
}
