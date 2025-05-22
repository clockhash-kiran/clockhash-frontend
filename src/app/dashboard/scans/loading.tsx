import React from "react";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ShieldAlert, History } from "lucide-react";

export default function Loading() {
  return (
    <div className="max-w-7xl mx-auto">
      {/* Header Skeleton */}
      <div className="mb-6">
        <Skeleton className="h-8 w-60 mb-2" />
        <Skeleton className="h-4 w-full max-w-2xl" />
      </div>

      {/* Recent Scans Skeleton */}
      <Card className="mb-6">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center">
            <History className="mr-2 h-5 w-5 text-gray-400" />
            Recent Scans
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {Array(4)
              .fill(0)
              .map((_, i) => (
                <div
                  key={i}
                  className="p-3 rounded-md border h-24 flex flex-col justify-between"
                >
                  <div className="flex justify-between items-center">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 w-4 rounded-full" />
                  </div>
                  <Skeleton className="h-3 w-24 mt-1" />
                  <Skeleton className="h-3 w-full mt-1" />
                </div>
              ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left column - Setup Skeleton */}
        <div className="lg:col-span-4 space-y-6">
          {/* Project Selection Skeleton */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center">
                <ShieldAlert className="mr-2 h-5 w-5 text-gray-400" />
                Project
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Skeleton className="h-10 w-full rounded-md" />
            </CardContent>
          </Card>

          {/* Tool Selection Skeleton */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center">
                <Skeleton className="h-5 w-5 mr-2 rounded-full" />
                <Skeleton className="h-5 w-32" />
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-2">
              {Array(4)
                .fill(0)
                .map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full rounded-md" />
                ))}
            </CardContent>
          </Card>

          {/* Target URL Skeleton */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">
                <Skeleton className="h-5 w-24" />
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Skeleton className="h-10 w-full rounded-md" />
              <Skeleton className="h-10 w-full rounded-md" />
            </CardContent>
          </Card>
        </div>

        {/* Right column - Results Skeleton */}
        <div className="lg:col-span-8">
          <Card>
            <CardContent className="text-center py-16">
              <ShieldAlert className="mx-auto h-16 w-16 text-gray-200" />
              <Skeleton className="h-6 w-48 mx-auto mt-4" />
              <Skeleton className="h-4 w-full max-w-md mx-auto mt-2" />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
