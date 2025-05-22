"use client"; // Required for event handlers in Next.js App Router

import React, { FC } from "react";
import { signIn } from "next-auth/react";
import Image from "next/image";

const GoogleSignInButton: FC = () => {
  const loginWithGoogle = () => {
    // Delete the session token cookie
    document.cookie =
      "next-auth.session-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";

    // Proceed with Google sign-in
    signIn("google");
  };

  return (
    <div className="pt-3">
      <button
        onClick={loginWithGoogle}
        className=" p-0 border-0 hover:opacity-80 focus:ring-2 focus:ring-gray-500"
      >
        <Image
          src="/google-logo.svg"
          alt="Google Logo"
          width={20}
          height={20}
        />
      </button>
    </div>
  );
};

export default GoogleSignInButton;
