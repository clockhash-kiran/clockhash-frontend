// app/dashboard/layout.tsx
import React from "react";
import Sidebar from "@/components/Sidebar";
import { ScanProvider } from "./scans/ScanContext"; // Adjust the import path as necessary

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ScanProvider>
      {" "}
      {/* Wrap the children with ScanProvider */}
      <div className="flex h-screen">
        <Sidebar />
        <main className="flex-1 overflow-auto p-6">{children}</main>
      </div>
    </ScanProvider>
  );
}
