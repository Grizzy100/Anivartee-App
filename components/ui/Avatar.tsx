import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Colors } from '@/constants/colors';

type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

const SIZE_MAP: Record<AvatarSize, number> = {
  xs: 24,
  sm: 32,
  md: 40,
  lg: 56,
  xl: 72,
};

function getBgColor(name: string): string {
  const palette = ['#1E3A8A', '#065F46', '#4C1D95', '#7C2D12', '#1E40AF', '#14532D'];
  let hash = 0;
  for (let i = 0; i < name.length; i += 1) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return palette[Math.abs(hash) % palette.length];
}

type AvatarProps = {
  username: string;
  size?: AvatarSize;
  isOwn?: boolean;
};

export default function Avatar({ username, size = 'md', isOwn = false }: AvatarProps) {
  const dim = SIZE_MAP[size];
  const fontSize = dim * 0.4;
  const safeName = username || 'U';
  const initials = safeName.slice(0, 2).toUpperCase();
  const bg = getBgColor(safeName);

  return (
    <View
      style={[
        styles.avatar,
        {
          width: dim,
          height: dim,
          borderRadius: dim / 2,
          backgroundColor: bg,
          borderWidth: isOwn ? 2 : 1,
          borderColor: isOwn ? Colors.accentPrimary : Colors.borderDefault,
        },
      ]}>
      <Text style={[styles.initials, { fontSize }]}>{initials}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  avatar: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: {
    color: Colors.textPrimary,
    fontWeight: '700',
  },
});
