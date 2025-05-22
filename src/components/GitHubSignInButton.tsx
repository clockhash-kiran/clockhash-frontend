"use client"; // Required for event handlers in Next.js App Router

import React, { FC, useEffect, useState } from "react";
import { signIn } from "next-auth/react";
import Image from "next/image";

const GitHubSignInButton: FC = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Detect dark mode preference
  useEffect(() => {
    const darkModeQuery = window.matchMedia("(prefers-color-scheme: dark)");
    setIsDarkMode(darkModeQuery.matches);

    darkModeQuery.addEventListener("change", (e) => setIsDarkMode(e.matches));

    return () => {
      darkModeQuery.removeEventListener("change", (e) =>
        setIsDarkMode(e.matches)
      );
    };
  }, []);

  const loginWithGitHub = () => signIn("github");

  return (
    <div className="pt-3">
      <button
        onClick={loginWithGitHub}
        className=" p-0 border-0 hover:opacity-80 focus:ring-2 focus:ring-gray-500"
      >
        <Image
          src={isDarkMode ? "/github-logo-light.svg" : "/github-logo-dark.svg"}
          alt="GitHub Logo"
          width={20}
          height={20}
        />
      </button>
    </div>
  );
};

export default GitHubSignInButton;
