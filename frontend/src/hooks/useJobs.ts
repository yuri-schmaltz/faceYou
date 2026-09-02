import { useState, useEffect, useCallback, useRef } from "react";
import { Job } from "../types";
import { formatApiUrl } from "../utils/api";

export function useJobs(apiUrl: string) {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [activeJob, setActiveJob] = useState<Job | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const eventSourceRef = useRef<EventSource | null>(null);

  const fetchJobs = useCallback(async () => {
    try {
      const url = formatApiUrl(apiUrl, "/api/jobs");
      const res = await fetch(url);
      if (res.ok) {
        const data: Job[] = await res.json();
        setJobs(data);
        const running = data.find(j => j.status === "processing" || j.status === "queued");
        setActiveJob(running || null);
      }
    } catch (err) {
      console.error("Erro ao buscar jobs via polling:", err);
    } finally {
      setIsLoading(false);
    }
  }, [apiUrl]);

  // Connect to SSE stream, with graceful fallback to interval polling
  useEffect(() => {
    if (!apiUrl && apiUrl !== "") return;

    let fallbackInterval: NodeJS.Timeout | null = null;
    const streamUrl = formatApiUrl(apiUrl, "/api/jobs/stream");

    try {
      const es = new EventSource(streamUrl);
      eventSourceRef.current = es;

      es.onmessage = (event) => {
        try {
          const data: Job[] = JSON.parse(event.data);
          setJobs(data);
          const running = data.find(j => j.status === "processing" || j.status === "queued");
          setActiveJob(running || null);
          setIsLoading(false);
        } catch {
          // heartbeat or unparseable
        }
      };

      es.onerror = () => {
        // Close broken SSE and fallback to polling
        es.close();
        eventSourceRef.current = null;
        if (!fallbackInterval) {
          fetchJobs();
          fallbackInterval = setInterval(fetchJobs, 2500);
        }
      };
    } catch {
      fetchJobs();
      fallbackInterval = setInterval(fetchJobs, 2500);
    }

    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
      if (fallbackInterval) {
        clearInterval(fallbackInterval);
      }
    };
  }, [apiUrl, fetchJobs]);

  const cancelJob = useCallback(async (jobId: string): Promise<boolean> => {
    try {
      const url = formatApiUrl(apiUrl, `/api/jobs/${jobId}/cancel`);
      const res = await fetch(url, { method: "POST" });
      if (res.ok) {
        await fetchJobs();
        return true;
      }
      return false;
    } catch (err) {
      console.error("Erro ao cancelar job:", err);
      return false;
    }
  }, [apiUrl, fetchJobs]);

  const deleteJob = useCallback(async (jobId: string): Promise<{ success: boolean; message?: string }> => {
    try {
      const url = formatApiUrl(apiUrl, `/api/jobs/${jobId}`);
      const res = await fetch(url, { method: "DELETE" });
      const data = await res.json();
      if (res.ok) {
        setJobs(prev => prev.filter(j => j.id !== jobId));
        return { success: true };
      }
      return { success: false, message: data.detail || "Erro ao excluir job." };
    } catch (err) {
      return { success: false, message: "Erro de conexão ao excluir job." };
    }
  }, [apiUrl]);

  return {
    jobs,
    activeJob,
    isLoading,
    fetchJobs,
    cancelJob,
    deleteJob,
  };
}
