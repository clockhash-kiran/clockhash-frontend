// Define types for better clarity and safety
interface SourceMetadata {
  host?: string;
  port?: number;
}

interface RawFinding {
  raw?: string;
  detector_description?: string;
  file?: string;
  severity?: string;
  source_metadata?: SourceMetadata;
  [key: string]: any; // For any other dynamic fields
}

interface DisplayFinding {
  message: string;
  description: string;
  file: string;
  severity: string;
  original: RawFinding;
}

// Main mapper function
export const mapFindingsToDisplayFormat = (
  findings: RawFinding[] | undefined
): DisplayFinding[] => {
  if (!Array.isArray(findings)) return [];

  return findings.map((finding): DisplayFinding => {
    const message =
      finding.raw || finding.detector_description || "Unknown finding";

    const description =
      finding.detector_description !== finding.raw
        ? finding.detector_description
        : finding.source_metadata
          ? `Found in ${finding.source_metadata.host}:${finding.source_metadata.port}`
          : "";

    return {
      message,
      description,
      file: finding.file || "/",
      severity: finding.severity || "info",
      original: finding,
    };
  });
};
