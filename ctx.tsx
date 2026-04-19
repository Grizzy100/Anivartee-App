import * as SecureStore from 'expo-secure-store';
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import {
  ApiError,
  getMyPoints,
  getMyProfile,
  getUserStats,
  logoutApi,
  signInApi,
  signUpApi,
} from '@/lib/api';

export type UserRole = "USER" | "FACT_CHECKER";
export type RankLevel = "NOVICE" | "APPRENTICE" | "JOURNALIST" | "ANALYST" | "EXPERT";

export type UserProfile = {
  id: string;
  email: string;
  username: string;
  role: UserRole;
  rank: RankLevel | null;
  points: number;
  postsCount: number;
  likesCount: number;
  verifiedCount: number;
};

type AuthAction = "login" | "signup";

type SessionContextValue = {
  session: string | null;
  user: UserProfile | null;
  lastAuthAction: AuthAction | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  signUp: (username: string, email: string, password: string, role: UserRole) => Promise<{ ok: boolean; error?: string }>;
  signOut: () => Promise<void>;
};

const SessionContext = createContext<SessionContextValue | null>(null);

const JWT_STORE_KEY = 'anivartee_jwt';

function getErrorMessage(error: unknown, fallback: string) {
  if (error instanceof ApiError) {
    return error.message || fallback;
  }

  const anyError = error as any;
  return anyError?.message || fallback;
}

function toRankLevel(value: unknown): RankLevel | null {
  const rank = typeof value === 'string' ? value.toUpperCase() : '';
  if (rank === 'NOVICE' || rank === 'APPRENTICE' || rank === 'JOURNALIST' || rank === 'ANALYST' || rank === 'EXPERT') {
    return rank;
  }
  return null;
}

function normalizeRole(value: unknown): UserRole {
  return value === 'FACT_CHECKER' ? 'FACT_CHECKER' : 'USER';
}

function ensureUserId(value: unknown): string {
  return typeof value === 'string' ? value : '';
}

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<string | null>(null);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [lastAuthAction, setLastAuthAction] = useState<AuthAction | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const hydrateUserData = async (token: string, authUser?: any) => {
    const safeUserFromAuth = authUser
      ? {
          id: ensureUserId(authUser.id),
          email: String(authUser.email || ''),
          username: String(authUser.username || ''),
          role: normalizeRole(authUser.role),
          rank: toRankLevel(authUser.rank),
          points: Number(authUser.points || 0),
          postsCount: Number(authUser.postsCount || 0),
          likesCount: Number(authUser.likesCount || 0),
          verifiedCount: Number(authUser.verifiedCount || 0),
        }
      : null;

    const profileResult = await getMyProfile(token).catch(() => null);

    const userId =
      profileResult?.data?.id ||
      safeUserFromAuth?.id ||
      null;

    const statsRequest = userId
      ? getUserStats(userId, token).catch(() => null)
      : Promise.resolve(null);

    const [pointsResult, statsResult] = await Promise.all([
      getMyPoints(token).catch(() => null),
      statsRequest,
    ]);

    const profile = profileResult?.data;
    const pointData = pointsResult?.data;
    const statsData = statsResult?.data;

    const merged: UserProfile | null = userId
      ? {
          id: String(userId),
          email: String(profile?.email || safeUserFromAuth?.email || ''),
          username: String(profile?.username || safeUserFromAuth?.username || ''),
          role: normalizeRole(profile?.role || safeUserFromAuth?.role),
          rank: toRankLevel(pointData?.rank || safeUserFromAuth?.rank),
          points: Number(pointData?.points || safeUserFromAuth?.points || 0),
          postsCount: Number(statsData?.postsCount || safeUserFromAuth?.postsCount || 0),
          likesCount: Number(statsData?.likesCount || safeUserFromAuth?.likesCount || 0),
          verifiedCount: Number(statsData?.verifiedCount || safeUserFromAuth?.verifiedCount || 0),
        }
      : safeUserFromAuth;

    if (merged) {
      setUser(merged);
    }
  };

  useEffect(() => {
    async function hydrate() {
      try {
        const token = await SecureStore.getItemAsync(JWT_STORE_KEY);
        if (token) {
          setSession(token);
          await hydrateUserData(token);
        }
      } catch (error) {
        console.error("SecureStore hydration failed:", error);
      } finally {
        setIsLoading(false);
      }
    }
    hydrate();
  }, []);

  const signIn = async (email: string, password: string) => {
    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail || !password) {
      return { ok: false, error: "Please enter email and password." };
    }

    try {
      const response = await signInApi(normalizedEmail, password);
      const token = response.data?.accessToken;
      const profile = response.data?.user;

      if (!token) throw new Error("No token returned from server.");

      await SecureStore.setItemAsync(JWT_STORE_KEY, token);
      setSession(token);
      await hydrateUserData(token, profile);
      setLastAuthAction("login");
      return { ok: true };
    } catch (error: any) {
      const errorMsg = getErrorMessage(error, "Login Failed");
      return { ok: false, error: errorMsg };
    }
  };

  const signUp = async (username: string, email: string, password: string, role: UserRole) => {
    const normalizedEmail = email.trim().toLowerCase();

    if (!username || !normalizedEmail || !password) {
      return { ok: false, error: "Please fill all fields." };
    }
    if (password.length < 6) {
      return { ok: false, error: "Password must be at least 6 characters." };
    }

    try {
      const response = await signUpApi(username, normalizedEmail, password, role);
      const token = response.data?.accessToken;
      const profile = response.data?.user;

      if (!token) throw new Error("Registration succeeded but no token provided.");

      await SecureStore.setItemAsync(JWT_STORE_KEY, token);
      setSession(token);
      await hydrateUserData(token, profile);
      setLastAuthAction("signup");
      return { ok: true };
    } catch (error: any) {
      const errorMsg = getErrorMessage(error, "Registration Failed");
      return { ok: false, error: errorMsg };
    }
  };

  const signOut = async () => {
    await logoutApi(session).catch(() => {});
    await SecureStore.deleteItemAsync(JWT_STORE_KEY);
    setSession(null);
    setUser(null);
    setLastAuthAction(null);
  };

  const value = useMemo(
    () => ({ session, user, lastAuthAction, isLoading, signIn, signUp, signOut }),
    [session, user, lastAuthAction, isLoading],
  );

  return (
    <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
  );
}

export function useSession() {
  const value = useContext(SessionContext);
  if (!value) throw new Error("useSession must be used inside SessionProvider");
  return value;
}
