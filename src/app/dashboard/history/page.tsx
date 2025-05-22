/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import axios from "axios";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { FileText, Download } from "lucide-react";
import { ToolIcon } from "@/components/icons/ToolIcon";
import { FindingRenderer } from "@/components/findings/FindingRenderer";
import { useProjects } from "@/hooks/useProjects";
import { Skeleton } from "@/components/ui/skeleton";

interface ScanEntry {
  id: string;
  toolId: string;
  toolName: string;
  scanId: string;
  category: string;
  status: string;
  reportPath: string;
  createdAt: string;
  userId: string;
}

// Skeleton component for scan items
const ScanItemSkeleton = () => (
  <li className="border-b pb-2">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Skeleton className="h-8 w-8 rounded-full" />
        <div>
          <Skeleton className="h-4 w-32 mb-1" />
          <Skeleton className="h-3 w-40" />
        </div>
      </div>
      <div className="flex gap-4">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-32" />
      </div>
    </div>
  </li>
);

// Skeleton component for findings
const FindingSkeleton = () => (
  <div className="border rounded-md p-4 mb-4">
    <div className="flex items-center gap-2 mb-2">
      <Skeleton className="h-4 w-4 rounded-full" />
      <Skeleton className="h-4 w-48" />
    </div>
    <Skeleton className="h-3 w-full mb-2" />
    <Skeleton className="h-3 w-3/4 mb-2" />
    <Skeleton className="h-3 w-5/6" />
  </div>
);

