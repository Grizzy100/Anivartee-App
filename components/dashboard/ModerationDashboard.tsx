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

import PostCard, { type PostData } from '../feed/PostCard';
import { Colors } from '../../constants/colors';
import { Fonts } from '../../constants/fonts';
import { Spacing } from '../../constants/layout';
import {
  abandonClaim,
  claimPost,
  getClaimedPosts,
  getModerationQueue,
  submitVerdict,
} from '../../lib/api/postApi';
import { getMyPoints } from '../../lib/api/dashboardApi';

interface ModerationDashboardProps {
  session: string;
  activeSubTab: 'queue' | 'claimed';
}

type VerdictLimits = {
  maxHeaderLength: number;
  maxDescriptionLength: number;
  postPoints: number;
};

const DEFAULT_VERDICT_LIMITS: VerdictLimits = {
  maxHeaderLength: 100,
  maxDescriptionLength: 250,
  postPoints: 2,
};

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
    claimExpiresAt: raw?.claim?.expiresAt || raw?.expiresAt || post?.claimExpiresAt || null,
  };
}

function getTimeLeft(expiresAt?: string | null, nowMs?: number) {
  if (!expiresAt) return undefined;
  const expireMs = new Date(expiresAt).getTime();
  if (Number.isNaN(expireMs)) return undefined;
  const diff = expireMs - (nowMs ?? Date.now());
  if (diff <= 0) return 'Expired';
  const totalSeconds = Math.floor(diff / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}m ${String(seconds).padStart(2, '0')}s`;
}

export default function ModerationDashboard({ session, activeSubTab }: ModerationDashboardProps) {
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
  const [verdictLimits, setVerdictLimits] = useState<VerdictLimits>(DEFAULT_VERDICT_LIMITS);
  const [nowTick, setNowTick] = useState(Date.now());

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
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [session]);

  useEffect(() => {
    fetchData();
  }, [fetchData, activeSubTab]); // Refresh when tab changes or initially

  useEffect(() => {
    if (!session) {
      setVerdictLimits(DEFAULT_VERDICT_LIMITS);
      return;
    }

    getMyPoints(session)
      .then((response) => {
        const limits = (response.data as any)?.limits;
        if (!limits) return;

        setVerdictLimits({
          maxHeaderLength: Number(limits.maxHeaderLength) || DEFAULT_VERDICT_LIMITS.maxHeaderLength,
          maxDescriptionLength: Number(limits.maxDescriptionLength) || DEFAULT_VERDICT_LIMITS.maxDescriptionLength,
          postPoints: Number(limits.postPoints) || DEFAULT_VERDICT_LIMITS.postPoints,
        });
      })
      .catch(() => {
        setVerdictLimits(DEFAULT_VERDICT_LIMITS);
      });
  }, [session]);

  useEffect(() => {
    if (activeSubTab !== 'claimed') return;
    const timer = setInterval(() => setNowTick(Date.now()), 1000);
    return () => clearInterval(timer);
  }, [activeSubTab]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchData(true);
  };

  const handleClaim = async (id: string) => {
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
    if (!selectedPost) return;
    if (!verdictHeader.trim() || !verdictDesc.trim()) {
      Alert.alert('Missing fields', 'Header and Description are required.');
      return;
    }
    if (verdictHeader.trim().length > verdictLimits.maxHeaderLength) {
      Alert.alert('Header too long', `Header must be ${verdictLimits.maxHeaderLength} characters or less for your rank.`);
      return;
    }
    if (verdictDesc.trim().length > verdictLimits.maxDescriptionLength) {
      Alert.alert('Description too long', `Description must be ${verdictLimits.maxDescriptionLength} characters or less for your rank.`);
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

  const data = activeSubTab === 'queue' ? queuePosts : claimedPosts;

  return (
    <View style={styles.container}>
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
              showModerationActions={activeSubTab === 'queue'}
              showVerdictActions={activeSubTab === 'claimed'}
              timeLeft={activeSubTab === 'claimed' ? getTimeLeft((item as any).claimExpiresAt, nowTick) : undefined}
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
                {activeSubTab === 'queue' ? 'No pending posts in queue.' : 'You have no active claims.'}
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
            maxLength={verdictLimits.maxHeaderLength}
          />
          <Text style={styles.limitText}>{verdictHeader.trim().length}/{verdictLimits.maxHeaderLength}</Text>

          <Text style={styles.label}>Detailed Explanation *</Text>
          <TextInput
            style={[styles.input, { height: 100 }]}
            value={verdictDesc}
            onChangeText={setVerdictDesc}
            placeholder="Provide reasoning and context..."
            placeholderTextColor={Colors.textMuted}
            multiline
            maxLength={verdictLimits.maxDescriptionLength}
          />
          <Text style={styles.limitText}>{verdictDesc.trim().length}/{verdictLimits.maxDescriptionLength}</Text>

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
          <Text style={styles.pointsHint}>Publishing a verdict awards +{verdictLimits.postPoints} points at your current rank.</Text>
        </BottomSheetScrollView>
      </BottomSheet>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  list: { paddingHorizontal: 0, paddingBottom: 100 },
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
  limitText: {
    marginTop: -14,
    marginBottom: 14,
    textAlign: 'right',
    color: Colors.textMuted,
    fontSize: 11,
    fontFamily: Fonts.oxanium,
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
  pointsHint: {
    marginTop: 8,
    color: Colors.textMuted,
    fontSize: 11,
    fontFamily: Fonts.oxanium,
  },
});
