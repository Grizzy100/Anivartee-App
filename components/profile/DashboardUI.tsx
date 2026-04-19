import { Ionicons } from '@expo/vector-icons';
import React, { memo } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View, type TextStyle, type ViewStyle } from 'react-native';

export const DASH_COLORS = {
  bg: '#020817',
  card: '#0f172a',
  border: '#1e293b',
  text: '#e2e8f0',
  subtext: '#94a3b8',
  primary: '#2563eb',
  success: '#10b981',
  warning: '#f59e0b',
  danger: '#ef4444',
};

export const DASH_SPACING = { xs: 6, sm: 8, md: 12, lg: 16, xl: 20 };
export const DASH_RADIUS = { sm: 8, md: 12, lg: 16 };

export const Badge = ({ text, color = DASH_COLORS.primary, style }: { text: string; color?: string; style?: ViewStyle }) => (
  <View style={[styles.badge, { backgroundColor: color + '20' }, style]}>
    <Text style={[styles.badgeText, { color }]}>{text}</Text>
  </View>
);

export const IconText = ({
  icon,
  text,
  style,
  textStyle,
  onPress,
}: {
  icon: any;
  text: string | number;
  style?: ViewStyle;
  textStyle?: TextStyle;
  onPress?: () => void;
}) => {
  const Container = onPress ? TouchableOpacity : View;
  return (
    <Container style={[styles.iconText, style]} onPress={onPress}>
      <Ionicons name={icon} size={16} color={DASH_COLORS.subtext} />
      <Text style={[styles.iconTextLabel, textStyle]}>{text}</Text>
    </Container>
  );
};

export const ProfileCard = ({ user }: { user: any }) => (
  <View style={styles.profileCard}>
    <View style={styles.profileTopRow}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{user?.username?.charAt(0).toUpperCase() || 'U'}</Text>
      </View>
      <View style={styles.profileInfo}>
        <Text style={styles.username}>{user?.username || 'Username'}</Text>
        <View style={styles.badgeRow}>
          <Badge text={user?.rank || 'NOVICE'} color={DASH_COLORS.primary} />
          <Text style={styles.roleText}>{user?.role === 'FACT_CHECKER' ? 'Fact Checker' : 'User'}</Text>
        </View>
      </View>
    </View>

    <View style={styles.statsRow}>
      <View style={styles.statBox}>
        <Ionicons name="document-text-outline" size={24} color={DASH_COLORS.primary} />
        <Text style={styles.statNumber}>{user?.postsCount || 0}</Text>
        <Text style={styles.statLabel}>Posts</Text>
      </View>
      <View style={styles.statBox}>
        <Ionicons name="heart-outline" size={24} color={DASH_COLORS.danger} />
        <Text style={styles.statNumber}>{user?.likesCount || 0}</Text>
        <Text style={styles.statLabel}>Likes</Text>
      </View>
    </View>

    <View style={styles.profileBottomRow}>
      <Text style={styles.pointsText}>⚡ {user?.points || 0} pts</Text>
      <Text style={styles.lvlText}>LVL {user?.level || 1} - {user?.rank || 'NOVICE'}</Text>
    </View>
  </View>
);

export const FilterTabs = ({
  tabs,
  activeTab,
  onTabChange,
}: {
  tabs: string[];
  activeTab: string;
  onTabChange: (tab: string) => void;
}) => (
  <View style={styles.filterTabsWrapper}>
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterTabsContainer}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab;
        return (
          <TouchableOpacity
            key={tab}
            onPress={() => onTabChange(tab)}
            style={[styles.tabBtn, isActive && styles.tabBtnActive]}
            activeOpacity={0.7}>
            <Text style={[styles.tabText, isActive && styles.tabTextActive]}>{tab}</Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  </View>
);

const getStatusColor = (status: string) => {
  switch (status.toUpperCase()) {
    case 'PENDING':
      return DASH_COLORS.subtext;
    case 'UNDER REVIEW':
      return DASH_COLORS.warning;
    case 'VALIDATED':
    case 'VERIFIED':
      return DASH_COLORS.success;
    case 'DEBUNKED':
      return DASH_COLORS.danger;
    default:
      return DASH_COLORS.subtext;
  }
};

export const DashboardPostCard = memo(({ post }: { post: any }) => (
  <TouchableOpacity style={styles.postCard} activeOpacity={0.96}>
    <View style={styles.postHeader}>
      <View style={styles.postHeaderLeft}>
        <View style={styles.postAvatar}>
          <Text style={styles.postAvatarText}>{post.author?.charAt(0).toUpperCase() || 'U'}</Text>
        </View>
        <View>
          <View style={styles.postAuthorRow}>
            <Text style={styles.postAuthor}>{post.author}</Text>
            <Badge text="NOVICE" color={DASH_COLORS.primary} style={{ paddingHorizontal: 6, paddingVertical: 2 }} />
          </View>
          <Text style={styles.postDate}>{post.date}</Text>
        </View>
      </View>
      <View style={styles.postHeaderRight}>
        <View style={styles.statusBadge}>
          <Ionicons name="time-outline" size={12} color={getStatusColor(post.status)} />
          <Text style={[styles.statusText, { color: getStatusColor(post.status) }]}>{post.status.toUpperCase()}</Text>
        </View>
        <TouchableOpacity style={styles.menuBtn}>
          <Ionicons name="ellipsis-horizontal" size={16} color={DASH_COLORS.subtext} />
        </TouchableOpacity>
      </View>
    </View>

    <Text style={styles.postTitle}>{post.title}</Text>
    <Text style={styles.postBody}>{post.body}</Text>

    <View style={styles.divider} />

    <View style={styles.postActions}>
      <View style={styles.postActionsLeft}>
        <IconText icon="heart-outline" text={post.likes} style={{ marginRight: DASH_SPACING.lg }} />
        <IconText icon="flag-outline" text="" style={{ marginRight: DASH_SPACING.lg }} />
        <IconText icon="chatbubble-outline" text={post.comments} style={{ marginRight: DASH_SPACING.lg }} />
        <IconText icon="share-social-outline" text="Share" />
      </View>
      <IconText icon="bookmark-outline" text="Save" />
    </View>
  </TouchableOpacity>
));

