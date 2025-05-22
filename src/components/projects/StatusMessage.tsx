"use client";

import { AlertCircle, CheckCircle, Info, Loader } from "lucide-react";
import { JSX } from "react";
import { StatusMessageProps } from "./types";

export default function StatusMessage({
  message,
  status,
  details,
  findings,
  progress,
  timestamp,
}: StatusMessageProps) {
  if (!message) return null;

  const getStatusConfig = (status?: string) => {
    const statusMap: Record<string, { icon: JSX.Element; className: string }> =
      {
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
    return status && statusMap[status]
      ? statusMap[status]
      : {
          icon: <Info className="h-5 w-5" />,
          className: "status-info",
        };
  };

  const { icon, className } = getStatusConfig(status);

  return (
    <div
      className={`status-message ${className} p-4 rounded-md mb-4 flex items-start`}
    >
      <div className="mr-3 mt-0.5">{icon}</div>
      <div className="flex-1">
        <p className="font-medium">{message}</p>
        {details && <p className="mt-1">{details}</p>}
        {findings && (
          <p className="mt-1">
            Found {findings.length} issue
            {findings.length !== 1 ? "s" : ""}
          </p>
        )}
        {progress !== undefined && (
          <div className="mt-2 w-full bg-gray-200 rounded-full h-2.5">
            <div
              className="bg-blue-600 h-2.5 rounded-full"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        )}
      </div>
      {timestamp && (
        <span className="text-xs text-gray-500 ml-2">
          {new Date(timestamp).toLocaleTimeString()}
        </span>
      )}
    </div>
  );
}
