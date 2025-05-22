// src/components/NavbarWrapper.tsx
"use client";

import { useSession } from "next-auth/react";
import Navbar from "./Navbar";

export default function NavbarWrapper() {
  const { data: session, status } = useSession();

  if (status === "loading") return null;

  return <Navbar session={session} />;
}
