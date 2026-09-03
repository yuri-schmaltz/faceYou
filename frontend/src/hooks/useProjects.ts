import { useState, useEffect, useCallback } from "react";
import { formatApiUrl } from "../utils/api";
import { Project } from "../types";

export function useProjects(apiUrl: string) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchProjects = useCallback(async () => {
    if (!apiUrl && apiUrl !== "") return;
    try {
      const url = formatApiUrl(apiUrl, "/api/projects");
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setProjects(data);
      }
    } catch {
      // ignore
    } finally {
      setIsLoading(false);
    }
  }, [apiUrl]);

  const openProjectFolder = useCallback(
    async (projectName: string): Promise<boolean> => {
      try {
        const url = formatApiUrl(apiUrl, `/api/projects/${encodeURIComponent(projectName)}/open-folder`);
        const res = await fetch(url, { method: "POST" });
        return res.ok;
      } catch {
        return false;
      }
    },
    [apiUrl]
  );

  const deleteProject = useCallback(
    async (projectName: string): Promise<boolean> => {
      try {
        const url = formatApiUrl(apiUrl, `/api/projects/${encodeURIComponent(projectName)}`);
        const res = await fetch(url, { method: "DELETE" });
        if (res.ok) {
          setProjects(prev => prev.filter(p => p.name !== projectName));
          return true;
        }
        return false;
      } catch {
        return false;
      }
    },
    [apiUrl]
  );

  useEffect(() => {
    fetchProjects();
    const interval = setInterval(fetchProjects, 5000);
    return () => clearInterval(interval);
  }, [fetchProjects]);

  return { projects, isLoading, fetchProjects, openProjectFolder, deleteProject };
}
