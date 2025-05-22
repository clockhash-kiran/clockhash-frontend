// SeverityFilter.tsx
import React from "react";
import { Filter } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";

type FindingCounts = {
  total: number;
  critical: number;
  high: number;
  medium: number;
  low: number;
  info: number;
  [key: string]: number;
};

interface SeverityFiltersProps {
  activeSeverityFilters: string[];
  toggleSeverityFilter: (severity: string) => void;
  handleSelectAllSeverities: () => void;
  handleClearAllSeverities: () => void;
  findingCounts: FindingCounts;
  severityFilters: {
    id: string;
    label: string;
  }[];
}

export const SeverityFilters: React.FC<SeverityFiltersProps> = ({
  activeSeverityFilters,
  toggleSeverityFilter,
  handleSelectAllSeverities,
  handleClearAllSeverities,
  findingCounts,
  severityFilters,
}) => {
  return (
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
          const isActive = activeSeverityFilters.includes(severity.id);

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
                    onCheckedChange={() => toggleSeverityFilter(severity.id)}
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
  );
};

export default SeverityFilters;