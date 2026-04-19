import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import Header from '../../components/shared/Header';
import { Colors } from '../../constants/colors';
import { Radius, Shadow, Spacing, Typography } from '../../constants/layout';

const DAYS_OF_WEEK = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

const ACTIVITY_DOTS: Record<number, boolean> = { 3: true, 10: true, 16: true };

const DEMO_ACTIVITIES: Record<number, string[]> = {
  16: ['Published a post', 'Got 3 likes'],
  3: ['Fact-check completed'],
  10: ['Submitted 2 posts'],
};

export default function CalendarScreen() {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [selectedDay, setSelectedDay] = useState(today.getDate());

  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);

  const prevMonth = () => {
    if (month === 0) {
      setYear((y) => y - 1);
      setMonth(11);
    } else {
      setMonth((m) => m - 1);
    }
  };

  const nextMonth = () => {
    if (month === 11) {
      setYear((y) => y + 1);
      setMonth(0);
    } else {
      setMonth((m) => m + 1);
    }
  };

  const isToday = (d: number) => d === today.getDate() && month === today.getMonth() && year === today.getFullYear();

  const activities = DEMO_ACTIVITIES[selectedDay] ?? [];
  const selectedDateStr = `${DAYS_OF_WEEK[new Date(year, month, selectedDay).getDay()]}, ${MONTHS[month].toUpperCase().slice(0, 3)} ${selectedDay}`;

  return (
    <View style={styles.screen}>
      <Header title="Calendar" showNotification={false} showAvatar={false} />
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.calendarCard}>
          <View style={styles.monthHeader}>
            <TouchableOpacity onPress={prevMonth} style={styles.navBtn}>
              <Ionicons name="chevron-back" size={18} color={Colors.textSecondary} />
            </TouchableOpacity>
            <Text style={styles.monthTitle}>{MONTHS[month]} {year}</Text>
            <TouchableOpacity onPress={nextMonth} style={styles.navBtn}>
              <Ionicons name="chevron-forward" size={18} color={Colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <View style={styles.weekRow}>
            {DAYS_OF_WEEK.map((d, i) => (
              <Text key={i} style={styles.weekDay}>{d}</Text>
            ))}
          </View>

          <View style={styles.daysGrid}>
            {Array.from({ length: firstDay }).map((_, i) => (
              <View key={`empty-${i}`} style={styles.dayCell} />
            ))}
            {Array.from({ length: daysInMonth }).map((_, idx) => {
              const d = idx + 1;
              const active = ACTIVITY_DOTS[d] ?? false;
              const todayDay = isToday(d);
              const isSelected = d === selectedDay;
              return (
                <TouchableOpacity key={d} style={styles.dayCell} onPress={() => setSelectedDay(d)}>
                  <View style={[styles.dayInner, todayDay && styles.todayCircle, isSelected && !todayDay && styles.selectedCircle]}>
                    <Text style={[styles.dayNum, todayDay && styles.todayText, isSelected && !todayDay && styles.selectedText]}>{d}</Text>
                  </View>
                  {active && <View style={styles.activityDot} />}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <View style={styles.activityCard}>
          <Text style={styles.activityDate}>{selectedDateStr}</Text>
          {activities.length === 0 ? (
            <Text style={styles.activityEmpty}>No activity today</Text>
          ) : (
            activities.map((a, i) => (
              <View key={i} style={styles.activityRow}>
                <View style={styles.activityBullet} />
                <Text style={styles.activityItem}>{a}</Text>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.bgPrimary },
  scroll: { padding: Spacing.base, paddingBottom: 32 },
  calendarCard: {
    backgroundColor: Colors.bgSecondary,
    borderRadius: Radius.sm,
    borderWidth: 1,
    borderColor: Colors.borderDefault,
    padding: Spacing.base,
    marginBottom: Spacing.base,
    ...Shadow.card,
  },
  monthHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  navBtn: { padding: 6 },
  monthTitle: { ...Typography.heading, color: Colors.textPrimary },
  weekRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: Spacing.sm,
  },
  weekDay: { ...Typography.micro, color: Colors.textMuted, width: 32, textAlign: 'center' },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: `${100 / 7}%`,
    alignItems: 'center',
    paddingVertical: 3,
  },
  dayInner: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Radius.full,
  },
  todayCircle: { backgroundColor: Colors.accentPrimary },
  selectedCircle: { borderWidth: 1, borderColor: Colors.accentPrimary },
  dayNum: { ...Typography.body, color: Colors.textPrimary },
  todayText: { color: '#FFFFFF', fontWeight: '700' },
  selectedText: { color: Colors.accentPrimary },
  activityDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.greenValidated,
    marginTop: 2,
  },
  activityCard: {
    backgroundColor: Colors.bgSecondary,
    borderRadius: Radius.sm,
    borderWidth: 1,
    borderColor: Colors.borderDefault,
    padding: Spacing.base,
    ...Shadow.card,
  },
  activityDate: { ...Typography.label, color: Colors.textPrimary, marginBottom: Spacing.sm, letterSpacing: 0.6 },
  activityEmpty: { ...Typography.body, color: Colors.textMuted },
  activityRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: Spacing.sm },
  activityBullet: { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.greenValidated },
  activityItem: { ...Typography.body, color: Colors.textPrimary },
});
