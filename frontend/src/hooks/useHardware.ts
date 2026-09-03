import { useState, useEffect, useCallback } from "react";
import { formatApiUrl } from "../utils/api";
import { HardwareTelemetry } from "../types";

export function useHardware(apiUrl: string) {
  const [telemetry, setTelemetry] = useState<HardwareTelemetry | null>(null);
  const [hardwareInfo, setHardwareInfo] = useState<string>("Buscando telemetria...");
  const [availableProviders, setAvailableProviders] = useState<string[]>([]);

  const fetchHardware = useCallback(async () => {
    if (!apiUrl && apiUrl !== "") return;

    // 1. Buscar telemetria em tempo real (CPU, GPU, RAM, VRAM)
    try {
      const telemUrl = formatApiUrl(apiUrl, "/api/hardware/telemetry");
      const res = await fetch(telemUrl);
      if (res.ok) {
        const data: HardwareTelemetry = await res.json();
        setTelemetry(data);

        // Atualizar string resumida para compatibilidade
        const gpuName = data.gpu?.name || "GPU";
        const temp = data.gpu?.temperature_c !== null && data.gpu?.temperature_c !== undefined
          ? `${data.gpu.temperature_c}°C`
          : "N/A";
        const gpuUsage = data.gpu?.usage_percent !== null && data.gpu?.usage_percent !== undefined
          ? `${data.gpu.usage_percent}%`
          : null;

        const summaryParts = [`${gpuName}`];
        if (gpuUsage) summaryParts.push(`Uso: ${gpuUsage}`);
        summaryParts.push(`Temp: ${temp}`);
        setHardwareInfo(summaryParts.join(" • "));
      }
    } catch {
      // Fallback
    }

    // 2. Buscar provedores de execução (CUDA, TensorRT, CPU)
    try {
      const provUrl = formatApiUrl(apiUrl, "/api/hardware/providers");
      const resProv = await fetch(provUrl);
      if (resProv.ok) {
        const data = await resProv.json();
        setAvailableProviders(data);
      }
    } catch {
      // ignore
    }
  }, [apiUrl]);

  useEffect(() => {
    fetchHardware();
    const interval = setInterval(fetchHardware, 3000);
    return () => clearInterval(interval);
  }, [fetchHardware]);

  return { telemetry, hardwareInfo, availableProviders, fetchHardware };
}
