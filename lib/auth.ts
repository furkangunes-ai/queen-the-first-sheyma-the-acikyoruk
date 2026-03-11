import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { prisma } from "./prisma";
import bcrypt from "bcryptjs";

// ---------------------------------------------------------------------------
// Account lockout (in-memory — Redis'e geçilebilir)
// ---------------------------------------------------------------------------

const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 dakika

interface LoginAttempt {
  count: number;
  lockedUntil: number | null;
}

const loginAttempts = new Map<string, LoginAttempt>();

// Temizlik: her 10 dakikada süresi dolmuş lockout'ları sil
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of loginAttempts) {
    if (entry.lockedUntil && entry.lockedUntil < now) {
      loginAttempts.delete(key);
    }
  }
}, 10 * 60 * 1000);

function checkLockout(username: string): { locked: boolean; remainingMs?: number } {
  const entry = loginAttempts.get(username);
  if (!entry) return { locked: false };

  if (entry.lockedUntil) {
    const now = Date.now();
    if (entry.lockedUntil > now) {
      return { locked: true, remainingMs: entry.lockedUntil - now };
    }
    // Lockout süresi dolmuş — sıfırla
    loginAttempts.delete(username);
    return { locked: false };
  }

  return { locked: false };
}

function recordFailedAttempt(username: string): void {
  const entry = loginAttempts.get(username) || { count: 0, lockedUntil: null };
  entry.count++;

  if (entry.count >= MAX_FAILED_ATTEMPTS) {
    entry.lockedUntil = Date.now() + LOCKOUT_DURATION_MS;
  }

  loginAttempts.set(username, entry);
}

function clearFailedAttempts(username: string): void {
  loginAttempts.delete(username);
}

// ---------------------------------------------------------------------------
// NextAuth Config
// ---------------------------------------------------------------------------

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  providers: [
    Credentials({
      credentials: {
        username: { label: "Kullanıcı Adı", type: "text" },
        password: { label: "Şifre", type: "password" },
      },
      authorize: async (credentials) => {
        if (!credentials?.username || !credentials?.password) return null;

        const username = credentials.username as string;

        // Hesap kilidi kontrolü
        const lockStatus = checkLockout(username);
        if (lockStatus.locked) {
          const remainMin = Math.ceil((lockStatus.remainingMs || 0) / 60000);
          throw new Error(`Hesap kilitli. ${remainMin} dakika sonra tekrar deneyin.`);
        }

        const user = await prisma.user.findUnique({
          where: { username },
          select: {
            id: true,
            username: true,
            displayName: true,
            passwordHash: true,
            role: true,
            examTrack: true,
            emailVerified: true,
            onboardingCompleted: true,
          },
        });

        if (!user) {
          recordFailedAttempt(username);
          return null;
        }

        const isValid = await bcrypt.compare(
          credentials.password as string,
          user.passwordHash
        );

        if (!isValid) {
          recordFailedAttempt(username);
          return null;
        }

        // Başarılı giriş — sayacı sıfırla
        clearFailedAttempts(username);

        return {
          id: user.id,
          name: user.displayName,
          email: user.username,
          role: user.role,
          examTrack: user.examTrack,
          emailVerified: user.emailVerified,
          onboardingCompleted: user.onboardingCompleted,
        };
      },
    }),
  ],
  callbacks: {
    jwt({ token, user, trigger, session }) {
      if (user) {
        token.role = (user as any).role;
        token.userId = user.id;
        token.examTrack = (user as any).examTrack;
        token.emailVerified = (user as any).emailVerified ?? false;
        token.onboardingCompleted = (user as any).onboardingCompleted ?? false;
      }
      // Handle session.update() from client
      if (trigger === "update") {
        if (session?.examTrack !== undefined) {
          token.examTrack = session.examTrack;
        }
        if (session?.emailVerified !== undefined) {
          token.emailVerified = session.emailVerified;
        }
        if (session?.onboardingCompleted !== undefined) {
          token.onboardingCompleted = session.onboardingCompleted;
        }
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        (session.user as any).role = token.role;
        (session.user as any).id = token.userId;
        (session.user as any).examTrack = token.examTrack;
        (session.user as any).emailVerified = token.emailVerified;
        (session.user as any).onboardingCompleted = token.onboardingCompleted;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
});
