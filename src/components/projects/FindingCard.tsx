  //FindingCard.tsx

  "use client";

  import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
  import { AlertCircle, CheckCircle, AlertTriangle, Shield } from "lucide-react";
  import { Badge } from "@/components/ui/badge";

  export default function FindingCard({ finding }) {
    // Detect which type of finding format we're dealing with
    const isAltGrypeFormat = finding.vulnerability_id && finding.artifact_name;
    const isStandardGrypeFormat = finding.vulnerability && finding.artifact;
    const isStandardFinding =
      finding.message && !isAltGrypeFormat && !isStandardGrypeFormat;

    // Handle different severity format patterns
    const severity =
      (isAltGrypeFormat
        ? finding.severity?.toUpperCase()
        : isStandardGrypeFormat
          ? finding.vulnerability?.severity?.toUpperCase()
          : finding.severity?.toUpperCase()) || "UNKNOWN";

    const severityMap = {
      HIGH: {
        icon: <AlertCircle className="text-red-400 h-5 w-5" />,
        badge: "destructive",
        borderColor: "border-red-500",
      },
      MEDIUM: {
        icon: <AlertTriangle className="text-amber-400 h-5 w-5" />,
        badge: "warning",
        borderColor: "border-amber-500",
      },
      LOW: {
        icon: <CheckCircle className="text-emerald-400 h-5 w-5" />,
        badge: "success",
        borderColor: "border-emerald-500",
      },
      NEGLIGIBLE: {
        icon: <Shield className="text-blue-400 h-5 w-5" />,
        badge: "default",
        borderColor: "border-blue-500",
      },
      UNKNOWN: {
        icon: <AlertCircle className="text-gray-400 h-5 w-5" />,
        badge: "secondary",
        borderColor: "border-gray-700",
      },
    };

    const formatTimestamp = (raw) => {
      if (!raw || raw.length !== 15) return raw; // fallback for invalid format

      const year = raw.slice(0, 4);
      const month = raw.slice(4, 6);
      const day = raw.slice(6, 8);
      const hour = raw.slice(9, 11);
      const minute = raw.slice(11, 13);

      const date = new Date(`${year}-${month}-${day}T${hour}:${minute}:00Z`);
      return date.toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
    };

    // Handle standard date format for Grype findings
    const formatDate = (dateStr) => {
      if (!dateStr) return null;
      try {
        const date = new Date(dateStr);
        return date.toLocaleString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        });
      } catch (e) {
        return dateStr;
      }
    };

    const { icon, badge, borderColor } =
      severityMap[severity] || severityMap.UNKNOWN;

    // Get a clean message/title for the finding based on the data format
    const findingMessage = isAltGrypeFormat
      ? `${finding.vulnerability_id} in ${finding.artifact_name}`
      : isStandardGrypeFormat
        ? `${finding.vulnerability.id} in ${finding.artifact.name}`
        : finding.message || "Unknown Issue";

    return (
      <Card className={`border-l-4 mb-4 border-gray-800 ${borderColor}`}>
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-2">
              {icon}
              <CardTitle className="text-base leading-snug text-white">
                {findingMessage}
              </CardTitle>
            </div>
            <Badge variant={badge} className="font-medium">
              {severity}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="text-sm text-gray-300 space-y-2">
          {/* Standard Fields (for original data format) */}
          {isStandardFinding && (
            <>
              {finding.file && (
                <div>
                  <span className="font-semibold text-gray-200">File:</span>{" "}
                  <code className="bg-gray-800 px-2 py-0.5 rounded text-gray-300 border border-gray-700">
                    {finding.file}
                  </code>
                </div>
              )}
              {finding.line !== undefined && (
                <div>
                  <span className="font-semibold text-gray-200">Line:</span>{" "}
                  <span className="font-mono text-gray-300">{finding.line}</span>
                </div>
              )}
              {finding.tool && (
                <div>
                  <span className="font-semibold text-gray-200">Tool:</span>{" "}
                  <span className="italic text-gray-300">{finding.tool}</span>
                </div>
              )}
              {finding.timestamp && (
                <div>
                  <span className="font-semibold text-gray-200">
                    Detected at:
                  </span>{" "}
                  <span className="font-mono text-gray-300">
                    {formatTimestamp(finding.timestamp)}
                  </span>
                </div>
              )}
            </>
          )}

          {/* Alternative Grype Vulnerability format */}
          {isAltGrypeFormat && (
            <>
              <div>
                <span className="font-semibold text-gray-200">Tool:</span>{" "}
                <span className="italic text-gray-300">Grype</span>
              </div>

              {/* Package Information */}
              <div>
                <span className="font-semibold text-gray-200">Package:</span>{" "}
                <code className="bg-gray-800 px-2 py-0.5 rounded text-gray-300 border border-gray-700">
                  {finding.artifact_name}@{finding.artifact_version}
                </code>
              </div>

              {/* Fix Status */}
              {finding.fix_state && (
                <div>
                  <span className="font-semibold text-gray-200">Fix Status:</span>{" "}
                  <Badge
                    variant={
                      finding.fix_state === "not-fixed" ? "outline" : "secondary"
                    }
                    className="font-mono"
                  >
                    {finding.fix_state}
                  </Badge>
                </div>
              )}

              {/* EPSS Score if available */}
              {finding.epss && finding.epss.length > 0 && (
                <div>
                  <span className="font-semibold text-gray-200">EPSS Score:</span>{" "}
                  <span className="font-mono text-gray-300">
                    {(finding.epss[0].epss * 100).toFixed(2)}% (Percentile:{" "}
                    {(finding.epss[0].percentile * 100).toFixed(2)}%)
                    <span className="text-gray-400 text-xs ml-2">
                      as of {formatDate(finding.epss[0].date)}
                    </span>
                  </span>
                </div>
              )}

              {/* Description if available */}
              {finding.description && (
                <div>
                  <span className="font-semibold text-gray-200">
                    Description:
                  </span>{" "}
                  <div className="text-gray-300 mt-1 bg-gray-800/50 p-2 rounded border border-gray-700">
                    {finding.description}
                  </div>
                </div>
              )}

              {/* Detection Timestamp */}
              {finding.timestamp && (
                <div>
                  <span className="font-semibold text-gray-200">
                    Detected at:
                  </span>{" "}
                  <span className="font-mono text-gray-300">
                    {formatTimestamp(finding.timestamp)}
                  </span>
                </div>
              )}

              {/* Match Type */}
              {finding.match_type && (
                <div>
                  <span className="font-semibold text-gray-200">Match Type:</span>{" "}
                  <span className="font-mono text-gray-300">
                    {finding.match_type}
                  </span>
                </div>
              )}

              {/* External References */}
              {finding.cve_data_source && (
                <div>
                  <span className="font-semibold text-gray-200">Reference:</span>{" "}
                  <a
                    href={finding.cve_data_source}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-emerald-400 hover:underline"
                  >
                    {finding.cve_data_source}
                  </a>
                </div>
              )}
            </>
          )}

          {/* Standard Grype Vulnerability Fields */}
          {isStandardGrypeFormat && (
            <>
              <div>
                <span className="font-semibold text-gray-200">Tool:</span>{" "}
                <span className="italic text-gray-300">Grype</span>
              </div>

              {/* Package Information */}
              <div>
                <span className="font-semibold text-gray-200">Package:</span>{" "}
                <code className="bg-gray-800 px-2 py-0.5 rounded text-gray-300 border border-gray-700">
                  {finding.artifact.name}@{finding.artifact.version}
                </code>
              </div>

              {/* EPSS Score if available */}
              {finding.vulnerability.epss &&
                finding.vulnerability.epss.length > 0 && (
                  <div>
                    <span className="font-semibold text-gray-200">
                      EPSS Score:
                    </span>{" "}
                    <span className="font-mono text-gray-300">
                      {(finding.vulnerability.epss[0].epss * 100).toFixed(2)}%
                      (Percentile:{" "}
                      {(finding.vulnerability.epss[0].percentile * 100).toFixed(
                        2
                      )}
                      %)
                      <span className="text-gray-400 text-xs ml-2">
                        as of {formatDate(finding.vulnerability.epss[0].date)}
                      </span>
                    </span>
                  </div>
                )}

              {/* Fix Status */}
              {finding.vulnerability.fix && (
                <div>
                  <span className="font-semibold text-gray-200">Fix Status:</span>{" "}
                  <Badge
                    variant={
                      finding.vulnerability.fix.state === "not-fixed"
                        ? "outline"
                        : "secondary"
                    }
                    className="font-mono"
                  >
                    {finding.vulnerability.fix.state}
                  </Badge>
                </div>
              )}

              {/* Vulnerability Description */}
              {finding.vulnerability.description && (
                <div>
                  <span className="font-semibold text-gray-200">
                    Description:
                  </span>{" "}
                  <div className="text-gray-300 mt-1 bg-gray-800/50 p-2 rounded border border-gray-700">
                    {finding.vulnerability.description}
                  </div>
                </div>
              )}

              {/* Risk Score if available */}
              {finding.vulnerability.risk !== undefined && (
                <div>
                  <span className="font-semibold text-gray-200">Risk Score:</span>{" "}
                  <span className="font-mono text-gray-300">
                    {finding.vulnerability.risk.toFixed(2)}
                  </span>
                </div>
              )}

              {/* External References */}
              {finding.vulnerability.dataSource && (
                <div>
                  <span className="font-semibold text-gray-200">Reference:</span>{" "}
                  <a
                    href={finding.vulnerability.dataSource}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-emerald-400 hover:underline"
                  >
                    {finding.vulnerability.dataSource}
                  </a>
                </div>
              )}
            </>
          )}

          {/* Zap Specific Fields */}
          {finding.tool === "zap" && (
            <>
              {finding.solution && (
                <div>
                  <span className="font-semibold text-gray-200">Solution:</span>{" "}
                  <div
                    className="text-gray-300"
                    dangerouslySetInnerHTML={{
                      __html: finding.solution.replace(
                        /<a/g,
                        '<a class="text-emerald-400 hover:underline"'
                      ),
                    }}
                  />
                </div>
              )}
              {finding.alert_ref && (
                <div>
                  <span className="font-semibold text-gray-200">
                    Alert Reference:
                  </span>{" "}
                  <span className="font-mono text-gray-300">
                    {finding.alert_ref}
                  </span>
                </div>
              )}
              {finding.reference && (
                <div>
                  <span className="font-semibold text-gray-200">Reference:</span>{" "}
                  <div
                    className="text-gray-300"
                    dangerouslySetInnerHTML={{
                      __html: finding.reference.replace(
                        /<a/g,
                        '<a class="text-emerald-400 hover:underline"'
                      ),
                    }}
                  />
                </div>
              )}
              {finding.risk_desc && (
                <div>
                  <span className="font-semibold text-gray-200">
                    Risk Description:
                  </span>{" "}
                  <span className="font-mono text-gray-300">
                    {finding.risk_desc}
                  </span>
                </div>
              )}
              {finding.confidence && (
                <div>
                  <span className="font-semibold text-gray-200">Confidence:</span>{" "}
                  <span className="font-mono text-gray-300">
                    {finding.confidence}
                  </span>
                </div>
              )}
              {finding.description && (
                <div>
                  <span className="font-semibold text-gray-200">
                    Description:
                  </span>{" "}
                  <div
                    className="text-gray-300"
                    dangerouslySetInnerHTML={{
                      __html: finding.description.replace(
                        /<a/g,
                        '<a class="text-emerald-400 hover:underline"'
                      ),
                    }}
                  />
                </div>
              )}
            </>
          )}

          {/* Nikto Specific Fields */}
          {finding.tool === "Nikto" && (
            <>
              {finding.detector_name && (
                <div>
                  <span className="font-semibold text-gray-200">Title:</span>{" "}
                  <span className="text-gray-300">{finding.detector_name}</span>
                </div>
              )}
              {finding.detector_description && (
                <div>
                  <span className="font-semibold text-gray-200">
                    Description:
                  </span>{" "}
                  <span className="text-gray-300">
                    {finding.detector_description}
                  </span>
                </div>
              )}
              {finding.source_metadata?.host && (
                <div>
                  <span className="font-semibold text-gray-200">Host:</span>{" "}
                  <span className="text-gray-300">
                    {finding.source_metadata.host}
                  </span>
                </div>
              )}
              {finding.source_metadata?.ip && (
                <div>
                  <span className="font-semibold text-gray-200">IP:</span>{" "}
                  <span className="text-gray-300">
                    {finding.source_metadata.ip}
                  </span>
                </div>
              )}
              {finding.source_metadata?.port && (
                <div>
                  <span className="font-semibold text-gray-200">Port:</span>{" "}
                  <span className="text-gray-300">
                    {finding.source_metadata.port}
                  </span>
                </div>
              )}
              {finding.raw && (
                <div>
                  <span className="font-semibold text-gray-200">Raw Output:</span>{" "}
                  <span className="text-gray-300">{finding.raw}</span>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    );
  }
