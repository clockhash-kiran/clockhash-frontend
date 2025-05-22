// ScanTabs.tsx
import React from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import PaginatedFindings from "./PagenatedFindings";
import SeverityFilters from "./SeverityFilter";
import { getFindings } from "@/utils/findings";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { severityFilters } from "@/app/dashboard/scans/utils/constants";
import { ScanDetails } from "./ScanDetail";
import { Scan } from "@/app/dashboard/scans/ScanContext";

interface ScanTabsProps {
  selectedScan: Scan;
  scanView: string;
  setScanView: (view: string) => void;
  activeSeverityFilters: string[];
  toggleSeverityFilter: (severity: string) => void;
  handleSelectAllSeverities: () => void;
  handleClearAllSeverities: () => void;
}

export const ScanTabs: React.FC<ScanTabsProps> = ({
  selectedScan,
  scanView,
  setScanView,
  activeSeverityFilters,
  toggleSeverityFilter,
  handleSelectAllSeverities,
  handleClearAllSeverities,
}) => {
  const findingCounts = selectedScan
    ? getFindings(selectedScan)
    : { total: 0, critical: 0, high: 0, medium: 0, low: 0, info: 0 };

  // Calculate filtered findings count
  const filteredFindingsCount = selectedScan?.findings
    ? selectedScan.findings.filter((f) =>
        activeSeverityFilters.includes((f.severity || "info").toLowerCase())
      ).length
    : 0;

  return (
    <Tabs value={scanView} onValueChange={setScanView}>
      <TabsList className="mb-4">
        <TabsTrigger value="findings">
          Findings ({filteredFindingsCount}/{findingCounts.total})
        </TabsTrigger>
        <TabsTrigger value="details">Scan Details</TabsTrigger>
      </TabsList>
      <TabsContent value="findings">
        {selectedScan.findings.length > 0 ? (
          <div>
            <SeverityFilters
              activeSeverityFilters={activeSeverityFilters}
              toggleSeverityFilter={toggleSeverityFilter}
              handleSelectAllSeverities={handleSelectAllSeverities}
              handleClearAllSeverities={handleClearAllSeverities}
              findingCounts={findingCounts}
              severityFilters={severityFilters}
            />
            <PaginatedFindings
              findings={selectedScan.findings}
              activeSeverityFilters={activeSeverityFilters}
            />
          </div>
        ) : (
          <NoFindingsDisplay scan={selectedScan} />
        )}
      </TabsContent>
      <TabsContent value="details">
        <ScanDetails scan={selectedScan} findingCounts={findingCounts} />
      </TabsContent>
    </Tabs>
  );
};

// Helper component for displaying different states when no findings exist
const NoFindingsDisplay: React.FC<{ scan: Scan }> = ({ scan }) => {
  const { status, message } = scan;

  if (status === "COMPLETED") {
    return (
      <div className="text-center py-8">
        <CheckCircle2 className="mx-auto h-12 w-12 text-green-500" />
        <p className="mt-4 text-xl font-semibold">No findings detected!</p>
        <p className="mt-2 text-gray-500">
          No security issues were found during this scan.
        </p>
      </div>
    );
  } else if (status === "FAILED") {
    return (
      <div className="text-center py-8">
        <XCircle className="mx-auto h-12 w-12 text-red-500" />
        <p className="mt-4 text-xl font-semibold">Scan failed</p>
        <p className="mt-2 text-gray-500">
          {message || "The scan could not be completed."}
        </p>
      </div>
    );
  } else {
    return (
      <div className="text-center py-8">
        <Loader2 className="mx-auto h-12 w-12 text-blue-500 animate-spin" />
        <p className="mt-4 text-xl font-semibold">Scan in progress</p>
        <p className="mt-2 text-gray-500">
          {message || "Please wait while the scan is running..."}
        </p>
      </div>
    );
  }
};


export default ScanTabs;
