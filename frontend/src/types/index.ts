export interface Toast {
  id: string;
  type: "success" | "error" | "info" | "warning";
  title: string;
  message?: string;
  exiting?: boolean;
}

export interface Job {
  id: string;
  type: string;
  status: "idle" | "processing" | "queued" | "completed" | "failed";
  progress: number;
  time?: string;
  source?: string;
  target?: string;
  outputUrl?: string;
  error_message?: string;
  step?: string;
  date_created?: string;
  date_updated?: string;
}

export interface Preset {
  name: string;
  faceSwapperWeight: number;
  faceMaskBlur: number;
  detectionThreshold: number;
  smoothing: number;
  faceSwapperModel: string;
  faceSwapperPixelBoost: string;
  faceEnhancerModel?: string;
  faceEnhancerBlend?: number;
  faceEnhancerWeight?: number;
  frameEnhancerModel?: string;
  frameEnhancerBlend?: number;
  // Extra processors
  faceEditorModel?: string;
  faceEditorMouthSmile?: number;
  ageModifierModel?: string;
  ageModifierDirection?: number;
  isCustom?: boolean;
}

export interface SourceItem {
  url: string;
  file_path: string;
  filename: string;
}

export interface DetectedFace {
  index: number;
  bounding_box: number[];
  gender: string;
  age: string;
  race: string;
  crop_url: string;
}

export interface HardwareDevice {
  name?: string;
  temperature?: number | { gpu?: { value?: number } };
  utilization?: number | { gpu?: { value?: number } };
  memory_used?: number;
  memory_total?: number;
  [key: string]: unknown;
}

export interface HardwareTelemetry {
  cpu: {
    usage_percent: number;
    cores?: number;
  };
  ram: {
    total_gb: number;
    used_gb: number;
    free_gb?: number;
    usage_percent: number;
  };
  gpu: {
    name: string;
    temperature_c?: number | null;
    usage_percent?: number | null;
    vram_total_gb: number;
    vram_used_gb: number;
    vram_free_gb?: number;
    vram_usage_percent: number;
  };
}

export interface SystemConfig {
  temp_path?: string;
  jobs_path?: string;
  log_level?: string;
  execution_providers?: string[];
  execution_thread_count?: number;
  video_memory_strategy?: string;
}

export interface FaceMapping {
  source_path: string;
  target_face_index: number;
  reference_frame_number: number;
}
