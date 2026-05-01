import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
});

const apiBase = process.env.API_INTERNAL_URL ?? process.env.NEXT_PUBLIC_API_URL;

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: {
    strategy: "jwt"
  },
  pages: {
    signIn: "/login"
  },
  providers: [
    Credentials({
      credentials: {
        email: {},
        password: {}
      },
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success || !apiBase) {
          return null;
        }

        const response = await fetch(`${apiBase}/api/auth/login`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(parsed.data),
          cache: "no-store"
        });

        if (!response.ok) {
          return null;
        }

        const payload = (await response.json()) as {
          success: boolean;
          data: {
            token: string;
            userId: number;
            role: string;
            name: string;
            email: string;
          };
        };

        if (!payload.success) {
          return null;
        }

        return {
          id: String(payload.data.userId),
          email: payload.data.email,
          name: payload.data.name,
          role: payload.data.role,
          accessToken: payload.data.token
        };
      }
    })
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.accessToken = user.accessToken;
        token.name = user.name;
        token.email = user.email;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub ?? "";
        session.user.role = token.role as string;
        session.user.name = token.name ?? "";
        session.user.email = token.email ?? "";
        session.user.accessToken = token.accessToken as string;
      }
      return session;
    }
  }
});

