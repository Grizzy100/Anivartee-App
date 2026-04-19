import { useSession } from '@/ctx';
import {
  abandonModerationClaim,
  claimModerationPost,
  getClaimedQueuePage,
  getFeedPage,
  getModerationQueuePage,
  QueueItemDto,
  submitModerationVerdict,
} from '@/lib/api';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Modal,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

type FeedOrQueueItem = {
  id: string;
  title?: string;
  content?: string;
  status?: string;
  createdAt?: string;
};

type ModerationTab = 'queue' | 'claimed';

function resolveQueuePostId(item: QueueItemDto): string | null {
  return item.postId || item.post?.id || null;
}

export default function ExploreScreen() {
  const { user, session, signOut } = useSession();
  const isFactChecker = user?.role === 'FACT_CHECKER';
  const [items, setItems] = useState<FeedOrQueueItem[]>([]);
  const [queueItems, setQueueItems] = useState<QueueItemDto[]>([]);
  const [claimedItems, setClaimedItems] = useState<QueueItemDto[]>([]);
  const [moderationTab, setModerationTab] = useState<ModerationTab>('queue');
  const [busyPostId, setBusyPostId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [verdictModalOpen, setVerdictModalOpen] = useState(false);
  const [verdictPostId, setVerdictPostId] = useState<string | null>(null);
  const [verdictType, setVerdictType] = useState<'VALIDATED' | 'DEBUNKED'>('VALIDATED');
  const [verdictHeader, setVerdictHeader] = useState('');
  const [verdictDescription, setVerdictDescription] = useState('');
  const [verdictSources, setVerdictSources] = useState('');

  const requestFn = useMemo(
    () => (isFactChecker ? getModerationQueuePage : getFeedPage),
    [isFactChecker]
  );

  const load = useCallback(async (silent = false) => {
    if (!session) return;
    if (!silent) setLoading(true);
    setError(null);

    try {
      if (isFactChecker) {
        const [queueResponse, claimedResponse] = await Promise.all([
          getModerationQueuePage(session, 1, 20),
          getClaimedQueuePage(session, 1, 20),
        ]);

        setQueueItems(Array.isArray(queueResponse.data) ? queueResponse.data : []);
        setClaimedItems(Array.isArray(claimedResponse.data) ? claimedResponse.data : []);
      } else {
        const response = await requestFn(session, 1, 20);
        setItems(Array.isArray(response.data) ? response.data : []);
      }
    } catch (err: any) {
      if (err?.status === 401) {
        await signOut();
      }
      setError(err?.message || 'Failed to load');
      setItems([]);
      setQueueItems([]);
      setClaimedItems([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [isFactChecker, requestFn, session, signOut]);

  const onClaim = useCallback(async (postId: string | null) => {
    if (!session || !postId) {
      setError('Unable to claim this post right now');
      return;
    }
    setBusyPostId(postId);
    try {
      await claimModerationPost(postId, session);
      await load(true);
    } catch (err: any) {
      setError(err?.message || 'Failed to claim post');
    } finally {
      setBusyPostId(null);
    }
  }, [load, session]);

  const onAbandon = useCallback(async (postId: string | null) => {
    if (!session || !postId) {
      setError('Unable to abandon this claim right now');
      return;
    }
    setBusyPostId(postId);
    try {
      await abandonModerationClaim(postId, session);
      await load(true);
    } catch (err: any) {
      setError(err?.message || 'Failed to abandon claim');
    } finally {
      setBusyPostId(null);
    }
  }, [load, session]);

  const openVerdictModal = useCallback((postId: string | null) => {
    if (!postId) {
      setError('Unable to open verdict form for this post');
      return;
    }
    setVerdictPostId(postId);
    setVerdictType('VALIDATED');
    setVerdictHeader('');
    setVerdictDescription('');
    setVerdictSources('');
    setVerdictModalOpen(true);
  }, []);

  const submitVerdict = useCallback(async () => {
    if (!session || !verdictPostId) return;

    const sources = verdictSources
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);

    if (verdictHeader.trim().length < 6) {
      setError('Verdict header must be at least 6 characters');
      return;
    }
    if (sources.length === 0) {
      setError('Add at least one source URL');
      return;
    }

    setBusyPostId(verdictPostId);
    try {
      await submitModerationVerdict(
        verdictPostId,
        {
          verdict: verdictType,
          header: verdictHeader.trim(),
          description: verdictDescription.trim() || undefined,
          referenceUrls: sources,
        },
        session
      );

      setVerdictModalOpen(false);
      setVerdictPostId(null);
      await load(true);
    } catch (err: any) {
      setError(err?.message || 'Failed to submit verdict');
    } finally {
      setBusyPostId(null);
    }
  }, [load, session, verdictDescription, verdictHeader, verdictPostId, verdictSources, verdictType]);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color="#7BA3FF" />
      </View>
    );
  }

  const activeModerationItems = moderationTab === 'queue' ? queueItems : claimedItems;

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <Text style={styles.title}>{isFactChecker ? 'Moderation Queue' : 'Explore Feed'}</Text>
        <Text style={styles.subtitle}>
          {isFactChecker ? 'Claims waiting for verification' : 'Recent posts from the community'}
        </Text>
      </View>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      {isFactChecker ? (
        <View style={styles.tabRow}>
          <Pressable
            onPress={() => setModerationTab('queue')}
            style={[styles.tabBtn, moderationTab === 'queue' && styles.tabBtnActive]}
          >
            <Text style={[styles.tabText, moderationTab === 'queue' && styles.tabTextActive]}>
              Queue ({queueItems.length})
            </Text>
          </Pressable>
          <Pressable
            onPress={() => setModerationTab('claimed')}
            style={[styles.tabBtn, moderationTab === 'claimed' && styles.tabBtnActive]}
          >
            <Text style={[styles.tabText, moderationTab === 'claimed' && styles.tabTextActive]}>
              My Claims ({claimedItems.length})
            </Text>
          </Pressable>
        </View>
      ) : null}

      <FlatList
        data={isFactChecker ? activeModerationItems : items}
        keyExtractor={(item) => item.id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => {
          setRefreshing(true);
          load(true);
        }} tintColor="#7BA3FF" />}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          isFactChecker ? (
            <View style={styles.rowCard}>
              <Text style={styles.rowTitle}>{(item as QueueItemDto).post?.title || 'Untitled claim'}</Text>
              <Text style={styles.rowBody}>{(item as QueueItemDto).post?.description || 'No description available.'}</Text>
              <Text style={styles.rowMeta}>{(item as QueueItemDto).status}</Text>

              <View style={styles.actionRow}>
                {moderationTab === 'queue' ? (
                  <Pressable
                    disabled={busyPostId === (item as QueueItemDto).postId}
                    onPress={() => onClaim(resolveQueuePostId(item as QueueItemDto))}
                    style={[styles.actionBtn, styles.claimBtn]}
                  >
                    <Text style={styles.actionBtnText}>{busyPostId === (item as QueueItemDto).postId ? '...' : 'Claim'}</Text>
                  </Pressable>
                ) : (
                  <>
                    <Pressable
                      disabled={busyPostId === (item as QueueItemDto).postId}
                      onPress={() => openVerdictModal(resolveQueuePostId(item as QueueItemDto))}
                      style={[styles.actionBtn, styles.verdictBtn]}
                    >
                      <Text style={styles.actionBtnText}>Submit Verdict</Text>
                    </Pressable>
                    <Pressable
                      disabled={busyPostId === (item as QueueItemDto).postId}
                      onPress={() => onAbandon(resolveQueuePostId(item as QueueItemDto))}
                      style={[styles.actionBtn, styles.abandonBtn]}
                    >
                      <Text style={styles.actionBtnText}>{busyPostId === (item as QueueItemDto).postId ? '...' : 'Abandon'}</Text>
                    </Pressable>
                  </>
                )}
              </View>
            </View>
          ) : (
            <View style={styles.rowCard}>
              <Text style={styles.rowTitle}>{item.title || item.content || 'Untitled item'}</Text>
              <Text style={styles.rowMeta}>{item.status || 'ACTIVE'}</Text>
            </View>
          )
        )}
        ListEmptyComponent={
          <View style={styles.emptyWrap}>
            <Text style={styles.emptyText}>No items to show right now.</Text>
          </View>
        }
      />

      <Modal
        visible={verdictModalOpen}
        animationType="slide"
        transparent
        onRequestClose={() => setVerdictModalOpen(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Submit Verdict</Text>

            <View style={styles.switchRow}>
              <Pressable
                onPress={() => setVerdictType('VALIDATED')}
                style={[styles.switchBtn, verdictType === 'VALIDATED' && styles.switchBtnActive]}
              >
                <Text style={[styles.switchText, verdictType === 'VALIDATED' && styles.switchTextActive]}>VALIDATED</Text>
              </Pressable>
              <Pressable
                onPress={() => setVerdictType('DEBUNKED')}
                style={[styles.switchBtn, verdictType === 'DEBUNKED' && styles.switchBtnActive]}
              >
                <Text style={[styles.switchText, verdictType === 'DEBUNKED' && styles.switchTextActive]}>DEBUNKED</Text>
              </Pressable>
            </View>

            <TextInput
              value={verdictHeader}
              onChangeText={setVerdictHeader}
              placeholder="Header (min 6 chars)"
              placeholderTextColor="#7F8EAD"
              style={styles.input}
            />
            <TextInput
              value={verdictDescription}
              onChangeText={setVerdictDescription}
              placeholder="Description"
              placeholderTextColor="#7F8EAD"
              style={[styles.input, styles.multilineInput]}
              multiline
            />
            <TextInput
              value={verdictSources}
              onChangeText={setVerdictSources}
              placeholder="One source URL per line"
              placeholderTextColor="#7F8EAD"
              style={[styles.input, styles.multilineInput]}
              multiline
            />

            <View style={styles.modalActions}>
              <Pressable onPress={() => setVerdictModalOpen(false)} style={[styles.actionBtn, styles.abandonBtn]}>
                <Text style={styles.actionBtnText}>Cancel</Text>
              </Pressable>
              <Pressable onPress={submitVerdict} style={[styles.actionBtn, styles.verdictBtn]}>
                <Text style={styles.actionBtnText}>Submit</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#090F1F',
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#090F1F',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 12,
  },
  title: {
    color: '#F2F7FF',
    fontSize: 24,
    fontWeight: '700',
  },
  subtitle: {
    marginTop: 6,
    color: '#9CB0D3',
    fontSize: 13,
  },
  error: {
    marginHorizontal: 20,
    marginBottom: 8,
    color: '#FFB9B9',
    fontSize: 12,
  },
  tabRow: {
    paddingHorizontal: 20,
    flexDirection: 'row',
    gap: 10,
    marginBottom: 8,
  },
  tabBtn: {
    flex: 1,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#263B66',
    backgroundColor: '#0F1A33',
    paddingVertical: 10,
    alignItems: 'center',
  },
  tabBtnActive: {
    backgroundColor: '#1B3466',
    borderColor: '#3A63A8',
  },
  tabText: {
    color: '#9EB2D6',
    fontSize: 12,
    fontWeight: '600',
  },
  tabTextActive: {
    color: '#EAF1FF',
  },
  list: {
    paddingHorizontal: 20,
    paddingBottom: 30,
    gap: 10,
  },
  rowCard: {
    backgroundColor: '#101C34',
    borderWidth: 1,
    borderColor: '#1A2A4A',
    borderRadius: 14,
    padding: 14,
  },
  rowTitle: {
    color: '#EAF1FF',
    fontSize: 14,
    fontWeight: '600',
  },
  rowMeta: {
    marginTop: 8,
    color: '#8FA6CE',
    fontSize: 11,
    textTransform: 'uppercase',
  },
  rowBody: {
    marginTop: 8,
    color: '#A7B7D6',
    fontSize: 12,
  },
  actionRow: {
    marginTop: 12,
    flexDirection: 'row',
    gap: 10,
  },
  actionBtn: {
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  claimBtn: {
    backgroundColor: '#225089',
  },
  abandonBtn: {
    backgroundColor: '#4C2A2A',
  },
  verdictBtn: {
    backgroundColor: '#2E6A3E',
  },
  actionBtnText: {
    color: '#EAF1FF',
    fontSize: 12,
    fontWeight: '600',
  },
  emptyWrap: {
    marginTop: 20,
    alignItems: 'center',
  },
  emptyText: {
    color: '#93A6C8',
    fontSize: 13,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  modalCard: {
    backgroundColor: '#101C34',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#2D4371',
    padding: 16,
    gap: 10,
  },
  modalTitle: {
    color: '#F2F7FF',
    fontSize: 18,
    fontWeight: '700',
  },
  switchRow: {
    flexDirection: 'row',
    gap: 8,
  },
  switchBtn: {
    flex: 1,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#30466F',
    backgroundColor: '#0D172D',
    paddingVertical: 8,
    alignItems: 'center',
  },
  switchBtnActive: {
    backgroundColor: '#1B3466',
    borderColor: '#3A63A8',
  },
  switchText: {
    color: '#9EB2D6',
    fontSize: 12,
    fontWeight: '600',
  },
  switchTextActive: {
    color: '#EAF1FF',
  },
  input: {
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#2D4371',
    backgroundColor: '#0D172D',
    color: '#EAF1FF',
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
  },
  multilineInput: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: 4,
  },
});
