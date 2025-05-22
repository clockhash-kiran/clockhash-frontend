// components/TargetUrlForm.tsx
import React from "react";

import { ArrowRight, Globe, Code } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";

interface Tool {
  id: string;
  name: string;
  type: "repository" | "deployed";
}

interface Project {
  id: string;
  name: string;
}

interface TargetUrlFormProps {
  activeTool: Tool;
  targetUrl: string;
  setTargetUrl: (url: string) => void;
  scriptFilePath: string; // Add this prop
  setScriptFilePath: (path: string) => void; // Add this prop
  handleRunTest: () => void;
  activeProject: Project | null;
}

const TargetUrlForm: React.FC<TargetUrlFormProps> = ({
  activeTool,
  targetUrl,
  setTargetUrl,
  scriptFilePath,
  setScriptFilePath,
  handleRunTest,
  activeProject,
}) => {
  const isK6 = activeTool.id === "k6_local" || activeTool.id === "k6_deployed";

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center">
          {activeTool.type === "repository" ? (
            <Code className="mr-2 h-5 w-5" />
          ) : (
            <Globe className="mr-2 h-5 w-5" />
          )}
          {activeTool.type === "repository"
            ? "GitHub Repository URL"
            : "Deployed Application URL"}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <Input
          type="text"
          placeholder={
            activeTool.type === "repository"
              ? "e.g. https://github.com/user/repo"
              : "e.g. https://example.com"
          }
          value={targetUrl}
          onChange={(e) => setTargetUrl(e.target.value)}
        />

        {isK6 && (
          <Input
            type="text"
            placeholder="Enter path to your k6 script file"
            value={scriptFilePath}
            onChange={(e) => setScriptFilePath(e.target.value)}
          />
        )}

        <Button
          className="w-full mt-2"
          onClick={handleRunTest}
          disabled={
            !targetUrl ||
            (activeTool.type === "repository" && !activeProject) ||
            (isK6 && !scriptFilePath?.trim())
          }
        >
          Run Security Test
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </CardContent>
    </Card>
  );
};

export default TargetUrlForm;
