"use client";
import Link from "next/link";
import { ChevronRight, Shield, ExternalLink } from "lucide-react";

function HeroSection() {
  return (
    <section className="relative py-20 px-6 md:px-12 lg:px-16 overflow-hidden">
      {/* Background Elements - Supabase style gradients */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-1/4 left-1/3 w-72 h-72 bg-gradient-to-r from-amber-600/20 to-transparent rounded-full blur-3xl opacity-20"></div>
        <div className="absolute -bottom-20 right-1/4 w-96 h-96 bg-gradient-to-l from-purple-600/10 to-transparent rounded-full blur-3xl opacity-20"></div>
      </div>

      {/* Grid Pattern */}
      <div className="absolute inset-0 z-0 opacity-[0.03]">
        <div
          className="h-full w-full"
          style={{
            backgroundImage:
              "radial-gradient(circle, #ffffff 1px, transparent 1px)",
            backgroundSize: "30px 30px",
          }}
        ></div>
      </div>

      <div className="max-w-screen-xl mx-auto relative z-10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-12 lg:gap-16">
          {/* Left Content */}
          <div className="w-full md:w-1/2 space-y-6">
            <div className="inline-flex items-center px-3 py-1 rounded-full bg-amber-500/10 border border-emerald-500/20 text-gray-400 text-sm font-medium">
              <span className="flex h-2 w-2 rounded-full bg-emerald-400 mr-2"></span>
              New: CodeGuard Released
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
              <span className="text-white">Fortify</span>
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-200">
                your codebase.
              </span>
            </h1>

            <p className="text-base md:text-lg text-gray-400 max-w-lg">
              Automated security scanning that helps development teams identify
              vulnerabilities before they reach production.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/dashboard"
                className="inline-flex items-center justify-center px-6 py-3 bg-emerald-500 text-white font-medium rounded-md hover:bg-amber-500 transition-all group"
              >
                Start scanning
                <ChevronRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>

              <Link
                href="/demo"
                className="inline-flex items-center justify-center px-6 py-3 bg-gray-800 text-white font-medium rounded-md border border-gray-700 hover:bg-gray-700 transition-all"
              >
                Watch demo
              </Link>
            </div>

            <div className="pt-4 border-t border-gray-800">
              <p className="text-gray-400 text-sm">
                Trusted by leading engineering teams
              </p>
              <div className="mt-4 flex items-center space-x-8">
                {["Clockhash"].map((company) => (
                  <span key={company} className="text-gray-300 font-medium">
                    {company}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Right Content - Code Card with Supabase style */}
          <div className="w-full md:w-1/2">
            <div className="bg-gray-900 rounded-md border border-gray-800 shadow-xl overflow-hidden">
              <div className="flex items-center px-4 py-2 bg-gray-800 border-b border-gray-700">
                <div className="flex space-x-2">
                  <div className="w-3 h-3 rounded-full bg-gray-600"></div>
                  <div className="w-3 h-3 rounded-full bg-gray-600"></div>
                  <div className="w-3 h-3 rounded-full bg-gray-600"></div>
                </div>
                <div className="mx-auto text-xs text-gray-400 font-mono">
                  security-scan.log
                </div>
              </div>
              <div className="p-5 font-mono text-sm text-gray-300 space-y-2 bg-gradient-to-br from-gray-900 to-black">
                <p className="flex items-center text-emerald-400">
                  <Shield className="mr-2 w-4 h-4" /> Scan initialized for
                  repository: frontend-app
                </p>
                <p className="text-gray-400">Analyzing dependencies...</p>
                <p className="text-gray-400">Checking for vulnerabilities...</p>
                <p className="text-yellow-400">
                  Warning: Outdated npm package detected (CVE-2023-44487)
                </p>
                <p className="text-red-400">
                  Critical: Potential SQL injection in auth/login.js
                </p>
                <p className="text-gray-400">Generating detailed report...</p>
                <p className="text-white">
                  Scan complete. 2 issues found (1 critical, 1 warning)
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default HeroSection;
