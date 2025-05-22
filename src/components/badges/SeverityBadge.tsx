import React from "react";
import { Badge } from "@/components/ui/badge";

export const SeverityBadge = ({ severity }: { severity: string }) => {
  const severityLower = severity.toLowerCase();
  let badgeClass = "bg-gray-100 text-gray-800";

  if (["high", "critical"].includes(severityLower)) {
    badgeClass = "bg-red-100 text-red-800";
  } else if (severityLower === "medium") {
    badgeClass = "bg-yellow-100 text-yellow-800";
  } else if (severityLower === "low") {
    badgeClass = "bg-blue-100 text-blue-800";
  }

  return <Badge className={badgeClass}>{severity.toUpperCase()}</Badge>;
};