const styles = StyleSheet.create({
  profileCard: {
    backgroundColor: DASH_COLORS.card,
    borderRadius: DASH_RADIUS.lg,
    borderWidth: 1,
    borderColor: DASH_COLORS.border,
    padding: DASH_SPACING.lg,
    marginBottom: DASH_SPACING.lg,
  },
  profileTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: DASH_SPACING.lg,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: DASH_COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: DASH_SPACING.md,
  },
  avatarText: {
    color: DASH_COLORS.text,
    fontSize: 20,
    fontWeight: 'bold',
  },
  profileInfo: {
    flex: 1,
  },
  username: {
    color: DASH_COLORS.text,
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: DASH_SPACING.sm,
  },
  roleText: {
    color: DASH_COLORS.subtext,
    fontSize: 12,
  },
  statsRow: {
    flexDirection: 'row',
    gap: DASH_SPACING.md,
    marginBottom: DASH_SPACING.lg,
  },
  statBox: {
    flex: 1,
    backgroundColor: DASH_COLORS.bg,
    borderRadius: DASH_RADIUS.md,
    padding: DASH_SPACING.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: DASH_COLORS.border,
  },
  statNumber: {
    color: DASH_COLORS.text,
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 4,
  },
  statLabel: {
    color: DASH_COLORS.subtext,
    fontSize: 12,
  },
  profileBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: DASH_SPACING.md,
    borderTopWidth: 1,
    borderTopColor: DASH_COLORS.border,
  },
  pointsText: {
    color: DASH_COLORS.warning,
    fontWeight: 'bold',
    fontSize: 14,
  },
  lvlText: {
    color: DASH_COLORS.subtext,
    fontSize: 12,
    fontWeight: 'bold',
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: DASH_RADIUS.sm,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  iconText: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    minHeight: 32,
  },
  iconTextLabel: {
    color: DASH_COLORS.subtext,
    fontSize: 13,
  },
  filterTabsWrapper: {
    marginBottom: DASH_SPACING.lg,
  },
  filterTabsContainer: {
    paddingHorizontal: DASH_SPACING.xs,
  },
  tabBtn: {
    paddingHorizontal: DASH_SPACING.lg,
    paddingVertical: DASH_SPACING.sm,
    borderRadius: DASH_RADIUS.lg,
    borderWidth: 1,
    borderColor: 'transparent',
    marginRight: DASH_SPACING.sm,
  },
  tabBtnActive: {
    backgroundColor: DASH_COLORS.border,
    borderColor: DASH_COLORS.border,
  },
  tabText: {
    color: DASH_COLORS.subtext,
    fontSize: 14,
    fontWeight: '500',
  },
  tabTextActive: {
    color: DASH_COLORS.text,
    fontWeight: 'bold',
  },
  postCard: {
    backgroundColor: DASH_COLORS.card,
    borderRadius: DASH_RADIUS.lg,
    borderWidth: 1,
    borderColor: DASH_COLORS.border,
    padding: DASH_SPACING.lg,
    marginBottom: DASH_SPACING.md,
  },
  postHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: DASH_SPACING.md,
  },
  postHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  postAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: DASH_COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: DASH_SPACING.sm,
  },
  postAvatarText: {
    color: DASH_COLORS.text,
    fontSize: 14,
    fontWeight: 'bold',
  },
  postAuthorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  postAuthor: {
    color: DASH_COLORS.text,
    fontWeight: 'bold',
    fontSize: 14,
  },
  postDate: {
    color: DASH_COLORS.subtext,
    fontSize: 12,
    marginTop: 2,
  },
  postHeaderRight: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: DASH_SPACING.sm,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: DASH_COLORS.bg,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: DASH_RADIUS.sm,
    borderWidth: 1,
    borderColor: DASH_COLORS.border,
  },
  statusText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  menuBtn: {
    padding: 4,
  },
  postTitle: {
    color: DASH_COLORS.text,
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: DASH_SPACING.sm,
  },
  postBody: {
    color: DASH_COLORS.subtext,
    fontSize: 14,
    lineHeight: 20,
  },
  divider: {
    height: 1,
    backgroundColor: DASH_COLORS.border,
    marginVertical: DASH_SPACING.md,
  },
  postActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  postActionsLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
