import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Colors } from '@/constants/colors';
import { Radius } from '@/constants/layout';
import type { RankLevel } from '@/ctx';

type RankBadgeProps = {
  rank: RankLevel;
};

export default function RankBadge({ rank }: RankBadgeProps) {
  const rawMatch = rank ? String(rank).toUpperCase() : 'NOVICE';
  const cleanRank = Object.keys(Colors.rank).includes(rawMatch) ? (rawMatch as RankLevel) : 'NOVICE';
  const { text, bg } = Colors.rank[cleanRank];

  return (
    <View style={[styles.pill, { backgroundColor: bg }]}>
      <Text style={[styles.label, { color: text }]}>{cleanRank}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    borderRadius: Radius.full,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  label: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});
