import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import type { PostData } from '../../components/feed/PostCard';
import PostCard from '../../components/feed/PostCard';
import Header from '../../components/shared/Header';
import { Colors } from '../../constants/colors';
import { Fonts } from '../../constants/fonts';
import { useSession } from '../../ctx';
import { getFeed, type FeedFilter } from '../../lib/api/postApi';

function mapToPostData(raw: any): PostData {
  return {
    id: String(raw?.id || ''),
    title: String(raw?.title || 'Untitled post'),
    description: raw?.description || raw?.content || null,
    status: (raw?.status || 'PENDING') as any,
    createdAt: raw?.createdAt,
    totalLikes: raw?.totalLikes || raw?._count?.likes || 0,
    commentsCount: raw?.commentsCount || raw?._count?.comments || 0,
    liked: raw?.liked,
    saved: raw?.saved,
    flagged: raw?.flagged,
    author: {
      id: raw?.author?.id || raw?.user?.id,
      username: raw?.author?.username || raw?.user?.username || 'community',
      rankName: raw?.author?.rankName || 'NOVICE',
    },
    factChecks: raw?.factChecks,
  };
}

const DEMO_POSTS: PostData[] = [
  {
    id: 'demo-1',
    title: 'Sample feed is active',
    description: 'Backend posts will appear here when services are online.',
    status: 'PENDING',
    createdAt: new Date().toISOString(),
    totalLikes: 0,
    commentsCount: 0,
    author: { username: 'anivartee', rankName: 'NOVICE' },
  },
];

export default function HomeScreen() {
  const { session } = useSession();
  const [filter, setFilter] = useState<FeedFilter>('all');
  const [posts, setPosts] = useState<PostData[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [isDemo, setIsDemo] = useState(false);

  const loadFresh = useCallback(async (f: FeedFilter) => {
    setLoading(true);
    setPage(1);
    setHasMore(true);
    try {
      const result = await getFeed(1, f, session ?? undefined);
      const mapped = (result.posts ?? []).map(mapToPostData);
      if (mapped.length === 0) {
        setPosts(DEMO_POSTS);
        setIsDemo(true);
      } else {
        setPosts(mapped);
        setIsDemo(false);
      }
      setHasMore((result.posts?.length ?? 0) >= 10);
    } catch {
      setPosts(DEMO_POSTS);
      setIsDemo(true);
    } finally {
      setLoading(false);
    }
  }, [session]);

  useEffect(() => {
    loadFresh(filter);
  }, [loadFresh, filter]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadFresh(filter);
    setRefreshing(false);
  };

  const loadMore = async () => {
    if (loadingMore || !hasMore || isDemo) return;
    setLoadingMore(true);
    try {
      const nextPage = page + 1;
      const result = await getFeed(nextPage, filter, session ?? undefined);
      const more = (result.posts ?? []).map(mapToPostData);
      if (more.length > 0) {
        setPosts((prev) => [...prev, ...more]);
        setPage(nextPage);
      }
      setHasMore(more.length >= 10);
    } catch {
      // Keep current list on paging failure.
    } finally {
      setLoadingMore(false);
    }
  };

  return (
    <View style={styles.screen}>
      <Header showLogo showNotification showAvatar={false} />

      {loading ? (
        <View style={styles.loadingCenter}>
          <ActivityIndicator color={Colors.accentPrimary} size="large" />
        </View>
      ) : (
        <FlatList
          data={posts}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <PostCard post={item} showModerationActions={false} />}
          ListHeaderComponent={
            <>
              {isDemo && (
                <View style={styles.demoBanner}>
                  <Text style={styles.demoText}>Demo mode - backend unreachable</Text>
                </View>
              )}
            </>
          }
          ListFooterComponent={
            loadingMore ? <ActivityIndicator color={Colors.accentPrimary} style={{ marginVertical: 16 }} /> : null
          }
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={Colors.accentPrimary} />
          }
          onEndReached={loadMore}
          onEndReachedThreshold={0.4}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.bgPrimary,
  },
  list: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 120,
  },
  loadingCenter: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  demoBanner: {
    backgroundColor: Colors.bgTertiary,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.borderDefault,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 8,
    alignItems: 'center',
  },
  demoText: {
    fontFamily: Fonts.oxanium,
    fontSize: 11,
    color: Colors.textMuted,
    textAlign: 'center',
  },
});
