import { Ionicons } from '@expo/vector-icons';
import * as Linking from 'expo-linking';
import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';

import { Colors } from '@/constants/colors';
import { Radius } from '@/constants/layout';

type SourceChipProps = {
  url: string;
  label?: string;
};

export default function SourceChip({ url, label }: SourceChipProps) {
  const displayLabel = label ?? (url.replace(/^https?:\/\/(www\.)?/, '').split('/')[0] || 'Source');

  const handlePress = () => {
    Linking.openURL(url).catch(() => {});
  };

  return (
    <Pressable onPress={handlePress} style={({ pressed }) => [styles.chip, pressed && styles.pressed]}>
      <Text style={styles.label} numberOfLines={1}>
        {displayLabel}
      </Text>
      <Ionicons name="open-outline" size={12} color={Colors.textSecondary} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    height: 28,
    paddingHorizontal: 8,
    borderRadius: Radius.xs,
    backgroundColor: Colors.bgTertiary,
    borderWidth: 1,
    borderColor: Colors.borderDefault,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  pressed: { opacity: 0.7 },
  label: {
    fontSize: 12,
    color: Colors.textSecondary,
    maxWidth: 100,
  },
});
