// Types for scan and finding
interface Finding {
  severity?: string;
  [key: string]: any;
}

interface Scan {
  findings?: Finding[];
  [key: string]: any;
}

export interface FindingCounts {
  total: number;
  critical: number;
  high: number;
  medium: number;
  low: number;
  info: number;
}

// Function to calculate severity counts
export const getFindings = (scan: Scan | null | undefined): FindingCounts => {
  if (!scan || !Array.isArray(scan.findings)) {
    return { total: 0, critical: 0, high: 0, medium: 0, low: 0, info: 0 };
  }

  const counts: FindingCounts = {
    total: scan.findings.length,
    critical: 0,
    high: 0,
    medium: 0,
    low: 0,
    info: 0,
  };

  for (const finding of scan.findings) {
    const severity = (finding.severity || "info").toLowerCase();
    if (severity in counts) {
      counts[severity as keyof FindingCounts]++;
    }
  }

  return counts;
};
