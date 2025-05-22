//src/components/projects/ReportSection.tsx

"use client";

import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import FindingCard from "./FindingCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button"; // You might already have this

export default function ReportSection({ title, type, data = [], loading }) {
  const [expanded, setExpanded] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const totalPages = Math.ceil(data.length / itemsPerPage);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const paginatedData = data.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-1/3 mb-2" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader
        className="cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center gap-2">
            <span className="font-bold">{title}</span>
            {data.length > 0 && (
              <Badge variant="outline">{data.length} issues</Badge>
            )}
          </CardTitle>
          {expanded ? <ChevronUp /> : <ChevronDown />}
        </div>
      </CardHeader>

      {expanded && (
        <CardContent>
          {data.length > 0 ? (
            <>
              <div className="space-y-4">
                {paginatedData.map((f, i) => (
                  <FindingCard key={i} finding={f} />
                ))}
              </div>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-2 mt-4">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </Button>

                  <span className="text-sm text-muted-foreground">
                    Page {currentPage} of {totalPages}
                  </span>

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </Button>
                </div>
              )}
            </>
          ) : (
            <p className="text-slate-500 text-sm text-center py-4">
              No issues found
            </p>
          )}
        </CardContent>
      )}
    </Card>
  );
}
