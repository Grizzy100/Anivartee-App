export type ApiErrorShape = {
  message: string;
  status?: number;
  code?: string;
};

export class ApiError extends Error {
  status?: number;
  code?: string;

  constructor({ message, status, code }: ApiErrorShape) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
  }
}

export type ApiEnvelope<T> = {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  code?: string;
  pagination?: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
};

export type ServiceName = 'user' | 'post' | 'points';

const FALLBACK_HOSTS: Record<ServiceName, string> = {
  user: 'http://10.0.2.2:3001',
  post: 'http://10.0.2.2:3002',
  points: 'http://10.0.2.2:3004',
};

const ENV_HOSTS: Record<ServiceName, string | undefined> = {
  user: process.env.EXPO_PUBLIC_USER_SERVICE_URL,
  post: process.env.EXPO_PUBLIC_POST_SERVICE_URL,
  points: process.env.EXPO_PUBLIC_POINTS_SERVICE_URL,
};

function trimSlash(url: string): string {
  return url.replace(/\/$/, '');
}

function ensureApiBase(url: string): string {
  const normalized = trimSlash(url);
  return normalized.endsWith('/api') ? normalized : `${normalized}/api`;
}

export function serviceBase(service: ServiceName): string {
  const env = ENV_HOSTS[service];
  if (!env || !env.trim()) {
    return ensureApiBase(FALLBACK_HOSTS[service]);
  }

  return ensureApiBase(env.trim());
}

type RequestOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  token?: string | null;
  body?: unknown;
  timeoutMs?: number;
};

export async function apiRequest<T>(
  service: ServiceName,
  endpoint: string,
  options: RequestOptions = {}
): Promise<ApiEnvelope<T>> {
  const {
    method = 'GET',
    token,
    body,
    timeoutMs = 15000,
  } = options;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(`${serviceBase(service)}${endpoint}`, {
      method,
      headers,
      signal: controller.signal,
      ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
    });

    const contentType = response.headers.get('content-type') || '';
    const json = contentType.includes('application/json')
      ? (await response.json()) as ApiEnvelope<T>
      : null;

    if (!json) {
      throw new ApiError({
        message: `Server returned non-JSON response (${response.status})`,
        status: response.status,
      });
    }

    if (!response.ok || !json.success) {
      throw new ApiError({
        message: json.error || json.message || `Request failed (${response.status})`,
        status: response.status,
        code: json.code,
      });
    }

    return json;
  } catch (error: any) {
    if (error?.name === 'AbortError') {
      throw new ApiError({ message: 'Request timed out' });
    }
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError({ message: error?.message || 'Network request failed' });
  } finally {
    clearTimeout(timer);
  }
}
