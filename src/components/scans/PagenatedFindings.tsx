"use client";

import React, { useState, useEffect } from "react";
import {
  AlertCircle,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  Shield,
  ExternalLink,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";

// Universal Finding interface that accommodates multiple scan result formats
interface Finding {
  [key: string]: any;
}

interface PaginatedFindingsProps {
  findings: Finding[];
  activeSeverityFilters: string[];
}

const severityMap: Record<
  string,
  { icon: React.ReactNode; badge: string; borderColor: string }
> = {
  CRITICAL: {
    icon: <AlertCircle className="text-red-400 h-5 w-5" />,
    badge: "destructive",
    borderColor: "border-red-500",
  },
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
  INFO: {
    icon: <Shield className="text-blue-400 h-5 w-5" />,
    badge: "default",
    borderColor: "border-blue-500",
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

const PaginatedFindings: React.FC<PaginatedFindingsProps> = ({
  findings,
  activeSeverityFilters,
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  // Normalize severity to uppercase to match severityMap keys
  const getNormalizedSeverity = (f: Finding): string => {
    const raw =
      f.severity ||
      f.vulnerability?.severity ||
      (f.cvss?.[0] ? mapCVSSToSeverity(f.cvss[0]) : null) ||
      "UNKNOWN";
    return typeof raw === "string" ? raw.toUpperCase() : "UNKNOWN";
  };

  const mapCVSSToSeverity = (cvss: any): string => {
    const score = cvss.baseScore ?? cvss.score ?? 0;
    if (score >= 9.0) return "CRITICAL";
    if (score >= 7.0) return "HIGH";
    if (score >= 4.0) return "MEDIUM";
    if (score >= 0.1) return "LOW";
    return "NEGLIGIBLE";
  };

  const filtered = findings.filter((f) =>
    activeSeverityFilters.includes(getNormalizedSeverity(f).toLowerCase())
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / itemsPerPage));
  const start = (currentPage - 1) * itemsPerPage;
  const current = filtered.slice(start, start + itemsPerPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [activeSeverityFilters]);

  const goToPage = (p: number) =>
    setCurrentPage(Math.max(1, Math.min(p, totalPages)));

  const handleItemsPerPageChange = (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    setItemsPerPage(+e.target.value);
    setCurrentPage(1);
  };

  // Formatting and rendering helpers
  const formatDate = (ds: string) => {
    try {
      return new Date(ds).toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return ds;
    }
  };

  const renderField = (
    label: string,
    value: any,
    fullWidth = false
  ): React.ReactNode => {
    if (value === undefined || value === null) return null;
    const content =
      typeof value === "object" ? JSON.stringify(value, null, 2) : value;
    return (
      <div className={fullWidth ? "md:col-span-2" : ""}>
        <span className="font-semibold">{label}:</span>{" "}
        <span
          className={
            typeof value === "object"
              ? "whitespace-pre-wrap text-xs font-mono"
              : ""
          }
        >
          {content}
        </span>
      </div>
    );
  };

  const renderLink = (url: string) => (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="text-blue-600 hover:underline inline-flex items-center"
    >
      {url} <ExternalLink className="ml-1 h-3 w-3" />
    </a>
  );

  const renderDescription = (desc?: string) =>
    desc && (
      <div>
        <span className="font-semibold">Description:</span>
        <div className="mt-1 p-2 rounded border border-gray-200">{desc}</div>
      </div>
    );

  const renderEPSS = (f: Finding) => {
    const epssArr = f.epss ?? f.vulnerability?.epss;
    const d = Array.isArray(epssArr) && epssArr[0];
    if (!d) return null;
    const score = (d.epss ?? 0) * 100;
    const pct = (d.percentile ?? 0) * 100;
    return (
      <div>
        <span className="font-semibold">EPSS Score:</span>{" "}
        <span className="font-mono">
          {score.toFixed(2)}% (Percentile: {pct.toFixed(2)}%)
          <span className="text-gray-600 text-xs ml-2">
            as of {formatDate(d.date)}
          </span>
        </span>
      </div>
    );
  };

  const renderFixState = (f: Finding) => {
    const state = f.fix_state ?? f.vulnerability?.fix?.state;
    if (!state) return null;
    return (
      <div>
        <span className="font-semibold">Fix Status:</span>{" "}
        <Badge
          variant={state === "not-fixed" ? "outline" : "secondary"}
          className="font-mono"
        >
          {state}
        </Badge>
      </div>
    );
  };

  const renderReferences = (f: Finding) => {
    const ds = f.cve_data_source ?? f.vulnerability?.dataSource;
    const urls = f.urls;
    const ref = f.reference;
    return (
      <>
        {ds && (
          <div>
            <span className="font-semibold">Data Source:</span> {renderLink(ds)}
          </div>
        )}
        {Array.isArray(urls) && urls.length > 0 && (
          <div>
            <span className="font-semibold">URLs:</span>
            <div className="space-y-1 mt-1">
              {urls.map((u: string, i: number) => (
                <div key={i}>{renderLink(u)}</div>
              ))}
            </div>
          </div>
        )}
        {ref && (
          <div>
            <span className="font-semibold">Reference:</span>{" "}
            {typeof ref === "string" && ref.startsWith("http")
              ? renderLink(ref)
              : ref}
          </div>
        )}
      </>
    );
  };

  const getFindingTitle = (f: Finding, idx: number) => {
    if (f.vulnerability_id && (f.artifact_name || f.package_name)) {
      return `${f.vulnerability_id} in ${f.artifact_name || f.package_name}`;
    }
    if (f.vulnerability?.id && f.artifact?.name) {
      return `${f.vulnerability.id} in ${f.artifact.name}`;
    }
    if (f.message && f.file) {
      return `${f.message} in ${f.file}`;
    }
    if (f.message) {
      return f.message;
    }
    if (f.description && f.description.length < 100) {
      return f.description;
    }
    return `Finding #${idx + 1}`;
  };

  return (
    <div>
      {filtered.length === 0 ? (
        <div className="text-center py-8">
          <AlertTriangle className="mx-auto h-12 w-12 text-yellow-500" />
          <p className="mt-4 text-lg font-semibold">
            No findings match the selected filters
          </p>
          <p className="mt-2 text-gray-500">
            Try adjusting your severity filters to see more results.
          </p>
        </div>
      ) : (
        <>
          <div className="space-y-4 mb-4">
            {current.map((f, i) => {
              const idx = start + i;
              const sev = getNormalizedSeverity(f);
              const { icon, badge, borderColor } =
                severityMap[sev] || severityMap.UNKNOWN;
              return (
                <Card
                  key={idx}
                  className={`border-l-4 ${borderColor} shadow-sm`}
                >
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-2">
                        {icon}
                        <CardTitle className="text-base leading-snug">
                          {getFindingTitle(f, idx)}
                        </CardTitle>
                      </div>
                      <Badge variant={badge} className="font-medium">
                        {sev}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="text-sm space-y-2">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-3 p-2 rounded border border-gray-200">
                      {renderField("Tool", f.tool || "Unknown")}
                      {renderField("File", f.file, true)}
                      {renderField("Line", f.line)}
                      {renderField("Message", f.message, true)}
                    </div>

                    {renderField(
                      "Package",
                      f.package_name
                        ? `${f.package_name}@${f.package_version}`
                        : null
                    )}
                    {renderEPSS(f)}
                    {renderFixState(f)}
                    {renderDescription(
                      f.description ||
                        f.vulnerability?.description ||
                        f.detector_description
                    )}
                    {renderReferences(f)}

                    {/* Dynamic fields: any of these show up if present */}
                    {f.namespace && (
                      <>
                        {renderField("Namespace", f.namespace)}
                        <div className="mt-2 p-2 bg-yellow-50 border border-yellow-100 rounded">
                          <span className="font-semibold text-yellow-800">
                            Note:
                          </span>{" "}
                          <span className="text-yellow-700">
                            Potential secret detected; review for sensitive
                            info.
                          </span>
                        </div>
                      </>
                    )}
                    {f.solution && renderField("Solution", f.solution, true)}
                    {f.alert_ref && renderField("Alert Reference", f.alert_ref)}
                    {f.risk_desc &&
                      renderField("Risk Description", f.risk_desc, true)}
                    {f.confidence !== undefined &&
                      renderField("Confidence", f.confidence)}

                    {f.detector_name && renderField("Title", f.detector_name)}
                    {f.source_metadata?.host &&
                      renderField("Host", f.source_metadata.host)}
                    {f.source_metadata?.ip &&
                      renderField("IP", f.source_metadata.ip)}
                    {f.source_metadata?.port &&
                      renderField("Port", f.source_metadata.port)}
                    {f.verified && renderField("Verified", f.verified)}
                    {f.match_type && renderField("Match Type", f.match_type)}
                    {Array.isArray(f.licenses) && f.licenses.length > 0 && (
                      <div>
                        <span className="font-semibold">Licenses:</span>{" "}
                        <div className="flex flex-wrap gap-1 mt-1">
                          {f.licenses.map((l: string, j: number) => (
                            <Badge
                              key={j}
                              variant="outline"
                              className="font-mono text-xs"
                            >
                              {l}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    {Array.isArray(f.artifact_locations) &&
                      f.artifact_locations.length > 0 && (
                        <div className="mt-2">
                          <span className="font-semibold">
                            Artifact Locations:
                          </span>
                          <div className="mt-1 space-y-1 p-2 rounded border border-gray-200 max-h-32 overflow-y-auto">
                            {f.artifact_locations.map((loc: any, j: number) => (
                              <div key={j} className="text-xs font-mono">
                                {loc.path}
                                {loc.annotations?.evidence && (
                                  <Badge
                                    className="ml-2 text-xs"
                                    variant="outline"
                                  >
                                    {loc.annotations.evidence}
                                  </Badge>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t pt-4 mt-4">
              <div className="flex items-center space-x-2 text-sm">
                <span>Show</span>
                <select
                  value={itemsPerPage}
                  onChange={handleItemsPerPageChange}
                  className="border rounded p-1"
                >
                  {[5, 10, 20, 50].map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </select>
                <span>per page</span>
              </div>
              <div className="flex items-center space-x-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => goToPage(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <div className="px-2 text-sm">
                  Page {currentPage} of {totalPages}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => goToPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default PaginatedFindings;
