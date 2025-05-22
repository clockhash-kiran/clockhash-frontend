import React from "react";
import { Shield, Key } from "lucide-react";
import { SeverityBadge } from "@/components/badges/SeverityBadge";

export interface NormalizedFinding {
  message: string;
  severity: string;
  file?: string;
  line?: number;
  package?: string;
  version?: string;
  description?: string;
  detector_name?: string;
  detector_description?: string;
  raw?: string;
  redacted?: string;
  verified?: boolean;
  source_metadata?: any;
  detector_type?: number;
  source_name?: string;
  source_id?: number;
}

interface Props {
  finding: NormalizedFinding;
  index: number;
  tool: string;
}

export const FindingRenderer: React.FC<Props> = ({ finding, index, tool }) => {
  const lowerTool = tool.toLowerCase();

  if (lowerTool === "nikto") {
    return (
      <li key={index} className="p-4 border rounded  text-sm space-y-2">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-blue-600" />
            <p className="font-semibold">{finding.message}</p>
          </div>
          <SeverityBadge severity={finding.severity} />
        </div>

        {finding.file && (
          <p className="text-gray-700">
            <span className="font-medium">URL:</span> {finding.file}
          </p>
        )}

        {finding.source_metadata && (
          <div className="bg-gray-100 p-2 rounded text-xs mt-2">
            <p>
              <span className="font-medium">Host:</span>{" "}
              {finding.source_metadata.host || "N/A"}
            </p>
            <p>
              <span className="font-medium">IP:</span>{" "}
              {finding.source_metadata.ip || "N/A"}
            </p>
            <p>
              <span className="font-medium">Port:</span>{" "}
              {finding.source_metadata.port || "N/A"}
            </p>
          </div>
        )}

        {finding.verified !== undefined && (
          <p className="text-gray-700">
            <span className="font-medium">Verified:</span>{" "}
            {finding.verified ? "Yes" : "No"}
          </p>
        )}
      </li>
    );
  }

  if (lowerTool === "trufflehog") {
    return (
      <li key={index} className="p-4 border rounded  text-sm space-y-2">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-2">
            <Key className="w-4 h-4 text-amber-600" />
            <p className="font-semibold">{finding.message}</p>
          </div>
          <SeverityBadge severity={finding.severity} />
        </div>

        {finding.detector_description && (
          <p className="text-gray-700">
            <span className="font-medium">Description:</span>{" "}
            {finding.detector_description}
          </p>
        )}

        {finding.file && (
          <p className="text-gray-700">
            <span className="font-medium">File:</span> {finding.file}
            {finding.line != null && `:${finding.line}`}
          </p>
        )}

        {finding.redacted && (
          <div className="bg-gray-100 p-2 rounded mt-2">
            <p className="font-medium text-xs mb-1">Redacted Secret:</p>
            <p className="text-xs font-mono break-all">{finding.redacted}</p>
          </div>
        )}

        {finding.verified !== undefined && (
          <p className="text-gray-700">
            <span className="font-medium">Verified:</span>{" "}
            {finding.verified ? "Yes" : "No"}
          </p>
        )}

        {finding.source_metadata &&
          Object.keys(finding.source_metadata).length > 0 && (
            <details className="text-xs">
              <summary className="cursor-pointer text-gray-700 font-medium">
                Source Metadata
              </summary>
              <div className="p-2 bg-gray-100 rounded mt-1">
                <pre className="text-xs overflow-auto">
                  {JSON.stringify(finding.source_metadata, null, 2)}
                </pre>
              </div>
            </details>
          )}
      </li>
    );
  }

  // Default renderer
  return (
    <li key={index} className="p-4 border rounded  text-sm space-y-2">
      <div className="flex justify-between items-start">
        <p className="font-semibold">{finding.message}</p>
        <SeverityBadge severity={finding.severity} />
      </div>

      {finding.file && (
        <p className="text-gray-700">
          <span className="font-medium">Location:</span> {finding.file}
          {finding.line != null && `:${finding.line}`}
        </p>
      )}

      {finding.package && (
        <p className="text-gray-700">
          <span className="font-medium">Package:</span> {finding.package}
          {finding.version && `@${finding.version}`}
        </p>
      )}

      {finding.description && (
        <p className="mt-2 text-gray-600">{finding.description}</p>
      )}
    </li>
  );
};