export default function HistoryPage() {
  const { data: session } = useSession();
  const userId = session?.user?.id ?? null;

  const {
    projects,
    fetchProjects,
    loading: projectsLoading,
  } = useProjects(userId);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(
    null
  );
  const [scans, setScans] = useState<ScanEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [resultsLoading, setResultsLoading] = useState(false);
  const [results, setResults] = useState<{
    scanId: string;
    tool: string;
    findings: any[];
  } | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    if (userId) {
      fetchProjects();
    }
  }, [fetchProjects, userId]);

  useEffect(() => {
    if (projects.length > 0) {
      const firstProject = projects[0];
      setSelectedProjectId(firstProject.id);
      fetchScans(userId!, firstProject.id, currentPage);
    }
  }, [currentPage, projects, userId]);

  const fetchScans = async (
    userId: string,
    projectId: string,
    page: number = 1
  ) => {
    setLoading(true);
    try {
      const res = await axios.get(
        `/api/scans?userId=${userId}&projectId=${projectId}&page=${page}&limit=5`
      );
      setScans(res.data.scans);
      setTotalPages(res.data.totalPages);
    } catch (err) {
      console.error("Error fetching scans:", err);
    }
    setLoading(false);
  };

  const handleViewScan = async (scan: ScanEntry) => {
    try {
      if (!userId) return alert("User not logged in.");
      const parts = scan.reportPath.split("/");
      if (parts.length < 3) return alert("Invalid report path format.");

      const tool = parts[1];
      const timestamp = parts[2];

      setResultsLoading(true);
      const res = await axios.get(
        `http://localhost:8000/scan/testreports/user-${userId}/${tool}/${timestamp}`
      );
      const findings = res.data.findings || [];

      const processed = findings.map((f: any) => {
        const base = {
          message: f.message || "Unknown issue",
          severity: f.severity || "unknown",
          file: f.file || null,
          line: f.line || null,
        };

        if (tool.toLowerCase() === "nikto") {
          return {
            ...base,
            message: f.detector_description || f.raw || base.message,
            detector_type: f.detector_type,
            source_name: f.source_name,
            source_id: f.source_id,
            source_metadata: f.source_metadata || {},
            verified: f.verified,
          };
        } else if (tool.toLowerCase() === "trufflehog") {
          return {
            ...base,
            message: f.detector_name || base.message,
            detector_description: f.detector_description,
            raw: f.raw,
            redacted: f.redacted,
            verified: f.verified,
            source_metadata: f.source_metadata || {},
          };
        }

        return base;
      });

      setResults({
        scanId: scan.scanId,
        tool: scan.toolName,
        findings: processed,
      });
      setResultsLoading(false);
    } catch (err) {
      console.error("Failed to load scan results:", err);
      alert("Could not fetch scan results.");
      setResultsLoading(false);
    }
  };

  const handleDownloadReport = async (scan: ScanEntry) => {
    if (!userId) return alert("User not logged in.");
    const parts = scan.reportPath.split("/");
    if (parts.length < 3) return alert("Invalid report path format.");

    const tool = parts[1];
    const timestamp = parts[2];

    try {
      const res = await axios.get(
        `http://localhost:8000/scan/download-report?user_id=${userId}&tool_name=${tool}&timestamp=${timestamp}`,
        { responseType: "blob" } // IMPORTANT: Expect binary data
      );

      const blob = new Blob([res.data], { type: "application/pdf" });
      const link = document.createElement("a");
      link.href = window.URL.createObjectURL(blob);
      link.download = `${tool}-report-${timestamp}.pdf`;
      link.click();
    } catch (err) {
      console.error("Failed to download report:", err);
      alert("Could not download report.");
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Select Project</CardTitle>
        </CardHeader>
        <CardContent>
          {projectsLoading ? (
            <Skeleton className="h-10 w-full" />
          ) : (
            <Select
              value={selectedProjectId || ""}
              onValueChange={(val) => {
                setSelectedProjectId(val);
                if (userId) fetchScans(userId, val, 1);
                setCurrentPage(1);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Choose a project" />
              </SelectTrigger>
              <SelectContent>
                {projects.map((project) => (
                  <SelectItem key={project.id} value={project.id}>
                    {project.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent Scans</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <ul className="space-y-4 text-sm">
              {[1, 2, 3, 4, 5].map((i) => (
                <ScanItemSkeleton key={i} />
              ))}
            </ul>
          ) : scans.length === 0 ? (
            <p className="text-sm text-gray-500">
              No scans found for this project.
            </p>
          ) : (
            <ul className="space-y-4 text-sm">
              {scans.map((scan) => (
                <li key={scan.id} className="border-b pb-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <ToolIcon toolName={scan.toolName} />
                      <div>
                        <p className="font-medium">{scan.toolName}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(scan.createdAt).toLocaleString()} •{" "}
                          {scan.status}
                        </p>
                      </div>
                    </div>
                    {scan.reportPath && (
                      <div className="flex gap-4">
                        <Button
                          variant="link"
                          className="text-xs p-0 h-auto"
                          onClick={() => handleViewScan(scan)}
                        >
                          <FileText className="w-4 h-4 mr-1 inline" />
                          View Report
                        </Button>
                        <Button
                          variant="link"
                          className="text-xs p-0 h-auto"
                          onClick={() => handleDownloadReport(scan)}
                        >
                          <Download className="w-4 h-4 mr-1 inline" />
                          Download Report
                        </Button>
                      </div>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}

          <div className="flex justify-between items-center mt-4">
            <Button
              disabled={currentPage === 1}
              onClick={() => {
                const newPage = currentPage - 1;
                setCurrentPage(newPage);
                if (userId && selectedProjectId)
                  fetchScans(userId, selectedProjectId, newPage);
              }}
            >
              Previous
            </Button>
            <p>
              Page {currentPage} of {totalPages}
            </p>
            <Button
              disabled={currentPage === totalPages}
              onClick={() => {
                const newPage = currentPage + 1;
                setCurrentPage(newPage);
                if (userId && selectedProjectId)
                  fetchScans(userId, selectedProjectId, newPage);
              }}
            >
              Next
            </Button>
          </div>
        </CardContent>
      </Card>

      {results && (
        <Card className="mt-6">
          <CardHeader>
            <div className="flex items-center gap-2">
              <ToolIcon toolName={results.tool} />
              <CardTitle>
                Results — {results.tool} (Scan ID: {results.scanId})
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="mt-4">
              <h2 className="text-lg font-semibold mb-2">Findings</h2>
              {resultsLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <FindingSkeleton key={i} />
                  ))}
                </div>
              ) : results.findings.length > 0 ? (
                <ul className="space-y-4">
                  {results.findings.map((finding, i) => (
                    <FindingRenderer
                      key={i}
                      index={i}
                      tool={results.tool}
                      finding={finding}
                    />
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-gray-500">
                  No vulnerabilities found.
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
