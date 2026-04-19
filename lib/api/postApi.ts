// lib/api/postApi.ts
import axios from 'axios';

const BASE_URL = process.env.EXPO_PUBLIC_POST_SERVICE_URL || 'http://10.0.2.2:3002';

export type FeedFilter = 'all' | 'latest' | 'top' | 'trending' | 'controversial';

export interface FeedResponse {
  posts: any[];
  total: number;
  page?: number;
  pageSize?: number;
  totalPages?: number;
}

export async function getFeed(
  page: number = 1,
  filter: FeedFilter = 'all',
  token?: string
): Promise<FeedResponse> {
  try {
    let endpoint = '/api/feed';
    if (filter === 'trending') endpoint = '/api/feed/trending';
    else if (filter === 'controversial') endpoint = '/api/feed/controversial';

    const response = await axios.get(`${BASE_URL}${endpoint}`, {
      params: {
        page,
        pageSize: 10,
      },
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });

    const body = response.data;
    const posts = body.data ?? body.posts ?? [];
    const total = body.pagination?.total ?? body.total ?? posts.length;

    return { posts, total };
  } catch (error) {
    console.error('API Error [getFeed]:', error);
    throw error;
  }
}

export async function getPostById(id: string, token?: string) {
  const response = await axios.get(`${BASE_URL}/api/posts/${id}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  return response.data;
}

export async function getUserStats(userId: string, token?: string) {
  const response = await axios.get(`${BASE_URL}/api/posts/user/${userId}/stats`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  return response.data;
}

export async function getUserPosts(userId: string, page: number = 1, status?: string, sortBy?: string, token?: string) {
  const params: any = { page, pageSize: 10 };
  if (status && status !== 'All') params.status = status.toUpperCase();
  if (sortBy) params.sortBy = sortBy.toLowerCase();

  const response = await axios.get(`${BASE_URL}/api/posts/user/${userId}`, {
    params,
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });

  const body = response.data;
  const posts = body.data ?? body.posts ?? [];
  const total = body.pagination?.total ?? body.total ?? posts.length;

  return { posts, total };
}

export async function createPost(
  data: { title: string; url: string; description?: string; category?: string },
  token: string
) {
  const response = await axios.post(`${BASE_URL}/api/posts`, data, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
}

export async function getComments(postId: string, page: number = 1, pageSize: number = 20, token?: string) {
  const response = await axios.get(`${BASE_URL}/api/posts/${postId}/comments`, {
    params: { page, pageSize },
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  return response.data;
}

export async function addComment(postId: string, content: string, token: string, parentId?: string) {
  const response = await axios.post(`${BASE_URL}/api/posts/${postId}/comments`, { content, parentId }, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
}

export async function toggleLikePost(id: string, isLiked: boolean, token: string) {
  const method = isLiked ? 'delete' : 'post';
  const response = await axios({
    method,
    url: `${BASE_URL}/api/posts/${id}/like`,
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
}

export async function toggleSavePost(id: string, isSaved: boolean, token: string) {
  const method = isSaved ? 'delete' : 'post';
  const response = await axios({
    method,
    url: `${BASE_URL}/api/posts/${id}/save`,
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
}

export async function recordShare(id: string, token: string) {
  const response = await axios.post(`${BASE_URL}/api/posts/${id}/share`, {}, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
}

export async function toggleFlagPost(id: string, isFlagged: boolean, token: string) {
  const method = isFlagged ? 'delete' : 'post';
  const response = await axios({
    method,
    url: `${BASE_URL}/api/posts/${id}/flag`,
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
}

export async function getModerationQueue(page: number = 1, pageSize: number = 20, token: string) {
  const response = await axios.get(`${BASE_URL}/api/moderation/queue`, {
    params: { page, pageSize },
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
}

export async function getClaimedPosts(token: string) {
  const response = await axios.get(`${BASE_URL}/api/moderation/queue/claimed`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
}

export async function claimPost(postId: string, token: string) {
  const response = await axios.post(`${BASE_URL}/api/moderation/posts/${postId}/claim`, {}, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
}

export async function abandonClaim(postId: string, token: string) {
  const response = await axios.delete(`${BASE_URL}/api/moderation/posts/${postId}/claim`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
}

export async function submitVerdict(
  postId: string,
  data: { verdict: string; header: string; description: string; referenceUrls: string[] },
  token: string
) {
  const response = await axios.post(`${BASE_URL}/api/moderation/posts/${postId}/verdict`, data, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
}
