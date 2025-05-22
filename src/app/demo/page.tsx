"use client";

import React from "react";
import Link from "next/link";
import { Play, Clock, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function DemoPage() {
  return (
    <div className="flex flex-col items-center justify-center text-center px-4 sm:px-6 lg:px-8 w-full h-full">
      {/* Hero Section */}
      <div className="bg-gray-800/40 backdrop-blur-sm p-3 rounded-full border border-gray-700 mb-6">
        <Play className="w-8 h-8 text-gray-300" />
      </div>
      <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
        Demo Video
      </h1>
      <p className="text-gray-400 text-lg sm:text-xl max-w-2xl mx-auto mb-8">
        Discover how ClockHash helps you secure your repositories and monitor
        code changes in real-time.
      </p>
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Button
          className="bg-gray-800 hover:bg-gray-700 text-white border border-gray-700 px-6 py-5 rounded-lg flex items-center gap-2"
          disabled
        >
          <Clock className="w-5 h-5" />
          <span>Demo Coming Soon</span>
        </Button>
        <Link href="/">
          <Button className="bg-gray-700 hover:bg-gray-600 text-white px-6 py-5 rounded-lg flex items-center gap-2">
            <ChevronRight className="w-5 h-5" />
            <span>Return Home</span>
          </Button>
        </Link>
      </div>
    </div>
  );
}
