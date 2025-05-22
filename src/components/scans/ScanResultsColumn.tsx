import ScanTabs from "./ScanTabs";
import NoScanSelected from "./NoScanSelected";

interface Props {
  selectedScan: any;
  selectedScanId: string | null;
  scanView: string;
  setScanView: (view: string) => void;
  findingCounts: any;
  activeSeverityFilters: string[];
  toggleSeverityFilter: (severity: string) => void;
  handleSelectAllSeverities: () => void;
  handleClearAllSeverities: () => void;
}

export default function ScanResultsColumn({
  selectedScan,
  scanView,
  setScanView,
  findingCounts,
  activeSeverityFilters,
  toggleSeverityFilter,
  handleSelectAllSeverities,
  handleClearAllSeverities,
}: Props) {
  return (
    <div className="lg:col-span-8">
      {selectedScan ? (
        <ScanTabs
          selectedScan={selectedScan}
          scanView={scanView}
          setScanView={setScanView}
          findingCounts={findingCounts}
          activeSeverityFilters={activeSeverityFilters}
          toggleSeverityFilter={toggleSeverityFilter}
          handleSelectAllSeverities={handleSelectAllSeverities}
          handleClearAllSeverities={handleClearAllSeverities}
        />
      ) : (
        <NoScanSelected />
      )}
    </div>
  );
}
