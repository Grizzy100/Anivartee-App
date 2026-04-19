import { Ionicons } from '@expo/vector-icons';
import BottomSheet, { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { Tabs } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import ActivityCalendarSheet from '../../components/calendar/ActivityCalendarSheet';
import { Colors } from '../../constants/colors';
import { Fonts } from '../../constants/fonts';
import { useSession } from '../../ctx';
import { getMyPoints } from '../../lib/api/dashboardApi';
import { createPost } from '../../lib/api/postApi';

type ComposerLimits = {
  maxHeaderLength: number;
  maxDescriptionLength: number;
  postPoints: number;
};

const DEFAULT_COMPOSER_LIMITS: ComposerLimits = {
  maxHeaderLength: 80,
  maxDescriptionLength: 200,
  postPoints: 2,
};

export default function TabLayout() {
  const { session, user } = useSession();
  const insets = useSafeAreaInsets();

  const createSheetRef = useRef<BottomSheet>(null);
  const createSnapPoints = useMemo(() => ['75%', '92%'], []);

  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<'WAR' | 'FOOD' | 'SOCIAL' | 'OTHER'>('OTHER');
  const [submitting, setSubmitting] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [composerLimits, setComposerLimits] = useState<ComposerLimits>(DEFAULT_COMPOSER_LIMITS);

  useEffect(() => {
    if (!session) {
      setComposerLimits(DEFAULT_COMPOSER_LIMITS);
      return;
    }

    getMyPoints(session)
      .then((response) => {
        const limits = (response.data as any)?.limits;
        if (!limits) return;

        setComposerLimits({
          maxHeaderLength: Number(limits.maxHeaderLength) || DEFAULT_COMPOSER_LIMITS.maxHeaderLength,
          maxDescriptionLength: Number(limits.maxDescriptionLength) || DEFAULT_COMPOSER_LIMITS.maxDescriptionLength,
          postPoints: Number(limits.postPoints) || DEFAULT_COMPOSER_LIMITS.postPoints,
        });
      })
      .catch(() => {
        setComposerLimits(DEFAULT_COMPOSER_LIMITS);
      });
  }, [session]);

  const openCreateSheet = useCallback(() => {
    createSheetRef.current?.expand();
  }, []);

  const closeCreateSheet = useCallback(() => {
    createSheetRef.current?.close();
    setTitle('');
    setUrl('');
    setDescription('');
    setCategory('OTHER');
  }, []);

  const handleSubmit = async () => {
    if (!title.trim() || !url.trim()) {
      Alert.alert('Missing fields', 'Title and URL are required.');
      return;
    }
    if (title.trim().length > composerLimits.maxHeaderLength) {
      Alert.alert('Title too long', `Title must be ${composerLimits.maxHeaderLength} characters or less for your rank.`);
      return;
    }
    if (description.trim().length > composerLimits.maxDescriptionLength) {
      Alert.alert('Description too long', `Description must be ${composerLimits.maxDescriptionLength} characters or less for your rank.`);
      return;
    }
    if (!session) {
      Alert.alert('Not signed in', 'Please sign in to submit a post.');
      return;
    }
    setSubmitting(true);
    try {
      await createPost(
        {
          title: title.trim(),
          url: url.trim(),
          description: description.trim() || undefined,
          category,
        },
        session
      );
      Alert.alert('Submitted!', 'Your post has been submitted for review.');
      closeCreateSheet();
    } catch {
      Alert.alert('Error', 'Failed to submit post. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const calendarSheetRef = useRef<BottomSheet>(null);
  const calendarSnapPoints = useMemo(() => ['65%', '90%'], []);
  const [calendarOpen, setCalendarOpen] = useState(false);

  const openCalendar = useCallback(() => {
    setCalendarOpen(true);
    calendarSheetRef.current?.expand();
  }, []);

  const closeCalendar = useCallback(() => {
    calendarSheetRef.current?.close();
    setCalendarOpen(false);
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: [styles.tabBar, { height: 60 + insets.bottom, paddingBottom: insets.bottom }],
          tabBarActiveTintColor: Colors.accentPrimary,
          tabBarInactiveTintColor: Colors.textSecondary,
          tabBarLabelStyle: styles.tabLabel,
        }}>
        <Tabs.Screen
          name="index"
          options={{
            title: 'Home',
            tabBarIcon: ({ color, focused }) => (
              <Ionicons name={focused ? 'home' : 'home-outline'} size={24} color={color} />
            ),
            tabBarLabel: () => null,
          }}
        />
        <Tabs.Screen
          name="search"
          options={{
            title: 'Search',
            tabBarIcon: ({ color, focused }) => (
              <Ionicons name={focused ? 'search' : 'search-outline'} size={24} color={color} />
            ),
            tabBarLabel: () => null,
          }}
        />
        <Tabs.Screen
          name="create"
          options={{
            title: 'Create',
            tabBarIcon: ({ focused }) => (
              <View style={[styles.createIconBg, focused && styles.createIconBgActive]}>
                <Ionicons name="add" size={32} color="#FFF" />
              </View>
            ),
            tabBarLabel: () => null,
          }}
          listeners={() => ({
            tabPress: (e) => {
              e.preventDefault();
              openCreateSheet();
            },
          })}
        />
        <Tabs.Screen
          name="calendar"
          options={{
            href: null,
          }}
        />
        <Tabs.Screen
          name="ranking"
          options={{
            title: 'Ranking',
            tabBarIcon: ({ color, focused }) => (
              <Ionicons name={focused ? 'bar-chart' : 'bar-chart-outline'} size={24} color={color} />
            ),
            tabBarLabel: () => null,
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: 'Profile',
            tabBarIcon: ({ color, focused }) => (
              <Ionicons name={focused ? 'person' : 'person-outline'} size={24} color={color} />
            ),
            tabBarLabel: () => null,
          }}
        />
        <Tabs.Screen
          name="moderation"
          options={{
            title: 'Moderation',
            href: null, // Hidden from tab bar as per user request
            tabBarIcon: ({ color, focused }) => (
              <Ionicons name={focused ? 'shield' : 'shield-outline'} size={24} color={color} />
            ),
            tabBarLabel: () => null,
          }}
        />
        <Tabs.Screen name="posts" options={{ href: null }} />
        <Tabs.Screen name="explore" options={{ href: null }} />
      </Tabs>

      {!isCreateOpen && !calendarOpen && (
        <View
          style={[styles.fabContainer, { bottom: (Platform.OS === 'ios' ? 85 : 65) + insets.bottom + 16 }]}
          pointerEvents="box-none">
          <TouchableOpacity style={styles.fab} onPress={openCalendar} activeOpacity={0.85}>
            <Ionicons name="calendar" size={22} color="#FFF" />
          </TouchableOpacity>
        </View>
      )}

      <BottomSheet
        ref={createSheetRef}
        index={-1}
        snapPoints={createSnapPoints}
        enablePanDownToClose
        onChange={(index) => setIsCreateOpen(index > -1)}
        backgroundStyle={styles.sheetBg}
        handleIndicatorStyle={styles.sheetHandle}
        keyboardBehavior="fillParent">
        <BottomSheetScrollView contentContainerStyle={styles.sheetContent}>
          <View style={styles.sheetHeader}>
            <Text style={styles.sheetTitle}>Submit a Post</Text>
            <Pressable onPress={closeCreateSheet} style={styles.closeBtn} hitSlop={10}>
              <Ionicons name="close" size={20} color={Colors.textSecondary} />
            </Pressable>
          </View>

          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
            <Text style={styles.fieldLabel}>Title *</Text>
            <TextInput
              style={styles.input}
              value={title}
              onChangeText={setTitle}
              placeholder="What is the claim or headline?"
              placeholderTextColor={Colors.textMuted}
              maxLength={composerLimits.maxHeaderLength}
            />
            <Text style={styles.limitText}>{title.trim().length}/{composerLimits.maxHeaderLength}</Text>

            <Text style={styles.fieldLabel}>Source URL *</Text>
            <TextInput
              style={styles.input}
              value={url}
              onChangeText={setUrl}
              placeholder="https://example.com/article"
              placeholderTextColor={Colors.textMuted}
              keyboardType="url"
              autoCapitalize="none"
            />

            <Text style={styles.fieldLabel}>
              Description <Text style={styles.optional}>(optional)</Text>
            </Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={description}
              onChangeText={setDescription}
              placeholder="Add more context about this post..."
              placeholderTextColor={Colors.textMuted}
              multiline
              numberOfLines={4}
              maxLength={composerLimits.maxDescriptionLength}
              textAlignVertical="top"
            />
            <Text style={styles.limitText}>{description.trim().length}/{composerLimits.maxDescriptionLength}</Text>

            <Text style={styles.fieldLabel}>Category</Text>
            <View style={styles.categoryRow}>
              {(['WAR', 'FOOD', 'SOCIAL', 'OTHER'] as const).map((cat) => (
                <TouchableOpacity
                  key={cat}
                  style={[styles.categoryChip, category === cat && styles.categoryChipActive]}
                  onPress={() => setCategory(cat)}>
                  <Text style={[styles.categoryChipText, category === cat && styles.categoryChipTextActive]}>{cat}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              style={[styles.submitBtn, submitting && styles.submitBtnDisabled]}
              onPress={handleSubmit}
              disabled={submitting}>
              {submitting ? <ActivityIndicator color="#FFF" /> : <Text style={styles.submitBtnText}>Submit for Review -&gt;</Text>}
            </TouchableOpacity>
            <Text style={styles.pointsHint}>Successful post awards +{composerLimits.postPoints} points at your current rank.</Text>
          </KeyboardAvoidingView>
        </BottomSheetScrollView>
      </BottomSheet>

      <BottomSheet
        ref={calendarSheetRef}
        index={-1}
        snapPoints={calendarSnapPoints}
        enablePanDownToClose
        backgroundStyle={styles.sheetBg}
        handleIndicatorStyle={styles.sheetHandle}
        onChange={(index) => setCalendarOpen(index > -1)}
        onClose={() => setCalendarOpen(false)}>
        <BottomSheetScrollView contentContainerStyle={styles.sheetContent}>
          {calendarOpen && <ActivityCalendarSheet onClose={closeCalendar} />}
        </BottomSheetScrollView>
      </BottomSheet>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: Platform.OS === 'ios' ? 85 : 65,
    backgroundColor: Colors.bgSecondary,
    borderTopWidth: 1,
    borderTopColor: Colors.borderDefault,
    elevation: 0,
    paddingTop: 8,
  },
  tabLabel: {
    fontFamily: Fonts.oxanium,
    fontSize: 10,
    fontWeight: '600',
    marginTop: 4,
  },
  createIconBg: {
    backgroundColor: Colors.accentPrimary,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: -28,
    shadowColor: Colors.accentPrimary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
  createIconBgActive: {
    backgroundColor: '#2563EB',
  },
  fabContainer: {
    position: 'absolute',
    right: 16,
    zIndex: 100,
  },
  fab: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.bgTertiary,
    borderWidth: 1,
    borderColor: Colors.accentPrimary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.accentPrimary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 6,
  },
  sheetBg: {
    backgroundColor: Colors.bgSecondary,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    borderColor: Colors.borderDefault,
  },
  sheetHandle: {
    backgroundColor: Colors.borderDefault,
    width: 40,
  },
  sheetContent: {
    paddingHorizontal: 20,
    paddingTop: 4,
    paddingBottom: 40,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  sheetTitle: {
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
  fieldLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textSecondary,
    fontFamily: Fonts.oxanium,
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  optional: {
    color: Colors.textMuted,
    fontWeight: '400',
    textTransform: 'none',
  },
  limitText: {
    color: Colors.textMuted,
    fontSize: 11,
    marginTop: -8,
    marginBottom: 10,
    fontFamily: Fonts.oxanium,
    textAlign: 'right',
  },
  input: {
    backgroundColor: Colors.bgTertiary,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.borderDefault,
    color: Colors.textPrimary,
    fontSize: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 16,
    fontFamily: Fonts.oxanium,
  },
  textArea: {
    minHeight: 90,
  },
  submitBtn: {
    height: 50,
    backgroundColor: Colors.accentPrimary,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  submitBtnDisabled: {
    opacity: 0.6,
  },
  categoryRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 4,
    marginBottom: 20,
  },
  categoryChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: Colors.bgTertiary,
    borderWidth: 1,
    borderColor: Colors.borderDefault,
  },
  categoryChipActive: {
    backgroundColor: Colors.accentPrimary + '20',
    borderColor: Colors.accentPrimary,
  },
  categoryChipText: {
    fontFamily: Fonts.oxaniumBold,
    fontSize: 12,
    color: Colors.textSecondary,
  },
  categoryChipTextActive: {
    color: Colors.accentPrimary,
  },
  submitBtnText: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 15,
    fontFamily: Fonts.oxaniumBold,
  },
  pointsHint: {
    marginTop: 8,
    color: Colors.textMuted,
    fontSize: 11,
    fontFamily: Fonts.oxanium,
  },
});
