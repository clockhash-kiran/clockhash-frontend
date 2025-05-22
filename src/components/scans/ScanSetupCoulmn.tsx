// components/ScanSetupColumn.tsx
import React from "react";
import ProjectSelector from "./ProjectSelector";
import ToolSelector from "./ToolSelector";
import TargetUrlForm from "./TargetUrlForm";

interface Project {
  id: string;
  name: string;
}

interface Tool {
  id: string;
  name: string;
  type: "repository" | "deployed";
  description: string;
}

interface ScanSetupColumnProps {
  projects: Project[];
  activeProject: Project | null;
  setActiveProject: (project: Project | null) => void;
  tools: Tool[];
  activeTool: Tool | null;
  setActiveTool: (tool: Tool) => void;
  targetUrl: string;
  setTargetUrl: (url: string) => void;
  handleRunTest: () => void;
}

const ScanSetupColumn: React.FC<ScanSetupColumnProps> = ({
  projects,
  activeProject,
  setActiveProject,
  tools,
  activeTool,
  setActiveTool,
  targetUrl,
  setTargetUrl,
  handleRunTest,
}) => (
  <div className="lg:col-span-4 space-y-6">
    {projects.length > 0 && (
      <ProjectSelector
        projects={projects}
        activeProject={activeProject}
        setActiveProject={setActiveProject}
      />
    )}
    <ToolSelector
      tools={tools}
      activeTool={activeTool}
      setActiveTool={setActiveTool}
    />
    {activeTool && (
      <TargetUrlForm
        activeTool={activeTool}
        targetUrl={targetUrl}
        setTargetUrl={setTargetUrl}
        handleRunTest={handleRunTest}
        activeProject={activeProject}
      />
    )}
  </div>
);

export default ScanSetupColumn;
