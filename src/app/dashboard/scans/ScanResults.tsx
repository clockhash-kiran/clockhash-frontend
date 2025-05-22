"use client";

import React from "react";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  ShieldAlert,
  CheckCircle2,
  XCircle,
  Loader2,
  Filter,
} from "lucide-react";

const severityFilters = [
  { id: "critical", label: "Critical" },
  { id: "high", label: "High" },
  { id: "medium", label: "Medium" },
  { id: "low", label: "Low" },
  { id: "info", label: "Info" },
];

const severityColors = {
  critical: "bg-red-100 text-red-800",
  high: "bg-orange-100 text-orange-800",
  medium: "bg-yellow-100 text-yellow-800",
  low: "bg-blue-100 text-blue-800",
  info: "bg-gray-100 text-gray-800",
};

// Paginated Findings Component
const PaginatedFindings = ({ findings, activeSeverityFilters }) => {
  const [currentPage, setCurrentPage] = React.useState(1);
  const [itemsPerPage, setItemsPerPage] = React.useState(5);

  // Apply severity filters
  const filteredFindings = findings.filter((finding) => {
    const severity = (finding.severity || "info").toLowerCase();
    return activeSeverityFilters.includes(severity);
  });

  const totalPages = Math.ceil(filteredFindings.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentFindings = filteredFindings.slice(
    indexOfFirstItem,
    indexOfLastItem
  );

  const goToPage = (page) => {
    if (page < 1) page = 1;
    if (page > totalPages) page = totalPages;
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (e) => {
    setItemsPerPage(Number(e.target.value));
    setCurrentPage(1); // Reset to first page when changing items per page
  };

  // Reset to page 1 when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [activeSeverityFilters]);

  return (
    <div>
      {filteredFindings.length === 0 ? (
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
        <div className="space-y-3 mb-4">
          {currentFindings.map((f, i) => {
            const severity = (f.severity || "info").toLowerCase();
            const actualIndex = indexOfFirstItem + i;
            return (
              <div key={actualIndex} className="p-3 border rounded-md">
                <div className="flex justify-between items-start">
                  <h3 className="font-semibold">
                    {f.message || "Finding " + (actualIndex + 1)}
                  </h3>
                  <Badge className={severityColors[severity] || "text-white"}>
                    {severity.toUpperCase()}
                  </Badge>
                </div>
                {f.file && (
                  <div className="mt-2 text-sm font-mono p-2 rounded">
                    {f.file}
                  </div>
                )}
                {f.description && (
                  <p className="mt-2 text-sm text-gray-600">{f.description}</p>
                )}
              </div>
            );
          })}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t pt-4">
          <div className="flex items-center space-x-2 text-sm">
            <span>Show</span>
            <select
              value={itemsPerPage}
              onChange={handleItemsPerPageChange}
              className="border rounded p-1"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
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
    </div>
  );
};

// Helper functions
const getFindings = (scan) => {
  if (!scan || !scan.findings)
    return { total: 0, critical: 0, high: 0, medium: 0, low: 0, info: 0 };

  const counts = {
    total: scan.findings.length,
    critical: 0,
    high: 0,
    medium: 0,
    low: 0,
    info: 0,
  };

  scan.findings.forEach((finding) => {
    const severity = (finding.severity || "info").toLowerCase();
    if (counts[severity] !== undefined) {
      counts[severity]++;
    } else {
      counts.info++;
    }
  });

  return counts;
};

// Main ScanResults component
const ScanResults = ({ selectedScan, runningScans }) => {
  const [scanView, setScanView] = React.useState("findings");
  const [activeSeverityFilters, setActiveSeverityFilters] = React.useState([
    "critical",
    "high",
    "medium",
    "low",
    "info",
  ]);

  const toggleSeverityFilter = (severity) => {
    setActiveSeverityFilters((prev) => {
      if (prev.includes(severity)) {
        return prev.filter((s) => s !== severity);
      } else {
        return [...prev, severity];
      }
    });
  };

  const handleSelectAllSeverities = () => {
    setActiveSeverityFilters(severityFilters.map((f) => f.id));
  };

  const handleClearAllSeverities = () => {
    setActiveSeverityFilters([]);
  };

  const findingCounts = selectedScan
    ? getFindings(selectedScan)
    : { total: 0, critical: 0, high: 0, medium: 0, low: 0, info: 0 };

  // Calculate filtered findings count
  const filteredFindingsCount = selectedScan?.findings
    ? selectedScan.findings.filter((f) =>
        activeSeverityFilters.includes((f.severity || "info").toLowerCase())
      ).length
    : 0;

  if (!selectedScan) {
    return (
      <Card>
        <CardContent className="text-center py-16">
          <ShieldAlert className="mx-auto h-16 w-16 text-gray-300" />
          <h3 className="mt-4 text-xl font-semibold text-gray-500">
            No Scan Selected
          </h3>
          <p className="mt-2 text-gray-500 max-w-md mx-auto">
            Select a security tool, provide a target URL, and run a scan to see
            the results here.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2 border-b">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-xl flex items-center">
              {selectedScan.tool} Scan Results
              <Badge
                variant="outline"
                className={`ml-2 ${
                  selectedScan.status === "COMPLETED"
                    ? "bg-green-100 text-green-800"
                    : selectedScan.status === "FAILED"
                      ? "bg-red-100 text-red-800"
                      : "bg-yellow-100 text-yellow-800"
                }`}
              >
                {selectedScan.status}
              </Badge>
            </CardTitle>
            <p className="text-sm text-gray-500 mt-1">
              Target: {selectedScan.target}
            </p>
          </div>
          {selectedScan.status === "PENDING" && (
            <Progress value={30} className="w-24" />
          )}
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={scanView} onValueChange={setScanView} className="mt-4">
          <TabsList className="mb-4">
            <TabsTrigger value="findings">
              Findings ({filteredFindingsCount}/{findingCounts.total})
            </TabsTrigger>
            <TabsTrigger value="details">Scan Details</TabsTrigger>
          </TabsList>

          <TabsContent value="findings">
            {selectedScan.findings.length > 0 ? (
              <div>
                {/* Severity Filter Controls */}
                <div className="mb-6 p-4 rounded-lg shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold flex items-center">
                      <Filter className="mr-2 h-5 w-5" />
                      Filter by Severity
                    </h3>
                    <div className="space-x-3">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleSelectAllSeverities}
                        className="border bg-opacity-50 hover:bg-opacity-80"
                      >
                        Select All
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleClearAllSeverities}
                        className="border bg-opacity-50 hover:bg-opacity-80"
                      >
                        Clear All
                      </Button>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {severityFilters.map((severity) => {
                      const count = findingCounts[severity.id] || 0;
                      const isActive = activeSeverityFilters.includes(
                        severity.id
                      );

                      return (
                        <Card
                          key={severity.id}
                          className={`p-0 hover:bg-accent transition-colors cursor-pointer ${
                            isActive ? "border-primary/50 bg-accent/40" : ""
                          }`}
                          onClick={() => toggleSeverityFilter(severity.id)}
                        >
                          <div className="flex items-center justify-between p-3">
                            <div className="flex items-center space-x-3">
                              <Checkbox
                                id={`filter-${severity.id}`}
                                checked={isActive}
                                onCheckedChange={() =>
                                  toggleSeverityFilter(severity.id)
                                }
                              />
                              <label
                                htmlFor={`filter-${severity.id}`}
                                className="text-sm font-medium cursor-pointer"
                              >
                                {severity.label}
                              </label>
                            </div>
                            <Badge
                              variant={isActive ? "default" : "outline"}
                              className="font-bold font-mono"
                            >
                              {count}
                            </Badge>
                          </div>
                        </Card>
                      );
                    })}
                  </div>
                </div>
                <PaginatedFindings
                  findings={selectedScan.findings}
                  activeSeverityFilters={activeSeverityFilters}
                />
              </div>
            ) : (
              <div className="text-center py-8">
                {selectedScan.status === "COMPLETED" ? (
                  <div>
                    <CheckCircle2 className="mx-auto h-12 w-12 text-green-500" />
                    <p className="mt-4 text-xl font-semibold">
                      No findings detected!
                    </p>
                    <p className="mt-2 text-gray-500">
                      No security issues were found during this scan.
                    </p>
                  </div>
                ) : selectedScan.status === "FAILED" ? (
                  <div>
                    <XCircle className="mx-auto h-12 w-12 text-red-500" />
                    <p className="mt-4 text-xl font-semibold">Scan failed</p>
                    <p className="mt-2 text-gray-500">
                      {selectedScan.message ||
                        "The scan could not be completed."}
                    </p>
                  </div>
                ) : (
                  <div>
                    <Loader2 className="mx-auto h-12 w-12 text-blue-500 animate-spin" />
                    <p className="mt-4 text-xl font-semibold">
                      Scan in progress
                    </p>
                    <p className="mt-2 text-gray-500">
                      {selectedScan.message ||
                        "Please wait while the scan is running..."}
                    </p>
                  </div>
                )}
              </div>
            )}
          </TabsContent>
          <TabsContent value="details">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 rounded-md">
                  <p className="text-sm text-gray-500">Tool</p>
                  <p className="font-medium">{selectedScan.tool}</p>
                </div>
                <div className="p-3 rounded-md">
                  <p className="text-sm text-gray-500">Status</p>
                  <p className="font-medium">{selectedScan.status}</p>
                </div>
                <div className="p-3 rounded-md">
                  <p className="text-sm text-gray-500">Target</p>
                  <p
                    className="font-medium truncate"
                    title={selectedScan.target}
                  >
                    {selectedScan.target}
                  </p>
                </div>
                <div className="p-3 rounded-md">
                  <p className="text-sm text-gray-500">Findings</p>
                  <p className="font-medium">{findingCounts.total}</p>
                </div>
              </div>

              {selectedScan.message && (
                <div className="p-4 rounded-md">
                  <p className="text-sm text-gray-500">Message</p>
                  <p className="mt-1">{selectedScan.message}</p>
                </div>
              )}

              {selectedScan.reportPath && (
                <div className="p-4 rounded-md">
                  <p className="text-sm text-gray-500">Report Path</p>
                  <p className="mt-1 font-mono text-sm break-all">
                    {selectedScan.reportPath}
                  </p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default ScanResults;
