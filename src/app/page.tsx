"use client";

import NavbarWrapper from "@/components/NavbarWrapper";
import HeroSection from "./home/HeroSection";

export default function Home() {
  return (
    <main className="flex flex-col items-center min-h-screen h-screen lg:overflow-hidden sm:overflow-auto py-16 text-gray-900 font-sans w-full max-w-screen-lg mx-auto">
      <HeroSection />
    </main>
  );
}
