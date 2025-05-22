import React from "react";
import { Loader2, Trash2 } from "lucide-react"; // Added Trash2 icon
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";
import { Button } from "../ui/button"; // Import Button component

interface Scan {
  scanId: string;
  tool: string;
  status: string;
  timestamp: string;
  target: string;
}

interface RecentScansSectionProps {
  scans: Scan[];
  selectedScanId: string | null;
  setSelectedScanId: (id: string) => void;
  runningScans: { [key: string]: boolean };
  getStatusIcon: (status: string) => React.ReactNode;
  clearScans: () => void; // Added new prop for clearing scans
}

const formatDateUTC = (dateString: string | number | Date) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  const pad = (n: number) => n.toString().padStart(2, "0");
  return (
    `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(date.getUTCDate())} ` +
    `${pad(date.getUTCHours())}:${pad(date.getUTCMinutes())}:${pad(date.getUTCSeconds())}`
  );
};

const RecentScansSection: React.FC<RecentScansSectionProps> = ({
  scans,
  selectedScanId,
  setSelectedScanId,
  runningScans,
  getStatusIcon,
  clearScans,
}) => {
  if (scans.length === 0) return null;

  return (
    <Card className="mb-6">
      <CardHeader className="pb-2 flex flex-row items-center justify-between">
        <CardTitle className="text-lg flex items-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="mr-2 h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <circle
              cx={12}
              cy={12}
              r={10}
              stroke="currentColor"
              strokeWidth={2}
            />
          </svg>
          Recent Scans
        </CardTitle>
        <Button
          variant="ghost"
          size="sm"
          onClick={clearScans}
          className="text-gray-500 hover:text-red-500"
          title="Clear recent scans"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {scans.slice(0, 8).map((scan) => (
            <div
              key={scan.scanId}
              className={`p-3 rounded-md border text-sm cursor-pointer transition-all hover:shadow-lg ${
                selectedScanId === scan.scanId
                  ? "border-blue-500"
                  : "hover:border-gray-300"
              }`}
              onClick={() => setSelectedScanId(scan.scanId)}
            >
              <div className="flex justify-between items-center">
                <span className="font-medium">{scan.tool}</span>
                <div className="flex items-center space-x-2">
                  {runningScans[scan.scanId] && (
                    <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
                  )}
                  {getStatusIcon(scan.status)}
                </div>
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {formatDateUTC(scan.timestamp)}
              </div>
              <div className="text-xs truncate mt-1" title={scan.target}>
                {scan.target}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default RecentScansSection;
