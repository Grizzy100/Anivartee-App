import BottomSheet, { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import PostCard, { type PostData } from '../../components/feed/PostCard';
import Header from '../../components/shared/Header';
import { Colors } from '../../constants/colors';
import { Fonts } from '../../constants/fonts';
import { Radius, Spacing, Typography } from '../../constants/layout';
import { useSession } from '../../ctx';
import {
  abandonClaim,
  claimPost,
  getClaimedPosts,
  getModerationQueue,
  submitVerdict,
} from '../../lib/api/postApi';

type Tab = 'queue' | 'claimed';

function mapToPostCardItem(raw: any): PostData {
  const post = raw?.post || raw;
  return {
    id: String(raw?.postId || post?.id || raw?.id || ''),
    title: String(post?.title || 'Untitled claim'),
    description: post?.description || null,
    status: (post?.status || raw?.status || 'PENDING') as any,
    createdAt: post?.createdAt,
    totalLikes: post?.totalLikes || 0,
    commentsCount: post?.commentsCount || 0,
    author: {
      username: post?.author?.username || 'unknown',
      rankName: 'NOVICE',
    },
  };
}

export default function ModerationScreen() {
  const { session } = useSession();
  const [tab, setTab] = useState<Tab>('queue');
  const [queuePosts, setQueuePosts] = useState<PostData[]>([]);
  const [claimedPosts, setClaimedPosts] = useState<PostData[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [selectedPost, setSelectedPost] = useState<PostData | null>(null);
  const [verdict, setVerdict] = useState<'VALIDATED' | 'DEBUNKED'>('VALIDATED');
  const [verdictHeader, setVerdictHeader] = useState('');
  const [verdictDesc, setVerdictDesc] = useState('');
  const [verdictUrls, setVerdictUrls] = useState('');
  const [submittingVerdict, setSubmittingVerdict] = useState(false);

  const verdictSheetRef = React.useRef<BottomSheet>(null);
  const snapPoints = React.useMemo(() => ['70%', '90%'], []);

  const fetchData = useCallback(async (silent = false) => {
    if (!session) return;
    if (!silent) setLoading(true);
    try {
      const [queueRes, claimedRes] = await Promise.all([
        getModerationQueue(1, 20, session),
        getClaimedPosts(session),
      ]);
      setQueuePosts((queueRes.data || []).map(mapToPostCardItem));
      setClaimedPosts((claimedRes.data || []).map(mapToPostCardItem));
    } catch (err) {
      console.error('Failed to fetch moderation data:', err);
      Alert.alert('Error', 'Failed to fetch moderation queue.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [session]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchData(true);
  };

  const handleClaim = async (id: string) => {
    if (!session) return;
    try {
      await claimPost(id, session);
      Alert.alert('Claimed', 'Post has been claimed for review.');
      fetchData(true);
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to claim post.';
      Alert.alert('Error', msg);
    }
  };

  const handleAbandon = async (id: string) => {
    if (!session) return;
    try {
      await abandonClaim(id, session);
      Alert.alert('Abandoned', 'Claim has been removed.');
      fetchData(true);
    } catch {
      Alert.alert('Error', 'Failed to abandon claim.');
    }
  };

  const openVerdictSheet = (post: PostData) => {
    setSelectedPost(post);
    setVerdict('VALIDATED');
    setVerdictHeader('');
    setVerdictDesc('');
    setVerdictUrls('');
    verdictSheetRef.current?.expand();
  };

  const closeVerdictSheet = () => {
    verdictSheetRef.current?.close();
    setSelectedPost(null);
  };

  const handleSubmitVerdict = async () => {
    if (!selectedPost || !session) return;
    if (!verdictHeader.trim() || !verdictDesc.trim()) {
      Alert.alert('Missing fields', 'Header and Description are required.');
      return;
    }

    setSubmittingVerdict(true);
    try {
      await submitVerdict(
        selectedPost.id,
        {
          verdict,
          header: verdictHeader.trim(),
          description: verdictDesc.trim(),
          referenceUrls: verdictUrls.split('\n').filter((u) => u.trim() !== ''),
        },
        session
      );
      Alert.alert('Success', 'Verdict submitted successfully.');
      closeVerdictSheet();
      fetchData(true);
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to submit verdict.';
      Alert.alert('Error', msg);
    } finally {
      setSubmittingVerdict(false);
    }
  };

  const data = tab === 'queue' ? queuePosts : claimedPosts;

  return (
    <View style={styles.screen}>
      <Header title="Moderation Dashboard" />

      <View style={styles.subtitle}>
        <Text style={styles.subtitleText}>Review and verify reported submissions</Text>
      </View>

      <View style={styles.toggleRow}>
        <TouchableOpacity style={[styles.toggleBtn, tab === 'queue' && styles.toggleBtnActive]} onPress={() => setTab('queue')}>
          <Text style={[styles.toggleText, tab === 'queue' && styles.toggleTextActive]}>Queue</Text>
          {queuePosts.length > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{queuePosts.length}</Text>
            </View>
          )}
        </TouchableOpacity>

        <TouchableOpacity style={[styles.toggleBtn, tab === 'claimed' && styles.toggleBtnActive]} onPress={() => setTab('claimed')}>
          <Text style={[styles.toggleText, tab === 'claimed' && styles.toggleTextActive]}>My Claims</Text>
          {claimedPosts.length > 0 && (
            <View style={[styles.badge, { backgroundColor: Colors.accentPrimary }]}>
              <Text style={styles.badgeText}>{claimedPosts.length}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={Colors.accentPrimary} />
        </View>
      ) : (
        <FlatList
          data={data}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <PostCard
              post={item}
              showModerationActions={tab === 'queue'}
              showVerdictActions={tab === 'claimed'}
              timeLeft="24h"
              onClaim={() => handleClaim(item.id)}
              onIgnore={() => Alert.alert('Ignore', 'Post ignored locally.')}
              onSubmitVerdict={() => openVerdictSheet(item)}
              onAbandon={() => handleAbandon(item.id)}
            />
          )}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={Colors.accentPrimary} />}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                {tab === 'queue' ? 'No pending posts in queue.' : 'You have no active claims.'}
              </Text>
            </View>
          }
        />
      )}

      <BottomSheet
        ref={verdictSheetRef}
        index={-1}
        snapPoints={snapPoints}
        enablePanDownToClose
        backgroundStyle={styles.sheetBg}
        handleIndicatorStyle={{ backgroundColor: Colors.borderDefault }}>
        <BottomSheetScrollView contentContainerStyle={styles.sheetContent}>
          <Text style={styles.sheetTitle}>Submit Verdict</Text>
          <Text style={styles.sheetSubtitle}>Provide your verified assessment of the claim</Text>

          <View style={styles.verdictToggle}>
            <TouchableOpacity style={[styles.vBtn, verdict === 'VALIDATED' && styles.vBtnVal]} onPress={() => setVerdict('VALIDATED')}>
              <Text style={[styles.vBtnText, verdict === 'VALIDATED' && styles.vBtnTextActive]}>VALIDATED</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.vBtn, verdict === 'DEBUNKED' && styles.vBtnDeb]} onPress={() => setVerdict('DEBUNKED')}>
              <Text style={[styles.vBtnText, verdict === 'DEBUNKED' && styles.vBtnTextActive]}>DEBUNKED</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.label}>Header / Verdict Title *</Text>
          <TextInput
            style={styles.input}
            value={verdictHeader}
            onChangeText={setVerdictHeader}
            placeholder="e.g. This claim is based on outdated data"
            placeholderTextColor={Colors.textMuted}
          />

          <Text style={styles.label}>Detailed Explanation *</Text>
          <TextInput
            style={[styles.input, { height: 100 }]}
            value={verdictDesc}
            onChangeText={setVerdictDesc}
            placeholder="Provide reasoning and context..."
            placeholderTextColor={Colors.textMuted}
            multiline
          />

          <Text style={styles.label}>Reference URLs (One per line)</Text>
          <TextInput
            style={[styles.input, { height: 80 }]}
            value={verdictUrls}
            onChangeText={setVerdictUrls}
            placeholder="https://sources.com/data"
            placeholderTextColor={Colors.textMuted}
            multiline
            autoCapitalize="none"
          />

          <TouchableOpacity style={[styles.submitBtn, submittingVerdict && { opacity: 0.6 }]} onPress={handleSubmitVerdict} disabled={submittingVerdict}>
            {submittingVerdict ? <ActivityIndicator color="#FFF" /> : <Text style={styles.submitBtnText}>PUBLISH VERDICT</Text>}
          </TouchableOpacity>
        </BottomSheetScrollView>
      </BottomSheet>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.bgPrimary },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  subtitle: { paddingHorizontal: Spacing.base, paddingBottom: 12 },
  subtitleText: { fontFamily: Fonts.oxanium, fontSize: 13, color: Colors.textSecondary },
  toggleRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.base,
    paddingBottom: Spacing.md,
  },
  toggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: Spacing.base,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: Colors.bgSecondary,
    borderWidth: 1,
    borderColor: Colors.borderDefault,
  },
  toggleBtnActive: {
    backgroundColor: Colors.bgTertiary,
    borderColor: Colors.accentPrimary,
  },
  toggleText: { fontFamily: Fonts.oxaniumBold, fontSize: 13, color: Colors.textSecondary },
  toggleTextActive: { color: Colors.accentPrimary },
  badge: {
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: Colors.redDebunked,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  badgeText: { fontSize: 10, color: '#FFFFFF', fontWeight: 'bold' },
  list: { paddingHorizontal: Spacing.base, paddingBottom: 100 },
  emptyContainer: { padding: 40, alignItems: 'center' },
  emptyText: { fontFamily: Fonts.oxanium, color: Colors.textMuted, textAlign: 'center' },

  sheetBg: { backgroundColor: Colors.bgSecondary },
  sheetContent: { padding: 20 },
  sheetTitle: { fontFamily: Fonts.orbitron, fontSize: 20, color: Colors.textPrimary, marginBottom: 4 },
  sheetSubtitle: { fontFamily: Fonts.oxanium, fontSize: 14, color: Colors.textSecondary, marginBottom: 20 },
  verdictToggle: { flexDirection: 'row', gap: 12, marginBottom: 20 },
  vBtn: {
    flex: 1,
    height: 44,
    borderRadius: 10,
    backgroundColor: Colors.bgTertiary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.borderDefault,
  },
  vBtnVal: { backgroundColor: Colors.greenValidated + '20', borderColor: Colors.greenValidated },
  vBtnDeb: { backgroundColor: Colors.redDebunked + '20', borderColor: Colors.redDebunked },
  vBtnText: { fontFamily: Fonts.oxaniumBold, fontSize: 13, color: Colors.textSecondary },
  vBtnTextActive: { color: Colors.textPrimary },
  label: {
    fontFamily: Fonts.oxaniumBold,
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  input: {
    backgroundColor: Colors.bgTertiary,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.borderDefault,
    color: Colors.textPrimary,
    padding: 12,
    fontFamily: Fonts.oxanium,
    marginBottom: 20,
  },
  submitBtn: {
    height: 50,
    backgroundColor: Colors.accentPrimary,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  submitBtnText: { fontFamily: Fonts.oxaniumBold, fontSize: 15, color: '#FFF' },
});
