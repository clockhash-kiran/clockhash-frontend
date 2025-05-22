import CredentialsProvider from "next-auth/providers/credentials";
import GitHubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { compare } from "bcrypt";
import { db } from "@/lib/db";
import { NextAuthOptions } from "next-auth";
import { v4 as uuidv4 } from "uuid";
import { User } from "next-auth";
import { hash } from "bcrypt";
import { randomBytes } from "crypto";
import { cookies } from "next/headers";
import { Role } from "@prisma/client";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(db),
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt", // Using JWT strategy
    maxAge: 1 * 60 * 60, // 1 hour for the access token
  },
  pages: {
    signIn: "/sign-in", // Custom sign-in page
  },
  providers: [
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials): Promise<User | null> {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password are required");
        }

        const existingUser = await db.user.findUnique({
          where: { email: credentials.email },
        });

        if (!existingUser) {
          throw new Error("Invalid credentials");
        }

        if (existingUser.provider !== "credentials") {
          throw new Error("Use OAuth to sign in.");
        }

        if (!existingUser.password) {
          throw new Error("Invalid credentials");
        }

        const passwordMatch = await compare(
          credentials.password,
          existingUser.password
        );

        if (!passwordMatch) {
          throw new Error("Invalid credentials");
        }

        if (!existingUser.emailVerified) {
          throw new Error("Please verify your email before logging in.");
        }
        // If MFA is enabled and not completed, prevent login

        // Check MFA requirement before returning user object
        if (existingUser.mfaEnabled && !existingUser.mfaCompleted) {
          // If MFA is enabled and not completed, return user with MFA flag
          return {
            id: existingUser.id,
            email: existingUser.email,
            name: existingUser.username,
            role: existingUser.role,
            mfaEnabled: true,
            mfaCompleted: false,
            avatarUrl: existingUser.avatarUrl ?? "", // MFA is required, not completed yet
          };
        }
        if (existingUser.mfaEnabled && existingUser.mfaCompleted) {
          // If MFA is enabled and not completed, return user with MFA flag
          return {
            id: existingUser.id,
            email: existingUser.email,
            name: existingUser.username,
            role: existingUser.role,
            mfaEnabled: true,
            mfaCompleted: true, // MFA is required, not completed yet
            avatarUrl: existingUser.avatarUrl ?? "",
          };
        }

        // Proceed normally if MFA is not enabled or already completed
        return {
          id: existingUser.id.toString(),
          name: existingUser.name || existingUser.username,
          email: existingUser.email,
          image: existingUser.avatarUrl,
          role: existingUser.role,
          mfaEnabled: false,
          mfaCompleted: true, // MFA is not enabled or already completed
          avatarUrl: existingUser.avatarUrl ?? "",
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.mfaEnabled = user.mfaEnabled || false;
        token.mfaCompleted = user.mfaCompleted || false;
        token.provider = account?.provider ?? "credentials";
        token.image = user.avatarUrl;
        // If MFA is enabled, prevent session creation until MFA is completed
        if (token.mfaEnabled && !token.mfaCompleted) {
          // Just return the token with the mfaEnabled flag set
          return { mfaEnabled: token.mfaEnabled, mfaCompleted: false };
        }

        // Proceed with session creation (access token) if MFA is completed
        const sessionToken = uuidv4();
        const accessTokenExpires = new Date(Date.now() + 1 * 60 * 60 * 1000); // 1 hour
        const refreshToken = randomBytes(32).toString("hex");
        const hashedRefreshToken = await hash(refreshToken, 10);
        const refreshTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

        // Create the session in the DB
        await db.session.create({
          data: {
            userId: user.id,
            sessionToken: sessionToken,
            expires: accessTokenExpires,
            refreshToken: hashedRefreshToken,
            refreshTokenExpires: refreshTokenExpires,
          },
        });

        token.sessionToken = sessionToken;
        token.accessTokenExpires = accessTokenExpires.getTime();
        token.refreshToken = refreshToken;
      }

      return token;
    },

    async session({ session, token }) {
      if (token.mfaEnabled && !token.mfaCompleted) {
        return { ...session, user: undefined };
      }

      // Proceed with setting session values only if MFA is completed
      session.user.id = token.id as string;
      session.user.role = token.role as Role;
      session.user.mfaEnabled = token.mfaEnabled as boolean;
      session.user.mfaCompleted = token.mfaCompleted as boolean;
      session.user.provider = token.provider as string;
      session.user.image = token.image as string;
      return session;
    },
  },
  events: {
    async signOut({ token }) {
      if (!token?.id) return;

      // Delete all sessions for the user
      await db.session.deleteMany({
        where: { userId: token.id as string },
      });

      // Check if MFA is enabled and update mfaCompleted to false
      const user = await db.user.findUnique({
        where: { id: token.id as string },
        select: { mfaEnabled: true },
      });

      if (user?.mfaEnabled) {
        await db.user.update({
          where: { id: token.id as string },
          data: { mfaCompleted: false },
        });
      }

      // No need to delete cookies here anymore
      // (await cookies()).delete("next-auth.session-token");
      // (await cookies()).delete("next-auth.callback-url");
      // (await cookies()).delete("next-auth.csrf-token");
    },
  },

  debug: process.env.NODE_ENV === "development",
};
