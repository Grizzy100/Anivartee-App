import { Ionicons } from '@expo/vector-icons';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View, type ViewStyle } from 'react-native';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { Colors } from '@/constants/colors';
import { Fonts } from '@/constants/fonts';
import { Radius, Spacing } from '@/constants/layout';

export type CalendarMode = 'single' | 'multiple' | 'range';

export type RangeSelection = {
  from: Date | null;
  to: Date | null;
};

export interface CalendarProps {
  mode?: CalendarMode;
  initialDate?: Date;
  minDate?: Date;
  maxDate?: Date;
  disabled?: (date: Date) => boolean;
  selected?: Date;
  selectedDates?: Date[];
  selectedRange?: RangeSelection;
  onSelect?: (date: Date) => void;
  onSelectMultiple?: (dates: Date[]) => void;
  onSelectRange?: (range: RangeSelection) => void;
  onMonthChange?: (year: number, month: number) => void;
  renderDay?: (dayNumber: number, date: Date, variant: string) => React.ReactNode;
  style?: ViewStyle;
}

const isSameDay = (d1: Date | null, d2: Date | null): boolean => {
  if (!d1 || !d2) return false;
  return d1.getFullYear() === d2.getFullYear() && d1.getMonth() === d2.getMonth() && d1.getDate() === d2.getDate();
};

const isBeforeDay = (d1: Date, d2: Date): boolean => {
  const d1Clone = new Date(d1.getFullYear(), d1.getMonth(), d1.getDate());
  const d2Clone = new Date(d2.getFullYear(), d2.getMonth(), d2.getDate());
  return d1Clone.getTime() < d2Clone.getTime();
};

const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

const WEEKDAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

