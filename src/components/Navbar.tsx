"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import UserAccountnav from "./UserAccountnav";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { MobileNavToggle } from "./MobileNavToggle";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/dashboard", label: "Dashboard" },
];

interface NavbarProps {
  session: any;
}

const Navbar: React.FC<NavbarProps> = ({ session }) => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(false);
  }, []);

  if (loading) return null;

  return (
    <header className="fixed top-0 w-full z-50 border-b border-gray-700/50  backdrop-blur-sm">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex h-16 items-center justify-between">
          {/* Left section: Logo + Navigation */}
          <div className="flex items-center gap-8">
            <Link
              href="/"
              className="flex items-center gap-2 transition hover:opacity-80"
            >
              <Image
                src="/logo.jpg"
                alt="Logo"
                width={32}
                height={32}
                className="object-contain rounded-md"
              />
              <span className="text-lg font-semibold text-white">
                Clockhash
              </span>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex md:items-center md:gap-6">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="group relative flex items-center gap-1 text-base font-semibold text-gray-300 hover:text-white transition-colors"
                >
                  <span>{link.label}</span>
                  <div className="absolute bottom-[-4px] left-0 h-[2px] w-0 bg-amber-500 transition-all group-hover:w-full" />
                </Link>
              ))}
            </nav>
          </div>

          {/* Right section: Auth + Dashboard + Mobile Nav */}
          <div className="flex items-center gap-4">
            {session?.user && <Link href=""></Link>}

            {session?.user ? (
              <UserAccountnav />
            ) : (
              <Link href="/sign-in">
                <Button
                  variant="default"
                  size="sm"
                  className="bg-emerald-600 text-white hover:bg-emerald-700 hover:text-white transition-colors"
                >
                  Sign in
                </Button>
              </Link>
            )}

            {/* Mobile Menu Button */}
            <MobileNavToggle links={NAV_LINKS} />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
