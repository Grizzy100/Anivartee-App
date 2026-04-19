import { apiRequest } from './client';

export type UserRole = 'USER' | 'FACT_CHECKER';

export type AuthUser = {
  id: string;
  email: string;
  username: string;
  role: UserRole | 'ADMIN';
  avatarUrl?: string | null;
};

type AuthPayload = {
  accessToken: string;
  user: AuthUser;
};

export async function signInApi(email: string, password: string) {
  return apiRequest<AuthPayload>('user', '/auth/signin', {
    method: 'POST',
    body: { email, password },
  });
}

export async function signUpApi(username: string, email: string, password: string, role: UserRole) {
  return apiRequest<AuthPayload>('user', '/auth/signup', {
    method: 'POST',
    body: { username, email, password, role },
  });
}

export async function logoutApi(token?: string | null) {
  return apiRequest<never>('user', '/auth/logout', {
    method: 'POST',
    token,
  });
}
