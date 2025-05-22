// hooks/useProjects.ts
import axios from "axios";
import { useState, useEffect } from "react";

export const useProjects = (userId) => {
  const [projects, setProjects] = useState([]);

  const fetchProjects = async () => {
    const res = await axios.get(`/api/projects?userId=${userId}`);
    setProjects(res.data);
  };

  const createOrUpdateProject = (project) => {
    setProjects((prev) => {
      const exists = prev.find((p) => p.id === project.id);
      return exists
        ? prev.map((p) => (p.id === project.id ? project : p))
        : [...prev, project];
    });
  };

  const deleteProject = async (projectId) => {
    await axios.delete(`/api/projects/${projectId}`);
    setProjects((prev) => prev.filter((p) => p.id !== projectId));
  };

  return { projects, fetchProjects, createOrUpdateProject, deleteProject };
};
