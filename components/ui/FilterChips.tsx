import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text } from 'react-native';

import { Colors } from '@/constants/colors';
import { Radius, Spacing, Typography } from '@/constants/layout';

type Chip = { label: string; value: string };

type FilterChipsProps = {
  chips: Chip[];
  selected: string;
  onSelect: (value: string) => void;
};

export default function FilterChips({ chips, selected, onSelect }: FilterChipsProps) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.container}>
      {chips.map((chip) => {
        const isActive = chip.value === selected;
        return (
          <Pressable
            key={chip.value}
            onPress={() => onSelect(chip.value)}
            style={({ pressed }) => [styles.chip, isActive && styles.chipActive, pressed && styles.chipPressed]}>
            <Text style={[styles.label, isActive && styles.labelActive]}>{chip.label}</Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.sm,
  },
  chip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderRadius: Radius.full,
    backgroundColor: Colors.bgTertiary,
    borderWidth: 1,
    borderColor: Colors.borderDefault,
  },
  chipActive: {
    backgroundColor: Colors.accentPrimary,
    borderColor: Colors.accentPrimary,
  },
  chipPressed: {
    opacity: 0.8,
  },
  label: {
    ...Typography.label,
    color: Colors.textSecondary,
  },
  labelActive: {
    color: '#FFFFFF',
  },
});
