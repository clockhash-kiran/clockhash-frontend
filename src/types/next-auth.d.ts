import { Role } from "@prisma/client";
import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface User {
    name: string;
    role: Role;
    mfaEnabled: boolean;
    mfaCompleted: boolean;
    avatarUrl: string;
  }

  interface Session {
    user: User & {
      name: string;
      id: string;
      role: Role;
      mfaEnabled: boolean;
      mfaCompleted: boolean;
      provider: string;
      avatarUrl: string;
    };
    token: {
      name: string;
      role: Role;
      mfaEnabled: boolean;
      mfaCompleted: boolean;
    };
  }
}

declare module "next-auth/jwt" {
  /** Returned by the `jwt` callback and `getToken`, when using JWT sessions */
  interface JWT {
    /** OpenID ID Token */
    idToken?: string;
  }
}

// This process is known as module augmentation
declare module "next-auth" {
  interface Session {
    user: {
      id: string; // User ID added to the session
    } & DefaultSession["user"];
  }
}
