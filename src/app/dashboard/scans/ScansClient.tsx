/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useEffect, useRef } from "react";
import axios from "axios";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectItem,
  SelectContent,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ShieldAlert,
  Loader2,
  CheckCircle2,
  XCircle,
  Clock,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useScanContext, Scan } from "./ScanContext";
import { toolIdToApiMapping, severityFilters, tools } from "./utils/constants";
import { mapFindingsToDisplayFormat } from "@/utils/mapFindingsToDisplayFormat";
import { getFindings } from "@/utils/findings";
import TargetUrlForm from "@/components/scans/TargetUrlForm";
import Header from "@/components/scans/Header";
import RecentScansSection from "@/components/scans/RecentScanSection";
import ScanTabs from "@/components/scans/ScanTabs";
import ToolSelector from "@/components/scans/ToolSelector";

export default function ScansClient({
  userId,
  initialProjects,
}: {
  userId: string;
  initialProjects: any[];
}) {
  // Use the scan context instead of local state
  const {
    scans,
    setScans,
    selectedScanId,
    setSelectedScanId,
    runningScans,
    setRunningScans,
  } = useScanContext();

  const [projects, setProjects] = React.useState<any[]>(initialProjects || []);
  const [activeProject, setActiveProject] = React.useState<any>(
    initialProjects[0] || null
  );
  const [activeTool, setActiveTool] = React.useState<any>(null);
  const [scriptFilePath, setScriptFilePath] = React.useState<any>(null);
  const [targetUrl, setTargetUrl] = React.useState("");
  const [scanView, setScanView] = React.useState("findings");
  const [activeSeverityFilters, setActiveSeverityFilters] = React.useState([
    "critical",
    "high",
    "medium",
    "low",
    "info",
  ]);
  const socketRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    const ws = new WebSocket(`ws://localhost:8000/scan/ws/${userId}`);
    socketRef.current = ws;

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      const { scan_id, status, message, findings } = data;

      setScans((prevScans) =>
        prevScans.map((scan) =>
          scan.scanId === scan_id
            ? {
                ...scan,
                status,
                message,
                findings: findings
                  ? mapFindingsToDisplayFormat(findings)
                  : scan.findings,
              }
            : scan
        )
      );
    };

    return () => {
      ws.close();
    };
  }, []);

  // Add clearScans function
  const clearScans = () => {
    // Clear all scans from context state
    setScans([]);
    // Clear selected scan id
    setSelectedScanId(null);
    // Clear running scans
    setRunningScans({});
  };

  const handleRunTest = async () => {
    if (!activeTool || !targetUrl || !userId || !activeProject) {
      alert("Please select a tool, project, and target URL.");
      return;
    }

    const toolApi = toolIdToApiMapping[activeTool.id];
    const scanId = `temp-${Date.now()}`;

    // Track this specific scan as running
    setRunningScans((prev) => ({ ...prev, [scanId]: true }));

    const newScan: Scan = {
      scanId: scanId,
      tool: activeTool.name,
      toolId: activeTool.id,
      status: "PENDING",
      target: targetUrl,
      findings: [],
      message: "Scan submitted...",
      timestamp: new Date().toISOString(),
    };

    setScans((prev) => [newScan, ...prev]);
    setSelectedScanId(newScan.scanId);
    try {
      if (activeTool?.id === "k6_local" || activeTool?.id === "k6_deployed") {
        if (!scriptFilePath?.trim()) {
          alert("Please enter the path to your k6 script.");
          return;
        }

        const apiPath = toolIdToApiMapping[activeTool.id]; // "k6-local" or "k6-deployed"

        const res = await axios.post(`/api/security/scan/${apiPath}`, {
          user_id: userId,
          target_url: targetUrl,
          project_id: activeProject.id,
          script_file: scriptFilePath,
        });

        const { scan_id, report_path, findings } = res.data;
        setScans((prev) =>
          prev.map((scan) =>
            scan.scanId === scanId
              ? {
                  ...scan,
                  scanId: scan_id,
                  reportPath: report_path,
                  findings,
                  status: "COMPLETED",
                }
              : scan
          )
        );
        setSelectedScanId(scan_id);
      } else {
        // Other tools
        const apiPath = toolIdToApiMapping[activeTool?.id ?? ""];

        const res = await axios.post(`/api/security/scan/${apiPath}`, {
          user_id: userId,
          target_url: targetUrl,
          project_id: activeProject.id,
        });

        const { scan_id, report_path, findings } = res.data;
        setScans((prev) =>
          prev.map((scan) =>
            scan.scanId === scanId
              ? {
                  ...scan,
                  scanId: scan_id,
                  reportPath: report_path,
                  findings,
                  status: "COMPLETED",
                }
              : scan
          )
        );
        setSelectedScanId(scan_id);
      }
    } catch (err: any) {
      console.error(err);
      setScans((prev) =>
        prev.map((scan) =>
          scan.scanId === scanId
            ? { ...scan, status: "FAILED", message: "Scan failed." }
            : scan
        )
      );
    } finally {
      setRunningScans((prev) => {
        const updated = { ...prev };
        delete updated[scanId];
        return updated;
      });
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return <CheckCircle2 className="text-green-500" />;
      case "FAILED":
        return <XCircle className="text-red-500" />;
      case "PENDING":
        return <Clock className="text-yellow-500" />;
      default:
        return <Loader2 className="animate-spin text-blue-500" />;
    }
  };

  const toggleSeverityFilter = (severity: string) => {
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

  const selectedScan = scans.find((s) => s.scanId === selectedScanId);

  return (
    <div className="max-w-7xl mx-auto">
      <Header />

      {/* Recent Scans - Now positioned at the top for better visibility */}
      {scans.length > 0 && (
        <RecentScansSection
          scans={scans}
          selectedScanId={selectedScanId}
          setSelectedScanId={setSelectedScanId}
          runningScans={runningScans}
          getStatusIcon={getStatusIcon}
          clearScans={clearScans}
        />
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left column - Setup */}
        <div className="lg:col-span-4 space-y-6">
          {/* Project Selection */}
          {projects.length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center">
                  <ShieldAlert className="mr-2 h-5 w-5" />
                  Project
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Select
                  value={activeProject?.id}
                  onValueChange={(val) => {
                    const selected = projects.find((p) => p.id === val);
                    setActiveProject(selected || null);
                  }}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a project" />
                  </SelectTrigger>
                  <SelectContent>
                    {projects.map((project) => (
                      <SelectItem key={project.id} value={project.id}>
                        {project.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>
          )}

          {/* Tool Selection */}
          <ToolSelector
            tools={tools}
            activeTool={activeTool}
            setActiveTool={setActiveTool}
          />

          {/* Target URL */}
          {activeTool && (
            <TargetUrlForm
              activeTool={activeTool}
              targetUrl={targetUrl}
              setTargetUrl={setTargetUrl}
              scriptFilePath={scriptFilePath}
              setScriptFilePath={setScriptFilePath}
              handleRunTest={handleRunTest}
              activeProject={activeProject}
            />
          )}
        </div>

        {/* Right column - Results */}
        <div className="lg:col-span-8">
          {selectedScan ? (
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
                <ScanTabs
                  selectedScan={selectedScan}
                  scanView={scanView}
                  setScanView={setScanView}
                  activeSeverityFilters={activeSeverityFilters}
                  toggleSeverityFilter={toggleSeverityFilter}
                  handleSelectAllSeverities={handleSelectAllSeverities}
                  handleClearAllSeverities={handleClearAllSeverities}
                />
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="text-center py-16">
                <ShieldAlert className="mx-auto h-16 w-16 text-gray-300" />
                <h3 className="mt-4 text-xl font-semibold text-gray-500">
                  No Scan Selected
                </h3>
                <p className="mt-2 text-gray-500 max-w-md mx-auto">
                  Select a security tool, provide a target URL, and run a scan
                  to see the results here.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
