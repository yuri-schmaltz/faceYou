import { useState, useEffect, useCallback } from "react";
import { formatApiUrl } from "../utils/api";

export function useHardware(apiUrl: string) {
  const [hardwareInfo, setHardwareInfo] = useState<string>("Buscando informações de hardware...");
  const [availableProviders, setAvailableProviders] = useState<string[]>([]);

  const fetchHardware = useCallback(async () => {
    if (!apiUrl && apiUrl !== "") return;
    try {
      const devUrl = formatApiUrl(apiUrl, "/api/hardware/devices");
      const res = await fetch(devUrl);
      if (res.ok) {
        const data = await res.json();
        if (data && data.length > 0) {
          const device = data[0];
          let tempStr = "N/A";
          if (device.temperature) {
            if (typeof device.temperature === "object") {
              const gpuTemp = device.temperature.gpu?.value;
              if (gpuTemp !== undefined) {
                tempStr = `${gpuTemp}°C`;
              }
            } else {
              tempStr = `${device.temperature}°C`;
            }
          }
          const devName = device.name || "GPU";
          setHardwareInfo(`${devName} • Temp: ${tempStr}`);
        } else {
          const provUrl = formatApiUrl(apiUrl, "/api/hardware/providers");
          const resProv = await fetch(provUrl);
          if (resProv.ok) {
            const providers = await resProv.json();
            setHardwareInfo(providers.join(", "));
          }
        }
      }
    } catch {
      try {
        const provUrl = formatApiUrl(apiUrl, "/api/hardware/providers");
        const resProv = await fetch(provUrl);
        if (resProv.ok) {
          const providers = await resProv.json();
          setHardwareInfo(providers.join(", "));
        }
      } catch {
        setHardwareInfo("Hardware não detectado");
      }
    }

    try {
      const provUrl = formatApiUrl(apiUrl, "/api/hardware/providers");
      const res = await fetch(provUrl);
      if (res.ok) {
        const data = await res.json();
        setAvailableProviders(data);
      }
    } catch {
      // ignore
    }
  }, [apiUrl]);

  useEffect(() => {
    fetchHardware();
  }, [fetchHardware]);

  return { hardwareInfo, availableProviders, fetchHardware };
}
