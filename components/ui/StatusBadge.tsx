import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Colors } from '@/constants/colors';
import { Radius } from '@/constants/layout';

export type PostStatus = 'PENDING' | 'CLAIMED' | 'VALIDATED' | 'DEBUNKED' | 'NOT_VALIDATED' | 'UNDER_REVIEW';

const STATUS_CONFIG: Record<PostStatus, { label: string; bg: string; text: string }> = {
  PENDING: { label: 'PENDING', bg: Colors.yellowPending + '25', text: Colors.yellowPending },
  CLAIMED: { label: 'CLAIMED', bg: Colors.orangeClaimed + '25', text: Colors.orangeClaimed },
  VALIDATED: { label: 'VALIDATED', bg: Colors.greenValidated10, text: Colors.greenValidated },
  DEBUNKED: { label: 'DEBUNKED', bg: Colors.redDebunked10, text: Colors.redDebunked },
  NOT_VALIDATED: { label: 'NOT VERIFIED', bg: Colors.yellowPending + '20', text: Colors.yellowPending },
  UNDER_REVIEW: { label: 'UNDER REVIEW', bg: Colors.yellowPending + '20', text: Colors.yellowPending },
};

type Props = { status: PostStatus };

export default function StatusBadge({ status }: Props) {
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.PENDING;
  return (
    <View style={[styles.pill, { backgroundColor: cfg.bg }]}>
      <Text style={[styles.label, { color: cfg.text }]}>{cfg.label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: Radius.xs,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  label: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.4,
  },
});
