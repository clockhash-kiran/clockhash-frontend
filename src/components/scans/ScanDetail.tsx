import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, CheckCircle2, XCircle, Loader2 } from "lucide-react";

interface ScanDetailsProps {
  scan: {
    tool: string;
    target: string;
    status: string;
    timestamp: string;
    reportPath?: string;
    message?: string;
  };
}

export const ScanDetails: React.FC<ScanDetailsProps> = ({ scan }) => {
  const getStatusIcon = () => {
    switch (scan.status) {
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

  return (
    <Card>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center space-x-2 text-xl font-semibold">
            {getStatusIcon()}
            <span>{scan.tool} Scan Details</span>
            <Badge
              variant="outline"
              className={`ml-2 ${
                scan.status === "COMPLETED"
                  ? "bg-green-100 text-green-800"
                  : scan.status === "FAILED"
                    ? "bg-red-100 text-red-800"
                    : "bg-yellow-100 text-yellow-800"
              }`}
            >
              {scan.status}
            </Badge>
          </div>

          <div>
            <strong>Target URL:</strong> {scan.target}
          </div>

          <div>
            <strong>Timestamp:</strong>{" "}
            {new Date(scan.timestamp).toLocaleString()}
          </div>

          {scan.reportPath && (
            <div>
              <strong>Report:</strong>{" "}
              <a
                href={scan.reportPath}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 underline"
              >
                View Full Report
              </a>
            </div>
          )}

          {scan.message && (
            <div className="p-2 border-green-500 rounded border text-green-700">
              {scan.message}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
