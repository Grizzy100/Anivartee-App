import { Ionicons } from '@expo/vector-icons';
import React, { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import Calendar from '@/components/ui/Calendar';
import { Colors } from '@/constants/colors';
import { Fonts } from '@/constants/fonts';

type ActivityDetail = {
  posts: number;
  edits: number;
  factChecks: number;
};

type ActivityCalendarSheetProps = {
  onClose: () => void;
  activeDays?: string[];
  details?: Record<string, ActivityDetail>;
};

function toDateString(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

export default function ActivityCalendarSheet({
  onClose,
  activeDays = [],
  details = {},
}: ActivityCalendarSheetProps) {
  const now = useMemo(() => new Date(), []);
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTitleWrap}>
          <Ionicons name="calendar" size={20} color={Colors.accentPrimary} />
          <Text style={styles.title}>Activity Dashboard</Text>
        </View>
        <Pressable onPress={onClose} style={styles.closeBtn} hitSlop={10}>
          <Ionicons name="close" size={20} color={Colors.textSecondary} />
        </Pressable>
      </View>

      <View style={styles.calendarContainer}>
        <Calendar
          mode="single"
          initialDate={new Date(year, month - 1, 1)}
          selected={selectedDate ? new Date(selectedDate) : undefined}
          onSelect={(date) => {
            const next = toDateString(date);
            setSelectedDate((prev) => (prev === next ? null : next));
          }}
          onMonthChange={(y, m) => {
            setYear(y);
            setMonth(m + 1);
            setSelectedDate(null);
          }}
          renderDay={(dayNumber, date, variant) => {
            const dateStr = toDateString(date);
            const isActive = activeDays.includes(dateStr);
            const isToday = variant === 'today';
            const isSelected = variant === 'selected' || dateStr === selectedDate;

            return (
              <View style={[styles.dayCell, isToday && styles.dayCellToday, isSelected && styles.dayCellSelected]}>
                <Text
                  style={[
                    styles.dayNum,
                    isToday && styles.dayNumToday,
                    isSelected && styles.dayNumSelected,
                    (variant === 'outside' || variant === 'disabled') && styles.dayNumMuted,
                  ]}>
                  {dayNumber}
                </Text>
                {isActive && <View style={styles.dot} />}
              </View>
            );
          }}
        />
      </View>

      {selectedDate && details[selectedDate] && (
        <View style={styles.detailCard}>
          <Text style={styles.detailDate}>{selectedDate}</Text>
          <View style={styles.detailRow}>
            <Stat icon="document-text-outline" label="Posts" value={details[selectedDate].posts} />
            <Stat icon="pencil-outline" label="Edits" value={details[selectedDate].edits} />
            <Stat icon="shield-checkmark-outline" label="Fact Checks" value={details[selectedDate].factChecks} />
          </View>
        </View>
      )}

      <View style={styles.legend}>
        <View style={styles.legendDot} />
        <Text style={styles.legendText}>Active day</Text>
      </View>
    </View>
  );
}

function Stat({ icon, label, value }: { icon: any; label: string; value: number }) {
  return (
    <View style={styles.stat}>
      <Ionicons name={icon} size={16} color={Colors.accentPrimary} />
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  headerTitleWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    fontFamily: Fonts.orbitron,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.bgTertiary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  calendarContainer: {
    minHeight: 340,
    justifyContent: 'center',
  },
  dayCell: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 18,
  },
  dayCellToday: {
    backgroundColor: Colors.accentPrimary + '22',
  },
  dayCellSelected: {
    backgroundColor: Colors.accentPrimary,
  },
  dayNum: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontFamily: Fonts.oxanium,
  },
  dayNumToday: {
    color: Colors.accentPrimary,
    fontWeight: '700',
  },
  dayNumSelected: {
    color: '#FFF',
    fontWeight: '700',
  },
  dayNumMuted: {
    opacity: 0.3,
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.accentPrimary,
    marginTop: 2,
  },
  detailCard: {
    marginTop: 16,
    backgroundColor: Colors.bgTertiary,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.borderDefault,
    padding: 14,
  },
  detailDate: {
    fontSize: 12,
    color: Colors.textMuted,
    fontFamily: Fonts.oxanium,
    marginBottom: 10,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  stat: {
    alignItems: 'center',
    gap: 4,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textPrimary,
    fontFamily: Fonts.oxaniumBold,
  },
  statLabel: {
    fontSize: 11,
    color: Colors.textSecondary,
    fontFamily: Fonts.oxanium,
  },
  legend: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 16,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.accentPrimary,
  },
  legendText: {
    fontSize: 11,
    color: Colors.textMuted,
    fontFamily: Fonts.oxanium,
  },
});
