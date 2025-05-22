import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  TooltipProvider,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import { Shield, Lock, Activity, AlertTriangle, Scan } from "lucide-react";

interface Tool {
  id: string;
  name: string;
  description: string;
  icon: JSX.Element;
  type: "protection" | "monitoring" | "scanning" | "detection" | "other";
}

interface ToolSelectorProps {
  tools: Tool[];
  activeTool: Tool | null;
  setActiveTool: (tool: Tool) => void;
}

const typeIcons = {
  protection: <Shield className="h-4 w-4" />,
  monitoring: <Activity className="h-4 w-4" />,
  scanning: <Scan className="h-4 w-4" />,
  detection: <AlertTriangle className="h-4 w-4" />,
  other: <Lock className="h-4 w-4" />,
};

const ToolSelector: React.FC<ToolSelectorProps> = ({
  tools,
  activeTool,
  setActiveTool,
}) => {
  return (
    <Card className="border border-border shadow-sm">
      <CardContent className="pt-1">
        <div className="mb-4">
          <h3 className="text-sm font-medium text-muted-foreground">
            SECURITY TOOLS
          </h3>
        </div>
        <div className="flex flex-wrap gap-2">
          {tools.map((tool) => (
            <TooltipProvider key={tool.id} delayDuration={300}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    className={`group flex items-center justify-start w-full sm:w-auto px-4 py-2 rounded-lg border transition-all duration-200 ${
                      activeTool?.id === tool.id
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/30 hover:bg-accent/50"
                    }`}
                    onClick={() => setActiveTool(tool)}
                  >
                    <div
                      className={`text-muted-foreground ${
                        activeTool?.id === tool.id
                          ? "text-primary"
                          : "group-hover:text-foreground"
                      }`}
                    >
                      {tool.icon}
                    </div>
                    <span
                      className={`ml-2 text-xs font-medium ${
                        activeTool?.id === tool.id
                          ? "text-primary"
                          : "text-muted-foreground group-hover:text-foreground"
                      }`}
                    >
                      {tool.name}
                    </span>
                    <div
                      className={`ml-auto pl-2 text-muted-foreground/60 ${
                        activeTool?.id === tool.id
                          ? "text-primary/60"
                          : "group-hover:text-foreground/60"
                      }`}
                    >
                      {typeIcons[tool.type]}
                    </div>
                  </button>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="text-xs">
                  {tool.description}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default ToolSelector;
