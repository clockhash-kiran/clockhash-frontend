"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

// Define types for our scan data
export interface Scan {
  scanId: string;
  tool: string;
  toolId: string;
  status: string;
  target: string;
  findings: any[];
  message: string;
  timestamp: string;
  reportPath?: string;
}

interface ScanContextType {
  scans: Scan[];
  setScans: React.Dispatch<React.SetStateAction<Scan[]>>;
  selectedScanId: string | null;
  setSelectedScanId: React.Dispatch<React.SetStateAction<string | null>>;
  runningScans: { [key: string]: boolean };
  setRunningScans: React.Dispatch<
    React.SetStateAction<{ [key: string]: boolean }>
  >;
}

const ScanContext = createContext<ScanContextType | undefined>(undefined);

export function ScanProvider({ children }: { children: React.ReactNode }) {
  // Initialize state from localStorage if available
  const [scans, setScans] = useState<Scan[]>(() => {
    if (typeof window !== "undefined") {
      const savedScans = localStorage.getItem("securityScans");
      return savedScans ? JSON.parse(savedScans) : [];
    }
    return [];
  });

  const [selectedScanId, setSelectedScanId] = useState<string | null>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("selectedScanId");
    }
    return null;
  });

  const [runningScans, setRunningScans] = useState<{ [key: string]: boolean }>(
    () => {
      if (typeof window !== "undefined") {
        const savedRunningScans = localStorage.getItem("runningScans");
        return savedRunningScans ? JSON.parse(savedRunningScans) : {};
      }
      return {};
    }
  );

  // Persist state to localStorage whenever it changes
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("securityScans", JSON.stringify(scans));
    }
  }, [scans]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      if (selectedScanId) {
        localStorage.setItem("selectedScanId", selectedScanId);
      } else {
        localStorage.removeItem("selectedScanId");
      }
    }
  }, [selectedScanId]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("runningScans", JSON.stringify(runningScans));
    }
  }, [runningScans]);

  return (
    <ScanContext.Provider
      value={{
        scans,
        setScans,
        selectedScanId,
        setSelectedScanId,
        runningScans,
        setRunningScans,
      }}
    >
      {children}
    </ScanContext.Provider>
  );
}

export function useScanContext() {
  const context = useContext(ScanContext);
  if (context === undefined) {
    throw new Error("useScanContext must be used within a ScanProvider");
  }
  return context;
}
