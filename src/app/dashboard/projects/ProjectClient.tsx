"use client";

import { useState } from "react";
import ProjectList from "@/components/projects/ProjectList";
import ProjectDetails from "@/components/projects/ProjectDetails";
import axios from "axios";
import { toast } from "sonner";

// Define the types for your models
interface Project {
  id: string;
  name: string;
  description: string | null;
  userId: string;
  repoUrl: string | null;
  webhookSecret: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export default function ProjectsClient({ projects: initialProjects }: { projects: Project[] }) {
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  const handleCreateOrUpdate = (updatedProject: Project) => {
    setProjects((prev) => {
      const exists = prev.find((p) => p.id === updatedProject.id);
      if (exists) {
        return prev.map((p) =>
          p.id === updatedProject.id ? updatedProject : p
        );
      }
      return [...prev, updatedProject];
    });
  };

  const handleDelete = async (projectId: string) => {
    try {
      await axios.delete(`/api/projects/${projectId}`);
      setProjects((prev) => prev.filter((p) => p.id !== projectId));
      if (selectedProject?.id === projectId) {
        setSelectedProject(null);
      }
      toast.success("Project deleted successfully");
    } catch (err) {
      console.error("Error deleting project", err);
      toast.error("Failed to delete project");
    }
  };

  return (
    <div className="mx-auto py-6 px-4 max-w-7xl">
      {selectedProject ? (
        <ProjectDetails
          project={selectedProject}
          onBack={() => setSelectedProject(null)}
          onEdit={(project: Project) => setSelectedProject(project)} // Explicitly typing project
          onDelete={(project: Project) => handleDelete(project.id)} // Explicitly typing project
        />
      ) : (
        <ProjectList
          projects={projects}
          onSelect={(project: Project) => setSelectedProject(project)} // Explicitly typing project
          onCreateOrUpdate={handleCreateOrUpdate}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
}
