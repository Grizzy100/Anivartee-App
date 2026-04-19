import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Pressable, Share, StyleSheet, Text, View } from 'react-native';

import Avatar from '@/components/ui/Avatar';
import RankBadge from '@/components/ui/RankBadge';
import SourceChip from '@/components/ui/SourceChip';
import StatusBadge, { type PostStatus } from '@/components/ui/StatusBadge';
import { Colors } from '@/constants/colors';
import { Fonts } from '@/constants/fonts';
import { Radius, Spacing } from '@/constants/layout';
import type { RankLevel } from '@/ctx';

export type PostAuthor = {
  id?: string;
  username: string;
  displayName?: string | null;
  avatarUrl?: string | null;
  role?: string;
  rankName?: RankLevel;
  rankLevel?: number;
  points?: number;
};

export type PostData = {
  id: string;
  title: string;
  url?: string;
  description?: string | null;
  status: PostStatus;
  userId?: string;
  createdAt?: string;
  totalLikes?: number;
  author: PostAuthor;
  liked?: boolean;
  saved?: boolean;
  flagged?: boolean;
  commentsCount?: number;
  factChecks?: {
    id: string;
    verdict: PostStatus;
    header: string;
    description?: string | null;
    referenceUrls: string[];
  }[];
};

type PostCardProps = {
  post: PostData;
  showModerationActions?: boolean;
  showVerdictActions?: boolean;
  timeLeft?: string;
  onClaim?: () => void;
  onIgnore?: () => void;
  onSubmitVerdict?: () => void;
  onAbandon?: () => void;
  onLike?: (post: PostData) => void;
  onFlag?: (post: PostData) => void;
  onSave?: (post: PostData) => void;
  onOpen?: (post: PostData) => void;
  isDetailView?: boolean;
};

function accentColorForStatus(status: PostStatus): string | undefined {
  if (status === 'VALIDATED') return Colors.greenValidated;
  if (status === 'DEBUNKED') return Colors.redDebunked;
  return undefined;
}

