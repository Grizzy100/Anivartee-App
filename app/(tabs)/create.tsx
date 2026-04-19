import { useRouter } from 'expo-router';
import { useEffect } from 'react';

export default function CreatePlaceholder() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/create-post');
  }, [router]);

  return null;
}
