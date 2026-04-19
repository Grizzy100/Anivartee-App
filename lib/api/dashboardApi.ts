import { apiRequest } from './client';

export type ProfileDto = {
  id: string;
  email: string;
  username: string;
  role: 'USER' | 'FACT_CHECKER' | 'ADMIN';
};

export type PointsMeDto = {
  points?: number;
  rank?: string;
  balance?: number;
};

export type PostStatsDto = {
  postsCount?: number;
  likesCount?: number;
  verifiedCount?: number;
};

export type FeedItemDto = {
  id: string;
  title?: string;
  content?: string;
  status?: string;
  createdAt?: string;
};

export type QueuePostDto = {
  id: string;
  title?: string;
  description?: string;
  createdAt?: string;
  status?: string;
  author?: {
    id?: string;
    username?: string;
  };
};

export type QueueClaimDto = {
  id: string;
  factCheckerId: string;
  status: 'ACTIVE' | 'ABANDONED' | 'EXPIRED' | 'RESOLVED';
  claimedAt?: string;
  expiresAt?: string;
};

export type QueueItemDto = {
  id: string;
  status: 'PENDING' | 'CLAIMED' | 'COMPLETED' | 'REMOVED';
  priority?: number;
  addedAt?: string;
  postId?: string;
  post?: QueuePostDto | null;
  claim?: QueueClaimDto | null;
};

export type VerdictPayload = {
  verdict: 'VALIDATED' | 'DEBUNKED';
  header: string;
  description?: string;
  referenceUrls: string[];
};

export type UiPostStatus = 'PENDING' | 'CLAIMED' | 'UNDER_REVIEW' | 'VALIDATED' | 'DEBUNKED' | 'NOT_VALIDATED';

export type UiPostCardItem = {
  id: string;
  title: string;
  description: string | null;
  status: UiPostStatus;
  createdAt: string;
  totalLikes: number;
  commentsCount: number;
  liked?: boolean;
  saved?: boolean;
  flagged?: boolean;
  author: {
    username: string;
    rankName: 'NOVICE' | 'APPRENTICE' | 'JOURNALIST' | 'ANALYST' | 'EXPERT';
  };
};

function normalizePostStatus(input: string | undefined): UiPostStatus {
  const value = String(input || '').toUpperCase();
  if (value === 'PENDING') return 'PENDING';
  if (value === 'CLAIMED') return 'CLAIMED';
  if (value === 'UNDER_REVIEW') return 'UNDER_REVIEW';
  if (value === 'VALIDATED') return 'VALIDATED';
  if (value === 'DEBUNKED') return 'DEBUNKED';
  return 'NOT_VALIDATED';
}

function normalizeRank(input: string | undefined): 'NOVICE' | 'APPRENTICE' | 'JOURNALIST' | 'ANALYST' | 'EXPERT' {
  const value = String(input || '').toUpperCase();
  if (value === 'APPRENTICE') return 'APPRENTICE';
  if (value === 'JOURNALIST') return 'JOURNALIST';
  if (value === 'ANALYST') return 'ANALYST';
  if (value === 'EXPERT') return 'EXPERT';
  return 'NOVICE';
}

export function mapFeedItemToUiPost(item: FeedItemDto): UiPostCardItem {
  return {
    id: String(item.id),
    title: String(item.title || 'Untitled post'),
    description: item.content || null,
    status: normalizePostStatus(item.status),
    createdAt: item.createdAt || new Date().toISOString(),
    totalLikes: 0,
    commentsCount: 0,
    author: {
      username: 'community',
      rankName: 'NOVICE',
    },
  };
}

export function mapQueueItemToUiPost(item: QueueItemDto): UiPostCardItem {
  const post = item.post;
  return {
    id: String(item.postId || post?.id || item.id),
    title: String(post?.title || 'Untitled claim'),
    description: post?.description || null,
    status: normalizePostStatus(post?.status || item.status),
    createdAt: post?.createdAt || item.addedAt || new Date().toISOString(),
    totalLikes: 0,
    commentsCount: 0,
    author: {
      username: String(post?.author?.username || 'unknown'),
      rankName: normalizeRank(undefined),
    },
  };
}

export async function getMyProfile(token: string) {
  return apiRequest<ProfileDto>('user', '/me', { token });
}

export async function getMyPoints(token: string) {
  return apiRequest<PointsMeDto>('points', '/points/me', { token });
}

export async function getUserStats(userId: string, token: string) {
  return apiRequest<PostStatsDto>('post', `/posts/user/${userId}/stats`, { token });
}

export async function getFeedPage(token: string, page = 1, pageSize = 20) {
  return apiRequest<FeedItemDto[]>('post', `/feed?page=${page}&pageSize=${pageSize}`, { token });
}

export async function getModerationQueuePage(token: string, page = 1, pageSize = 20) {
  return apiRequest<QueueItemDto[]>('post', `/moderation/queue?page=${page}&pageSize=${pageSize}`, { token });
}

export async function getClaimedQueuePage(token: string, page = 1, pageSize = 20) {
  return apiRequest<QueueItemDto[]>('post', `/moderation/queue/claimed?page=${page}&pageSize=${pageSize}`, { token });
}

export async function claimModerationPost(postId: string, token: string) {
  return apiRequest<unknown>('post', `/moderation/posts/${postId}/claim`, {
    method: 'POST',
    token,
  });
}

export async function abandonModerationClaim(postId: string, token: string) {
  return apiRequest<unknown>('post', `/moderation/posts/${postId}/claim`, {
    method: 'DELETE',
    token,
  });
}

export async function submitModerationVerdict(postId: string, payload: VerdictPayload, token: string) {
  return apiRequest<unknown>('post', `/moderation/posts/${postId}/verdict`, {
    method: 'POST',
    token,
    body: payload,
  });
}
