"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import ReportSection from "@/components/projects/ReportSection";

interface Finding {
  file: string;
  line: number | null;
  tool: string;
  message: string;
  severity: string;
  namespace: string;
  timestamp: string;
}

interface ScanResult {
  id: string;
  projectId: string;
  toolId: string;
  toolName: string;
  category: string;
  targetUrl: string;
  summary: Record<string, number>;
  results: Finding[];
}

export default function ScanReportPage() {
  const params = useParams();
  const eventId = params?.event_id as string;

  const [scanData, setScanData] = useState<ScanResult[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchScan = async () => {
      try {
        const res = await fetch(`http://localhost:8000/scan/report/${eventId}`);
        const json = await res.json();
        if (Array.isArray(json)) {
          setScanData(json);
        } else if (json.results) {
          setScanData([json]);
        } else {
          setScanData([]);
        }
      } catch (error) {
        console.error("Failed to fetch scan report:", error);
        setScanData([]);
      } finally {
        setLoading(false);
      }
    };

    if (eventId) {
      fetchScan();
    }
  }, [eventId]);

  return (
    <main className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      <h1 className="text-2xl font-bold">Scan Report: {eventId}</h1>
      {scanData.length === 0 && !loading ? (
        <p className="text-gray-500 text-center">No findings found.</p>
      ) : (
        scanData.map((scan) => (
          <ReportSection
            key={scan.toolId}
            title={`Findings from ${scan.toolName || scan.toolId}`}
            type={scan.toolId}
            data={scan.results || []}
            loading={loading}
          />
        ))
      )}
    </main>
  );
}
