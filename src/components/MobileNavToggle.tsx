"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, X, Home, Settings } from "lucide-react";

const ICONS = {
  Home,
  Settings,
};

export const MobileNavToggle = ({ links }) => {
  const [isOpen, setIsOpen] = useState(false);

  // Close mobile menu when screen size changes to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768 && isOpen) {
        setIsOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [isOpen]);

  return (
    <>
      <button
        className="md:hidden text-gray-300 hover:text-white transition-colors"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle menu"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Mobile Navigation Menu */}
      {isOpen && (
        <div className="fixed inset-0 top-16 z-50 bg-black/70 backdrop-blur-sm md:hidden">
          <nav className="flex flex-col gap-4 p-6">
            {links.map((link) => {
              const Icon = ICONS[link.icon] || null;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-2 border-b border-gray-800 py-3 text-gray-300 transition hover:text-white"
                >
                  {Icon && <Icon className="h-5 w-5" />}
                  <span className="text-lg">{link.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      )}
    </>
  );
};
