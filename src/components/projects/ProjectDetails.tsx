"use client";

import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import ReportSection from "./ReportSection";
import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useSession } from "next-auth/react";
import { AlertCircle, CheckCircle, Info, Loader } from "lucide-react";

// Status message component
function StatusMessage({ message }) {
  if (!message) return null;

  const getStatusConfig = (status) => {
    const statusMap = {
      PENDING: {
        icon: <Loader className="h-5 w-5 animate-spin" />,
        className: "status-pending",
      },
      RUNNING: {
        icon: <Loader className="h-5 w-5 animate-spin" />,
        className: "status-running",
      },
      COMPLETED: {
        icon: <CheckCircle className="h-5 w-5" />,
        className: "status-completed",
      },
      FAILED: {
        icon: <AlertCircle className="h-5 w-5" />,
        className: "status-failed",
      },
      connected: {
        icon: <CheckCircle className="h-5 w-5" />,
        className: "status-completed",
      },
      disconnected: {
        icon: <Info className="h-5 w-5" />,
        className: "status-info",
      },
      error: {
        icon: <AlertCircle className="h-5 w-5" />,
        className: "status-failed",
      },
    };
    return (
      statusMap[status] || {
        icon: <Info className="h-5 w-5" />,
        className: "status-info",
      }
    );
  };

  const { icon, className } = getStatusConfig(message.status);

  return (
    <div
      className={`status-message ${className} p-4 rounded-md mb-4 flex items-start`}
    >
      <div className="mr-3 mt-0.5">{icon}</div>
      <div className="flex-1">
        <p className="font-medium">{message.message}</p>
        {message.details && <p className="mt-1">{message.details}</p>}
        {message.findings && (
          <p className="mt-1">
            Found {message.findings.length} issue
            {message.findings.length !== 1 ? "s" : ""}
          </p>
        )}
        {message.progress !== undefined && (
          <div className="mt-2 w-full rounded-full h-2.5">
            <div
              className="bg-blue-600 h-2.5 rounded-full"
              style={{ width: `${message.progress}%` }}
            ></div>
          </div>
        )}
      </div>
    </div>
  );
}

// Custom hook to manage WebSocket connection for each stage
function useStageWebSocket(userId, projectId, stage) {
  const [statusMessage, setStatusMessage] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [hasActivity, setHasActivity] = useState(false);
  const socketRef = useRef(null);

  useEffect(() => {
    if (!userId) return;

    const ws = new WebSocket(
      `ws://localhost:8000/scan/ws/automated/${userId}/${stage}`
    );
    socketRef.current = ws;

    ws.onopen = () => {
      console.log(`✅ WebSocket connected for ${stage} stage`);
      setStatusMessage({
        status: "connected",
        message: `Connected to ${stage} scan service`,
        timestamp: new Date().toISOString(),
      });
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        setHasActivity(true); // Mark that we've had activity on this socket

        if (data.type === "scan_status" || data.status) {
          setIsRunning(data.status === "RUNNING" || data.status === "PENDING");

          setStatusMessage({
            ...data,
            timestamp: data.timestamp || new Date().toISOString(),
          });
        }
      } catch (err) {
        console.error(`❌ WebSocket message error for ${stage}:`, err);
        setStatusMessage({
          status: "error",
          message: "Error processing message",
          details: "Could not parse WebSocket message",
          timestamp: new Date().toISOString(),
        });
      }
    };

    ws.onerror = (err) => {
      console.error(`❌ WebSocket error for ${stage}:`, err);
      setStatusMessage({
        status: "error",
        message: "Connection error",
        details: `Failed to connect to ${stage} scan service`,
        timestamp: new Date().toISOString(),
      });
    };

    ws.onclose = () => {
      console.log(`🔌 WebSocket closed for ${stage}`);
      setIsRunning(false);
      setStatusMessage({
        status: "disconnected",
        message: `Disconnected from ${stage} scan service`,
        timestamp: new Date().toISOString(),
      });
    };

    // Check socket every 30 seconds to ensure it's still alive
    const pingInterval = setInterval(() => {
      if (ws.readyState === WebSocket.OPEN) {
        console.log(`🔄 Ping ${stage} socket`);
        // Send empty message as a ping
        ws.send(JSON.stringify({ type: "ping", project_id: projectId }));
      }
    }, 30000);

    return () => {
      clearInterval(pingInterval);
      ws.close();
    };
  }, [userId, projectId, stage]);

  return { statusMessage, isRunning, hasActivity };
}

