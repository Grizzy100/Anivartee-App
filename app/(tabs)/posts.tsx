import React, { useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';

import type { PostData } from '../../components/feed/PostCard';
import PostCard from '../../components/feed/PostCard';
import Header from '../../components/shared/Header';
import FilterChips from '../../components/ui/FilterChips';
import { Colors } from '../../constants/colors';
import { Spacing, Typography } from '../../constants/layout';
import { useSession } from '../../ctx';

const USER_FILTER_CHIPS = [
  { label: 'All', value: 'all' },
  { label: 'Pending', value: 'PENDING' },
  { label: 'Verified', value: 'VALIDATED' },
  { label: 'Debunked', value: 'DEBUNKED' },
];

const FC_FILTER_CHIPS = [
  { label: 'My Submissions', value: 'submissions' },
  { label: 'Fact-Checks', value: 'factchecks' },
];

const MY_POSTS: PostData[] = [
  {
    id: 'my1',
    title: 'This is another test',
    description: 'Just a test submission.',
    status: 'PENDING',
    createdAt: new Date().toISOString(),
    totalLikes: 1,
    commentsCount: 0,
    author: { username: 'testuser1', rankName: 'NOVICE' },
  },
  {
    id: 'my2',
    title: 'Updated: Climate report corrections',
    description: 'Correction summary queued for verification.',
    status: 'VALIDATED',
    createdAt: new Date().toISOString(),
    totalLikes: 2,
    commentsCount: 1,
    author: { username: 'testuser1', rankName: 'NOVICE' },
  },
  {
    id: 'my3',
    title: 'Breaking: New economic report released',
    description: 'Analysis of Q4 2025 economic indicators.',
    status: 'DEBUNKED',
    createdAt: new Date().toISOString(),
    totalLikes: 0,
    commentsCount: 0,
    author: { username: 'testuser1', rankName: 'NOVICE' },
  },
];

const MY_FACTCHECKS: PostData[] = [
  {
    id: 'fc1',
    title: 'Regarding this - climate report analysis',
    description: 'Fact-check completed. Sources verified.',
    status: 'VALIDATED',
    createdAt: new Date().toISOString(),
    totalLikes: 1,
    commentsCount: 0,
    author: { username: 'checker1', rankName: 'APPRENTICE' },
    factChecks: [
      {
        id: 'fc-row-1',
        verdict: 'VALIDATED',
        header: 'Validated by checker1',
        description: 'Primary data sources match the claim context.',
        referenceUrls: ['https://bbc.com'],
      },
    ],
  },
];

export default function PostsScreen() {
  const { user } = useSession();
  const [filter, setFilter] = useState('all');
  const isFactChecker = user?.role === 'FACT_CHECKER';

  const chips = isFactChecker ? FC_FILTER_CHIPS : USER_FILTER_CHIPS;

  const rawData = isFactChecker
    ? (filter === 'factchecks' ? MY_FACTCHECKS : MY_POSTS)
    : MY_POSTS;

  const filteredData = !isFactChecker && filter !== 'all'
    ? rawData.filter((p) => p.status === filter)
    : rawData;

  const totalPosts = MY_POSTS.length;
  const totalLikes = MY_POSTS.reduce((s, p) => s + (p.totalLikes ?? 0), 0);

  return (
    <View style={styles.screen}>
      <Header title={isFactChecker ? 'My Post' : 'My Posts'} showBack={false} showNotification={false} showAvatar={false} />

      <FlatList
        data={filteredData}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <PostCard post={item} />}
        ListHeaderComponent={
          <>
            <FilterChips chips={chips} selected={filter} onSelect={setFilter} />
            {!isFactChecker && (
              <View style={styles.summaryRow}>
                <Text style={styles.summaryText}>{totalPosts} Posts · {totalLikes} Likes</Text>
              </View>
            )}
          </>
        }
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.bgPrimary },
  list: { paddingHorizontal: 16, paddingBottom: 20 },
  summaryRow: { paddingHorizontal: Spacing.base, paddingBottom: Spacing.sm },
  summaryText: { ...Typography.caption, color: Colors.textSecondary },
});
