import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import Avatar from '@/components/ui/Avatar';
import { Colors } from '@/constants/colors';
import { Spacing } from '@/constants/layout';
import { useSession } from '@/ctx';

type HeaderProps = {
  title?: string;
  showBack?: boolean;
  showLogo?: boolean;
  showNotification?: boolean;
  showAvatar?: boolean;
};

export default function Header({
  title,
  showBack = false,
  showLogo = false,
  showNotification = true,
  showAvatar = true,
}: HeaderProps) {
  const { user } = useSession();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
      <View style={styles.left}>
        {showBack && (
          <Pressable
            onPress={() => (router.canGoBack() ? router.back() : router.replace('/(tabs)'))}
            style={styles.iconBtn}>
            <Ionicons name="chevron-back" size={22} color={Colors.textPrimary} />
          </Pressable>
        )}
        {showLogo && (
          <View style={styles.logoRow}>
            <Image
              source={require('../../assets/images/logo-new-removebg-preview.png')}
              style={styles.logoImg}
              contentFit="contain"
            />
            <Text style={styles.logoText}>Anivartee</Text>
          </View>
        )}
        {title && !showLogo && <Text style={styles.title}>{title}</Text>}
      </View>

      <View style={styles.right}>
        {showNotification && (
          <Pressable style={styles.iconBtn}>
            <Ionicons name="notifications-outline" size={22} color={Colors.textSecondary} />
          </Pressable>
        )}
        {showAvatar && user && (
          <Pressable onPress={() => router.push('/(tabs)/profile' as never)}>
            <Avatar username={user.username} size="sm" isOwn />
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    height: 100,
    backgroundColor: Colors.bgSecondary,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderDefault,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.base,
    paddingBottom: Spacing.md,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    flex: 1,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  logoImg: {
    width: 28,
    height: 28,
  },
  logoText: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textPrimary,
    letterSpacing: 0.5,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  right: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  iconBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