export default function Calendar({
  mode = 'single',
  initialDate = new Date(),
  minDate,
  maxDate,
  disabled,
  selected,
  selectedDates = [],
  selectedRange = { from: null, to: null },
  onSelect,
  onSelectMultiple,
  onSelectRange,
  onMonthChange,
  renderDay,
  style,
}: CalendarProps) {
  const [currentVisibleDate, setCurrentVisibleDate] = useState(new Date(initialDate.getFullYear(), initialDate.getMonth(), 1));
  const [singleVal, setSingleVal] = useState<Date | null>(selected || null);
  const [multiVals, setMultiVals] = useState<Date[]>(selectedDates);
  const [rangeVal, setRangeVal] = useState<RangeSelection>(selectedRange);

  const [animating, setAnimating] = useState(false);
  const translateX = useSharedValue(0);
  const opacity = useSharedValue(1);

  useEffect(() => {
    if (selected && (!singleVal || !isSameDay(selected, singleVal))) setSingleVal(selected);
  }, [selected, singleVal]);

  useEffect(() => {
    if (selectedDates) {
      const next = JSON.stringify(selectedDates.map((d) => d.getTime()));
      const current = JSON.stringify(multiVals.map((d) => d.getTime()));
      if (next !== current) setMultiVals(selectedDates);
    }
  }, [selectedDates, multiVals]);

  useEffect(() => {
    const isFromChanged = selectedRange?.from?.getTime() !== rangeVal?.from?.getTime();
    const isToChanged = selectedRange?.to?.getTime() !== rangeVal?.to?.getTime();
    if (selectedRange && (isFromChanged || isToChanged)) setRangeVal(selectedRange);
  }, [selectedRange, rangeVal]);

  const year = currentVisibleDate.getFullYear();
  const month = currentVisibleDate.getMonth();

  const gridDays = useMemo(() => {
    const daysInMonth = getDaysInMonth(year, month);
    const firstDayIndex = getFirstDayOfMonth(year, month);
    const prevMonthDays = getDaysInMonth(year, month - 1);

    const days: { date: Date; isCurrentMonth: boolean }[] = [];

    for (let i = firstDayIndex - 1; i >= 0; i -= 1) {
      days.push({ date: new Date(year, month - 1, prevMonthDays - i), isCurrentMonth: false });
    }

    for (let i = 1; i <= daysInMonth; i += 1) {
      days.push({ date: new Date(year, month, i), isCurrentMonth: true });
    }

    let nextDays = 1;
    while (days.length < 42) {
      days.push({ date: new Date(year, month + 1, nextDays), isCurrentMonth: false });
      nextDays += 1;
    }

    return days;
  }, [year, month]);

  const isDisabled = useCallback(
    (d: Date) => {
      if (minDate && isBeforeDay(d, minDate) && !isSameDay(d, minDate)) return true;
      if (maxDate && isBeforeDay(maxDate, d) && !isSameDay(maxDate, d)) return true;
      if (disabled && disabled(d)) return true;
      return false;
    },
    [minDate, maxDate, disabled],
  );

  const handleDayPress = (pressedDate: Date) => {
    if (isDisabled(pressedDate) || animating) return;

    if (mode === 'single') {
      setSingleVal(pressedDate);
      onSelect?.(pressedDate);
      return;
    }

    if (mode === 'multiple') {
      const existsIndex = multiVals.findIndex((d) => isSameDay(d, pressedDate));
      let newMultiVals;
      if (existsIndex >= 0) {
        newMultiVals = [...multiVals];
        newMultiVals.splice(existsIndex, 1);
      } else {
        newMultiVals = [...multiVals, pressedDate];
      }
      setMultiVals(newMultiVals);
      onSelectMultiple?.(newMultiVals);
      return;
    }

    let newRange = { ...rangeVal };
    if (!rangeVal.from || (rangeVal.from && rangeVal.to)) {
      newRange = { from: pressedDate, to: null };
    } else if (isBeforeDay(pressedDate, rangeVal.from)) {
      newRange = { from: pressedDate, to: rangeVal.from };
    } else {
      newRange = { from: rangeVal.from, to: pressedDate };
    }

    setRangeVal(newRange);
    onSelectRange?.(newRange);
  };

  const getDayVariant = useCallback(
    (d: Date, isCurrent: boolean) => {
      if (isDisabled(d)) return 'disabled';

      if (mode === 'single' && isSameDay(d, singleVal)) return 'selected';
      if (mode === 'multiple' && multiVals.some((sd) => isSameDay(d, sd))) return 'selected';

      if (mode === 'range' && rangeVal.from) {
        if (isSameDay(d, rangeVal.from) && rangeVal.to && isSameDay(rangeVal.from, rangeVal.to)) return 'selected';
        if (isSameDay(d, rangeVal.from) && !rangeVal.to) return 'selected';
        if (isSameDay(d, rangeVal.from)) return 'range-start';
        if (isSameDay(d, rangeVal.to)) return 'range-end';
        if (rangeVal.from && rangeVal.to && isBeforeDay(rangeVal.from, d) && isBeforeDay(d, rangeVal.to)) return 'range-middle';
      }

      if (isSameDay(d, new Date())) return 'today';
      if (!isCurrent) return 'outside';

      return 'default';
    },
    [mode, singleVal, multiVals, rangeVal, isDisabled],
  );

  const updateMonth = (dir: 1 | -1) => {
    const nextDate = new Date(year, month + dir, 1);
    setCurrentVisibleDate(nextDate);
    onMonthChange?.(nextDate.getFullYear(), nextDate.getMonth());

    translateX.value = -dir * 30;
    translateX.value = withTiming(0, { duration: 150 });
    opacity.value = withTiming(1, { duration: 150 }, (finished) => {
      if (finished) runOnJS(setAnimating)(false);
    });
  };

  const handleNav = (dir: 1 | -1) => {
    if (animating) return;
    setAnimating(true);

    translateX.value = withTiming(dir * 30, { duration: 150 });
    opacity.value = withTiming(0, { duration: 150 }, (finished) => {
      if (finished) runOnJS(updateMonth)(dir);
    });
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
    opacity: opacity.value,
  }));

  const renderCell = (dayObj: { date: Date; isCurrentMonth: boolean }, index: number) => {
    const variant = getDayVariant(dayObj.date, dayObj.isCurrentMonth);
    const dayName = dayObj.date.getDate().toString();

    const cellWrapperStyle: any[] = [styles.dayWrapper];
    const cellInnerStyle: any[] = [styles.dayInner];
    const textStyle: any[] = [styles.dayText];

    switch (variant) {
      case 'disabled':
        cellInnerStyle.push(styles.innerDefault);
        textStyle.push(styles.textDisabled);
        break;
      case 'selected':
        cellInnerStyle.push(styles.innerSelected);
        textStyle.push(styles.textSelected);
        break;
      case 'range-start':
        cellWrapperStyle.push(styles.wrapperRangeStart);
        cellInnerStyle.push(styles.innerSelected);
        textStyle.push(styles.textSelected);
        break;
      case 'range-end':
        cellWrapperStyle.push(styles.wrapperRangeEnd);
        cellInnerStyle.push(styles.innerSelected);
        textStyle.push(styles.textSelected);
        break;
      case 'range-middle':
        cellWrapperStyle.push(styles.wrapperRangeMiddle);
        cellInnerStyle.push(styles.innerRangeMiddle);
        textStyle.push(styles.textSelected);
        break;
      case 'today':
        cellInnerStyle.push(styles.innerToday);
        textStyle.push(styles.textToday);
        break;
      case 'outside':
        cellInnerStyle.push(styles.innerDefault);
        textStyle.push(styles.textOutside);
        break;
      default:
        cellInnerStyle.push(styles.innerDefault);
    }

    return (
      <View key={index} style={cellWrapperStyle}>
        <TouchableOpacity activeOpacity={variant === 'disabled' ? 1 : 0.6} onPress={() => handleDayPress(dayObj.date)} style={cellInnerStyle}>
          {renderDay ? renderDay(dayObj.date.getDate(), dayObj.date, variant) : <Text style={textStyle}>{dayName}</Text>}
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={[styles.container, style]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => handleNav(-1)} style={styles.navBtn} disabled={animating}>
          <Ionicons name="chevron-back" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>

        <Text style={styles.headerText}>
          {MONTHS[month]} {year}
        </Text>

        <TouchableOpacity onPress={() => handleNav(1)} style={styles.navBtn} disabled={animating}>
          <Ionicons name="chevron-forward" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
      </View>

      <View style={styles.weekdaysRow}>
        {WEEKDAYS.map((wd, i) => (
          <Text key={i} style={styles.weekdayText}>
            {wd}
          </Text>
        ))}
      </View>

      <Animated.View style={[styles.grid, animatedStyle]}>{gridDays.map((dayObj, i) => renderCell(dayObj, i))}</Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.bgSecondary,
    borderRadius: Radius.lg,
    padding: Spacing.base,
    alignSelf: 'stretch',
    borderWidth: 1,
    borderColor: Colors.borderDefault,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.lg,
  },
  headerText: {
    color: Colors.textPrimary,
    fontSize: 18,
    fontFamily: Fonts.orbitronBold,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  navBtn: {
    width: 40,
    height: 40,
    borderRadius: Radius.full,
    backgroundColor: Colors.bgTertiary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.borderSubtle,
  },
  weekdaysRow: {
    flexDirection: 'row',
    marginBottom: Spacing.sm,
  },
  weekdayText: {
    flex: 1,
    textAlign: 'center',
    color: Colors.textMuted,
    fontSize: 12,
    fontFamily: Fonts.oxaniumBold,
    opacity: 0.8,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayWrapper: {
    width: `${100 / 7}%`,
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 2,
  },
  wrapperRangeStart: {
    backgroundColor: Colors.accentPrimary + '22',
    borderTopLeftRadius: 18,
    borderBottomLeftRadius: 18,
  },
  wrapperRangeEnd: {
    backgroundColor: Colors.accentPrimary + '22',
    borderTopRightRadius: 18,
    borderBottomRightRadius: 18,
  },
  wrapperRangeMiddle: {
    backgroundColor: Colors.accentPrimary + '11',
  },
  dayInner: {
    width: '100%',
    height: '100%',
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  innerDefault: {
    backgroundColor: 'transparent',
  },
  innerSelected: {
    backgroundColor: Colors.accentPrimary,
  },
  innerRangeMiddle: {
    backgroundColor: 'transparent',
  },
  innerToday: {
    backgroundColor: Colors.bgTertiary,
    borderWidth: 1,
    borderColor: Colors.accentPrimary,
  },
  dayText: {
    color: Colors.textPrimary,
    fontSize: 14,
    fontFamily: Fonts.oxanium,
  },
  textOutside: {
    color: Colors.textMuted,
    opacity: 0.3,
  },
  textDisabled: {
    color: Colors.textMuted,
    opacity: 0.1,
  },
  textSelected: {
    color: '#FFF',
    fontFamily: Fonts.oxaniumBold,
  },
  textToday: {
    color: Colors.accentPrimary,
    fontFamily: Fonts.oxaniumBold,
  },
});
