import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { DASH_COLORS, DASH_SPACING, DashboardPostCard, FilterTabs, IconText, ProfileCard } from '../../components/profile/DashboardUI';
import { useSession } from '../../ctx';
import { getUserPosts, getUserStats } from '../../lib/api/postApi';

const TABS = ['All', 'Pending', 'Under Review', 'Validated', 'Debunked'];
const SORT_OPTIONS = [
  { id: 'newest', label: 'Newest First' },
  { id: 'oldest', label: 'Oldest First' },
  { id: 'most-liked', label: 'Most Liked' },
  { id: 'most-shared', label: 'Most Shared' },
  { id: 'most-flagged', label: 'Most Flagged' },
];

export default function ProfileScreen() {
  const { user, session } = useSession();
  const insets = useSafeAreaInsets();

  const [activeTab, setActiveTab] = useState('All');
  const [sortBy, setSortBy] = useState(0);
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [posts, setPosts] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const loadProfileData = useCallback(async () => {
    if (!user || !user.id || !session) return;
    setLoading(true);

    try {
      const currentSort = SORT_OPTIONS[sortBy].id;
      const [postsRes, statsRes] = await Promise.all([
        getUserPosts(user.id, 1, activeTab, currentSort, session),
        getUserStats(user.id, session).catch(() => null),
      ]);
      setPosts(postsRes.posts || []);
      if (statsRes?.data) {
        setStats(statsRes.data);
      } else if (statsRes) {
        setStats(statsRes);
      }
    } catch (error) {
      console.error('Failed to load profile data:', error);
    } finally {
      setLoading(false);
    }
  }, [user, session, activeTab, sortBy]);

  useFocusEffect(
    useCallback(() => {
      loadProfileData();
    }, [loadProfileData])
  );

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <View style={styles.container}>
        <FlatList
          data={posts}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: insets.bottom + 80 }}
          refreshing={loading}
          onRefresh={loadProfileData}
          ListEmptyComponent={
            !loading ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>Not started journey yet</Text>
              </View>
            ) : null
          }
          ListHeaderComponent={
            <>
              <ProfileCard
                user={{
                  username: user?.username || 'user',
                  role: user?.role || 'USER',
                  rank: stats?.rank || user?.rank || 'NOVICE',
                  points: stats?.points || user?.points || 0,
                  postsCount: stats?.totalPosts || user?.postsCount || 0,
                  likesCount: stats?.totalLikes || user?.likesCount || 0,
                  level: stats?.level || 1,
                }}
              />

              <FilterTabs tabs={TABS} activeTab={activeTab} onTabChange={setActiveTab} />

              <View style={styles.sortRow}>
                <IconText icon="document-text-outline" text={`${posts.length} posts`} style={{ padding: 0 }} />
                <Pressable style={styles.sortBtn} onPress={() => setIsSortOpen(!isSortOpen)}>
                  <Ionicons name="options-outline" size={16} color={DASH_COLORS.text} />
                  <Text style={styles.sortBtnText}>{SORT_OPTIONS[sortBy].label}</Text>
                  <Ionicons name="chevron-down" size={14} color={DASH_COLORS.subtext} style={{ marginLeft: 4 }} />
                </Pressable>
              </View>
            </>
          }
          renderItem={({ item }) => <DashboardPostCard post={item} />}
        />

        {isSortOpen && (
          <>
            <Pressable style={styles.fullBackdrop} onPress={() => setIsSortOpen(false)} />
            <View style={[styles.dropdownMenu, { top: 280 }]}>
              {SORT_OPTIONS.map((option, index) => (
                <Pressable
                  key={option.id}
                  style={[styles.dropdownItem, sortBy === index && styles.dropdownItemActive]}
                  onPress={() => {
                    setSortBy(index);
                    setIsSortOpen(false);
                  }}>
                  <Text style={[styles.dropdownText, sortBy === index && styles.dropdownTextActive]}>{option.label}</Text>
                </Pressable>
              ))}
            </View>
          </>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: DASH_COLORS.bg,
  },
  container: {
    flex: 1,
    paddingHorizontal: DASH_SPACING.lg,
    paddingTop: DASH_SPACING.md,
  },
  sortRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: DASH_SPACING.md,
  },
  sortBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: DASH_SPACING.xs,
    backgroundColor: DASH_COLORS.border,
    paddingHorizontal: DASH_SPACING.md,
    paddingVertical: DASH_SPACING.xs,
    borderRadius: 20,
  },
  sortBtnText: {
    color: DASH_COLORS.text,
    fontWeight: 'bold',
    fontSize: 12,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: DASH_SPACING.xl * 2,
  },
  emptyText: {
    color: DASH_COLORS.subtext,
    fontSize: 16,
    fontFamily: 'space-mono',
  },
  fullBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.2)',
    zIndex: 1500,
  },
  dropdownMenu: {
    position: 'absolute',
    right: DASH_SPACING.lg,
    backgroundColor: DASH_COLORS.card,
    borderRadius: 12,
    padding: DASH_SPACING.xs,
    width: 160,
    borderWidth: 1,
    borderColor: DASH_COLORS.border,
    zIndex: 2000,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  dropdownItem: {
    paddingVertical: 10,
    paddingHorizontal: DASH_SPACING.md,
    borderRadius: 8,
  },
  dropdownItemActive: {
    backgroundColor: DASH_COLORS.border,
  },
  dropdownText: {
    color: DASH_COLORS.subtext,
    fontSize: 14,
    fontWeight: '500',
  },
  dropdownTextActive: {
    color: DASH_COLORS.text,
    fontWeight: 'bold',
  },
});
