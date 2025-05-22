// hooks/useProjects.ts
import axios from "axios";
import { useState, useEffect } from "react";

export const useProjects = (userId) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const fetchProjects = async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const res = await axios.get(`/api/projects?userId=${userId}`);
      setProjects(res.data || []);
    } catch (err) {
      console.error("Failed to fetch projects", err);
    }
    setLoading(false);
  };

  return { projects, loading, fetchProjects };
};