export default function PostCard({
  post,
  showModerationActions = false,
  showVerdictActions = false,
  timeLeft,
  onClaim,
  onIgnore,
  onSubmitVerdict,
  onAbandon,
  onLike,
  onFlag,
  onSave,
  onOpen,
  isDetailView = false,
}: PostCardProps) {
  const router = useRouter();
  const mainFactCheck = post.factChecks?.[0];
  const isFactCheckerCard = !!mainFactCheck;
  const author = post.author;

  const dateStr = post.createdAt
    ? new Date(post.createdAt).toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
    : '';

  const accentColor = accentColorForStatus(post.status);

  const handleShare = async () => {
    try {
      await Share.share({ message: post.title });
    } catch {
      // Intentionally noop in base UI component.
    }
  };

  const handlePress = () => {
    if (onOpen) {
      onOpen(post);
      return;
    }
    if (!isDetailView) {
      router.push({ pathname: '/posts/[id]' as any, params: { id: post.id } });
    }
  };

  return (
    <View
      style={[
        styles.card,
        accentColor ? { borderLeftWidth: 4, borderLeftColor: accentColor } : null,
        isDetailView && styles.detailCard,
      ]}>
      <Pressable onPress={handlePress} disabled={isDetailView}>
        <View style={styles.headerRow}>
          <Avatar username={author?.username || 'Unknown'} size="sm" />
          <View style={styles.authorBlock}>
            <View style={styles.authorMeta}>
              <Text style={styles.authorName}>{author?.username || 'Unknown'}</Text>
              <RankBadge rank={author?.rankName || 'APPRENTICE'} />
            </View>
            {!!dateStr && <Text style={styles.dateText}>{dateStr}</Text>}
          </View>
          <View style={styles.headerRight}>
            {showVerdictActions && !!timeLeft && (
              <View style={styles.timerBadge}>
                <Ionicons name="timer-outline" size={14} color={Colors.accentPrimary} />
                <Text style={styles.timerText}>{timeLeft}</Text>
              </View>
            )}
            <StatusBadge status={post.status} />
          </View>
        </View>

        <View style={styles.content}>
          <Text style={[styles.title, isDetailView && styles.detailTitle]}>{post.title}</Text>
          {!!post.description && (
            <Text style={styles.body} numberOfLines={isDetailView ? undefined : 3}>
              {post.description}
            </Text>
          )}

          {isFactCheckerCard && mainFactCheck && (
            <View style={styles.factCheckPreview}>
              <View style={styles.factCheckBadge}>
                <Ionicons name="shield-checkmark" size={12} color={Colors.accentPrimary} />
                <Text style={styles.factCheckBadgeText}>Fact Check</Text>
              </View>
              <Text style={styles.factCheckTitle}>{mainFactCheck.header}</Text>
              {!!mainFactCheck.description && <Text style={styles.factCheckBody}>{mainFactCheck.description}</Text>}
            </View>
          )}

          {!!post.factChecks?.length && (
            <View style={styles.sourcesContainer}>
              {post.factChecks[0].referenceUrls.map((url, i) => (
                <SourceChip key={`${post.id}-src-${i}`} url={url} />
              ))}
            </View>
          )}
        </View>
      </Pressable>

      <View style={styles.footer}>
        <View style={styles.footerLeft}>
          <Pressable onPress={() => onLike?.(post)} style={styles.statBtn}>
            <Ionicons name={post.liked ? 'heart' : 'heart-outline'} size={18} color={post.liked ? Colors.redDebunked : Colors.textSecondary} />
            <Text style={[styles.statText, post.liked ? { color: Colors.redDebunked } : null]}>{post.totalLikes ?? 0}</Text>
          </Pressable>
          <Pressable style={styles.statBtn}>
            <Ionicons name="chatbubble-outline" size={18} color={Colors.textSecondary} />
            <Text style={styles.statText}>{post.commentsCount ?? 0}</Text>
          </Pressable>
          <Pressable onPress={() => onFlag?.(post)} style={styles.actionBtn}>
            <Ionicons name={post.flagged ? 'flag' : 'flag-outline'} size={18} color={post.flagged ? Colors.redDebunked : Colors.textSecondary} />
          </Pressable>
          <Pressable onPress={handleShare} style={styles.actionBtn}>
            <Ionicons name="share-outline" size={18} color={Colors.textSecondary} />
          </Pressable>
        </View>

        <View style={styles.footerRight}>
          <Pressable onPress={() => onSave?.(post)} style={styles.actionBtn}>
            <Ionicons name={post.saved ? 'bookmark' : 'bookmark-outline'} size={18} color={post.saved ? Colors.accentPrimary : Colors.textSecondary} />
          </Pressable>
        </View>
      </View>

      {showModerationActions && (
        <View style={styles.moderationRow}>
          <Pressable style={styles.acceptBtn} onPress={onClaim}>
            <Text style={styles.acceptBtnText}>Claim for Fact Check</Text>
          </Pressable>
          <Pressable style={styles.rejectBtn} onPress={onIgnore}>
            <Text style={styles.rejectBtnText}>Dismiss</Text>
          </Pressable>
        </View>
      )}

      {showVerdictActions && (
        <View style={styles.moderationRow}>
          <Pressable style={styles.claimBtn} onPress={onSubmitVerdict}>
            <Text style={styles.claimBtnText}>Submit Verdict</Text>
          </Pressable>
          <Pressable style={styles.ignoreBtn} onPress={onAbandon}>
            <Text style={styles.ignoreBtnText}>Abandon</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.bgSecondary,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.borderDefault,
    padding: Spacing.base,
    marginBottom: Spacing.md,
  },
  detailCard: {
    borderWidth: 0,
    borderRadius: 0,
    marginBottom: 0,
    backgroundColor: 'transparent',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  authorBlock: {
    flex: 1,
  },
  authorMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  authorName: {
    fontFamily: Fonts.oxaniumBold,
    fontSize: 14,
    color: Colors.textPrimary,
  },
  dateText: {
    fontFamily: Fonts.oxanium,
    fontSize: 11,
    color: Colors.textMuted,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  timerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.bgTertiary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: Radius.xs,
  },
  timerText: {
    fontSize: 11,
    color: Colors.accentPrimary,
    fontWeight: '600',
  },
  content: {
    marginBottom: Spacing.sm,
  },
  title: {
    fontFamily: Fonts.oxaniumBold,
    fontSize: 16,
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  detailTitle: {
    fontSize: 20,
    lineHeight: 28,
  },
  body: {
    fontFamily: Fonts.oxanium,
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
    marginBottom: Spacing.sm,
  },
  factCheckPreview: {
    backgroundColor: Colors.bgTertiary,
    borderRadius: Radius.sm,
    borderWidth: 1,
    borderColor: Colors.borderSubtle,
    padding: Spacing.sm,
    marginVertical: Spacing.sm,
  },
  factCheckBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  factCheckBadgeText: {
    fontFamily: Fonts.oxaniumBold,
    fontSize: 10,
    color: Colors.accentPrimary,
    textTransform: 'uppercase',
  },
  factCheckTitle: {
    fontFamily: Fonts.oxaniumBold,
    fontSize: 14,
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  factCheckBody: {
    fontFamily: Fonts.oxanium,
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  sourcesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 4,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Spacing.sm,
    marginTop: Spacing.xs,
    borderTopWidth: 1,
    borderTopColor: Colors.borderSubtle,
  },
  footerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
  },
  footerRight: {},
  statBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statText: {
    fontFamily: Fonts.oxanium,
    fontSize: 12,
    color: Colors.textSecondary,
  },
  actionBtn: {
    padding: 4,
  },
  moderationRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.md,
  },
  acceptBtn: {
    flex: 1,
    height: 40,
    borderRadius: 6,
    backgroundColor: Colors.accentPrimary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  acceptBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  rejectBtn: {
    flex: 1,
    height: 40,
    borderRadius: 6,
    backgroundColor: Colors.bgTertiary,
    borderWidth: 1,
    borderColor: Colors.borderDefault,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rejectBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  claimBtn: {
    flex: 1,
    height: 40,
    borderRadius: 6,
    backgroundColor: Colors.greenValidated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  claimBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  ignoreBtn: {
    flex: 1,
    height: 40,
    borderRadius: 6,
    backgroundColor: Colors.redDebunked + '20',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ignoreBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.redDebunked,
  },
});
