import { useState } from "react";
import axios from "axios";

export const useScans = () => {
  const [scans, setScans] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totalPages, setTotalPages] = useState(1);

  const fetchScans = async (userId: string, projectId: string, page = 1) => {
    setLoading(true);
    try {
      const { data } = await axios.get(
        `/api/scans?userId=${userId}&projectId=${projectId}&page=${page}&limit=5`
      );
      setScans(data.scans);
      setTotalPages(data.totalPages);
    } catch (err) {
      console.error("Error fetching scans:", err);
    }
    setLoading(false);
  };

  return { scans, loading, totalPages, fetchScans };
};
