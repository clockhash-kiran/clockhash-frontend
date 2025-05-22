// components/ProjectSelector.tsx
import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "./ui/card";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "./ui/select";
import { ShieldAlert } from "lucide-react";

interface Project {
  id: string;
  name: string;
}

interface ProjectSelectorProps {
  projects: Project[];
  activeProject: Project | null;
  setActiveProject: (project: Project | null) => void;
}

const ProjectSelector: React.FC<ProjectSelectorProps> = ({
  projects,
  activeProject,
  setActiveProject,
}) => (
  <Card>
    <CardHeader className="pb-2">
      <CardTitle className="text-lg flex items-center">
        <ShieldAlert className="mr-2 h-5 w-5" />
        Project
      </CardTitle>
    </CardHeader>
    <CardContent>
      <Select
        value={activeProject?.id}
        onValueChange={(val) => {
          const selected = projects.find((p) => p.id === val);
          setActiveProject(selected || null);
        }}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select a project" />
        </SelectTrigger>
        <SelectContent>
          {projects.map((project) => (
            <SelectItem key={project.id} value={project.id}>
              {project.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </CardContent>
  </Card>
);

export default ProjectSelector;