export default function ProjectDetails({ project, onBack, onEdit, onDelete }) {
  const { data: session, status } = useSession();
  const [activeTab, setActiveTab] = useState("pre-deployment");

  // Report data state
  const [reportData, setReportData] = useState(null);
  const [zapData, setZapData] = useState(null);
  const [trivyData, setTrivyData] = useState(null);

  // Independent loading states for each stage
  const [preLoading, setPreLoading] = useState(false);
  const [midLoading, setMidLoading] = useState(false);
  const [postLoading, setPostLoading] = useState(false);

  // Initialize websockets for each stage
  const {
    statusMessage: preStatusMessage,
    isRunning: preRunning,
    hasActivity: preHasActivity,
  } = useStageWebSocket(session?.user?.id, project.id, "pre");

  const {
    statusMessage: midStatusMessage,
    isRunning: midRunning,
    hasActivity: midHasActivity,
  } = useStageWebSocket(session?.user?.id, project.id, "mid");

  const {
    statusMessage: postStatusMessage,
    isRunning: postRunning,
    hasActivity: postHasActivity,
  } = useStageWebSocket(session?.user?.id, project.id, "post");

  // Function to fetch reports for specific stages with independent loading states
  const fetchPreReports = async () => {
    if (preLoading || preRunning) return; // Prevent duplicate fetches
    setPreLoading(true);
    try {
      const params = `?project_id=${project.id}`;
      const res = await axios.get(
        `http://localhost:8000/scan/combined-reports${params}`
      );
      setReportData(res.data);
    } catch (err) {
      console.error("❌ Error fetching pre-deployment reports:", err);
    } finally {
      setPreLoading(false);
    }
  };

  const fetchMidReports = async () => {
    if (midLoading || midRunning) return; // Prevent duplicate fetches
    setMidLoading(true);
    try {
      const params = `?project_id=${project.id}`;
      const trivyRes = await axios.get(
        `http://localhost:8000/scan/mid-reports${params}`
      );
      setTrivyData(trivyRes.data);
    } catch (err) {
      console.error("❌ Error fetching mid-deployment reports:", err);
    } finally {
      setMidLoading(false);
    }
  };

  const fetchPostReports = async () => {
    if (postLoading || postRunning) return; // Prevent duplicate fetches
    setPostLoading(true);
    try {
      const params = `?project_id=${project.id}`;
      const zapRes = await axios.get(
        `http://localhost:8000/scan/post-reports${params}`
      );
      setZapData(zapRes.data);
    } catch (err) {
      console.error("❌ Error fetching post-deployment reports:", err);
    } finally {
      setPostLoading(false);
    }
  };

  // Initial fetch when component mounts - only fetch for stages with no current activity
  useEffect(() => {
    if (status === "authenticated" && session?.user?.id) {
      if (!preHasActivity && !preRunning) fetchPreReports();
      if (!midHasActivity && !midRunning) fetchMidReports();
      if (!postHasActivity && !postRunning) fetchPostReports();
    }
  }, [
    status,
    session?.user?.id,
    project.id,
    preHasActivity,
    midHasActivity,
    postHasActivity,
  ]);

  // Fetch data when scan is no longer running
  useEffect(() => {
    if (!preRunning && preHasActivity) fetchPreReports();
  }, [preRunning, project.id]);

  useEffect(() => {
    if (!midRunning && midHasActivity) fetchMidReports();
  }, [midRunning, project.id]);

  useEffect(() => {
    if (!postRunning && postHasActivity) fetchPostReports();
  }, [postRunning, project.id]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <Button variant="ghost" size="sm" onClick={onBack}>
            ← Back
          </Button>
          <h2 className="text-2xl font-bold">{project.name}</h2>
          <p className="text-slate-500">ID: {project.id}</p>
          <p className="text-slate-600">{project.description}</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-3 mb-6">
          <TabsTrigger value="pre-deployment">Pre</TabsTrigger>
          <TabsTrigger value="mid-deployment">Mid</TabsTrigger>
          <TabsTrigger value="post-deployment">Post</TabsTrigger>
        </TabsList>

        <TabsContent value="pre-deployment">
          <StatusMessage message={preStatusMessage} />
          <ReportGroup
            loading={preLoading}
            scanRunning={preRunning}
            sections={[
              {
                title: "Semgrep",
                data: reportData?.semgrep?.results,
                type: "semgrep",
              },
              {
                title: "Gitleaks",
                data: reportData?.gitleaks?.results,
                type: "gitleaks",
              },
            ]}
          />
        </TabsContent>

        <TabsContent value="mid-deployment">
          <StatusMessage message={midStatusMessage} />
          <ReportGroup
            loading={midLoading}
            scanRunning={midRunning}
            sections={[
              {
                title: "Trivy",
                data: trivyData?.trivy?.results,
                type: "trivy",
              },
            ]}
          />
        </TabsContent>

        <TabsContent value="post-deployment">
          <StatusMessage message={postStatusMessage} />
          <ReportGroup
            loading={postLoading}
            scanRunning={postRunning}
            sections={[
              { title: "ZAP", data: zapData?.zap?.results, type: "zap" },
            ]}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Report rendering
function ReportGroup({ sections, scanRunning, loading }) {
  // If there's no data yet but we're not actively loading or running a scan,
  // display a message instead of a skeleton
  if (!scanRunning && !loading && sections.every((section) => !section.data)) {
    return (
      <div className="border border-slate-200 rounded-lg p-8 text-center">
        <Info className="h-12 w-12 mx-auto text-slate-400 mb-4" />
        <h3 className="text-lg font-medium mb-2">No reports available</h3>
        <p className="text-slate-500">
          No scan data is available for this stage yet.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {sections.map(({ title, data, type }) =>
        scanRunning ? (
          <SkeletonReportSection key={title} title={title} />
        ) : (
          <ReportSection
            key={title}
            title={title}
            type={type}
            data={data}
            loading={loading}
          />
        )
      )}
    </div>
  );
}

function SkeletonReportSection({ title }) {
  return (
    <div className="border border-slate-200 rounded-lg p-4 space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">{title}</h3>
      </div>
      <div className="space-y-3">
        {Array(3)
          .fill(0)
          .map((_, i) => (
            <div key={i} className="flex flex-col space-y-2">
              <div className="h-4 bg-slate-200 rounded w-3/4 animate-pulse"></div>
              <div className="h-3 bg-slate-200 rounded w-1/2 animate-pulse"></div>
              <div className="h-3 bg-slate-200 rounded w-5/6 animate-pulse"></div>
            </div>
          ))}
      </div>
    </div>
  );
}
